const { FORMULAS, CHAPTERS, CHAPTER_COUNTS } = require('../../data/formulas')
const store = require('../../utils/store')

const TYPE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '核心公式', value: 'core' },
  { label: '二级结论', value: 'conclusion' }
]

function toCard(item, favoriteMap) {
  return {
    id: item.id,
    name: item.name,
    chapter: item.chapter,
    type: item.type,
    typeLabel: item.typeLabel,
    formulaImage: item.formulaImage,
    formulaWidth: item.formulaWidth,
    formulaHeight: item.formulaHeight,
    condition: item.condition || '',
    favorite: Boolean(favoriteMap[item.id])
  }
}

Page({
  data: {
    typeOptions: TYPE_OPTIONS,
    activeType: 'all',
    chapterLabels: ['全部章节'].concat(CHAPTERS),
    chapterCounts: CHAPTER_COUNTS,
    chapterIndex: 0,
    keyword: '',
    items: [],
    filteredCount: 0,
    favoriteCount: 0,
    summary: null
  },

  onLoad() {
    this.sourceItems = FORMULAS.map(item => ({
      ...item,
      searchText: [
        item.id,
        item.name,
        item.chapter,
        item.typeLabel,
        item.voiceText,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase()
    }))
    this.applyFilters()
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const state = store.getState()
    const favoriteMap = {}
    state.favs.forEach(id => {
      favoriteMap[id] = true
    })
    this.favoriteMap = favoriteMap
    this.setData({
      favoriteCount: state.favs.length,
      summary: store.getSummary()
    })
    this.applyFilters()
  },

  applyFilters() {
    const activeType = this.data.activeType
    const chapter = this.data.chapterIndex > 0 ? CHAPTERS[this.data.chapterIndex - 1] : ''
    const keyword = (this.data.keyword || '').trim().toLowerCase()
    const favoriteMap = this.favoriteMap || {}

    const filtered = this.sourceItems.filter(item => {
      if (activeType !== 'all' && item.type !== activeType) return false
      if (chapter && item.chapter !== chapter) return false
      if (keyword && item.searchText.indexOf(keyword) < 0) return false
      return true
    })

    this.setData({
      items: filtered.map(item => toCard(item, favoriteMap)),
      filteredCount: filtered.length
    })
  },

  onTypeTap(event) {
    const activeType = event.currentTarget.dataset.value
    if (activeType === this.data.activeType) return
    this.setData({ activeType }, () => this.applyFilters())
  },

  onChapterChange(event) {
    this.setData({ chapterIndex: Number(event.detail.value) }, () => this.applyFilters())
  },

  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value }, () => this.applyFilters())
  },

  clearKeyword() {
    this.setData({ keyword: '' }, () => this.applyFilters())
  },

  openDetail(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  toggleFavorite(event) {
    const id = event.currentTarget.dataset.id
    const favorite = store.toggleFavorite(id)
    const items = this.data.items.map(item => (
      item.id === id ? { ...item, favorite } : item
    ))
    this.favoriteMap[id] = favorite
    this.setData({
      items,
      favoriteCount: store.getSummary().favoriteCount
    })
    wx.showToast({
      title: favorite ? '已加入收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  openFavorites() {
    wx.switchTab({
      url: '/pages/favorites/favorites'
    })
  },

  openPractice() {
    wx.switchTab({
      url: '/pages/practice/practice'
    })
  },

  onShareAppMessage() {
    return {
      title: '公式记忆助手：366 条高中数学公式',
      path: '/pages/index/index'
    }
  }
})
