/*
 * Independent quality audit for the formal and demo choice banks.
 *
 * The generator owns question creation. This script intentionally re-checks the
 * generated JSON so malformed local mutations cannot silently reach runtime.
 */

const fs = require('fs')
const path = require('path')
const { buildFormulaAtoms } = require('./practice-source/formula-atoms')

const ROOT = path.resolve(__dirname, '..')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')
const REPORT_PATH = path.join(ROOT, 'extract/build/practice-question-audit.json')

const QUESTION_TYPES = new Set(['reconstruct', 'blank', 'condition'])
const ERROR_KINDS = new Set([
  '符号错误',
  '系数错误',
  '次数错误',
  '分母或根号错误',
  '漏条件',
  '相似公式混淆'
])
const DEMO_QUESTION_COUNT = 30
const PROMPT_FORMS = new Set(['qa', 'completion'])
const RELATION_TOKENS = [
  '\\Longleftrightarrow',
  '\\Leftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\Leftarrow',
  '\\iff',
  '\\implies',
  '\\to',
  '\\mapsto',
  '\\notin',
  '\\subseteq',
  '\\subsetneq',
  '\\supseteq',
  '\\subset',
  '\\supset',
  '\\geqslant',
  '\\leqslant',
  '\\geq',
  '\\leq',
  '\\neq',
  '\\ge',
  '\\le',
  '\\in',
  '=',
  '<',
  '>'
].sort((left, right) => right.length - left.length)

const failures = []
const warnings = []

function fail(message) {
  failures.push(message)
}

function warn(message) {
  warnings.push(message)
}

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeOption(value) {
  return normalizeLatex(value)
    .replace(/\\displaystyle/g, '')
    .replace(/\s*\\quad\s*/g, '\\quad')
    .replace(/\s*\\qquad\s*/g, '\\qquad')
    .replace(/\s*([{}_^=+\-<>])\s*/g, '$1')
}

function obviousSemanticKey(value) {
  let source = normalizeOption(value)
    .replace(/\\left|\\right/g, '')
    .replace(/\\tfrac/g, '\\frac')
  if (/^[-+]?0(?:\.0+)?$/.test(source)) return '0'
  const fraction = source.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/)
  if (fraction) {
    if (fraction[1] === fraction[2]) return '1'
    if (/^\d+(?:\.\d+)?$/.test(fraction[1])
      && /^\d+(?:\.\d+)?$/.test(fraction[2])
      && Number(fraction[2]) !== 0) {
      return String(Number(fraction[1]) / Number(fraction[2]))
    }
  }
  return source
}

function findDegenerateFraction(value) {
  const source = normalizeOption(value)
  let match
  const braced = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g
  while ((match = braced.exec(source))) {
    const numerator = match[1].replace(/\s+/g, '')
    const denominator = match[2].replace(/\s+/g, '')
    if (/^[-+]?0(?:\.0+)?$/.test(denominator)) {
      return '分母为零'
    }
    if (numerator === denominator) {
      return '分子与分母相同'
    }
  }
  const simple = /\\frac\s*([A-Za-z0-9])\s*([A-Za-z0-9])/g
  while ((match = simple.exec(source))) {
    if (match[2] === '0') return '分母为零'
    if (match[1] === match[2]) return '分子与分母相同'
  }
  return ''
}

function isEscaped(source, index) {
  let slashCount = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    slashCount += 1
  }
  return slashCount % 2 === 1
}

function balancedDelimiters(latex) {
  const source = String(latex || '')
  let braces = 0
  let leftRight = 0
  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith('\\left', index) && !/[A-Za-z]/.test(source[index + 5] || '')) {
      leftRight += 1
      index += 4
      continue
    }
    if (source.startsWith('\\right', index) && !/[A-Za-z]/.test(source[index + 6] || '')) {
      leftRight -= 1
      if (leftRight < 0) return false
      index += 5
      continue
    }
    if (isEscaped(source, index)) continue
    if (source[index] === '{') braces += 1
    if (source[index] === '}') braces -= 1
    if (braces < 0) return false
  }
  return braces === 0 && leftRight === 0
}

