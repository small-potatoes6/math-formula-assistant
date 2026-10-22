const { getFormula } = require('../../utils/formula')
const store = require('../../utils/store')

Page({
  data: {
    formula: null,
    favorite: false,
    notFound: false,
    masteryLabel: '尚未练习'
  },

  onLoad(options) {
    const formula = getFormula(options.id)
    if (!formula) {
      this.setData({ notFound: true })
      return
    }
    this.formulaId = formula.id
    this.setData({ formula })
    this.refreshState()
  },

  onShow() {
    if (this.formulaId) this.refreshState()
  },

  refreshState() {
    const state = store.getState()
    const mastery = state.mastery[this.formulaId]
    const labels = {
      known: '已掌握',
      fuzzy: '需要巩固',
      unknown: '待加强'
    }
    this.setData({
      favorite: state.favs.indexOf(this.formulaId) >= 0,
      masteryLabel: mastery ? labels[mastery.lvl] || '已有练习记录' : '尚未练习'
    })
  },

  toggleFavorite() {
    const favorite = store.toggleFavorite(this.formulaId)
    this.setData({ favorite })
    wx.showToast({
      title: favorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  startPractice() {
    getApp().globalData.practiceTarget = {
      id: this.formulaId
    }
    wx.switchTab({
      url: '/pages/practice/practice'
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.formula.name}｜公式记忆助手`,
      path: `/pages/detail/detail?id=${this.formulaId}`
    }
  }
})
