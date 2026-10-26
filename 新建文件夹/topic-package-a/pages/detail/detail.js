const { modules } = require('../../data/topics')

const BODY_MAX_FORMULA_WIDTH = 620
const WIDE_FIGURE_ASPECT = 2.2
const WIDE_FIGURE_DISPLAY_WIDTH = 1500
const TABLE_VIEWPORT_WIDTH = 646
const TABLE_FONT_SIZE = 29
const TABLE_CELL_PADDING = 36
const TABLE_FORMULA_GAP = 18
const TABLE_TEXT_COLUMN_MAX = 460
const TABLE_FIGURE_COLUMN_MAX = 380
const TABLE_FORMULA_MIN_SCALE = 0.88
const FUNCTION_CARD_INNER_WIDTH = 604
const FUNCTION_CARD_FORMULA_MIN_SCALE = 0.92

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function segmentKey(seed, index) {
  return `${seed}-segment-${index + 1}`
}

function normalizeFormula(segment, maxWidth, minimumScale = 0) {
  const width = Math.max(1, Number(segment.displayWidth || segment.width) || 1)
  const height = Math.max(1, Number(segment.displayHeight || segment.height) || 1)
  const scale = Math.max(minimumScale, Math.min(1, maxWidth / width))
  return {
    ...segment,
    renderWidth: Math.max(1, Math.round(width * scale)),
    renderHeight: Math.max(1, Math.round(height * scale)),
    renderScale: Number(scale.toFixed(3))
  }
}

function prepareLines(segments, seed, maxWidth, formulaMinimumScale = 0) {
  const lines = [[]]
  let lineWidth = 0

  function startLine() {
    lines.push([])
    lineWidth = 0
  }

  ;(segments || []).forEach((segment, segmentIndex) => {
    if (segment.type === 'text') {
      const chunks = String(segment.text == null ? '' : segment.text).split('\n')
      chunks.forEach((chunk, chunkIndex) => {
        if (chunkIndex > 0) startLine()
        if (chunk) {
          const chunkWidth = textDisplayWidth(chunk)
          if (lines[lines.length - 1].length && lineWidth + chunkWidth > maxWidth) {
            startLine()
          }
          lines[lines.length - 1].push({
            ...segment,
            key: `${segmentKey(seed, segmentIndex)}-t${chunkIndex + 1}`,
            text: chunk
          })
          lineWidth += chunkWidth
        }
      })
      return
    }
    if (segment.type === 'formula') {
      const formula = normalizeFormula(segment, maxWidth, formulaMinimumScale)
      const formulaWidth = formula.renderWidth + TABLE_FORMULA_GAP
      if (lines[lines.length - 1].length && lineWidth + formulaWidth > maxWidth) {
        startLine()
      }
      lines[lines.length - 1].push({
        ...formula,
        key: segmentKey(seed, segmentIndex)
      })
      lineWidth += formulaWidth
    }
  })

  return lines.map((lineSegments, index) => ({
    key: `${seed}-line-${index + 1}`,
    segments: lineSegments
  }))
}

function textDisplayWidth(text) {
  return Array.from(String(text == null ? '' : text)).reduce((width, character) => {
    if (/\s/.test(character)) return width + TABLE_FONT_SIZE * 0.34
    if (/[\u2e80-\u9fff\uff00-\uffef]/.test(character)) return width + TABLE_FONT_SIZE
    if (/[A-Z]/.test(character)) return width + TABLE_FONT_SIZE * 0.66
    return width + TABLE_FONT_SIZE * 0.56
  }, 0)
}

function segmentsDisplayWidth(segments) {
  let lineWidth = 0
  let maxWidth = 0

  ;(segments || []).forEach(segment => {
    if (segment.type === 'formula') {
      lineWidth += Math.max(1, Number(segment.displayWidth || segment.width) || 1)
      lineWidth += TABLE_FORMULA_GAP
      return
    }
    if (segment.type === 'figure') {
      lineWidth += Math.min(
        TABLE_FIGURE_COLUMN_MAX - TABLE_CELL_PADDING,
        Math.max(1, Number(segment.width) || 1) * 1.72
      )
      return
    }
    if (segment.type === 'text') {
      String(segment.text == null ? '' : segment.text).split('\n').forEach((part, index) => {
        if (index > 0) {
          maxWidth = Math.max(maxWidth, lineWidth)
          lineWidth = 0
        }
        lineWidth += textDisplayWidth(part)
      })
    }
  })

  return Math.max(maxWidth, lineWidth)
}

function preferredCellWidth(cell) {
  const segments = (cell && cell.segments) || []
  const natural = segmentsDisplayWidth(cell && cell.segments)
  if (!natural) return 0
  const hasFigure = segments.some(segment => segment.type === 'figure')
  const hasFormula = segments.some(segment => segment.type === 'formula')
  const requiredFormulaWidth = hasFormula
    ? Math.ceil(natural / TABLE_FORMULA_MIN_SCALE)
    : Math.ceil(natural)
  const wanted = Math.max(
    TABLE_FONT_SIZE * 4,
    requiredFormulaWidth + TABLE_CELL_PADDING
  )
  if (hasFigure) return Math.min(TABLE_FIGURE_COLUMN_MAX, wanted)
  if (hasFormula) return wanted
  return Math.min(TABLE_TEXT_COLUMN_MAX, wanted)
}

