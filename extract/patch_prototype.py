# -*- coding: utf-8 -*-
"""把 366 条 PDF 数据注入原型，并把分类改成「类型(核心公式/二级结论) × 年级(高一/高二/全部)」"""
import json, os, io

BASE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(BASE, "..", "prototype", "公式记忆助手-原型.html")
DATA_F = os.path.join(BASE, "..", "prototype", "data", "公式库-全量.json")

html = io.open(P, encoding="utf-8").read()
data = json.load(io.open(DATA_F, encoding="utf-8"))

def rep(old, new, tag):
    global html
    assert old in html, "NOT FOUND: " + tag
    assert html.count(old) == 1, "NOT UNIQUE: " + tag
    html = html.replace(old, new)
    print("  ok:", tag)

# ============ 1. 注入数据 ============
s = html.index("const DATA = {meta:{},items:[")
e = html.index("]};", s) + 3
newblock = "const DATA = " + json.dumps(data, ensure_ascii=False) + ";"
html = html[:s] + newblock + html[e:]
print("  ok: 数据块注入", len(data["items"]), "条")

# ============ 2. CSS 新增 ============
rep(
"""  .pill.advanced{background:#fef5e7;color:#b7950b;}""",
"""  .pill.advanced{background:#fef5e7;color:#b7950b;}
  .pill.core{background:#eaf2f8;color:#21618c;}
  .pill.conclusion{background:#fef5e7;color:#b7950b;}
  .typebar{display:flex;margin:8px 0;border:1px solid var(--line);border-radius:10px;overflow:hidden;}
  .typebar button{flex:1;border:0;background:#fff;padding:11px 6px;cursor:pointer;font-size:14px;color:var(--sub);}
  .typebar button+button{border-left:1px solid var(--line);}
  .typebar button.on{background:var(--blue2);color:#fff;font-weight:600;}""",
"CSS 类型条")

# ============ 3. 公式库：加类型条 ============
rep(
"""      <select id="gradeSel" onchange="setGrade(this.value)" style="width:100%;margin-bottom:6px"></select>""",
"""      <div class="typebar" id="typeBar"></div>
      <select id="gradeSel" onchange="setGrade(this.value)" style="width:100%;margin-bottom:6px"></select>""",
"公式库类型条")

# ============ 4. 底部计数文案 ============
rep(
"""共 <span id="libCount" data-page-node-id="Thh7EC497eJuOqfB3C13Bf"></span> 条（高一内容样板，正式版覆盖全三年约 500 条）""",
"""共 <span id="libCount" data-page-node-id="Thh7EC497eJuOqfB3C13Bf"></span> 条 · 数据源：《高中数学253个核心知识点》+《常考二级结论113条》""",
"底部计数文案")

# ============ 5. 练习页：加类型下拉 ============
rep(
"""        <select id="pGrade" onchange="fillPracticeChaps()" data-page-node-id="jPOE5xRRgVmRrvOpBavOyA"></select>""",
"""        <select id="pType" onchange="fillPracticeChaps()" style="margin-right:6px"></select>
        <select id="pGrade" onchange="fillPracticeChaps()" data-page-node-id="jPOE5xRRgVmRrvOpBavOyA"></select>""",
"练习页类型下拉")

# ============ 6. 听背页：加类型下拉 ============
rep(
"""          范围：
          <select id="vScope" data-page-node-id="RjwjtMy5dvi3xkhWTeuZWm"></select>""",
"""          类型：
          <select id="vType" data-page-node-id="RjwjtMy5dvi3xkhWTeuZWm"></select>
          范围：
          <select id="vScope" data-page-node-id="RjwjtMy5dvi3xkhWTeuZWm"></select>""",
"听背类型下拉")

# ============ 7. 首页说明卡 ============
rep(
"""        <h3 data-page-node-id="iZ6NznHUXUoqloBnbNwBLJ">关于二级结论解锁</h3>
        <div class="muted" data-page-node-id="G6sZaqwsymg6kHDdPDndGu">二级结论需要先「会」对应的基础公式才能训练——先打地基，再加速。在练习页可见锁定状态。</div>""",
"""        <h3 data-page-node-id="iZ6NznHUXUoqloBnbNwBLJ">内容说明</h3>
        <div class="muted" data-page-node-id="G6sZaqwsymg6kHDdPDndGu">已收录 <b id="hdrTotal2">0</b> 条：<b>核心公式 253 条</b> + <b>二级结论 113 条</b>，覆盖高一 / 高二全部章节。两级分类：先选「核心公式 / 二级结论」，再按年级和章节筛选。</div>""",
"首页说明卡")

