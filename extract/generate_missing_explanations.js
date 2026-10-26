/*
 * generate_missing_explanations.js
 *
 * 为尚未人工覆盖的条目生成正式“说明”草稿。
 * 输入仍是 voiceText，但会先把常见口语数学表达统一成正式记号；
 * 已经存在于 explanation-overrides.json 的条目不会被覆盖。
 *
 * 用法:
 *   node extract/generate_missing_explanations.js --check
 *   node extract/generate_missing_explanations.js --write
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_FILE = path.join(ROOT, 'prototype', 'data', '公式库-全量.json')
const OVERRIDE_FILE = path.join(__dirname, 'explanation-overrides.json')

const checkOnly = process.argv.includes('--check')
const write = process.argv.includes('--write')

const GREEK = {
  阿尔法: 'α',
  贝塔: 'β',
  伽马: 'γ',
  德尔塔: 'δ',
  西塔: 'θ',
  拉姆塔: 'λ',
  兰姆达: 'λ',
  斐: 'φ',
  欧米伽: 'ω',
  派: 'π'
}

const SUPERSCRIPTS = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '−': '⁻',
  n: 'ⁿ',
  m: 'ᵐ',
  x: 'ˣ',
  y: 'ʸ',
  k: 'ᵏ'
}

const SUBSCRIPTS = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  n: 'ₙ',
  m: 'ₘ',
  k: 'ₖ',
  i: 'ᵢ',
  j: 'ⱼ',
  A: 'ₐ'
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function toScript(text, map) {
  return Array.from(String(text)).map((ch) => map[ch] || ch).join('')
}

function toSuperscript(text) {
  const value = String(text)
  if (Array.from(value).every((ch) => SUPERSCRIPTS[ch])) return toScript(value, SUPERSCRIPTS)
  if (value === 'n') return 'ⁿ'
  return `^(${value})`
}

function normalizeMinus(text) {
  return text.replace(/[−–—]/g, '-')
}

function convertSuperscripts(text) {
  return text
    .replace(
      /([A-Za-z0-9αβγδθλφωπ])\s*(?:的\s*)?([0-9A-Za-zαβγδθλφωπ+\-\s加减]{1,16})\s*次方/g,
      (_, base, exp) => {
        const normalized = normalizeMinus(exp)
          .replace(/\s+/g, '')
          .replace(/减/g, '-')
          .replace(/加/g, '+')
        return base + toSuperscript(normalized)
      }
    )
    .replace(/([A-Za-z0-9αβγδθλφωπ])\s*次方/g, '$1ⁿ')
}

function convertRoots(text) {
  let out = text
    .replace(/n次根号下([A-Za-z0-9²³⁰¹⁴⁵⁶⁷⁸⁹ⁿᵐˣʸᵏ+\-]+)/g, 'ⁿ√($1)')
    .replace(/n次根号([A-Za-z0-9²³⁰¹⁴⁵⁶⁷⁸⁹ⁿᵐˣʸᵏ+\-]+)/g, 'ⁿ√($1)')
    .replace(/根号下/g, '√')
    .replace(/根号/g, '√')
  return out
}

function convertFractions(text) {
  let out = text
    .replace(/二分之一/g, '1/2')
    .replace(/三分之一/g, '1/3')
    .replace(/四分之一/g, '1/4')
    .replace(/四分之√二/g, '√2/4')
    .replace(/四分之根号二/g, '√2/4')
    .replace(/二分之√([A-Za-z0-9]+)/g, '√$1/2')
  const token = '[A-Za-z0-9αβγδθλφωπ²³⁰¹⁴⁵⁶⁷⁸⁹ⁿᵐˣʸᵏ₀₁₂₃₄₅₆₇₈₉,+\-√()（）]+'
  const re = new RegExp(`(${token})分之(${token})`, 'g')
  for (let i = 0; i < 6; i += 1) {
    const next = out.replace(re, (_, denominator, numerator) => `(${numerator})/(${denominator})`)
    if (next === out) break
    out = next
  }
  return out
}

function convertPlainMathWords(text) {
  let out = text

  for (const [word, symbol] of Object.entries(GREEK)) {
    out = out.split(word).join(symbol)
  }

  out = normalizeMinus(out)
    .replace(/sin\s*([A-Za-zαβγδθλφωπ])/g, 'sin $1')
    .replace(/cos\s*([A-Za-zαβγδθλφωπ])/g, 'cos $1')
    .replace(/tan\s*([A-Za-zαβγδθλφωπ])/g, 'tan $1')
    .replace(/log以([A-Za-z0-9])为底([A-Za-z0-9]+)的对数/g, 'log_$1 $2')
    .replace(/自然对数/g, 'ln')
    .replace(/的绝对值/g, '的绝对值')
    .replace(/([A-Za-z])的绝对值/g, '|$1|')
    .replace(/正负/g, '±')
    .replace(/大于等于/g, '≥')
    .replace(/小于等于/g, '≤')
    .replace(/不等于/g, '≠')
    .replace(/大于/g, '>')
    .replace(/小于/g, '<')
    .replace(/无穷大/g, '∞')
    .replace(/正无穷/g, '+∞')
    .replace(/负无穷/g, '-∞')
    .replace(/点乘/g, '·')
    .replace(/推出/g, '⇒')
    .replace(/平行于/g, '∥')
    .replace(/垂直于/g, '⊥')
    .replace(/乘以/g, '×')
    .replace(/除以/g, '/')
    .replace(/等于/g, '=')

  out = convertSuperscripts(out)
  out = convertFractions(out)
  out = convertRoots(out)

  out = out
    .replace(/([A-Za-z0-9)\]])\s*平方/g, '$1²')
    .replace(/([A-Za-z])\s*立方/g, '$1³')
    .replace(/([A-Za-z])方/g, '$1²')
    .replace(/([A-Za-z])_?([0-9])(?=[A-Za-z+\-×/；，,。=)])/g, (_, base, digit) => base + SUBSCRIPTS[digit])
    .replace(/([0-9A-Za-zα-ω²³ⁿ⁺⁻₀-₉)\]])\s*乘\s*/g, '$1×')
    .replace(/([0-9A-Za-zα-ω²³ⁿ⁺⁻₀-₉)\]])\s*加\s*/g, '$1+')
    .replace(/([0-9A-Za-zα-ω²³ⁿ⁺⁻₀-₉)\]])\s*减\s*/g, '$1-')
    .replace(/([0-9])\s*倍\s*(?=[A-Za-z(√])/g, '$1×')
    .replace(/([A-Za-z])\s*([0-9])(?=[、，,；;。+\-×/=)])/g, (_, base, digit) => base + SUBSCRIPTS[digit])
    .replace(/x\s*平均/g, 'x̄')
    .replace(/y\s*平均/g, 'ȳ')
    .replace(/-\s*1/g, '-1')
    .replace(/-\s*([A-Za-z])/g, '-$1')
    .replace(/\b1到([A-Za-z0-9])/g, '1到$1')
    .replace(/\s+/g, ' ')
    .trim()

  return out
}

