/*
 * fix_formula_plan_a.js
 *
 * 方案 A 的数据修复脚本：
 *  1. 删除用户确认不再保留的公式条目；
 *  2. 修正 C001、C002、C063 的公式与说明；
 *  3. 同步清理 explanation-overrides.json 中已删除条目的覆盖项。
 *
 * 用法:
 *   node extract/fix_formula_plan_a.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(ROOT, 'prototype', 'data', '公式库-全量.json')
const OVERRIDE_FILE = path.join(__dirname, 'explanation-overrides.json')

const DELETE_IDS = new Set([
  'C013',
  'C014',
  'C022',
  'C071',
  'S001',
  'S004',
  'S005',
  'S006',
  'S007',
  'S008',
  'S009',
  'S010',
  'S011',
  'S024',
  'S026'
])

const DATA_PATCHES = {
  C001: {
    latex: '\\mathbb{N}\\text{（自然数集）},\\ \\mathbb{N}^{+}\\text{ 或 }\\mathbb{N}^{*}\\text{（正整数集）},\\ \\mathbb{Z}\\text{（整数集）},\\ \\mathbb{Q}\\text{（有理数集）},\\ \\mathbb{R}\\text{（实数集）}',
    pitfall: '正整数集可记作 N⁺ 或 N*',
    explanation: '常见的集合：自然数集记作 N，正整数集记作 N⁺ 或 N*，整数集记作 Z，有理数集记作 Q，实数集记作 R。',
    voiceText: '自然数集记作N，正整数集记作N加或N星，整数集记作Z，有理数集记作Q，实数集记作R'
  },
  C002: {
    explanation: '含 n 个元素的非空集合，它有 2ⁿ 个子集、2ⁿ-1 个真子集、2ⁿ-2 个非空真子集。'
  },
  C063: {
    latex: '\\text{向左平移 }\\varphi\\text{，就加 }\\varphi;\\quad \\text{向右平移 }\\varphi\\text{，就减 }\\varphi;\\quad \\text{向上平移 }B\\text{，就加 }B;\\quad \\text{向下平移 }B\\text{，就减 }B',
    condition: '平移量 φ、B 可正可负；口诀为左加右减、上加下减',
    pitfall: '向左平移 φ 就加 φ，向右平移 φ 就减 φ；向上平移 B 就加 B，向下平移 B 就减 B',
    explanation: '三角函数的平移：向左平移 φ 就加 φ；向右平移 φ 就减 φ；向上平移 B 就加 B；向下平移 B 就减 B。',
    voiceText: '向左平移斐就加斐；向右平移斐就减斐；向上平移B就加B；向下平移B就减B'
  },
  S048: {
    latex: 'e^x\\ge x+1,\\ \\ln x\\le x-1\\Rightarrow \\ln(x+1)\\le x\\le e^x-1\\ (\\text{当且仅当}x=0\\text{取等})'
  },
  S049: {
    latex: 'x\\in\\left[0,\\frac\\pi2\\right)\\Rightarrow \\sin x\\le x\\le\\tan x\\ (\\text{当且仅当}x=0\\text{取等}),\\ x\\in\\left[0,\\frac\\pi2\\right)\\Rightarrow \\cos x\\ge1-\\frac12x^2\\ (\\text{当且仅当}x=0\\text{取等})'
  }
}

const OVERRIDE_PATCHES = {
  C001: {
    explanation: DATA_PATCHES.C001.explanation,
    source: '《高中数学253个核心知识点》第1章第1条'
  },
  C002: {
    explanation: DATA_PATCHES.C002.explanation,
    source: '《高中数学253个核心知识点》第1章第2条；《高中数学常考二级结论》结论1'
  },
  C063: {
    explanation: DATA_PATCHES.C063.explanation
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 1) + '\n', 'utf8')
}

function main() {
  const data = readJson(DATA_FILE)
  const overrides = readJson(OVERRIDE_FILE)

  const before = data.items.length
  const removed = []
  data.items = data.items.filter((item) => {
    if (!DELETE_IDS.has(item.id)) return true
    removed.push(item.id)
    return false
  })

  const itemMap = new Map(data.items.map((item) => [item.id, item]))
  for (const [id, patch] of Object.entries(DATA_PATCHES)) {
    const item = itemMap.get(id)
    if (!item) throw new Error(`待修复条目不存在: ${id}`)
    Object.assign(item, patch)
  }

  const overrideRemoved = []
  for (const id of DELETE_IDS) {
    if (Object.prototype.hasOwnProperty.call(overrides.items, id)) {
      delete overrides.items[id]
      overrideRemoved.push(id)
    }
  }
  for (const [id, patch] of Object.entries(OVERRIDE_PATCHES)) {
    overrides.items[id] = {
      ...(overrides.items[id] || {}),
      ...patch
    }
  }

  writeJson(DATA_FILE, data)
  writeJson(OVERRIDE_FILE, overrides)

  console.log(`数据条目: ${before} -> ${data.items.length}`)
  console.log(`本次删除: ${removed.length ? removed.join(', ') : '无（已执行过）'}`)
  console.log(`说明覆盖层删除: ${overrideRemoved.length ? overrideRemoved.join(', ') : '无（已执行过）'}`)
  console.log(`说明覆盖层条数: ${Object.keys(overrides.items).length}`)
}

main()
