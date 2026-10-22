const fs = require('fs');
const nodePath = require('path');
const html = fs.readFileSync(nodePath.join(__dirname, '..', 'prototype', '公式记忆助手-原型.html'), 'utf8');

// 1) 语法检查主脚本
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.log('未找到主脚本'); process.exit(1); }
try { new Function(m[1]); console.log('[1] 主脚本语法 OK'); }
catch (e) { console.log('[1] 语法错误:', e.message); process.exit(1); }

// 2) 取数据
const marker = 'const DATA = ';
const s = html.indexOf(marker) + marker.length;
const end = html.slice(s).search(/;\r?\n/);
if (end < 0) throw new Error('未找到 HTML 内联 DATA 数据块');
const DATA = JSON.parse(html.slice(s, s + end));
console.log('[2] 数据条数:', DATA.items.length);

const byType = {}, byGrade = {};
DATA.items.forEach(i => {
  byType[i.type] = (byType[i.type] || 0) + 1;
  byGrade[i.grade] = (byGrade[i.grade] || 0) + 1;
});
console.log('    类型:', JSON.stringify(byType));
console.log('    年级:', JSON.stringify(byGrade));

// 3) 模拟 pool()
function pool(curType) {
  return DATA.items.filter(i => curType === 'all' || i.type === curType);
}
console.log('[3] 核心公式 =', pool('core').length);
console.log('    二级结论 =', pool('conclusion').length);
console.log('    全部 =', pool('all').length);

// 4) 各类型章节
['core', 'conclusion'].forEach(t => {
  const chs = [...new Set(pool(t).map(i => i.chapter))];
  console.log('[4] ' + t + ' 章节(' + chs.length + '):', chs.join(' / '));
});

// 5) 字段完整性
let bad = [];
DATA.items.forEach(i => {
  ['id', 'name', 'latex', 'chapter', 'grade', 'type', 'voiceText'].forEach(k => { if (!i[k]) bad.push(i.id + ' 缺 ' + k); });
  if (i.latex.indexOf('"') >= 0) bad.push(i.id + ' latex 含双引号');
});
console.log('[5] 字段问题:', bad.length ? bad.slice(0, 10) : '无');

// 6) 填空版覆盖
const withBlank = DATA.items.filter(i => i.blankLatex).length;
console.log('[6] 有填空版:', withBlank, '/', DATA.items.length);

// 7) 抽样
console.log('[7] 抽样:');
DATA.items.filter(i => i.id === 'C001' || i.id === 'S053' || i.id === 'C186').forEach(i => {
  console.log('   ', i.id, '|', i.type, i.grade, '|', i.chapter, '|', i.name);
  console.log('      latex:', i.latex.slice(0, 90));
  console.log('      填空:', (i.blankLatex || '(无)').slice(0, 80));
});
