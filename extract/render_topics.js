/*
 * Render the 24 source-verbatim topic modules into WeChat subpackage data.
 *
 * Source of truth:
 *   extract/topic-source/topics.json
 *
 * Output:
 *   extract/build/topics/<package>/topics.json + assets/
 *
 * This renderer only turns source text and formulas into display assets. It
 * never adds explanatory copy.
 */

const fs = require('fs')
const path = require('path')
const { traceImage } = require('./trace_figure_svg')
const { K04_PLOTS, evaluatePlot } = require('./k04_function_plots')

const ROOT = path.resolve(__dirname, '..')
const MJ = path.join(ROOT, 'tools/mathjax/node_modules/mathjax-full/js')
const { mathjax } = require(path.join(MJ, 'mathjax.js'))
const { TeX } = require(path.join(MJ, 'input/tex.js'))
const { SVG } = require(path.join(MJ, 'output/svg.js'))
const { liteAdaptor } = require(path.join(MJ, 'adaptors/liteAdaptor.js'))
const { RegisterHTMLHandler } = require(path.join(MJ, 'handlers/html.js'))
const { AllPackages } = require(path.join(MJ, 'input/tex/AllPackages.js'))

const SOURCE_FILE = path.join(ROOT, 'extract/topic-source/topics.json')
const SOURCE_FIGURE_ROOT = path.join(ROOT, 'extract/topic-source/figures')
const OUT_ROOT = path.join(ROOT, 'extract/build/topics')
const PACKAGE_ROOTS = [
  'topic-package-a',
  'topic-package-b',
  'topic-package-c',
  'topic-package-d',
  'topic-package-e',
  'topic-package-f',
  'topic-package-g',
  'topic-package-h'
]
const PACKAGE_BY_TOPIC_ID = new Map([
  ...['K01', 'K02', 'K03'].map(id => [id, 'topic-package-a']),
  ...['K04', 'K05', 'K06'].map(id => [id, 'topic-package-b']),
  ...['K07', 'K08', 'K09'].map(id => [id, 'topic-package-c']),
  ...['K10', 'K11', 'K12'].map(id => [id, 'topic-package-d']),
  ...['K13', 'K14', 'K15'].map(id => [id, 'topic-package-e']),
  ['K16', 'topic-package-f'],
  ...['K18', 'K19', 'K20', 'K21'].map(id => [id, 'topic-package-g']),
  ...['K17', 'K22', 'K23', 'K24'].map(id => [id, 'topic-package-h'])
])

const EM_PX = 17
const PADDING_X = 4
const PADDING_Y = 6
const COLOR_MAIN = '#202823'
const COLOR_LINE = '#5f706a'
const COLOR_ACCENT = '#16856e'
const FIGURE_WIDTH = 320
const FIGURE_HEIGHT = 190
const FIGURE_MAX_WIDTH = 1600
const PLOT_WIDTH = 320
const PLOT_HEIGHT = 220
const PLOT_LEFT = 34
const PLOT_RIGHT = 18
const PLOT_TOP = 20
const PLOT_BOTTOM = 30
const CONVERSION_BATCH_SIZE = 8
const INLINE_FORMULA_MAX_DISPLAY_WIDTH = 620
const INLINE_FORMULA_RPX_PER_PX = 1.72
const FORMULA_LINE_MAX_WIDTH = 318
const PRIMARY_BREAK_TOKENS = new Set([',', '，', ';', '；', '。', '\\quad', '\\qquad'])
const RELATION_BREAK_TOKENS = new Set([
  '\\Longleftrightarrow',
  '\\Leftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\Leftarrow',
  '\\leqslant',
  '\\geqslant',
  '\\therefore',
  '\\because',
  '\\approx',
  '\\mapsto',
  '\\times',
  '\\cdot',
  '\\neq',
  '\\leq',
  '\\geq',
  '\\sim',
  '\\to',
  '\\le',
  '\\ge',
  '\\ne',
  '=',
  '<',
  '>'
])
const ADDITIVE_BREAK_TOKENS = new Set(['+', '-'])

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({
  packages: AllPackages,
  inlineMath: [['$', '$']],
  displayMath: [['$$', '$$']]
})
const svgJax = new SVG({ fontCache: 'local', scale: 1 })
const mathDocument = mathjax.document('', { InputJax: tex, OutputJax: svgJax })

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
  throw new Error('MathJax returned unbalanced SVG')
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
  const expression = String(latex || '').trim()
  if (!expression) throw new Error('Empty formula')

  const node = mathDocument.convert(`\\displaystyle ${expression}`, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 100000
  })
  const source = extractOuterSvg(adaptor.outerHTML(node))
  const viewBoxMatch = source.match(/\sviewBox="([^"]+)"/)
  if (!viewBoxMatch) throw new Error('MathJax SVG is missing viewBox')

  const [minX, minY, vbWidth, vbHeight] = viewBoxMatch[1]
    .trim()
    .split(/\s+/)
    .map(Number)
  const bodyStart = source.indexOf('>') + 1
  const bodyEnd = source.lastIndexOf('</svg>')
  const body = source.slice(bodyStart, bodyEnd)
  const scale = EM_PX / 1000
  const width = Math.ceil(vbWidth * scale + PADDING_X * 2)
  const height = Math.ceil(vbHeight * scale + PADDING_Y * 2)
  const transform = `translate(${PADDING_X} ${PADDING_Y}) scale(${scale}) translate(${-minX} ${-minY})`
  const svg = optimizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" color="${COLOR_MAIN}">` +
    `<g transform="${transform}">${body}</g></svg>`
  )
  return { svg, width, height }
}

