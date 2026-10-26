/*
 * Shared formula-atom parser for the practice question bank.
 *
 * An atom is the smallest formula statement that can stand alone as a
 * multiple-choice question. We split only at top-level separators, so commas
 * or semicolons inside fractions, roots, text labels, and braces are preserved.
 */

const crypto = require('crypto')

const RELATION_TOKENS = [
  '\\Longleftrightarrow',
  '\\Leftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\Leftarrow',
  '\\iff',
  '\\implies',
  '\\to',
  '\\mapsto',
  '\\text{ 的否定是 }',
  '\\notin',
  '\\subseteq',
  '\\subsetneq',
  '\\supseteq',
  '\\subset',
  '\\supset',
  '\\geqslant',
  '\\leqslant',
  '\\geq',
  '\\leq',
  '\\neq',
  '\\ge',
  '\\le',
  '\\in',
  '=',
  '<',
  '>'
].sort((left, right) => right.length - left.length)

const STRONG_RELATION_TOKENS = new Set([
  '\\Longleftrightarrow',
  '\\Leftrightarrow',
  '\\Longrightarrow',
  '\\Rightarrow',
  '\\Leftarrow',
  '\\iff',
  '\\implies',
  '\\to',
  '\\mapsto',
  '\\text{ 的否定是 }'
])

const EQUALITY_TOKENS = new Set(['=', '\\neq'])

// A few source formulas use prose punctuation that is intentionally omitted
// from the display formula. Keep their practice atoms explicit so coverage is
// based on the actual mathematical statements a student must remember.
const FORMULA_ATOM_OVERRIDES = {
  C002: [
    {
      lhs: 'n\\text{ 元集合的子集个数}',
      operator: '=',
      rhs: '2^n'
    },
    {
      lhs: 'n\\text{ 元集合的真子集个数}',
      operator: '=',
      rhs: '2^n-1'
    },
    {
      lhs: 'n\\text{ 元集合的非空真子集个数}',
      operator: '=',
      rhs: '2^n-2'
    }
  ],
  C042: [
    {
      lhs: '\\log_a 1',
      operator: '=',
      rhs: '0'
    },
    {
      lhs: '\\log_a a',
      operator: '=',
      rhs: '1'
    },
    {
      lhs: 'a^{\\log_a N}',
      operator: '=',
      rhs: 'N'
    },
    {
      lhs: '\\log_a a^b',
      operator: '=',
      rhs: 'b'
    },
    {
      lhs: '\\log_a N\\text{ 有意义的条件}',
      operator: ':',
      rhs: 'a>0,\\ a\\neq1,\\ N>0'
    }
  ]
}

function relationPriority(token) {
  if (STRONG_RELATION_TOKENS.has(token)) return 4
  if (EQUALITY_TOKENS.has(token)) return 3
  if (token === '\\in' || token === '\\notin') return 2
  return 1
}

function relationTokenAt(source, index) {
  return RELATION_TOKENS.find(token => {
    if (!source.startsWith(token, index)) return false
    if (!token.startsWith('\\')) return true
    return !/[A-Za-z]/.test(source[index + token.length] || '')
  }) || null
}

function normalizeLatex(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;]+/, '')
    .replace(/[\s,;]+$/, '')
    .replace(/^(?:(?:\\qquad|\\quad)\s*|\\\s+)+/, '')
    .trim()
}

function normalizeForCompare(value) {
  return normalizeLatex(value)
    .replace(/\\left|\\right/g, '')
    .replace(/\\text\s*/g, '')
    .replace(/\\qquad|\\quad/g, '')
    .replace(/\\[,;:!]/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '')
}

function isEscaped(source, index) {
  let slashCount = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    slashCount += 1
  }
  return slashCount % 2 === 1
}

function structuralDelimiterAt(source, index) {
  const tokens = [
    ['\\left\\{', 'open', 7],
    ['\\right\\}', 'close', 8],
    ['\\left\\lbrace', 'open', 13],
    ['\\right\\rbrace', 'close', 14],
    ['\\lbrace', 'open', 7],
    ['\\rbrace', 'close', 8],
    ['\\{', 'open', 2],
    ['\\}', 'close', 2]
  ]
  return tokens.find(([token]) => source.startsWith(token, index)) || null
}

