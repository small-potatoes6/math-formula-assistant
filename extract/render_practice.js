/*
 * Render every stem and choice expression into deduplicated SVG sheets.
 *
 * Runtime questions use expression IDs, never main formula IDs as choices.
 * Sheets are grouped into independent resource subpackages below 2 MB and
 * loaded by hidden package anchors, with wx.loadSubpackage as an optional
 * acceleration channel.
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MJ = path.join(ROOT, 'tools/mathjax/node_modules/mathjax-full/js')
const { mathjax } = require(path.join(MJ, 'mathjax.js'))
const { TeX } = require(path.join(MJ, 'input/tex.js'))
const { SVG } = require(path.join(MJ, 'output/svg.js'))
const { liteAdaptor } = require(path.join(MJ, 'adaptors/liteAdaptor.js'))
const { RegisterHTMLHandler } = require(path.join(MJ, 'handlers/html.js'))
const { AllPackages } = require(path.join(MJ, 'input/tex/AllPackages.js'))

const PROJECT_ROOT = path.join(ROOT, '新建文件夹')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const PRACTICE_ROOT = path.join(PROJECT_ROOT, 'practice-package')
const PRACTICE_LEGACY_ASSET_ROOT = path.join(PRACTICE_ROOT, 'assets/practice')
const DATA_OUT = path.join(PRACTICE_ROOT, 'data/practice.js')
const META_OUT = path.join(PROJECT_ROOT, 'utils/practice-meta.js')
const APP_CONFIG_PATH = path.join(PROJECT_ROOT, 'app.json')
const CHOICE_WXML_PATH = path.join(
  PRACTICE_ROOT,
  'pages/session/choice.wxml'
)
const CHOICE_JSON_PATH = path.join(
  PRACTICE_ROOT,
  'pages/session/choice.json'
)
const REPORT_OUT = path.join(ROOT, 'extract/build/practice-render-report.json')

const PACKAGE_LIMIT = 2 * 1024 * 1024
const PACKAGE_HEADROOM = 8 * 1024
const SHEET_TARGET_EXPRESSIONS = 48
const MAX_SHEET_BYTES = 1536 * 1024
const SHEET_WIDTH = 4600
const SHEET_GAP = 12
const EM_PX = 17
const OUTPUT_SCALE = 3
const PADDING_X = 8
const PADDING_Y = 6
const COLOR_MAIN = '#211d18'
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

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({
  packages: AllPackages,
  inlineMath: [['$', '$']],
  displayMath: [['$$', '$$']]
})

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function writeFileIfChanged(filePath, content) {
  const next = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
  if (fs.existsSync(filePath)) {
    const current = fs.readFileSync(filePath)
    if (current.equals(next)) return false
  }
  ensureParent(filePath)
  try {
    fs.writeFileSync(filePath, next)
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      throw new Error(
        `无法写入 ${filePath}。请先关闭微信开发者工具或关闭当前项目后重试。`
      )
    }
    throw error
  }
  return true
}

function removeDirectoryIfSafe(target, allowedParent, namePrefix) {
  const resolved = path.resolve(target)
  const parent = path.resolve(allowedParent)
  if (
    path.dirname(resolved) !== parent
    || !path.basename(resolved).startsWith(namePrefix)
  ) {
    throw new Error(`拒绝清理非练习资源路径: ${resolved}`)
  }
  if (!fs.existsSync(resolved)) return
  try {
    fs.rmSync(resolved, { recursive: true, force: true })
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      throw new Error(
        `无法清理旧资源 ${resolved}。请先关闭微信开发者工具后重试。`
      )
    }
    throw error
  }
}

function removePracticeLegacyAssets() {
  const resolved = path.resolve(PRACTICE_LEGACY_ASSET_ROOT)
  const expected = path.resolve(PRACTICE_ROOT, 'assets/practice')
  if (resolved !== expected) {
    throw new Error(`拒绝清理非练习旧资源路径: ${resolved}`)
  }
  if (!fs.existsSync(resolved)) return
  try {
    fs.rmSync(resolved, { recursive: true, force: true })
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      throw new Error(
        `无法清理旧练习图集。请先关闭微信开发者工具后重试: ${resolved}`
      )
    }
    throw error
  }
}

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
}

function expressionIdFor(latex) {
  return `e-${crypto.createHash('sha1').update(latex, 'utf8').digest('hex').slice(0, 16)}`
}

function extractOuterSvg(html) {
  const start = html.indexOf('<svg')
  if (start < 0) throw new Error('MathJax did not return SVG')
  const tagPattern = /<\/?svg\b[^>]*>/g
  tagPattern.lastIndex = start
  let depth = 0
  let match
  while ((match = tagPattern.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1
    if (depth === 0) return html.slice(start, tagPattern.lastIndex)
  }
  throw new Error('MathJax returned an unbalanced SVG')
}

function optimizeSvg(source) {
  const idMap = new Map()
  let idIndex = 0
  let optimized = source.replace(/\sid="([^"]+)"/g, (match, id) => {
    if (!idMap.has(id)) {
      idIndex += 1
      idMap.set(id, `a${idIndex}`)
    }
    return ` id="${idMap.get(id)}"`
  })
  optimized = optimized.replace(
    /xlink:href="#([^"]+)"/g,
    (match, id) => `xlink:href="#${idMap.get(id) || id}"`
  )
  return optimized
    .replace(/\sdata-[a-z0-9-]+="[^"]*"/gi, '')
    .replace(/\srole="[^"]*"/g, '')
    .replace(/\sfocusable="[^"]*"/g, '')
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

function renderExpression(doc, latex) {
  const expression = `\\displaystyle ${latex}`
  const node = doc.convert(expression, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 100000
  })
  const source = extractOuterSvg(adaptor.outerHTML(node))
  const viewBoxMatch = source.match(/\sviewBox="([^"]+)"/)
  if (!viewBoxMatch) throw new Error('Invalid MathJax SVG')

  const [minX, minY, viewBoxWidth, viewBoxHeight] = viewBoxMatch[1]
    .trim()
    .split(/\s+/)
    .map(Number)
  if (![minX, minY, viewBoxWidth, viewBoxHeight].every(Number.isFinite)) {
    throw new Error('MathJax returned a non-numeric viewBox')
  }

  const bodyStart = source.indexOf('>') + 1
  const bodyEnd = source.lastIndexOf('</svg>')
  const body = source.slice(bodyStart, bodyEnd)
  const scale = EM_PX / 1000
  const width = Math.ceil(viewBoxWidth * scale + PADDING_X * 2)
  const height = Math.ceil(viewBoxHeight * scale + PADDING_Y * 2)
  const transform =
    `translate(${PADDING_X} ${PADDING_Y}) scale(${scale}) ` +
    `translate(${-minX} ${-minY})`
  return { body, transform, width, height }
}

function packItems(items) {
  const widest = items.reduce((max, item) => Math.max(max, item.width), 0)
  const width = Math.max(SHEET_WIDTH, widest + SHEET_GAP * 2)
  let x = SHEET_GAP
  let y = SHEET_GAP
  let rowHeight = 0
  const placed = items.map(item => {
    if (x > SHEET_GAP && x + item.width + SHEET_GAP > width) {
      x = SHEET_GAP
      y += rowHeight + SHEET_GAP
      rowHeight = 0
    }
    const result = { ...item, x, y }
    x += item.width + SHEET_GAP
    rowHeight = Math.max(rowHeight, item.height)
    return result
  })
  return {
    items: placed,
    width,
    height: y + rowHeight + SHEET_GAP
  }
}

function buildSheet(expressions) {
  if (!expressions.length) throw new Error('cannot build an empty expression sheet')
  const sheetOutput = new SVG({ fontCache: 'global', scale: 1 })
  const sheetDoc = mathjax.document('', { InputJax: tex, OutputJax: sheetOutput })
  const items = expressions.map(expression => {
    try {
      return {
        ...expression,
        ...renderExpression(sheetDoc, expression.latex)
      }
    } catch (error) {
      throw new Error(`${expression.id}: ${error.message}`)
    }
  })
  const packed = packItems(items)
  const defs = adaptor.outerHTML(sheetOutput.fontCache.getCache())
  const groups = packed.items.map(item => (
    `<g transform="translate(${item.x} ${item.y})">` +
    `<g transform="${item.transform}">${item.body}</g></g>`
  )).join('')
  const svg = optimizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${packed.width * OUTPUT_SCALE}" height="${packed.height * OUTPUT_SCALE}" ` +
    `viewBox="0 0 ${packed.width} ${packed.height}" color="${COLOR_MAIN}">` +
    `${defs}${groups}</svg>`
  )
  const buffer = Buffer.from(svg, 'utf8')
  return {
    items: packed.items.map(item => ({
      expressionId: item.id,
      latex: item.latex,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height
    })),
    width: packed.width,
    height: packed.height,
    buffer,
    bytes: buffer.length,
    expressions: expressions.length
  }
}

function buildSheetsRecursively(expressions, output, depth = 0) {
  for (
    let start = 0;
    start < expressions.length;
    start += SHEET_TARGET_EXPRESSIONS
  ) {
    const batch = expressions.slice(start, start + SHEET_TARGET_EXPRESSIONS)
    const built = buildSheet(batch)
    if (built.bytes > MAX_SHEET_BYTES && batch.length > 1) {
      const midpoint = Math.ceil(batch.length / 2)
      console.log(
        `${'  '.repeat(depth)}sheet is ${built.bytes} B; splitting ${batch.length} expressions`
      )
      buildSheetsRecursively(batch.slice(0, midpoint), output, depth + 1)
      buildSheetsRecursively(batch.slice(midpoint), output, depth + 1)
      continue
    }
    output.push(built)
    console.log(
      `${'  '.repeat(depth)}sheet ${output.length}: ` +
      `${batch.length} expressions, ${built.bytes} B, ` +
      `${built.width}x${built.height}`
    )
  }
}

const LOADER_FILES = {
  'loader.js': `Page({})\n`,
  'loader.json': `{\n  "navigationStyle": "custom",\n  "disableScroll": true\n}\n`,
  'loader.wxml': `<view class="loader-bridge"></view>\n`,
  'loader.wxss': `page { background: #f5f6f8; }\n.loader-bridge { min-height: 100vh; }\n`
}

const LOADER_BYTES = Object.values(LOADER_FILES)
  .reduce((sum, content) => sum + Buffer.byteLength(content, 'utf8'), 0)

const ANCHOR_FILES = {
  'anchor.js':
    `// 分包就绪锚点：组件被真实创建即代表资源分包已完成下载。\n` +
    `Component({\n` +
    `  ready() {\n` +
    `    this.triggerEvent('packageready')\n` +
    `  }\n` +
    `})\n`,
  'anchor.json': `{\n  "component": true\n}\n`,
  'anchor.wxml': `<view class="package-anchor"></view>\n`,
  'anchor.wxss': `.package-anchor {\n  height: 0;\n  overflow: hidden;\n}\n`
}

const ANCHOR_BYTES = Object.values(ANCHOR_FILES)
  .reduce((sum, content) => sum + Buffer.byteLength(content, 'utf8'), 0)
const PACKAGE_FIXED_BYTES = LOADER_BYTES + ANCHOR_BYTES

function packageLetter(index) {
  if (index < 0 || index >= 26) {
    throw new Error('练习资源分包超过 26 个，无法分配名称')
  }
  return String.fromCharCode(65 + index)
}

function groupSheetsIntoPackages(sheets) {
  const budget = PACKAGE_LIMIT - PACKAGE_HEADROOM - PACKAGE_FIXED_BYTES
  const groups = []
  let current = []
  let bytes = 0
  sheets.forEach(sheet => {
    if (sheet.bytes > budget) {
      throw new Error(`单个图集 ${sheet.bytes} B 已超过分包余量 ${budget} B`)
    }
    if (current.length && bytes + sheet.bytes > budget) {
      groups.push({ sheets: current, bytes })
      current = []
      bytes = 0
    }
    current.push(sheet)
    bytes += sheet.bytes
  })
  if (current.length) groups.push({ sheets: current, bytes })
  return groups.map((group, index) => {
    const letter = packageLetter(index)
    return {
      ...group,
      name: `practiceAssets${letter}`,
      root: `practice-assets-${letter.toLowerCase()}`,
      totalBytes: group.bytes + PACKAGE_FIXED_BYTES
    }
  })
}

function addExpression(expressionMap, latex, context) {
  const normalized = normalizeLatex(latex)
  if (!normalized) throw new Error(`${context}: empty expression`)
  const id = expressionIdFor(normalized)
  const existing = expressionMap.get(id)
  if (existing && existing.latex !== normalized) {
    throw new Error(`${context}: SHA1 collision for ${id}`)
  }
  if (!existing) expressionMap.set(id, { id, latex: normalized })
  return id
}

function validateQuestions(questionSource, formulaSource, expressionMap) {
  if (!questionSource || !Array.isArray(questionSource.items)) {
    throw new Error('题库缺少 items 数组')
  }
  if (!formulaSource || !Array.isArray(formulaSource.items)) {
    throw new Error('公式库缺少 items 数组')
  }

  const formulaMap = new Map(formulaSource.items.map(item => [item.id, item]))
  const formalBySource = new Map()
  const formalByAtom = new Map()
  const questionById = new Map()
  let formalQuestionCount = 0
  let demoQuestionCount = 0

  questionSource.items.forEach(question => {
    if (!question.id || !question.sourceId) {
      throw new Error('题目缺少 id 或 sourceId')
    }
    const isDemo = question.demo === true
    if (questionById.has(question.id)) {
      throw new Error(`${question.id}: duplicate question id`)
    }
    questionById.set(question.id, question)
    if (isDemo) {
      demoQuestionCount += 1
    } else {
      formalQuestionCount += 1
      if (!formalBySource.has(question.sourceId)) {
        formalBySource.set(question.sourceId, [])
      }
      formalBySource.get(question.sourceId).push(question)
      if (!normalizeLatex(question.atomId)) {
        throw new Error(`${question.id}: formal question is missing atomId`)
      }
      if (formalByAtom.has(question.atomId)) {
        throw new Error(
          `${question.id}: atom ${question.atomId} already covered by ` +
          formalByAtom.get(question.atomId)
        )
      }
      formalByAtom.set(question.atomId, question.id)
    }
    const formula = formulaMap.get(question.sourceId)
    if (!formula) throw new Error(`${question.sourceId}: unknown formula`)
    if (question.chapter !== formula.chapter) {
      throw new Error(`${question.sourceId}: question chapter mismatch`)
    }
    if (question.title !== formula.name) {
      throw new Error(`${question.sourceId}: question title mismatch`)
    }
    if (!new RegExp(`^P-${question.sourceId}-\\d{2,}$`).test(question.id)) {
      throw new Error(`${question.id}: invalid question id`)
    }
    if (!normalizeLatex(question.atomId)) {
      throw new Error(`${question.id}: question is missing atomId`)
    }
    if (!question.atomId.startsWith(`${question.sourceId}-atom-`)) {
      throw new Error(`${question.id}: atomId does not belong to ${question.sourceId}`)
    }
    if (!PROMPT_FORMS.has(question.promptForm)) {
      throw new Error(`${question.id}: invalid promptForm`)
    }
    if (!Array.isArray(question.distractors) || question.distractors.length !== 3) {
      throw new Error(`${question.sourceId}: expected exactly 3 distractors`)
    }

    const optionLatex = [
      question.answerLatex,
      ...question.distractors.map(item => item.latex)
    ].map(normalizeLatex)
    if (optionLatex.some(value => !value)) {
      throw new Error(`${question.sourceId}: empty answer or distractor`)
    }
    if (new Set(optionLatex).size !== 4) {
      throw new Error(`${question.sourceId}: duplicate option expression`)
    }
    question.distractors.forEach((distractor, index) => {
      if (!ERROR_KINDS.has(distractor.errorKind)) {
        throw new Error(`${question.sourceId}: invalid error kind on distractor ${index + 1}`)
      }
      if (!normalizeLatex(distractor.error)) {
        throw new Error(`${question.sourceId}: empty error text on distractor ${index + 1}`)
      }
    })
  })

  const missing = formulaSource.items
    .filter(formula => !formalBySource.has(formula.id))
    .map(formula => formula.id)
  if (missing.length) throw new Error(`Missing formal questions: ${missing.join(', ')}`)
  if (demoQuestionCount !== DEMO_QUESTION_COUNT) {
    throw new Error(
      `Demo question count ${demoQuestionCount} does not match ` +
      `${DEMO_QUESTION_COUNT}`
    )
  }
  if (questionSource.items.length !== formalQuestionCount + demoQuestionCount) {
    throw new Error('Question count does not match formal plus demo questions')
  }
  if (!questionSource.meta
    || questionSource.meta.baseQuestionCount !== formalQuestionCount
    || questionSource.meta.formalQuestionCount !== formalQuestionCount
    || questionSource.meta.demoQuestionCount !== demoQuestionCount
    || questionSource.meta.questionCount !== questionSource.items.length
    || questionSource.meta.coveragePolicy !== COVERAGE_POLICY
    || questionSource.meta.coveredFormulaCount !== formalBySource.size
    || questionSource.meta.atomCount !== formalByAtom.size
    || questionSource.meta.coveredAtomCount !== formalByAtom.size) {
    throw new Error('Question meta does not match the atom coverage contract')
  }

  questionById.forEach(question => {
    if (!question.variantOf) return
    const target = questionById.get(question.variantOf)
    if (!target) {
      throw new Error(`${question.id}: variantOf target does not exist`)
    }
    if (target.sourceId !== question.sourceId
      || target.atomId !== question.atomId
      || target.promptForm === question.promptForm) {
      throw new Error(`${question.id}: variantOf must target another form of the same atom`)
    }
  })

  questionSource.items.forEach(question => {
    addExpression(expressionMap, question.stemLatex, `${question.id} stem`)
    addExpression(expressionMap, question.answerLatex, `${question.id} answer`)
    question.distractors.forEach((distractor, index) => {
      addExpression(
        expressionMap,
        distractor.latex,
        `${question.id} distractor ${index + 1}`
      )
    })
  })

  return {
    formulaMap,
    formalBySource,
    formalByAtom,
    formalQuestionCount,
    demoQuestionCount
  }
}

function createRuntimeQuestions(questionSource, expressionMap) {
  return questionSource.items.map(question => {
    const stemExpressionId = addExpression(
      expressionMap,
      question.stemLatex,
      `${question.id} stem`
    )
    const answerExpressionId = addExpression(
      expressionMap,
      question.answerLatex,
      `${question.id} answer`
    )
    const options = [
      {
        expressionId: answerExpressionId,
        isCorrect: true,
        errorKind: '',
        error: ''
      },
      ...question.distractors.map((distractor, index) => ({
        expressionId: addExpression(
          expressionMap,
          distractor.latex,
          `${question.id} distractor ${index + 1}`
        ),
        isCorrect: false,
        errorKind: distractor.errorKind,
        error: distractor.error
      }))
    ]
    return {
      id: question.id,
      sourceId: question.sourceId,
      chapter: question.chapter,
      title: question.title,
      type: question.type,
      demo: question.demo === true,
      atomId: question.atomId || '',
      promptForm: question.promptForm || '',
      stemExpressionId,
      options
    }
  })
}

function updateAppConfig(assetPackages) {
  const appConfig = JSON.parse(fs.readFileSync(APP_CONFIG_PATH, 'utf8'))
  if (!Array.isArray(appConfig.subPackages)) {
    throw new Error('app.json 缺少 subPackages')
  }
  const preserved = appConfig.subPackages.filter(item => (
    !String(item.root || '').startsWith('practice-assets-')
  ))
  const practiceIndex = preserved.findIndex(item => item.root === 'practice-package')
  if (practiceIndex < 0) {
    throw new Error('app.json 未注册 practice-package')
  }
  const entries = assetPackages.map(assetPackage => ({
    root: assetPackage.root,
    name: assetPackage.name,
    pages: ['pages/loader/loader']
  }))
  preserved.splice(practiceIndex, 0, ...entries)
  appConfig.subPackages = preserved
  writeFileIfChanged(
    APP_CONFIG_PATH,
    `${JSON.stringify(appConfig, null, 2)}\n`
  )
}

function syncChoiceAssetAnchors(assetPackages) {
  const startMarker = '<!-- practice-asset-anchors:start -->'
  const endMarker = '<!-- practice-asset-anchors:end -->'
  const choiceWxml = fs.readFileSync(CHOICE_WXML_PATH, 'utf8')
  const markerPattern = new RegExp(
    `${startMarker}[\\s\\S]*?${endMarker}`
  )
  if (!markerPattern.test(choiceWxml)) {
    throw new Error('choice.wxml 缺少资源分包锚点标记')
  }
  const anchors = assetPackages.map((assetPackage, index) => {
    const letter = packageLetter(index).toLowerCase()
    return [
      `    <practice-asset-anchor-${letter}`,
      `      data-package-name="${assetPackage.name}"`,
      '      bind:packageready="onAssetPackageReady"',
      '    />'
    ].join('\n')
  })
  const nextWxml = choiceWxml.replace(
    markerPattern,
    `${startMarker}\n${anchors.join('\n')}\n    ${endMarker}`
  )
  writeFileIfChanged(CHOICE_WXML_PATH, nextWxml)

  const choiceJson = JSON.parse(fs.readFileSync(CHOICE_JSON_PATH, 'utf8'))
  choiceJson.usingComponents = choiceJson.usingComponents || {}
  choiceJson.componentPlaceholder = choiceJson.componentPlaceholder || {}
  Object.keys(choiceJson.usingComponents)
    .filter(key => key.startsWith('practice-asset-anchor-'))
    .forEach(key => {
      delete choiceJson.usingComponents[key]
    })
  Object.keys(choiceJson.componentPlaceholder)
    .filter(key => key.startsWith('practice-asset-anchor-'))
    .forEach(key => {
      delete choiceJson.componentPlaceholder[key]
    })
  assetPackages.forEach((assetPackage, index) => {
    const name = `practice-asset-anchor-${packageLetter(index).toLowerCase()}`
    choiceJson.usingComponents[name] = `/${assetPackage.root}/components/anchor/anchor`
    choiceJson.componentPlaceholder[name] = 'anchor-placeholder'
  })
  writeFileIfChanged(
    CHOICE_JSON_PATH,
    `${JSON.stringify(choiceJson, null, 2)}\n`
  )
}

function writeAssetPackages(assetPackages) {
  assetPackages.forEach(assetPackage => {
    const packageRoot = path.join(PROJECT_ROOT, assetPackage.root)
    const assetDir = path.join(packageRoot, 'assets/practice')
    const loaderDir = path.join(packageRoot, 'pages/loader')
    const anchorDir = path.join(packageRoot, 'components/anchor')
    fs.mkdirSync(assetDir, { recursive: true })
    fs.mkdirSync(loaderDir, { recursive: true })
    fs.mkdirSync(anchorDir, { recursive: true })
    Object.entries(LOADER_FILES).forEach(([name, content]) => {
      writeFileIfChanged(path.join(loaderDir, name), content)
    })
    Object.entries(ANCHOR_FILES).forEach(([name, content]) => {
      writeFileIfChanged(path.join(anchorDir, name), content)
    })
  })
}

function cleanGeneratedPackages() {
  fs.readdirSync(PROJECT_ROOT, { withFileTypes: true })
    .filter(entry => (
      entry.isDirectory() && entry.name.startsWith('practice-assets-')
    ))
    .forEach(entry => {
      removeDirectoryIfSafe(
        path.join(PROJECT_ROOT, entry.name),
        PROJECT_ROOT,
        'practice-assets-'
      )
    })
}

function main() {
  const questionSource = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'))
  const formulaSource = JSON.parse(fs.readFileSync(FORMULAS_PATH, 'utf8'))
  const expressionMap = new Map()
  validateQuestions(questionSource, formulaSource, expressionMap)
  const runtimeQuestions = createRuntimeQuestions(questionSource, expressionMap)

  const expressions = [...expressionMap.values()]
  const rawSheets = []
  console.log(`渲染 ${expressions.length} 个去重公式表达式...`)
  buildSheetsRecursively(expressions, rawSheets)
  const groups = groupSheetsIntoPackages(rawSheets)
  const assetPackages = []
  const sheets = []

  let sheetIndex = 0
  groups.forEach(group => {
    const assetPackage = {
      name: group.name,
      root: group.root,
      sheetIndexes: [],
      bytes: PACKAGE_FIXED_BYTES
    }
    group.sheets.forEach(sheet => {
      const fileName = `sheet-${String(sheetIndex + 1).padStart(3, '0')}.svg`
      const image = `/${group.root}/assets/practice/${fileName}`
      const runtimeSheet = {
        image,
        width: sheet.width,
        height: sheet.height,
        packageName: group.name
      }
      sheets.push(runtimeSheet)
      assetPackage.sheetIndexes.push(sheetIndex)
      assetPackage.bytes += sheet.bytes
      sheetIndex += 1
      Object.assign(sheet, {
        ...runtimeSheet,
        fileName,
        packageRoot: group.root,
        sheetIndex: sheetIndex - 1
      })
    })
    assetPackages.push(assetPackage)
  })

  const crops = {}
  sheets.forEach(() => {})
  const sheetItems = new Map()
  groups.forEach(group => {
    group.sheets.forEach(sheet => {
      sheetItems.set(sheet.sheetIndex, sheet.items)
    })
  })
  expressions.forEach(expression => {
    let found = null
    sheetItems.forEach((items, index) => {
      if (found) return
      const item = items.find(entry => entry.expressionId === expression.id)
      if (!item) return
      found = [
        index,
        item.x,
        item.y,
        item.width,
        item.height
      ]
    })
    if (!found) throw new Error(`${expression.id}: missing crop`)
    crops[expression.id] = found
  })

  cleanGeneratedPackages()
  removePracticeLegacyAssets()
  writeAssetPackages(assetPackages)
  rawSheets.forEach(sheet => {
    writeFileIfChanged(
      path.join(
        PROJECT_ROOT,
        sheet.image.replace(/^\//, '')
      ),
      sheet.buffer
    )
  })
  updateAppConfig(assetPackages)
  syncChoiceAssetAnchors(assetPackages)

  const chapters = [...new Set(formulaSource.items.map(item => item.chapter))]
  const formalQuestions = runtimeQuestions.filter(item => !item.demo)
  const demoQuestions = runtimeQuestions.filter(item => item.demo)
  const practiceMeta = {
    formulaCount: formulaSource.items.length,
    formalQuestionCount: formalQuestions.length,
    demoQuestionCount: demoQuestions.length,
    questionCount: runtimeQuestions.length,
    atomCount: new Set(formalQuestions.map(item => item.atomId)).size
  }
  const metaData = `// Generated by extract/render_practice.js. Do not edit manually.
module.exports = ${JSON.stringify(practiceMeta, null, 2)};
`
  const data = `// Generated by extract/render_practice.js. Do not edit manually.
const PRACTICE_SHEETS = ${JSON.stringify(sheets)};

const PRACTICE_EXPRESSION_CROPS = ${JSON.stringify(crops)};

const PRACTICE_QUESTIONS = ${JSON.stringify(runtimeQuestions)};

const PRACTICE_CHAPTERS = ${JSON.stringify(chapters)};

const PRACTICE_ASSET_PACKAGES = ${JSON.stringify(assetPackages)};

module.exports = {
  PRACTICE_SHEETS,
  PRACTICE_EXPRESSION_CROPS,
  PRACTICE_QUESTIONS,
  PRACTICE_CHAPTERS,
  PRACTICE_ASSET_PACKAGES
};
`
  const dataChanged = writeFileIfChanged(DATA_OUT, data)
  const metaChanged = writeFileIfChanged(META_OUT, metaData)

  const assetBytes = rawSheets.reduce((sum, sheet) => sum + sheet.bytes, 0)
  const report = {
    generatedAt: new Date().toISOString(),
    formulas: formulaSource.items.length,
    questions: runtimeQuestions.length,
    baseQuestionCount: formalQuestions.length,
    formalQuestionCount: formalQuestions.length,
    demoQuestionCount: demoQuestions.length,
    coveredFormulaIds: new Set(runtimeQuestions.map(item => item.sourceId)).size,
    coveredAtomIds: new Set(
      runtimeQuestions.filter(item => !item.demo).map(item => item.atomId)
    ).size,
    expressions: expressions.length,
    expressionReferences: runtimeQuestions.reduce(
      (sum, question) => sum + 5,
      0
    ),
    chapters: chapters.length,
    sheets: rawSheets.length,
    assetPackages: assetPackages.map(item => ({
      name: item.name,
      root: item.root,
      sheets: item.sheetIndexes.length,
      bytes: item.bytes
    })),
    assetBytes,
    dataBytes: fs.statSync(DATA_OUT).size,
    dataChanged,
    metaChanged,
    failures: []
  }
  if (assetPackages.some(item => item.bytes >= PACKAGE_LIMIT)) {
    throw new Error('生成后有资源分包达到或超过 2 MB')
  }
  writeFileIfChanged(REPORT_OUT, `${JSON.stringify(report, null, 2)}\n`)

  console.log('')
  console.log(`公式覆盖: ${report.coveredFormulaIds}/${report.formulas}`)
  console.log(
    `题目: ${report.questions} 题（正式 ${report.formalQuestionCount} + ` +
    `示范 ${report.demoQuestionCount}），${report.chapters} 章`
  )
  console.log(`表达式: ${report.expressions} 个，引用 ${report.expressionReferences} 次`)
  console.log(`图集: ${report.sheets} 张，${assetBytes} B`)
  console.log(`资源分包: ${assetPackages.length} 个`)
  assetPackages.forEach(item => {
    console.log(`  ${item.root} (${item.name}): ${item.sheetIndexes.length} 张，${item.bytes} B`)
  })
  console.log(`数据: ${report.dataBytes} B`)
  console.log(`资源输出: ${PROJECT_ROOT}/practice-assets-*`)
  console.log(`数据输出: ${DATA_OUT}`)
  console.log(`练习元数据输出: ${META_OUT}`)
  console.log(`报告输出: ${REPORT_OUT}`)
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