const MANUAL = {
  C082: '三角形的四心可用向量刻画：内心是角平分线交点，AP 向量等于 λ 倍（AB 方向单位向量 + AC 方向单位向量）；外心到三顶点距离相等；垂心满足 PA·PB=PA·PC=PB·PC；重心满足 AP=(AB+AC)/3。',
  C083: '正弦定理：a/sin A=b/sin B=c/sin C=2R，其中 R 是三角形 ABC 外接圆的半径。',
  C084: '正弦定理的变形：a=2R sin A，b=2R sin B，c=2R sin C；sin A=a/(2R)，sin B=b/(2R)，sin C=c/(2R)。',
  C085: '余弦定理：a²=b²+c²-2bc cos A，b²=a²+c²-2ac cos B，c²=a²+b²-2ab cos C。',
  C088: '射影定理：在任意三角形 ABC 中，a=b cos C+c cos B，b=a cos C+c cos A，c=a cos B+b cos A；三条式子可轮换使用。',
  C093: '虚数单位 i 的幂以 4 为周期：i⁴ⁿ⁺¹=i，i⁴ⁿ⁺²=-1，i⁴ⁿ⁺³=-i，i⁴ⁿ=1；其中 n 为整数。',
  C094: '复数 z=a+bi 的模为 |z|=√(a²+b²)。',
  C099: '斜二测画法：x′轴与 y′轴夹角为 45°或 135°；平行于 x 轴的线段长度不变，平行于 y 轴的线段长度变为原来的一半。',
  C100: '斜二测直观图的面积 S直=(√2/4)S原。',
  C103: '证明两直线平行可使用平面几何方法（同位角相等、内错角相等、同旁内角互补或中位线等），也可使用线面平行或面面平行的性质定理。',
  C104: '线面平行判定定理：若平面外一条直线与平面内一条直线平行，则该直线与平面平行。',
  C105: '线面平行性质定理：若 a∥α，a⊂β，且 α∩β=b，则 a∥b。',
  C107: '面面平行判定定理：若平面 α 内有两条相交直线都平行于平面 β，则 α∥β；两条平行直线不能用于此判定。',
  C108: '面面平行性质定理：若 α∥β，γ∩α=a，γ∩β=b，则 a∥b；若 α∥β 且 l⊂α，则 l∥β。',
  C110: '线面垂直判定定理：若直线 l 与平面 α 内两条相交直线 a、b 都垂直，则 l⊥α。',
  C113: '面面垂直判定定理：若平面 α 经过平面 β 的一条垂线 l，则 α⊥β。',
  C114: '面面垂直性质定理：若 α⊥β，l⊂α，且 l 垂直于 α 与 β 的交线，则 l⊥β。',
  C121: '分层抽样：抽样比=n/N；各层抽取数量=该层个体数×抽样比。各层按同一抽样比抽取。',
  C122: '频率分布直方图：频率=频数/样本容量；小长方形面积=频率/组距×组距=频率；所有小长方形面积之和为 1。',
  C123: '样本特征数：x̄=(x₁+x₂+…+xₙ)/n；s²=[(x₁-x̄)²+(x₂-x̄)²+…+(xₙ-x̄)²]/n；s=√(s²)。',
  C126: '古典概型：若试验结果有限且每个结果等可能，则 P(A)=A 包含的基本事件数/基本事件总数。',
  C127: '互斥事件：A∩B=∅，且 P(A∪B)=P(A)+P(B)；互斥事件不能同时发生。',
  C128: '对立事件：A∩B=∅，A∪B=Ω，且 P(A)=1-P(B)；两个事件必有一个发生。',
  C132: '空间向量基本定理：若 a、b、c 不共面，则任意空间向量 p 都可唯一表示为 p=xa+yb+zc。',
  C133: '空间向量 a=(x₁,y₁,z₁) 的模为 |a|=√(x₁²+y₁²+z₁²)。',
  C135: '空间向量平行的充要条件是存在实数 λ，使 a=λb；坐标形式为 x₁=λx₂，y₁=λy₂，z₁=λz₂。',
  C136: '空间向量垂直：a⊥b⇔a·b=0⇔x₁x₂+y₁y₂+z₁z₂=0。',
  C141: '用向量法求直线与平面所成角：sin φ=|m·n|/(|m||n|)，其中 m 为直线方向向量、n 为平面法向量；线面角 φ 的范围是 [0,90°]。',
  C144: '异面直线的距离等于向量 AB 在公共法向量 n 上投影的绝对值，即 d=|AB·n|/|n|；n 同时垂直于两条直线，A、B 分别在两条直线上。',
  C156: '两点间距离公式：|AB|=√((x₂-x₁)²+(y₂-y₁)²)。',
  C157: '点到直线的距离：将直线化为一般式 Ax+By+C=0，点 P(x₀,y₀) 到直线的距离为 d=|Ax₀+By₀+C|/√(A²+B²)。',
  C158: '两条平行线 Ax+By+C₁=0 与 Ax+By+C₂=0 之间的距离为 d=|C₁-C₂|/√(A²+B²)；使用前必须保证两式中 x、y 的系数完全相同。',
  C163: '圆的一般方程为 x²+y²+Dx+Ey+F=0；当 D²+E²-4F>0 时表示圆，圆心为 (-D/2,-E/2)，半径为 √(D²+E²-4F)/2。',
  C164: '圆的弦长公式：弦长 l=2√(r²-d²)，其中 r 是圆的半径，d 是圆心到弦的距离。',
  C165: '圆 x²+y²+Dx+Ey+F=0 外一点 M(x₀,y₀) 到圆的切线长为 √(MO²-r²)，也等于 √(x₀²+y₀²+Dx₀+Ey₀+F)。',
  C171: '圆锥曲线定义：椭圆中 |PF₁|+|PF₂|=2a（2a>|F₁F₂|）；双曲线中 ||MF₁|-|MF₂||=2a（0<2a<|F₁F₂|）；抛物线中 |PF|=d(P,l) 且 F∉l。',
  C174: '离心率 e=c/a。椭圆离心率 e=√(1-b²/a²)，且 0<e<1；双曲线离心率 e=√(1+b²/a²)，且 e>1。',
  C175: '双曲线的渐近线：焦点在 x 轴上时为 y=±(b/a)x；焦点在 y 轴上时为 y=±(a/b)x。',
  C184: '抛物线焦点弦性质：焦点弦两端点到焦点的距离分别为 m、n，则 1/m+1/n=2/p。',
  C185: '抛物线 y²=2px 的焦点弦端点满足 x₁x₂=p²/4，y₁y₂=-p²；若弦所在直线斜率为 k，则 x₁+x₂=((k²+2)/k²)p，y₁+y₂=2p/k。',
  C186: '弦长公式：|AB|=√(1+k²)|x₁-x₂|=√(1+k²)√((x₁+x₂)²-4x₁x₂)=√(1+1/k²)|y₁-y₂|，其中 k 是直线斜率且 k≠0。',
  C188: '点差法求中点弦斜率：椭圆 x²/a²+y²/b²=1 中，若弦中点为 (x₀,y₀)，则 k=-b²x₀/(a²y₀)；双曲线对应取正号；抛物线 y²=2px 中 k=p/y₀。',
  C193: '等比数列前 n 项和：Sₙ=a₁(1-qⁿ)/(1-q)（q≠1）；当 q=1 时，Sₙ=na₁。',
  C199: '等比数列前 n 项和性质：Sₙ₊ₘ=Sₙ+qⁿSₘ；依次每隔 k 项组成的片段和 Sₖ、S₂ₖ-Sₖ、S₃ₖ-S₂ₖ、… 构成公比为 qᵏ 的等比数列。',
  C200: '等差乘等比型数列求和可用错位相减速算，结果统一设为 Sₙ=An+Bqⁿ-B，再由 S₁、S₂ 代入求参数 A、B。',
  C201: '常见裂项：1/[n(n+k)]=(1/k)(1/n-1/(n+k))；1/(√n+√(n+1))=√(n+1)-√n；其余类似。',
  C203: '累乘法：若数列满足 aₙ₊₁/aₙ=f(n)，把 n=1,2,… 对应的式子相乘，可求通项。',
  C206: "常数导数为 0；(x^α)'=αx^(α-1)；(sin x)'=cos x；(cos x)'=-sin x；(aˣ)'=aˣ ln a；(eˣ)'=eˣ；(log_a x)'=1/(x ln a)。",
  C213: "解导数不等式常用构造法：f'g+fg'>0 时取 F=fg；f'-g'>0 时取 F=f-g；fg'-gf'>0 时取 F=f/g；xf'+f>0 时取 F=xf；xf'-f>0 时取 F=f/x；xf'+nf>0 时取 F=xⁿf；xf'-nf>0 时取 F=f/xⁿ；f'+f>0 时取 F=eˣf；f'-f>0 时取 F=e⁻ˣf。",
  C214: '指数不等式：eˣ≥x+1，当且仅当 x=0 时取等号。',
  C216: '常用指对不等式：eˣ≥x+1（x∈R）；ln(x+1)≤x（x>-1）；ln x≤x-1（x>0）。等号分别在 x=0、x=0、x=1 处取得。',
  C220: 'n 个元素的全排列 Aₙⁿ=n(n-1)…2·1=n!。',
  C225: '组合数性质：C(n,m)=C(n,n-m)；C(n,m)+C(n,m-1)=C(n+1,m)。',
  C226: '二项式定理：(a+b)ⁿ=C(n,0)aⁿ+C(n,1)aⁿ⁻¹b+…+C(n,n)bⁿ，其中 n∈N*。',
  C227: '二项展开式的通项为 Tₖ₊₁=C(n,k)aⁿ⁻ᵏbᵏ。',
  C228: '二项式系数：与首末等距离的两项系数相等；n 为偶数时中间一项系数最大；n 为奇数时中间两项系数相等且最大。',
  C229: '二项式系数和：C(n,0)+C(n,1)+…+C(n,n)=2ⁿ；奇数项系数和等于偶数项系数和，均为 2ⁿ⁻¹。',
  C238: '二项分布：P(X=k)=C(n,k)pᵏ(1-p)ⁿ⁻ᵏ，其中 k=0,1,…,n。',
  C239: '二项分布的期望 E(X)=np，方差 D(X)=np(1-p)。',
  C240: '超几何分布：P(X=k)=C(M,k)C(N-M,n-k)/C(N,n)，其中 max(0,n-(N-M))≤k≤min(n,M)；前提是不放回抽样。',
  C241: '超几何分布的期望 E(X)=nM/N。',
  S001: '含有 n 个元素的非空有限集合，子集个数为 2ⁿ，真子集个数为 2ⁿ-1，非空真子集个数为 2ⁿ-2。',
  S002: '若对区间 D 内任意 x₁≠x₂，都有 [f(x₁)-f(x₂)]/(x₁-x₂)>k，则 g(x)=f(x)-kx 在 D 上单调递增。',
  S003: '一次分式函数 f(x)=(ax+b)/(cx+d)（c≠0）的竖直渐近线为 x=-d/c，水平渐近线为 y=a/c，对称中心为 (-d/c,a/c)。',
  S017: '若 D 在 BC 上且 BD:DC=m:n，则 AD 向量=(m/(m+n))AC+(n/(m+n))AB。',
  S031: '棱锥外接球半径：侧棱垂直底面时 R=√(r²+(h/2)²)；正棱锥时 R=(r²+h²)/(2h)；两相邻面垂直时 R=√(r₁²+r₂²-l²/4)。',
  S035: '圆的切线长：圆 x²+y²=r² 外一点 P(x₀,y₀) 的切线长为 √(x₀²+y₀²-r²)；圆 (x-a)²+(y-b)²=r² 时为 √((x₀-a)²+(y₀-b)²-r²)；圆 x²+y²+Dx+Ey+F=0 时为 √(x₀²+y₀²+Dx₀+Ey₀+F)。',
  S039: '差比数列 Cₙ=(an+b)qⁿ 的前 n 项和可写为 Sₙ=(An+B)qⁿ⁺¹-Bq，其中 A=a/(q-1)，B=(b-A)/(q-1)（q≠1）。',
  S055: '椭圆焦点三角形中，若 ∠F₁PF₂=θ，∠PF₁F₂=α，∠PF₂F₁=β，则离心率 e=sin θ/(sin α+sin β)。',
  S062: '椭圆焦点弦：左焦点时 |AF|=b²/(a-c cos θ)，|BF|=b²/(a+c cos θ)；右焦点时两者互换；也可统一写为分母 a±c cos θ。',
  S064: '焦点弦中若 AF=λFB（λ>0），则 e=√(1+k²)·|λ-1|/(λ+1)，且 |e cos θ|=|λ-1|/(λ+1)。',
  S083: '双曲线同一支的焦点弦：右焦点时 |AF|=b²/(a-c cos θ)，|BF|=b²/(a+c cos θ)；左焦点时两者互换；统一写作分母 a±c cos θ 与 a∓c cos θ。',
  S107: '抛物线 x²=2py 外一点 M(x₀,m)（m≠0）向抛物线引两条切线，切点弦 AB 过定点 (0,-m)，且 x₀=(x_A+x_B)/2，k_AB·k_MN=2m/p。',
  S108: '抛物线 y²=2px 外一点 M 在直线 x=m（m≠0）上，向抛物线引两条切线，切点弦 AB 过定点 (-m,0)；若切点为 A、B，则 y₀=(y_A+y_B)/2，k_AB·k_MN=p/(2m)。'
}

