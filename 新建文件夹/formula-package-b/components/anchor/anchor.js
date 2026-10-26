// 分包就绪锚点：组件被真实创建（而非占位）即代表 formulaB 已下载完成。
Component({
  ready() {
    this.triggerEvent('packageready')
  }
})
