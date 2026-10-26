/* 用真实 KaTeX 逐条校验 351 条公式的 LaTeX 语法 */
const fs = require('fs');
const path = require('path');
let katex;
try {
  katex = require('katex');
} catch (e) {
  katex = require(path.join(__dirname, '..', 'tools', 'katex', 'katex.min.js'));
}

const dataPath = path.join(__dirname, '..', 'prototype', 'data', '公式库-全量.json');
const DATA = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

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

if (DATA.items.length !== 351 || errsMain.length || errsBlank.length) process.exit(1);
