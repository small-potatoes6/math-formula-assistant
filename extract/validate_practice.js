const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { buildFormulaAtoms } = require('./practice-source/formula-atoms')

const ROOT = path.resolve(__dirname, '..')
const PROJECT_ROOT = path.join(ROOT, '新建文件夹')
const PRACTICE_ROOT = path.join(PROJECT_ROOT, 'practice-package')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const PRACTICE_DATA_PATH = path.join(PRACTICE_ROOT, 'data/practice.js')
const APP_CONFIG_PATH = path.join(PROJECT_ROOT, 'app.json')
const RENDER_REPORT_PATH = path.join(ROOT, 'extract/build/practice-render-report.json')
const QUESTION_AUDIT_PATH = path.join(ROOT, 'extract/build/practice-question-audit.json')
const VALIDATION_REPORT_PATH = path.join(
  ROOT,
  'extract/build/practice-validation-report.json'
)
const PACKAGE_LIMIT = 2 * 1024 * 1024
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
const COVERAGE_POLICY = 'every-base-question-covers-an-atom'

const failures = []
const warnings = []

function fail(message) {
  failures.push(message)
}

function warn(message) {
  warnings.push(message)
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    fail(`${path.relative(ROOT, filePath)}: ${error.message}`)
    return null
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    fail(`${path.relative(ROOT, filePath)}: ${error.message}`)
    return ''
  }
}

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
}

function expressionIdFor(latex) {
  return `e-${crypto
    .createHash('sha1')
    .update(normalizeLatex(latex), 'utf8')
    .digest('hex')
    .slice(0, 16)}`
}

function unique(values) {
  return [...new Set(values)]
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return []
  const files = []
  fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(absolute))
    } else if (entry.isFile()) {
      files.push(absolute)
    }
  })
  return files
}

function sumBytes(files) {
  return files.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0)
}

function relativeProjectPath(filePath) {
  return path.relative(PROJECT_ROOT, filePath).split(path.sep).join('/')
}

function isInsideSubpackage(filePath, subPackages) {
  const relative = relativeProjectPath(filePath)
  return subPackages.some(item => {
    const root = String(item.root || '')
    return relative === root || relative.startsWith(`${root}/`)
  })
}

