const {
  PRACTICE_SHEETS,
  PRACTICE_EXPRESSION_CROPS,
  PRACTICE_QUESTIONS
} = require('../../data/practice')
const store = require('../../../utils/store')

const QUESTION_MAP = {}
const FORMAL_QUESTION_IDS_BY_SOURCE = {}
PRACTICE_QUESTIONS.forEach(question => {
  QUESTION_MAP[question.id] = question
  if (question.demo) return
  if (!FORMAL_QUESTION_IDS_BY_SOURCE[question.sourceId]) {
    FORMAL_QUESTION_IDS_BY_SOURCE[question.sourceId] = []
  }
  FORMAL_QUESTION_IDS_BY_SOURCE[question.sourceId].push(question.id)
})

const TYPE_PROMPTS = {
  reconstruct: '选择与左侧公式相等的表达式',
  blank: '选择能补全公式缺失部分的一项',
  condition: '选择正确的变形、适用条件或错误原因'
}

const ASSET_LOAD_TIMEOUT_MS = 10000

function shuffle(items) {
  const result = items.slice()
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    const value = result[index]
    result[index] = result[target]
    result[target] = value
  }
  return result
}

function resolveExpression(expressionId) {
  const crop = PRACTICE_EXPRESSION_CROPS[expressionId]
  const sheetIndex = Array.isArray(crop) ? Number(crop[0]) : -1
  const sheet = PRACTICE_SHEETS[sheetIndex]
  if (
    !Array.isArray(crop)
    || crop.length !== 5
    || !sheet
    || !sheet.packageName
  ) {
    return null
  }
  return {
    expressionId,
    packageName: sheet.packageName,
    crop: {
      sheet: sheet.image,
      sheetWidth: sheet.width,
      sheetHeight: sheet.height,
      x: crop[1],
      y: crop[2],
      width: crop[3],
      height: crop[4]
    }
  }
}

