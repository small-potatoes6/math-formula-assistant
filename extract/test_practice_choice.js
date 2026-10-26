const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.resolve(__dirname, '..')
const PROJECT_ROOT = path.join(ROOT, '新建文件夹')
const PRACTICE_ROOT = path.join(PROJECT_ROOT, 'practice-package')
const PRACTICE_PAGE_PATH = path.join(PROJECT_ROOT, 'pages/practice/practice.js')
const PRACTICE_PAGE_WXML_PATH = path.join(
  PROJECT_ROOT,
  'pages/practice/practice.wxml'
)
const PRACTICE_META_PATH = path.join(
  PROJECT_ROOT,
  'utils/practice-meta.js'
)
const DETAIL_PAGE_PATH = path.join(PROJECT_ROOT, 'pages/detail/detail.js')
const CHOICE_PAGE_PATH = path.join(
  PRACTICE_ROOT,
  'pages/session/choice.js'
)
const INTEGER_PAGE_PATH = path.join(
  PRACTICE_ROOT,
  'pages/session/integer.js'
)
const OLD_SESSION_PAGE_PATH = path.join(
  PRACTICE_ROOT,
  'pages/session/session.js'
)
const PRACTICE_DATA_PATH = path.join(PRACTICE_ROOT, 'data/practice.js')
const choiceWxmlPath = path.join(PRACTICE_ROOT, 'pages/session/choice.wxml')
const choiceJsonPath = path.join(PRACTICE_ROOT, 'pages/session/choice.json')
const cropWxmlPath = path.join(
  PRACTICE_ROOT,
  'components/formula-crop/formula-crop.wxml'
)
const cropJsPath = path.join(
  PRACTICE_ROOT,
  'components/formula-crop/formula-crop.js'
)
const cropWxssPath = path.join(
  PRACTICE_ROOT,
  'components/formula-crop/formula-crop.wxss'
)
const formulaUtils = require(path.join(PROJECT_ROOT, 'utils/formula.js'))
const practiceMeta = require(PRACTICE_META_PATH)
const practiceData = require(PRACTICE_DATA_PATH)
const baseQuestions = practiceData.PRACTICE_QUESTIONS.filter(
  question => !question.demo
)
const demoQuestions = practiceData.PRACTICE_QUESTIONS.filter(
  question => question.demo
)
const DEMO_QUESTION_IDS = demoQuestions.map(question => question.id)
const DEMO_QUESTION_COUNT = 30
const appConfig = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'app.json'), 'utf8')
)

const TYPE_PROMPTS = {
  reconstruct: '选择与左侧公式相等的表达式',
  blank: '选择能补全公式缺失部分的一项',
  condition: '选择正确的变形、适用条件或错误原因'
}

const recordCalls = []
const toastCalls = []
const navigationCalls = []
const navigateBackCalls = []
let storeState = {
  mastery: {},
  favs: [],
  wrong: [],
  days: [],
  voiceMarked: []
}

const storeMock = {
  getState() {
    return JSON.parse(JSON.stringify(storeState))
  },
  getDayKey() {
    return '2026-10-24'
  },
  getSummary() {
    const today = '2026-10-24'
    return {
      favoriteCount: storeState.favs.length,
      dueCount: Object.values(storeState.mastery)
        .filter(record => record.next && record.next <= today).length,
      wrongCount: storeState.wrong.length,
      studyDays: storeState.days.length,
      learnedCount: Object.keys(storeState.mastery).length
    }
  },
  recordResult(id, level) {
    recordCalls.push({ id, level })
  }
}

function loadPage(filePath, dependencies) {
  let pageConfig = null
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), {
    require(request) {
      if (Object.prototype.hasOwnProperty.call(dependencies, request)) {
        return dependencies[request]
      }
      throw new Error(`Unexpected require in ${path.basename(filePath)}: ${request}`)
    },
    Page(config) {
      pageConfig = config
    },
    getApp() {
      return dependencies.__app
    },
    getCurrentPages() {
      return dependencies.__pages || []
    },
    wx: dependencies.__wx,
    console,
    setTimeout,
    clearTimeout
  }, { filename: filePath })
  assert(pageConfig, `${path.basename(filePath)} did not create Page config`)
  return pageConfig
}

function makeInstance(pageConfig, overrides = {}) {
  const instance = {
    data: {
      ...JSON.parse(JSON.stringify(pageConfig.data)),
      ...overrides
    },
    setData(next, callback) {
      Object.assign(this.data, next)
      if (callback) callback()
    }
  }
  Object.keys(pageConfig).forEach(key => {
    if (typeof pageConfig[key] === 'function') instance[key] = pageConfig[key]
  })
  return instance
}

function loadComponent(filePath, wxMock) {
  let componentConfig = null
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), {
    Component(config) {
      componentConfig = config
    },
    wx: wxMock,
    setTimeout,
    clearTimeout,
    console
  }, { filename: filePath })
  assert(componentConfig, `${path.basename(filePath)} did not create Component config`)
  return componentConfig
}

