const store = require('./utils/store')

App({
  onLaunch() {
    store.getState()
  },
  globalData: {
    storageKey: store.STORAGE_KEY
  }
})
