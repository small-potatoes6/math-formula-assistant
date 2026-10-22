// 运行时冒烟测试 v3：覆盖产品红线与本轮交互修复
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'prototype', '公式记忆助手-原型.html'), 'utf8');

// ---- DOM stub ----
const elems = {};
function mkEl(id) {
  return elems[id] || (elems[id] = {
    id, innerHTML: '', textContent: '', style: {}, dataset: {}, value: '', checked: true,
    options: [{ value: 'core' }, { value: 'all' }],
    classList: { contains: () => false, add(){}, remove(){}, toggle(){} },
    scrollIntoView(){}, querySelector: () => null, querySelectorAll: () => [],
    setAttribute(){},
  });
}
global.document = {
  getElementById: mkEl,
  querySelector: (sel) => sel.includes('pmode') ? { value: 'recall' } : null,
  querySelectorAll: () => [],
  createElement: () => mkEl('_' + Math.random()),
  addEventListener(){},
  body: { appendChild(){}, removeChild(){} },
};
global.window = global;
global.localStorage = { _d: {}, getItem(k){ return this._d[k] || null; }, setItem(k,v){ this._d[k]=v; }, removeItem(k){ delete this._d[k]; } };
let spoken = [];
global.speechSynthesis = {
  speak(u){ spoken.push(u.text); },
  cancel(){},
  getVoices(){ return [
    { name: 'Microsoft Xiaoxiao Online (Natural)', lang: 'zh-CN', voiceURI: 'xiaoxiao' },
    { name: 'Microsoft Yunxi', lang: 'zh-CN', voiceURI: 'yunxi' },
    { name: 'Ting-Ting', lang: 'zh-CN', voiceURI: 'tingting' },
  ]; },
  addEventListener(){},
};
global.SpeechSynthesisUtterance = function(t){ this.text = t; };
global.confirm = () => true;

// 抽出 <script> 执行（去掉 DATA 常量行太长没关系，直接全跑）
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

let pass = 0, fail = 0;
function T(name, fn) { try { fn(); pass++; console.log('  PASS', name); } catch (e) { fail++; console.log('  FAIL', name, '::', e.message); } }
function A(cond, msg) { if (!cond) throw new Error(msg || 'assert'); }

T('脚本加载', () => { new Function(script)(); });
const ex = new Function(script + '; return {DATA, S, STATE_VERSION, LADDER, blankState, normState, streakDays, fmtDate, rate, voiceStart, voicePlay, voiceReveal, voiceNext, voiceRate, voiceStop, markBlind, newQuestion, reveal, rateNext, pickItem, renderMeFavs, renderFavPage, startFavVoice, startFavPractice, practicePool, fillChapSelects, fillPracticeChaps, fillVoiceChapters, updatePracticeInfo, populateVoiceSelect, setVoicePref, texHTML, exportState, importState};')();