# ============ 8. JS：解锁逻辑 ============
rep(
"""function unlocked(it){return it.type!=='advanced'||it.unlock.every(mastered);}""",
"""function unlocked(it){return !(it.unlock&&it.unlock.length)||it.unlock.every(mastered);}""",
"unlocked")

rep(
"""function lockedCount(){return DATA.items.filter(it=>it.type==='advanced'&&!unlocked(it)).length;}""",
"""function lockedCount(){return DATA.items.filter(it=>!unlocked(it)).length;}""",
"lockedCount")

# ============ 9. JS：类型/年级状态 ============
rep(
"""let curChap='全部';
const GRADES=['高一','高二']; // 高三=总复习，内容归入全部
let curGrade='全部';""",
"""let curChap='全部';
const GRADES=['高一','高二']; // 高三=总复习，内容归入全部
const TYPES=[['core','核心公式'],['conclusion','二级结论'],['all','全部']];
const TYPENAME={core:'核心公式',conclusion:'二级结论'};
let curType='core';
let curGrade='全部';""",
"类型常量")

rep(
"""function pool(){return DATA.items.filter(i=>curGrade==='全部'||i.grade===curGrade);}""",
"""function pool(){return DATA.items.filter(i=>(curType==='all'||i.type===curType)&&(curGrade==='全部'||i.grade===curGrade));}""",
"pool")

rep(
"""function setGrade(g){curGrade=g;curChap='全部';renderChapBar();renderLib();}""",
"""function setGrade(g){curGrade=g;curChap='全部';renderChapBar();renderLib();}
function setType(t){curType=t;curChap='全部';renderTypeBar();renderChapBar();renderLib();}
function renderTypeBar(){const el=document.getElementById('typeBar');if(el)el.innerHTML=TYPES.map(([v,n])=>`<button class="${v===curType?'on':''}" onclick="setType('${v}')">${n}</button>`).join('');}
function typePill(it){return `<span class="pill ${it.type==='conclusion'?'conclusion':'core'}">${TYPENAME[it.type]||''}</span>`;}""",
"setType/renderTypeBar")

rep(
"""  document.getElementById('gradeSel').innerHTML=opts;
  document.getElementById('pGrade').innerHTML=opts;
}""",
"""  document.getElementById('gradeSel').innerHTML=opts;
  document.getElementById('pGrade').innerHTML=opts;
  const pt=document.getElementById('pType');
  if(pt)pt.innerHTML=TYPES.map(([v,n])=>`<option value="${v}"${v==='core'?' selected':''}>${n}</option>`).join('');
}""",
"renderGradeSel")

# ============ 10. renderLib ============
rep(
"""  let list=pool().filter(i=>(curChap==='全部'||i.chapter===curChap)&&(!q||(i.name+i.formula+i.tags.join()+(i.grade||'')).toLowerCase().includes(q.toLowerCase())));""",
"""  let list=pool().filter(i=>(curChap==='全部'||i.chapter===curChap)&&(!q||((i.name||'')+(i.latex||'')+(i.voiceText||'')+(i.tags||[]).join()+(i.chapter||'')).toLowerCase().includes(q.toLowerCase())));""",
"renderLib 搜索")

rep(
"""      <div class="item-head"><div><b>${it.name}</b> <span class="pill ${it.type}">${it.type==='basic'?'基础':'二级结论'}</span>${lvlPill(it)}</div>""",
"""      <div class="item-head"><div><b>${it.name}</b> ${typePill(it)} <span class="pill">${it.grade}</span>${lvlPill(it)}</div>""",
"renderLib 卡片头")

rep(
"""      ${lock?`<div class="lockbox">🔒 需先掌握基础：${it.unlock.map(u=>DATA.items.find(x=>x.id===u).name).join('、')}</div>`:
      `${texHTML(it.latex||it.formula)}""",
"""      ${lock?`<div class="lockbox">🔒 需先掌握基础：${(it.unlock||[]).map(u=>{const t=DATA.items.find(x=>x.id===u);return t?t.name:u;}).join('、')}</div>`:
      `${texHTML(it.latex)}""",
"renderLib 锁定/公式")

# ============ 11. 练习：范围与选题 ============
rep(
"""function fillChapSelects(){
  renderGradeSel();
  fillPracticeChaps();
  const gradeOpts=GRADES.map(g=>`<option value="g:${g}">${g}</option>`).join('');
  document.getElementById('vScope').innerHTML=`<option value="due">今日到期（${dueItems().length} 条）</option>`+gradeOpts+`<option value="g:全部">全部</option>`;
}""",
"""function fillChapSelects(){
  renderGradeSel();
  fillPracticeChaps();
  const gradeOpts=GRADES.map(g=>`<option value="g:${g}">${g}</option>`).join('');
  document.getElementById('vScope').innerHTML=`<option value="due">今日到期（${dueItems().length} 条）</option>`+gradeOpts+`<option value="g:全部">全部年级</option>`;
  const vt=document.getElementById('vType');
  if(vt)vt.innerHTML=TYPES.map(([v,n])=>`<option value="${v}">${n}</option>`).join('');
}""",
"fillChapSelects")