function makeComponentInstance(componentConfig, overrides = {}) {
  const instance = {
    data: {
      ...JSON.parse(JSON.stringify(componentConfig.data)),
      ...overrides
    },
    events: [],
    setData(next, callback) {
      Object.assign(this.data, next)
      if (callback) callback()
    },
    triggerEvent(name, detail) {
      this.events.push({ name, detail })
    }
  }
  Object.keys(componentConfig.methods || {}).forEach(name => {
    instance[name] = componentConfig.methods[name]
  })
  return instance
}

function call(pageConfig, instance, name, event) {
  return pageConfig[name].call(instance, event || {})
}

function resetMocks() {
  storeState = {
    mastery: {},
    favs: [],
    wrong: [],
    days: [],
    voiceMarked: []
  }
  recordCalls.length = 0
  toastCalls.length = 0
  navigationCalls.length = 0
  navigateBackCalls.length = 0
}

function makeNavigationWx() {
  return {
    showToast(options) {
      toastCalls.push(options)
    },
    navigateTo(options) {
      navigationCalls.push(options)
    },
    navigateBack(options) {
      navigateBackCalls.push(options)
    },
    switchTab(options) {
      navigationCalls.push(options)
    }
  }
}

function testPracticeEntry() {
  resetMocks()
  const practiceWxml = fs.readFileSync(PRACTICE_PAGE_WXML_PATH, 'utf8')
  assert(practiceWxml.includes('class="setup-row demo-row"'))
  assert(practiceWxml.includes('bindtap="startDemoSession"'))
  assert(practiceWxml.includes('30 题示范'))
  assert(practiceWxml.includes('{{questionCount}} 道基础题'))
  assert.strictEqual(practiceMeta.formulaCount, formulaUtils.FORMULAS.length)
  assert.strictEqual(
    practiceMeta.formalQuestionCount,
    practiceData.PRACTICE_QUESTIONS.filter(question => !question.demo).length
  )

  const app = { globalData: {} }
  const pageConfig = loadPage(PRACTICE_PAGE_PATH, {
    '../../utils/formula': formulaUtils,
    '../../utils/practice-meta': practiceMeta,
    '../../utils/store': storeMock,
    __app: app,
    __wx: makeNavigationWx()
  })
  assert.strictEqual(
    pageConfig.data.questionCount,
    practiceMeta.formalQuestionCount
  )

  let allFormulaCount = 0
  formulaUtils.CHAPTERS.forEach((chapter, chapterIndex) => {
    const instance = makeInstance(pageConfig, {
      chapterIndex: chapterIndex + 1,
      quantityIndex: 4,
      scopeIndex: 0
    })
    const pool = call(pageConfig, instance, 'buildPool')
    assert(pool.length > 0, `${chapter} has no formulas`)
    assert(pool.every(item => item.chapter === chapter), `${chapter}: filter leaked`)
    allFormulaCount += pool.length
  })
  assert.strictEqual(allFormulaCount, formulaUtils.FORMULAS.length)

  storeState.favs = formulaUtils.FORMULAS.slice(0, 7).map(item => item.id)
  const favoriteInstance = makeInstance(pageConfig, {
    quantityIndex: 4,
    scopeIndex: 1
  })
  const favoritePool = call(pageConfig, favoriteInstance, 'buildPool')
  assert.strictEqual(favoritePool.length, 7)
  assert(favoritePool.every(item => storeState.favs.includes(item.id)))

  const dueId = formulaUtils.FORMULAS[9].id
  storeState.favs = []
  storeState.mastery = {
    [dueId]: {
      lvl: 'unknown',
      last: '2026-10-23',
      next: '2026-10-24',
      streak: 0
    }
  }
  const dueInstance = makeInstance(pageConfig, {
    quantityIndex: 4,
    scopeIndex: 2
  })
  const duePool = call(pageConfig, dueInstance, 'buildPool')
  assert.deepStrictEqual(duePool.map(item => item.id), [dueId])

  storeState.mastery = {}
  const startInstance = makeInstance(pageConfig, {
    chapterIndex: 0,
    quantityIndex: 4,
    scopeIndex: 0
  })
  call(pageConfig, startInstance, 'startSession')
  call(pageConfig, startInstance, 'startSession')
  assert.strictEqual(startInstance.data.starting, true)
  assert.strictEqual(navigationCalls.length, 1)
  assert.strictEqual(
    navigationCalls[0].url,
    '/practice-package/pages/session/choice'
  )
  assert.strictEqual(
    app.globalData.practiceSession.sourceIds.length,
    formulaUtils.FORMULAS.length
  )
  assert.strictEqual(
    new Set(app.globalData.practiceSession.sourceIds).size,
    formulaUtils.FORMULAS.length
  )
  assert.deepStrictEqual(
    Array.from(app.globalData.practiceSession.sourceIds).sort(),
    formulaUtils.FORMULAS.map(item => item.id).sort()
  )
  assert.strictEqual(app.globalData.practiceSession.questionIds, undefined)
  const regularNavigationUrl = navigationCalls[0].url
  navigationCalls.length = 0

  const demoIds = DEMO_QUESTION_IDS.slice()
  storeState.favs = [formulaUtils.FORMULAS[0].id]
  const favoritesBeforeDemo = storeState.favs.slice()
  const demoApp = { globalData: {} }
  const demoConfig = loadPage(PRACTICE_PAGE_PATH, {
    '../../utils/formula': formulaUtils,
    '../../utils/practice-meta': practiceMeta,
    '../../utils/store': storeMock,
    __app: demoApp,
    __wx: makeNavigationWx()
  })
  const demoInstance = makeInstance(demoConfig)
  call(demoConfig, demoInstance, 'startDemoSession')
  call(demoConfig, demoInstance, 'startDemoSession')
  assert.strictEqual(navigationCalls.length, 1)
  assert.strictEqual(
    navigationCalls[0].url,
    '/practice-package/pages/session/choice'
  )
  assert.deepStrictEqual(
    Array.from(demoApp.globalData.practiceSession.questionIds),
    demoIds
  )
  assert.strictEqual(demoApp.globalData.practiceSession.demo, true)
  assert.deepStrictEqual(storeState.favs, favoritesBeforeDemo)
  assert.strictEqual(demoIds.length, DEMO_QUESTION_COUNT)
  assert(demoIds.every(id => demoQuestions.some(item => item.id === id)))

  return {
    chapters: formulaUtils.CHAPTERS.length,
    formulas: allFormulaCount,
    favorites: favoritePool.length,
    due: duePool.length,
    navigationUrl: regularNavigationUrl,
    duplicateStartsBlocked: 1,
    demoQuestionCount: demoIds.length,
    demoFavoritesUntouched: true
  }
}

