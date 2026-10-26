/*
 * 将专项渲染结果接入微信小程序。
 *
 * 输入:
 *   extract/build/topics/topic-package-a|b|c/
 * 输出:
 *   新建文件夹/topic-package-a|b|c/
 *   新建文件夹/data/topics.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const BUILD_ROOT = path.join(ROOT, 'extract/build/topics')
const PROJECT_ROOT = path.join(ROOT, '新建文件夹')
const TEMPLATE_PAGE = path.join(ROOT, 'extract/topic-page-template/pages/detail')
const CATALOG_FILE = path.join(PROJECT_ROOT, 'data/topics.js')
const REPORT_FILE = path.join(BUILD_ROOT, 'build-report.json')
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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function directorySize(dir) {
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = path.join(dir, entry.name)
    return total + (entry.isDirectory() ? directorySize(entryPath) : fs.statSync(entryPath).size)
  }, 0)
}

function ensureInside(parent, target) {
  const relative = path.relative(path.resolve(parent), path.resolve(target))
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`目标目录越界: ${target}`)
  }
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds)
}

function replaceFileWithRetry(tempFile, targetFile) {
  let lastError
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.renameSync(tempFile, targetFile)
      return
    } catch (error) {
      lastError = error
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) break
      sleep(150 * (attempt + 1))
    }
  }
  throw lastError
}

function writeFileAtomicIfChanged(file, content) {
  if (fs.existsSync(file)) {
    const current = fs.readFileSync(file)
    const next = Buffer.isBuffer(content) ? content : Buffer.from(content)
    if (current.equals(next)) return false
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tempFile = `${file}.codex-${process.pid}-${Date.now()}.tmp`
  try {
    fs.writeFileSync(tempFile, content)
    replaceFileWithRetry(tempFile, file)
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
  }
  return true
}

function syncDirectory(source, destination) {
  ensureInside(PROJECT_ROOT, destination)
  fs.mkdirSync(destination, { recursive: true })
  fs.readdirSync(source, { withFileTypes: true }).forEach(entry => {
    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)
    if (entry.isDirectory()) {
      syncDirectory(sourcePath, destinationPath)
      return
    }
    if (entry.isFile()) {
      ensureInside(PROJECT_ROOT, destinationPath)
      writeFileAtomicIfChanged(destinationPath, fs.readFileSync(sourcePath))
    }
  })
}

function writeModuleData(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const content = `module.exports = ${JSON.stringify(value, null, 2)}\n`
  return writeFileAtomicIfChanged(file, content)
}

function countModule(module) {
  let formulaCount = 0
  let tableFormulaCount = 0
  let figureCount = 0

  function countSegments(segments, inTable) {
    ;(segments || []).forEach(segment => {
      if (segment.type === 'formula') {
        if (inTable) tableFormulaCount += 1
        else formulaCount += 1
      }
      if (segment.type === 'figure') figureCount += 1
    })
  }

  module.sections.forEach(section => {
    countSegments(section.titleSegments, false)
    section.blocks.forEach(block => {
      if (block.type === 'formula') formulaCount += 1
      if (['paragraph', 'note', 'subheading', 'label'].includes(block.type)) {
        countSegments(block.segments, false)
      }
      if (block.type === 'figure') figureCount += 1
      if (block.type === 'table') {
        ;(block.columns || []).forEach(column => {
          countSegments(column.segments, true)
        })
        block.rows.forEach(row => {
          ;(row.cells || []).forEach(cell => countSegments(cell.segments, true))
        })
      }
    })
  })

  return {
    sectionCount: module.sections.length,
    formulaCount,
    tableFormulaCount,
    figureCount
  }
}

function buildCatalog(modules) {
  return modules.map(module => ({
    id: module.id,
    order: module.order,
    packageRoot: module.packageRoot,
    route: `/${module.packageRoot}/pages/detail/detail`,
    title: module.title
  }))
}

function validateSourcePackages() {
  const packageData = new Map()
  const seen = new Set()
  const allModules = []

  PACKAGE_ROOTS.forEach(packageRoot => {
    const sourceFile = path.join(BUILD_ROOT, packageRoot, 'topics.json')
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`缺少渲染数据: ${sourceFile}`)
    }
    const source = readJson(sourceFile)
    if (!Array.isArray(source.modules) || source.modules.length < 1 || source.modules.length > 4) {
      throw new Error(`${packageRoot} 应包含 1-4 篇专项，实际 ${source.modules ? source.modules.length : 0}`)
    }
    source.modules.forEach(module => {
      if (module.packageRoot !== packageRoot) {
        throw new Error(`${module.id} 的 packageRoot 与目录不一致`)
      }
      if (seen.has(module.id)) {
        throw new Error(`专项编号重复: ${module.id}`)
      }
      const sections = module.sections || []
      if (sections.length < 1 || sections.length > 5) {
        throw new Error(`${module.id} 小节数应为 1-5，实际 ${sections.length}`)
      }
      seen.add(module.id)
      allModules.push(module)
    })
    packageData.set(packageRoot, source.modules)
  })

  if (allModules.length !== 24) {
    throw new Error(`专项总数应为 24，实际 ${allModules.length}`)
  }
  return packageData
}

function buildPackage(packageRoot, modules) {
  const sourceRoot = path.join(BUILD_ROOT, packageRoot)
  const targetRoot = path.join(PROJECT_ROOT, packageRoot)
  ensureInside(PROJECT_ROOT, targetRoot)

  syncDirectory(
    path.join(sourceRoot, 'assets'),
    path.join(targetRoot, 'assets')
  )
  syncDirectory(
    TEMPLATE_PAGE,
    path.join(targetRoot, 'pages/detail')
  )
  writeModuleData(
    path.join(targetRoot, 'data/topics.js'),
    { modules }
  )

  const bytes = directorySize(targetRoot)
  if (bytes >= MAX_PACKAGE_BYTES) {
    throw new Error(`${packageRoot} 体积 ${bytes} B，已达到或超过 2 MB`)
  }
  return {
    packageRoot,
    modules: modules.length,
    files: fs.readdirSync(targetRoot, { recursive: true })
      .filter(entry => fs.statSync(path.join(targetRoot, entry)).isFile())
      .length,
    bytes
  }
}

function main() {
  if (!fs.existsSync(TEMPLATE_PAGE)) {
    throw new Error(`缺少详情页模板: ${TEMPLATE_PAGE}`)
  }

  const packageData = validateSourcePackages()
  const allModules = PACKAGE_ROOTS.flatMap(packageRoot => packageData.get(packageRoot))
    .sort((a, b) => a.order - b.order)
  const catalog = buildCatalog(allModules)

  writeModuleData(CATALOG_FILE, { TOPICS: catalog })

  const packages = PACKAGE_ROOTS.map(packageRoot => (
    buildPackage(packageRoot, packageData.get(packageRoot))
  ))
  const totals = catalog.reduce((result, topic) => ({
    sections: result.sections,
    formulas: result.formulas,
    tableFormulas: result.tableFormulas,
    figures: result.figures
  }), { sections: 0, formulas: 0, tableFormulas: 0, figures: 0 })

  allModules.forEach(module => {
    const counts = countModule(module)
    totals.sections += counts.sectionCount
    totals.formulas += counts.formulaCount
    totals.tableFormulas += counts.tableFormulaCount
    totals.figures += counts.figureCount
  })

  const report = {
    generatedAt: new Date().toISOString(),
    topics: catalog.length,
    ...totals,
    catalogBytes: fs.statSync(CATALOG_FILE).size,
    packages
  }
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true })
  fs.writeFileSync(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

main()
