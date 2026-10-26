/*
 * 24 个专项上线前校验。
 *
 * - 源数据与三个小程序的专项分包结构一致
 * - K01-K24 完整、每篇 1-5 小节
 * - 原文文本块、表格、图片和公式资源完整
 * - 所有源公式可被 MathJax 渲染
 * - 每个分包低于 2 MB
 * - 专项目录、详情页和启动页只保留约定界面
 */

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
const SOURCE_FILE = path.join(ROOT, 'extract/topic-source/topics.json')
const SOURCE_FIGURE_ROOT = path.join(ROOT, 'extract/topic-source/figures')
const BUILD_ROOT = path.join(ROOT, 'extract/build/topics')
const REPORT_FILE = path.join(BUILD_ROOT, 'validation-report.json')
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
const MAX_PACKAGE_BYTES = 2 * 1024 * 1024
const MAX_FORMULA_PART_WIDTH = 323
const FORBIDDEN_WORDS = ['辅导', '课程', '提分', '名师', '押题', '卖课']
const TEXT_BLOCK_TYPES = new Set(['paragraph', 'note', 'label', 'subheading'])
const BLOCK_TYPES = new Set([...TEXT_BLOCK_TYPES, 'formula', 'table', 'figure'])

const errors = []
const stats = {
  topics: 0,
  sections: 0,
  formulas: 0,
  tableFormulas: 0,
  figures: 0,
  mathChecked: 0,
  assetsChecked: 0
}

function fail(message) {
  errors.push(message)
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function directorySize(dir) {
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const target = path.join(dir, entry.name)
    return total + (entry.isDirectory() ? directorySize(target) : fs.statSync(target).size)
  }, 0)
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(target) : [target]
  })
}

function checkPlainText(label, value) {
  const text = String(value == null ? '' : value)
  if (!text) return
  if (/\$[^$\n]*\$|\\[A-Za-z]+/.test(text)) {
    fail(`${label} 仍有未渲染的公式源码: ${text}`)
  }
}

function checkSourceText(label, text) {
  if (typeof text !== 'string' || !text.trim()) {
    fail(`${label} 缺少原文文本`)
  }
}

function svgSize(file) {
  const text = fs.readFileSync(file, 'utf8')
  const svgTag = text.match(/<svg\b[^>]*>/i)
  if (!svgTag) return null
  const widthMatch = svgTag[0].match(/\swidth="([0-9.]+)"/i)
  const heightMatch = svgTag[0].match(/\sheight="([0-9.]+)"/i)
  if (!widthMatch || !heightMatch) return null
  return {
    width: Number(widthMatch[1]),
    height: Number(heightMatch[1])
  }
}

function assetFile(asset, packageRoot) {
  if (!asset || !asset.startsWith(`/${packageRoot}/`)) {
    fail(`资源路径不属于 ${packageRoot}: ${asset || '(空)'}`)
    return ''
  }
  return path.join(PROJECT_ROOT, asset.slice(1))
}

function checkFormulaAsset(segment, packageRoot, label) {
  const file = assetFile(segment.asset, packageRoot)
  if (!file || !fs.existsSync(file)) {
    fail(`${label} 公式资源不存在: ${segment.asset}`)
    return
  }
  if (path.extname(file).toLowerCase() !== '.svg') {
    fail(`${label} 公式资源必须为 SVG: ${segment.asset}`)
    return
  }
  const size = svgSize(file)
  if (!size) {
    fail(`${label} 公式 SVG 文件损坏: ${segment.asset}`)
    return
  }
  if (
    Math.abs(Number(segment.width) - size.width) > 1
    || Math.abs(Number(segment.height) - size.height) > 1
  ) {
    fail(
      `${label} 宽高不一致: 数据 ${segment.width}x${segment.height}, `
      + `SVG ${size.width}x${size.height}`
    )
  }
  stats.assetsChecked += 1
}

function canonicalFormula(expression) {
  return String(expression || '')
    .replace(/\\q?quad\b/g, '')
    .replace(/\\begin\{cases\}/g, '')
    .replace(/\\end\{cases\}/g, '')
    .replace(/\\\\/g, '')
    .replace(/\s+/g, '')
}

function isFormulaSpacer(expression) {
  return /^\\(?:q?quad)\s*$/.test(String(expression || '').trim())
}