function relationTokenAt(source, index) {
  return RELATION_TOKENS.find(token => {
    if (!source.startsWith(token, index)) return false
    if (!token.startsWith('\\')) return true
    return !/[A-Za-z]/.test(source[index + token.length] || '')
  }) || null
}

function hasTopLevelRelation(latex) {
  const source = String(latex || '')
  let braces = 0
  let parens = 0
  let brackets = 0
  for (let index = 0; index < source.length; index += 1) {
    if (!isEscaped(source, index)) {
      if (source[index] === '{') braces += 1
      else if (source[index] === '}') braces = Math.max(0, braces - 1)
      else if (source[index] === '(') parens += 1
      else if (source[index] === ')') parens = Math.max(0, parens - 1)
      else if (source[index] === '[') brackets += 1
      else if (source[index] === ']') brackets = Math.max(0, brackets - 1)
    }
    if (braces || parens || brackets) continue
    if (relationTokenAt(source, index)) return true
  }
  return false
}

function hasTopLevelSeparator(latex) {
  const source = String(latex || '')
  let braces = 0
  let parens = 0
  let brackets = 0
  let sizedDelimiters = 0

  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith('\\left', index) && !/[A-Za-z]/.test(source[index + 5] || '')) {
      sizedDelimiters += 1
      index += 4
      continue
    }
    if (source.startsWith('\\right', index) && !/[A-Za-z]/.test(source[index + 6] || '')) {
      sizedDelimiters = Math.max(0, sizedDelimiters - 1)
      index += 5
      continue
    }
    if (isEscaped(source, index)) continue
    if (source[index] === '{') braces += 1
    else if (source[index] === '}') braces = Math.max(0, braces - 1)
    else if (source[index] === '(') parens += 1
    else if (source[index] === ')') parens = Math.max(0, parens - 1)
    else if (source[index] === '[') brackets += 1
    else if (source[index] === ']') brackets = Math.max(0, brackets - 1)
    else if (!braces && !parens && !brackets && !sizedDelimiters) {
      if (source[index] === ',' || source[index] === ';') return true
    }
  }
  return false
}

function readBalancedGroup(latex, braceIndex) {
  if (latex[braceIndex] !== '{') return null
  let depth = 0
  for (let index = braceIndex; index < latex.length; index += 1) {
    if (isEscaped(latex, index)) continue
    if (latex[index] === '{') depth += 1
    if (latex[index] === '}') {
      depth -= 1
      if (depth === 0) {
        return {
          start: braceIndex,
          end: index + 1,
          content: latex.slice(braceIndex + 1, index)
        }
      }
    }
  }
  return null
}

function extractBoxedAnswers(stemLatex) {
  const source = String(stemLatex || '')
  const answers = []
  let cursor = 0
  while (cursor < source.length) {
    const index = source.indexOf('\\boxed', cursor)
    if (index < 0) break
    const argument = readBalancedGroup(source, index + '\\boxed'.length)
    if (!argument) {
      fail(`boxed 占位符缺少完整参数: ${source}`)
      break
    }
    const phantomIndex = argument.content.indexOf('\\phantom')
    const phantom = phantomIndex < 0
      ? null
      : readBalancedGroup(
        argument.content,
        phantomIndex + '\\phantom'.length
      )
    answers.push({
      content: argument.content,
      phantom: phantom ? phantom.content : ''
    })
    cursor = argument.end
  }
  return answers
}

function collectStrings(value, output) {
  if (typeof value === 'string') {
    output.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, output))
    return
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectStrings(item, output))
  }
}

