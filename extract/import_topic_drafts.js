/*
 * 将早期知识预览稿整理为小程序专项的独立源数据。
 *
 * 说明：
 * - 只读取 K01-K24，不纳入 C01-C04 圆锥曲线补充稿。
 * - K09 的“外心/垂心”合并为一个小节，确保每篇 2-4 节。
 * - 输出仍是可人工校对的 JSON；公式 SVG 与小程序数据由后续脚本生成。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT_FILE = path.join(ROOT, 'extract/topic-source/topics.json')
const KNOWLEDGE_DIR = path.join(ROOT, '_test/knowledge-preview/data')

global.window = {}
require(path.join(KNOWLEDGE_DIR, 'knowledge.js'))
require(path.join(KNOWLEDGE_DIR, 'knowledge-extra.js'))

const SOURCE_PAGES = {
  K01: [3, 4],
  K02: [4, 5],
  K03: [6],
  K04: [7, 8],
  K05: [8, 9],
  K06: [10],
  K07: [11],
  K08: [12, 13],
  K09: [13, 14],
  K10: [15],
  K11: [16],
  K12: [17],
  K13: [18],
  K14: [19],
  K15: [20, 21],
  K16: [22],
  K17: [23],
  K18: [24, 25],
  K19: [26],
  K20: [27],
  K21: [28, 29],
  K22: [30],
  K23: [31],
  K24: [32]
}

const SHORT_TITLES = {
  K01: '不等式三件套',
  K02: '函数对称与周期',
  K03: '抽象函数',
  K04: '导数常用图象',
  K05: '构造辅助函数',
  K06: '三角函数整合',
  K07: '三角形面积',
  K08: '射影与三线',
  K09: '奔驰定理与四心',
  K10: '向量三个结论',
  K11: '等差等比性质',
  K12: '数列求通项',
  K13: '裂项求和',
  K14: '数列奇偶项',
  K15: '球与几何体',
  K16: '截面与翻折',
  K17: '圆锥截口曲线',
  K18: '椭圆双曲线定义',
  K19: '抛物线焦点弦',
  K20: '弦中点与点差',
  K21: '阿氏圆与蒙日圆',
  K22: '排列组合适配',
  K23: '条件概率',
  K24: '二项与超几何'
}

const KEYWORDS = {
  K01: ['基本不等式', '柯西', '权方和', '等号条件'],
  K02: ['奇偶性', '周期性', '对称性', '抽象关系'],
  K03: ['赋值法', '单调性', '抽象函数', '模型'],
  K04: ['导数', '函数图象', '极值', '零点'],
  K05: ['构造', '同构', '辅助函数', '导数'],
  K06: ['三角恒等变换', '三角不等式', '和差化积', '周期'],
  K07: ['面积公式', '海伦公式', '内切圆', '面积比'],
  K08: ['射影定理', '中线', '角平分线', '张角定理'],
  K09: ['奔驰定理', '重心', '内心', '外心', '垂心'],
  K10: ['等和线', '极化恒等式', '对角线向量', '数量积'],
  K11: ['等差数列', '等比数列', '片段和', '绝对值'],
  K12: ['累加法', '累乘法', '构造法', '前n项和'],
  K13: ['裂项', '分式', '根式', '组合数'],
  K14: ['奇偶项', '分段递推', '并项求和', '子列'],
  K15: ['外接球', '内切球', '正四面体', '补形'],
  K16: ['截面', '翻折', '不变量', '三垂线'],
  K17: ['圆锥', '截口', 'Dandelin球', '离心率'],
  K18: ['椭圆', '双曲线', '焦半径', '焦点三角形'],
  K19: ['抛物线', '焦点弦', '焦半径', '面积'],
  K20: ['点差法', '中点弦', '斜率', '轨迹'],
  K21: ['阿波罗尼斯圆', '蒙日圆', '轨迹', '切线'],
  K22: ['捆绑法', '插空法', '分组', '圆桌'],
  K23: ['独立事件', '互斥事件', '条件概率', '全概率'],
  K24: ['二项分布', '超几何分布', '期望', '方差']
}

const PITFALLS = {
  K01: '基本不等式先验正、再配凑、最后查等号；条件不满足时不能直接套下界。',
  K02: '判断奇偶性先看定义域是否关于原点对称；周期与对称轴、对称中心的换算不要混用。',
  K03: '抽象函数题先赋值找 f(0)、f(1) 等特殊值，再结合定义域与单调性判断；不能凭空假设函数解析式。',
  K04: '图象结论依赖定义域、零点和极值点，草图只能帮助判断，最终仍要用导数符号或函数单调性说明。',
  K05: '构造方向由目标式的结构决定；构造后要检查新函数的定义域，并保证 f(x) 与 f′(x) 的符号关系可以推出结论。',
  K06: '三角公式先看角的范围与象限；平方关系开方、半角公式和万能公式都可能产生符号选择。',
  K07: '面积公式中的角必须是两边夹角；使用海伦公式时先验证三边能构成三角形。',
  K08: '射影定理用于直角三角形；中线、角平分线和张角定理使用前要确认对应线段和角的定义。',
  K09: '奔驰定理的系数对应三个小三角形面积；四心结论各有前提，不能把“外心”和“垂心”的向量式混用。',
  K10: '等和线先确认 O、A、B 不共线；极化恒等式取中点后注意向量方向，数量积结论要标明夹角。',
  K11: '等差、等比的片段和性质对下标间隔有要求；绝对值求和必须先找正负分界项。',
  K12: '累加、累乘要写清起始项；由 Sₙ 或乘积反求 aₙ 时必须单独验证 n=1。',
  K13: '裂项后要检查剩余项是否相邻相消；系数、符号和上下限至少要回代一项。',
  K14: '奇偶项问题要同时追踪两个子列；含 (−1)ⁿ 时不能把相邻两项直接约去。',
  K15: '外接球球心在过底面外心且垂直底面的直线上；内切球半径要用“体积=表面积×r/3”等条件核对。',
  K16: '截面作图先找同一平面内的交点；翻折前后只保留折痕以外的长度、角度等不变量。',
  K17: '截口类型由平面与圆锥轴、母线的相对位置决定；空间角度转化为平面角时要说明依据。',
  K18: '椭圆焦半径用“和”，双曲线用“差的绝对值”；双曲线同支、异支要分别讨论。',
  K19: '抛物线结论默认标准形式 y²=2px；换轴、换开口方向时结论中的 p 与坐标关系要同步修改。',
  K20: '点差法只能处理弦所在直线斜率存在的情形；中点必须在曲线内部且弦确实存在。',
  K21: '阿波罗尼斯圆要求 λ>0 且 λ≠1；蒙日圆只适用于两条切线互相垂直的情形。',
  K22: '排列看顺序、组合不看顺序；分组后再分配时注意是否平均分组以及是否指定组名。',
  K23: '独立不等于互斥；条件概率的样本空间已经缩小，全概率公式的分组必须互斥且穷尽。',
  K24: '二项分布要求每次试验独立且成功概率相同；不放回抽样通常对应超几何分布。'
}

const SECTION_SUMMARIES = {
  K01: ['先掌握基本变形和取等条件', '用配凑把目标化成柯西结构', '用权方和处理分式与高次结构'],
  K02: ['从表达式识别奇偶结构', '把函数关系翻成周期', '分清轴对称与中心对称'],
  K03: ['赋值、比较、判断单调性', '从抽象关系倒推函数模型'],
  K04: ['对数型函数的零点与单调性', '指数型函数的增长速度', '带三角因子的函数图象'],
  K05: ['同构的关键是找到相同结构', '从目标反推辅助函数', '处理 f(x) 与 f′(x) 的混合关系'],
  K06: ['比较 sin x、x、tan x', '和差化积与万能公式', '积化和差与三角恒等变形', '从振幅、周期判断图象'],
  K07: ['三组基础面积公式', '内切圆、外接圆与海伦公式', '面积比与共线模型'],
  K08: ['直角三角形的射影关系', '中线与高线的长度关系', '角平分线与张角定理'],
  K09: ['面积系数与向量线性关系', '重心与中线', '内心与角平分线', '外心与垂心'],
  K10: ['判断点是否落在等和线上', '用中点改写数量积', '四边形中的对角线向量'],
  K11: ['下标等间隔时的性质', '前 n 项和的片段关系', '处理绝对值求和'],
  K12: ['相邻差与相邻比', '构造等差、等比结构', '二阶递推与整体量'],
  K13: ['分式和根式的相邻裂项', '指数、对数结构的裂项', '阶乘与组合数裂项'],
  K14: ['拆成奇偶两个子列', '处理带 (−1)ⁿ 的递推', '奇偶项分别求和再合并'],
  K15: ['正方体、正四面体与球', '长方体、棱柱与补形', '球心定位与内切球'],
  K16: ['正方体截面的常见形状', '截面作图的三种方法', '翻折中的不变量'],
  K17: ['平面截圆锥的五种位置', '用 Dandelin 球解释焦点'],
  K18: ['定义、标准方程与焦点位置', '焦半径与焦点弦', '焦点三角形与离心率'],
  K19: ['焦半径与端点坐标', '焦点弦的长度和面积', '四条常用几何结论'],
  K20: ['四类曲线的点差公式', '斜率积与中点轨迹'],
  K21: ['到两定点距离之比为定值', '两条垂直切线的交点轨迹'],
  K22: ['优先、捆绑与插空', '分组、分配与倍缩', '数字、圆桌与综合计数'],
  K23: ['独立事件与条件概率', '全概率公式', '贝叶斯公式与树状图'],
  K24: ['分布条件与概率公式', '期望、方差和识别练习']
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeHeading(text) {
  return String(text || '')
    .replace(/^[一二三四五六七八九十]+、\s*/, '')
    .replace(/^\d+[.、]\s*/, '')
    .trim()
}