function writeFormula(context, key, latex) {
  const rendered = renderExpression(latex)
  context.conversions.push(() => {
    fs.writeFileSync(
      path.join(context.formulaDir, `${key}.svg`),
      rendered.svg,
      'utf8'
    )
  })
  return rendered
}

function inlineDimensions(rendered) {
  return {
    displayWidth: Math.max(24, Math.ceil(rendered.width * INLINE_FORMULA_RPX_PER_PX)),
    displayHeight: Math.max(38, Math.ceil(rendered.height * INLINE_FORMULA_RPX_PER_PX))
  }
}

function splitAtTopLevel(expression, separators) {
  const source = String(expression || '')
  const parts = []
  let start = 0
  let depth = 0
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      continue
    }
    if (character === '{' || character === '[' || character === '(') {
      depth += 1
      continue
    }
    if (character === '}' || character === ']' || character === ')') {
      depth = Math.max(0, depth - 1)
      continue
    }
    if (depth === 0 && separators.has(character)) {
      parts.push(source.slice(start, index + 1))
      start = index + 1
    }
  }
  if (start < source.length) parts.push(source.slice(start))

  return parts
    .map(part => part.trim())
    .filter(Boolean)
}

function splitAfterTokens(expression, tokens) {
  const source = String(expression || '')
  const orderedTokens = Array.from(tokens).sort((left, right) => right.length - left.length)
  const parts = []
  let start = 0
  let depth = 0
  let environments = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (character === '\\') {
      if (source.startsWith('\\begin{', index)) {
        const close = source.indexOf('}', index + 7)
        if (close >= 0) {
          environments += 1
          index = close
          continue
        }
      }
      if (source.startsWith('\\end{', index)) {
        const close = source.indexOf('}', index + 5)
        if (close >= 0) {
          environments = Math.max(0, environments - 1)
          index = close
          continue
        }
      }
      if (depth === 0 && environments === 0) {
        const token = orderedTokens.find(candidate => (
          source.startsWith(candidate, index)
        ))
        if (token) {
          let tokenEnd = index + token.length
          while (/\s/.test(source[tokenEnd] || '')) tokenEnd += 1
          parts.push(source.slice(start, tokenEnd))
          start = tokenEnd
          index = tokenEnd - 1
          continue
        }
      }
      // Keep literal braces such as \{ and \} out of the depth count.
      index += 1
      continue
    }

    if (depth === 0 && environments === 0) {
      const token = orderedTokens.find(candidate => (
        source.startsWith(candidate, index)
      ))
      if (token) {
        let tokenEnd = index + token.length
        while (/\s/.test(source[tokenEnd] || '')) tokenEnd += 1
        parts.push(source.slice(start, tokenEnd))
        start = tokenEnd
        index = tokenEnd - 1
        continue
      }
    }

    if (character === '{' || character === '[' || character === '(') {
      depth += 1
      continue
    }
    if (character === '}' || character === ']' || character === ')') {
      depth = Math.max(0, depth - 1)
    }
  }

  if (start < source.length) parts.push(source.slice(start))
  return parts
    .filter(part => part.trim())
}