T('多行拆分: quad 拆成多行', () => {
  const h = ex.texHTML('a \\quad b \\quad c');
  A((h.match(/class="formula"/g) || []).length === 3, '应拆 3 行, got ' + h);
});
T('多行拆分: 单段公式仍 1 行', () => {
  A((ex.texHTML('\\frac{a}{b}').match(/class="formula"/g) || []).length === 1);
});
T('练习-仅收藏范围', () => {
  mkEl('pType').value = 'all'; mkEl('pScope').value = 'fav'; mkEl('pChapter').value = '全部';
  const pool = ex.practicePool();
  A(pool.every(i => ex.S.favs.includes(i.id)), 'pool 应全为收藏');
});
T('练习-章节下拉可用且有章节项', () => {
  mkEl('pType').value = 'all'; mkEl('pScope').value = 'all'; mkEl('pChapter').value = '全部';
  ex.fillPracticeChaps();
  const chapterHtml = mkEl('pChapter').innerHTML;
  A((chapterHtml.match(/<option/g) || []).length > 1, '章节下拉不应只有「全部」');
  A(/集合与常用逻辑用语/.test(chapterHtml), '应包含真实章节名');
  A(/当前范围/.test(mkEl('pRangeInfo').textContent), '应显示当前范围摘要');
  mkEl('pChapter').value = '数列';
  ex.updatePracticeInfo();
  A(/^数列 · \d+ 条$/.test(mkEl('pRangeInfo').textContent), '选中章节后摘要应显示该章节条数');
});
T('练习出题+自评自动下一题(rateNext)', () => {
  mkEl('pType').value = 'all'; mkEl('pScope').value = 'all'; mkEl('pChapter').value = '全部';
  document.querySelector = (sel) => sel.includes('pmode') ? { value: 'recall' } : null;
  ex.newQuestion();
  A(/data-tex|回忆公式/.test(mkEl('qCard').innerHTML), '题目卡应有内容');
  const before = Object.keys(ex.S.mastery).length;
  ex.rateNext(ex.DATA.items[0].id, 2);
  A(Object.keys(ex.S.mastery).length >= before + 1, '应计入掌握度(决策5)');
});
T('听背启动: 收藏范围', () => {
  ex.S.favs.push('C001','C002','C003'); // 预置收藏
  mkEl('vScope').value = 'fav'; mkEl('vType').value = 'all'; mkEl('vCount').value = '10';
  ex.voiceStart();
  A(spoken.length >= 1 && /第1条/.test(spoken[spoken.length - 1]), '应语音报名字: ' + spoken[spoken.length - 1]);
});
T('听背: 非盲测初始态有看公式按钮', () => {
  A(/👀 看公式/.test(mkEl('vPanel').innerHTML), '应显示看公式按钮');
  A(/voiceReveal\(vQueue\[vIdx\]\)/.test(mkEl('vPanel').innerHTML), '按钮应调用当前条看公式');
});
T('听背: 点看公式后不自动跳, 有手动下一条', () => {
  ex.voiceReveal(ex.DATA.items[0]);
  const panel = mkEl('vPanel').innerHTML;
  A(/data-tex/.test(panel), '应显示 LaTeX 公式');
  A(/voiceNext\(\)/.test(panel), '应有手动下一条按钮');
  A(!/自动下一条/.test(panel), '不应再自动下一条');
});
T('听背: 自评计入且停留当前条(决策1+5)', () => {
  const beforeSpeech = spoken.length;
  ex.voiceRate(2);
  A(ex.S.mastery['C001'] && ex.S.mastery['C001'].lvl === 2, '应写入掌握度');
  A(/voiceNext\(\)/.test(mkEl('vPanel').innerHTML), '自评后仍在当前条, 等手动下一条');
  A(/selected/.test(mkEl('vPanel').innerHTML), '自评按钮应保留并高亮当前选择');
  A(/已记为「会」/.test(mkEl('vPanel').innerHTML), '应显示明确的评分结果');
  A(spoken.length === beforeSpeech, '自评后不应再朗读“不错 / 明天见”等反馈');
});
T('听背: 下一条推进', () => {
  ex.voiceNext();
  A(/第 2 /.test(mkEl('vPanel').innerHTML), '应到第2条');
});
T('年级下拉已移除', () => {
  A(!/id="gradeSel"/.test(html) && !/id="pGrade"/.test(html), '不应有 gradeSel/pGrade');
  A(!/vPause/.test(html) && !/vCountdown/.test(html), '停顿/倒数应已移除');
});
T('我的页: 收藏夹只保留独立入口', () => {
  ex.renderMeFavs();
  const h = mkEl('meFavs').innerHTML;
  A(/go\('favs'\)/.test(h), '应进入独立收藏页');
  A(/我的收藏（3 条）/.test(h), '应显示收藏数量');
  A(!/data-tex/.test(h), '我的页不应直接堆公式卡片');
});
T('texHTML 拆行不破坏 \\text{} 内的 quad', () => {
  const h = ex.texHTML('\\text{a quad b}');
  A((h.match(/class="formula"/g) || []).length === 1, '\\text 内不应拆');
});
T('存档迁移: v1 学习记录补 ok 字段并升到 v2', () => {
  const st = ex.normState({v: 1, mastery: {C001: {lvl: 2, last: 1, next: 2}}, favs: ['C001'], wrong: [], days: ['2026-09-11', '2026-09-11']});
  A(st.v === ex.STATE_VERSION, '应升级到当前存档版本');
  A(st.mastery.C001.ok === 0, '旧记录应补 ok=0');
  A(st.days.length === 1, '重复日期应去重');
});
T('连续打卡: 连续三天/断档归零', () => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const dates = [0, 1, 2].map(n => { const x = new Date(d); x.setDate(x.getDate() - n); return ex.fmtDate(x); });
  ex.S.days = dates.slice(); A(ex.streakDays() === 3, '应连续 3 天');
  ex.S.days = [dates[0], dates[2]]; A(ex.streakDays() === 1, '中间断档后应只算今天');
});
T('间隔阶梯: 会 7→14→30→60，答错清零', () => {
  const id = 'TEST-LADDER';
  ex.rate(id, 2);
  A(ex.S.mastery[id].ok === 1, '第一次会应 ok=1');
  A(Math.round((ex.S.mastery[id].next - Date.now()) / 86400000) === 7, '第一次会应排 7 天');
  ex.rate(id, 2); ex.rate(id, 2); ex.rate(id, 2);
  A(ex.S.mastery[id].ok === ex.LADDER.length, '连续答对应达到阶梯上限');
  A(Math.round((ex.S.mastery[id].next - Date.now()) / 86400000) === 60, '最高阶梯应为 60 天');
  ex.rate(id, 0);
  A(ex.S.mastery[id].ok === 0, '答错后连对应清零');
  A(ex.S.wrong.includes(id), '答错后应进错题本');
});
T('听背筛选: 范围与章节分开且选择不会被统计刷新重置', () => {
  mkEl('vScope').value = 'fav'; mkEl('vType').value = 'conclusion';
  ex.fillChapSelects();
  A(mkEl('vScope').value === 'fav', 'vScope 应保持收藏范围');
  A(mkEl('vType').value === 'conclusion', 'vType 应保持二级结论');
  A((mkEl('vScope').innerHTML.match(/<option/g) || []).length === 3, '范围下拉只应有到期/收藏/全部三项');
  A(!/数列/.test(mkEl('vScope').innerHTML), '范围下拉不应混入章节');
  mkEl('vScope').value = 'all'; mkEl('vType').value = 'all';
  ex.fillVoiceChapters();
  const chapHtml = mkEl('vChapter').innerHTML;
  A((chapHtml.match(/<option/g) || []).length === 17, '章节下拉应包含全部+16章');
  A(/全部章节（366）/.test(chapHtml), '全部章节应显示数量');
  A(/数列（/.test(chapHtml), '章节下拉应包含数列');
});
T('收藏页: 全部章节下拉+完整公式卡片', () => {
  ex.S.favs = ['C001', 'C042', 'S053'];
  ex.renderFavPage();
  A(/共 3 条，当前显示 3 条/.test(mkEl('favCount').textContent), '应显示收藏数量');
  const favHtml = mkEl('favList').innerHTML;
  A(/data-tex/.test(favHtml), '收藏页应渲染 LaTeX 公式');
  A(/常用数集记法/.test(favHtml), '收藏页应显示公式卡');
  const chapHtml = mkEl('favChapter').innerHTML;
  A((chapHtml.match(/<option/g) || []).length === 17, '收藏页章节下拉应包含全部+16章');
  A(/全部章节（3）/.test(chapHtml), '收藏页全部章节应显示收藏数量');
});
T('听背: 最后一条才进入完成态且可再来一组', () => {
  mkEl('vScope').value = 'fav'; mkEl('vType').value = 'all'; mkEl('vCount').value = '1';
  ex.voiceStart();
  A(!/本组完成/.test(mkEl('vPanel').innerHTML), '刚开始不应显示完成态');
  ex.voiceNext();
  const done = mkEl('vPanel').innerHTML;
  A(/本组完成/.test(done), '最后一条后应显示完成态');
  A(/再练一组/.test(done) && /返回设置/.test(done), '完成态应有重新开始和返回设置');
  A(mkEl('vNext').style.display === 'none', '完成后应隐藏全局下一条');
});
T('界面不再出现旧的“停顿”提示，公式可点击放大', () => {
  A(!/提问→停顿/.test(html), '不应残留旧听背节奏文案');
  A(/openFormulaZoom/.test(html), '应接入公式放大交互');
  A(typeof ex.exportState === 'function' && typeof ex.importState === 'function', '应有存档导入导出函数');
});

console.log(`\n结果: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