function convertBlock(block, sectionId, blockIndex) {
  if (block.type === 'heading') {
    return { type: 'heading', text: normalizeHeading(block.text) }
  }
  if (block.type === 'formula-list') {
    return {
      id: `${sectionId}-b${String(blockIndex + 1).padStart(2, '0')}`,
      type: 'formulas',
      items: (block.items || []).map(item => ({
        tex: item.tex,
        condition: item.condition || ''
      }))
    }
  }
  if (block.type === 'models') {
    return {
      id: `${sectionId}-b${String(blockIndex + 1).padStart(2, '0')}`,
      type: 'formulas',
      items: (block.items || []).map(item => ({
        label: item.label || '',
        tex: item.tex,
        condition: item.condition || ''
      }))
    }
  }
  if (block.type === 'note') {
    return {
      type: 'note',
      title: block.title || '要点',
      text: block.text || ''
    }
  }
  if (block.type === 'proof') {
    return {
      type: 'proof',
      title: block.title || '证明',
      open: Boolean(block.open),
      steps: block.steps || []
    }
  }
  if (block.type === 'table') {
    return {
      type: 'table',
      columns: block.columns || [],
      rows: (block.rows || []).map(row => row.map(cell => (
        cell && typeof cell === 'object' && cell.tex
          ? { type: 'tex', tex: cell.tex }
          : String(cell == null ? '' : cell)
      )))
    }
  }
  if (block.type === 'bullets') {
    return {
      type: 'bullets',
      items: block.items || []
    }
  }
  if (block.type === 'figure') {
    return clone(block)
  }
  return null
}