function splitAfterBalancedGroups(expression) {
  const source = String(expression || '')
  const parts = []
  let start = 0
  let depth = 0
  let environments = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (character === '\\') {
      if (source.startsWith('\\begin{', index)) {
        const close = source.indexOf('}', index + 7)
        if (close >= 0) {
          environments += 1
          index = close
          continue
        }
      }
      if (source.startsWith('\\end{', index)) {
        const close = source.indexOf('}', index + 5)
        if (close >= 0) {
          environments = Math.max(0, environments - 1)
          index = close
          continue
        }
      }
      index += 1
      continue
    }

    if (character === '{' || character === '[' || character === '(') {
      depth += 1
      continue
    }
    if (character === '}' || character === ']' || character === ')') {
      depth = Math.max(0, depth - 1)
      if (depth !== 0 || environments !== 0) continue

      let boundary = index + 1
      if (source[boundary] === '{' || source[boundary] === '[') continue
      while (/[\s,，;；.。]/.test(source[boundary] || '')) boundary += 1
      if (boundary > start && boundary < source.length) {
        parts.push(source.slice(start, boundary))
        start = boundary
        index = boundary - 1
      }
    }
  }

  if (start < source.length) parts.push(source.slice(start))
  return parts.filter(part => part.trim())
}

function formulaRenderWidth(expression) {
  return renderExpression(expression).width
}

function groupFormulaAtoms(atoms, maxWidth) {
  if (atoms.length <= 1) {
    return atoms.map(atom => String(atom || '').trim()).filter(Boolean)
  }

  const lines = []
  let current = ''
  atoms.forEach(atom => {
    if (!current) {
      current = atom
      return
    }
    const candidate = `${current}${atom}`
    if (formulaRenderWidth(candidate) <= maxWidth) {
      current = candidate
      return
    }
    lines.push(current.trim())
    current = atom
  })
  if (current) lines.push(current.trim())
  return lines.filter(Boolean)
}

function groupFormulaTokens(expression, tokens, maxWidth) {
  const lines = groupFormulaAtoms(splitAfterTokens(expression, tokens), maxWidth)
  return lines.length ? lines : [String(expression || '').trim()]
}

function expandCases(expression) {
  const source = String(expression || '')
  const match = source.match(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/)
  if (!match) return [source]

  const rows = splitAfterTokens(match[1], new Set(['\\\\']))
  if (rows.length <= 1) return [source]

  const before = source.slice(0, match.index)
  const after = source.slice(match.index + match[0].length)
  const caseLines = rows.flatMap(row => {
    const content = row.replace(/\\\\\s*$/, '').trim()
    return fitFormulaSection(content, FORMULA_LINE_MAX_WIDTH - 8)
  })
  return [
    before,
    ...caseLines.map(row => `\\begin{cases}${row}\\end{cases}`),
    after
  ]
    .map(part => part.trim())
    .filter(Boolean)
}

function fitFormulaSection(expression, maxWidth) {
  const source = String(expression || '').trim()
  if (!source || formulaRenderWidth(source) <= maxWidth) return source ? [source] : []

  const relationLines = groupFormulaTokens(
    source,
    RELATION_BREAK_TOKENS,
    maxWidth
  )
  const relationSplit = relationLines.length > 1 || relationLines[0] !== source
  const candidates = relationSplit ? relationLines : [source]
  const lines = []

  candidates.forEach(candidate => {
    if (formulaRenderWidth(candidate) <= maxWidth) {
      lines.push(candidate)
      return
    }
    const additiveLines = groupFormulaTokens(
      candidate,
      ADDITIVE_BREAK_TOKENS,
      maxWidth
    )
    if (additiveLines.length > 1) {
      lines.push(...additiveLines)
      return
    }
    const balancedLines = groupFormulaAtoms(
      splitAfterBalancedGroups(candidate),
      maxWidth
    )
    lines.push(...(balancedLines.length ? balancedLines : [candidate]))
  })

  return lines
}