function checkFormulaParts(block, sourceTex, packageRoot, label) {
  if (!Array.isArray(block.parts) || !block.parts.length) {
    fail(`${label} 缺少多行公式 parts`)
    return
  }

  block.parts.forEach((part, index) => {
    const partLabel = `${label}/第 ${index + 1} 行`
    if (typeof part.latex !== 'string' || !part.latex.trim()) {
      fail(`${partLabel} 缺少 latex`)
      return
    }
    if (isFormulaSpacer(part.latex)) {
      fail(`${partLabel} 含独立排版空白`)
    }
    if (Number(part.width) > MAX_FORMULA_PART_WIDTH) {
      fail(`${partLabel} 宽度 ${part.width}px 超过 ${MAX_FORMULA_PART_WIDTH}px`)
    }
    checkFormulaAsset(part, packageRoot, partLabel)
    checkMath(partLabel, part.latex)
  })

  const rendered = canonicalFormula(block.parts.map(part => part.latex).join(''))
  const expected = canonicalFormula(sourceTex)
  if (rendered !== expected) {
    fail(`${label} 换行后内容与源公式不一致`)
  }
}

function checkFigureAsset(segment, packageRoot, label) {
  const file = assetFile(segment.asset, packageRoot)
  if (!file || !fs.existsSync(file)) {
    fail(`${label} 图片资源不存在: ${segment.asset}`)
    return
  }
  if (path.extname(file).toLowerCase() !== '.svg') {
    fail(`${label} 图片资源必须为 SVG: ${segment.asset}`)
    return
  }
  const size = svgSize(file)
  if (!size) {
    fail(`${label} SVG 文件损坏: ${segment.asset}`)
    return
  }
  const expectedRatio = Number(segment.width) / Number(segment.height)
  const actualRatio = size.width / size.height
  if (
    Number.isFinite(expectedRatio)
    && Number.isFinite(actualRatio)
    && Math.abs(expectedRatio - actualRatio) / expectedRatio > 0.02
  ) {
    fail(
      `${label} 图片比例不一致: 数据 ${segment.width}x${segment.height}, `
      + `SVG ${size.width}x${size.height}`
    )
  }
  stats.assetsChecked += 1
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

function checkMath(label, expression) {
  try {
    const output = adaptor.outerHTML(mathDocument.convert(`\\displaystyle ${expression}`, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 100000
    }))
    if (!/<svg\b/.test(output) || !/\sviewBox="[^"]+"/.test(output)) {
      throw new Error('MathJax 未返回有效 SVG')
    }
    stats.mathChecked += 1
  } catch (error) {
    fail(`${label} MathJax 渲染失败: ${error.message}`)
  }
}

function checkInlineMath(label, text) {
  const source = String(text == null ? '' : text)
  const pattern = /\$([^$\n]+)\$/g
  let match
  let index = 0
  while ((match = pattern.exec(source))) {
    index += 1
    checkMath(`${label}/行内公式 ${index}`, match[1])
  }
}

function validateSegments(segments, packageRoot, label, inTable, allowEmpty = false) {
  if (!Array.isArray(segments) || !segments.length) {
    if (!inTable && !allowEmpty) fail(`${label} 缺少 segments`)
    return
  }
  segments.forEach((segment, index) => {
    if (segment.type === 'text') {
      if (typeof segment.text !== 'string') fail(`${label}/片段 ${index + 1} 缺少 text`)
      checkPlainText(`${label}/片段 ${index + 1}`, segment.text)
      return
    }
    if (segment.type === 'formula') {
      if (inTable) stats.tableFormulas += 1
      else stats.formulas += 1
      checkFormulaAsset(segment, packageRoot, `${label}/片段 ${index + 1}`)
      return
    }
    if (segment.type === 'figure') {
      stats.figures += 1
      checkFigureAsset(segment, packageRoot, `${label}/片段 ${index + 1}`)
      return
    }
    fail(`${label}/片段 ${index + 1} 类型错误: ${segment.type}`)
  })
}

