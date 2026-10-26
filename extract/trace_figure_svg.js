/*
 * Convert scanned black-and-white math figures into compact SVG paths.
 *
 * The source pixels remain the geometric reference. Small connected
 * components are removed as scanner noise, then the remaining boundaries are
 * traced, simplified, and emitted as a single even-odd fill path.
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const DEFAULT_THRESHOLD = 165
const MIN_COMPONENT_AREA = 16
const RDP_EPSILON = 0.7

function cleanPath(rawPath) {
  const cleaned = String(rawPath || '').trim()
  if (!cleaned) throw new Error('Missing image path')
  return path.resolve(cleaned)
}

function isBlack(data, width, height, x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return false
  return data[y * width + x] < 128
}

function removePageEdgeRules(data, width, height) {
  const horizontalBand = Math.max(4, Math.floor(height * 0.06))
  for (let y = 0; y < height; y += 1) {
    if (y >= horizontalBand && y < height - horizontalBand) continue
    let blackCount = 0
    for (let x = 0; x < width; x += 1) {
      if (isBlack(data, width, height, x, y)) blackCount += 1
    }
    if (blackCount < width * 0.12) continue
    for (let x = 0; x < width; x += 1) data[y * width + x] = 255
  }

  const verticalBand = Math.max(4, Math.floor(width * 0.06))
  for (let x = 0; x < width; x += 1) {
    if (x >= verticalBand && x < width - verticalBand) continue
    let blackCount = 0
    for (let y = 0; y < height; y += 1) {
      if (isBlack(data, width, height, x, y)) blackCount += 1
    }
    if (blackCount < height * 0.12) continue
    for (let y = 0; y < height; y += 1) data[y * width + x] = 255
  }
}

function removeSmallComponents(data, width, height) {
  const visited = new Uint8Array(width * height)
  const stackX = new Int32Array(width * height)
  const stackY = new Int32Array(width * height)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x
      if (!isBlack(data, width, height, x, y) || visited[startIndex]) continue

      let stackSize = 0
      const pixels = []
      let minX = x
      let minY = y
      let maxX = x
      let maxY = y
      stackX[stackSize] = x
      stackY[stackSize] = y
      stackSize += 1
      visited[startIndex] = 1

      while (stackSize) {
        stackSize -= 1
        const px = stackX[stackSize]
        const py = stackY[stackSize]
        const pixelIndex = py * width + px
        pixels.push(pixelIndex)
        minX = Math.min(minX, px)
        minY = Math.min(minY, py)
        maxX = Math.max(maxX, px)
        maxY = Math.max(maxY, py)

        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue
            const nx = px + dx
            const ny = py + dy
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
            const neighborIndex = ny * width + nx
            if (visited[neighborIndex] || !isBlack(data, width, height, nx, ny)) continue
            visited[neighborIndex] = 1
            stackX[stackSize] = nx
            stackY[stackSize] = ny
            stackSize += 1
          }
        }
      }

      const boxWidth = maxX - minX + 1
      const boxHeight = maxY - minY + 1
      const isPageRule = (
        boxWidth >= width * 0.55
        && boxHeight <= Math.max(16, height * 0.034)
        && (minY <= height * 0.14 || maxY >= height * 0.86)
      ) || (
        boxHeight >= height * 0.55
        && boxWidth <= Math.max(16, width * 0.034)
        && (minX <= width * 0.14 || maxX >= width * 0.86)
      )

      if (pixels.length < MIN_COMPONENT_AREA || isPageRule) {
        pixels.forEach(index => {
          data[index] = 255
        })
      }
    }
  }
}

function addEdge(edges, starts, fromX, fromY, toX, toY) {
  const edgeIndex = edges.length
  edges.push([fromX, fromY, toX, toY])
  const key = `${fromX},${fromY}`
  if (!starts.has(key)) starts.set(key, [])
  starts.get(key).push(edgeIndex)
}

function buildBoundaryEdges(data, width, height) {
  const edges = []
  const starts = new Map()

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!isBlack(data, width, height, x, y)) continue
      if (!isBlack(data, width, height, x, y - 1)) addEdge(edges, starts, x, y, x + 1, y)
      if (!isBlack(data, width, height, x + 1, y)) addEdge(edges, starts, x + 1, y, x + 1, y + 1)
      if (!isBlack(data, width, height, x, y + 1)) addEdge(edges, starts, x + 1, y + 1, x, y + 1)
      if (!isBlack(data, width, height, x - 1, y)) addEdge(edges, starts, x, y + 1, x, y)
    }
  }

  return { edges, starts }
}

function edgeDirection(edge) {
  return [edge[2] - edge[0], edge[3] - edge[1]]
}

function chooseNextEdge(edges, candidates, incoming, used) {
  const available = candidates.filter(edgeIndex => !used[edgeIndex])
  if (!available.length) return -1
  if (available.length === 1) return available[0]

  const [incomingX, incomingY] = incoming
  const priority = [
    [incomingY, -incomingX],
    [incomingX, incomingY],
    [-incomingY, incomingX],
    [-incomingX, -incomingY]
  ]

  return available.sort((leftIndex, rightIndex) => {
    const left = edgeDirection(edges[leftIndex])
    const right = edgeDirection(edges[rightIndex])
    const leftRank = priority.findIndex(item => item[0] === left[0] && item[1] === left[1])
    const rightRank = priority.findIndex(item => item[0] === right[0] && item[1] === right[1])
    return leftRank - rightRank
  })[0]
}

function traceLoops(edges, starts) {
  const used = new Uint8Array(edges.length)
  const loops = []

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    if (used[edgeIndex]) continue
    const firstEdge = edges[edgeIndex]
    const loop = [[firstEdge[0], firstEdge[1]]]
    let currentEdgeIndex = edgeIndex
    let guard = 0

    while (currentEdgeIndex >= 0 && guard <= edges.length + 1) {
      guard += 1
      used[currentEdgeIndex] = 1
      const current = edges[currentEdgeIndex]
      loop.push([current[2], current[3]])
      const key = `${current[2]},${current[3]}`
      const candidates = starts.get(key) || []
      const nextEdgeIndex = chooseNextEdge(edges, candidates, edgeDirection(current), used)
      if (nextEdgeIndex < 0) break
      const next = edges[nextEdgeIndex]
      if (next[0] === firstEdge[0] && next[1] === firstEdge[1]) {
        used[nextEdgeIndex] = 1
        break
      }
      currentEdgeIndex = nextEdgeIndex
    }

    if (loop.length >= 4) loops.push(loop)
  }

  return loops
}

function squareDistance(point, start, end) {
  let x = start[0]
  let y = start[1]
  let dx = end[0] - x
  let dy = end[1] - y
  if (dx || dy) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy)
    if (t > 1) {
      x = end[0]
      y = end[1]
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }
  dx = point[0] - x
  dy = point[1] - y
  return dx * dx + dy * dy
}

function simplifyRdp(points, epsilon = RDP_EPSILON) {
  if (points.length <= 2) return points
  const first = points[0]
  const last = points[points.length - 1]
  const epsilonSquared = epsilon * epsilon
  let maxDistance = 0
  let splitIndex = 0

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = squareDistance(points[index], first, last)
    if (distance > maxDistance) {
      maxDistance = distance
      splitIndex = index
    }
  }

  if (maxDistance <= epsilonSquared) return [first, last]
  const left = simplifyRdp(points.slice(0, splitIndex + 1), epsilon)
  const right = simplifyRdp(points.slice(splitIndex), epsilon)
  return left.slice(0, -1).concat(right)
}

function simplifyLoop(loop) {
  const points = loop.slice(0, -1)
  if (points.length <= 3) return points
  const simplified = simplifyRdp(points)
  return simplified.length >= 3 ? simplified : points
}

function pointCommand(point, command) {
  return `${command}${point[0]} ${point[1]}`
}

function loopsToPath(loops) {
  const parts = []
  loops.forEach(loop => {
    const simplified = simplifyLoop(loop)
    if (simplified.length < 3) return
    parts.push(
      pointCommand(simplified[0], 'M')
      + simplified.slice(1).map(point => pointCommand(point, 'L')).join('')
      + 'Z'
    )
  })
  return parts.join('')
}

function wrapSvg(width, height, pathData, source) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${path.basename(source)}" shape-rendering="geometricPrecision"><rect width="${width}" height="${height}" fill="#fff"/><path d="${pathData}" fill="#111" fill-rule="evenodd"/></svg>`
}

async function traceImage(sourceFile, options = {}) {
  const threshold = Number(options.threshold || DEFAULT_THRESHOLD)
  const { data, info } = await sharp(sourceFile)
    .grayscale()
    .median(3)
    .normalize()
    .blur(0.55)
    .threshold(threshold)
    .raw()
    .toBuffer({ resolveWithObject: true })

  removePageEdgeRules(data, info.width, info.height)
  removeSmallComponents(data, info.width, info.height)
  const { edges, starts } = buildBoundaryEdges(data, info.width, info.height)
  const loops = traceLoops(edges, starts)
  const pathData = loopsToPath(loops)
  if (!pathData) throw new Error(`No black geometry found in ${sourceFile}`)
  return {
    svg: wrapSvg(info.width, info.height, pathData, sourceFile),
    width: info.width,
    height: info.height,
    pathCount: loops.length
  }
}

async function main() {
  const sourceFile = cleanPath(process.argv[2])
  const outputFile = path.resolve(process.argv[3])
  const result = await traceImage(sourceFile)
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, result.svg, 'utf8')
  console.log(JSON.stringify({
    sourceFile,
    outputFile,
    width: result.width,
    height: result.height,
    paths: result.pathCount,
    bytes: fs.statSync(outputFile).size
  }, null, 2))
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = {
  traceImage
}