function polish(text, item) {
  if (MANUAL[item.id]) return MANUAL[item.id]
  let out = String(text).trim()

  for (const [word, symbol] of Object.entries(GREEK)) {
    out = out.split(word).join(symbol)
  }

  out = out
    .replace(/[−–—]/g, '-')
    .replace(/\blambda\b/g, 'λ')
    .replace(/([A-Za-z])0(?![0-9A-Za-z])/g, '$1₀')
    .replace(/([A-Za-z])1(?![0-9A-Za-z])/g, '$1₁')
    .replace(/([A-Za-z])2(?![0-9A-Za-z])/g, '$1₂')
    .replace(/([A-Za-z])(?:的)?平方/g, '$1²')
    .replace(/([A-Za-z])(?:的)?立方/g, '$1³')
    .replace(/([A-Za-z0-9)\]])(?:的)?平方/g, '$1²')
    .replace(/f撇/g, "f'")
    .replace(/自然对数\s*/g, 'ln ')
    .replace(/正负/g, '±')
    .replace(/大于等于/g, '≥')
    .replace(/小于等于/g, '≤')
    .replace(/不等于/g, '≠')
    .replace(/点乘/g, '·')
    .replace(/([0-9])\s*倍\s*(?=[A-Za-z(])/g, '$1')
    .replace(/sin\s*([A-Za-zαβγδθλφωπ])/g, 'sin $1')
    .replace(/cos\s*([A-Za-zαβγδθλφωπ])/g, 'cos $1')
    .replace(/tan\s*([A-Za-zαβγδθλφωπ])/g, 'tan $1')
    .replace(/\s*([，。；：、])\s*/g, '$1')
    .replace(/：:/g, '：')
    .replace(/\s+/g, ' ')
    .trim()

  if (out === String(text).trim() && !out.startsWith(item.name)) {
    out = `${item.name}：${out}`
  }

  out = out
    .replace(/；+/g, '；')
    .replace(/。+/g, '。')
    .replace(/\s+/g, ' ')
    .trim()

  if (!/[。！？]$/.test(out)) out += '。'
  if (!out.startsWith(item.name) && out.length < 18) {
    out = `${item.name}：${out}`
  }
  return out
}

