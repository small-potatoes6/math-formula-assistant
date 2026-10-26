const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { buildFormulaAtoms } = require('./practice-source/formula-atoms')

const ROOT = path.resolve(__dirname, '..')
const PROJECT_ROOT = path.join(ROOT, '新建文件夹')
const PRACTICE_ROOT = path.join(PROJECT_ROOT, 'practice-package')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')
const PRACTICE_DATA_PATH = path.join(PRACTICE_ROOT, 'data/practice.js')
const RENDER_REPORT_PATH = path.join(ROOT, 'extract/build/practice-render-report.json')
const QUESTION_AUDIT_PATH = path.join(ROOT, 'extract/build/practice-question-audit.json')
const PACKAGE_LIMIT = 2 * 1024 * 1024
const ERROR_KINDS = new Set([
  '符号错误',
  '系数错误',
  '次数错误',
  '分母或根号错误',
  '漏条件',
  '相似公式混淆'
])

const formulaSource = JSON.parse(fs.readFileSync(FORMULAS_PATH, 'utf8'))
const questionSource = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
const appConfig = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'app.json'), 'utf8')
)
const renderReport = JSON.parse(fs.readFileSync(RENDER_REPORT_PATH, 'utf8'))
const questionAudit = JSON.parse(fs.readFileSync(QUESTION_AUDIT_PATH, 'utf8'))
const practiceData = require(PRACTICE_DATA_PATH)
const formulaMap = new Map(formulaSource.items.map(item => [item.id, item]))

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

function testSourceQuestions() {
  assert.strictEqual(formulaSource.items.length, 351)
  const formalQuestions = questionSource.items.filter(question => !question.demo)
  const demoQuestions = questionSource.items.filter(question => question.demo)
  assert.strictEqual(questionSource.items.length, 860)
  assert.strictEqual(formalQuestions.length, 830)
  assert.strictEqual(demoQuestions.length, 30)
  assert.strictEqual(questionSource.meta.questionCount, 860)
  assert.strictEqual(questionSource.meta.formalQuestionCount, 830)
  assert.strictEqual(questionSource.meta.baseQuestionCount, 830)
  assert.strictEqual(questionSource.meta.chapterCount, 16)
  assert.strictEqual(
    questionSource.meta.coveragePolicy,
    'every-base-question-covers-an-atom'
  )
  assert.strictEqual(questionSource.meta.fillPolicy, 'removed')

  const sourceCounts = new Map()
  const atomIds = new Set()
  const typeCounts = {}
  const questionIds = new Set()

  questionSource.items.forEach(question => {
    assert(question.id)
    assert(!questionIds.has(question.id), `${question.id}: duplicate question id`)
    questionIds.add(question.id)
    assert(
      new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id),
      `${question.id}: invalid question id`
    )
    const formula = formulaMap.get(question.sourceId)
    assert(formula, `${question.id}: unknown source formula`)
    assert.strictEqual(question.chapter, formula.chapter)
    assert.strictEqual(question.title, formula.name)
    assert(['reconstruct', 'blank', 'condition'].includes(question.type))
    assert(question.stemLatex.trim())
    assert(question.answerLatex.trim())
    assert(question.atomId.startsWith(`${question.sourceId}-atom-`))
    assert(['qa', 'completion'].includes(question.promptForm))
    if (question.type === 'blank') {
      assert.strictEqual(
        (question.stemLatex.match(/\\boxed\b/g) || []).length,
        1,
        `${question.id}: blank stem must contain exactly one boxed`
      )
    }
    assert.strictEqual(question.distractors.length, 3)

    const optionLatex = [
      question.answerLatex,
      ...question.distractors.map(item => item.latex)
    ].map(normalizeLatex)
    assert.strictEqual(
      new Set(optionLatex).size,
      4,
      `${question.id}: duplicate option LaTeX`
    )
    question.distractors.forEach(distractor => {
      assert(ERROR_KINDS.has(distractor.errorKind), `${question.id}: invalid error kind`)
      assert(distractor.error.trim(), `${question.id}: missing error text`)
    })

    if (!question.demo) {
      assert(!atomIds.has(question.atomId), `${question.atomId}: duplicate atom`)
      atomIds.add(question.atomId)
      sourceCounts.set(
        question.sourceId,
        (sourceCounts.get(question.sourceId) || 0) + 1
      )
    }
    typeCounts[question.type] = (typeCounts[question.type] || 0) + 1
  })

  const invalidCoverage = formulaSource.items
    .filter(formula => !sourceCounts.get(formula.id))
    .map(formula => formula.id)
  assert.deepStrictEqual(invalidCoverage, [])
  const expectedAtoms = formulaSource.items.flatMap(formula => (
    buildFormulaAtoms(formula)
  ))
  assert.strictEqual(expectedAtoms.length, 830)
  assert.deepStrictEqual(
    expectedAtoms.map(atom => atom.atomId).filter(id => !atomIds.has(id)),
    []
  )
  assert.strictEqual(atomIds.size, expectedAtoms.length)
  assert.deepStrictEqual(typeCounts, {
    condition: 194,
    reconstruct: 607,
    blank: 59
  })
  assert.deepStrictEqual(questionSource.meta.typeCounts, typeCounts)

  return {
    formulas: formulaSource.items.length,
    questions: questionSource.items.length,
    formalQuestions: formalQuestions.length,
    demoQuestions: demoQuestions.length,
    covered: sourceCounts.size,
    atoms: atomIds.size,
    typeCounts
  }
}

