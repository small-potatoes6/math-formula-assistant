/*
 * Build exactly one four-choice question for every formula.
 *
 * Quality rule: an automatic distractor must be a local change to the
 * correct expression (sign, coefficient, exponent, fraction/root, omitted
 * condition, or a similar-symbol swap). Whole-expression wrappers such as
 * \sqrt{...}, -(...), (...)+1, and 1/(...) are intentionally not generated.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const SEEDS_PATH = path.join(ROOT, 'extract/practice-source/choice-seeds.json')
const MANUAL_PATH = path.join(ROOT, 'extract/practice-source/manual-choice-overrides.js')
const SPECIAL_PATH = path.join(ROOT, 'extract/practice-source/special-choice-overrides.js')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')
const REPORT_PATH = path.join(ROOT, 'extract/build/practice-generation-report.json')

const QUESTION_TYPES = new Set(['reconstruct', 'blank', 'condition'])
const ERROR_KINDS = [
  '符号错误',
  '系数错误',
  '次数错误',
  '分母或根号错误',
  '漏条件',
  '相似公式混淆'
]
const ERROR_KIND_SET = new Set(ERROR_KINDS)
const EXTRA_ALLOWED_COMMANDS = new Set([
  '\\boxed',
  '\\phantom',
  '\\Leftarrow',
  '\\leftarrow'
])
let ALLOWED_LATEX_COMMANDS = null

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

const LOGICAL_RELATIONS = new Set([
  '\\Longleftrightarrow',
  '\\Leftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\Leftarrow',
  '\\iff',
  '\\implies',
  '\\to',
  '\\mapsto'
])

const MEMBERSHIP_RELATIONS = new Set([
  '\\notin',
  '\\subseteq',
  '\\subsetneq',
  '\\supseteq',
  '\\subset',
  '\\supset',
  '\\in'
])

const TEXT_OPPOSITES = [
  ['递增', '递减', '把递增与递减写反了'],
  ['极大', '极小', '把极大与极小写反了'],
  ['最大', '最小', '把最大与最小写反了'],
  ['相切', '相交', '把相切与相交混淆了'],
  ['充分', '必要', '把充分条件与必要条件混淆了'],
  ['有理数', '无理数', '把有理数与无理数混淆了'],
  ['正整数', '整数', '把正整数集与整数集混淆了'],
  ['同增异减', '同减异增', '把复合函数“同增异减”的规律写反了'],
  ['同增异减', '同增同减', '把“异减”误写成了“同减”'],
  ['同增异减', '同减异减', '把内层函数的单调性写反了'],
  ['非空', '空', '把非空集合与空集混淆了'],
  ['不共线', '共线', '漏掉了“不共线”这个条件'],
  ['增', '减', '把增与减写反了'],
  ['正', '负', '把正与负写反了'],
  ['奇', '偶', '把奇函数与偶函数混淆了'],
  ['内', '外', '把内部与外部混淆了'],
  ['开', '闭', '把开区间与闭区间混淆了'],
  ['上', '下', '把上下方向写反了'],
  ['左', '右', '把左右方向写反了'],
  ['大', '小', '把大小关系写反了'],
  ['锐', '钝', '把锐角与钝角混淆了']
]

const SIMILAR_COMMAND_PAIRS = [
  ['\\sin', '\\cos', '把正弦与余弦混淆了'],
  ['\\cos', '\\sin', '把余弦与正弦混淆了'],
  ['\\tan', '\\cot', '把正切与余切混淆了'],
  ['\\cot', '\\tan', '把余切与正切混淆了'],
  ['\\cap', '\\cup', '把交集与并集混淆了'],
  ['\\cup', '\\cap', '把并集与交集混淆了'],
  ['\\parallel', '\\perp', '把平行与垂直混淆了'],
  ['\\perp', '\\parallel', '把垂直与平行混淆了'],
  ['\\subset', '\\supset', '把包含关系方向写反了'],
  ['\\supset', '\\subset', '把包含关系方向写反了'],
  ['\\forall', '\\exists', '把全称量词与存在量词混淆了'],
  ['\\exists', '\\forall', '把存在量词与全称量词混淆了'],
  ['\\max', '\\min', '把最大值与最小值混淆了'],
  ['\\min', '\\max', '把最小值与最大值混淆了'],
  ['\\log', '\\ln', '把常用对数与自然对数混淆了'],
  ['\\ln', '\\log', '把自然对数与常用对数混淆了']
]

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeOptionLatex(value) {
  return normalizeLatex(value)
    .replace(/\\displaystyle/g, '')
    .replace(/\s*\\quad\s*/g, '\\quad')
    .replace(/\s*\\qquad\s*/g, '\\qquad')
    .replace(/\s*([{}_^=+\-<>])\s*/g, '$1')
}

function isEscaped(source, index) {
  let slashCount = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    slashCount += 1
  }
  return slashCount % 2 === 1
}

function commandTokenAt(source, index) {
  if (source[index] !== '\\') return null
  let end = index + 1
  if (end >= source.length) return null
  if (!/[A-Za-z]/.test(source[end])) {
    return source.slice(index, end + 1)
  }
  while (end < source.length && /[A-Za-z]/.test(source[end])) end += 1
  return source.slice(index, end)
}

function relationTokenAt(source, index) {
  return RELATION_TOKENS.find(token => {
    if (!source.startsWith(token, index)) return false
    if (!token.startsWith('\\')) return true
    return !/[A-Za-z]/.test(source[index + token.length] || '')
  }) || null
}

function addRange(ranges, start, end) {
  if (start >= 0 && end > start) ranges.push({ start, end })
}

function inRanges(index, ranges) {
  return ranges.some(range => index >= range.start && index < range.end)
}

function collectProtectedRanges(latex) {
  const source = String(latex || '')
  const ranges = []
  const commandArgumentPattern =
    /\\(?:text|mathrm|operatorname|mathbf|mathbb|mathcal|vec|overrightarrow|hat|bar|overline|underline|boxed|phantom)\b/g
  let match
  while ((match = commandArgumentPattern.exec(source))) {
    const group = readLatexArgument(source, match.index + match[0].length)
    if (group) {
      addRange(ranges, group.start, group.end)
      commandArgumentPattern.lastIndex = group.end
    }
  }

  for (let index = 0; index < source.length; index += 1) {
    if ((source[index] !== '^' && source[index] !== '_') || isEscaped(source, index)) {
      continue
    }
    const argument = readLatexArgument(source, index + 1)
    if (!argument) continue
    addRange(ranges, argument.start, argument.end)
    index = argument.end - 1
  }
  return ranges
}