function validateSourceModule(module) {
  if (!/^K(0[1-9]|1[0-9]|2[0-4])$/.test(module.id)) {
    fail(`专项编号格式错误: ${module.id}`)
  }
  checkSourceText(`${module.id}.title`, module.title)
  if (!Array.isArray(module.sections) || module.sections.length < 1 || module.sections.length > 5) {
    fail(`${module.id} 小节数应为 1-5`)
    return
  }
  ;(module.sourcePages || []).forEach(page => {
    if (page < 3 || page > 32) fail(`${module.id} 页码越界: ${page}`)
  })
  module.sections.forEach(section => {
    if (String(section.title || '').trim()) {
      checkInlineMath(`${section.id}.title`, section.title)
    }
    section.blocks.forEach((block, blockIndex) => {
      const label = `${section.id}.block[${blockIndex + 1}]`
      if (!BLOCK_TYPES.has(block.type)) {
        fail(`${label} 类型错误: ${block.type}`)
        return
      }
      if (TEXT_BLOCK_TYPES.has(block.type)) {
        checkSourceText(label, block.text)
        checkInlineMath(label, block.text)
      }
      if (block.type === 'formula') {
        if (!block.tex) fail(`${label} 缺少公式`)
        else checkMath(label, block.tex)
      }
      if (block.type === 'figure') {
        const key = String(block.assetKey || '')
        const exists = ['.png', '.webp', '.jpg', '.jpeg'].some(extension => (
          fs.existsSync(path.join(SOURCE_FIGURE_ROOT, `${key}${extension}`))
        ))
        if (!key || !exists) fail(`${label} 源图片不存在: ${key || '(空)'}`)
      }
      if (block.type === 'table') {
        if (!Array.isArray(block.columns) || block.columns.length < 2) {
          fail(`${label} 表格列数不足`)
        }
        ;(block.columns || []).forEach((column, columnIndex) => {
          const value = column && typeof column === 'object' ? column.text : column
          if (String(value == null ? '' : value).trim()) {
            checkInlineMath(`${label}.column[${columnIndex + 1}]`, value)
          }
        })
        if (!Array.isArray(block.rows) || !block.rows.length) fail(`${label} 表格没有数据行`)
        ;(block.rows || []).forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            const cellLabel = `${label}.cell[${rowIndex + 1}][${cellIndex + 1}]`
            if (cell && typeof cell === 'object' && cell.type === 'figure') {
              const key = String(cell.assetKey || '')
              const exists = ['.png', '.webp', '.jpg', '.jpeg'].some(extension => (
                fs.existsSync(path.join(SOURCE_FIGURE_ROOT, `${key}${extension}`))
              ))
              if (!key || !exists) fail(`${cellLabel} 源图片不存在: ${key || '(空)'}`)
              return
            }
            const value = cell && typeof cell === 'object' ? cell.text : cell
            if (String(value == null ? '' : value).trim()) {
              checkInlineMath(cellLabel, value)
            }
            if (cell && typeof cell === 'object') {
              const span = Number(cell.colspan || 1)
              if (!Number.isInteger(span) || span < 1 || span > block.columns.length) {
                fail(`${cellLabel} colspan 无效: ${cell.colspan}`)
              }
            }
          })
        })
      }
    })
  })
}