function updateDepth(depth, source, index) {
  const structural = structuralDelimiterAt(source, index)
  if (structural) {
    const [, kind, length] = structural
    depth.brace = Math.max(0, depth.brace + (kind === 'open' ? 1 : -1))
    return length
  }

  const character = source[index]
  if (!isEscaped(source, index)) {
    if (character === '{') depth.brace += 1
    else if (character === '}') depth.brace = Math.max(0, depth.brace - 1)
    else if (character === '(') depth.paren += 1
    else if (character === ')') depth.paren = Math.max(0, depth.paren - 1)
    else if (character === '[') depth.bracket += 1
    else if (character === ']') depth.bracket = Math.max(0, depth.bracket - 1)
  }
  return 1
}

function isTopLevel(depth) {
  return depth.brace === 0 && depth.paren === 0 && depth.bracket === 0
}

function splitTopLevel(latex, separators) {
  const source = normalizeLatex(latex)
  const ordered = separators.slice().sort((left, right) => right.length - left.length)
  const output = []
  let start = 0
  const depth = { brace: 0, paren: 0, bracket: 0 }

  for (let index = 0; index < source.length; index += 1) {
    if (!isTopLevel(depth)) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    const matched = ordered.find(separator => (
      source.startsWith(separator, index)
      && (
        !/[-,;]/.test(separator[0])
        || !isEscaped(source, index)
      )
    ))
    if (!matched) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    output.push(source.slice(start, index).trim())
    start = index + matched.length
    index += matched.length - 1
  }

  output.push(source.slice(start).trim())
  return output.filter(Boolean)
}

function splitFormulaClauses(latex) {
  const source = normalizeLatex(latex)
  const output = []
  const depth = { brace: 0, paren: 0, bracket: 0 }
  // Semicolon-delimited data already groups related properties. In that case
  // top-level \quad is normally spacing inside a group, not a new formula.
  const separators = splitTopLevel(source, [';']).length > 1
    ? [';']
    : ['\\qquad', '\\quad']
  let start = 0

  for (let index = 0; index < source.length; index += 1) {
    if (!isTopLevel(depth)) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    const separator = separators.find(token => (
      source.startsWith(token, index)
      && (
        !/[-,;]/.test(token[0])
        || !isEscaped(source, index)
      )
    ))
    if (!separator) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    // `:\quad` is spacing inside a condition statement, not a statement break.
    if (
      separator !== ';'
      && source.slice(start, index).trimEnd().endsWith(':')
    ) {
      index += separator.length - 1
      continue
    }
    output.push(source.slice(start, index).trim())
    start = index + separator.length
    index += separator.length - 1
  }

  output.push(source.slice(start).trim())
  return output.filter(Boolean)
}

function findTopLevelRelations(latex) {
  const source = String(latex || '')
  const output = []
  const depth = { brace: 0, paren: 0, bracket: 0 }

  for (let index = 0; index < source.length; index += 1) {
    if (!isTopLevel(depth)) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    const token = relationTokenAt(source, index)
    if (!token) {
      index += updateDepth(depth, source, index) - 1
      continue
    }
    output.push({ index, token })
    index += token.length - 1
  }
  return output
}

function findTopLevelColon(latex) {
  const source = String(latex || '')
  const depth = { brace: 0, paren: 0, bracket: 0 }
  for (let index = 0; index < source.length; index += 1) {
    if (isTopLevel(depth) && source[index] === ':') {
      return index
    }
    index += updateDepth(depth, source, index) - 1
  }
  return -1
}

function balancedDelimiters(latex) {
  const stack = []
  const source = String(latex || '')
  const pairs = { '}': '{', ')': '(', ']': '[', brace: 'brace' }
  for (let index = 0; index < source.length; index += 1) {
    const structural = structuralDelimiterAt(source, index)
    if (structural) {
      const [, kind, length] = structural
      if (kind === 'open') {
        stack.push('brace')
      } else if (stack.pop() !== 'brace') {
        return false
      }
      index += length - 1
      continue
    }
    if (isEscaped(source, index)) continue
    const character = source[index]
    if (character === '{' || character === '(' || character === '[') {
      stack.push(character)
    } else if (pairs[character]) {
      if (stack.pop() !== pairs[character]) return false
    }
  }
  return stack.length === 0
}