function collectIndexedOperatorRanges(latex) {
  const source = String(latex || '')
  const ranges = []
  const operatorPattern = /\\(?:sum|prod|int)\b/g
  let match
  while ((match = operatorPattern.exec(source))) {
    let cursor = match.index + match[0].length
    for (let argumentIndex = 0; argumentIndex < 2; argumentIndex += 1) {
      cursor = skipSpaces(source, cursor)
      if (source[cursor] !== '_' && source[cursor] !== '^') break
      const argument = readLatexArgument(source, cursor + 1)
      if (!argument) break
      addRange(ranges, cursor, argument.end)
      cursor = argument.end
    }
  }
  return ranges
}

function findAllLatexCommands(latex) {
  return String(latex || '').match(/\\[A-Za-z]+/g) || []
}

function balancedDelimiters(latex) {
  const source = String(latex || '')
  let braceDepth = 0
  let sizedDelimiterDepth = 0
  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith('\\left', index) && !/[A-Za-z]/.test(source[index + 5] || '')) {
      sizedDelimiterDepth += 1
      index += 4
      continue
    }
    if (source.startsWith('\\right', index) && !/[A-Za-z]/.test(source[index + 6] || '')) {
      sizedDelimiterDepth -= 1
      if (sizedDelimiterDepth < 0) return false
      index += 5
      continue
    }
    if (isEscaped(source, index)) continue
    if (source[index] === '{') braceDepth += 1
    if (source[index] === '}') braceDepth -= 1
    if (braceDepth < 0) return false
  }
  return braceDepth === 0 && sizedDelimiterDepth === 0
}

function countBy(items, selector) {
  const result = {}
  items.forEach(item => {
    const value = typeof selector === 'function' ? selector(item) : item[selector]
    result[value] = (result[value] || 0) + 1
  })
  return result
}

function unique(values) {
  return [...new Set(values)]
}

function splitTopLevel(latex, separators) {
  const source = String(latex || '')
  const ordered = separators.slice().sort((left, right) => right.length - left.length)
  const output = []
  let start = 0
  let braceDepth = 0
  let parenDepth = 0
  let bracketDepth = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (!isEscaped(source, index)) {
      if (character === '{') {
        braceDepth += 1
        continue
      }
      if (character === '}') {
        braceDepth = Math.max(0, braceDepth - 1)
        continue
      }
      if (character === '(') {
        parenDepth += 1
        continue
      }
      if (character === ')') {
        parenDepth = Math.max(0, parenDepth - 1)
        continue
      }
      if (character === '[') {
        bracketDepth += 1
        continue
      }
      if (character === ']') {
        bracketDepth = Math.max(0, bracketDepth - 1)
        continue
      }
    }

    if (braceDepth !== 0 || parenDepth !== 0 || bracketDepth !== 0) continue
    const matched = ordered.find(separator => source.startsWith(separator, index))
    if (!matched) continue
    output.push(source.slice(start, index).trim())
    start = index + matched.length
    index += matched.length - 1
  }

  output.push(source.slice(start).trim())
  return output.filter(Boolean)
}

function findAllTopLevelRelations(latex) {
  const source = String(latex || '')
  const output = []
  let braceDepth = 0
  let parenDepth = 0
  let bracketDepth = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (!isEscaped(source, index)) {
      if (character === '{') {
        braceDepth += 1
        continue
      }
      if (character === '}') {
        braceDepth = Math.max(0, braceDepth - 1)
        continue
      }
      if (character === '(') {
        parenDepth += 1
        continue
      }
      if (character === ')') {
        parenDepth = Math.max(0, parenDepth - 1)
        continue
      }
      if (character === '[') {
        bracketDepth += 1
        continue
      }
      if (character === ']') {
        bracketDepth = Math.max(0, bracketDepth - 1)
        continue
      }
    }
    if (braceDepth !== 0 || parenDepth !== 0 || bracketDepth !== 0) continue

    const token = relationTokenAt(source, index)
    if (!token) continue
    output.push({ index, token })
    index += token.length - 1
  }
  return output
}

function trimStatementEdges(latex) {
  return normalizeLatex(latex)
    .replace(/^[\s,;]+/, '')
    .replace(/[\s,;]+$/, '')
}

function makeRelationCandidates(latex) {
  const source = trimStatementEdges(latex)
  const candidates = []
  findAllTopLevelRelations(source).forEach(relation => {
    const lhs = trimStatementEdges(source.slice(0, relation.index))
    const rhs = trimStatementEdges(
      source.slice(relation.index + relation.token.length)
    )
    if (!lhs || !rhs) return
    if (!balancedDelimiters(lhs) || !balancedDelimiters(rhs)) return
    candidates.push({
      lhs,
      rhs,
      operator: relation.token,
      relationIndex: relation.index,
      rhsRelationCount: findAllTopLevelRelations(rhs).length
    })
  })
  return candidates
}

