/*
 * Validate the mini program data and its generated formula assets.
 *
 * Usage: node extract/validate_assets.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PROJECT = path.join(ROOT, '新建文件夹')
const DATA_FILE = path.join(PROJECT, 'data', 'formulas.js')
const EXPECTED_COUNT = 366
const ASSET_FIELDS = [
  ['formulaImage', 'formulaWidth', 'formulaHeight'],
  ['blankImage', 'blankWidth', 'blankHeight'],
  ['exampleImage', 'exampleWidth', 'exampleHeight']
]
const ASSET_PATH = /^\/formula-package-[abc]\/assets\/formulas\/[a-z0-9-]+\.svg$/

const errors = []
const warnings = []

function fail(message) {
  errors.push(message)
}

function validateDimensions(item, label, asset, widthField, heightField) {
  const width = Number(item[widthField])
  const height = Number(item[heightField])

  if (!asset) {
    if (width || height) {
      warnings.push(`${item.id} ${label}: empty asset has non-zero dimensions ${width}x${height}`)
    }
    return
  }

  if (!width || !height) {
    fail(`${item.id} ${label}: missing logical dimensions`)
    return
  }

  if (!ASSET_PATH.test(asset)) {
    fail(`${item.id} ${label}: invalid asset path ${asset}`)
    return
  }

  const absolute = path.resolve(PROJECT, asset.slice(1))
  const relative = path.relative(PROJECT, absolute)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`${item.id} ${label}: asset path escapes project ${asset}`)
    return
  }

  if (!fs.existsSync(absolute)) {
    fail(`${item.id} ${label}: missing file ${asset}`)
    return
  }

  const svg = fs.readFileSync(absolute, 'utf8')
  const match = svg.match(/\bwidth="([0-9.]+)"\s+height="([0-9.]+)"/)
  if (!match) {
    fail(`${item.id} ${label}: SVG has no numeric width/height ${asset}`)
    return
  }

  const svgWidth = Number(match[1])
  const svgHeight = Number(match[2])
  if (!svgWidth || !svgHeight) {
    fail(`${item.id} ${label}: invalid SVG dimensions ${svgWidth}x${svgHeight}`)
    return
  }

  const scaleX = svgWidth / width
  const scaleY = svgHeight / height
  if (Math.abs(scaleX - scaleY) > 0.01) {
    fail(
      `${item.id} ${label}: dimension ratio mismatch ` +
      `(SVG ${svgWidth}x${svgHeight}, data ${width}x${height})`
    )
  }
}

if (!fs.existsSync(DATA_FILE)) {
  console.error(`ERROR: data file not found: ${DATA_FILE}`)
  process.exit(1)
}

let data
try {
  data = require(DATA_FILE)
} catch (error) {
  console.error(`ERROR: cannot load data file: ${error.message}`)
  process.exit(1)
}

const { FORMULAS } = data
if (!Array.isArray(FORMULAS)) {
  console.error('ERROR: data/formulas.js does not export a FORMULAS array')
  process.exit(1)
}

if (FORMULAS.length !== EXPECTED_COUNT) {
  fail(`Expected ${EXPECTED_COUNT} formulas, found ${FORMULAS.length}`)
}

const ids = new Set()
const expectedIds = new Set()
for (let index = 1; index <= 253; index++) {
  expectedIds.add(`C${String(index).padStart(3, '0')}`)
}
for (let index = 1; index <= 113; index++) {
  expectedIds.add(`S${String(index).padStart(3, '0')}`)
}

for (const item of FORMULAS) {
  if (!item || typeof item.id !== 'string') {
    fail('Found a formula without a string id')
    continue
  }
  if (ids.has(item.id)) {
    fail(`Duplicate formula id: ${item.id}`)
  }
  ids.add(item.id)

  if (!item.formulaImage) {
    fail(`${item.id}: missing formulaImage`)
  }

  for (const [assetField, widthField, heightField] of ASSET_FIELDS) {
    validateDimensions(item, assetField, item[assetField], widthField, heightField)
  }
}

for (const id of expectedIds) {
  if (!ids.has(id)) fail(`Missing expected formula id: ${id}`)
}
for (const id of ids) {
  if (!expectedIds.has(id)) fail(`Unexpected formula id: ${id}`)
}

let assetBytes = 0
let assetFiles = 0
for (const packageName of ['formula-package-a', 'formula-package-b', 'formula-package-c']) {
  const dir = path.join(PROJECT, packageName, 'assets', 'formulas')
  if (!fs.existsSync(dir)) {
    fail(`Missing package directory: /${packageName}/assets/formulas`)
    continue
  }

  const files = fs.readdirSync(dir).filter(name => name.endsWith('.svg'))
  assetFiles += files.length
  for (const name of files) {
    assetBytes += fs.statSync(path.join(dir, name)).size
  }
}

const result = {
  formulas: FORMULAS.length,
  uniqueIds: ids.size,
  assetFiles,
  assetMB: Number((assetBytes / 1024 / 1024).toFixed(2)),
  errorCount: errors.length,
  errors: errors.slice(0, 30),
  warningCount: warnings.length,
  warnings: warnings.slice(0, 10)
}

console.log(JSON.stringify(result, null, 2))
if (errors.length) {
  process.exit(1)
}
