/*
 * Validate the mini program formula data and its generated SVG assets.
 *
 * Usage: node extract/validate_assets.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PROJECT = path.join(ROOT, '新建文件夹')
const DATA_FILE = path.join(PROJECT, 'data', 'formulas.js')
const EXPECTED_COUNT = 351
const PACKAGE_NAMES = [
  'formula-package-a',
  'formula-package-b',
  'formula-package-c'
]
const ASSET_FIELDS = [
  ['formulaImage', 'formulaWidth', 'formulaHeight'],
  ['blankImage', 'blankWidth', 'blankHeight'],
  ['exampleImage', 'exampleWidth', 'exampleHeight']
]
const ASSET_PATH = /^\/formula-package-[abc]\/assets\/formulas\/[a-z0-9-]+\.svg$/
const FORMULA_ID = /^([CS])(\d{3})$/

const errors = []
const warnings = []
const referencedAssets = new Set()

function fail(message) {
  errors.push(message)
}

function validateId(item) {
  const match = FORMULA_ID.exec(item.id)
  if (!match) {
    fail(`Invalid formula id: ${item.id}`)
    return
  }

  const number = Number(match[2])
  if (match[1] === 'C' && (number < 1 || number > 253)) {
    fail(`Core formula id is out of range: ${item.id}`)
  }
  if (match[1] === 'S' && (number < 1 || number > 113)) {
    fail(`Conclusion id is out of range: ${item.id}`)
  }
}

function validateDimensions(item, label, asset, widthField, heightField) {
  const width = Number(item[widthField])
  const height = Number(item[heightField])

  if (!asset) {
    if (width || height) {
      warnings.push(
        `${item.id} ${label}: empty asset has non-zero dimensions ${width}x${height}`
      )
    }
    return
  }

  if (!ASSET_PATH.test(asset)) {
    fail(`${item.id} ${label}: invalid asset path ${asset}`)
    return
  }

  if (!width || !height) {
    fail(`${item.id} ${label}: missing logical dimensions`)
    return
  }

  const absolute = path.resolve(PROJECT, asset.slice(1))
  const relative = path.relative(PROJECT, absolute)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`${item.id} ${label}: asset path escapes project ${asset}`)
    return
  }

  referencedAssets.add(asset)
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
for (const item of FORMULAS) {
  if (!item || typeof item.id !== 'string') {
    fail('Found a formula without a string id')
    continue
  }
  if (ids.has(item.id)) {
    fail(`Duplicate formula id: ${item.id}`)
  }
  ids.add(item.id)
  validateId(item)

  if (!item.formulaImage) {
    fail(`${item.id}: missing formulaImage`)
  }

  for (const [assetField, widthField, heightField] of ASSET_FIELDS) {
    validateDimensions(item, assetField, item[assetField], widthField, heightField)
  }
}

let assetBytes = 0
const assetFiles = new Set()
for (const packageName of PACKAGE_NAMES) {
  const dir = path.join(PROJECT, packageName, 'assets', 'formulas')
  if (!fs.existsSync(dir)) {
    fail(`Missing package directory: /${packageName}/assets/formulas`)
    continue
  }

  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name)
    if (!name.endsWith('.svg') || !fs.statSync(file).isFile()) continue
    const asset = `/${packageName}/assets/formulas/${name}`
    assetFiles.add(asset)
    assetBytes += fs.statSync(file).size
  }
}

for (const asset of assetFiles) {
  if (!referencedAssets.has(asset)) {
    warnings.push(`Unreferenced SVG asset: ${asset}`)
  }
}
for (const asset of referencedAssets) {
  if (!assetFiles.has(asset)) {
    fail(`Referenced asset is outside package files: ${asset}`)
  }
}

const result = {
  formulas: FORMULAS.length,
  uniqueIds: ids.size,
  referencedAssets: referencedAssets.size,
  assetFiles: assetFiles.size,
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