function validateSource(source, formulas) {
  if (!source || !Array.isArray(source.items)) {
    fail('题库缺少 items 数组')
    return null
  }
  if (!formulas || !Array.isArray(formulas.items)) {
    fail('公式主数据缺少 items 数组')
    return null
  }

  const formulaMap = new Map(formulas.items.map(item => [item.id, item]))
  const chapterOrder = unique(formulas.items.map(item => item.chapter))
  const questionIds = new Set()
  const sourceCounts = new Map()
  const typeCounts = {}
  const distractorByQuestion = new Map()
  const questionById = new Map()
  let formalQuestionCount = 0
  let demoQuestionCount = 0

  if (!source.meta || typeof source.meta !== 'object') {
    fail('题库缺少 meta')
  } else {
    if (source.meta.questionCount !== source.items.length) {
      fail(`meta.questionCount=${source.meta.questionCount}，实际 ${source.items.length}`)
    }
    if (source.meta.formalQuestionCount !== source.items.length - DEMO_QUESTION_COUNT) {
      fail(
        `meta.formalQuestionCount=${source.meta.formalQuestionCount}，` +
        `实际 ${source.items.length - DEMO_QUESTION_COUNT}`
      )
    }
    if (source.meta.baseQuestionCount !== source.meta.formalQuestionCount) {
      fail('meta.baseQuestionCount 与 formalQuestionCount 不一致')
    }
    if (source.meta.demoQuestionCount !== DEMO_QUESTION_COUNT) {
      fail(
        `meta.demoQuestionCount=${source.meta.demoQuestionCount}，` +
        `实际 ${DEMO_QUESTION_COUNT}`
      )
    }
    if (source.meta.chapterCount !== chapterOrder.length) {
      fail(`meta.chapterCount=${source.meta.chapterCount}，实际 ${chapterOrder.length}`)
    }
    if (source.meta.coveragePolicy !== COVERAGE_POLICY) {
      fail(`覆盖策略异常: ${source.meta.coveragePolicy || '(空)'}`)
    }
    if (source.meta.coveredFormulaCount !== formulas.items.length) {
      fail(
        `meta.coveredFormulaCount=${source.meta.coveredFormulaCount}，` +
        `实际 ${formulas.items.length}`
      )
    }
    if (source.meta.fillPolicy !== 'removed') {
      fail(`填空题策略应为 removed，实际 ${source.meta.fillPolicy || '(空)'}`)
    }
    if (!Array.isArray(source.meta.types)
      || source.meta.types.slice().sort().join('|')
        !== [...QUESTION_TYPES].sort().join('|')) {
      fail('meta.types 与现行三类选择题不一致')
    }
  }

  source.items.forEach((question, index) => {
    const label = question.id || `source.items[${index}]`
    const isDemo = question.demo === true
    if (!question.id) fail(`${label}: 缺少 id`)
    if (questionIds.has(question.id)) fail(`${label}: 题目 id 重复`)
    questionIds.add(question.id)
    if (question.id) questionById.set(question.id, question)

    const formula = formulaMap.get(question.sourceId)
    if (!formula) {
      fail(`${label}: sourceId ${question.sourceId || '(空)'} 不存在`)
      return
    }
    if (isDemo) {
      demoQuestionCount += 1
      if (!new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id)) {
        fail(`${label}: 示范题 id 格式无效`)
      }
    } else {
      formalQuestionCount += 1
      if (!new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id)) {
        fail(`${label}: 正式题 id 格式无效`)
      }
    }
    if (!normalizeLatex(question.atomId)) {
      fail(`${label}: 缺少 atomId`)
    } else if (!question.atomId.startsWith(`${question.sourceId}-atom-`)) {
      fail(`${label}: atomId 不属于来源公式 ${question.sourceId}`)
    }
    if (!PROMPT_FORMS.has(question.promptForm)) {
      fail(`${label}: promptForm 无效`)
    }
    if (question.chapter !== formula.chapter) {
      fail(`${label}: 章节与主数据不一致`)
    }
    if (question.title !== formula.name) {
      fail(`${label}: title 与主数据公式名不一致`)
    }
    if (!QUESTION_TYPES.has(question.type)) {
      fail(`${label}: 未知题型 ${question.type || '(空)'}`)
    } else {
      typeCounts[question.type] = (typeCounts[question.type] || 0) + 1
    }
    if (!normalizeLatex(question.stemLatex)) fail(`${label}: 缺少 stemLatex`)
    if (!normalizeLatex(question.answerLatex)) fail(`${label}: 缺少 answerLatex`)

    if (question.type === 'blank') {
      const boxes = String(question.stemLatex || '').match(/\\boxed\b/g) || []
      if (boxes.length !== 1) {
        fail(`${label}: 核心块挖空题干必须有且只有一个 \\boxed，实际 ${boxes.length}`)
      }
    }

    if (!isDemo) {
      sourceCounts.set(
        question.sourceId,
        (sourceCounts.get(question.sourceId) || 0) + 1
      )
    }

    if (!Array.isArray(question.distractors) || question.distractors.length !== 3) {
      fail(`${label}: 干扰项必须正好 3 个`)
      return
    }

    const optionLatex = [
      question.answerLatex,
      ...question.distractors.map(item => item.latex)
    ].map(normalizeLatex)
    if (optionLatex.some(value => !value)) {
      fail(`${label}: 正确项或干扰项存在空 LaTeX`)
    }
    if (new Set(optionLatex).size !== 4) {
      fail(`${label}: 四个选项表达式必须互不重复`)
    }

    const distractorMap = new Map()
    question.distractors.forEach((distractor, distractorIndex) => {
      if (!normalizeLatex(distractor.latex)) {
        fail(`${label}: 干扰项 ${distractorIndex + 1} LaTeX 为空`)
      }
      if (!ERROR_KINDS.has(distractor.errorKind)) {
        fail(
          `${label}: 干扰项 ${distractorIndex + 1} 错误类型无效 ` +
          `${distractor.errorKind || '(空)'}`
        )
      }
      if (!normalizeLatex(distractor.error)) {
        fail(`${label}: 干扰项 ${distractorIndex + 1} 缺少错误说明`)
      }
      distractorMap.set(expressionIdFor(distractor.latex), distractor)
    })
    distractorByQuestion.set(question.id, distractorMap)
  })

  const missing = formulas.items
    .filter(formula => !sourceCounts.get(formula.id))
    .map(formula => formula.id)
  if (missing.length) {
    fail(`以下公式没有被选择题覆盖: ${missing.join(', ')}`)
  }
  if (demoQuestionCount !== DEMO_QUESTION_COUNT) {
    fail(`示范题数应为 ${DEMO_QUESTION_COUNT}，实际 ${demoQuestionCount}`)
  }
  if (source.items.length !== formalQuestionCount + demoQuestionCount) {
    fail(
      `总题数应为 ${formalQuestionCount + demoQuestionCount}，` +
      `实际 ${source.items.length}`
    )
  }
  const expectedAtoms = formulas.items.flatMap(formula => buildFormulaAtoms(formula))
  const expectedAtomIds = new Set(expectedAtoms.map(atom => atom.atomId))
  const formalAtomIds = new Set(
    source.items
      .filter(question => question.demo !== true)
      .map(question => question.atomId)
      .filter(Boolean)
  )
  const missingAtomIds = expectedAtoms
    .map(atom => atom.atomId)
    .filter(atomId => !formalAtomIds.has(atomId))
  const unknownAtomIds = [...formalAtomIds]
    .filter(atomId => !expectedAtomIds.has(atomId))
  if (missingAtomIds.length) {
    fail(`还有 ${missingAtomIds.length} 个公式原子未被正式题覆盖`)
  }
  if (unknownAtomIds.length) {
    fail(`有 ${unknownAtomIds.length} 个正式题的 atomId 不在公式原子中`)
  }
  if (source.meta && source.meta.atomCount !== expectedAtoms.length) {
    fail(`meta.atomCount=${source.meta.atomCount}，实际 ${expectedAtoms.length}`)
  }
  if (source.meta && source.meta.coveredAtomCount !== formalAtomIds.size) {
    fail(
      `meta.coveredAtomCount=${source.meta.coveredAtomCount}，` +
      `实际 ${formalAtomIds.size}`
    )
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

  if (source.meta && source.meta.typeCounts) {
    Object.entries(source.meta.typeCounts).forEach(([type, count]) => {
      if ((typeCounts[type] || 0) !== count) {
        fail(`meta.typeCounts.${type}=${count}，实际 ${typeCounts[type] || 0}`)
      }
    })
  }

  return {
    source,
    formulaMap,
    chapterOrder,
    questionIds,
    sourceCounts,
    typeCounts,
    distractorByQuestion,
    questionById,
    baseQuestionCount: formalQuestionCount,
    formalQuestionCount,
    atomCount: expectedAtoms.length,
    coveredAtomCount: formalAtomIds.size,
    missingAtomIds,
    demoQuestionCount
  }
}

