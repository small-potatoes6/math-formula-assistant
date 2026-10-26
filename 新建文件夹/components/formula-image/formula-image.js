const LOGICAL_RPX = 2

Component({
  options: {
    styleIsolation: 'isolated'
  },

  properties: {
    asset: {
      type: String,
      value: ''
    },
    assetWidth: {
      type: Number,
      value: 0
    },
    assetHeight: {
      type: Number,
      value: 0
    },
    maxWidth: {
      type: Number,
      value: 640
    },
    maxHeight: {
      type: Number,
      value: 0
    },
    mode: {
      type: String,
      value: 'scroll'
    },
    align: {
      type: String,
      value: 'left'
    },
    // 放大倍率：1 = 原始尺寸；专项公式使用 3 倍 PNG 资源
    zoom: {
      type: Number,
      value: 1
    },
    // 页面级缩放倍率：选择题用它让同一道题的四个选项共用字号比例
    scale: {
      type: Number,
      value: 1
    },
  },

  data: {
    ready: false,
    scrollable: false,
    imageAsset: '',
    viewportWidth: 0,
    viewportHeight: 0,
    displayWidth: 0,
    displayHeight: 0
  },

  observers: {
    'asset, assetWidth, assetHeight, maxWidth, maxHeight, mode, zoom, scale': function updateAsset() {
      const asset = this.data.asset
      this._reloadAttempts = 0
      const assetWidth = Number(this.data.assetWidth) || 0
      const assetHeight = Number(this.data.assetHeight) || 0
      const zoom = Math.max(1, Number(this.data.zoom) || 1)
      const userScale = Math.max(0.01, Number(this.data.scale) || 1)

      if (!asset || !assetWidth || !assetHeight) {
        this.setData({
          ready: false,
          imageAsset: ''
        })
        return
      }

      const maxWidth = Number(this.data.maxWidth) || 640
      const maxHeight = Number(this.data.maxHeight) || 0
      const mode = this.data.mode === 'fit' ? 'fit' : 'scroll'
      const naturalWidth = assetWidth * LOGICAL_RPX * zoom * userScale
      const naturalHeight = assetHeight * LOGICAL_RPX * zoom * userScale
      let fitScale = 1

      if (mode === 'fit') {
        const widthScale = naturalWidth > maxWidth ? maxWidth / naturalWidth : 1
        const heightScale = maxHeight > 0 && naturalHeight > maxHeight
          ? maxHeight / naturalHeight
          : 1
        fitScale = Math.min(widthScale, heightScale)
      } else if (maxHeight > 0 && naturalHeight > maxHeight) {
        fitScale = maxHeight / naturalHeight
      }

      const displayWidth = naturalWidth * fitScale
      const displayHeight = naturalHeight * fitScale
      const scrollable = mode === 'scroll' && displayWidth > maxWidth
      const viewportWidth = mode === 'fit' ? maxWidth : (scrollable ? maxWidth : displayWidth)
      const viewportHeight = mode === 'fit' && maxHeight > 0
        ? maxHeight
        : displayHeight

      this.setData({
        ready: true,
        scrollable,
        imageAsset: asset,
        viewportWidth,
        viewportHeight,
        displayWidth,
        displayHeight
      })
    }
  },

  methods: {
    // 兜底：分包资源偶尔会晚一点可用，图片加载失败时短暂延时后重试
    onImageError() {
      const asset = this.data.imageAsset
      if (!asset) return
      const attempts = (this._reloadAttempts || 0) + 1
      if (attempts > 3) return
      this._reloadAttempts = attempts
      setTimeout(() => {
        if (this.data.imageAsset !== asset) return
        this.setData({ imageAsset: '' }, () => {
          this.setData({ imageAsset: asset })
        })
      }, 300 * attempts)
    }
  }
})
