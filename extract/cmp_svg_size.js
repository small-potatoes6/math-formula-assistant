/* 对比新旧 SVG 的声明尺寸，定位 v2 体积膨胀原因
 * 用法: node cmp_svg_size.js <oldDir> <newDir>
 * 输出: 抽样条目的 width/height 变化倍数，以及总体积/总面积汇总
 */
const fs = require('fs')
const path = require('path')

function dims(p) {
  const src = fs.readFileSync(p, 'utf8')
  const w = src.match(/\swidth="([\d.]+)"/)
  const h = src.match(/\sheight="([\d.]+)"/)
  const vb = src.match(/viewBox="([^"]+)"/)
  return {
    w: w ? Number(w[1]) : null,
    h: h ? Number(h[1]) : null,
    vb: vb ? vb[1] : null,
    bytes: fs.statSync(p).size
  }
}

const [oldDir, newDir] = process.argv.slice(2)
const oldFiles = fs.readdirSync(oldDir).filter(f => f.endsWith('.svg'))
const newFiles = fs.readdirSync(newDir).filter(f => f.endsWith('.svg'))
const newSet = new Set(newFiles)

let sumOldArea = 0, sumNewArea = 0, sumOldBytes = 0, sumNewBytes = 0, n = 0
let sumOldH = 0, sumNewH = 0, sumOldW = 0, sumNewW = 0
const ratios = []

for (const f of oldFiles) {
  if (!newSet.has(f)) continue
  const a = dims(path.join(oldDir, f))
  const b = dims(path.join(newDir, f))
  if (!a.w || !b.w) continue
  sumOldArea += a.w * a.h
  sumNewArea += b.w * b.h
  sumOldBytes += a.bytes
  sumNewBytes += b.bytes
  sumOldH += a.h; sumNewH += b.h
  sumOldW += a.w; sumNewW += b.w
  n++
  ratios.push({
    f,
    oldWH: a.w + 'x' + a.h,
    newWH: b.w + 'x' + b.h,
    ar: Number(((a.w * a.h) / (b.w * b.h)).toFixed(2)),
    hr: Number((b.h / a.h).toFixed(2)),
    vbOld: a.vb,
    vbNew: b.vb
  })
}

ratios.sort((x, y) => x.ar - y.ar)

console.log(JSON.stringify({
  matched: n,
  oldTotalAreaMpx: Number((sumOldArea / 1e6).toFixed(2)),
  newTotalAreaMpx: Number((sumNewArea / 1e6).toFixed(2)),
  areaGrowth: Number((sumNewArea / sumOldArea).toFixed(2)),
  oldSvgMb: Number((sumOldBytes / 1048576).toFixed(2)),
  newSvgMb: Number((sumNewBytes / 1048576).toFixed(2)),
  svgGrowth: Number((sumNewBytes / sumOldBytes).toFixed(2)),
  avgW_old: Math.round(sumOldW / n),
  avgW_new: Math.round(sumNewW / n),
  avgH_old: Math.round(sumOldH / n),
  avgH_new: Math.round(sumNewH / n),
  heightShrunkMost: ratios.slice(0, 3),
  heightGrewMost: ratios.slice(-3)
}, null, 2))
