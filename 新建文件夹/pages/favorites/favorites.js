const { CHAPTERS, getFormula } = require('../../utils/formula')
const store = require('../../utils/store')

Page({
  data: {
    chapterLabels: ['全部收藏'].concat(CHAPTERS),
    chapterIndex: 0,
    items: [],
    allCount: 0,
    filteredCount: 0
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const state = store.getState()
    this.favoriteItems = state.favs
      .map(id => getFormula(id))
      .filter(Boolean)
    this.applyFilter()
  },

  applyFilter() {
    const chapter = this.data.chapterIndex > 0
      ? CHAPTERS[this.data.chapterIndex - 1]
      : ''
    const allItems = this.favoriteItems || []
    const filtered = chapter
      ? allItems.filter(item => item.chapter === chapter)
      : allItems

    this.setData({
      allCount: allItems.length,
      filteredCount: filtered.length,
      items: filtered
    })
  },

  onChapterChange(event) {
    this.setData({ chapterIndex: Number(event.detail.value) }, () => this.applyFilter())
  },

  openDetail(event) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${event.currentTarget.dataset.id}`
    })
  },

  removeFavorite(event) {
    const id = event.currentTarget.dataset.id
    store.toggleFavorite(id)
    this.refresh()
  },

  browseFormulas() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '我的公式收藏｜公式记忆助手',
      path: '/pages/favorites/favorites'
    }
  }
})
