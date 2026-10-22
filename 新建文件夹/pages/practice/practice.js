const {
  FORMULAS,
  CHAPTERS,
  getFormula,
  getChapter,
  shuffle,
  getDistractors
} = require('../../utils/formula')
const store = require('../../utils/store')

const MODE_OPTIONS = [
  { label: '默写自评', value: 'self' },
  { label: '填空', value: 'fill' },
  { label: '选择', value: 'choice' }
]

const QUANTITY_OPTIONS = [
  { label: '5 条', value: 5 },
  { label: '10 条', value: 10 },
  { label: '15 条', value: 15 },
  { label: '20 条', value: 20 },
  { label: '全部', value: 'all' }
]

const SCOPE_OPTIONS = [
  { label: '全部公式', value: 'all' },
  { label: '仅收藏', value: 'favorites' },
  { label: '今日待复习', value: 'due' }
]

Page({
  data: {
    modeOptions: MODE_OPTIONS,
    activeMode: 'self',
    chapterLabels: ['全部章节'].concat(CHAPTERS),
    chapterIndex: 0,
    quantityLabels: QUANTITY_OPTIONS.map(item => item.label),
    quantityIndex: 1,
    scopeLabels: SCOPE_OPTIONS.map(item => item.label),
    scopeIndex: 0,
    favoriteCount: 0,
    dueCount: 0,
    started: false,
    finished: false,
    current: null,
    currentIndex: 0,
    total: 0,
    progress: 0,
    showFormula: false,
    showAnswer: false,
    quizOptions: [],
    quizAnswered: false,
    quizCorrect: false,
    stats: {
      known: 0,
      fuzzy: 0,
      unknown: 0
    }
  },

  onLoad() {
    this.deck = []
    this.sessionStats = { known: 0, fuzzy: 0, unknown: 0 }
    this.refreshSummary()
  },

  onShow() {
    this.refreshSummary()
    const app = getApp()
    const target = app.globalData.practiceTarget
    if (target && target.id) {
      app.globalData.practiceTarget = null
      this.startSingle(target.id)
    }
  },

  refreshSummary() {
    const summary = store.getSummary()
    this.setData({
      favoriteCount: summary.favoriteCount,
      dueCount: summary.dueCount
    })
  },

  onModeTap(event) {
    const activeMode = event.currentTarget.dataset.value
    if (activeMode === this.data.activeMode) return
    this.setData({
      activeMode,
      started: false,
      finished: false,
      current: null
    })
  },

  onChapterChange(event) {
    this.setData({ chapterIndex: Number(event.detail.value) })
  },

  onQuantityChange(event) {
    this.setData({ quantityIndex: Number(event.detail.value) })
  },

  onScopeChange(event) {
    this.setData({ scopeIndex: Number(event.detail.value) })
  },

  buildPool() {
    const state = store.getState()
    const today = store.getDayKey()
    const chapter = getChapter(this.data.chapterIndex)
    const scope = SCOPE_OPTIONS[this.data.scopeIndex].value
    let pool = FORMULAS.slice()

    if (chapter) {
      pool = pool.filter(item => item.chapter === chapter)
    }

    if (scope === 'favorites') {
      const favoriteMap = {}
      state.favs.forEach(id => {
        favoriteMap[id] = true
      })
      pool = pool.filter(item => favoriteMap[item.id])
    }

    if (scope === 'due') {
      pool = pool.filter(item => {
        const record = state.mastery[item.id]
        return record && record.next && record.next <= today
      })
    }

    pool = shuffle(pool)
    const quantity = QUANTITY_OPTIONS[this.data.quantityIndex].value
    return quantity === 'all' ? pool : pool.slice(0, quantity)
  },

  startSession() {
    const scope = SCOPE_OPTIONS[this.data.scopeIndex].value
    const pool = this.buildPool()
    if (!pool.length) {
      wx.showToast({
        title: scope === 'favorites' ? '还没有收藏公式' : '暂时没有待练习公式',
        icon: 'none'
      })
      return
    }

    this.deck = pool
    this.sessionStats = { known: 0, fuzzy: 0, unknown: 0 }
    this.setData({
      started: true,
      finished: false,
      currentIndex: 0,
      total: pool.length,
      progress: 0
    }, () => this.prepareQuestion())
  },

  startSingle(id) {
    const item = getFormula(id)
    if (!item) return
    this.deck = [item]
    this.sessionStats = { known: 0, fuzzy: 0, unknown: 0 }
    this.setData({
      activeMode: 'self',
      started: true,
      finished: false,
      currentIndex: 0,
      total: 1,
      progress: 0
    }, () => this.prepareQuestion())
  },

  prepareQuestion() {
    const current = this.deck[this.data.currentIndex]
    if (!current) {
      this.finishSession()
      return
    }

    let quizOptions = []
    if (this.data.activeMode === 'choice') {
      quizOptions = shuffle([current].concat(getDistractors(current, 3))).map((item, index) => ({
        id: item.id,
        letter: ['A', 'B', 'C', 'D'][index],
        name: item.name,
        formulaImage: item.formulaImage,
        formulaWidth: item.formulaWidth,
        formulaHeight: item.formulaHeight,
        status: ''
      }))
    }

    this.setData({
      current,
      quizOptions,
      quizAnswered: false,
      quizCorrect: false,
      showFormula: false,
      showAnswer: false,
      progress: Math.round((this.data.currentIndex / this.data.total) * 100)
    })
  },

  revealFormula() {
    this.setData({ showFormula: true })
  },

  revealAnswer() {
    this.setData({ showAnswer: true })
  },

  rate(event) {
    if (!this.data.current) return
    const level = event.currentTarget.dataset.level
    this.sessionStats[level] += 1
    store.recordResult(this.data.current.id, level)
    this.advance()
  },

  chooseOption(event) {
    if (this.data.quizAnswered || !this.data.current) return
    const selectedId = event.currentTarget.dataset.id
    const correct = selectedId === this.data.current.id
    const level = correct ? 'known' : 'unknown'
    this.sessionStats[level] += 1
    store.recordResult(this.data.current.id, level)

    const quizOptions = this.data.quizOptions.map(item => ({
      ...item,
      status: item.id === this.data.current.id
        ? 'correct'
        : item.id === selectedId
          ? 'wrong'
          : ''
    }))
    this.setData({
      quizAnswered: true,
      quizCorrect: correct,
      quizOptions
    })
  },

  advance() {
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex >= this.data.total) {
      this.finishSession()
      return
    }
    this.setData({
      currentIndex: nextIndex,
      progress: Math.round((nextIndex / this.data.total) * 100)
    }, () => this.prepareQuestion())
  },

  finishSession() {
    this.setData({
      started: false,
      finished: true,
      current: null,
      quizOptions: [],
      progress: 100,
      stats: { ...this.sessionStats }
    })
    this.refreshSummary()
  },

  restartSession() {
    this.setData({
      finished: false,
      progress: 0,
      stats: { known: 0, fuzzy: 0, unknown: 0 }
    })
  },

  openFavorites() {
    wx.switchTab({
      url: '/pages/favorites/favorites'
    })
  },

  onShareAppMessage() {
    return {
      title: '公式练习｜公式记忆助手',
      path: '/pages/practice/practice'
    }
  }
})
