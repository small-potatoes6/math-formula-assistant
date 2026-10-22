/* 用真实 KaTeX 逐条校验 366 条公式的 LaTeX 语法 */
const fs = require('fs');
const path = require('path');
let katex;
try {
  katex = require('katex');
} catch (e) {
  katex = require(path.join(__dirname, '..', 'tools', 'katex', 'katex.min.js'));
}

const htmlPath = path.join(__dirname, '..', 'prototype', '公式记忆助手-原型.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const marker = 'const DATA = ';
const s = html.indexOf(marker) + marker.length;
const end = html.slice(s).search(/;\r?\n/);
if (s < marker.length || end < 0) throw new Error('未找到 HTML 内联 DATA 数据块');
const DATA = JSON.parse(html.slice(s, s + end));

function tryRender(tex) {
  try { katex.renderToString(tex, { throwOnError: true, displayMode: true }); return null; }
  catch (err) { return err.message.split('\n')[0]; }
}

const errsMain = [], errsBlank = [];
DATA.items.forEach(it => {
  const m1 = tryRender(it.latex);
  if (m1) errsMain.push({ id: it.id, name: it.name, msg: m1, tex: it.latex.slice(0, 100) });
  if (it.blankLatex) {
    const m2 = tryRender(it.blankLatex);
    if (m2) errsBlank.push({ id: it.id, name: it.name, msg: m2, tex: it.blankLatex.slice(0, 100) });
  }
});

console.log('公式总数:', DATA.items.length);
console.log('主公式渲染失败:', errsMain.length);
errsMain.slice(0, 40).forEach(x => console.log('  [' + x.id + '] ' + x.name + ' :: ' + x.msg + '\n      ' + x.tex));
console.log('\n填空版渲染失败:', errsBlank.length);
errsBlank.slice(0, 20).forEach(x => console.log('  [' + x.id + '] ' + x.name + ' :: ' + x.msg + '\n      ' + x.tex));

// 结果落盘，便于后续修
fs.writeFileSync(path.join(__dirname, 'katex_errors.json'),
  JSON.stringify({ main: errsMain, blank: errsBlank }, null, 1), 'utf8');
console.log('\n错误清单已写入 extract/katex_errors.json');

if (DATA.items.length !== 366 || errsMain.length || errsBlank.length) process.exit(1);
