/*
 * Estimate practice asset size before rebuilding the full question bank.
 *
 * This script only renders in memory. It does not modify the mini program.
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

const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')

const EM_PX = 17
const PADDING_X = 8
const PADDING_Y = 6

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({
  packages: AllPackages,
  inlineMath: [['$', '$']],
  displayMath: [['$$', '$$']]
})
const svgJax = new SVG({ fontCache: 'local', scale: 1 })
const doc = mathjax.document('', { InputJax: tex, OutputJax: svgJax })

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
    .replace(/> </g, '><')
    .trim()
}

function renderExpression(latex) {
  const expression = `\\displaystyle ${String(latex || '').trim()}`
  const node = doc.convert(expression, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 100000
  })
  const source = extractOuterSvg(adaptor.outerHTML(node))
  const viewBoxMatch = source.match(/\sviewBox="([^"]+)"/)
  if (!viewBoxMatch) throw new Error('Invalid MathJax SVG')

  const [minX, minY, vbW, vbH] = viewBoxMatch[1].trim().split(/\s+/).map(Number)
  const bodyStart = source.indexOf('>') + 1
  const bodyEnd = source.lastIndexOf('</svg>')
  const body = source.slice(bodyStart, bodyEnd)
  const scale = EM_PX / 1000
  const width = Math.ceil(vbW * scale + PADDING_X * 2)
  const height = Math.ceil(vbH * scale + PADDING_Y * 2)
  const transform =
    `translate(${PADDING_X} ${PADDING_Y}) scale(${scale}) ` +
    `translate(${-minX} ${-minY})`
  const intrinsicWidth = width * 3
  const intrinsicHeight = height * 3
  const svg = optimizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${intrinsicWidth}" height="${intrinsicHeight}" viewBox="0 0 ${width} ${height}" ` +
    `color="#211d18">` +
    `<g transform="${transform}">${body}</g></svg>`
  )

  return {
    key: crypto.createHash('sha1').update(latex).digest('hex').slice(0, 12),
    bytes: Buffer.byteLength(svg, 'utf8'),
    width,
    height
  }
}

function summarize(label, expressions) {
  const unique = new Map()
  expressions.forEach(latex => {
    const value = String(latex || '').trim()
    if (value && !unique.has(value)) unique.set(value, null)
  })

  let bytes = 0
  let maxWidth = 0
  let maxHeight = 0
  let over120 = 0
  for (const latex of unique.keys()) {
    const rendered = renderExpression(latex)
    bytes += rendered.bytes
    maxWidth = Math.max(maxWidth, rendered.width)
    maxHeight = Math.max(maxHeight, rendered.height)
    if (rendered.height > 120) over120 += 1
  }

  return {
    label,
    expressions: expressions.length,
    uniqueAssets: unique.size,
    bytes,
    kb: Math.round(bytes / 1024),
    maxWidth,
    maxHeight,
    over120
  }
}

function buildSheetEstimate(label, expressions) {
  const unique = [...new Set(expressions.map(value => String(value || '').trim()).filter(Boolean))]
  const sheetOut = new SVG({ fontCache: 'global', scale: 1 })
  const sheetDoc = mathjax.document('', { InputJax: tex, OutputJax: sheetOut })
  const items = []
  const failures = []

  unique.forEach(latex => {
    try {
      const expression = `\\displaystyle ${latex}`
      const node = sheetDoc.convert(expression, {
        display: true,
        em: 16,
        ex: 8,
        containerWidth: 100000
      })
      const source = extractOuterSvg(adaptor.outerHTML(node))
      const viewBoxMatch = source.match(/\sviewBox="([^"]+)"/)
      if (!viewBoxMatch) throw new Error('Invalid MathJax SVG')
      const [minX, minY, vbW, vbH] = viewBoxMatch[1].trim().split(/\s+/).map(Number)
      const bodyStart = source.indexOf('>') + 1
      const bodyEnd = source.lastIndexOf('</svg>')
      const body = source.slice(bodyStart, bodyEnd)
      const scale = EM_PX / 1000
      const width = Math.ceil(vbW * scale + PADDING_X * 2)
      const height = Math.ceil(vbH * scale + PADDING_Y * 2)
      const transform =
        `translate(${PADDING_X} ${PADDING_Y}) scale(${scale}) ` +
        `translate(${-minX} ${-minY})`
      items.push({ width, height, body, transform })
    } catch (error) {
      failures.push(`${latex}: ${error.message}`)
    }
  })

  const sheetWidth = 6000
  const gap = 12
  let x = gap
  let y = gap
  let rowHeight = 0
  const placed = items.map(item => {
    if (x > gap && x + item.width + gap > sheetWidth) {
      x = gap
      y += rowHeight + gap
      rowHeight = 0
    }
    const placedItem = { ...item, x, y }
    x += item.width + gap
    rowHeight = Math.max(rowHeight, item.height)
    return placedItem
  })
  const sheetHeight = y + rowHeight + gap
  const defs = adaptor.outerHTML(sheetOut.fontCache.getCache())
  const groups = placed.map(item => (
    `<g transform="translate(${item.x} ${item.y})">` +
    `<g transform="${item.transform}">${item.body}</g></g>`
  )).join('')
  const sheet = optimizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${sheetWidth}" height="${sheetHeight}" viewBox="0 0 ${sheetWidth} ${sheetHeight}" ` +
    `color="#211d18">${defs}${groups}</svg>`
  )

  return {
    label,
    expressions: expressions.length,
    uniqueAssets: unique.length,
    bytes: Buffer.byteLength(sheet, 'utf8'),
    kb: Math.round(Buffer.byteLength(sheet, 'utf8') / 1024),
    sheetWidth,
    sheetHeight,
    failures
  }
}

function main() {
  const formulas = JSON.parse(fs.readFileSync(FORMULAS_PATH, 'utf8')).items
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8')).items

  const existing = []
  questions.forEach(question => {
    existing.push(question.stemLatex, question.answerLatex)
    question.distractors.forEach(item => existing.push(item.latex))
    if (question.fill) existing.push(question.fill.templateLatex)
  })

  const formulaLatex = formulas.map(item => item.latex)
  const nameStems = formulas.map(item => `\\text{「${item.name}」的正确公式是}`)
  const combined = existing.concat(formulaLatex, nameStems)

  const reports = [
    summarize('existing-48', existing),
    summarize('all-formulas', formulaLatex),
    summarize('all-name-stems', nameStems),
    summarize('combined-full-bank', combined)
  ]

  const byChapter = new Map()
  function add(chapter, latex) {
    if (!byChapter.has(chapter)) byChapter.set(chapter, [])
    byChapter.get(chapter).push(latex)
  }
  questions.forEach(question => {
    add(question.chapter, question.stemLatex)
    add(question.chapter, question.answerLatex)
    question.distractors.forEach(item => add(question.chapter, item.latex))
    if (question.fill) add(question.chapter, question.fill.templateLatex)
  })
  formulas.forEach(item => {
    add(item.chapter, item.latex)
    add(item.chapter, `\\text{「${item.name}」的正确公式是}`)
  })

  const sheetReports = [...byChapter.entries()].map(([chapter, expressions]) => (
    buildSheetEstimate(chapter, expressions)
  ))
  const sheetTotal = sheetReports.reduce((sum, item) => sum + item.bytes, 0)
  const formulaSheetReports = [...new Set(formulas.map(item => item.chapter))].map(chapter => (
    buildSheetEstimate(
      chapter,
      formulas.filter(item => item.chapter === chapter).map(item => item.latex)
    )
  ))
  const formulaSheetTotal = formulaSheetReports.reduce((sum, item) => sum + item.bytes, 0)
  const allFormulaSheet = buildSheetEstimate('all-formulas', formulaLatex)

  console.log(JSON.stringify({
    reports,
    sheets: sheetReports,
    sheetSummary: {
      sheets: sheetReports.length,
      bytes: sheetTotal,
      kb: Math.round(sheetTotal / 1024),
      failures: sheetReports.reduce((sum, item) => sum + item.failures.length, 0)
    },
    formulaSheets: formulaSheetReports,
    formulaSheetSummary: {
      sheets: formulaSheetReports.length,
      bytes: formulaSheetTotal,
      kb: Math.round(formulaSheetTotal / 1024),
      failures: formulaSheetReports.reduce((sum, item) => sum + item.failures.length, 0)
    },
    allFormulaSheet
  }, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
