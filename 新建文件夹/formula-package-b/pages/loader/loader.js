Page({
  onLoad() {
    wx.redirectTo({
      url: '/formula-package-c/pages/loader/loader',
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  }
})
