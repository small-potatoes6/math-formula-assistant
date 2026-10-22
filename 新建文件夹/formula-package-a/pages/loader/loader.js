Page({
  onReady() {
    wx.redirectTo({
      url: '/formula-package-b/pages/loader/loader',
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  }
})