function validateRuntime(practiceData, sourceResult, appConfig) {
  if (!practiceData) {
    fail('练习运行数据无法加载')
    return null
  }

  const requiredExports = [
    'PRACTICE_SHEETS',
    'PRACTICE_EXPRESSION_CROPS',
    'PRACTICE_QUESTIONS',
    'PRACTICE_CHAPTERS',
    'PRACTICE_ASSET_PACKAGES'
  ]
  requiredExports.forEach(key => {
    if (practiceData[key] === undefined) fail(`运行数据缺少 ${key}`)
  })
  if (practiceData.PRACTICE_CROPS !== undefined) {
    fail('运行数据仍导出旧协议 PRACTICE_CROPS')
  }

  const sheets = practiceData.PRACTICE_SHEETS
  const crops = practiceData.PRACTICE_EXPRESSION_CROPS
  const questions = practiceData.PRACTICE_QUESTIONS
  const chapters = practiceData.PRACTICE_CHAPTERS
  const assetPackages = practiceData.PRACTICE_ASSET_PACKAGES
  if (!Array.isArray(sheets)
    || !crops
    || typeof crops !== 'object'
    || !Array.isArray(questions)
    || !Array.isArray(chapters)
    || !Array.isArray(assetPackages)) {
    fail('运行数据主要字段类型不正确')
    return null
  }

  if (JSON.stringify(chapters) !== JSON.stringify(sourceResult.chapterOrder)) {
    fail('PRACTICE_CHAPTERS 与公式主数据章节顺序不一致')
  }
  if (questions.length !== sourceResult.source.items.length) {
    fail(`运行题数 ${questions.length} 与源题库 ${sourceResult.source.items.length} 不一致`)
  }

  const sourceMap = new Map(sourceResult.source.items.map(item => [item.id, item]))
  const runtimeQuestionIds = new Set()
  const runtimeSourceCounts = new Map()
  let runtimeBaseQuestionCount = 0
  let runtimeDemoQuestionCount = 0
  const referencedExpressions = new Set()
  let correctOptionCount = 0

  questions.forEach((question, index) => {
    const label = question.id || `practice[${index}]`
    const sourceQuestion = sourceMap.get(question.id)
    if (!sourceQuestion) {
      fail(`${label}: 源题库中不存在`)
      return
    }
    if (runtimeQuestionIds.has(question.id)) fail(`${label}: 运行题目 id 重复`)
    runtimeQuestionIds.add(question.id)
    if (sourceQuestion.demo === true) {
      runtimeDemoQuestionCount += 1
    } else {
      runtimeBaseQuestionCount += 1
      runtimeSourceCounts.set(
        question.sourceId,
        (runtimeSourceCounts.get(question.sourceId) || 0) + 1
      )
    }

    if (question.sourceId !== sourceQuestion.sourceId) fail(`${label}: sourceId 不一致`)
    if (question.chapter !== sourceQuestion.chapter) fail(`${label}: chapter 不一致`)
    if (question.title !== sourceQuestion.title) fail(`${label}: title 不一致`)
    if (question.type !== sourceQuestion.type) fail(`${label}: type 不一致`)
    if (Boolean(question.demo) !== Boolean(sourceQuestion.demo)) {
      fail(`${label}: demo 标记与源题库不一致`)
    }
    if (sourceQuestion.demo === true) {
      if (question.atomId !== sourceQuestion.atomId) {
        fail(`${label}: atomId 与源题库不一致`)
      }
      if (question.promptForm !== sourceQuestion.promptForm) {
        fail(`${label}: promptForm 与源题库不一致`)
      }
    }

    const expectedStemId = expressionIdFor(sourceQuestion.stemLatex)
    const expectedAnswerId = expressionIdFor(sourceQuestion.answerLatex)
    if (question.stemExpressionId !== expectedStemId) {
      fail(`${label}: stemExpressionId 与源题干表达式不一致`)
    }
    if (!crops[question.stemExpressionId]) {
      fail(`${label}: 题干表达式缺少裁切`)
    }
    referencedExpressions.add(question.stemExpressionId)

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      fail(`${label}: 运行数据必须正好 4 个选项`)
      return
    }
    const optionIds = question.options.map(option => option.expressionId)
    if (new Set(optionIds).size !== 4) fail(`${label}: 选项表达式 ID 重复`)

    const expectedOptionIds = [
      expectedAnswerId,
      ...sourceQuestion.distractors.map(item => expressionIdFor(item.latex))
    ]
    if (JSON.stringify(optionIds) !== JSON.stringify(expectedOptionIds)) {
      fail(`${label}: 运行选项与源题正确项/干扰项映射不一致`)
    }

    const correctOptions = question.options.filter(option => option.isCorrect)
    if (correctOptions.length !== 1) {
      fail(`${label}: 正确项数量为 ${correctOptions.length}`)
    } else {
      correctOptionCount += 1
      if (correctOptions[0].expressionId !== expectedAnswerId) {
        fail(`${label}: 正确项不是源题 answerLatex`)
      }
      if (normalizeLatex(correctOptions[0].error)
        || normalizeLatex(correctOptions[0].errorKind)) {
        fail(`${label}: 正确项不应带错误说明`)
      }
    }

    const distractorMap = sourceResult.distractorByQuestion.get(question.id)
    question.options.forEach(option => {
      if (!crops[option.expressionId]) {
        fail(`${label}: 选项 ${option.expressionId} 缺少裁切`)
      }
      referencedExpressions.add(option.expressionId)
      if (option.isCorrect) return
      const distractor = distractorMap.get(option.expressionId)
      if (!distractor) {
        fail(`${label}: 错项 ${option.expressionId} 找不到源干扰项`)
        return
      }
      if (option.errorKind !== distractor.errorKind) {
        fail(`${label}: 错项 ${option.expressionId} errorKind 不一致`)
      }
      if (option.error !== distractor.error) {
        fail(`${label}: 错项 ${option.expressionId} 错误说明不一致`)
      }
    })
  })

  const missingRuntimeCoverage = sourceResult.formulaMap.size
    ? [...sourceResult.formulaMap.keys()]
      .filter(id => !runtimeSourceCounts.get(id))
    : []
  if (missingRuntimeCoverage.length) {
    fail(`运行题未覆盖每条公式: ${missingRuntimeCoverage.join(', ')}`)
  }
  if (runtimeBaseQuestionCount !== sourceResult.baseQuestionCount) {
    fail(
      `运行基础题 ${runtimeBaseQuestionCount} 道，` +
      `应为 ${sourceResult.baseQuestionCount} 道`
    )
  }
  if (runtimeDemoQuestionCount !== sourceResult.demoQuestionCount) {
    fail(
      `运行示范题 ${runtimeDemoQuestionCount} 道，` +
      `应为 ${sourceResult.demoQuestionCount} 道`
    )
  }

  const expressionKeys = Object.keys(crops)
  if (expressionKeys.length !== referencedExpressions.size) {
    fail(
      `表达式裁切 ${expressionKeys.length} 个，实际引用 ` +
      `${referencedExpressions.size} 个`
    )
  }
  const unusedExpressions = expressionKeys.filter(id => !referencedExpressions.has(id))
  const missingCrops = [...referencedExpressions].filter(id => !crops[id])
  if (unusedExpressions.length) {
    fail(`存在未被题目引用的裁切表达式: ${unusedExpressions.slice(0, 10).join(', ')}`)
  }
  if (missingCrops.length) {
    fail(`题目引用但缺少裁切: ${missingCrops.slice(0, 10).join(', ')}`)
  }

  const packageByName = new Map(assetPackages.map(item => [item.name, item]))
  const registeredPackages = new Map(
    (appConfig.subPackages || []).map(item => [item.name, item])
  )
  const assignedSheetIndexes = []

  assetPackages.forEach((assetPackage, packageIndex) => {
    const label = `资源分包 ${packageIndex + 1}`
    if (!assetPackage.name || packageByName.get(assetPackage.name) !== assetPackage) {
      fail(`${label}: name 重复或缺失`)
    }
    if (!assetPackage.root || !/^practice-assets-[a-z]$/.test(assetPackage.root)) {
      fail(`${label}: root 格式无效`)
    }
    if (!Array.isArray(assetPackage.sheetIndexes)
      || !assetPackage.sheetIndexes.length) {
      fail(`${label}: 缺少 sheetIndexes`)
    } else {
      assetPackage.sheetIndexes.forEach(sheetIndex => {
        assignedSheetIndexes.push(sheetIndex)
      })
    }
    const registered = registeredPackages.get(assetPackage.name)
    if (!registered
      || registered.root !== assetPackage.root
      || !Array.isArray(registered.pages)
      || registered.pages.indexOf('pages/loader/loader') < 0) {
      fail(`${label}: app.json 注册信息不完整`)
    }
  })

  if (
    assignedSheetIndexes.length !== sheets.length
    || new Set(assignedSheetIndexes).size !== sheets.length
    || assignedSheetIndexes.some(index => (
      !Number.isInteger(index) || index < 0 || index >= sheets.length
    ))
  ) {
    fail('资源分包没有恰好覆盖全部图集索引')
  }

  const packageBySheet = new Map()
  assetPackages.forEach(assetPackage => {
    (assetPackage.sheetIndexes || []).forEach(index => {
      packageBySheet.set(index, assetPackage)
    })
  })

  sheets.forEach((sheet, sheetIndex) => {
    const label = `图集 ${sheetIndex + 1}`
    const width = Number(sheet.width)
    const height = Number(sheet.height)
    if (!Number.isFinite(width) || width <= 0
      || !Number.isFinite(height) || height <= 0) {
      fail(`${label}: 宽高无效`)
    }
    const assetPackage = packageBySheet.get(sheetIndex)
    if (!assetPackage) {
      fail(`${label}: 未归入资源分包`)
      return
    }
    if (sheet.packageName !== assetPackage.name) {
      fail(`${label}: packageName 与分包索引不一致`)
    }
    const expectedImage =
      `/${assetPackage.root}/assets/practice/` +
      `sheet-${String(sheetIndex + 1).padStart(3, '0')}.svg`
    if (sheet.image !== expectedImage) {
      fail(`${label}: 路径应为 ${expectedImage}`)
    }
  })

  Object.entries(crops).forEach(([expressionId, crop]) => {
    if (!/^e-[0-9a-f]{16}$/.test(expressionId)) {
      fail(`${expressionId}: 表达式 ID 格式无效`)
    }
    if (!Array.isArray(crop) || crop.length !== 5) {
      fail(`${expressionId}: 裁切数据必须是 5 项数组`)
      return
    }
    const [sheetIndex, x, y, width, height] = crop.map(Number)
    if (
      !Number.isInteger(sheetIndex)
      || sheetIndex < 0
      || sheetIndex >= sheets.length
    ) {
      fail(`${expressionId}: 图集索引无效`)
      return
    }
    if (![x, y, width, height].every(Number.isFinite)) {
      fail(`${expressionId}: 裁切坐标含非数字`)
      return
    }
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      fail(`${expressionId}: 裁切坐标必须为正向范围`)
      return
    }
    const sheet = sheets[sheetIndex]
    if (
      x + width > Number(sheet.width) + 0.001
      || y + height > Number(sheet.height) + 0.001
    ) {
      fail(`${expressionId}: 裁切范围超出图集`)
    }
  })

  return {
    sheets,
    crops,
    questions,
    chapters,
    assetPackages,
    correctOptionCount,
    baseQuestionCount: runtimeBaseQuestionCount,
    demoQuestionCount: runtimeDemoQuestionCount,
    expressionCount: expressionKeys.length,
    expressionReferences: questions.reduce((sum, question) => {
      return sum + 1 + (Array.isArray(question.options) ? question.options.length : 0)
    }, 0)
  }
}

