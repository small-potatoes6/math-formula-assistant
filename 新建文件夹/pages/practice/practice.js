const {
  FORMULAS,
  CHAPTERS,
  getChapter,
  shuffle
} = require('../../utils/formula')
const {
  formalQuestionCount
} = require('../../utils/practice-meta')
const store = require('../../utils/store')

const QUANTITY_OPTIONS = [
  { label: '5 题', value: 5 },
  { label: '10 题', value: 10 },
  { label: '15 题', value: 15 },
  { label: '20 题', value: 20 },
  { label: '全部', value: 'all' }
]

const SCOPE_OPTIONS = [
  { label: '全部公式', value: 'all' },
  { label: '仅收藏', value: 'favorites' },
  { label: '今日待复习', value: 'due' }
]

const DEMO_QUESTION_IDS = [
  'P-C002-02',
  'P-C002-03',
  'P-C007-02',
  'P-C007-03',
  'P-C007-04',
  'P-C007-05',
  'P-C007-06',
  'P-C007-07',
  'P-C035-02',
  'P-C035-03',
  'P-C035-04',
  'P-C035-05',
  'P-C042-02',
  'P-C042-03',
  'P-C042-04',
  'P-C042-05',
  'P-C058-02',
  'P-C058-03',
  'P-C058-04',
  'P-C058-05',
  'P-C059-02',
  'P-C059-03',
  'P-C059-04',
  'P-C059-05',
  'P-S044-02',
  'P-S044-03',
  'P-S045-02',
  'P-S045-03',
  'P-S045-04',
  'P-S045-05'
]

Page({
  data: {
    formulaCount: FORMULAS.length,
    questionCount: formalQuestionCount,
    chapterLabels: ['全部章节'].concat(CHAPTERS),
    chapterIndex: 0,
    quantityLabels: QUANTITY_OPTIONS.map(item => item.label),
    quantityIndex: 1,
    scopeLabels: SCOPE_OPTIONS.map(item => item.label),
    scopeIndex: 0,
    favoriteCount: 0,
    dueCount: 0,
    starting: false,
    demoStarting: false
  },

  onShow() {
    if (this.data.starting) {
      this.setData({ starting: false })
    }
    if (this.data.demoStarting) {
      this.setData({ demoStarting: false })
    }
    this.refreshSummary()
  },

  refreshSummary() {
    const summary = store.getSummary()
    this.setData({
      favoriteCount: summary.favoriteCount,
      dueCount: summary.dueCount
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
    if (this.data.starting || this.data.demoStarting) return
    const scope = SCOPE_OPTIONS[this.data.scopeIndex].value
    const pool = this.buildPool()
    if (!pool.length) {
      wx.showToast({
        title: scope === 'favorites'
          ? '还没有收藏公式'
          : scope === 'due'
            ? '今天没有待复习公式'
            : '当前章节没有公式',
        icon: 'none'
      })
      return
    }

    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.practiceSession = {
      sourceIds: pool.map(item => item.id),
      demo: false
    }
    this.setData({ starting: true })
    wx.navigateTo({
      url: '/practice-package/pages/session/choice',
      fail: () => {
        app.globalData.practiceSession = null
        this.setData({ starting: false })
        wx.showToast({
          title: '练习页加载失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  startDemoSession() {
    if (this.data.starting || this.data.demoStarting) return
    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.practiceSession = {
      questionIds: DEMO_QUESTION_IDS.slice(),
      demo: true
    }
    this.setData({ demoStarting: true })
    wx.navigateTo({
      url: '/practice-package/pages/session/choice',
      fail: () => {
        app.globalData.practiceSession = null
        this.setData({ demoStarting: false })
        wx.showToast({
          title: '演示页加载失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '公式练习｜公式记忆助手',
      path: '/pages/practice/practice'
    }
  }
})