function allocateTableWidths(block) {
  const columnCount = Math.max(1, (block.columns || []).length)
  const minimum = columnCount >= 5 ? 150 : 210
  const preferred = Array.from({ length: columnCount }, () => minimum)
  const colspanConstraints = []

  function applyCell(cell, startColumn, span) {
    const wanted = preferredCellWidth(cell)
    if (!wanted) return
    if (span === 1) {
      preferred[startColumn] = Math.max(preferred[startColumn], wanted)
      return
    }
    colspanConstraints.push({ startColumn, span, wanted })
  }

  ;(block.columns || []).forEach((column, columnIndex) => {
    applyCell(column, columnIndex, 1)
  })

  ;(block.rows || []).forEach(row => {
    let columnIndex = 0
    ;(row.cells || []).forEach(cell => {
      const span = Math.max(1, Math.min(Number(cell.colspan) || 1, columnCount - columnIndex))
      applyCell(cell, columnIndex, span)
      columnIndex += span
    })
  })

  colspanConstraints.forEach(({ startColumn, span, wanted }) => {
    const current = preferred
      .slice(startColumn, startColumn + span)
      .reduce((sum, width) => sum + width, 0)
    if (current >= wanted) return
    const extra = Math.ceil((wanted - current) / span)
    for (let index = startColumn; index < startColumn + span; index += 1) {
      preferred[index] += extra
    }
  })

  const currentTotal = preferred.reduce((sum, width) => sum + width, 0)
  if (currentTotal < TABLE_VIEWPORT_WIDTH) {
    const extra = (TABLE_VIEWPORT_WIDTH - currentTotal) / columnCount
    for (let index = 0; index < preferred.length; index += 1) {
      preferred[index] += extra
    }
  }

  return preferred.map(width => Math.round(width))
}

function prepareTable(block, sectionId, blockIndex) {
  const columnCount = Math.max(1, (block.columns || []).length)
  const columnWidths = allocateTableWidths(block)
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0)
  const tableSeed = `${sectionId}-b${blockIndex + 1}`

  const columns = (block.columns || []).map((column, columnIndex) => {
    const span = Math.max(1, Number(column.colspan) || 1)
    const width = columnWidths
      .slice(columnIndex, columnIndex + span)
      .reduce((sum, value) => sum + value, 0)
    return {
      ...column,
      width,
      lines: prepareLines(
        column.segments,
        `${tableSeed}-h${columnIndex + 1}`,
        Math.max(80, width - TABLE_CELL_PADDING),
        TABLE_FORMULA_MIN_SCALE
      )
    }
  })

  const rows = (block.rows || []).map((row, rowIndex) => ({
    uid: row.uid || `${tableSeed}-r${rowIndex + 1}`,
    cells: (row.cells || []).map((cell, cellIndex, rowCells) => {
      const span = Math.max(1, Number(cell.colspan) || 1)
      const startColumn = rowCells
        .slice(0, cellIndex)
        .reduce((sum, item) => sum + Math.max(1, Number(item.colspan) || 1), 0)
      const width = columnWidths
        .slice(startColumn, startColumn + span)
        .reduce((sum, value) => sum + value, 0)
      const figureSegment = (cell.segments || []).find(segment => segment.type === 'figure')
      return {
        ...cell,
        uid: cell.uid || `${tableSeed}-r${rowIndex + 1}-c${cellIndex + 1}`,
        width,
        figure: figureSegment || null,
        lines: figureSegment
          ? []
          : prepareLines(
              cell.segments,
              `${tableSeed}-r${rowIndex + 1}-c${cellIndex + 1}`,
              Math.max(80, width - TABLE_CELL_PADDING),
              TABLE_FORMULA_MIN_SCALE
            )
      }
    })
  }))

  return {
    ...block,
    tableWidth,
    columns,
    rows
  }
}

function plainSegmentText(segments) {
  return (segments || [])
    .map(segment => (segment.type === 'text' ? segment.text : ''))
    .join('')
    .trim()
}