function chooseStatementParts(statement) {
  const source = normalizeLatex(statement)
  const colonIndex = findTopLevelColon(source)
  if (colonIndex > 0) {
    const lhs = source.slice(0, colonIndex).trim()
    const rhs = source.slice(colonIndex + 1).trim()
    if (lhs && rhs) return { lhs, operator: ':', rhs }
  }

  const relations = findTopLevelRelations(source)
  if (!relations.length) return null
  let selected = null
  relations.forEach(relation => {
    const lhs = source.slice(0, relation.index).trim()
    const rhs = source.slice(relation.index + relation.token.length).trim()
    if (!lhs || !rhs || !balancedDelimiters(lhs) || !balancedDelimiters(rhs)) {
      return
    }
    const rhsRelationCount = findTopLevelRelations(rhs).length
    const candidate = {
      lhs,
      operator: relation.token,
      rhs,
      rhsRelationCount,
      priority: relationPriority(relation.token)
    }
    if (!selected
      || candidate.priority > selected.priority
      || (candidate.priority === selected.priority
        && candidate.rhsRelationCount < selected.rhsRelationCount)
      || (
        candidate.priority === selected.priority
        && candidate.rhsRelationCount === selected.rhsRelationCount
        && candidate.lhs.length > selected.lhs.length
      )
    ) {
      selected = candidate
    }
  })
  if (!selected) return null
  return {
    lhs: selected.lhs,
    operator: selected.operator,
    rhs: selected.rhs
  }
}

function meaningfulStatement(statement) {
  const source = normalizeLatex(statement)
  if (source.length < 5) return false
  if (/^(?:\\quad|\\qquad|[,;:=+\-<>]|\s)+$/.test(source)) return false
  if (/^\\text\{[^{}]{1,8}\}$/.test(source)) return false
  return /(?:\\[A-Za-z]+|[A-Za-z0-9])/.test(source)
}

function expandClause(clause) {
  const source = normalizeLatex(clause)
  const relations = findTopLevelRelations(source)
  if (relations.length <= 1 && findTopLevelColon(source) < 0) return [source]
  // Conditions after a colon belong to the same definition/rule. Splitting
  // their comma-separated qualifiers would produce fragments such as "a>0".
  if (findTopLevelColon(source) >= 0) return [source]
  if (relations.some(relation => STRONG_RELATION_TOKENS.has(relation.token))) {
    return [source]
  }

  const commaParts = splitTopLevel(source, [','])
  const classified = commaParts.map(part => {
    const partRelations = findTopLevelRelations(part)
    return {
      part,
      relations: partRelations,
      formulaLike: partRelations.some(relation => (
        relationPriority(relation.token) >= 3
      ))
    }
  })
  const validParts = classified.filter(item => (
    item.relations.length > 0 || findTopLevelColon(item.part) > 0
  ))
  if (!classified.some(item => item.formulaLike)) return [source]
  if (validParts.length > 1) return validParts.map(item => item.part)
  return [source]
}

function isConditionLead(statement) {
  const source = normalizeLatex(statement)
  if (!source || source.length > 80) return false
  const endsWithConditionLabel =
    /(?:时|当|其中|且|在)$/.test(source)
    || /\\text\{[^{}]*(?:时|当|其中|且|在)\}$/.test(source)
  if (!endsWithConditionLabel) return false
  return findTopLevelRelations(source).length > 0
}

function isTrailingCondition(statement) {
  const source = normalizeLatex(statement)
  if (!source || source.length > 48) return false
  const relations = findTopLevelRelations(source)
  return relations.length === 1
    && relationPriority(relations[0].token) <= 2
}

function mergeConditionAttachments(statements) {
  const output = []
  statements.forEach(statement => {
    const normalized = normalizeLatex(statement)
    const previous = output[output.length - 1]
    if (
      previous
      && isTrailingCondition(normalized)
      && !findTopLevelColon(previous)
      && findTopLevelRelations(previous).some(relation => (
        relationPriority(relation.token) >= 3
      ))
    ) {
      output[output.length - 1] = `${normalizeLatex(previous)},\\ ${normalized}`
      return
    }
    output.push(normalized)
  })

  const merged = []
  for (let index = 0; index < output.length; index += 1) {
    const current = output[index]
    if (isConditionLead(current) && index + 1 < output.length) {
      merged.push(`${current},\\ ${output[index + 1]}`)
      index += 1
    } else {
      merged.push(current)
    }
  }
  return merged
}

function atomHash(statement) {
  return crypto
    .createHash('sha1')
    .update(normalizeForCompare(statement))
    .digest('hex')
    .slice(0, 10)
}