function buildSplitCandidates(latex) {
  const candidates = []
  const seen = new Set()
  const clauses = splitTopLevel(latex, [';', '\\qquad', '\\quad'])
  const expanded = []

  clauses.forEach(clause => {
    expanded.push(clause)
    if (findAllTopLevelRelations(clause).length > 1) {
      splitTopLevel(clause, [',']).forEach(part => expanded.push(part))
    }
  })

  expanded.forEach((clause, clauseIndex) => {
    makeRelationCandidates(clause).forEach(candidate => {
      const key = `${candidate.lhs}\u0000${candidate.operator}\u0000${candidate.rhs}`
      if (seen.has(key)) return
      seen.add(key)
      candidates.push({ ...candidate, clauseIndex })
    })
  })
  return candidates
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

function readBracketGroup(latex, bracketIndex) {
  if (latex[bracketIndex] !== '[') return null
  let depth = 0
  for (let index = bracketIndex; index < latex.length; index += 1) {
    if (isEscaped(latex, index)) continue
    if (latex[index] === '[') depth += 1
    if (latex[index] === ']') {
      depth -= 1
      if (depth === 0) {
        return {
          start: bracketIndex,
          end: index + 1,
          content: latex.slice(bracketIndex + 1, index)
        }
      }
    }
  }
  return null
}

function skipSpaces(latex, index) {
  let cursor = index
  while (cursor < latex.length && /\s/.test(latex[cursor])) cursor += 1
  return cursor
}

function readLatexArgument(latex, argumentIndex) {
  const start = skipSpaces(latex, argumentIndex)
  if (start >= latex.length) return null
  if (latex[start] === '{') {
    const group = readBalancedGroup(latex, start)
    if (!group) return null
    return { start, end: group.end, content: group.content }
  }
  if (latex[start] === '\\') {
    let end = start + 1
    if (/[A-Za-z]/.test(latex[end] || '')) {
      while (/[A-Za-z]/.test(latex[end] || '')) end += 1
    } else {
      end += 1
    }
    return {
      start,
      end,
      content: latex.slice(start, end)
    }
  }
  return {
    start,
    end: start + 1,
    content: latex.slice(start, start + 1)
  }
}

function findCommandSpans(latex, command) {
  const source = String(latex || '')
  const spans = []
  let cursor = 0
  while (cursor < source.length) {
    const index = source.indexOf(command, cursor)
    if (index < 0) break
    let next = index + command.length
    let optional = null
    if (command === '\\sqrt') {
      const bracketIndex = skipSpaces(source, next)
      if (source[bracketIndex] === '[') {
        optional = readBracketGroup(source, bracketIndex)
        if (optional) next = optional.end
      }
    }
    const first = readLatexArgument(source, next)
    if (!first) {
      cursor = index + command.length
      continue
    }
    if (command === '\\frac') {
      const second = readLatexArgument(source, first.end)
      if (!second) {
        cursor = first.end
        continue
      }
      spans.push({
        command,
        start: index,
        end: second.end,
        first,
        second,
        optional,
        content: source.slice(index, second.end)
      })
      cursor = second.end
      continue
    }
    spans.push({
      command,
      start: index,
      end: first.end,
      first,
      second: null,
      optional,
      content: source.slice(index, first.end)
    })
    cursor = first.end
  }
  return spans
}

function replaceRange(source, start, end, replacement) {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`
}

function replaceLatexArgument(source, argument, replacement) {
  if (!argument) return source
  const braces = source[argument.start] === '{'
  const start = braces ? argument.start + 1 : argument.start
  const end = braces ? argument.end - 1 : argument.end
  const needsGroup = !braces && /[+\-]/.test(replacement)
  return replaceRange(
    source,
    start,
    end,
    needsGroup ? `{${replacement}}` : replacement
  )
}

function commandBoundaryReplaceOnce(source, from, to) {
  let cursor = 0
  while (cursor < source.length) {
    const index = source.indexOf(from, cursor)
    if (index < 0) return null
    const before = source[index - 1] || ''
    const after = source[index + from.length] || ''
    const validBefore = !/[A-Za-z]/.test(before)
    const validAfter = from.startsWith('\\')
      ? !/[A-Za-z]/.test(after)
      : true
    if (validBefore && validAfter) {
      return `${source.slice(0, index)}${to}${source.slice(index + from.length)}`
    }
    cursor = index + from.length
  }
  return null
}

function appendControlWordSafely(source, command, nextText) {
  const next = nextText[0] || ''
  return `${source}${command}${/[A-Za-z]/.test(next) ? ' ' : ''}${nextText}`
}

function candidateLengthAllowed(correct, candidate) {
  const correctLength = normalizeOptionLatex(correct).length
  const candidateLength = normalizeOptionLatex(candidate).length
  if (!candidateLength) return false
  if (correctLength <= 4) return candidateLength <= 18
  return (
    candidateLength >= Math.floor(correctLength * 0.52)
    && candidateLength <= Math.ceil(correctLength * 1.65) + 8
  )
}

function addMutation(output, seen, correct, latex, errorKind, error) {
  const normalized = normalizeLatex(latex)
  const correctNormalized = normalizeLatex(correct)
  const key = normalizeOptionLatex(normalized)
  if (
    !normalized
    || !key
    || key === normalizeOptionLatex(correctNormalized)
    || seen.has(key)
    || !balancedDelimiters(normalized)
    || hasInvalidMutationLatex(normalized)
    || /\\(?:neq|not\s*=|ne)\b/.test(normalized)
    || !candidateLengthAllowed(correctNormalized, normalized)
    || !ERROR_KIND_SET.has(errorKind)
    || !String(error || '').trim()
  ) {
    return
  }
  seen.add(key)
  output.push({
    latex: normalized,
    errorKind,
    error: String(error).trim()
  })
}

function hasInvalidMutationLatex(latex) {
  const source = String(latex || '')
  if (/\\(?:ln|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan)_/.test(source)) {
    return true
  }
  if (/\\(?:sum|prod)(?:_\{[^{}]+\})?(?:\^\{?[^{}\s]+\}?)\s*\+1/.test(source)) {
    return true
  }
  for (const span of findCommandSpans(source, '\\frac')) {
    const denominator = normalizeLatex(span.second.content)
    if (!denominator || /^0+(?:\.0+)?$/.test(denominator)) return true
    const next = source[span.second.end] || ''
    if (source[span.second.start] !== '{' && /[0-9]/.test(next)) return true
  }
  return false
}

function collectSignMutations(correct, output, seen) {
  const source = String(correct || '')
  const protectedRanges = collectProtectedRanges(source)
  const operatorRanges = collectIndexedOperatorRanges(source)
  const indexes = []
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if ((character !== '+' && character !== '-') || isEscaped(source, index)) continue
    if (inRanges(index, protectedRanges)) continue
    if (inRanges(index, operatorRanges)) continue
    const previous = source[index - 1] || ''
    if (character === '+' && /[([{,=]/u.test(previous)) continue
    indexes.push(index)
  }
  indexes.slice(0, 8).forEach(index => {
    const replacement = source[index] === '+' ? '-' : '+'
    addMutation(
      output,
      seen,
      correct,
      `${source.slice(0, index)}${replacement}${source.slice(index + 1)}`,
      '符号错误',
      '有一处正负号写反了'
    )
  })
}

function collectPmMutations(correct, output, seen) {
  ;[
    ['\\pm', '\\mp', '± 与 ∓ 没有按公式规则联动'],
    ['\\mp', '\\pm', '∓ 与 ± 没有按公式规则联动']
  ].forEach(([from, to, error]) => {
    const candidate = commandBoundaryReplaceOnce(correct, from, to)
    if (candidate) {
      addMutation(output, seen, correct, candidate, '符号错误', error)
    }
  })
}

function collectRelationMutations(correct, output, seen) {
  const replacements = [
    ['\\leqslant', '\\geqslant', '不等号方向写反了'],
    ['\\geqslant', '\\leqslant', '不等号方向写反了'],
    ['\\leq', '\\geq', '不等号方向写反了'],
    ['\\geq', '\\leq', '不等号方向写反了'],
    ['\\le', '\\ge', '不等号方向写反了'],
    ['\\ge', '\\le', '不等号方向写反了'],
    ['\\neq', '=', '把不等于误写成了等于'],
    ['\\Rightarrow', '\\Leftarrow', '推出方向写反了'],
    ['\\Leftarrow', '\\Rightarrow', '推出方向写反了'],
    ['\\Leftrightarrow', '\\Leftarrow', '等价关系与单向推出混淆了'],
    ['\\to', '\\leftarrow', '对应或变换方向写反了'],
    ['\\subsetneq', '\\supseteq', '把真包含关系方向写反了'],
    ['\\subseteq', '\\supseteq', '把包含关系方向写反了'],
    ['\\supseteq', '\\subseteq', '把包含关系方向写反了'],
    ['\\subset', '\\supset', '把包含关系方向写反了'],
    ['\\supset', '\\subset', '把包含关系方向写反了'],
    ['\\notin', '\\in', '把不属于误写成了属于'],
    ['\\in', '\\notin', '把属于误写成了不属于']
  ]
  replacements.forEach(([from, to, error]) => {
    const candidate = commandBoundaryReplaceOnce(correct, from, to)
    if (candidate) {
      addMutation(output, seen, correct, candidate, '符号错误', error)
    }
  })

  const relation = findAllTopLevelRelations(correct)[0]
  if (relation && (relation.token === '<' || relation.token === '>')) {
    const replacement = relation.token === '<' ? '>' : '<'
    const candidate =
      `${correct.slice(0, relation.index)}${replacement}` +
      correct.slice(relation.index + 1)
    addMutation(output, seen, correct, candidate, '符号错误', '不等号方向写反了')
  }
}

function collectCoefficientMutations(correct, output, seen) {
  const source = String(correct || '')
  const protectedRanges = collectProtectedRanges(source)
  const operatorRanges = collectIndexedOperatorRanges(source)
  const fractionRanges = findCommandSpans(source, '\\frac').flatMap(span => [
    { start: span.first.start, end: span.first.end },
    { start: span.second.start, end: span.second.end }
  ])
  const pattern = /\d+(?:\.\d+)?/g
  let match
  let count = 0
  while ((match = pattern.exec(source)) && count < 10) {
    const index = match.index
    if (
      inRanges(index, protectedRanges)
      || inRanges(index, operatorRanges)
      || inRanges(index, fractionRanges)
    ) {
      count += 1
      continue
    }
    const previous = source[index - 1] || ''
    const next = source[index + match[0].length] || ''
    if (
      previous === '^'
      || previous === '_'
      || next === '^'
      || next === '_'
      || /[0-9.]/.test(previous)
    ) {
      continue
    }
    const token = match[0]
    const replacements = []
    if (token === '0') replacements.push(['1', '常数 0 误写成了 1'])
    else if (token === '1') replacements.push(['2', '系数 1 误写成了 2'])
    else if (token === '2') replacements.push(['3', '系数 2 误写成了 3'])
    else if (token === '3') replacements.push(['2', '系数 3 误写成了 2'])
    else if (token === '4') replacements.push(['2', '系数 4 误写成了 2'])
    else if (token === '5') replacements.push(['2', '系数 5 误写成了 2'])
    else if (token === '6') replacements.push(['2', '系数 6 误写成了 2'])
    else if (token === '8') replacements.push(['2', '系数 8 误写成了 2'])
    else if (token === '10') replacements.push(['12', '系数 10 误写成了 12'])
    else if (token === '12') replacements.push(['10', '系数 12 误写成了 10'])
    else if (token === '180') replacements.push(['360', '角度制换算系数误用了 360'])
    else if (token === '360') replacements.push(['180', '角度制换算系数误用了 180'])
    else if (token === '0.6827') replacements.push(['0.9545', '误用了 2σ 对应的概率'])
    else if (token === '0.9545') replacements.push(['0.9973', '误用了 3σ 对应的概率'])
    else if (token === '0.9973') replacements.push(['0.9545', '误用了 2σ 对应的概率'])
    replacements.forEach(([replacement, error]) => {
      const candidate =
        `${source.slice(0, index)}${replacement}` +
        source.slice(index + token.length)
      addMutation(output, seen, correct, candidate, '系数错误', error)
    })
    count += 1
  }
}

function collectExponentMutations(correct, output, seen) {
  const source = String(correct || '')
  const operatorRanges = collectIndexedOperatorRanges(source)
  let cursor = 0
  let count = 0
  while (cursor < source.length && count < 8) {
    const index = source.indexOf('^', cursor)
    if (index < 0) break
    if (isEscaped(source, index)) {
      cursor = index + 1
      continue
    }
    const argument = readLatexArgument(source, index + 1)
    if (!argument) break
    if (inRanges(index, operatorRanges) || inRanges(argument.start, operatorRanges)) {
      cursor = argument.end
      continue
    }
    const content = argument.content
    const replacements = []
    if (content === '2') replacements.push(['3', '平方误写成了立方'])
    else if (content === '3') replacements.push(['2', '立方误写成了平方'])
    else if (content === 'n') replacements.push(['n+1', '指数 n 误写成了 n+1'])
    else if (content === 'n+1') replacements.push(['n', '指数 n+1 误写成了 n'])
    else if (content === 'n-1') replacements.push(['n', '指数 n-1 误写成了 n'])
    else if (content === 'n-2') replacements.push(['n-1', '指数 n-2 误写成了 n-1'])
    else if (content === 'm+n') replacements.push(['m-n', '指数中的加减号写反了'])
    else if (content === 'm-n') replacements.push(['m+n', '指数中的加减号写反了'])
    replacements.forEach(([replacement, error]) => {
      const candidate = replaceLatexArgument(source, argument, replacement)
      addMutation(output, seen, correct, candidate, '次数错误', error)
    })
    cursor = argument.end
    count += 1
  }
}

function collectFractionAndRootMutations(correct, output, seen) {
  findCommandSpans(correct, '\\frac').slice(0, 3).forEach(span => {
    let candidate = null
    let error = '分数的分子和分母写反了'
    if (span.first.content === '1') {
      candidate = replaceLatexArgument(correct, span.first, '2')
      error = '分数的分子系数写错了'
    } else if (span.second.content === '1') {
      candidate = replaceLatexArgument(correct, span.second, '2')
      error = '分数的分母系数写错了'
    } else {
      candidate = replaceRange(
        correct,
        span.start,
        span.end,
        `\\frac{${span.second.content}}{${span.first.content}}`
      )
    }
    addMutation(
      output,
      seen,
      correct,
      candidate,
      '分母或根号错误',
      error
    )
  })

  findCommandSpans(correct, '\\sqrt').slice(0, 3).forEach(span => {
    addMutation(
      output,
      seen,
      correct,
      replaceRange(correct, span.start, span.end, span.first.content),
      '分母或根号错误',
      '漏掉了根号'
    )
    if (span.optional && span.optional.content) {
      const index = span.optional.content
      const replacement = index === '3' ? '2' : index === '2' ? '3' : null
      if (replacement) {
        addMutation(
          output,
          seen,
          correct,
          replaceRange(
            correct,
            span.optional.start + 1,
            span.optional.end - 1,
            replacement
          ),
          '分母或根号错误',
          '根指数写错了'
        )
      }
    }
  })
}

function collectSimilarMutations(correct, output, seen) {
  SIMILAR_COMMAND_PAIRS.forEach(([from, to, error]) => {
    const candidate = commandBoundaryReplaceOnce(correct, from, to)
    if (candidate) {
      addMutation(output, seen, correct, candidate, '相似公式混淆', error)
    }
  })
  TEXT_OPPOSITES.forEach(([from, to, error]) => {
    const index = correct.indexOf(from)
    if (index < 0) return
    const candidate =
      `${correct.slice(0, index)}${to}` +
      correct.slice(index + from.length)
    addMutation(output, seen, correct, candidate, '相似公式混淆', error)
  })
}

function collectConditionMutations(correct, output, seen) {
  const source = String(correct || '')
  if (source.length > 150) return
  const logicalMarker = findAllTopLevelRelations(source).find(
    relation => LOGICAL_RELATIONS.has(relation.token)
  )
  if (!logicalMarker || logicalMarker.index <= 0) return
  const prefix = trimStatementEdges(source.slice(0, logicalMarker.index))
  if (!prefix || prefix.length > 105) return
  const suffix = source.slice(logicalMarker.index)
  const parts = splitTopLevel(prefix, [',', ';'])
  if (parts.length < 2 || parts.length > 5) return
  parts.forEach((part, index) => {
    if (part.length < 2 || part.length > 55) return
    const remaining = parts.filter((item, itemIndex) => itemIndex !== index)
    const candidate = `${remaining.join(',\\ ')}${suffix}`
    addMutation(
      output,
      seen,
      correct,
      candidate,
      '漏条件',
      '漏掉了其中一个适用条件'
    )
  })
}

function buildMutations(correct) {
  const normalizedCorrect = normalizeLatex(correct)
  const output = []
  const seen = new Set([normalizeOptionLatex(normalizedCorrect)])

  collectSignMutations(normalizedCorrect, output, seen)
  collectPmMutations(normalizedCorrect, output, seen)
  collectRelationMutations(normalizedCorrect, output, seen)
  collectCoefficientMutations(normalizedCorrect, output, seen)
  collectExponentMutations(normalizedCorrect, output, seen)
  collectFractionAndRootMutations(normalizedCorrect, output, seen)
  collectSimilarMutations(normalizedCorrect, output, seen)
  collectConditionMutations(normalizedCorrect, output, seen)

  return output
}

function structureProfile(latex) {
  return [
    '\\frac',
    '\\sqrt',
    '\\pm',
    '\\mp',
    '\\le',
    '\\ge',
    '\\subset',
    '\\Rightarrow',
    '\\Leftrightarrow',
    '\\to',
    '=',
    '^',
    '_',
    '+',
    '-',
    '\\text'
  ].map(token => {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return (String(latex || '').match(new RegExp(escaped, 'g')) || []).length
  })
}

function mutationScore(correct, candidate) {
  const correctLength = normalizeOptionLatex(correct).length
  const candidateLength = normalizeOptionLatex(candidate.latex).length
  const lengthScore =
    Math.abs(Math.log((candidateLength + 1) / (correctLength + 1))) * 5
  const profile = structureProfile(correct)
  const candidateProfile = structureProfile(candidate.latex)
  const structureScore = profile.reduce((sum, value, index) => (
    sum + Math.abs(value - candidateProfile[index])
  ), 0) * 0.07
  return lengthScore + structureScore
}

function chooseDistractors(correct, mutations) {
  const uniqueMutations = []
  const seen = new Set([normalizeOptionLatex(correct)])
  mutations.forEach(candidate => {
    const latex = normalizeLatex(candidate.latex)
    const key = normalizeOptionLatex(latex)
    if (!key || seen.has(key) || !balancedDelimiters(latex)) return
    seen.add(key)
    uniqueMutations.push({
      ...candidate,
      latex,
      score: mutationScore(correct, { ...candidate, latex })
    })
  })

  const byKind = new Map()
  uniqueMutations.forEach(candidate => {
    if (!byKind.has(candidate.errorKind)) byKind.set(candidate.errorKind, [])
    byKind.get(candidate.errorKind).push(candidate)
  })
  byKind.forEach(items => items.sort((left, right) => left.score - right.score))

  const kindOrder = [...byKind.keys()].sort((left, right) => (
    byKind.get(left)[0].score - byKind.get(right)[0].score
  ))
  const selected = []
  const selectedLatex = new Set()
  kindOrder.forEach(kind => {
    if (selected.length >= 3) return
    const candidate = byKind.get(kind)[0]
    selected.push(candidate)
    selectedLatex.add(normalizeOptionLatex(candidate.latex))
  })

  if (selected.length < 3) {
    uniqueMutations
      .slice()
      .sort((left, right) => left.score - right.score)
      .forEach(candidate => {
        if (selected.length >= 3) return
        const key = normalizeOptionLatex(candidate.latex)
        if (selectedLatex.has(key)) return
        selected.push(candidate)
        selectedLatex.add(key)
      })
  }

  if (selected.length !== 3) {
    throw new Error(
      `only ${selected.length} qualifying distractors for ${normalizeLatex(correct)}`
    )
  }
  return selected.map(({ score, ...candidate }) => candidate)
}

function findDelimitedSpans(latex) {
  const source = String(latex || '')
  const spans = []
  const pairs = [['(', ')'], ['[', ']']]
  pairs.forEach(([open, close]) => {
    const stack = []
    for (let index = 0; index < source.length; index += 1) {
      if (isEscaped(source, index)) continue
      if (source[index] === open) stack.push(index)
      if (source[index] === close && stack.length) {
        const start = stack.pop()
        spans.push({
          start,
          end: index + 1,
          content: source.slice(start + 1, index)
        })
      }
    }
  })
  return spans
}

function findTopLevelOperandSpans(latex) {
  const source = String(latex || '')
  const spans = []
  let braceDepth = 0
  let parenDepth = 0
  let bracketDepth = 0
  let start = 0

  for (let index = 0; index <= source.length; index += 1) {
    const character = source[index]
    if (index < source.length && !isEscaped(source, index)) {
      if (character === '{') braceDepth += 1
      else if (character === '}') braceDepth = Math.max(0, braceDepth - 1)
      else if (character === '(') parenDepth += 1
      else if (character === ')') parenDepth = Math.max(0, parenDepth - 1)
      else if (character === '[') bracketDepth += 1
      else if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1)
    }
    const atBoundary = (
      index === source.length
      || (
        braceDepth === 0
        && parenDepth === 0
        && bracketDepth === 0
        && (character === '+' || character === '-')
        && !isEscaped(source, index)
      )
    )
    if (!atBoundary) continue
    const chunk = source.slice(start, index)
    const leading = chunk.search(/\S/)
    if (leading >= 0) {
      const part = chunk.slice(leading).trim()
      spans.push({
        start: start + leading,
        end: index,
        content: part
      })
    }
    start = index + 1
  }
  return spans
}

function findTextSpans(latex) {
  const spans = []
  const pattern = /\\text\{/g
  let match
  while ((match = pattern.exec(latex))) {
    const group = readBalancedGroup(latex, match.index + '\\text'.length)
    if (!group) continue
    spans.push({
      start: match.index,
      end: group.end,
      content: latex.slice(match.index, group.end)
    })
    pattern.lastIndex = group.end
  }
  return spans
}

function buildBlankDrafts(candidate) {
  const rhs = candidate.rhs
  if (rhs.length < 18) return []
  const rawSpans = [
    ...findCommandSpans(rhs, '\\frac'),
    ...findCommandSpans(rhs, '\\sqrt'),
    ...findDelimitedSpans(rhs),
    ...findTextSpans(rhs),
    ...findTopLevelOperandSpans(rhs),
    ...splitTopLevel(rhs, [',', ';']).map(part => {
      const start = rhs.indexOf(part)
      return {
        start,
        end: start + part.length,
        content: part
      }
    })
  ]

  const valid = []
  const seen = new Set()
  rawSpans.forEach(span => {
    const part = normalizeLatex(span.content)
    const key = `${span.start}:${span.end}:${part}`
    if (
      !part
      || seen.has(key)
      || span.start < 0
      || span.end <= span.start
      || part.length < 4
      || part.length > 110
      || part.length > rhs.length * 0.78
      || /^[,;+\-=<>]/.test(part)
      || /[,;+\-=<>]$/.test(part)
      || findAllTopLevelRelations(part).length > 0
      || !balancedDelimiters(part)
    ) {
      return
    }
    seen.add(key)
    try {
      const distractors = chooseDistractors(part, buildMutations(part))
      valid.push({ span, part, distractors })
    } catch (error) {
      // This span does not offer three local errors; try another span.
    }
  })

  return valid
    .sort((left, right) => (
      Math.abs(left.part.length - 22) - Math.abs(right.part.length - 22)
      || right.part.length - left.part.length
    ))
    .slice(0, 8)
    .map(item => {
      const blankedRhs = replaceRange(
        rhs,
        item.span.start,
        item.span.end,
        `\\boxed{\\phantom{${item.span.content}}}`
      )
      return {
        type: 'blank',
        stemLatex: appendControlWordSafely(
          candidate.lhs,
          candidate.operator,
          blankedRhs
        ),
        answerLatex: item.part,
        distractors: item.distractors,
        blankPart: item.part
      }
    })
}

function relationPenalty(operator) {
  if (LOGICAL_RELATIONS.has(operator)) return 0
  if (operator === '=') return 0.15
  if (operator === '\\neq') return 0.35
  if (operator === '<' || operator === '>') return 0.45
  if (MEMBERSHIP_RELATIONS.has(operator)) return 0.55
  return 0.7
}

function draftScore(candidate, draft) {
  let score = 10
  score -= relationPenalty(candidate.operator) * 2
  score -= candidate.rhsRelationCount * 0.65
  score -= Math.max(0, candidate.rhs.length - 150) / 80
  score -= Math.max(0, candidate.lhs.length - 150) / 120
  score -= Math.max(0, candidate.clauseIndex) * 0.015
  score -= Math.max(0, draft.stemLatex.length - 260) / 160
  if (draft.answerLatex.length < 3) score -= 2
  if (draft.type === 'reconstruct' && candidate.rhs.length <= 95) score += 0.8
  if (draft.type === 'blank' && candidate.rhs.length >= 45) score += 2.2
  if (draft.type === 'blank' && candidate.rhs.length >= 95) score += 0.8
  if (draft.type === 'blank' && draft.answerLatex.length < 8) score -= 0.8
  return score
}

function buildAutoDrafts(formula) {
  const candidates = buildSplitCandidates(formula.latex)
  const drafts = []
  const failures = []

  candidates.forEach(candidate => {
    const shortStem = normalizeOptionLatex(candidate.lhs).length <= 6
    const stemPrefix = shortStem
      ? `\\text{${escapeTextContent(formula.name)}：}`
      : ''
    const reconstructDraft = {
      type: 'reconstruct',
      stemLatex: `${stemPrefix}${candidate.lhs}${candidate.operator}`,
      answerLatex: candidate.rhs,
      blankPart: null
    }
    try {
      drafts.push({
        ...reconstructDraft,
        distractors: chooseDistractors(
          reconstructDraft.answerLatex,
          buildMutations(reconstructDraft.answerLatex)
        ),
        candidate,
        score: draftScore(candidate, reconstructDraft)
      })
    } catch (error) {
      failures.push({
        type: 'reconstruct',
        stem: reconstructDraft.stemLatex,
        reason: error.message
      })
    }

    buildBlankDrafts(candidate).forEach(blankDraft => {
      drafts.push({
        ...blankDraft,
        candidate,
        score: draftScore(candidate, blankDraft)
      })
    })
  })

  if (!drafts.length) {
    const fallback = {
      type: 'condition',
      stemLatex: `\\text{${escapeTextContent(formula.name)}：下列表述正确的是}`,
      answerLatex: formula.latex,
      blankPart: null
    }
    drafts.push({
      ...fallback,
      distractors: chooseDistractors(
        fallback.answerLatex,
        buildMutations(fallback.answerLatex)
      ),
      candidate: null,
      score: -10
    })
  }

  drafts.sort((left, right) => right.score - left.score)
  return { draft: drafts[0], failures }
}

function normalizeErrorKind(value, error) {
  if (ERROR_KIND_SET.has(value)) return value
  const text = String(error || '')
  if (/分母|分子|根号|开方|根指数/.test(text)) return '分母或根号错误'
  if (/次数|指数|平方|立方/.test(text)) return '次数错误'
  if (/系数|漏乘|少乘|多乘/.test(text)) return '系数错误'
  if (/漏|条件|范围|端点|非空|定义域|值域/.test(text)) return '漏条件'
  if (/相似|混淆|并集|交集|正弦|余弦|正切|余切|奇函数|偶函数|集合/.test(text)) {
    return '相似公式混淆'
  }
  return '符号错误'
}

function escapeTextContent(value) {
  return String(value || '')
    .replace(/[\\{}$%&#_^~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectCommands(value, output) {
  if (typeof value === 'string') {
    findAllLatexCommands(value).forEach(command => output.add(command))
    return
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectCommands(item, output))
    return
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectCommands(item, output))
  }
}

function assertKnownCommands(question) {
  if (!ALLOWED_LATEX_COMMANDS) return
  const values = [
    question.stemLatex,
    question.answerLatex,
    ...question.distractors.map(item => item.latex)
  ]
  values.forEach(value => {
    findAllLatexCommands(value).forEach(command => {
      if (!ALLOWED_LATEX_COMMANDS.has(command)) {
        throw new Error(`${question.id}: unknown LaTeX command ${command}`)
      }
    })
  })
}

function stemEndsWithRelation(stemLatex) {
  const stem = normalizeLatex(stemLatex)
  return findAllTopLevelRelations(stem).some(relation => (
    relation.index + relation.token.length === stem.length
  ))
}

function inferType(item) {
  const stem = normalizeLatex(item.stemLatex)
  if (item.type === 'condition') return 'condition'
  if (stem.includes('\\boxed{')) return 'blank'
  if (stemEndsWithRelation(stem)) return 'reconstruct'
  return 'condition'
}

function normalizeQuestionOptions(question) {
  const normalized = {
    ...question,
    stemLatex: normalizeLatex(question.stemLatex),
    answerLatex: normalizeLatex(question.answerLatex),
    distractors: question.distractors.map(distractor => {
      const error = normalizeLatex(distractor.error)
      return {
        latex: normalizeLatex(distractor.latex),
        errorKind: normalizeErrorKind(distractor.errorKind, error),
        error
      }
    })
  }
  assertQuestionQuality(normalized)
  return normalized
}

function assertQuestionQuality(question) {
  if (!question.id || !question.sourceId) {
    throw new Error('question is missing id or sourceId')
  }
  if (!QUESTION_TYPES.has(question.type)) {
    throw new Error(`${question.id}: invalid question type ${question.type}`)
  }
  if (!question.stemLatex || !question.answerLatex) {
    throw new Error(`${question.id}: empty stem or answer`)
  }
  if (!balancedDelimiters(question.stemLatex)) {
    throw new Error(`${question.id}: unbalanced stem`)
  }
  if (!balancedDelimiters(question.answerLatex)) {
    throw new Error(`${question.id}: unbalanced answer`)
  }
  if (!Array.isArray(question.distractors) || question.distractors.length !== 3) {
    throw new Error(`${question.id}: must have exactly three distractors`)
  }
  const options = [question.answerLatex, ...question.distractors.map(item => item.latex)]
  const normalizedOptions = options.map(normalizeOptionLatex)
  if (normalizedOptions.some(item => !item)) {
    throw new Error(`${question.id}: empty option`)
  }
  if (new Set(normalizedOptions).size !== 4) {
    throw new Error(`${question.id}: duplicate options`)
  }
  question.distractors.forEach((distractor, index) => {
    if (!ERROR_KIND_SET.has(distractor.errorKind) || !distractor.error) {
      throw new Error(`${question.id}: invalid distractor ${index + 1}`)
    }
    if (!balancedDelimiters(distractor.latex)) {
      throw new Error(`${question.id}: unbalanced distractor ${index + 1}`)
    }
  })
  assertKnownCommands(question)

  const trimmedStem = String(question.stemLatex).trim()
  if (/\\(?:left|right|text|frac|sqrt|begin|end)\s*$/.test(trimmedStem)) {
    throw new Error(`${question.id}: dangling LaTeX command in stem`)
  }
  if (question.type === 'blank' && !trimmedStem.includes('\\boxed{')) {
    throw new Error(`${question.id}: blank question has no boxed placeholder`)
  }
  if (question.type === 'reconstruct') {
    if (!stemEndsWithRelation(trimmedStem)) {
      throw new Error(`${question.id}: reconstruct stem must end with a relation`)
    }
  }

  const lengths = options.map(item => normalizeLatex(item).length)
  const shortest = Math.min(...lengths)
  const longest = Math.max(...lengths)
  if (
    shortest >= 4
    && longest > Math.max(shortest * 1.9, shortest + 48)
  ) {
    throw new Error(
      `${question.id}: option lengths are visibly unbalanced (${lengths.join(', ')})`
    )
  }
}

function manualQuestion(formula, item, source) {
  const distractors = (item.distractors || []).map(distractor => ({
    latex: distractor.latex,
    errorKind: distractor.errorKind,
    error: distractor.error
  }))
  return normalizeQuestionOptions({
    id: `P-${formula.id}-01`,
    sourceId: formula.id,
    chapter: formula.chapter,
    title: formula.name,
    type: inferType(item),
    stemLatex: item.stemLatex,
    answerLatex: item.answerLatex,
    distractors,
    authoring: source
  })
}

function autoQuestion(formula, failures) {
  const result = buildAutoDrafts(formula)
  result.failures.forEach(failure => {
    failures.push({ id: formula.id, ...failure })
  })
  return normalizeQuestionOptions({
    id: `P-${formula.id}-01`,
    sourceId: formula.id,
    chapter: formula.chapter,
    title: formula.name,
    type: result.draft.type,
    stemLatex: result.draft.stemLatex,
    answerLatex: result.draft.answerLatex,
    distractors: result.draft.distractors,
    authoring: 'auto'
  })
}

function main() {
  const formulaSource = JSON.parse(fs.readFileSync(FORMULAS_PATH, 'utf8'))
  const seedSource = JSON.parse(fs.readFileSync(SEEDS_PATH, 'utf8'))
  const manualSource = require(MANUAL_PATH)
  const specialSource = require(SPECIAL_PATH)
  const formulas = formulaSource.items.slice()
  ALLOWED_LATEX_COMMANDS = new Set(EXTRA_ALLOWED_COMMANDS)
  collectCommands(formulaSource, ALLOWED_LATEX_COMMANDS)
  collectCommands(seedSource, ALLOWED_LATEX_COMMANDS)
  collectCommands(manualSource, ALLOWED_LATEX_COMMANDS)
  collectCommands(specialSource, ALLOWED_LATEX_COMMANDS)
  const formulaIds = new Set(formulas.map(formula => formula.id))
  const generationFailures = []
  const generationErrors = []

  const seedById = new Map()
  const droppedSeedIds = []
  seedSource.items.forEach(item => {
    if (seedById.has(item.sourceId)) {
      droppedSeedIds.push(item.id)
      return
    }
    seedById.set(item.sourceId, item)
  })

  const overrideIds = new Set([
    ...Object.keys(specialSource),
    ...Object.keys(manualSource),
    ...seedById.keys()
  ])
  overrideIds.forEach(id => {
    if (!formulaIds.has(id)) {
      throw new Error(`Override references unknown formula ${id}`)
    }
  })

  const items = formulas.map(formula => {
    try {
      if (specialSource[formula.id]) {
        return manualQuestion(formula, specialSource[formula.id], 'special')
      }
      if (manualSource[formula.id]) {
        return manualQuestion(formula, manualSource[formula.id], 'manual')
      }
      if (seedById.has(formula.id)) {
        return manualQuestion(formula, seedById.get(formula.id), 'seed')
      }
      return autoQuestion(formula, generationFailures)
    } catch (error) {
      generationErrors.push(`${formula.id}: ${error.message}`)
      return null
    }
  }).filter(Boolean)

  if (generationErrors.length) {
    throw new Error(
      `${generationErrors.length} questions failed quality checks:\n` +
      generationErrors.join('\n')
    )
  }

  const sourceCount = new Map()
  items.forEach(item => {
    sourceCount.set(item.sourceId, (sourceCount.get(item.sourceId) || 0) + 1)
  })
  const missing = formulas
    .filter(formula => sourceCount.get(formula.id) !== 1)
    .map(formula => formula.id)
  if (missing.length) {
    throw new Error(`Formula coverage failed: ${missing.join(', ')}`)
  }
  if (items.length !== formulas.length) {
    throw new Error(`Expected ${formulas.length} questions, generated ${items.length}`)
  }

  const output = {
    meta: {
      version: 4,
      description: '351 条公式三类型选择题，每条一道；题干与四个选项均为公式图片',
      source: 'prototype/data/公式库-全量.json',
      chapterCount: unique(formulas.map(item => item.chapter)).length,
      questionCount: items.length,
      coveragePolicy: 'one-choice-question-per-formula',
      types: [...QUESTION_TYPES],
      typeCounts: countBy(items, 'type'),
      authoringCounts: countBy(items, 'authoring'),
      errorKindCounts: countBy(
        items.flatMap(item => item.distractors),
        'errorKind'
      ),
      droppedSeedIds,
      fillPolicy: 'removed',
      variantsPolicy: 'important formulas may receive a second variant later'
    },
    items
  }

  fs.mkdirSync(path.dirname(QUESTIONS_PATH), { recursive: true })
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(QUESTIONS_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    formulas: formulas.length,
    questions: items.length,
    typeCounts: output.meta.typeCounts,
    authoringCounts: output.meta.authoringCounts,
    errorKindCounts: output.meta.errorKindCounts,
    droppedSeedIds,
    autoCandidateFailures: generationFailures
  }, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify({
    formulas: formulas.length,
    questions: items.length,
    chapters: output.meta.chapterCount,
    typeCounts: output.meta.typeCounts,
    authoringCounts: output.meta.authoringCounts,
    errorKindCounts: output.meta.errorKindCounts,
    droppedSeedIds,
    autoCandidateFailureCount: generationFailures.length,
    output: QUESTIONS_PATH,
    report: REPORT_PATH
  }, null, 2))
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

module.exports = {
  assertQuestionQuality,
  buildAutoDrafts,
  buildBlankDrafts,
  buildMutations,
  buildSplitCandidates,
  chooseDistractors,
  inferType,
  normalizeErrorKind,
  normalizeLatex,
  normalizeOptionLatex,
  normalizeQuestionOptions
}
