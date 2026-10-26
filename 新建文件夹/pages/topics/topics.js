const { TOPICS } = require('../../data/topics')

const TOPIC_ENTRIES = TOPICS.map(item => ({
  ...item,
  displayOrder: String(item.order).padStart(2, '0')
}))

Page({
  data: {
    TOPICS: TOPIC_ENTRIES
  },

  openTopic(event) {
    const { id, route } = event.currentTarget.dataset
    if (!id || !route) return
    wx.navigateTo({
      url: `${route}?id=${id}`
    })
  },

  onShareAppMessage() {
    return {
      title: '数学专项 24 篇',
      path: '/pages/topics/topics'
    }
  }
})