function isFormulaSpacer(expression) {
  return /^\\(?:q?quad)\s*$/.test(String(expression || '').trim())
}

function splitFormulaForDisplay(expression) {
  const lines = []
  expandCases(expression).forEach(section => {
    const primaryParts = splitAfterTokens(section, PRIMARY_BREAK_TOKENS)
    const sections = primaryParts.length > 1 ? primaryParts : [section]
    sections.forEach(part => {
      if (isFormulaSpacer(part)) return
      lines.push(...fitFormulaSection(part, FORMULA_LINE_MAX_WIDTH))
    })
  })
  return lines.filter(line => line && !isFormulaSpacer(line))
}

function splitInlineFormula(expression) {
  const source = String(expression || '').trim()
  const groups = splitAtTopLevel(source, new Set([';', '；']))
  const parts = []

  groups.forEach(group => {
    const rendered = renderExpression(group)
    const displayWidth = Math.ceil(rendered.width * INLINE_FORMULA_RPX_PER_PX)
    if (displayWidth <= INLINE_FORMULA_MAX_DISPLAY_WIDTH) {
      parts.push({ latex: group, rendered })
      return
    }

    // A very wide chain of equalities is easier to read as equation lines.
    // The equality sign stays at the end of the preceding line.
    const equalityParts = splitAtTopLevel(group, new Set(['=']))
    if (equalityParts.length > 1) {
      equalityParts.forEach(part => {
        parts.push({
          latex: part,
          rendered: renderExpression(part)
        })
      })
      return
    }
    parts.push({ latex: group, rendered })
  })

  return parts
}

function renderTextSegments(text, context, key) {
  const source = String(text == null ? '' : text)
  if (!source) return []

  const segments = []
  const pattern = /\$([^$\n]+)\$/g
  let cursor = 0
  let formulaIndex = 0
  let match

  while ((match = pattern.exec(source))) {
    if (match.index > cursor) {
      segments.push({
        type: 'text',
        text: source.slice(cursor, match.index)
      })
    }

    formulaIndex += 1
    const parts = splitInlineFormula(match[1])
    parts.forEach((part, partIndex) => {
      const formulaKey = `${key}-i${String(formulaIndex).padStart(2, '0')}`
        + (parts.length > 1 ? `-p${String(partIndex + 1).padStart(2, '0')}` : '')
      const rendered = part.rendered
      context.conversions.push(() => {
        fs.writeFileSync(
          path.join(context.formulaDir, `${formulaKey}.svg`),
          rendered.svg,
          'utf8'
        )
      })
      context.formulaCount += 1
      segments.push({
        type: 'formula',
        asset: `/${context.packageRoot}/assets/formulas/${formulaKey}.svg`,
        width: rendered.width,
        height: rendered.height,
        ...inlineDimensions(rendered)
      })
      if (partIndex < parts.length - 1) {
        segments.push({ type: 'text', text: '\n' })
      }
    })
    cursor = match.index + match[0].length
  }

  if (cursor < source.length) {
    segments.push({
      type: 'text',
      text: source.slice(cursor)
    })
  }
  return segments
}