function validateRuntimeModule(module, expectedPackage, sourceModule) {
  stats.topics += 1
  stats.sections += module.sections.length
  if (!/^K(0[1-9]|1[0-9]|2[0-4])$/.test(module.id)) {
    fail(`专项编号格式错误: ${module.id}`)
  }
  if (module.packageRoot !== expectedPackage) {
    fail(`${module.id} packageRoot 错误: ${module.packageRoot}`)
  }
  if (!module.title) fail(`${module.id} 缺少标题`)
  checkPlainText(`${module.id}.title`, module.title)
  if (module.sections.length < 1 || module.sections.length > 5) {
    fail(`${module.id} 小节数应为 1-5，实际 ${module.sections.length}`)
  }
  ;(module.sourcePages || []).forEach(page => {
    if (page < 3 || page > 32) fail(`${module.id} 页码越界: ${page}`)
  })
  if (
    Object.prototype.hasOwnProperty.call(module, 'domain')
    || Object.prototype.hasOwnProperty.call(module, 'intro')
    || Object.prototype.hasOwnProperty.call(module, 'pitfall')
    || Object.prototype.hasOwnProperty.call(module, 'boundary')
    || Object.prototype.hasOwnProperty.call(module, 'keywords')
  ) {
    fail(`${module.id} 含已移除的生成字段`)
  }

  module.sections.forEach((section, sectionIndex) => {
    const sectionLabel = `${module.id}/${section.id || sectionIndex + 1}`
    validateSegments(
      section.titleSegments,
      expectedPackage,
      `${sectionLabel}/标题`,
      false,
      true
    )
    section.blocks.forEach((block, blockIndex) => {
      const label = `${sectionLabel}/block[${blockIndex + 1}]`
      if (!BLOCK_TYPES.has(block.type)) {
        fail(`${label} 类型错误: ${block.type}`)
        return
      }
      if (TEXT_BLOCK_TYPES.has(block.type)) {
        validateSegments(block.segments, expectedPackage, label, false)
      }
      if (block.type === 'formula') {
        stats.formulas += 1
        const sourceBlock = sourceModule
          && sourceModule.sections[sectionIndex]
          && sourceModule.sections[sectionIndex].blocks[blockIndex]
        if (!sourceBlock || sourceBlock.type !== 'formula') {
          fail(`${label} 无法与源公式对应`)
        } else {
          checkFormulaParts(block, sourceBlock.tex, expectedPackage, label)
        }
      }
      if (block.type === 'figure') {
        stats.figures += 1
        checkFigureAsset(block, expectedPackage, label)
      }
      if (block.type === 'table') {
        if (!Array.isArray(block.columns) || block.columns.length < 2) {
          fail(`${label} 表格列数不足`)
        }
        ;(block.columns || []).forEach((column, columnIndex) => {
          validateSegments(
            column.segments,
            expectedPackage,
            `${label}/列头 ${columnIndex + 1}`,
            true
          )
        })
        if (!Array.isArray(block.rows) || !block.rows.length) fail(`${label} 表格没有数据行`)
        ;(block.rows || []).forEach((row, rowIndex) => {
          if (!Array.isArray(row.cells) || !row.cells.length) {
            fail(`${label}/第 ${rowIndex + 1} 行缺少单元格`)
            return
          }
          row.cells.forEach((cell, cellIndex) => {
            validateSegments(
              cell.segments,
              expectedPackage,
              `${label}/单元格 ${rowIndex + 1}-${cellIndex + 1}`,
              true
            )
            if (!Number.isInteger(Number(cell.colspan)) || Number(cell.colspan) < 1) {
              fail(`${label}/单元格 ${rowIndex + 1}-${cellIndex + 1} colspan 无效`)
            }
          })
        })
      }
    })
  })
}

function checkSourceRules(source) {
  const byId = new Map(source.modules.map(module => [module.id, module]))
  const k22 = byId.get('K22')
  if (k22) {
    const blocks = k22.sections.flatMap(section => section.blocks)
    if (blocks.filter(block => block.type === 'subheading').length !== 7) {
      fail('K22 应保留七种解题方法')
    }
    if (!blocks.some(block => block.type === 'table')) {
      fail('K22 缺少“不同元素分组”表格')
    }
  }

  const k23 = byId.get('K23')
  if (k23 && JSON.stringify(k23).includes('贝叶斯')) {
    fail('K23 原文没有贝叶斯公式，不应新增')
  }

  const k24 = byId.get('K24')
  if (k24) {
    const tables = k24.sections.flatMap(section => section.blocks)
      .filter(block => block.type === 'table')
    if (tables.length !== 1 || tables[0].columns.length !== 3 || tables[0].rows.length !== 7) {
      fail('K24 应保留完整的 3 列 7 行分布对照表')
      return
    }
    const table = tables[0]
    const relation = table.rows[5]
    const identify = table.rows[6]
    if (
      !relation
      || relation[0] !== '联系'
      || !relation[1]
      || Number(relation[1].colspan) !== 2
      || !identify
      || identify[0] !== '识别'
      || !identify[1]
      || Number(identify[1].colspan) !== 2
    ) {
      fail('K24 “联系/识别”两行的合并单元格结构错误')
    }
  }
}

