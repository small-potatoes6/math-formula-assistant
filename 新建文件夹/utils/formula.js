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

function getDistractors(item, count) {
  const sameChapter = shuffle(
    FORMULAS.filter(candidate => candidate.id !== item.id && candidate.chapter === item.chapter)
  )
  const otherChapters = shuffle(
    FORMULAS.filter(candidate => candidate.id !== item.id && candidate.chapter !== item.chapter)
  )
  return sameChapter.concat(otherChapters).slice(0, count)
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