function figureElementXml(element) {
  if (!element || !element.type) return ''
  const stroke = element.stroke || (element.accent ? COLOR_ACCENT : COLOR_LINE)
  const fill = element.fill || 'none'
  const strokeWidth = Number(element.strokeWidth || (element.accent ? 2.4 : 1.8))
  const dash = element.dashed ? ' stroke-dasharray="6 5"' : ''
  const common = `stroke="${escapeXml(stroke)}" stroke-width="${strokeWidth}" fill="${escapeXml(fill)}"${dash}`

  if (element.type === 'line') {
    return `<line ${common} x1="${Number(element.x1)}" y1="${Number(element.y1)}" x2="${Number(element.x2)}" y2="${Number(element.y2)}"/>`
  }
  if (element.type === 'rect') {
    return `<rect ${common} x="${Number(element.x)}" y="${Number(element.y)}" width="${Number(element.width)}" height="${Number(element.height)}" rx="${Number(element.rx || 0)}"/>`
  }
  if (element.type === 'circle') {
    return `<circle ${common} cx="${Number(element.cx)}" cy="${Number(element.cy)}" r="${Number(element.r)}"/>`
  }
  if (element.type === 'ellipse') {
    return `<ellipse ${common} cx="${Number(element.cx)}" cy="${Number(element.cy)}" rx="${Number(element.rx)}" ry="${Number(element.ry)}"/>`
  }
  if (element.type === 'polygon') {
    return `<polygon ${common} points="${escapeXml(element.points)}"/>`
  }
  if (element.type === 'polyline') {
    return `<polyline ${common} points="${escapeXml(element.points)}"/>`
  }
  if (element.type === 'path') {
    return `<path ${common} d="${escapeXml(element.d)}"/>`
  }
  if (element.type === 'text') {
    const anchor = element.anchor || 'middle'
    const fontSize = Number(element.fontSize || 11)
    return `<text x="${Number(element.x)}" y="${Number(element.y)}" text-anchor="${escapeXml(anchor)}" font-family="Arial, PingFang SC, sans-serif" font-size="${fontSize}" font-weight="600" fill="${escapeXml(element.accent ? COLOR_ACCENT : '#34423d')}">${escapeXml(element.text || '')}</text>`
  }
  return ''
}

