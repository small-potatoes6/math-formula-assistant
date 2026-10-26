/*
 * Render the generated K04 plot SVGs into one high-resolution contact sheet.
 * This is a visual QA helper only and does not affect the mini-program build.
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { K04_PLOTS } = require('./k04_function_plots')

const ROOT = path.resolve(__dirname, '..')
const FIGURE_DIR = path.join(
  ROOT,
  'extract/build/topics/topic-package-b/assets/figures'
)
const OUTPUT_FILE = path.join(
  ROOT,
  'extract/build/visual-qa/k04-functions-contact-sheet.png'
)
const COLUMNS = 5
const TILE_WIDTH = 480
const TILE_HEIGHT = 330
const IMAGE_WIDTH = 440
const IMAGE_HEIGHT = 302

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function main() {
  const plotKeys = Object.keys(K04_PLOTS)
  const figureFiles = fs
    .readdirSync(FIGURE_DIR)
    .filter(name => /^k04-fig-.*\.svg$/i.test(name))
    .sort()

  if (figureFiles.length !== plotKeys.length) {
    throw new Error(
      `Expected ${plotKeys.length} K04 plots, found ${figureFiles.length} SVG files`
    )
  }

  const rows = Math.ceil(figureFiles.length / COLUMNS)
  const composites = []

  for (let index = 0; index < figureFiles.length; index += 1) {
    const file = figureFiles[index]
    const key = plotKeys[index]
    const column = index % COLUMNS
    const row = Math.floor(index / COLUMNS)
    const x = column * TILE_WIDTH
    const y = row * TILE_HEIGHT
    const plot = await sharp(path.join(FIGURE_DIR, file), { density: 288 })
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: '#ffffff'
      })
      .png()
      .toBuffer()
    const label = `${String(index + 1).padStart(2, '0')}  ${key.replace(/^k04-[^-]+-/, '')}`
    const labelSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${TILE_HEIGHT}">` +
        `<rect width="${TILE_WIDTH}" height="${TILE_HEIGHT}" fill="#eef2f3"/>` +
        `<text x="20" y="24" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#27332f">${xmlEscape(label)}</text>` +
      `</svg>`
    )

    composites.push({ input: labelSvg, left: x, top: y })
    composites.push({
      input: plot,
      left: x + Math.round((TILE_WIDTH - IMAGE_WIDTH) / 2),
      top: y + 24
    })
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  await sharp({
    create: {
      width: COLUMNS * TILE_WIDTH,
      height: rows * TILE_HEIGHT,
      channels: 4,
      background: '#eef2f3'
    }
  })
    .composite(composites)
    .png()
    .toFile(OUTPUT_FILE)

  console.log(OUTPUT_FILE)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