function hasValidDelimiterCommand(value) {
  const source = String(value || '')
  const commandPattern = /\\(?:left|right)(?![A-Za-z])/g
  const commandDelimiters = new Set([
    '\\lbrace',
    '\\rbrace',
    '\\lbrack',
    '\\rbrack',
    '\\langle',
    '\\rangle',
    '\\lvert',
    '\\rvert',
    '\\lVert',
    '\\rVert',
    '\\vert',
    '\\Vert',
    '\\backslash',
    '\\uparrow',
    '\\downarrow',
    '\\updownarrow'
  ])
  let match

  while ((match = commandPattern.exec(source))) {
    let cursor = commandPattern.lastIndex
    while (/\s/.test(source[cursor] || '')) cursor += 1
    const character = source[cursor] || ''
    if ('()[]{}|./<>'.includes(character)) continue
    const command = source.slice(cursor).match(/^\\[A-Za-z]+/)?.[0]
    if (command && commandDelimiters.has(command)) continue
    return false
  }
  return true
}

function optionLengths(question) {
  return [
    question.answerLatex,
    ...question.distractors.map(item => item.latex)
  ].map(value => normalizeOption(value).length)
}

function checkMalformedLatex(question, values) {
  const patterns = [
    {
      pattern: /\\text\{\s*\}/,
      message: '含空 \\text{}'
    },
    {
      pattern: /\\(?:ln|sin|cos|tan|cot)_/,
      message: '把函数名错误地当作对数或三角函数记号加了底数'
    },
    {
      pattern: /\\frac(?:\{[^{}]+\}|[0-9])\{1\}(?![0-9])/,
      message: '出现无意义的“某式除以 1”'
    },
    {
      pattern: /\\frac\s*10(?![0-9])/,
      message: '出现非法的 \\frac10'
    },
    {
      pattern: /\\frac[0-9]{3,}/,
      message: '分数参数没有正确加花括号，可能粘连'
    },
    {
      pattern: /\\(?:sum|prod)(?:_\{[^{}]+\})?(?:\^\{?[^{}\s]+\}?)?\+1/,
      message: '求和或求积上限后粘连了 +1'
    },
  ]
  values.forEach(value => {
    const degenerateFraction = findDegenerateFraction(value)
    if (degenerateFraction) {
      fail(`${question.id}: ${degenerateFraction}: ${value}`)
    }
    patterns.forEach(({ pattern, message }) => {
      if (pattern.test(value)) fail(`${question.id}: ${message}: ${value}`)
    })
    if (!hasValidDelimiterCommand(value)) {
      fail(`${question.id}: 疑似损坏的 \\left/\\right 定界符: ${value}`)
    }
  })
}

