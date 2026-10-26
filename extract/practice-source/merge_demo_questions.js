/*
 * Merge the standalone demo question bank into the runtime source bank.
 *
 * Formal questions are merged without assuming one question per formula. Demo
 * questions stay isolated from coverage and mastery records.
 */

const fs = require('fs')
const path = require('path')
const { buildFormulaAtoms } = require('./formula-atoms')

const ROOT = path.resolve(__dirname, '../..')
const QUESTIONS_PATH = path.join(__dirname, 'questions.json')
const DEMO_PATH = path.join(__dirname, 'demo-questions.json')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const DEMO_QUESTION_COUNT = 30

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function countBy(items, getKey) {
  const counts = {}
  items.forEach(item => {
    const key = getKey(item)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => (
      left.localeCompare(right, 'zh-CN')
    ))
  )
}

function main() {
  const questionSource = readJson(QUESTIONS_PATH)
  const demoSource = readJson(DEMO_PATH)
  const formulaSource = readJson(FORMULAS_PATH)
  if (!Array.isArray(questionSource.items)
    || !Array.isArray(demoSource.items)
    || !Array.isArray(formulaSource.items)) {
    throw new Error('题库、示范题或公式库缺少 items 数组')
  }

  const baseQuestions = questionSource.items.filter(item => item.demo !== true)
  const demoQuestions = demoSource.items
  if (demoQuestions.length !== DEMO_QUESTION_COUNT) {
    throw new Error(
      `示范题应为 ${DEMO_QUESTION_COUNT} 道，实际 ${demoQuestions.length} 道`
    )
  }
  if (demoQuestions.some(item => item.demo !== true)) {
    throw new Error('示范题源中存在未标记 demo: true 的题目')
  }

  const formulaMap = new Map(formulaSource.items.map(item => [item.id, item]))
  const formalByFormula = new Map()
  const formalByAtom = new Map()
  baseQuestions.forEach(question => {
    if (!formulaMap.has(question.sourceId)) {
      throw new Error(`${question.id}: 来源公式不存在`)
    }
    if (!formalByFormula.has(question.sourceId)) {
      formalByFormula.set(question.sourceId, [])
    }
    formalByFormula.get(question.sourceId).push(question)
    if (!question.atomId) {
      throw new Error(`${question.id}: 正式题缺少 atomId`)
    }
    if (formalByAtom.has(question.atomId)) {
      throw new Error(
        `${question.atomId}: 同时被 ${formalByAtom.get(question.atomId)} 和 ` +
        `${question.id} 覆盖`
      )
    }
    formalByAtom.set(question.atomId, question.id)
  })
  const missingBase = formulaSource.items
    .filter(formula => !formalByFormula.has(formula.id))
    .map(formula => formula.id)
  if (missingBase.length) {
    throw new Error(`正式题未覆盖公式: ${missingBase.join(', ')}`)
  }
  const expectedAtoms = formulaSource.items.flatMap(formula => (
    buildFormulaAtoms(formula)
  ))
  const missingAtoms = expectedAtoms
    .filter(atom => !formalByAtom.has(atom.atomId))
    .map(atom => atom.atomId)
  if (missingAtoms.length) {
    throw new Error(`正式题未覆盖公式原子: ${missingAtoms.join(', ')}`)
  }

  const items = [...baseQuestions, ...demoQuestions]
  const questionIds = new Set()
  items.forEach(question => {
    if (!question.id) throw new Error('存在缺少 id 的题目')
    if (questionIds.has(question.id)) {
      throw new Error(`${question.id}: 合并后题目 id 重复`)
    }
    questionIds.add(question.id)
  })

  const typeCounts = countBy(items, item => item.type)
  const promptFormCounts = countBy(
    baseQuestions,
    item => item.promptForm || 'qa'
  )
  const nextMeta = {
    version: 6,
    description: '全部公式原子至少一道正式选择题，另有 30 道示范选择题',
    source: 'prototype/data/公式库-全量.json',
    chapterCount: new Set(formulaSource.items.map(item => item.chapter)).size,
    questionCount: items.length,
    baseQuestionCount: baseQuestions.length,
    formalQuestionCount: baseQuestions.length,
    demoQuestionCount: demoQuestions.length,
    coveredFormulaCount: formalByFormula.size,
    formulaCount: formulaSource.items.length,
    atomCount: expectedAtoms.length,
    coveredAtomCount: formalByAtom.size,
    coveragePolicy: 'every-base-question-covers-an-atom',
    formPolicy: 'every-formula-atom-has-a-formal-choice',
    types: ['reconstruct', 'blank', 'condition'],
    typeCounts,
    authoringCounts: countBy(items, item => item.authoring),
    errorKindCounts: countBy(
      items.flatMap(item => item.distractors || []),
      item => item.errorKind
    ),
    fillPolicy: 'removed',
    promptFormCounts,
    variantsPolicy: 'formula atoms may have question and completion variants'
  }
  const output = {
    meta: nextMeta,
    items
  }
  const serialized = `${JSON.stringify(output, null, 2)}\n`
  const current = fs.readFileSync(QUESTIONS_PATH, 'utf8')
  if (current !== serialized) {
    fs.writeFileSync(QUESTIONS_PATH, serialized, 'utf8')
  }

  console.log(
    `已合并 ${baseQuestions.length} 道正式题 + ${demoQuestions.length} 道示范题，` +
    `共 ${items.length} 道`
  )
  console.log(
    `题型: 整式重建 ${typeCounts.reconstruct || 0} / ` +
    `核心块补全 ${typeCounts.blank || 0} / ` +
    `条件判断 ${typeCounts.condition || 0}`
  )
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