function convertSection(lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary || '',
    sourcePages: lesson.sourcePages || [],
    lead: lesson.lead || '',
    blocks: (lesson.blocks || [])
      .map((block, index) => convertBlock(block, lesson.id, index))
      .filter(Boolean)
  }
}

function mergeK09(module) {
  const lessons = module.lessons || []
  if (lessons.length <= 4) return lessons
  const merged = lessons.slice(0, 3).concat([{
    ...lessons[3],
    id: 'K09-04',
    title: '外心与垂心',
    summary: '两类与垂直关系有关的四心结论',
    lead: '外心由到三个顶点的距离相等刻画，垂心由高线相交刻画。两组成员都可用向量数量积表示，但对应条件不同。',
    blocks: [
      { type: 'heading', text: '外心' },
      ...(lessons[3].blocks || []),
      { type: 'heading', text: '垂心' },
      ...(lessons[4].blocks || [])
    ]
  }])
  return merged
}

const modules = global.window.KNOWLEDGE_DATA.modules
  .filter(module => /^K(0[1-9]|1[0-9]|2[0-4])$/.test(module.id))
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(module => {
    const lessons = module.id === 'K09' ? mergeK09(module) : module.lessons
    const packageRoot = Number(module.id.slice(1)) <= 8
      ? 'topic-package-a'
      : Number(module.id.slice(1)) <= 16
        ? 'topic-package-b'
        : 'topic-package-c'
    const summaries = SECTION_SUMMARIES[module.id] || []
    const sections = lessons.map((lesson, index) => ({
      ...convertSection(lesson),
      summary: summaries[index] || lesson.summary || ''
    }))
    return {
      id: module.id,
      order: Number(module.id.slice(1)),
      packageRoot,
      domain: module.domain,
      title: module.title,
      shortTitle: SHORT_TITLES[module.id] || module.shortTitle || module.title,
      pageLabel: `原文 ${String(SOURCE_PAGES[module.id][0]).padStart(2, '0')}`
        + (SOURCE_PAGES[module.id].length > 1
          ? `-${String(SOURCE_PAGES[module.id].slice(-1)[0]).padStart(2, '0')}`
          : ''),
      sourcePages: SOURCE_PAGES[module.id],
      intro: module.intro || '',
      boundary: module.boundary || '',
      keywords: KEYWORDS[module.id] || [],
      pitfall: PITFALLS[module.id] || '',
      sections
    }
  })

if (modules.length !== 24) {
  throw new Error(`专项数量应为 24，实际为 ${modules.length}`)
}

const output = {
  meta: {
    title: '高中数学 24 个解题专项',
    source: '知乎专栏 715220128，原图 03-32',
    generatedFrom: '_test/knowledge-preview/data',
    count: modules.length
  },
  modules
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

const stats = modules.map(module => ({
  id: module.id,
  sections: module.sections.length,
  formulas: module.sections.reduce((sum, section) => sum + section.blocks.reduce(
    (count, block) => count + (block.type === 'formulas' ? block.items.length : 0),
    0
  ), 0)
}))

console.log(JSON.stringify({
  output: OUT_FILE,
  modules: modules.length,
  sections: stats.reduce((sum, item) => sum + item.sections, 0),
  formulas: stats.reduce((sum, item) => sum + item.formulas, 0),
  sectionRange: [
    Math.min(...stats.map(item => item.sections)),
    Math.max(...stats.map(item => item.sections))
  ]
}, null, 2))
