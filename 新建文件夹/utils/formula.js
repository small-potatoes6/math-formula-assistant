const { FORMULAS, CHAPTERS } = require('../data/formulas')

const FORMULA_MAP = {}
FORMULAS.forEach(item => {
  FORMULA_MAP[item.id] = item
})

const TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '核心公式', value: 'core' },
  { label: '二级结论', value: 'conclusion' }
]

function getFormula(id) {
  return FORMULA_MAP[id] || null
}

function getChapter(index) {
  const number = Number(index) || 0
  return number > 0 ? CHAPTERS[number - 1] : ''
}

function shuffle(items) {
  const result = items.slice()
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const value = result[index]
    result[index] = result[target]
    result[target] = value
  }
  return result
}

function sizeDistance(a, b) {
  const widthA = Math.max(1, Number(a.formulaWidth) || 1)
  const widthB = Math.max(1, Number(b.formulaWidth) || 1)
  const heightA = Math.max(1, Number(a.formulaHeight) || 1)
  const heightB = Math.max(1, Number(b.formulaHeight) || 1)
  return Math.abs(Math.log(widthA / widthB)) * 1.35
    + Math.abs(Math.log(heightA / heightB))
}

function getDistractors(item, count, pool) {
  const candidates = (pool || FORMULAS).filter(candidate => candidate.id !== item.id)
  const ranked = candidates
    .map((candidate, index) => {
      const chapterPenalty = candidate.chapter === item.chapter ? 0 : 0.7
      const typePenalty = candidate.type === item.type ? 0 : 0.12
      return {
        candidate,
        index,
        score: chapterPenalty + typePenalty + sizeDistance(item, candidate) * 0.72 + Math.random() * 0.08
      }
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)

  const shortlistSize = Math.min(ranked.length, Math.max(count * 4, count))
  return shuffle(ranked.slice(0, shortlistSize).map(entry => entry.candidate)).slice(0, count)
}

module.exports = {
  FORMULAS,
  CHAPTERS,
  TYPE_OPTIONS,
  getFormula,
  getChapter,
  shuffle,
  getDistractors
}
