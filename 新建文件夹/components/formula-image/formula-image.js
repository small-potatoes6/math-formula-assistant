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
    // 放大倍率（验证用）：1 = 原始尺寸；放大后位图会暴露拉伸糊，SVG 保持锐利
    zoom: {
      type: Number,
      value: 1
    },
  },

  data: {
    ready: false,
    scrollable: false,
    imageAsset: '',
    viewportWidth: 0,
    displayWidth: 0,
    displayHeight: 0
  },

  observers: {
    'asset, assetWidth, assetHeight, maxWidth, zoom': function updateAsset() {
      const asset = this.data.asset
      const assetWidth = Number(this.data.assetWidth) || 0
      const assetHeight = Number(this.data.assetHeight) || 0
      const zoom = Math.max(1, Number(this.data.zoom) || 1)

      if (!asset || !assetWidth || !assetHeight) {
        this.setData({
          ready: false,
          imageAsset: ''
        })
        return
      }

      const maxWidth = Number(this.data.maxWidth) || 640
      const naturalWidth = assetWidth * LOGICAL_RPX * zoom
      const naturalHeight = assetHeight * LOGICAL_RPX * zoom
      const scrollable = naturalWidth > maxWidth
      const displayWidth = naturalWidth
      const displayHeight = naturalHeight

      this.setData({
        ready: true,
        scrollable,
        imageAsset: asset,
        viewportWidth: scrollable ? maxWidth : displayWidth,
        displayWidth,
        displayHeight
      })
    }
  }
})