function testDetailEntry() {
  resetMocks()
  const formula = formulaUtils.FORMULAS[0]
  const app = { globalData: {} }
  const pageConfig = loadPage(DETAIL_PAGE_PATH, {
    '../../utils/formula': {
      getFormula(id) {
        return id === formula.id ? formula : null
      }
    },
    '../../utils/store': storeMock,
    __app: app,
    __wx: makeNavigationWx(),
    __pages: [{}, {}]
  })
  const instance = makeInstance(pageConfig)
  call(pageConfig, instance, 'onLoad', { id: formula.id })
  call(pageConfig, instance, 'startPractice')

  assert.deepStrictEqual(
    Array.from(app.globalData.practiceSession.sourceIds),
    [formula.id]
  )
  assert.strictEqual(navigationCalls.length, 1)
  assert.strictEqual(
    navigationCalls[0].url,
    '/practice-package/pages/session/choice'
  )
  return {
    formulaId: formula.id,
    navigationUrl: navigationCalls[0].url
  }
}

function makeChoiceEnvironment(options = {}) {
  const packageLoadCalls = []
  const app = {
    globalData: {
      practiceSession: options.questionIds
        ? {
          questionIds: options.questionIds,
          demo: Boolean(options.demo)
        }
        : {
          sourceIds: options.sourceIds || formulaUtils.FORMULAS.map(item => item.id),
          demo: Boolean(options.demo)
        }
    }
  }
  const wxMock = {
    navigateBack(request) {
      navigateBackCalls.push(request)
    }
  }
  const trackPackageLoad = request => {
    packageLoadCalls.push(request.name)
    const task = {
      onProgressUpdate() {}
    }
    request.success({ errMsg: 'loadSubpackage:ok' })
    return task
  }
  if (options.loadSubpackage) wxMock.loadSubpackage = trackPackageLoad
  if (options.preloadSubpackage) wxMock.preloadSubpackage = trackPackageLoad

  const pageConfig = loadPage(CHOICE_PAGE_PATH, {
    '../../data/practice': practiceData,
    '../../../utils/store': storeMock,
    __app: app,
    __wx: wxMock
  })
  return {
    app,
    pageConfig,
    packageLoadCalls,
    wxMock
  }
}

function notifyAssetPackagesReady(pageConfig, instance, names) {
  const packageNames = names || practiceData.PRACTICE_ASSET_PACKAGES
    .map(item => item.name)
  packageNames.forEach(packageName => {
    call(pageConfig, instance, 'onAssetPackageReady', {
      currentTarget: {
        dataset: { packageName }
      }
    })
  })
}

const existingAssetPaths = new Set()

