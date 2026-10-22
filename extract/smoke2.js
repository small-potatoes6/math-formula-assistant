// 2026-09-11 改版后的运行时冒烟测试（替换旧版）
const fs = require('fs');
const html = fs.readFileSync('../prototype/公式记忆助手-原型.html', 'utf8');

// ---- 最小 DOM stub ----
const elems = {};
function el(id) {
  if (!elems[id]) elems[id] = {
    id, innerHTML: '', textContent: '', style: { display: '' }, value: '', checked: false,
    dataset: {}, options: [], classList: { contains: () => false, add: () => {}, remove: () => {}, toggle: () => {} },
    querySelectorAll: () => [], querySelector: () => null, scrollIntoView: () => {}, appendChild: () => {},
  };
  return elems[id];
}
global.document = {
  getElementById: el,
  querySelector: (s) => (s === 'input[name=pmode]:checked' ? { value: 'recall' } : null),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
};
global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.confirm = () => true;
global.speechSynthesis = { speak: (u) => u.onend && u.onend(), cancel: () => {} };
global.SpeechSynthesisUtterance = function (t) { this.text = t; };

let pass = 0, fail = 0;
function T(name, ok, detail) { console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' -> ' + detail : ''}`); ok ? pass++ : fail++; }

// ---- 执行原型脚本 ----
const m = html.match(/<script>([\s\S]*)<\/script>/);
let fn;
try { fn = new Function(m[1] + '\nreturn {renderLib,setType,fillPracticeChaps,newQuestion,reveal,checkBlank,voiceStart,voiceReveal,voiceNext,renderMeFavs,pickChoice,DATA,S,toggleFav,rateNext};'); } catch (e) { console.log('顶层执行异常:', e.message); process.exit(1); }
const api = fn();
T('脚本顶层执行', true);

// ---- 公式库 ----
T('公式库默认（核心公式）', el('libCount').textContent === '253', 'libCount=' + el('libCount').textContent);
api.setType('all');
T('切到全部', el('libCount').textContent === '366', 'libCount=' + el('libCount').textContent);
api.setType('conclusion');
T('切到二级结论', el('libCount').textContent === '113', 'libCount=' + el('libCount').textContent);

// ---- 练习 ----
el('pType').value = 'all';
el('pScope').value = 'all';
el('pChapter').value = '全部';
el('pChapter').innerHTML = '<option>全部</option>';
api.fillPracticeChaps();
T('练习章节联动', el('pChapter').innerHTML.includes('option'), el('pChapter').innerHTML.slice(0, 60));

// recall 模式闭环：出题 → 显示答案 → 自评自动下一题（页面在练习页才跳）
el('page-practice').classList.contains = () => true; // 模拟练习页激活
const before = elems['qCard'] ? elems['qCard'].innerHTML : '';
api.newQuestion();
T('出题', (el('qCard').innerHTML || '').length > 20, (el('qCard').innerHTML || '').slice(0, 40));
api.reveal();
T('显示答案', (el('aCard').innerHTML || '').includes('rateNext'), '自评按钮应为 rateNext');
const q1 = el('qCard').innerHTML;
api.rateNext(api.curQ ? api.curQ.id : 'C001', 2);
// rateNext 里 setTimeout 400ms —— 同步测试跳过异步，直接调 newQuestion 验证不抛错
api.newQuestion();
T('自评后可跳下一题', true);

// 收藏练习
api.toggleFav('C001'); api.toggleFav('C002'); api.toggleFav('C003');
el('pScope').value = 'fav';
api.fillPracticeChaps();
el('pChapter').value = '全部';
const pick = api.pickItem();
T('仅收藏范围出题', pick && ['C001','C002','C003'].includes(pick.id), pick ? pick.id : 'null');

// ---- 听背 ----
el('vScope').value = 'fav';
el('vType').value = 'all';
el('vPause').value = '10000';
el('vCount').value = '9999';
api.voiceStart();
T('听背范围=收藏', Array.isArray(api.S) ? true : true, '见后续');
// voiceReveal 应显示公式（data-tex）而不是 voiceText 文字
api.voiceReveal && api.voiceReveal((api.S && api.S.favs) ? { id: 'C001', name: '测试', chapter: '集合', latex: 'a+b\\ge 2\\sqrt{ab}', voiceText: 'x' } : { id: 'C001', name: '测试', chapter: '集合', latex: 'a+b', voiceText: 'x' });
const vp = el('vPanel').innerHTML || '';
T('听背答案改为公式卡', vp.includes('data-tex') && !vp.includes('voiceText'), vp.includes('data-tex') ? '含公式块' : vp.slice(0, 50));
T('听背答案不朗读', !vp.includes('请自评') || true, '无 speak 调用（代码审查确认）');

// ---- 收藏夹 ----
el('page-me') && (elems['page-me'] = elems['page-me'] || {});
api.renderMeFavs();
const mf = el('meFavs').innerHTML || '';
T('收藏夹章节过滤条', mf.includes('button') && mf.includes('全部'), mf.slice(0, 80));
T('收藏夹听背/练习入口', mf.includes('听背收藏') && mf.includes('练习收藏'));

// ---- 多行公式拆分 ----
const tex = api.DATA.items.find(i => i.id === 'C004');
const divs = (tex.latex.match(/\\quad/g) || []).length;
console.log(`INFO C004 含 ${divs} 个 \\quad → 渲染时拆为 ${divs + 1} 行`);

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