function checkProjectConfig() {
  const app = readJson(path.join(PROJECT_ROOT, 'app.json'))
  if (!app.pages.includes('pages/topics/topics')) {
    fail('app.json 未登记 pages/topics/topics')
  }
  const tabLabels = (app.tabBar.list || []).map(item => item.text)
  const expectedTabs = ['公式', '专项', '收藏', '练习']
  if (JSON.stringify(tabLabels) !== JSON.stringify(expectedTabs)) {
    fail(`tabBar 顺序应为 ${expectedTabs.join('/')}，实际 ${tabLabels.join('/')}`)
  }
  const topicTab = app.tabBar.list.find(item => item.text === '专项')
  if (!topicTab || topicTab.pagePath !== 'pages/topics/topics') {
    fail('tabBar 的“专项”没有指向 pages/topics/topics')
  }
  PACKAGE_ROOTS.forEach(packageRoot => {
    const packageConfig = (app.subPackages || []).find(item => item.root === packageRoot)
    if (!packageConfig || !packageConfig.pages.includes('pages/detail/detail')) {
      fail(`app.json 未登记专项分包: ${packageRoot}`)
    }
  })
}

function checkPackage(packageRoot, expectedModuleCount) {
  const packageDir = path.join(PROJECT_ROOT, packageRoot)
  if (!fs.existsSync(packageDir)) {
    fail(`专项分包目录不存在: ${packageRoot}`)
    return
  }
  const bytes = directorySize(packageDir)
  if (bytes >= MAX_PACKAGE_BYTES) {
    fail(`${packageRoot} 体积 ${bytes} B，达到或超过 2 MB`)
  }
  const pageBase = path.join(packageDir, 'pages/detail/detail')
  ;['js', 'json', 'wxml', 'wxss'].forEach(extension => {
    if (!fs.existsSync(`${pageBase}.${extension}`)) {
      fail(`${packageRoot} 缺少详情页文件: detail.${extension}`)
    }
  })
  const pageConfig = readJson(`${pageBase}.json`)
  const component = pageConfig.usingComponents
    && pageConfig.usingComponents['formula-image']
  if (component !== '/components/formula-image/formula-image') {
    fail(`${packageRoot} formula-image 组件路径错误`)
  }
  const runtime = require(path.join(packageDir, 'data/topics.js'))
  if (!runtime.modules || runtime.modules.length !== expectedModuleCount) {
    fail(`${packageRoot} 运行时应包含 ${expectedModuleCount} 篇专项，实际 ${runtime.modules ? runtime.modules.length : 0}`)
  }
}

function checkCatalog(source) {
  const catalog = require(path.join(PROJECT_ROOT, 'data/topics.js')).TOPICS
  if (!Array.isArray(catalog) || catalog.length !== 24) {
    fail(`专项目录应为 24 篇，实际 ${catalog ? catalog.length : 0}`)
    return
  }
  const expectedKeys = ['id', 'order', 'packageRoot', 'route', 'title']
  catalog.forEach((item, index) => {
    const keys = Object.keys(item).sort()
    if (JSON.stringify(keys) !== JSON.stringify([...expectedKeys].sort())) {
      fail(`目录第 ${index + 1} 项字段多余或缺失: ${keys.join(',')}`)
    }
    const sourceModule = source.modules.find(module => module.id === item.id)
    if (!sourceModule || sourceModule.title !== item.title || sourceModule.order !== item.order) {
      fail(`目录第 ${index + 1} 项与源数据不一致`)
    }
    if (item.route !== `/${item.packageRoot}/pages/detail/detail`) {
      fail(`目录第 ${index + 1} 项详情路由错误`)
    }
  })
}

function checkPageCopy() {
  const topicsWxml = fs.readFileSync(
    path.join(PROJECT_ROOT, 'pages/topics/topics.wxml'),
    'utf8'
  )
  if (
    !topicsWxml.includes('{{item.displayOrder}}')
    || !topicsWxml.includes('{{item.title}}')
    || !topicsWxml.includes('24 篇')
  ) {
    fail('专项目录页没有显示“编号 + 原文标题 + 总篇数”')
  }
  ;['搜索', '知识领域', '共 {{resultCount}} 篇', 'shortTitle'].forEach(text => {
    if (topicsWxml.includes(text)) fail(`专项目录页仍含旧界面: ${text}`)
  })

  const loaderWxml = fs.readFileSync(
    path.join(PROJECT_ROOT, 'components/package-loader/package-loader.wxml'),
    'utf8'
  )
  if (!loaderWxml.includes('title-math-universe.png')) {
    fail('启动页没有使用黑色“数学连接宇宙”标题')
  }
  ;['loader-progress-track', 'loader-progress-value', '{{progress}}'].forEach(text => {
    if (!loaderWxml.includes(text)) fail(`启动页缺少进度条: ${text}`)
  })
  ;['title-math-universe-color.png', 'loader-error', 'loader-retry', '重新加载', '正在准备'].forEach(text => {
    if (loaderWxml.includes(text)) fail(`启动页仍含旧内容: ${text}`)
  })
  ;[
    'title-math-universe.png',
    'pi-mark.png'
  ].forEach(file => {
    if (!fs.existsSync(path.join(PROJECT_ROOT, 'assets/startup', file))) {
      fail(`启动页资源不存在: ${file}`)
    }
  })
}

