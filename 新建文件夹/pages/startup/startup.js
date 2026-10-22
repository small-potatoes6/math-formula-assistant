Page({
  onReady() {
    wx.redirectTo({
      url: '/formula-package-a/pages/loader/loader',
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  }
})
