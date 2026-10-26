const LOGICAL_RPX = 2

Component({
  options: {
    styleIsolation: 'isolated'
  },

  properties: {
    sheet: {
      type: String,
      value: ''
    },
    sheetWidth: {
      type: Number,
      value: 0
    },
    sheetHeight: {
      type: Number,
      value: 0
    },
    x: {
      type: Number,
      value: 0
    },
    y: {
      type: Number,
      value: 0
    },
    width: {
      type: Number,
      value: 0
    },
    height: {
      type: Number,
      value: 0
    },
    maxWidth: {
      type: Number,
      value: 570
    },
    align: {
      type: String,
      value: 'left'
    },
    fit: {
      type: Boolean,
      value: false
    }
  },

  data: {
    ready: false,
    scrollable: false,
    imageAsset: '',
    viewportWidth: 0,
    viewportHeight: 0,
    canvasStyle: '',
    imageStyle: ''
  },

  observers: {
    'sheet, sheetWidth, sheetHeight, x, y, width, height, maxWidth, align, fit': function updateCrop() {
      const sheet = String(this.data.sheet || '')
      const sheetWidth = Number(this.data.sheetWidth) || 0
      const sheetHeight = Number(this.data.sheetHeight) || 0
      const x = Number(this.data.x) || 0
      const y = Number(this.data.y) || 0
      const width = Number(this.data.width) || 0
      const height = Number(this.data.height) || 0
      const maxWidth = Number(this.data.maxWidth) || 570
      const align = this.data.align === 'center' ? 'center' : 'left'
      const fit = Boolean(this.data.fit)

      if (
        !sheet
        || sheetWidth <= 0
        || sheetHeight <= 0
        || width <= 0
        || height <= 0
        || x < 0
        || y < 0
        || x + width > sheetWidth
        || y + height > sheetHeight
      ) {
        this.setData({
          ready: false,
          scrollable: false,
          imageAsset: ''
        })
        return
      }

      const naturalWidth = width * LOGICAL_RPX
      const naturalHeight = height * LOGICAL_RPX
      const scrollable = !fit && naturalWidth > maxWidth
      const scale = fit ? Math.min(1, maxWidth / naturalWidth) : 1
      const viewportWidth = Math.min(naturalWidth, maxWidth)
      const viewportHeight = Math.max(1, Math.ceil(naturalHeight * scale))
      const renderedWidth = Math.ceil(naturalWidth * scale)
      const renderedHeight = Math.ceil(naturalHeight * scale)
      const centered = align === 'center' && !scrollable && renderedWidth < maxWidth
      this.setData({
        ready: true,
        scrollable,
        imageAsset: sheet,
        viewportWidth,
        viewportHeight,
        canvasStyle:
          `width:${renderedWidth}rpx;height:${renderedHeight}rpx;` +
          `margin-left:${centered ? 'auto' : '0'};` +
          `margin-right:${centered ? 'auto' : '0'};`,
        imageStyle:
          `width:${sheetWidth * LOGICAL_RPX * scale}rpx;` +
          `height:${sheetHeight * LOGICAL_RPX * scale}rpx;` +
          `transform:translate(-${x * LOGICAL_RPX * scale}rpx,-${y * LOGICAL_RPX * scale}rpx);`
      })
    }
  },

  methods: {
    onScrollTouchStart(event) {
      const touch = event.touches && event.touches[0]
      if (!touch) return
      this.touchStartX = Number(touch.clientX) || 0
      this.touchStartY = Number(touch.clientY) || 0
      this.swipeNotified = false
    },

    onScrollTouchMove(event) {
      if (this.swipeNotified || typeof this.touchStartX !== 'number') return
      const touch = event.touches && event.touches[0]
      if (!touch) return
      const deltaX = Math.abs((Number(touch.clientX) || 0) - this.touchStartX)
      const deltaY = Math.abs((Number(touch.clientY) || 0) - this.touchStartY)
      if (deltaX < 8 || deltaX <= deltaY) return
      this.swipeNotified = true
      this.triggerEvent('cropswipe', { direction: 'horizontal' })
    },

    onScrollTouchEnd() {
      this.touchStartX = undefined
      this.touchStartY = undefined
    },

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
      }, 250 * attempts)
    }
  }
})