function validateSvgAssets(runtimeResult) {
  if (!runtimeResult) {
    return {
      count: 0,
      bytes: 0,
      packageBytes: {}
    }
  }

  const expectedFiles = runtimeResult.sheets.map(sheet => (
    path.join(PROJECT_ROOT, sheet.image.replace(/^\//, ''))
  ))
  const actualFiles = []
  runtimeResult.assetPackages.forEach(assetPackage => {
    const rootPath = path.join(PROJECT_ROOT, assetPackage.root)
    listFiles(rootPath)
      .filter(filePath => filePath.endsWith('.svg'))
      .forEach(filePath => actualFiles.push(filePath))
  })

  const expectedSet = new Set(expectedFiles.map(filePath => path.resolve(filePath)))
  const actualSet = new Set(actualFiles.map(filePath => path.resolve(filePath)))
  const missing = [...expectedSet].filter(filePath => !actualSet.has(filePath))
  const extra = [...actualSet].filter(filePath => !expectedSet.has(filePath))
  if (missing.length) {
    fail(`缺少 ${missing.length} 个练习 SVG: ${missing.slice(0, 5).join(', ')}`)
  }
  if (extra.length) {
    fail(`存在 ${extra.length} 个未登记练习 SVG: ${extra.slice(0, 5).join(', ')}`)
  }

  runtimeResult.sheets.forEach(sheet => {
    const filePath = path.join(PROJECT_ROOT, sheet.image.replace(/^\//, ''))
    if (!fs.existsSync(filePath)) return
    const svg = fs.readFileSync(filePath, 'utf8')
    if (!svg.startsWith('<svg')) fail(`图集结构无效: ${sheet.image}`)
    if (/NaN|undefined/.test(svg)) fail(`图集含 NaN/undefined: ${sheet.image}`)
    if (svg.length < 100) fail(`图集内容异常短: ${sheet.image}`)

    const viewBox = svg.match(/\sviewBox="([^"]+)"/)
    const width = svg.match(/\swidth="([^"]+)"/)
    const height = svg.match(/\sheight="([^"]+)"/)
    if (!viewBox || !width || !height) {
      fail(`图集缺少 viewBox/width/height: ${sheet.image}`)
      return
    }
    const values = viewBox[1].trim().split(/\s+/).map(Number)
    if (
      values.length !== 4
      || values[0] !== 0
      || values[1] !== 0
      || Math.abs(values[2] - Number(sheet.width)) > 0.001
      || Math.abs(values[3] - Number(sheet.height)) > 0.001
    ) {
      fail(`图集 viewBox 与数据宽高不一致: ${sheet.image}`)
    }
    if (Math.abs(Number(width[1]) - Number(sheet.width) * 3) > 0.001) {
      fail(`图集 SVG width 与数据不一致: ${sheet.image}`)
    }
    if (Math.abs(Number(height[1]) - Number(sheet.height) * 3) > 0.001) {
      fail(`图集 SVG height 与数据不一致: ${sheet.image}`)
    }
  })

  const packageBytes = {}
  runtimeResult.assetPackages.forEach(assetPackage => {
    const rootPath = path.join(PROJECT_ROOT, assetPackage.root)
    const files = listFiles(rootPath)
    const actualBytes = sumBytes(files)
    packageBytes[assetPackage.root] = actualBytes
    if (actualBytes !== Number(assetPackage.bytes)) {
      fail(
        `${assetPackage.root}: 登记 ${assetPackage.bytes} B，实际 ${actualBytes} B`
      )
    }
    if (actualBytes >= PACKAGE_LIMIT) {
      fail(`${assetPackage.root}: ${actualBytes} B 达到或超过 2 MB`)
    }
    ;['js', 'json', 'wxml', 'wxss'].forEach(extension => {
      const loaderPath = path.join(
        rootPath,
        'pages/loader',
        `loader.${extension}`
      )
      if (!fs.existsSync(loaderPath)) {
        fail(`${assetPackage.root}: 缺少 pages/loader/loader.${extension}`)
      }
    })
  })

  return {
    count: actualFiles.length,
    bytes: sumBytes(actualFiles),
    packageBytes
  }
}

function validateReports(
  renderReport,
  auditReport,
  sourceResult,
  runtimeResult,
  svgResult
) {
  if (!renderReport) {
    fail('缺少练习渲染报告')
  } else {
    if (renderReport.formulas !== sourceResult.formulaMap.size) {
      fail(`渲染报告 formulas=${renderReport.formulas}，实际 ${sourceResult.formulaMap.size}`)
    }
    if (renderReport.questions !== runtimeResult.questions.length) {
      fail(`渲染报告 questions=${renderReport.questions}，实际 ${runtimeResult.questions.length}`)
    }
    if (renderReport.baseQuestionCount !== runtimeResult.baseQuestionCount) {
      fail(
        `渲染报告 baseQuestionCount=${renderReport.baseQuestionCount}，` +
        `实际 ${runtimeResult.baseQuestionCount}`
      )
    }
    if (renderReport.demoQuestionCount !== runtimeResult.demoQuestionCount) {
      fail(
        `渲染报告 demoQuestionCount=${renderReport.demoQuestionCount}，` +
        `实际 ${runtimeResult.demoQuestionCount}`
      )
    }
    if (renderReport.coveredFormulaIds !== sourceResult.formulaMap.size) {
      fail(
        `渲染报告 coveredFormulaIds=${renderReport.coveredFormulaIds}，` +
        `实际 ${sourceResult.formulaMap.size}`
      )
    }
    if (renderReport.expressions !== runtimeResult.expressionCount) {
      fail(
        `渲染报告 expressions=${renderReport.expressions}，` +
        `实际 ${runtimeResult.expressionCount}`
      )
    }
    if (renderReport.expressionReferences !== runtimeResult.expressionReferences) {
      fail(
        `渲染报告 expressionReferences=${renderReport.expressionReferences}，` +
        `实际 ${runtimeResult.expressionReferences}`
      )
    }
    if (renderReport.chapters !== sourceResult.chapterOrder.length) {
      fail(
        `渲染报告 chapters=${renderReport.chapters}，` +
        `实际 ${sourceResult.chapterOrder.length}`
      )
    }
    if (renderReport.sheets !== runtimeResult.sheets.length) {
      fail(`渲染报告 sheets=${renderReport.sheets}，实际 ${runtimeResult.sheets.length}`)
    }
    if (renderReport.assetBytes !== svgResult.bytes) {
      fail(`渲染报告 assetBytes=${renderReport.assetBytes}，实际 ${svgResult.bytes}`)
    }
    if (!Array.isArray(renderReport.failures) || renderReport.failures.length) {
      fail('渲染报告记录到失败')
    }
    if (!Array.isArray(renderReport.assetPackages)
      || renderReport.assetPackages.length !== runtimeResult.assetPackages.length) {
      fail('渲染报告资源分包数与运行数据不一致')
    } else {
      renderReport.assetPackages.forEach((reportedPackage, index) => {
        const runtimePackage = runtimeResult.assetPackages[index]
        if (!runtimePackage
          || reportedPackage.name !== runtimePackage.name
          || reportedPackage.root !== runtimePackage.root
          || reportedPackage.sheets !== runtimePackage.sheetIndexes.length
          || reportedPackage.bytes !== runtimePackage.bytes) {
          fail(`渲染报告资源分包 ${index + 1} 与运行数据不一致`)
        }
      })
    }
  }

  if (!auditReport) {
    fail('缺少题库独立审计报告')
  } else {
    if (auditReport.failureCount !== 0) {
      fail(`题库独立审计 failureCount=${auditReport.failureCount}`)
    }
    if (auditReport.formulas !== sourceResult.formulaMap.size) {
      fail(`题库审计 formulas=${auditReport.formulas} 与主数据不一致`)
    }
    if (auditReport.questions !== sourceResult.source.items.length) {
      fail(`题库审计 questions=${auditReport.questions} 与源题库不一致`)
    }
    if (auditReport.baseQuestionCount !== sourceResult.baseQuestionCount) {
      fail(`题库审计 baseQuestionCount=${auditReport.baseQuestionCount} 与源题库不一致`)
    }
    if (auditReport.demoQuestionCount !== sourceResult.demoQuestionCount) {
      fail(`题库审计 demoQuestionCount=${auditReport.demoQuestionCount} 与源题库不一致`)
    }
    if (auditReport.coveredFormulaIds !== sourceResult.formulaMap.size) {
      fail(`题库审计 coverage=${auditReport.coveredFormulaIds} 不完整`)
    }
    const auditedTypes = auditReport.typeCounts || {}
    Object.entries(sourceResult.typeCounts).forEach(([type, count]) => {
      if (auditedTypes[type] !== count) {
        fail(`题库审计 ${type}=${auditedTypes[type] || 0}，实际 ${count}`)
      }
    })
  }
}

function validateAppAndPages(appConfig) {
  if (!appConfig || !Array.isArray(appConfig.subPackages)) {
    fail('app.json 缺少 subPackages')
    return []
  }

  const practicePackage = appConfig.subPackages.find(
    item => item.root === 'practice-package'
  )
  if (!practicePackage) {
    fail('app.json 未注册 practice-package')
  } else {
    if (practicePackage.name !== 'practice') {
      fail('练习分包 name 应为 practice')
    }
    if (!Array.isArray(practicePackage.pages)
      || practicePackage.pages.indexOf('pages/session/choice') < 0) {
      fail('练习分包未注册 pages/session/choice')
    }
    if (practicePackage.pages.indexOf('pages/session/session') >= 0) {
      fail('练习分包仍在注册旧 pages/session/session')
    }
    if (practicePackage.independent) {
      fail('练习分包不应设为 independent')
    }
  }
  if (appConfig.pages.some(page => page.startsWith('practice-package/'))) {
    fail('练习页面不能同时注册在主包')
  }

  const choiceJs = readText(
    path.join(PRACTICE_ROOT, 'pages/session/choice.js')
  )
  const choiceWxml = readText(
    path.join(PRACTICE_ROOT, 'pages/session/choice.wxml')
  )
  const choiceJson = readJson(
    path.join(PRACTICE_ROOT, 'pages/session/choice.json')
  )
  const cropJs = readText(
    path.join(PRACTICE_ROOT, 'components/formula-crop/formula-crop.js')
  )
  const cropWxml = readText(
    path.join(PRACTICE_ROOT, 'components/formula-crop/formula-crop.wxml')
  )
  const practiceJs = readText(
    path.join(PROJECT_ROOT, 'pages/practice/practice.js')
  )
  const detailJs = readText(
    path.join(PROJECT_ROOT, 'pages/detail/detail.js')
  )

  if (!choiceJs.includes('wx.loadSubpackage')) {
    fail('choice.js 没有调用 wx.loadSubpackage')
  }
  if (!choiceJs.includes('PRACTICE_EXPRESSION_CROPS')) {
    fail('choice.js 没有使用表达式裁切协议')
  }
  if (!choiceJs.includes('stemExpressionId')) {
    fail('choice.js 没有使用 stemExpressionId')
  }
  if (!choiceJs.includes('recordedQuestionIds')) {
    fail('choice.js 缺少重复点击防重记录')
  }
  if (/PRACTICE_CROPS\b|formulaId\b|kind\s*[=:]\s*['"]base['"]/.test(choiceJs)) {
    fail('choice.js 仍含旧选择题协议标记')
  }
  if (choiceWxml.includes('<input') || choiceWxml.includes('fillValue')) {
    fail('choice.wxml 仍含填空输入界面')
  }
  if (!choiceJson
    || !choiceJson.usingComponents
    || choiceJson.usingComponents['formula-crop']
      !== '../../components/formula-crop/formula-crop') {
    fail('choice.json 的 formula-crop 组件注册错误')
  }
  if (!cropJs.includes('scrollable = !fit && naturalWidth > maxWidth')) {
    fail('formula-crop 缺少长公式横向滚动逻辑')
  }
  if (!cropWxml.includes('<scroll-view')
    || !cropWxml.includes('scroll-x')
    || !cropWxml.includes('mode="scaleToFill"')) {
    fail('formula-crop.wxml 的裁切/横滑结构不完整')
  }
  if (!cropWxml.includes('scroll-x="true"')
    || !cropWxml.includes('show-scrollbar="{{false}}"')
    || !cropWxml.includes('bindtouchstart="onScrollTouchStart"')
    || !cropWxml.includes('bindtouchmove="onScrollTouchMove"')) {
    fail('formula-crop.wxml 缺少原生横滑结构或手势事件')
  }
  if (cropWxml.includes('crop-nav')
    || cropWxml.includes('crop-scroll-meter')
    || cropJs.includes('scrollPage')
    || cropJs.includes('updateScrollState')) {
    fail('formula-crop 仍含左右三角按钮或滚动进度控件')
  }
  if (!practiceJs.includes('/practice-package/pages/session/choice')) {
    fail('练习设置页没有跳转到 choice')
  }
  if (!detailJs.includes('/practice-package/pages/session/choice')) {
    fail('公式详情页没有跳转到 choice')
  }
  if (practiceJs.includes('/pages/session/session')
    || detailJs.includes('/pages/session/session')) {
    fail('入口仍跳转旧 session 页')
  }

  const practiceWxml = readText(
    path.join(PROJECT_ROOT, 'pages/practice/practice.wxml')
  )
  ;[
    'activeMode',
    'modeOptions',
    'quizOptions',
    'fillValue',
    'symbolKeys',
    'submitFillAnswer',
    'started'
  ].forEach(token => {
    if (practiceWxml.includes(token)) fail(`练习设置页仍含旧界面标记 ${token}`)
  })

  const sessionDirectory = path.join(PRACTICE_ROOT, 'pages/session')
  ;['session.js', 'session.wxml', 'session.wxss', 'session.json']
    .forEach(fileName => {
      if (fs.existsSync(path.join(sessionDirectory, fileName))) {
        fail(`旧选择题文件仍存在: pages/session/${fileName}`)
      }
    })

  return appConfig.subPackages
}

function validatePackageSizes(subPackages, runtimeResult) {
  const projectFiles = listFiles(PROJECT_ROOT)
  const mainFiles = projectFiles.filter(
    filePath => !isInsideSubpackage(filePath, subPackages)
  )
  const mainBytes = sumBytes(mainFiles)
  const practiceFiles = listFiles(PRACTICE_ROOT)
  const practiceBytes = sumBytes(practiceFiles)

  if (mainBytes >= PACKAGE_LIMIT) fail(`主包 ${mainBytes} B 达到或超过 2 MB`)
  if (practiceBytes >= PACKAGE_LIMIT) {
    fail(`练习页面分包 ${practiceBytes} B 达到或超过 2 MB`)
  }
  if (PACKAGE_LIMIT - mainBytes < 100 * 1024) {
    warn(`主包仅剩 ${PACKAGE_LIMIT - mainBytes} B 余量`)
  }
  if (PACKAGE_LIMIT - practiceBytes < 100 * 1024) {
    warn(`练习页面分包仅剩 ${PACKAGE_LIMIT - practiceBytes} B 余量`)
  }

  const resourceBytes = {}
  ;(runtimeResult ? runtimeResult.assetPackages : []).forEach(assetPackage => {
    resourceBytes[assetPackage.root] = sumBytes(
      listFiles(path.join(PROJECT_ROOT, assetPackage.root))
    )
  })

  return {
    mainBytes,
    mainFiles: mainFiles.length,
    mainRemainingBytes: PACKAGE_LIMIT - mainBytes,
    practiceBytes,
    practiceFiles: practiceFiles.length,
    practiceRemainingBytes: PACKAGE_LIMIT - practiceBytes,
    resourceBytes
  }
}

function main() {
  const questionSource = readJson(QUESTIONS_PATH)
  const formulaSource = readJson(FORMULAS_PATH)
  const appConfig = readJson(APP_CONFIG_PATH)
  const renderReport = readJson(RENDER_REPORT_PATH)
  const auditReport = readJson(QUESTION_AUDIT_PATH)
  if (!questionSource || !formulaSource || !appConfig) {
    throw new Error('基础数据读取失败')
  }

  let practiceData = null
  try {
    practiceData = require(PRACTICE_DATA_PATH)
  } catch (error) {
    fail(`运行数据无法加载: ${error.message}`)
  }

  const sourceResult = validateSource(questionSource, formulaSource)
  const runtimeResult = sourceResult && appConfig
    ? validateRuntime(practiceData, sourceResult, appConfig)
    : null
  const svgResult = validateSvgAssets(runtimeResult)
  if (sourceResult && runtimeResult) {
    validateReports(
      renderReport,
      auditReport,
      sourceResult,
      runtimeResult,
      svgResult
    )
  }
  const subPackages = validateAppAndPages(appConfig)
  const packageResult = validatePackageSizes(subPackages, runtimeResult)

  const report = {
    generatedAt: new Date().toISOString(),
    formulas: formulaSource.items.length,
    questions: runtimeResult ? runtimeResult.questions.length : 0,
    baseQuestionCount: runtimeResult ? runtimeResult.baseQuestionCount : 0,
    demoQuestionCount: runtimeResult ? runtimeResult.demoQuestionCount : 0,
    coveredFormulaIds: sourceResult ? sourceResult.sourceCounts.size : 0,
    typeCounts: sourceResult ? sourceResult.typeCounts : {},
    correctOptionQuestions: runtimeResult ? runtimeResult.correctOptionCount : 0,
    expressions: runtimeResult ? runtimeResult.expressionCount : 0,
    expressionReferences: runtimeResult ? runtimeResult.expressionReferences : 0,
    chapters: sourceResult ? sourceResult.chapterOrder.length : 0,
    sheets: svgResult.count,
    sheetBytes: svgResult.bytes,
    practiceDataBytes: fs.existsSync(PRACTICE_DATA_PATH)
      ? fs.statSync(PRACTICE_DATA_PATH).size
      : 0,
    mainPackageBytes: packageResult.mainBytes,
    mainPackageFiles: packageResult.mainFiles,
    mainPackageRemainingBytes: packageResult.mainRemainingBytes,
    practicePagePackageBytes: packageResult.practiceBytes,
    practicePagePackageFiles: packageResult.practiceFiles,
    practicePagePackageRemainingBytes: packageResult.practiceRemainingBytes,
    resourcePackageBytes: packageResult.resourceBytes,
    loadSubpackageApi: true,
    legacyProtocolMarkers: 0,
    warnings,
    failures
  }

  fs.mkdirSync(path.dirname(VALIDATION_REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    VALIDATION_REPORT_PATH,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  )

  console.log(
    `覆盖: ${report.coveredFormulaIds}/${report.formulas} 条公式，` +
    `${report.questions} 道选择题（基础 ${report.baseQuestionCount} + ` +
    `示范 ${report.demoQuestionCount}）`
  )
  console.log(
    `题型: 整式重建 ${report.typeCounts.reconstruct || 0} / ` +
    `核心块挖空 ${report.typeCounts.blank || 0} / ` +
    `条件判断 ${report.typeCounts.condition || 0}`
  )
  console.log(
    `表达式: ${report.expressions} 个，引用 ${report.expressionReferences} 次，` +
    `唯一正确项 ${report.correctOptionQuestions}/${report.questions}`
  )
  console.log(`图集: ${report.sheets} 张 / ${report.sheetBytes} B`)
  console.log(
    `主包: ${report.mainPackageBytes} B，剩余 ${report.mainPackageRemainingBytes} B`
  )
  console.log(
    `练习页面分包: ${report.practicePagePackageBytes} B，` +
    `剩余 ${report.practicePagePackageRemainingBytes} B`
  )
  Object.entries(report.resourcePackageBytes).forEach(([root, bytes]) => {
    console.log(`资源分包 ${root}: ${bytes} B`)
  })
  console.log(`警告: ${warnings.length}`)
  console.log(`失败: ${failures.length}`)
  failures.slice(0, 30).forEach(message => console.error(`  - ${message}`))
  warnings.slice(0, 30).forEach(message => console.warn(`  ! ${message}`))
  console.log(`报告输出: ${VALIDATION_REPORT_PATH}`)

  if (failures.length) process.exitCode = 1
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