rep(
"""function fillPracticeChaps(){
  const g=document.getElementById('pGrade').value;
  const list=(g==='全部'?DATA.items:DATA.items.filter(i=>i.grade===g));
  const cs=['全部',...new Set(list.map(i=>i.chapter))];
  document.getElementById('pChapter').innerHTML=cs.map(c=>`<option value="${c}">${c}</option>`).join('');
}""",
"""function fillPracticeChaps(){
  const g=document.getElementById('pGrade').value;
  const t=document.getElementById('pType').value;
  const list=DATA.items.filter(i=>(t==='all'||i.type===t)&&(g==='全部'||i.grade===g));
  const cs=['全部',...new Set(list.map(i=>i.chapter))];
  document.getElementById('pChapter').innerHTML=cs.map(c=>`<option value="${c}">${c}</option>`).join('');
}""",
"fillPracticeChaps")

rep(
"""  const g=document.getElementById('pGrade').value,ch=document.getElementById('pChapter').value;
  let p=DATA.items.filter(i=>(g==='全部'||i.grade===g)&&(ch==='全部'||i.chapter===ch)&&unlocked(i));""",
"""  const g=document.getElementById('pGrade').value,ch=document.getElementById('pChapter').value,t=document.getElementById('pType').value;
  let p=DATA.items.filter(i=>(t==='all'||i.type===t)&&(g==='全部'||i.grade===g)&&(ch==='全部'||i.chapter===ch)&&unlocked(i));""",
"pickItem")

# ============ 12. newQuestion 卡片头 + 填空降级 ============
rep(
"""  let html=`<div class="item-head"><div><b>${curQ.name}</b> <span class="pill ${curQ.type}">${curQ.type==='basic'?'基础':'二级'}</span></div><span class="small">${curQ.chapter}</span></div>`;""",
"""  let html=`<div class="item-head"><div><b>${curQ.name}</b> ${typePill(curQ)}</div><span class="small">${curQ.chapter} · ${curQ.grade}</span></div>`;""",
"newQuestion 头部")

rep(
"""  }else   if(mode==='blank'){
    html+=texHTML(curQ.blankLatex||curQ.blank)+`<input type="text" id="blankAns" placeholder="对照空格作答（可用文字描述）"><button class="btn primary" onclick="checkBlank()">检查</button><div id="blankFb" class="small"></div>`;""",
"""  }else   if(mode==='blank'){
    if(curQ.blankLatex){
      html+=texHTML(curQ.blankLatex)+`<input type="text" id="blankAns" placeholder="补全 □ 处的公式片段（如 \\\\frac{a}{b} 或 sin(a+b)）"><button class="btn primary" onclick="checkBlank()">检查</button><div id="blankFb" class="small"></div>`;
    }else{
      html+=`<div class="muted" style="margin:8px 0">这条公式没有可挖空的片段，改为「显示答案 + 自评」：</div><button class="btn primary" onclick="reveal()">显示答案</button>`;
    }""",
"newQuestion 填空降级")

# ============ 13. 三处 texHTML 去掉 formula 兜底 ============
for old, tag in [
    ("${texHTML(curQ.latex||curQ.formula)}<div class=\"small\">✔ ${curQ.condition}</div>", "reveal 答案"),
    ("${texHTML(curQ.latex||curQ.formula)}<div style=\"margin-top:10px\">自评：", "checkBlank 答案"),
    ("${texHTML(curQ.latex||curQ.formula)}<div class=\"small\">⚠ ${curQ.pitfall}</div>", "pickChoice 答案"),
]:
    assert html.count(old) == 1, "texHTML 兜底 not unique: " + tag
    html = html.replace(old, old.replace("curQ.latex||curQ.formula", "curQ.latex"))
    print("  ok: texHTML 兜底 -", tag)

# 选择题选项
rep(
"""      opts.map((o,i)=>`<button class="btn" onclick="pickChoice(${o.id===curQ.id?1:0},this)">${'ABCD'[i]}. ${texHTML(o.latex||o.formula)}</button>`).join('');""",
"""      opts.map((o,i)=>`<button class="btn" style="display:block;text-align:left" onclick="pickChoice(${o.id===curQ.id?1:0},this)">${'ABCD'[i]}. ${texHTML(o.latex)}</button>`).join('');""",
"选择题选项")

