const { getFormula } = require('../../utils/formula')
const store = require('../../utils/store')

Page({
  data: {
    formula: null,
    notFound: false,
    masteryLabel: '尚未练习',
    explanationParas: []
  },

  onLoad(options) {
    const sourceFormula = getFormula(options.id)
    if (!sourceFormula) {
      this.setData({ notFound: true })
      return
    }
    const formula = {
      ...sourceFormula,
      pitfall: sourceFormula.pitfallDisplay || sourceFormula.pitfall
    }
    this.formulaId = formula.id
    const explanationParas = []
    // 原文校对后的 explanation 优先；缺失时才退回旧的口语稿。
    const explanation = String(formula.explanation || '').trim()
    if (explanation) {
      explanationParas.push(explanation)
    } else {
      const condition = String(
        sourceFormula.conditionDisplay || formula.condition || ''
      ).trim()
      const voiceText = String(formula.voiceText || '').trim()
      if (voiceText) explanationParas.push(voiceText)
      if (condition && voiceText.indexOf(condition) < 0) {
        if (voiceText && condition.length <= 13) {
          explanationParas[0] = voiceText + '（' + condition + '）'
        } else {
          explanationParas.push(condition)
        }
      }
    }
    this.setData({
      formula,
      formulaScrollable: Number(formula.formulaWidth) * 2 > 654,
      explanationParas
    })
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
      masteryLabel: mastery ? labels[mastery.lvl] || '已有练习记录' : '尚未练习'
    })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
      return
    }
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  startPractice() {
    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.practiceSession = {
      sourceIds: [this.formulaId],
      demo: false
    }
    wx.navigateTo({
      url: '/practice-package/pages/session/choice',
      fail: () => {
        wx.showToast({
          title: '练习页加载失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.formula.name}｜公式记忆助手`,
      path: `/pages/detail/detail?id=${this.formulaId}`
    }
  }
})