Page({
  data: {
    empty: false,
    finished: false,
    isDemo: false,
    current: null,
    currentIndex: 0,
    total: 0,
    progress: 0,
    questionPrompt: '',
    stem: null,
    quizOptions: [],
    quizAnswered: false,
    quizCorrect: false,
    feedbackText: '',
    assetLoading: false,
    loadError: '',
    loadProgress: 0,
    stats: {
      known: 0,
      unknown: 0
    }
  },

  onLoad() {
    const app = getApp()
    const globalData = app.globalData || {}
    const config = globalData.practiceSession || null
    globalData.practiceSession = null

    const questionIds = config && Array.isArray(config.questionIds)
      ? config.questionIds.slice()
      : []
    const sourceIds = config && Array.isArray(config.sourceIds)
      ? config.sourceIds.slice()
      : []
    const isDemo = Boolean(config && config.demo)
    const uniqueIds = []
    const seenIds = new Set()
    questionIds.forEach(id => {
      if (!id || seenIds.has(id)) return
      seenIds.add(id)
      uniqueIds.push(id)
    })
    const uniqueSourceIds = []
    const seenSourceIds = new Set()
    sourceIds.forEach(id => {
      if (!id || seenSourceIds.has(id)) return
      seenSourceIds.add(id)
      uniqueSourceIds.push(id)
    })

    this.sessionConfig = {
      questionIds: uniqueIds,
      sourceIds: uniqueSourceIds,
      demo: isDemo
    }
    this.sessionStats = { known: 0, unknown: 0 }
    this.loadedPackages = new Set()
    this.sessionResults = new Map()
    this.recordedQuestionIds = new Set()
    this.resultsFinalized = false
    this.assetWaiter = null
    const expandedSourceQuestionIds = this.sessionConfig.sourceIds
      .flatMap(sourceId => FORMAL_QUESTION_IDS_BY_SOURCE[sourceId] || [])
    const deckIds = this.sessionConfig.questionIds.length
      ? this.sessionConfig.questionIds
      : expandedSourceQuestionIds
    this.deck = deckIds.map(id => QUESTION_MAP[id]).filter(Boolean)
    if (!isDemo && this.sessionConfig.sourceIds.length) {
      this.deck = shuffle(this.deck)
    }

    if (!this.deck.length) {
      this.setData({ empty: true })
      return
    }

    this.setData({
      isDemo,
      total: this.deck.length,
      currentIndex: 0,
      progress: 0
    }, () => this.prepareQuestion())
  },

  prepareQuestion() {
    const current = this.deck[this.data.currentIndex]
    if (!current) {
      this.finishSession()
      return
    }

    this.answerLocked = false
    const stem = resolveExpression(current.stemExpressionId)
    const optionEntries = current.options.map(option => {
      const resolved = resolveExpression(option.expressionId)
      return resolved
        ? {
          ...option,
          ...resolved
        }
        : null
    })

    if (!stem || optionEntries.some(option => !option)) {
      this.setData({
        current,
        stem: null,
        quizOptions: [],
        quizAnswered: false,
        quizCorrect: false,
        feedbackText: '',
        assetLoading: false,
        loadError: '题目公式资源缺失，请返回后重试。',
        loadProgress: 0
      })
      return
    }

    const packageNames = []
    const packageSeen = new Set()
    ;[stem, ...optionEntries].forEach(entry => {
      if (packageSeen.has(entry.packageName)) return
      packageSeen.add(entry.packageName)
      packageNames.push(entry.packageName)
    })

    this.setData({
      current,
      stem,
      quizOptions: [],
      quizAnswered: false,
      quizCorrect: false,
      feedbackText: '',
      assetLoading: true,
      loadError: '',
      loadProgress: 0,
      questionPrompt: TYPE_PROMPTS[current.type] || TYPE_PROMPTS.reconstruct,
      progress: Math.round((this.data.currentIndex / this.data.total) * 100)
    }, () => {
      this.ensurePackagesLoaded(packageNames, () => {
        const quizOptions = shuffle(optionEntries).map((option, index) => ({
          ...option,
          letter: ['A', 'B', 'C', 'D'][index],
          status: ''
        }))
        this.setData({
          quizOptions,
          assetLoading: false,
          loadProgress: 100
        })
      }, message => {
        this.setData({
          assetLoading: false,
          loadError: message
        })
      })
    })
  },

  ensurePackagesLoaded(packageNames, onSuccess, onFail) {
    const pending = packageNames.filter(name => !this.loadedPackages.has(name))
    if (!pending.length) {
      onSuccess()
      return
    }

    this.clearAssetWaiter()
    const waiter = {
      pending: new Set(pending),
      total: pending.length,
      onSuccess,
      onFail,
      timer: setTimeout(() => this.assetLoadTimeout(), ASSET_LOAD_TIMEOUT_MS)
    }
    this.assetWaiter = waiter
    this.setData({ loadProgress: 0 })

    // 页面里的隐藏组件是主通道；运行时支持 API 时并行调用，真机可更快就绪。
    pending.forEach(name => this.startSubpackageLoad(name))
  },

  startSubpackageLoad(name) {
    if (typeof wx === 'undefined') return
    const load = typeof wx.loadSubpackage === 'function'
      ? wx.loadSubpackage
      : typeof wx.preloadSubpackage === 'function'
        ? wx.preloadSubpackage
        : null
    if (!load) return

    try {
      const task = load.call(wx, {
        name,
        success: () => this.markAssetPackageReady(name),
        fail: () => {}
      })
      if (task && typeof task.onProgressUpdate === 'function') {
        task.onProgressUpdate(progress => {
          const waiter = this.assetWaiter
          if (!waiter || !waiter.pending.has(name)) return
          const local = Math.max(0, Math.min(100, Number(progress.progress) || 0))
          const loadedCount = waiter.total - waiter.pending.size
          this.setData({
            loadProgress: Math.round(((loadedCount + local / 100) / waiter.total) * 100)
          })
        })
      }
    } catch (error) {
      // 锚点组件仍会继续触发分包下载，异常不提前判失败。
    }
  },

  onAssetPackageReady(event) {
    const dataset = event && event.currentTarget
      ? event.currentTarget.dataset || {}
      : {}
    this.markAssetPackageReady(dataset.packageName)
  },

  markAssetPackageReady(name) {
    if (!name) return
    this.loadedPackages.add(name)
    const waiter = this.assetWaiter
    if (!waiter || !waiter.pending.has(name)) return

    waiter.pending.delete(name)
    const remaining = waiter.pending.size
    this.setData({
      loadProgress: Math.round(((waiter.total - remaining) / waiter.total) * 100)
    })
    if (remaining) return

    this.clearAssetWaiter()
    this.setData({ loadProgress: 100 }, waiter.onSuccess)
  },

  assetLoadTimeout() {
    const waiter = this.assetWaiter
    if (!waiter) return
    this.clearAssetWaiter()
    waiter.onFail('公式资源加载超时，请检查网络后重试。')
  },

  clearAssetWaiter() {
    if (!this.assetWaiter) return
    if (this.assetWaiter.timer) clearTimeout(this.assetWaiter.timer)
    this.assetWaiter = null
  },

  retryAssets() {
    if (this.data.assetLoading || !this.data.current) return
    this.prepareQuestion()
  },

  onFormulaSwipe() {
    this.suppressOptionTap = true
    if (this.optionTapTimer) clearTimeout(this.optionTapTimer)
    this.optionTapTimer = setTimeout(() => {
      this.suppressOptionTap = false
      this.optionTapTimer = null
    }, 450)
  },

  chooseOption(event) {
    if (this.suppressOptionTap) {
      this.suppressOptionTap = false
      if (this.optionTapTimer) {
        clearTimeout(this.optionTapTimer)
        this.optionTapTimer = null
      }
      return
    }
    if (this.data.quizAnswered || this.data.assetLoading || this.answerLocked) return
    const selectedId = event.currentTarget.dataset.id
    if (!selectedId || !this.data.current) return
    const selected = this.data.quizOptions.find(
      option => option.expressionId === selectedId
    )
    const correctOption = this.data.quizOptions.find(option => option.isCorrect)
    if (!selected || !correctOption) return
    if (this.recordedQuestionIds.has(this.data.current.id)) return

    this.answerLocked = true
    this.recordedQuestionIds.add(this.data.current.id)
    const sourceId = this.data.current.sourceId
    const correct = selected.isCorrect
    const level = correct ? 'known' : 'unknown'
    this.sessionStats[level] += 1
    this.sessionResults.set(sourceId, level)

    const quizOptions = this.data.quizOptions.map(option => ({
      ...option,
      status: option.isCorrect
        ? 'correct'
        : option.expressionId === selectedId
          ? 'wrong'
          : ''
    }))
    const errorCopy = selected.errorKind
      ? `${selected.errorKind}：${selected.error}`
      : selected.error
    const feedbackText = correct
      ? this.data.isDemo
        ? '回答正确，本次为演示。'
        : '回答正确，练习结束后计入掌握记录。'
      : `正确项是 ${correctOption.letter}。${errorCopy ? `${errorCopy}。` : ''}`

    this.setData({
      quizAnswered: true,
      quizCorrect: correct,
      quizOptions,
      feedbackText
    })
  },

  advance() {
    if (!this.data.quizAnswered || this.data.assetLoading) return
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex >= this.data.total) {
      this.finishSession()
      return
    }
    this.setData({
      currentIndex: nextIndex,
      progress: Math.round((nextIndex / this.data.total) * 100)
    }, () => this.prepareQuestion())
  },

  finishSession() {
    this.finalizeResults()
    this.setData({
      finished: true,
      current: null,
      stem: null,
      quizOptions: [],
      quizAnswered: false,
      quizCorrect: false,
      feedbackText: '',
      assetLoading: false,
      loadError: '',
      loadProgress: 0,
      progress: 100,
      stats: { ...this.sessionStats }
    })
  },

  restartSession() {
    const expandedSourceQuestionIds = this.sessionConfig.sourceIds
      .flatMap(sourceId => FORMAL_QUESTION_IDS_BY_SOURCE[sourceId] || [])
    const deckIds = this.sessionConfig.questionIds.length
      ? this.sessionConfig.questionIds
      : expandedSourceQuestionIds
    this.deck = deckIds.map(id => QUESTION_MAP[id]).filter(Boolean)
    if (!this.data.isDemo && this.sessionConfig.sourceIds.length) {
      this.deck = shuffle(this.deck)
    }
    this.sessionStats = { known: 0, unknown: 0 }
    this.sessionResults = new Map()
    this.recordedQuestionIds = new Set()
    this.resultsFinalized = false
    this.answerLocked = false
    this.setData({
      empty: this.deck.length === 0,
      finished: false,
      current: null,
      currentIndex: 0,
      total: this.deck.length,
      progress: 0,
      stem: null,
      quizOptions: [],
      quizAnswered: false,
      quizCorrect: false,
      feedbackText: '',
      assetLoading: false,
      loadError: '',
      loadProgress: 0,
      stats: { known: 0, unknown: 0 }
    }, () => {
      if (this.deck.length) this.prepareQuestion()
    })
  },

  finalizeResults() {
    if (this.data.isDemo || this.resultsFinalized) return
    this.resultsFinalized = true
    this.sessionResults.forEach((level, sourceId) => {
      store.recordResult(sourceId, level)
    })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  },

  onUnload() {
    this.clearAssetWaiter()
    if (this.optionTapTimer) {
      clearTimeout(this.optionTapTimer)
      this.optionTapTimer = null
    }
  }
})