function main() {
  const data = readJson(DATA_FILE)
  const overrideFile = readJson(OVERRIDE_FILE)
  const overrides = overrideFile.items || {}
  const created = []
  const generated = new Map()
  const skipped = []
  const suspicious = []

  for (const item of data.items) {
    const manual = MANUAL[item.id]
    if (!manual && String(item.explanation || '').trim()) continue
    if (!manual && overrides[item.id] && String(overrides[item.id].explanation || '').trim()) continue

    const voice = String(item.voiceText || '').trim()
    if (!voice && !manual) {
      skipped.push(item.id)
      continue
    }

    const explanation = manual || polish(voice, item)
    if (/(的[0-9A-Za-zαβγδθλφωπ]+次方|[0-9A-Za-zαβγδθλφωπ]+分之|根号下|点乘|大于等于|小于等于)/.test(explanation)) {
      suspicious.push({ id: item.id, explanation })
    }
    overrides[item.id] = { explanation }
    generated.set(item.id, explanation)
    created.push(item.id)
  }

  console.log(`新增说明: ${created.length}`)
  console.log(`跳过（无 voiceText）: ${skipped.length}${skipped.length ? ' -> ' + skipped.join(', ') : ''}`)
  console.log(`仍含口语数学表达: ${suspicious.length}`)
  if (suspicious.length) {
    for (const row of suspicious.slice(0, 12)) {
      console.log(`  ${row.id}: ${row.explanation}`)
    }
  }

  const sampleArg = process.argv.find((arg) => arg.startsWith('--sample='))
  if (sampleArg) {
    const ids = sampleArg.slice('--sample='.length).split(',').map((id) => id.trim()).filter(Boolean)
    for (const id of ids) {
      if (generated.has(id)) console.log(`${id}: ${generated.get(id)}`)
    }
  }

  if (!checkOnly && write) {
    overrideFile.items = overrides
    fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(overrideFile, null, 2) + '\n', 'utf8')
    console.log(`已写入: ${OVERRIDE_FILE}`)
  } else {
    console.log('检查模式：未写入文件。加 --write 才会更新覆盖层。')
  }
}

main()