function checkQuestion(
  question,
  formula,
  seenQuestionIds,
  seenFormalFormulaIds,
  seenFormalAtomIds
) {
  if (!question.id) fail('题目缺少 id')
  if (seenQuestionIds.has(question.id)) fail(`${question.id}: 题目 id 重复`)
  seenQuestionIds.add(question.id)

  if (!QUESTION_TYPES.has(question.type)) {
    fail(`${question.id}: 未知题型 ${question.type}`)
  }
  const isDemo = question.demo === true
  if (isDemo) {
    if (!new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id)) {
      fail(`${question.id}: 示范题 id 格式无效`)
    }
  } else {
    if (!new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id)) {
      fail(`${question.id}: 正式题 id 格式无效`)
    }
    seenFormalFormulaIds.add(question.sourceId)
    if (seenFormalAtomIds.has(question.atomId)) {
      fail(`${question.id}: 公式原子 ${question.atomId} 被重复覆盖`)
    }
    seenFormalAtomIds.add(question.atomId)
  }
  if (!normalizeLatex(question.atomId)) {
    fail(`${question.id}: 缺少 atomId`)
  } else if (!question.atomId.startsWith(`${question.sourceId}-atom-`)) {
    fail(`${question.id}: atomId 不属于来源公式 ${question.sourceId}`)
  }
  if (!PROMPT_FORMS.has(question.promptForm)) {
    fail(`${question.id}: promptForm 无效`)
  }
  if (!formula) {
    fail(`${question.id}: sourceId ${question.sourceId} 不存在`)
    return
  }
  if (question.chapter !== formula.chapter) {
    fail(`${question.id}: 章节与公式主数据不一致`)
  }
  if (question.title !== formula.name) {
    fail(`${question.id}: 题目标题与公式名不一致`)
  }

  const stem = normalizeLatex(question.stemLatex)
  const answer = normalizeLatex(question.answerLatex)
  if (!stem) fail(`${question.id}: 题干为空`)
  if (!answer) fail(`${question.id}: 正确答案为空`)
  if (!balancedDelimiters(stem)) fail(`${question.id}: 题干括号不平衡`)
  if (!balancedDelimiters(answer)) fail(`${question.id}: 正确答案括号不平衡`)

  if (!Array.isArray(question.distractors) || question.distractors.length !== 3) {
    fail(`${question.id}: 必须正好三个错误选项`)
    return
  }
  const options = [answer, ...question.distractors.map(item => item.latex)]
  const normalizedOptions = options.map(normalizeOption)
  const semanticOptions = options.map(obviousSemanticKey)
  if (normalizedOptions.some(value => !value)) {
    fail(`${question.id}: 存在空选项`)
  }
  if (new Set(normalizedOptions).size !== 4) {
    fail(`${question.id}: 四个选项不是唯一 LaTeX`)
  }
  if (new Set(semanticOptions).size !== 4) {
    fail(`${question.id}: 四个选项存在明显等值项`)
  }

  question.distractors.forEach((distractor, index) => {
    const label = `${question.id} 错项 ${index + 1}`
    if (!ERROR_KINDS.has(distractor.errorKind)) {
      fail(`${label}: 错误类型不在六类中`)
    }
    if (!normalizeLatex(distractor.error)) {
      fail(`${label}: 缺少错误说明`)
    }
    if (!balancedDelimiters(distractor.latex)) {
      fail(`${label}: LaTeX 括号不平衡`)
    }
    if (normalizeOption(distractor.latex) === normalizeOption(answer)) {
      fail(`${label}: 与正确项重复`)
    }
  })

  const lengths = optionLengths(question)
  const shortest = Math.min(...lengths)
  const longest = Math.max(...lengths)
  if (shortest >= 4 && longest > Math.max(shortest * 1.9, shortest + 48)) {
    fail(`${question.id}: 选项长度差距过大 (${lengths.join(', ')})`)
  }
  if (shortest >= 12 && longest > shortest * 1.55) {
    warn(`${question.id}: 选项长度仍偏不均衡 (${lengths.join(', ')})`)
  }

  if (question.type === 'blank') {
    const boxes = extractBoxedAnswers(stem)
    if (boxes.length !== 1) {
      fail(`${question.id}: 核心块挖空必须有且只有一个 \\boxed，实际 ${boxes.length}`)
    } else {
      if (normalizeOption(boxes[0].phantom) !== normalizeOption(answer)) {
        fail(`${question.id}: 挖空 phantom 与正确答案不一致`)
      }
      if (/\\(?:Rightarrow|Leftrightarrow|iff|implies)\b/.test(boxes[0].content)) {
        fail(`${question.id}: 挖空吞掉了逻辑关系符`)
      }
      if (hasTopLevelSeparator(boxes[0].content) && boxes[0].content.length > 45) {
        fail(`${question.id}: 挖空超过一个核心块，吞掉了逗号或分号分隔内容`)
      }
    }
  }
  if (question.type === 'reconstruct') {
    if (!hasTopLevelRelation(stem)) {
      fail(`${question.id}: 整式重建题干末尾没有关系符`)
    }
  }
  if (question.type !== 'blank' && stem.includes('\\boxed')) {
    fail(`${question.id}: 非挖空题却含 \\boxed`)
  }

  const allValues = [stem, answer, ...question.distractors.map(item => item.latex)]
  checkMalformedLatex(question, allValues)

  question.distractors.forEach((distractor, index) => {
    if (/\\(?:neq|ne)\b/.test(distractor.latex) && !/\\(?:neq|ne)\b/.test(answer)) {
      warn(`${question.id} 错项 ${index + 1}: 使用了“不等于”式假错项，需人工复核`)
    }
  })
}

