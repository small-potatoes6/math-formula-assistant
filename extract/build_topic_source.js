/*
 * Merge the per-topic verbatim source files into topics.json.
 *
 * Keeping one file per topic makes page-by-page transcription reviewable and
 * prevents accidental reuse of the old generated draft.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MODULE_ROOT = path.join(ROOT, 'extract/topic-source/modules')
const OUTPUT_FILE = path.join(ROOT, 'extract/topic-source/topics.json')
const PACKAGE_ROOTS = ['topic-package-a', 'topic-package-b', 'topic-package-c']

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function validateModule(module, expectedId) {
  if (module.id !== expectedId) {
    throw new Error(`${expectedId}: id mismatch (${module.id})`)
  }
  if (!PACKAGE_ROOTS.includes(module.packageRoot)) {
    throw new Error(`${expectedId}: invalid packageRoot`)
  }
  if (!module.title || !Array.isArray(module.sections) || !module.sections.length) {
    throw new Error(`${expectedId}: title and sections are required`)
  }
  module.sections.forEach((section, sectionIndex) => {
    if (!section.id || !Array.isArray(section.blocks) || !section.blocks.length) {
      throw new Error(`${expectedId}: invalid section ${sectionIndex + 1}`)
    }
    section.blocks.forEach((block, blockIndex) => {
      const label = `${expectedId}/${section.id}/block-${blockIndex + 1}`
      if (!['paragraph', 'note', 'subheading', 'label', 'formula', 'table', 'figure'].includes(block.type)) {
        throw new Error(`${label}: unsupported block type ${block.type}`)
      }
      if (block.type === 'formula' && !block.tex) {
        throw new Error(`${label}: formula tex is required`)
      }
      if (['paragraph', 'note', 'subheading', 'label'].includes(block.type) && !block.text) {
        throw new Error(`${label}: text is required`)
      }
      if (block.type === 'table' && (!Array.isArray(block.columns) || !Array.isArray(block.rows))) {
        throw new Error(`${label}: table columns and rows are required`)
      }
    })
  })
}

function main() {
  const files = fs.readdirSync(MODULE_ROOT)
    .filter(name => /^K\d{2}\.json$/.test(name))
    .sort()

  if (files.length !== 24) {
    throw new Error(`Expected 24 topic source files, got ${files.length}`)
  }

  const modules = files.map((name, index) => {
    const expectedId = `K${String(index + 1).padStart(2, '0')}`
    const module = readJson(path.join(MODULE_ROOT, name))
    validateModule(module, expectedId)
    return module
  })

  const output = {
    meta: {
      title: '高中数学 24 个解题专项',
      source: '知乎专栏 715220128，原图 03-32',
      transcription: '逐页对照原图转录；仅重新排版，不增删正文',
      count: modules.length
    },
    modules
  }

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({
    output: path.relative(ROOT, OUTPUT_FILE),
    modules: modules.length,
    sections: modules.reduce((sum, module) => sum + module.sections.length, 0),
    bytes: fs.statSync(OUTPUT_FILE).size
  }, null, 2))
}

main()
