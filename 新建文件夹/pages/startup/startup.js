const PACKAGE_STEPS = [
  { key: 'A', name: 'formulaA', start: 0, end: 36 },
  { key: 'B', name: 'formulaB', start: 36, end: 69 },
  { key: 'C', name: 'formulaC', start: 69, end: 100 }
]

// 锚点组件全部就绪的等待上限：超时后退回旧的分包页链路，避免卡在启动页
const READY_TIMEOUT = 10000

Page({
  data: {
    progress: 0
  },

  onLoad() {
    this._entered = false
    this._ready = {}
    this._readyCount = 0

    // 首选通道：启动页里隐藏的三个分包锚点组件，渲染即触发分包下载，
    // 组件真正创建（而非占位）时回传 packageready，全程不跳页、不闪屏。
    this._timeout = setTimeout(() => this.enterFallback(), READY_TIMEOUT)

    // 备用通道：部分环境提供 wx.loadSubpackage，同时调用可以让进度条更细
    if (typeof wx.loadSubpackage === 'function') {
      this.preparePackages()
    }
  },

  onUnload() {
    this.clearTimer()
  },

  onPackageReady(event) {
    const key = event.currentTarget.dataset.key
    this.markReady(key)
  },

  markReady(key) {
    if (this._entered || this._ready[key]) return
    const step = PACKAGE_STEPS.find(item => item.key === key)
    if (!step) return

    this._ready[key] = true
    this._readyCount += 1

    const finished = this._readyCount >= PACKAGE_STEPS.length
    this.setData({
      progress: Math.max(this.data.progress, step.end)
    })

    if (finished) this.finishLoading()
  },

  preparePackages() {
    PACKAGE_STEPS.forEach(step => {
      let task = null
      try {
        task = wx.loadSubpackage({
          name: step.name,
          success: () => this.markReady(step.key),
          fail: () => {}
        })
      } catch (error) {
        return
      }

      if (task && typeof task.onProgressUpdate === 'function') {
        task.onProgressUpdate(result => {
          if (this._entered || this._ready[step.key]) return
          const value = Math.max(0, Math.min(100, Number(result.progress) || 0))
          const progress = Math.round(step.start + (step.end - step.start) * value / 100)
          if (progress > this.data.progress) this.setData({ progress })
        })
      }
    })
  },

  finishLoading() {
    if (this._entered) return
    this.clearTimer()
    setTimeout(() => {
      this.enterApp()
    }, 180)
  },

  enterApp() {
    if (this._entered) return
    this._entered = true
    this.clearTimer()
    wx.switchTab({
      url: '/pages/index/index',
      fail: () => {
        this._entered = false
        this.enterFallback()
      }
    })
  },

  enterFallback() {
    if (this._entered) return
    this._entered = true
    this.clearTimer()
    wx.redirectTo({
      url: '/formula-package-a/pages/loader/loader',
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  },

  clearTimer() {
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
  }
})
