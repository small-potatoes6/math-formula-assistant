/*
 * Read-only diagnostics for the formula-atom practice bank.
 *
 * This script reports atom shapes and overlap with the existing question bank.
 * It is intentionally separate from the builder so inspection never rewrites
 * source questions.
 */

const fs = require('fs')
const path = require('path')

const {
  buildFormulaAtoms,
  rankQuestionAtoms
} = require('./formula-atoms')

const ROOT = path.resolve(__dirname, '../..')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const QUESTIONS_PATH = path.join(ROOT, 'extract/practice-source/questions.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r\n?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function main() {
  const formulaSource = readJson(FORMULAS_PATH)
  const questionSource = readJson(QUESTIONS_PATH)
  const atomsByFormula = new Map()
  const allAtoms = []

  formulaSource.items.forEach(formula => {
    const atoms = buildFormulaAtoms(formula)
    atomsByFormula.set(formula.id, atoms)
    allAtoms.push(...atoms.map(atom => ({ ...atom, sourceId: formula.id })))
  })

  const rankedQuestions = questionSource.items.map(question => {
    const ranked = rankQuestionAtoms(
      atomsByFormula.get(question.sourceId) || [],
      question
    )
    return {
      id: question.id,
      demo: question.demo === true,
      sourceId: question.sourceId,
      answerLatex: normalizeLatex(question.answerLatex),
      topScore: ranked[0] ? Math.round(ranked[0].score * 100) / 100 : 0,
      topAtomId: ranked[0] ? ranked[0].atom.atomId : '',
      topStatement: ranked[0] ? ranked[0].atom.statement : ''
    }
  })

  const base = rankedQuestions.filter(question => !question.demo)
  const lowConfidence = base
    .filter(question => question.topScore < 34)
    .sort((left, right) => left.topScore - right.topScore)
  const exactAnswerMatches = base.filter(question => {
    const atoms = atomsByFormula.get(question.sourceId) || []
    return atoms.some(atom => normalizeLatex(atom.rhs) === question.answerLatex)
  })
  const relationCounts = {}
  const kindCounts = {}
  const rhsLengths = []
  allAtoms.forEach(atom => {
    relationCounts[atom.operator] = (relationCounts[atom.operator] || 0) + 1
    kindCounts[atom.kind] = (kindCounts[atom.kind] || 0) + 1
    rhsLengths.push(normalizeLatex(atom.rhs).length)
  })

  const atomCounts = [...atomsByFormula.entries()]
    .map(([sourceId, atoms]) => ({ sourceId, count: atoms.length }))
    .sort((left, right) => right.count - left.count)

  console.log(JSON.stringify({
    formulas: formulaSource.items.length,
    atoms: allAtoms.length,
    questions: questionSource.items.length,
    baseQuestions: base.length,
    demoQuestions: rankedQuestions.length - base.length,
    atomCountRange: {
      min: Math.min(...atomCounts.map(item => item.count)),
      max: Math.max(...atomCounts.map(item => item.count))
    },
    relationCounts,
    kindCounts,
    rhsLength: {
      min: Math.min(...rhsLengths),
      median: rhsLengths.slice().sort((left, right) => left - right)[
        Math.floor(rhsLengths.length / 2)
      ],
      max: Math.max(...rhsLengths)
    },
    baseExactAnswerMatches: exactAnswerMatches.length,
    baseLowConfidence: lowConfidence.length,
    scoreBuckets: {
      below34: base.filter(item => item.topScore < 34).length,
      from34To59: base.filter(item => item.topScore >= 34 && item.topScore < 60).length,
      from60To99: base.filter(item => item.topScore >= 60 && item.topScore < 100).length,
      atLeast100: base.filter(item => item.topScore >= 100).length
    },
    lowConfidence: lowConfidence.slice(0, 50),
    largestAtomGroups: atomCounts.slice(0, 25)
  }, null, 2))
}

main()
