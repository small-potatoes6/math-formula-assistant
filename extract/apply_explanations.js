/*
 * apply_explanations.js
 *
 * 把逐条校对后的“说明”写入数据源。
 * 基础数据：prototype/data/公式库-全量.json
 * 覆盖层：extract/explanation-overrides.json
 *
 * 用法:
 *   node extract/apply_explanations.js
 *   node extract/apply_explanations.js --check
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(ROOT, 'prototype', 'data', '公式库-全量.json')
const OVERRIDE_FILE = path.join(__dirname, 'explanation-overrides.json')
const REPORT_FILE = path.join(__dirname, 'explanation-audit.json')

const checkOnly = process.argv.includes('--check')

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function main() {
  const data = readJson(DATA_FILE)
  const overrides = readJson(OVERRIDE_FILE).items || {}
  const itemMap = new Map(data.items.map((item) => [item.id, item]))
  const applied = []
  const missing = []
  const unchanged = []
  const missingExplanation = []
  const suspicious = []

  for (const [id, patch] of Object.entries(overrides)) {
    const item = itemMap.get(id)
    if (!item) {
      missing.push(id)
      continue
    }
    const next = String(patch.explanation || '').trim()
    const current = String(item.explanation || '').trim()
    if (!next) {
      unchanged.push(id)
      continue
    }
    if (current !== next) {
      applied.push(id)
      if (!checkOnly) item.explanation = next
    }
  }

  if (!checkOnly) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 1) + '\n', 'utf8')
  }

  for (const item of data.items) {
    const explanation = String(item.explanation || '').trim()
    if (!explanation) {
      missingExplanation.push(item.id)
      continue
    }
    const voice = String(item.voiceText || '')
    if (voice && explanation === voice) {
      suspicious.push({ id: item.id, reason: 'explanation 与 voiceText 完全相同，可能仍是口语稿' })
    }
    if (/[0-9a-zA-Z]/g.test(explanation) && /的[0-9a-zA-Z]+次方/.test(explanation)) {
      suspicious.push({ id: item.id, reason: '疑似口语数学表达（如“2的n次方”）' })
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    total: data.items.length,
    overrideCount: Object.keys(overrides).length,
    applied,
    missing,
    unchanged,
    missingExplanation,
    suspicious
  }
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 1) + '\n', 'utf8')

  console.log(`数据条目: ${data.items.length}`)
  console.log(`覆盖条数: ${Object.keys(overrides).length}`)
  console.log(`本次写入: ${applied.length}`)
  console.log(`覆盖 ID 不存在: ${missing.length}${missing.length ? ' -> ' + missing.join(', ') : ''}`)
  console.log(`待校对（缺 explanation）: ${missingExplanation.length}`)
  console.log(`可疑内容: ${suspicious.length}`)
  console.log(`审计报告: ${REPORT_FILE}`)

  if (missing.length) process.exit(1)
}

main()