function renderPlotFigure(block) {
  const plot = K04_PLOTS[String(block.assetKey || '')]
  if (!plot) return null

  const plotWidth = PLOT_WIDTH - PLOT_LEFT - PLOT_RIGHT
  const plotHeight = PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM
  const xSpan = plot.xMax - plot.xMin
  const ySpan = plot.yMax - plot.yMin
  const mapX = value => PLOT_LEFT + ((value - plot.xMin) / xSpan) * plotWidth
  const mapY = value => PLOT_TOP + ((plot.yMax - value) / ySpan) * plotHeight
  const yAxisX = mapX(0)
  const xAxisY = mapY(0)
  const axisColor = '#66736f'
  const guideColor = '#a3afab'
  const curveColor = '#16856e'
  const pointColor = '#16856e'
  const labelFont = 'Arial, PingFang SC, sans-serif'
  const curvePaths = []

  let currentPath = []
  let previousY = null
  const sampleCount = 480

  function flushPath() {
    if (currentPath.length > 1) curvePaths.push(currentPath.join(' '))
    currentPath = []
  }

  for (let index = 0; index <= sampleCount; index += 1) {
    const x = plot.xMin + (xSpan * index) / sampleCount
    const y = evaluatePlot(plot, x)
    const outsideGuard = (
      !Number.isFinite(y)
      || y < plot.yMin - ySpan * 1.6
      || y > plot.yMax + ySpan * 1.6
    )
    const jumped = (
      previousY != null
      && Math.abs(y - previousY) > ySpan * 0.72
    )
    if (outsideGuard || jumped) {
      flushPath()
      previousY = Number.isFinite(y) ? y : null
      continue
    }
    const command = currentPath.length ? 'L' : 'M'
    currentPath.push(`${command}${mapX(x).toFixed(2)} ${mapY(y).toFixed(2)}`)
    previousY = y
  }
  flushPath()

  const guides = (plot.asymptotesX || []).map(value => {
    if (value < plot.xMin || value > plot.xMax) return ''
    const x = mapX(value)
    return `<line x1="${x.toFixed(2)}" y1="${PLOT_TOP}" x2="${x.toFixed(2)}" y2="${PLOT_TOP + plotHeight}" stroke="${guideColor}" stroke-width="1.4" stroke-dasharray="5 5"/>`
  }).join('')

  const curves = curvePaths.map(path => (
    `<path d="${path}" fill="none" stroke="${curveColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
  )).join('')

  const points = (plot.points || []).map(point => {
    const fill = point.hollow ? '#ffffff' : pointColor
    return `<circle cx="${mapX(point.x).toFixed(2)}" cy="${mapY(point.y).toFixed(2)}" r="3.1" fill="${fill}" stroke="${pointColor}" stroke-width="1.8"/>`
  }).join('')

  const xTicks = [0.25, 0.5, 0.75].map(fraction => {
    const x = PLOT_LEFT + plotWidth * fraction
    return `<line x1="${x.toFixed(2)}" y1="${(xAxisY - 3).toFixed(2)}" x2="${x.toFixed(2)}" y2="${(xAxisY + 3).toFixed(2)}" stroke="${axisColor}" stroke-width="1"/>`
  }).join('')
  const yTicks = [0.25, 0.5, 0.75].map(fraction => {
    const y = PLOT_TOP + plotHeight * fraction
    return `<line x1="${(yAxisX - 3).toFixed(2)}" y1="${y.toFixed(2)}" x2="${(yAxisX + 3).toFixed(2)}" y2="${y.toFixed(2)}" stroke="${axisColor}" stroke-width="1"/>`
  }).join('')

  const body = [
    `<defs><clipPath id="plot-area"><rect x="${PLOT_LEFT}" y="${PLOT_TOP}" width="${plotWidth}" height="${plotHeight}"/></clipPath></defs>`,
    `<g clip-path="url(#plot-area)">${guides}${curves}${xTicks}${yTicks}</g>`,
    `<line x1="${PLOT_LEFT}" y1="${xAxisY}" x2="${PLOT_WIDTH - PLOT_RIGHT}" y2="${xAxisY}" stroke="${axisColor}" stroke-width="1.6"/>`,
    `<path d="M${PLOT_WIDTH - PLOT_RIGHT} ${xAxisY} l-8 -4 v8 z" fill="${axisColor}"/>`,
    `<line x1="${yAxisX}" y1="${PLOT_TOP + plotHeight}" x2="${yAxisX}" y2="${PLOT_TOP}" stroke="${axisColor}" stroke-width="1.6"/>`,
    `<path d="M${yAxisX} ${PLOT_TOP} l-4 8 h8 z" fill="${axisColor}"/>`,
    points,
    `<text x="${PLOT_WIDTH - PLOT_RIGHT + 4}" y="${xAxisY + 13}" text-anchor="middle" font-family="${labelFont}" font-size="12" font-weight="600" fill="${axisColor}">x</text>`,
    `<text x="${yAxisX - 12}" y="${PLOT_TOP + 2}" text-anchor="middle" font-family="${labelFont}" font-size="12" font-weight="600" fill="${axisColor}">y</text>`,
    `<text x="${yAxisX - 9}" y="${xAxisY + 16}" text-anchor="middle" font-family="${labelFont}" font-size="11" fill="${axisColor}">O</text>`
  ].join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLOT_WIDTH}" height="${PLOT_HEIGHT}" viewBox="0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}">${body}</svg>`
  return { svg, width: PLOT_WIDTH, height: PLOT_HEIGHT }
}

function renderVectorFigure(block) {
  const viewBox = block.viewBox || `0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`
  const values = viewBox.split(/\s+/).map(Number)
  const vbWidth = values[2] || FIGURE_WIDTH
  const vbHeight = values[3] || FIGURE_HEIGHT
  const body = (block.elements || []).map(figureElementXml).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${vbWidth}" height="${vbHeight}" viewBox="${escapeXml(viewBox)}">` +
    `<rect x="0" y="0" width="${vbWidth}" height="${vbHeight}" fill="#ffffff"/>${body}</svg>`
  return { svg, width: vbWidth, height: vbHeight }
}

function cleanDirectory(dir) {
  const resolved = path.resolve(dir)
  const relative = path.relative(OUT_ROOT, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to clean outside build root: ${resolved}`)
  }
  fs.rmSync(resolved, { recursive: true, force: true })
  fs.mkdirSync(resolved, { recursive: true })
}

function processTextBlock(block, context, seed) {
  return {
    type: block.type,
    segments: renderTextSegments(
      block.text,
      context,
      seed
    )
  }
}

function processTable(block, context, seed) {
  const columns = (block.columns || []).map((column, columnIndex) => {
    const key = `${seed}-h${String(columnIndex + 1).padStart(2, '0')}`
    const countBefore = context.formulaCount
    const segments = renderTextSegments(
      column && typeof column === 'object' ? column.text : column,
      context,
      key
    )
    context.tableFormulaCount += context.formulaCount - countBefore
    return {
      uid: key,
      segments,
      colspan: 1
    }
  })
  const rows = (block.rows || []).map((row, rowIndex) => ({
    uid: `${seed}-r${String(rowIndex + 1).padStart(2, '0')}`,
    cells: row.map((cell, cellIndex) => {
      const cellKey = `${seed}-r${String(rowIndex + 1).padStart(2, '0')}-c${String(cellIndex + 1).padStart(2, '0')}`
      const colspan = Math.max(1, Number(cell && typeof cell === 'object' && cell.colspan) || 1)
      let segments
      if (cell && typeof cell === 'object' && cell.type === 'figure') {
        const figure = processFigure(cell, context, cellKey)
        segments = [figure]
      } else {
        const countBefore = context.formulaCount
        segments = renderTextSegments(
          cell && typeof cell === 'object' ? cell.text : cell,
          context,
          cellKey
        )
        context.tableFormulaCount += context.formulaCount - countBefore
      }
      return {
        uid: cellKey,
        segments,
        colspan
      }
    })
  }))
  return {
    type: 'table',
    columns,
    rows
  }
}

function processFigure(block, context, keySeed) {
  const key = `${context.key}-fig-${keySeed.replace(`${context.key}-`, '')}`
  const figureDir = path.join(context.packageDir, 'assets/figures')

  const plotted = renderPlotFigure(block)
  if (plotted) {
    const targetName = `${key}.svg`
    context.conversions.push(() => {
      fs.writeFileSync(path.join(figureDir, targetName), plotted.svg, 'utf8')
    })
    context.figureCount += 1
    return {
      type: 'figure',
      asset: `/${context.packageRoot}/assets/figures/${targetName}`,
      width: plotted.width,
      height: plotted.height
    }
  }

  if (Array.isArray(block.elements) && block.elements.length) {
    const rendered = renderVectorFigure(block)
    const targetName = `${key}.svg`
    context.conversions.push(() => {
      fs.writeFileSync(path.join(figureDir, targetName), rendered.svg, 'utf8')
    })
    context.figureCount += 1
    return {
      type: 'figure',
      asset: `/${context.packageRoot}/assets/figures/${targetName}`,
      width: rendered.width,
      height: rendered.height
    }
  }

  const assetKey = String(block.assetKey || '')
  const sourceFile = ['.png', '.webp', '.jpg', '.jpeg']
    .map(extension => path.join(SOURCE_FIGURE_ROOT, `${assetKey}${extension}`))
    .find(file => fs.existsSync(file))
  if (!sourceFile) {
    throw new Error(`${context.key} is missing figure asset: ${assetKey}`)
  }
  const targetName = `${key}.svg`
  const figure = {
    type: 'figure',
    asset: `/${context.packageRoot}/assets/figures/${targetName}`,
    width: Number(block.width || 640),
    height: Number(block.height || 360)
  }
  context.conversions.push(async () => {
    const traced = await traceImage(sourceFile)
    fs.writeFileSync(path.join(figureDir, targetName), traced.svg, 'utf8')
    figure.width = traced.width
    figure.height = traced.height
  })
  context.figureCount += 1
  return figure
}

function processBlock(block, context, blockIndex, sectionIndex) {
  const seed = `${context.key}-s${String(sectionIndex + 1).padStart(2, '0')}-b${String(blockIndex + 1).padStart(2, '0')}`
  if (block.type === 'paragraph' || block.type === 'note') {
    return processTextBlock(block, context, seed)
  }
  if (block.type === 'subheading' || block.type === 'label') {
    return {
      type: block.type,
      segments: renderTextSegments(block.text, context, seed)
    }
  }
  if (block.type === 'formula') {
    const formulaNumber = context.formulaCount + 1
    const key = `${seed}-f-${String(formulaNumber).padStart(4, '0')}`
    const lines = splitFormulaForDisplay(block.tex)
    const parts = lines.map((latex, index) => {
      const partKey = lines.length > 1
        ? `${key}-p${String(index + 1).padStart(2, '0')}`
        : key
      const rendered = writeFormula(context, partKey, latex)
      return {
        latex,
        asset: `/${context.packageRoot}/assets/formulas/${partKey}.svg`,
        width: rendered.width,
        height: rendered.height
      }
    })
    context.formulaCount += 1
    return {
      type: 'formula',
      parts
    }
  }
  if (block.type === 'table') {
    return processTable(block, context, seed)
  }
  if (block.type === 'figure') {
    return processFigure(block, context, seed)
  }
  throw new Error(`${context.key} has unknown block type: ${block.type}`)
}

function processModule(module, packageRoot) {
  const packageDir = path.join(OUT_ROOT, packageRoot)
  const formulaDir = path.join(packageDir, 'assets/formulas')
  const figureDir = path.join(packageDir, 'assets/figures')
  fs.mkdirSync(formulaDir, { recursive: true })
  fs.mkdirSync(figureDir, { recursive: true })

  const context = {
    packageRoot,
    packageDir,
    formulaDir,
    key: module.id.toLowerCase(),
    formulaCount: 0,
    tableFormulaCount: 0,
    figureCount: 0,
    conversions: []
  }

  const result = {
    id: module.id,
    order: module.order,
    packageRoot,
    visualTheme: module.visualTheme || '',
    layoutVariant: module.layoutVariant || '',
    title: module.title,
    sourcePages: module.sourcePages || [],
    sections: module.sections.map((section, sectionIndex) => ({
      id: section.id,
      title: section.title || '',
      titleSegments: renderTextSegments(
        section.title,
        context,
        `${context.key}-s${String(sectionIndex + 1).padStart(2, '0')}-title`
      ),
      sourcePages: section.sourcePages || [],
      blocks: section.blocks.map((block, blockIndex) => (
        processBlock(block, context, blockIndex, sectionIndex)
      ))
    }))
  }

  return {
    module: result,
    conversions: context.conversions,
    stats: {
      formulaCount: context.formulaCount,
      tableFormulaCount: context.tableFormulaCount,
      figureCount: context.figureCount
    }
  }
}

async function runConversions(conversions) {
  for (let index = 0; index < conversions.length; index += CONVERSION_BATCH_SIZE) {
    await Promise.all(
      conversions
        .slice(index, index + CONVERSION_BATCH_SIZE)
        .map(convert => convert())
    )
  }
}

async function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'))
  if (!Array.isArray(source.modules) || source.modules.length !== 24) {
    throw new Error(`Topic source must contain 24 modules, got ${source.modules ? source.modules.length : 0}`)
  }

  cleanDirectory(OUT_ROOT)
  const packageModules = new Map(PACKAGE_ROOTS.map(packageRoot => [packageRoot, []]))
  let formulaCount = 0
  let tableFormulaCount = 0
  let figureCount = 0
  const conversions = []

  source.modules.forEach(module => {
    const packageRoot = PACKAGE_BY_TOPIC_ID.get(module.id)
    if (!packageRoot) {
      throw new Error(`${module.id} has no package assignment`)
    }
    const processed = processModule(module, packageRoot)
    packageModules.get(packageRoot).push(processed.module)
    conversions.push(...processed.conversions)
    formulaCount += processed.stats.formulaCount
    tableFormulaCount += processed.stats.tableFormulaCount
    figureCount += processed.stats.figureCount
  })

  await runConversions(conversions)

  packageModules.forEach((modules, packageRoot) => {
    const packageDir = path.join(OUT_ROOT, packageRoot)
    fs.writeFileSync(
      path.join(packageDir, 'topics.json'),
      `${JSON.stringify({ modules }, null, 2)}\n`,
      'utf8'
    )
  })

  const report = {
    modules: source.modules.length,
    sections: source.modules.reduce((sum, module) => sum + module.sections.length, 0),
    formulas: formulaCount,
    tableFormulas: tableFormulaCount,
    figures: figureCount,
    packages: PACKAGE_ROOTS.map(packageRoot => ({
      packageRoot,
      modules: packageModules.get(packageRoot).length
    }))
  }
  console.log(JSON.stringify(report, null, 2))
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = {
  renderExpression,
  splitFormulaForDisplay
}