function main() {
  const formulaSource = JSON.parse(fs.readFileSync(FORMULAS_PATH, 'utf8'))
  const questionSource = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
  if (!Array.isArray(formulaSource.items) || !Array.isArray(questionSource.items)) {
    throw new Error('公式库或题库缺少 items 数组')
  }

  const formulaMap = new Map(formulaSource.items.map(item => [item.id, item]))
  const seenQuestionIds = new Set()
  const seenFormalFormulaIds = new Set()
  const seenFormalAtomIds = new Set()
  const questionById = new Map()

  const baseQuestions = questionSource.items.filter(item => item.demo !== true)
  const demoQuestions = questionSource.items.filter(item => item.demo === true)
  if (demoQuestions.length !== DEMO_QUESTION_COUNT) {
    fail(`示范题应为 ${DEMO_QUESTION_COUNT} 道，实际 ${demoQuestions.length} 道`)
  }
  questionSource.items.forEach(question => {
    questionById.set(question.id, question)
    checkQuestion(
      question,
      formulaMap.get(question.sourceId),
      seenQuestionIds,
      seenFormalFormulaIds,
      seenFormalAtomIds
    )
  })

  formulaSource.items.forEach(formula => {
    if (!seenFormalFormulaIds.has(formula.id)) {
      fail(`公式 ${formula.id} 没有选择题覆盖`)
    }
  })
  const expectedAtoms = formulaSource.items.flatMap(formula => (
    buildFormulaAtoms(formula)
  ))
  const expectedAtomIds = new Set(expectedAtoms.map(atom => atom.atomId))
  const missingAtomIds = expectedAtoms
    .map(atom => atom.atomId)
    .filter(atomId => !seenFormalAtomIds.has(atomId))
  const unknownAtomIds = [...seenFormalAtomIds]
    .filter(atomId => !expectedAtomIds.has(atomId))
  if (missingAtomIds.length) {
    fail(`还有 ${missingAtomIds.length} 个公式原子未被选择题覆盖`)
  }
  if (unknownAtomIds.length) {
    fail(`有 ${unknownAtomIds.length} 个题目的 atomId 不在公式原子中`)
  }
  questionById.forEach(question => {
    if (!question.variantOf) return
    const target = questionById.get(question.variantOf)
    if (!target) {
      fail(`${question.id}: variantOf 指向不存在的题目`)
      return
    }
    if (target.sourceId !== question.sourceId
      || target.atomId !== question.atomId
      || target.promptForm === question.promptForm) {
      fail(`${question.id}: variantOf 应指向同一公式原子的另一种形式`)
    }
  })

  const typeCounts = {}
  const authoringCounts = {}
  const errorKindCounts = {}
  questionSource.items.forEach(question => {
    typeCounts[question.type] = (typeCounts[question.type] || 0) + 1
    authoringCounts[question.authoring] =
      (authoringCounts[question.authoring] || 0) + 1
    question.distractors.forEach(distractor => {
      errorKindCounts[distractor.errorKind] =
        (errorKindCounts[distractor.errorKind] || 0) + 1
    })
  })

  const report = {
    generatedAt: new Date().toISOString(),
    formulas: formulaSource.items.length,
    questions: questionSource.items.length,
    baseQuestionCount: baseQuestions.length,
    formalQuestionCount: baseQuestions.length,
    demoQuestionCount: demoQuestions.length,
    coveredFormulaIds: seenFormalFormulaIds.size,
    atomCount: expectedAtoms.length,
    coveredAtomCount: seenFormalAtomIds.size,
    missingAtomIds,
    typeCounts,
    authoringCounts,
    errorKindCounts,
    failureCount: failures.length,
    warningCount: warnings.length,
    failures,
    warnings
  }
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exitCode = 1
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