# 选择题干扰项尽量同章节
rep(
"""    const others=DATA.items.filter(i=>i.id!==curQ.id).sort(()=>Math.random()-.5).slice(0,3);""",
"""    const peers=DATA.items.filter(i=>i.id!==curQ.id&&i.chapter===curQ.chapter);
    const others=(peers.length>=3?peers:DATA.items.filter(i=>i.id!==curQ.id)).sort(()=>Math.random()-.5).slice(0,3);""",
"选择题干扰项")

# ============ 14. checkBlank 判定 ============
rep(
"""function checkBlank(){
  const v=document.getElementById('blankAns').value.trim();
  const ok=v.length>=1; // 原型阶段宽松判定，正式版逐空比对关键词
  document.getElementById('blankFb').innerHTML=ok?'<span class="check-ok">已作答，对照下方答案自评：</span>':'<span class="check-no">没有填写内容</span>';""",
"""function normTex(s){return (s||'').replace(/\\s+/g,'').replace(/[\\\\{}]/g,'').replace(/\\\\(left|right|,|;|!|quad|qquad|displaystyle|cdot)/g,'').replace(/\\^/g,'').replace(/_/g,'').toLowerCase();}
function checkBlank(){
  const v=document.getElementById('blankAns').value.trim();
  const ans=curQ.blankAnswer||'';
  const ok=v.length>=1&&(!ans||normTex(v).includes(normTex(ans))||normTex(ans).includes(normTex(v)));
  document.getElementById('blankFb').innerHTML=ok?'<span class="check-ok">✅ 与空格处一致，继续自评：</span>':(v.length?'<span class="check-no">❌ 与空格处的写法不同，对照下方答案看看（宽判：只比对字符，不看化简）</span>':'<span class="check-no">没有填写内容</span>');""",
"checkBlank 判定")

# ============ 15. 听背：类型过滤 ============
rep(
"""  const scope=document.getElementById('vScope').value;
  const g=scope.startsWith('g:')?scope.slice(2):null;
  vQueue=(scope==='due'?dueItems():DATA.items.filter(i=>g?(g==='全部'||i.grade===g):(scope==='全部'||i.chapter===scope))).filter(unlocked);""",
"""  const scope=document.getElementById('vScope').value;
  const g=scope.startsWith('g:')?scope.slice(2):null;
  const vt=document.getElementById('vType').value;
  vQueue=(scope==='due'?dueItems():DATA.items.filter(i=>g?(g==='全部'||i.grade===g):(scope==='全部'||i.chapter===scope)))
         .filter(i=>vt==='all'||i.type===vt).filter(unlocked);""",
"voiceStart 过滤")

rep(
"""function startDueReview(){go('voice');document.getElementById('vScope').value='due';document.getElementById('vMode').value='recite';voiceStart();}""",
"""function startDueReview(){go('voice');document.getElementById('vScope').value='due';document.getElementById('vType').value='all';document.getElementById('vMode').value='recite';voiceStart();}""",
"startDueReview")

# ============ 16. 首页/我的 文案与字段 ============
rep(
"""  document.getElementById('hdrDue').textContent=`今日待复习 ${due} 条 · 已收录 ${DATA.items.length} 条（高一样板）`;""",
"""  document.getElementById('hdrDue').textContent=`今日待复习 ${due} 条 · 已收录 ${DATA.items.length} 条`;
  const ht2=document.getElementById('hdrTotal2');if(ht2)ht2.textContent=DATA.items.length;""",
"hdrDue 文案")

rep(
"""  document.getElementById('meFavs').innerHTML=S.favs.length?S.favs.map(id=>{const it=DATA.items.find(x=>x.id===id);return `<div class="small" style="margin:4px 0">★ ${it.name}：<span class="muted">${it.formula.slice(0,50)}…</span></div>`;}).join(''):'<div class="small">还没有收藏，去公式库点 ★</div>';""",
"""  document.getElementById('meFavs').innerHTML=S.favs.length?S.favs.map(id=>{const it=DATA.items.find(x=>x.id===id);if(!it)return '';return `<div class="small" style="margin:4px 0">★ ${it.name} <span class="muted">· ${it.chapter}</span></div>`;}).join(''):'<div class="small">还没有收藏，去公式库点 ★</div>';""",
"收藏夹字段")

# ============ 17. 启动 ============
rep(
"""renderChapBar();renderLib();fillChapSelects();refreshAll();""",
"""renderTypeBar();renderChapBar();renderLib();fillChapSelects();refreshAll();""",
"启动行")

io.open(P, "w", encoding="utf-8").write(html)
print("\n完成，文件大小:", os.path.getsize(P), "bytes")
