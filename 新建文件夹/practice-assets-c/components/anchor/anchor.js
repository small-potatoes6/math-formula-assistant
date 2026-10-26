// 分包就绪锚点：组件被真实创建即代表资源分包已完成下载。
Component({
  ready() {
    this.triggerEvent('packageready')
  }
})