function assertCrop(entry, label) {
  assert(entry, `${label}: missing resolved expression`)
  assert(entry.expressionId, `${label}: missing expression id`)
  assert(entry.packageName, `${label}: missing asset package`)
  assert(entry.crop, `${label}: missing crop`)
  const { crop } = entry
  assert.strictEqual(typeof crop.sheet, 'string')
  assert(crop.sheet.startsWith('/practice-assets-'), `${label}: invalid sheet path`)
  assert(Number.isFinite(crop.x) && crop.x >= 0, `${label}: invalid x`)
  assert(Number.isFinite(crop.y) && crop.y >= 0, `${label}: invalid y`)
  assert(Number.isFinite(crop.width) && crop.width > 0, `${label}: invalid width`)
  assert(Number.isFinite(crop.height) && crop.height > 0, `${label}: invalid height`)
  assert(crop.x + crop.width <= crop.sheetWidth, `${label}: crop exceeds width`)
  assert(crop.y + crop.height <= crop.sheetHeight, `${label}: crop exceeds height`)

  const sheet = practiceData.PRACTICE_SHEETS.find(item => item.image === crop.sheet)
  assert(sheet, `${label}: unknown sheet`)
  assert.strictEqual(crop.sheetWidth, sheet.width)
  assert.strictEqual(crop.sheetHeight, sheet.height)
  assert.strictEqual(entry.packageName, sheet.packageName)

  if (!existingAssetPaths.has(crop.sheet)) {
    const absolute = path.join(PROJECT_ROOT, crop.sheet.replace(/^\//, ''))
    assert(fs.existsSync(absolute), `${label}: missing asset ${crop.sheet}`)
    existingAssetPaths.add(crop.sheet)
  }
}

function testChoiceAllQuestions() {
  resetMocks()
  existingAssetPaths.clear()
  const environment = makeChoiceEnvironment()
  const instance = makeInstance(environment.pageConfig)
  call(environment.pageConfig, instance, 'onLoad')

  assert.strictEqual(instance.data.empty, false)
  assert.strictEqual(instance.data.finished, false)
  assert.strictEqual(instance.data.total, baseQuestions.length)
  assert.strictEqual(instance.deck.length, baseQuestions.length)
  assert.strictEqual(environment.app.globalData.practiceSession, null)
  assert.strictEqual(instance.data.currentIndex, 0)
  assert(instance.data.current)
  assert.strictEqual(instance.data.assetLoading, true)
  assert.strictEqual(
    environment.packageLoadCalls.length,
    0,
    'anchor-only simulator should not require wx.loadSubpackage'
  )
  notifyAssetPackagesReady(environment.pageConfig, instance)
  assert.strictEqual(instance.data.assetLoading, false)
  assert.strictEqual(instance.data.quizOptions.length, 4)

  const visitedSourceIds = new Set()
  const visitedQuestionIds = new Set()
  const answerPositionCounts = { A: 0, B: 0, C: 0, D: 0 }
  let correctChecked = 0
  let wrongChecked = 0
  let optionCropsChecked = 0
  let stemCropsChecked = 0
  const expectedResults = new Map()

  for (let index = 0; index < instance.deck.length; index += 1) {
    const current = instance.deck[index]
    assert.strictEqual(instance.data.currentIndex, index)
    assert.strictEqual(instance.data.current.sourceId, current.sourceId)
    assert(!visitedQuestionIds.has(current.id), `${current.id}: duplicate question`)
    visitedQuestionIds.add(current.id)
    visitedSourceIds.add(current.sourceId)

    assert.strictEqual(instance.data.questionPrompt, TYPE_PROMPTS[current.type])
    assert.strictEqual(instance.data.assetLoading, false)
    assert.strictEqual(instance.data.loadError, '')
    assert.strictEqual(instance.data.loadProgress, 100)
    assert.strictEqual(instance.data.quizAnswered, false)
    assert.strictEqual(instance.data.quizCorrect, false)
    assert.strictEqual(instance.data.feedbackText, '')

    assert(instance.data.stem, `${current.sourceId}: missing stem`)
    assert.strictEqual(instance.data.stem.expressionId, current.stemExpressionId)
    assertCrop(instance.data.stem, `${current.sourceId}: stem`)
    stemCropsChecked += 1

    const options = instance.data.quizOptions
    assert.strictEqual(options.length, 4)
    assert.strictEqual(
      new Set(options.map(option => option.expressionId)).size,
      4,
      `${current.id}: duplicate runtime option`
    )
    assert.strictEqual(
      options.filter(option => option.isCorrect).length,
      1,
      `${current.id}: expected exactly one correct option`
    )
    assert.deepStrictEqual(
      options.map(option => option.letter),
      ['A', 'B', 'C', 'D']
    )
    options.forEach(option => {
      assert.strictEqual(option.status, '')
      assertCrop(option, `${current.sourceId}: option ${option.expressionId}`)
      optionCropsChecked += 1
    })

    const correct = options.find(option => option.isCorrect)
    const wrong = options.find(option => !option.isCorrect)
    answerPositionCounts[correct.letter] += 1
    const answerCorrectly = index % 2 === 0
    const selected = answerCorrectly ? correct : wrong
    const callsBefore = recordCalls.length
    const statsBefore = { ...instance.sessionStats }

    call(environment.pageConfig, instance, 'chooseOption', {
      currentTarget: { dataset: { id: selected.expressionId } }
    })

    assert.strictEqual(recordCalls.length, callsBefore)
    expectedResults.set(
      current.sourceId,
      answerCorrectly ? 'known' : 'unknown'
    )
    assert.strictEqual(instance.data.quizAnswered, true)
    assert.strictEqual(instance.data.quizCorrect, answerCorrectly)
    assert.strictEqual(
      instance.sessionStats.known,
      statsBefore.known + (answerCorrectly ? 1 : 0)
    )
    assert.strictEqual(
      instance.sessionStats.unknown,
      statsBefore.unknown + (answerCorrectly ? 0 : 1)
    )
    assert(
      instance.data.quizOptions.find(
        option => option.expressionId === correct.expressionId
      ).status === 'correct'
    )
    if (!answerCorrectly) {
      assert.strictEqual(
        instance.data.quizOptions.find(
          option => option.expressionId === selected.expressionId
        ).status,
        'wrong'
      )
      assert(instance.data.feedbackText.includes(`正确项是 ${correct.letter}`))
      assert(instance.data.feedbackText.includes(selected.errorKind))
      wrongChecked += 1
    } else {
      assert(instance.data.feedbackText.includes('回答正确'))
      correctChecked += 1
    }

    call(environment.pageConfig, instance, 'chooseOption', {
      currentTarget: { dataset: { id: selected.expressionId } }
    })
    assert.strictEqual(
      recordCalls.length,
      callsBefore,
      `${current.id}: mastery recorded before session finished`
    )
    assert.strictEqual(instance.sessionStats.known, statsBefore.known + (answerCorrectly ? 1 : 0))
    assert.strictEqual(instance.sessionStats.unknown, statsBefore.unknown + (answerCorrectly ? 0 : 1))

    call(environment.pageConfig, instance, 'advance')
  }

  assert.strictEqual(visitedQuestionIds.size, baseQuestions.length)
  assert.strictEqual(visitedSourceIds.size, formulaUtils.FORMULAS.length)
  assert.strictEqual(stemCropsChecked, baseQuestions.length)
  assert.strictEqual(optionCropsChecked, baseQuestions.length * 4)
  assert.strictEqual(recordCalls.length, expectedResults.size)
  assert.deepStrictEqual(
    recordCalls.slice().sort((left, right) => left.id.localeCompare(right.id)),
    Array.from(expectedResults, ([id, level]) => ({ id, level }))
      .sort((left, right) => left.id.localeCompare(right.id))
  )
  assert.strictEqual(instance.data.finished, true)
  assert.strictEqual(instance.data.current, null)
  assert.strictEqual(instance.data.progress, 100)
  assert.strictEqual(instance.data.stats.known, correctChecked)
  assert.strictEqual(instance.data.stats.unknown, wrongChecked)
  assert.strictEqual(correctChecked + wrongChecked, baseQuestions.length)
  assert.deepStrictEqual(
    Array.from(instance.loadedPackages).sort(),
    practiceData.PRACTICE_ASSET_PACKAGES.map(item => item.name).sort()
  )
  assert.strictEqual(environment.packageLoadCalls.length, 0)

  const packagesBeforeRestart = Array.from(instance.loadedPackages).sort()
  call(environment.pageConfig, instance, 'restartSession')
  assert.strictEqual(instance.data.finished, false)
  assert.strictEqual(instance.data.currentIndex, 0)
  assert.strictEqual(instance.data.total, baseQuestions.length)
  assert.strictEqual(instance.data.stats.known, 0)
  assert.strictEqual(instance.data.stats.unknown, 0)
  assert(instance.data.current)
  assert.strictEqual(instance.data.quizOptions.length, 4)
  assert.deepStrictEqual(
    Array.from(instance.loadedPackages).sort(),
    packagesBeforeRestart
  )

  call(environment.pageConfig, instance, 'goBack')
  assert.strictEqual(
    navigateBackCalls[navigateBackCalls.length - 1].delta,
    1
  )

  return {
    questionsChecked: visitedQuestionIds.size,
    formulasChecked: visitedSourceIds.size,
    stemCropsChecked,
    optionCropsChecked,
    correctChecked,
    wrongChecked,
    answerPositionCounts,
    packagesLoaded: Array.from(instance.loadedPackages).sort(),
    simulatorApiRequired: false,
    duplicateClicksBlocked: baseQuestions.length,
    masteryWrites: recordCalls.length,
    restartTotal: instance.data.total
  }
}

function testChoiceDeduplicationAndEmptyState() {
  resetMocks()
  const ids = baseQuestions.slice(0, 2)
    .map(question => question.id)
  const environment = makeChoiceEnvironment({
    questionIds: [ids[0], ids[0], ids[1], '', null]
  })
  const instance = makeInstance(environment.pageConfig)
  call(environment.pageConfig, instance, 'onLoad')
  assert.strictEqual(instance.data.total, 2)
  assert.deepStrictEqual(
    Array.from(instance.deck, question => question.id),
    ids
  )

  const multiSourceId = formulaUtils.FORMULAS.find(formula => (
    baseQuestions.filter(question => question.sourceId === formula.id).length > 1
  )).id
  const expectedMultiIds = baseQuestions
    .filter(question => question.sourceId === multiSourceId)
    .map(question => question.id)
    .sort()
  const sourceEnvironment = makeChoiceEnvironment({
    sourceIds: [multiSourceId, multiSourceId, '', null]
  })
  const sourceInstance = makeInstance(sourceEnvironment.pageConfig)
  call(sourceEnvironment.pageConfig, sourceInstance, 'onLoad')
  assert.strictEqual(sourceInstance.deck.length, expectedMultiIds.length)
  assert.deepStrictEqual(
    Array.from(sourceInstance.deck, question => question.id).sort(),
    expectedMultiIds
  )
  assert(sourceInstance.data.total > 1)

  const emptyEnvironment = makeChoiceEnvironment({
    questionIds: ['', null, 'NOT-A-FORMULA']
  })
  const emptyInstance = makeInstance(emptyEnvironment.pageConfig)
  call(emptyEnvironment.pageConfig, emptyInstance, 'onLoad')
  assert.strictEqual(emptyInstance.data.empty, true)
  assert.strictEqual(emptyInstance.data.total, 0)
  assert.strictEqual(recordCalls.length, 0)

  return {
    inputIds: 5,
    uniqueLoaded: instance.deck.length,
    multiQuestionFormula: multiSourceId,
    expandedQuestions: sourceInstance.deck.length,
    invalidQuestionIds: 3,
    emptyState: emptyInstance.data.empty
  }
}

function testDemoSessionAndSwipeGuard() {
  resetMocks()
  const demoIds = DEMO_QUESTION_IDS.slice()
  const environment = makeChoiceEnvironment({
    questionIds: demoIds,
    demo: true
  })
  const instance = makeInstance(environment.pageConfig)
  call(environment.pageConfig, instance, 'onLoad')
  assert.strictEqual(instance.data.isDemo, true)
  assert.strictEqual(instance.data.total, DEMO_QUESTION_COUNT)
  assert.deepStrictEqual(
    Array.from(instance.deck, question => question.id),
    demoIds
  )

  notifyAssetPackagesReady(environment.pageConfig, instance)
  const visitedQuestionIds = new Set()
  for (let index = 0; index < demoIds.length; index += 1) {
    const current = instance.deck[index]
    assert.strictEqual(instance.data.current.id, current.id)
    assert(!visitedQuestionIds.has(current.id), `${current.id}: duplicate demo question`)
    visitedQuestionIds.add(current.id)
    assert.strictEqual(instance.data.assetLoading, false)
    const options = instance.data.quizOptions
    assert.strictEqual(options.length, 4)
    const selected = options.find(option => option.isCorrect)

    if (index === 0) {
      call(environment.pageConfig, instance, 'onFormulaSwipe')
      call(environment.pageConfig, instance, 'chooseOption', {
        currentTarget: { dataset: { id: selected.expressionId } }
      })
      assert.strictEqual(instance.data.quizAnswered, false)
      assert.strictEqual(recordCalls.length, 0)
    }

    call(environment.pageConfig, instance, 'chooseOption', {
      currentTarget: { dataset: { id: selected.expressionId } }
    })
    assert.strictEqual(instance.data.quizAnswered, true)
    assert.strictEqual(recordCalls.length, 0)
    assert.strictEqual(instance.data.feedbackText, '回答正确，本次为演示。')
    call(environment.pageConfig, instance, 'advance')
  }
  assert.strictEqual(visitedQuestionIds.size, DEMO_QUESTION_COUNT)
  assert.strictEqual(instance.data.finished, true)
  assert.strictEqual(instance.data.stats.known, DEMO_QUESTION_COUNT)
  call(environment.pageConfig, instance, 'onUnload')

  return {
    total: instance.data.total,
    orderPreserved: true,
    swipeDidNotChoose: true,
    demoRecordWrites: recordCalls.length,
    localDemoStats: instance.sessionStats.known
  }
}

function testChoiceAssetFailureAndRetry() {
  resetMocks()
  const environment = makeChoiceEnvironment({
    questionIds: [baseQuestions[0].id]
  })
  const instance = makeInstance(environment.pageConfig)
  call(environment.pageConfig, instance, 'onLoad')
  assert.strictEqual(instance.data.assetLoading, true)
  call(environment.pageConfig, instance, 'assetLoadTimeout')
  assert.strictEqual(instance.data.assetLoading, false)
  assert(instance.data.loadError.includes('加载超时'))
  assert.strictEqual(instance.data.quizOptions.length, 0)

  notifyAssetPackagesReady(environment.pageConfig, instance)
  call(environment.pageConfig, instance, 'retryAssets')
  assert.strictEqual(instance.data.loadError, '')
  assert.strictEqual(instance.data.assetLoading, false)
  assert.strictEqual(instance.data.quizOptions.length, 4)

  return {
    timeoutShown: true,
    anchorRecoverySucceeded: true,
    retrySucceeded: true
  }
}

function testChoiceSubpackageApiFallback() {
  resetMocks()
  const environment = makeChoiceEnvironment({
    questionIds: [baseQuestions[0].id],
    loadSubpackage: true
  })
  const instance = makeInstance(environment.pageConfig)
  call(environment.pageConfig, instance, 'onLoad')

  assert.strictEqual(instance.data.assetLoading, false)
  assert.strictEqual(instance.data.loadError, '')
  assert.strictEqual(instance.data.quizOptions.length, 4)

  const packageNames = practiceData.PRACTICE_ASSET_PACKAGES.map(item => item.name)
  const callsBeforeFallback = environment.packageLoadCalls.length
  instance.loadedPackages.clear()
  let fallbackSucceeded = false
  environment.pageConfig.ensurePackagesLoaded.call(
    instance,
    packageNames,
    () => {
      fallbackSucceeded = true
    },
    message => {
      throw new Error(message)
    }
  )
  assert.strictEqual(fallbackSucceeded, true)
  assert.deepStrictEqual(
    environment.packageLoadCalls.slice(callsBeforeFallback).sort(),
    packageNames.slice().sort()
  )

  return {
    apiFallbackSucceeded: true,
    packageLoadAttempts: environment.packageLoadCalls.length
  }
}

function resolvePracticeCrop(expressionId) {
  const crop = practiceData.PRACTICE_EXPRESSION_CROPS[expressionId]
  if (!Array.isArray(crop) || crop.length !== 5) return null
  const sheet = practiceData.PRACTICE_SHEETS[Number(crop[0])]
  if (!sheet) return null
  return {
    sheet: sheet.image,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
    x: crop[1],
    y: crop[2],
    width: crop[3],
    height: crop[4]
  }
}

function testFormulaCropAdaptation() {
  resetMocks()
  const componentConfig = loadComponent(cropJsPath, {
    getWindowInfo() {
      return { windowWidth: 375 }
    }
  })
  const observerName = Object.keys(componentConfig.observers)
    .find(name => name.includes('sheet'))
  assert(observerName, 'formula-crop has no observer')
  const updateCrop = componentConfig.observers[observerName]
  const longQuestionIds = new Set()
  let longOptions = 0
  let adaptedOptions = 0
  let totalOptions = 0
  let scrollRangeChecks = 0

  function exerciseCrop(crop, maxWidth, label) {
    const instance = makeComponentInstance(componentConfig, {
      ...crop,
      maxWidth,
      align: 'left',
      fit: false
    })
    updateCrop.call(instance)
    assert.strictEqual(instance.data.ready, true, `${label}: not ready`)
    assert.strictEqual(instance.data.imageAsset, crop.sheet, `${label}: sheet lost`)

    const naturalWidth = crop.width * 2
    const shouldScroll = naturalWidth > maxWidth
    assert.strictEqual(
      instance.data.scrollable,
      shouldScroll,
      `${label}: scrollable mismatch`
    )
    assert.strictEqual(
      instance.data.viewportWidth,
      Math.min(naturalWidth, maxWidth),
      `${label}: viewport width mismatch`
    )
    assert(
      instance.data.canvasStyle.includes(`width:${naturalWidth}rpx`),
      `${label}: natural formula width lost`
    )

    if (!shouldScroll) return { shouldScroll, instance }

    return { shouldScroll, instance }
  }

  practiceData.PRACTICE_QUESTIONS.forEach(question => {
    question.options.forEach(option => {
      const crop = resolvePracticeCrop(option.expressionId)
      assert(crop, `${question.id}: unresolved option crop`)
      const result = exerciseCrop(
        crop,
        574,
        `${question.id}/${option.expressionId}`
      )
      totalOptions += 1
      if (!result.shouldScroll) return

      longOptions += 1
      longQuestionIds.add(question.id)
      adaptedOptions += 1
      assert(result.instance.data.scrollable, `${question.id}: gesture lost`)
      scrollRangeChecks += 1
    })
  })

  const gestureCrop = resolvePracticeCrop(
    practiceData.PRACTICE_QUESTIONS
      .find(question => question.sourceId === 'C045')
      .options[0].expressionId
  )
  const gesture = exerciseCrop(gestureCrop, 574, 'C045/gesture')
  gesture.instance.onScrollTouchStart({
    touches: [{ clientX: 120, clientY: 40 }]
  })
  gesture.instance.onScrollTouchMove({
    touches: [{ clientX: 70, clientY: 42 }]
  })
  assert(
    gesture.instance.events.some(event => event.name === 'cropswipe'),
    'C045: horizontal gesture was not detected'
  )
  gesture.instance.onScrollTouchEnd()

  return {
    expectedQuestions: practiceData.PRACTICE_QUESTIONS.length,
    totalOptions,
    longOptions,
    adaptedOptions,
    longQuestions: longQuestionIds.size,
    scrollRangeChecks,
    gestureDetected: true
  }
}

function testSingleChoiceContractAndRegistration() {
  const choiceWxml = fs.readFileSync(choiceWxmlPath, 'utf8')
  const choiceJson = JSON.parse(fs.readFileSync(choiceJsonPath, 'utf8'))
  const choiceJs = fs.readFileSync(CHOICE_PAGE_PATH, 'utf8')
  const cropJs = fs.readFileSync(cropJsPath, 'utf8')
  const cropWxml = fs.readFileSync(cropWxmlPath, 'utf8')
  const cropWxss = fs.readFileSync(cropWxssPath, 'utf8')
  const forbiddenMarkers = [
    '<input',
    'fillValue',
    'symbolKeys',
    'submitFillAnswer',
    'PRACTICE_CROPS',
    'formulaId',
    '/session/session'
  ]
  forbiddenMarkers.forEach(marker => {
    assert(!choiceWxml.includes(marker), `choice.wxml still contains ${marker}`)
    assert(!choiceJs.includes(marker), `choice.js still contains ${marker}`)
  })
  assert(!fs.existsSync(INTEGER_PAGE_PATH), 'integer.js should not exist')
  assert(!fs.existsSync(OLD_SESSION_PAGE_PATH), 'session.js should not exist')
  assert(choiceWxml.includes('session-progress-row'))
  assert(choiceWxml.includes('next-pill'))
  assert(!choiceWxml.includes('next-button'))
  assert(choiceWxml.includes('max-width="{{574}}"'))
  assert(choiceWxml.includes('bind:cropswipe="onFormulaSwipe"'))
  assert(cropWxml.includes('bindtouchstart="onScrollTouchStart"'))
  assert(cropWxml.includes('bindtouchmove="onScrollTouchMove"'))
  assert(cropWxml.includes('scroll-x="true"'))
  assert(cropWxml.includes('show-scrollbar="{{false}}"'))
  assert(!cropWxml.includes('scroll-left='))
  assert(!cropWxml.includes('bindscroll='))
  assert(!cropWxml.includes('catchtap="scrollPage"'))
  assert(!cropWxml.includes('crop-nav'))
  assert(!cropWxml.includes('crop-scroll-meter'))
  assert(!cropWxss.includes('crop-nav'))
  assert(!cropWxss.includes('crop-scroll-meter'))
  assert(!cropJs.includes('scrollPage'))
  assert(!cropJs.includes('updateScrollState'))
  assert(!cropJs.includes('SCROLL_PAGE_RATIO'))
  practiceData.PRACTICE_ASSET_PACKAGES.forEach((assetPackage, index) => {
    const anchorName = `practice-asset-anchor-${String.fromCharCode(97 + index)}`
    assert(choiceWxml.includes(anchorName), `${anchorName}: missing anchor`)
    assert.strictEqual(
      choiceJson.usingComponents[anchorName],
      `/${assetPackage.root}/components/anchor/anchor`
    )
    assert.strictEqual(
      choiceJson.componentPlaceholder[anchorName],
      'anchor-placeholder'
    )
    const root = assetPackage.root
    ;['anchor.js', 'anchor.json', 'anchor.wxml', 'anchor.wxss'].forEach(file => {
      assert(
        fs.existsSync(path.join(PROJECT_ROOT, root, 'components/anchor', file)),
        `${root}: missing ${file}`
      )
    })
  })

  const practicePackage = appConfig.subPackages.find(
    item => item.root === 'practice-package'
  )
  assert(practicePackage)
  assert.deepStrictEqual(practicePackage.pages, ['pages/session/choice'])
  assert(!appConfig.pages.some(page => page.startsWith('practice-package/')))

  return {
    inputApiAbsent: true,
    oldSessionPageAbsent: true,
    packageAnchorsReady: true,
    registeredPage: practicePackage.pages[0]
  }
}

function main() {
  const practice = testPracticeEntry()
  const detail = testDetailEntry()
  const choice = testChoiceAllQuestions()
  const dedupe = testChoiceDeduplicationAndEmptyState()
  const demo = testDemoSessionAndSwipeGuard()
  const retry = testChoiceAssetFailureAndRetry()
  const apiFallback = testChoiceSubpackageApiFallback()
  const cropAdaptation = testFormulaCropAdaptation()
  const contract = testSingleChoiceContractAndRegistration()

  console.log(JSON.stringify({
    practice,
    detail,
    choice,
    dedupe,
    demo,
    retry,
    apiFallback,
    cropAdaptation,
    contract,
    failures: 0
  }, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