function prepareFunctionCards(block, sectionId, blockIndex) {
  const dataSeed = `${sectionId}-function-cards-${blockIndex + 1}`
  const labels = (block.columns || []).map(column => plainSegmentText(column.segments))
  const cards = []

  ;(block.rows || []).forEach((row, rowIndex) => {
    const cells = row.cells || []
    for (let groupStart = 0; groupStart < cells.length; groupStart += 3) {
      const functionCell = cells[groupStart]
      const figureCell = cells[groupStart + 1]
      const detailCell = cells[groupStart + 2]
      if (!functionCell || !figureCell || !detailCell) continue

      const cardSeed = `${dataSeed}-r${rowIndex + 1}-g${Math.floor(groupStart / 3) + 1}`
      const figure = (figureCell.segments || []).find(segment => segment.type === 'figure')
      const labelOffset = groupStart % 3
      cards.push({
        uid: cardSeed,
        labels: {
          function: labels[labelOffset] || '函数',
          figure: labels[labelOffset + 1] || '图象',
          detail: labels[labelOffset + 2] || '单调性与极值情况'
        },
        functionLines: prepareLines(
          functionCell.segments,
          `${cardSeed}-function`,
          FUNCTION_CARD_INNER_WIDTH,
          FUNCTION_CARD_FORMULA_MIN_SCALE
        ),
        figure: figure || null,
        detailLines: prepareLines(
          detailCell.segments,
          `${cardSeed}-detail`,
          FUNCTION_CARD_INNER_WIDTH,
          FUNCTION_CARD_FORMULA_MIN_SCALE
        )
      })
    }
  })

  return {
    ...block,
    uid: `${sectionId}-block-${blockIndex + 1}`,
    cardMode: 'function-cards',
    cards
  }
}

function blockPlainText(block) {
  return plainSegmentText(block && block.segments)
}

function createFeatureGroups(blocks, sectionId) {
  const groups = []
  let current = null

  function flush() {
    if (!current) return
    groups.push({
      uid: `${sectionId}-group-${groups.length + 1}`,
      kind: 'feature',
      blocks: current
    })
    current = null
  }

  function pushStandalone(block, kind) {
    flush()
    groups.push({
      uid: `${sectionId}-group-${groups.length + 1}`,
      kind,
      blocks: [block]
    })
  }

  ;(blocks || []).forEach(block => {
    if (block.type === 'label') {
      pushStandalone(block, 'label')
      return
    }
    if (block.type === 'note') {
      pushStandalone(block, 'note')
      return
    }
    if (block.type === 'paragraph') {
      const startsNewGroup = /^(模型[一二三四五六七八九十]|推论\s*\d)/.test(blockPlainText(block))
      if (!current || startsNewGroup) {
        flush()
        current = [block]
      } else {
        current.push(block)
      }
      return
    }
    if (block.type === 'formula' && current && current[0].type === 'paragraph') {
      current.push(block)
      return
    }

    flush()
    current = [block]
  })
  flush()

  return groups
}

function createPlainGroups(blocks, sectionId) {
  return [{
    uid: `${sectionId}-group-1`,
    kind: 'plain',
    blocks
  }]
}

function prepareModule(source) {
  const module = clone(source)
  const layoutVariant = String(module.layoutVariant || '')
  module.sections = module.sections.map(section => {
    const blocks = section.blocks.map((block, blockIndex) => {
        const uid = `${section.id}-block-${blockIndex + 1}`
        if (block.type === 'table') {
          if (layoutVariant === 'function-cards') {
            return prepareFunctionCards(block, section.id, blockIndex)
          }
          return prepareTable(block, section.id, blockIndex)
        }
        if (['paragraph', 'note', 'label', 'subheading'].includes(block.type)) {
          return {
            ...block,
            uid,
            lines: prepareLines(
              block.segments,
              `${section.id}-b${blockIndex + 1}`,
              BODY_MAX_FORMULA_WIDTH
            )
          }
        }
        if (block.type === 'figure') {
          const width = Math.max(1, Number(block.width) || 1)
          const height = Math.max(1, Number(block.height) || 1)
          const aspect = width / height
          const isWideFigure = aspect >= WIDE_FIGURE_ASPECT
          return {
            ...block,
            uid,
            isWideFigure,
            renderWidth: isWideFigure
              ? WIDE_FIGURE_DISPLAY_WIDTH
              : BODY_MAX_FORMULA_WIDTH,
            renderHeight: isWideFigure
              ? Math.round(WIDE_FIGURE_DISPLAY_WIDTH / aspect)
              : height
          }
        }
        return {
          ...block,
          uid
        }
    })
    return {
      ...section,
      titleLines: prepareLines(
        section.titleSegments,
        `${section.id}-title`,
        BODY_MAX_FORMULA_WIDTH
      ),
      blocks,
      groups: layoutVariant === 'feature-cards'
        ? createFeatureGroups(blocks, section.id)
        : createPlainGroups(blocks, section.id)
    }
  })
  return module
}

Page({
  data: {
    module: null,
    notFound: false
  },

  onLoad(options) {
    const source = modules.find(item => item.id === options.id)
    if (!source) {
      this.setData({ notFound: true })
      return
    }
    const module = prepareModule(source)
    this.topicId = module.id
    this.setData({ module })
    wx.setNavigationBarTitle({
      title: `第 ${module.order} 篇`
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.module ? this.data.module.title : '数学专项',
      path: this.data.module
        ? `/${this.data.module.packageRoot}/pages/detail/detail?id=${this.topicId || ''}`
        : '/pages/topics/topics'
    }
  }
})