function testRuntimeExpressionsAndCrops() {
  assert.strictEqual(practiceData.PRACTICE_QUESTIONS.length, 860)
  const expectedExpressionIds = new Set()
  questionSource.items.forEach(question => {
    expectedExpressionIds.add(expressionIdFor(question.stemLatex))
    expectedExpressionIds.add(expressionIdFor(question.answerLatex))
    question.distractors.forEach(distractor => {
      expectedExpressionIds.add(expressionIdFor(distractor.latex))
    })
  })
  assert.strictEqual(
    Object.keys(practiceData.PRACTICE_EXPRESSION_CROPS).length,
    expectedExpressionIds.size
  )
  assert.strictEqual(practiceData.PRACTICE_SHEETS.length, 75)
  assert(practiceData.PRACTICE_ASSET_PACKAGES.length >= 2)
  assert.strictEqual(practiceData.PRACTICE_CROPS, undefined)

  const sourceMap = new Map(
    questionSource.items.map(question => [question.id, question])
  )
  const sheets = practiceData.PRACTICE_SHEETS
  const crops = practiceData.PRACTICE_EXPRESSION_CROPS
  const packages = practiceData.PRACTICE_ASSET_PACKAGES
  const packageBySheet = new Map()
  packages.forEach(assetPackage => {
    assert(assetPackage.sheetIndexes.length > 0)
    assetPackage.sheetIndexes.forEach(index => {
      assert(!packageBySheet.has(index), `sheet ${index}: assigned twice`)
      packageBySheet.set(index, assetPackage)
    })
  })
  assert.strictEqual(packageBySheet.size, sheets.length)

  const referencedExpressions = new Set()
  let optionCount = 0
  const visitedSources = new Set()

  practiceData.PRACTICE_QUESTIONS.forEach(question => {
    const source = sourceMap.get(question.id)
    assert(source, `${question.id}: no source question`)
    visitedSources.add(question.sourceId)
    assert.strictEqual(question.sourceId, source.sourceId)
    assert.strictEqual(question.chapter, source.chapter)
    assert.strictEqual(question.title, source.title)
    assert.strictEqual(question.type, source.type)
    assert.strictEqual(
      question.stemExpressionId,
      expressionIdFor(source.stemLatex),
      `${question.id}: stem expression mismatch`
    )
    referencedExpressions.add(question.stemExpressionId)

    const expectedOptionIds = [
      expressionIdFor(source.answerLatex),
      ...source.distractors.map(item => expressionIdFor(item.latex))
    ]
    assert.strictEqual(question.options.length, 4)
    assert.deepStrictEqual(
      question.options.map(option => option.expressionId),
      expectedOptionIds,
      `${question.id}: option order mapping mismatch`
    )
    assert.strictEqual(
      question.options.filter(option => option.isCorrect).length,
      1
    )
    assert.strictEqual(question.options[0].isCorrect, true)
    question.options.forEach(option => {
      assert(crops[option.expressionId], `${question.id}: missing option crop`)
      referencedExpressions.add(option.expressionId)
      optionCount += 1
    })
  })

  assert.strictEqual(visitedSources.size, 351)
  assert.deepStrictEqual(
    [...referencedExpressions].sort(),
    Object.keys(crops).sort()
  )

  Object.entries(crops).forEach(([expressionId, crop]) => {
    assert(/^e-[0-9a-f]{16}$/.test(expressionId))
    assert(Array.isArray(crop) && crop.length === 5)
    const [sheetIndex, x, y, width, height] = crop
    assert(Number.isInteger(sheetIndex))
    const sheet = sheets[sheetIndex]
    assert(sheet, `${expressionId}: invalid sheet index`)
    assert(x >= 0 && y >= 0 && width > 0 && height > 0)
    assert(x + width <= sheet.width)
    assert(y + height <= sheet.height)
    const assetPackage = packageBySheet.get(sheetIndex)
    assert(assetPackage)
    assert.strictEqual(sheet.packageName, assetPackage.name)
    assert(sheet.image.startsWith(`/${assetPackage.root}/assets/practice/`))
    assert(fs.existsSync(path.join(PROJECT_ROOT, sheet.image.replace(/^\//, ''))))
  })

  return {
    questions: practiceData.PRACTICE_QUESTIONS.length,
    options: optionCount,
    expressions: referencedExpressions.size,
    sheets: sheets.length,
    packages: packages.length
  }
}

function testSvgAndPackageSizes() {
  const assetFiles = []
  const packageBytes = {}
  practiceData.PRACTICE_ASSET_PACKAGES.forEach(assetPackage => {
    const root = path.join(PROJECT_ROOT, assetPackage.root)
    const files = listFiles(root)
    const bytes = sumBytes(files)
    packageBytes[assetPackage.root] = bytes
    assert.strictEqual(bytes, assetPackage.bytes)
    assert(bytes < PACKAGE_LIMIT, `${assetPackage.root}: ${bytes} B reaches 2 MB`)
    files.filter(filePath => filePath.endsWith('.svg')).forEach(filePath => {
      assetFiles.push(filePath)
      const svg = fs.readFileSync(filePath, 'utf8')
      assert(svg.startsWith('<svg'))
      assert(!/NaN|undefined/.test(svg), `${filePath}: invalid SVG`)
    })
  })
  assert.strictEqual(assetFiles.length, practiceData.PRACTICE_SHEETS.length)
  assert.strictEqual(sumBytes(assetFiles), renderReport.assetBytes)

  const subpackageRoots = appConfig.subPackages.map(item => item.root)
  const projectFiles = listFiles(PROJECT_ROOT)
  const mainFiles = projectFiles.filter(filePath => {
    const relative = path.relative(PROJECT_ROOT, filePath).split(path.sep).join('/')
    return !subpackageRoots.some(root => (
      relative === root || relative.startsWith(`${root}/`)
    ))
  })
  const mainBytes = sumBytes(mainFiles)
  const practiceBytes = sumBytes(listFiles(PRACTICE_ROOT))
  assert(mainBytes < PACKAGE_LIMIT)
  assert(practiceBytes < PACKAGE_LIMIT)

  return {
    mainBytes,
    practiceBytes,
    packageBytes,
    svgBytes: sumBytes(assetFiles)
  }
}

function testReportsAndAppConfig() {
  assert.strictEqual(questionAudit.failureCount, 0)
  assert.strictEqual(questionAudit.warningCount, 0)
  assert.strictEqual(renderReport.failures.length, 0)
  assert.strictEqual(renderReport.formulas, 351)
  assert.strictEqual(renderReport.questions, 860)
  assert.strictEqual(renderReport.formalQuestionCount, 830)
  assert.strictEqual(renderReport.demoQuestionCount, 30)
  assert.strictEqual(renderReport.coveredFormulaIds, 351)
  assert.strictEqual(renderReport.coveredAtomIds, 830)
  assert.strictEqual(
    renderReport.expressions,
    Object.keys(practiceData.PRACTICE_EXPRESSION_CROPS).length
  )
  assert.strictEqual(
    renderReport.expressionReferences,
    questionSource.items.length * 5
  )
  assert.strictEqual(renderReport.sheets, 75)

  const practicePackage = appConfig.subPackages.find(
    item => item.root === 'practice-package'
  )
  assert(practicePackage)
  assert.strictEqual(practicePackage.name, 'practice')
  assert.deepStrictEqual(practicePackage.pages, ['pages/session/choice'])
  assert.strictEqual(Boolean(practicePackage.independent), false)
  assert(!appConfig.pages.some(page => page.startsWith('practice-package/')))

  practiceData.PRACTICE_ASSET_PACKAGES.forEach(assetPackage => {
    const registered = appConfig.subPackages.find(
      item => item.name === assetPackage.name
    )
    assert(registered, `${assetPackage.name}: not registered`)
    assert.strictEqual(registered.root, assetPackage.root)
    assert.deepStrictEqual(registered.pages, ['pages/loader/loader'])
  })

  const choiceWxml = fs.readFileSync(
    path.join(PRACTICE_ROOT, 'pages/session/choice.wxml'),
    'utf8'
  )
  const choiceJs = fs.readFileSync(
    path.join(PRACTICE_ROOT, 'pages/session/choice.js'),
    'utf8'
  )
  assert(!choiceWxml.includes('<input'))
  assert(!choiceWxml.includes('fillValue'))
  assert(!choiceWxml.includes('symbolKeys'))
  assert(!choiceWxml.includes('submitFillAnswer'))
  assert(choiceJs.includes('wx.loadSubpackage'))
  assert(choiceJs.includes('sessionResults'))
  assert(choiceJs.includes('finalizeResults'))
  assert(!/PRACTICE_CROPS\b|formulaId\b/.test(choiceJs))

  return {
    questionAuditFailures: questionAudit.failureCount,
    questionAuditWarnings: questionAudit.warningCount,
    renderFailures: renderReport.failures.length,
    registeredPracticePackages: practiceData.PRACTICE_ASSET_PACKAGES.length
  }
}

function main() {
  const source = testSourceQuestions()
  const runtime = testRuntimeExpressionsAndCrops()
  const sizes = testSvgAndPackageSizes()
  const reports = testReportsAndAppConfig()
  console.log(JSON.stringify({
    source,
    runtime,
    sizes,
    reports,
    failures: 0
  }, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