function buildFormulaAtoms(formula) {
  const formulaId = normalizeLatex(formula && formula.id)
  if (!formulaId) throw new Error('formula atom parser requires formula.id')

  if (FORMULA_ATOM_OVERRIDES[formulaId]) {
    const seen = new Set()
    return FORMULA_ATOM_OVERRIDES[formulaId].map((override, index) => {
      const lhs = normalizeLatex(override.lhs)
      const operator = normalizeLatex(override.operator)
      const rhs = normalizeLatex(override.rhs)
      const statement = operator === ':'
        ? `${lhs}:${rhs}`
        : `${lhs}${operator}${rhs}`
      const key = normalizeForCompare(statement)
      if (!lhs || !rhs || seen.has(key)) {
        throw new Error(`${formulaId}: invalid or duplicate atom override at index ${index}`)
      }
      seen.add(key)
      return {
        atomId: `${formulaId}-atom-${atomHash(statement)}`,
        clauseIndex: index,
        statement,
        lhs,
        operator,
        rhs,
        kind: operator === ':' ? 'condition' : 'relation',
        index
      }
    })
  }

  const clauses = splitFormulaClauses(formula.latex)
  const statements = []
  clauses.forEach(clause => {
    expandClause(clause).forEach(part => {
      if (meaningfulStatement(part)) statements.push(part)
    })
  })

  const atoms = []
  const seen = new Set()
  mergeConditionAttachments(statements).forEach((statement, clauseIndex) => {
    const parts = chooseStatementParts(statement) || {
      lhs: normalizeLatex(formula.name),
      operator: ':',
      rhs: normalizeLatex(statement)
    }
    if (!parts) return
    const key = normalizeForCompare(statement)
    if (!key || seen.has(key)) return
    seen.add(key)
    atoms.push({
      atomId: `${formulaId}-atom-${atomHash(statement)}`,
      clauseIndex,
      statement: normalizeLatex(statement),
      lhs: normalizeLatex(parts.lhs),
      operator: parts.operator,
      rhs: normalizeLatex(parts.rhs),
      kind: parts.operator === ':' ? 'condition' : 'relation'
    })
  })

  if (atoms.length) {
    return atoms.map((atom, index) => ({ ...atom, index }))
  }

  const statement = normalizeLatex(formula.latex)
  if (!statement) {
    throw new Error(`${formulaId}: formula has no meaningful atom`)
  }
  return [{
    atomId: `${formulaId}-atom-${atomHash(statement)}`,
    clauseIndex: 0,
    statement,
    lhs: normalizeLatex(formula.name),
    operator: ':',
    rhs: statement,
    kind: 'condition',
    index: 0
  }]
}

function latexTokens(value) {
  const normalized = normalizeForCompare(value)
  return new Set(
    normalized.match(/\\[A-Za-z]+|[A-Za-z]+|\d+(?:\.\d+)?/g) || []
  )
}

function tokenOverlap(left, right) {
  const leftTokens = latexTokens(left)
  const rightTokens = latexTokens(right)
  if (!leftTokens.size || !rightTokens.size) return 0
  let shared = 0
  leftTokens.forEach(token => {
    if (rightTokens.has(token)) shared += 1
  })
  return shared / Math.max(leftTokens.size, rightTokens.size)
}

function matchQuestionToAtom(formulaAtoms, question, options = {}) {
  if (!Array.isArray(formulaAtoms) || !formulaAtoms.length) return null
  if (formulaAtoms.length === 1 && options.allowSingle !== false) {
    return formulaAtoms[0]
  }

  const ranked = rankQuestionAtoms(formulaAtoms, question)
  const best = ranked[0]
  return best && best.score >= 34 ? best.atom : null
}

function rankQuestionAtoms(formulaAtoms, question) {
  if (!Array.isArray(formulaAtoms) || !formulaAtoms.length) return []
  const stem = normalizeForCompare(question.stemLatex)
  const answer = normalizeForCompare(question.answerLatex)
  const fullQuestion = `${stem}${answer}`
  return formulaAtoms.map(atom => {
    const rhs = normalizeForCompare(atom.rhs)
    const lhs = normalizeForCompare(atom.lhs)
    const statement = normalizeForCompare(atom.statement)
    let score = 0

    if (answer && rhs && answer === rhs) score += 120
    else if (
      answer.length >= 3
      && rhs.length >= 3
      && (answer.includes(rhs) || rhs.includes(answer))
    ) {
      score += 72
    }

    if (stem.includes(lhs) || lhs.includes(stem)) score += 42
    if (answer.length >= 2 && statement.includes(answer)) score += 28
    score += tokenOverlap(answer, rhs) * 45
    score += tokenOverlap(stem, atom.lhs) * 35
    score += tokenOverlap(fullQuestion, atom.statement) * 18

    return { atom, score }
  }).sort((left, right) => right.score - left.score)
}

module.exports = {
  RELATION_TOKENS,
  buildFormulaAtoms,
  chooseStatementParts,
  expandClause,
  findTopLevelColon,
  findTopLevelRelations,
  matchQuestionToAtom,
  mergeConditionAttachments,
  normalizeForCompare,
  normalizeLatex,
  rankQuestionAtoms,
  splitFormulaClauses,
  splitTopLevel,
  tokenOverlap
}