function checkForbiddenWords() {
  const relevantRoots = [
    path.join(PROJECT_ROOT, 'pages/topics'),
    path.join(PROJECT_ROOT, 'pages/startup'),
    path.join(PROJECT_ROOT, 'components/package-loader'),
    path.join(PROJECT_ROOT, 'data/topics.js'),
    ...PACKAGE_ROOTS.map(packageRoot => path.join(PROJECT_ROOT, packageRoot, 'data')),
    ...PACKAGE_ROOTS.map(packageRoot => path.join(PROJECT_ROOT, packageRoot, 'pages/detail'))
  ]
  const textExtensions = new Set(['.js', '.json', '.wxml', '.wxss'])
  const files = relevantRoots.flatMap(target => (
    fs.existsSync(target) && fs.statSync(target).isDirectory() ? listFiles(target) : [target]
  )).filter(file => textExtensions.has(path.extname(file).toLowerCase()))

  files.forEach(file => {
    const text = fs.readFileSync(file, 'utf8')
    FORBIDDEN_WORDS.forEach(word => {
      if (text.includes(word)) fail(`${file} 出现违禁词: ${word}`)
    })
  })
}

function finish(packages) {
  const validation = {
    ok: errors.length === 0,
    generatedAt: new Date().toISOString(),
    errors,
    stats,
    packages
  }
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true })
  fs.writeFileSync(REPORT_FILE, `${JSON.stringify(validation, null, 2)}\n`, 'utf8')

  if (errors.length) {
    console.error(JSON.stringify(validation, null, 2))
    process.exitCode = 1
    return
  }
  console.log(JSON.stringify(validation, null, 2))
}

function main() {
  const source = readJson(SOURCE_FILE)
  if (!source.modules || source.modules.length !== 24) {
    fail(`源数据专项数应为 24，实际 ${source.modules ? source.modules.length : 0}`)
    return finish([])
  }
  const ids = source.modules.map(module => module.id).sort()
  const expectedIds = Array.from({ length: 24 }, (_, index) => (
    `K${String(index + 1).padStart(2, '0')}`
  ))
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
    fail(`专项编号不是完整的 K01-K24: ${ids.join(',')}`)
  }

  source.modules.forEach(validateSourceModule)
  checkSourceRules(source)

  const sourcePackages = new Map()
  PACKAGE_ROOTS.forEach(packageRoot => {
    const sourceFile = path.join(BUILD_ROOT, packageRoot, 'topics.json')
    if (fs.existsSync(sourceFile)) {
      sourcePackages.set(packageRoot, readJson(sourceFile).modules || [])
    }
  })

  PACKAGE_ROOTS.forEach(packageRoot => {
    const expectedModules = sourcePackages.get(packageRoot) || []
    checkPackage(packageRoot, expectedModules.length)
    const runtimeFile = path.join(PROJECT_ROOT, packageRoot, 'data/topics.js')
    if (!fs.existsSync(runtimeFile)) return
    const runtime = require(runtimeFile)
    ;(runtime.modules || []).forEach(module => (
      validateRuntimeModule(
        module,
        packageRoot,
        source.modules.find(sourceModule => sourceModule.id === module.id)
      )
    ))
  })

  checkProjectConfig()
  checkCatalog(source)
  checkPageCopy()
  checkForbiddenWords()

  const report = readJson(path.join(BUILD_ROOT, 'build-report.json'))
  Object.keys(stats).forEach(key => {
    if (key !== 'mathChecked' && key !== 'assetsChecked' && report[key] !== stats[key]) {
      fail(`构建报告 ${key}=${report[key]}，校验统计=${stats[key]}`)
    }
  })

  return finish(PACKAGE_ROOTS.map(packageRoot => ({
    packageRoot,
    bytes: directorySize(path.join(PROJECT_ROOT, packageRoot))
  })))
}

main()
