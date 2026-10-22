const STORAGE_KEY = 'gsmath_v1'

const EMPTY_STATE = {
  mastery: {},
  favs: [],
  wrong: [],
  days: [],
  voiceMarked: []
}

function uniqueArray(value) {
  return Array.isArray(value) ? [...new Set(value.filter(Boolean))] : []
}

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    mastery: source.mastery && typeof source.mastery === 'object' ? source.mastery : {},
    favs: uniqueArray(source.favs),
    wrong: uniqueArray(source.wrong),
    days: uniqueArray(source.days),
    voiceMarked: uniqueArray(source.voiceMarked)
  }
}

function getState() {
  const stored = wx.getStorageSync(STORAGE_KEY)
  const state = normalizeState(stored)
  if (!stored) {
    wx.setStorageSync(STORAGE_KEY, state)
  }
  return state
}

function saveState(state) {
  const normalized = normalizeState(state)
  wx.setStorageSync(STORAGE_KEY, normalized)
  return normalized
}

function isFavorite(id, state) {
  return (state || getState()).favs.indexOf(id) >= 0
}

function toggleFavorite(id) {
  const state = getState()
  const index = state.favs.indexOf(id)
  if (index >= 0) {
    state.favs.splice(index, 1)
  } else {
    state.favs.unshift(id)
  }
  saveState(state)
  return index < 0
}

function getDayKey(date) {
  const target = date || new Date()
  const year = target.getFullYear()
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + Number(days || 0))
  return getDayKey(date)
}

function recordResult(id, level) {
  const state = getState()
  const normalizedLevel = ['unknown', 'fuzzy', 'known'].indexOf(level) >= 0 ? level : 'fuzzy'
  const gapDays = normalizedLevel === 'known' ? 7 : normalizedLevel === 'fuzzy' ? 1 : 0
  const previous = state.mastery[id] || { lvl: 'new', last: '', next: '', streak: 0 }
  const streak = normalizedLevel === 'known' ? Number(previous.streak || 0) + 1 : 0

  state.mastery[id] = {
    lvl: normalizedLevel,
    last: getDayKey(),
    next: addDays(gapDays),
    streak
  }

  if (normalizedLevel === 'unknown' && state.wrong.indexOf(id) < 0) {
    state.wrong.unshift(id)
  }

  const today = getDayKey()
  if (state.days.indexOf(today) < 0) {
    state.days.unshift(today)
    state.days = state.days.slice(0, 180)
  }

  return saveState(state)
}

function removeWrong(id) {
  const state = getState()
  state.wrong = state.wrong.filter(item => item !== id)
  return saveState(state)
}

function getSummary() {
  const state = getState()
  const today = getDayKey()
  const due = Object.keys(state.mastery).filter(id => {
    const next = state.mastery[id] && state.mastery[id].next
    return next && next <= today
  }).length

  return {
    favoriteCount: state.favs.length,
    wrongCount: state.wrong.length,
    studyDays: state.days.length,
    dueCount: due,
    learnedCount: Object.keys(state.mastery).length
  }
}

module.exports = {
  STORAGE_KEY,
  EMPTY_STATE,
  getState,
  saveState,
  isFavorite,
  toggleFavorite,
  recordResult,
  removeWrong,
  getSummary,
  getDayKey
}
