const r = String.raw

function distractor(latex, errorKind, error) {
  return { latex, errorKind, error }
}

module.exports = {
  C001: {
    type: 'condition',
    stemLatex: r`\text{常用数集的记法对应正确的是}`,
    answerLatex: r`\mathbb{N}\text{：自然数集；}\mathbb{N}^{+}\text{：正整数集；}\mathbb{Z}\text{：整数集；}\mathbb{Q}\text{：有理数集}`,
    distractors: [
      distractor(
        r`\mathbb{N}\text{：整数集；}\mathbb{N}^{+}\text{：自然数集；}\mathbb{Z}\text{：正整数集；}\mathbb{Q}\text{：有理数集}`,
        '相似公式混淆',
        '把自然数集、正整数集和整数集混用了'
      ),
      distractor(
        r`\mathbb{N}\text{：自然数集；}\mathbb{N}^{+}\text{：整数集；}\mathbb{Z}\text{：正整数集；}\mathbb{Q}\text{：实数集}`,
        '相似公式混淆',
        '数集名称与符号对应错误'
      ),
      distractor(
        r`\mathbb{N}\text{：正整数集；}\mathbb{N}^{+}\text{：自然数集；}\mathbb{Z}\text{：整数集；}\mathbb{Q}\text{：无理数集}`,
        '其他',
        '混淆了有理数集与无理数集'
      )
    ]
  },

  C003: {
    type: 'condition',
    stemLatex: r`\text{对任意集合 }A\text{，下列空集关系恒成立的是}`,
    answerLatex: r`\varnothing\subseteq A`,
    distractors: [
      distractor(r`A\subseteq\varnothing`, '符号错误', '反向写成了集合包含空集'),
      distractor(r`\varnothing\subsetneq A`, '漏条件', '空集也可能等于 A，不能写成真包含'),
      distractor(r`A\subsetneq\varnothing`, '符号错误', '包含方向写反且误用了真包含')
    ]
  },

  C005: {
    type: 'condition',
    stemLatex: r`\exists x\in M,\ p(x)\text{ 的否定是}`,
    answerLatex: r`\forall x\in M,\ \neg p(x)`,
    distractors: [
      distractor(
        r`\exists x\in M,\ \neg p(x)`,
        '符号错误',
        '只否定了结论，没有把存在量词改为全称量词'
      ),
      distractor(
        r`\forall x\in M,\ p(x)`,
        '符号错误',
        '只改了量词，没有否定结论'
      ),
      distractor(
        r`\exists x\notin M,\ \neg p(x)`,
        '漏条件',
        '错误改动了变量所在的集合范围'
      )
    ]
  },

  C018: {
    type: 'condition',
    stemLatex: r`a>0\text{ 时，解 }ax^2+bx+c>0\text{ 与 }ax^2+bx+c<0\text{ 的口诀是}`,
    answerLatex: r`\text{大于取两边，小于取中间}`,
    distractors: [
      distractor(r`\text{大于取中间，小于取两边}`, '符号错误', '大于与小于对应的解集方向写反了'),
      distractor(r`\text{两根之间恒为解集}`, '相似公式混淆', '只记住了小于零时的情形'),
      distractor(r`\text{两根之外恒不为解集}`, '符号错误', '把大于零时的解集判断写反了')
    ]
  },

  C024: {
    type: 'condition',
    stemLatex: r`y=f(g(x))\text{ 的单调性口诀是}`,
    answerLatex: r`\text{同增异减}`,
    distractors: [
      distractor(r`\text{同减异增}`, '符号错误', '内外层单调性相同时的结论写反了'),
      distractor(r`\text{同增同减}`, '相似公式混淆', '把异号情形误当成同号情形'),
      distractor(r`\text{只由外层决定}`, '漏条件', '忽略了内层函数的单调性')
    ]
  },

  C046: {
    type: 'condition',
    stemLatex: r`y=x^\alpha\ (\alpha\text{ 为常数})\text{ 的图像恒过定点}`,
    answerLatex: r`(1,1)`,
    distractors: [
      distractor(r`(0,0)`, '相似公式混淆', '把幂函数与正比例函数混淆了'),
      distractor(r`(0,1)`, '次数错误', '把 x 的零次幂与指数函数混淆了'),
      distractor(r`(1,0)`, '符号错误', '把定点的横纵坐标写反了')
    ]
  },

  C049: {
    type: 'condition',
    stemLatex: r`\text{一元二次方程两根在同一区间时，必须同时检查}`,
    answerLatex: r`\text{判别式、对称轴和端点值}`,
    distractors: [
      distractor(r`\text{判别式和端点值}`, '漏条件', '漏掉了对称轴的位置'),
      distractor(r`\text{对称轴和端点值}`, '漏条件', '漏掉了判别式'),
      distractor(r`\text{只检查端点值}`, '漏条件', '把不同区间的情形误当成同一区间')
    ]
  },

  C054: {
    type: 'condition',
    stemLatex: r`\text{三角函数在各象限的符号规律正确的是}`,
    answerLatex: r`\sin\alpha\text{ 一、二正；}\cos\alpha\text{ 一、四正；}\tan\alpha\text{ 一、三正}`,
    distractors: [
      distractor(
        r`\sin\alpha\text{ 一、四正；}\cos\alpha\text{ 一、二正；}\tan\alpha\text{ 一、三正}`,
        '相似公式混淆',
        '把正弦和余弦的象限规律写反了'
      ),
      distractor(
        r`\sin\alpha\text{ 一、二正；}\cos\alpha\text{ 一、四正；}\tan\alpha\text{ 二、四正}`,
        '符号错误',
        '正切的象限符号写反了'
      ),
      distractor(
        r`\sin\alpha\text{ 一、三正；}\cos\alpha\text{ 一、四正；}\tan\alpha\text{ 一、二正}`,
        '相似公式混淆',
        '混淆了正弦与正切的符号规律'
      )
    ]
  },

  C063: {
    type: 'condition',
    stemLatex: r`\text{三角函数图像平移规律正确的是}`,
    answerLatex: r`\text{左加右减，上加下减}`,
    distractors: [
      distractor(r`\text{左减右加，上加下减}`, '符号错误', '左右平移的加减方向写反了'),
      distractor(r`\text{左加右减，上减下加}`, '符号错误', '上下平移的加减方向写反了'),
      distractor(r`\text{左减右加，上减下加}`, '符号错误', '左右与上下平移方向全部写反')
    ]
  },

  C099: {
    type: 'condition',
    stemLatex: r`\text{斜二测画法中，长度与夹角规则正确的是}`,
    answerLatex: r`x\text{轴长度不变，}y\text{轴长度减半，夹角为 }45^\circ\text{ 或 }135^\circ`,
    distractors: [
      distractor(
        r`x\text{轴长度减半，}y\text{轴长度不变，夹角为 }45^\circ\text{ 或 }135^\circ`,
        '相似公式混淆',
        '把 x 轴和 y 轴的长度变化写反了'
      ),
      distractor(
        r`x\text{轴长度不变，}y\text{轴长度减半，夹角恒为 }45^\circ`,
        '漏条件',
        '漏掉了 135 度这一种夹角'
      ),
      distractor(
        r`x\text{轴、}y\text{轴长度都不变，夹角为 }45^\circ\text{ 或 }135^\circ`,
        '漏条件',
        '漏掉了 y 轴方向长度减半的规则'
      )
    ]
  },

  C101: {
    type: 'condition',
    stemLatex: r`\text{平面的基本事实中，确定一个平面的条件是}`,
    answerLatex: r`\text{不共线的三点}`,
    distractors: [
      distractor(r`\text{共线的三点}`, '漏条件', '三点共线时不能确定唯一平面'),
      distractor(r`\text{任意两点}`, '漏条件', '两点不能确定唯一平面'),
      distractor(r`\text{任意四点}`, '相似公式混淆', '把三点确定平面误写成了四点')
    ]
  },

  C102: {
    type: 'condition',
    stemLatex: r`A\notin l\text{ 时，点 }A\text{ 与直线 }l\text{ 确定}`,
    answerLatex: r`\text{唯一一个平面 }\alpha`,
    distractors: [
      distractor(r`\text{两个不同的平面 }\alpha`, '相似公式混淆', '把确定一个平面误当成了两个平面'),
      distractor(r`\text{无数多个平面 }\alpha`, '漏条件', '忽略了点 A 在直线 l 外时仍能唯一确定平面'),
      distractor(r`\text{不能确定任何平面 }\alpha`, '漏条件', '遗漏了直线与直线外一点确定平面的推论')
    ]
  },

  C119: {
    type: 'condition',
    stemLatex: r`\text{二面角 }\theta\text{ 的取值范围是}`,
    answerLatex: r`\theta\in[0^\circ,180^\circ]`,
    distractors: [
      distractor(r`\theta\in(0^\circ,180^\circ)`, '漏条件', '漏掉了 0 度和 180 度两个端点'),
      distractor(r`\theta\in[0^\circ,90^\circ]`, '相似公式混淆', '把二面角与线面角范围混淆了'),
      distractor(r`\theta\in[0^\circ,360^\circ]`, '次数错误', '把二面角误当成了任意旋转角')
    ]
  },

  C183: {
    type: 'condition',
    stemLatex: r`\text{抛物线中，以焦点弦为直径的圆与准线的位置关系是}`,
    answerLatex: r`\text{相切}`,
    distractors: [
      distractor(r`\text{相交}`, '相似公式混淆', '把相切误判成了相交'),
      distractor(r`\text{相离}`, '符号错误', '位置关系判断反了'),
      distractor(r`\text{重合}`, '相似公式混淆', '把圆与直线误当成了两条直线')
    ]
  },

  C245: {
    type: 'condition',
    stemLatex: r`\text{经验回归直线一定经过}`,
    answerLatex: r`(\bar x,\bar y)`,
    distractors: [
      distractor(r`(0,0)`, '相似公式混淆', '回归直线不一定经过坐标原点'),
      distractor(r`(\bar y,\bar x)`, '符号错误', '把横纵坐标写反了'),
      distractor(r`(\bar x,0)`, '漏条件', '漏掉了样本中心点的纵坐标')
    ]
  },

  C246: {
    type: 'condition',
    stemLatex: r`\text{经验回归方程 }\hat y=\hat b x+\hat a\text{ 中，}\hat b>0\text{ 表示}`,
    answerLatex: r`\text{正相关}`,
    distractors: [
      distractor(r`\text{负相关}`, '符号错误', '斜率符号与相关方向写反了'),
      distractor(r`\text{不相关}`, '相似公式混淆', '把正相关误判成不相关'),
      distractor(r`\text{无法判断}`, '漏条件', '忽略了一元线性回归中斜率符号的意义')
    ]
  },

  S035: {
    type: 'reconstruct',
    stemLatex: r`\text{圆 }x^2+y^2=r^2\text{ 外一点 }P(x_0,y_0)\text{ 的切线长为}`,
    answerLatex: r`\sqrt{x_0^2+y_0^2-r^2}`,
    distractors: [
      distractor(r`x_0^2+y_0^2-r^2`, '分母或根号错误', '漏掉了最外层的根号'),
      distractor(r`\sqrt{x_0^2+y_0^2+r^2}`, '符号错误', '根号内的 r 平方符号写反了'),
      distractor(r`\sqrt{x_0^2+y_0^2}-r`, '分母或根号错误', '把半径的平方误放到了根号外')
    ]
  },

  S057: {
    type: 'condition',
    stemLatex: r`\text{椭圆上点 }P\text{ 对两焦点张角最大时，}P\text{ 位于}`,
    answerLatex: r`\text{短轴端点}`,
    distractors: [
      distractor(r`\text{长轴端点}`, '相似公式混淆', '长轴端点处张角最小，不是最大'),
      distractor(r`\text{焦点}`, '漏条件', '焦点不在椭圆上'),
      distractor(r`\text{长轴中点}`, '相似公式混淆', '长轴中点是椭圆中心，不在椭圆上')
    ]
  },

  S101: {
    type: 'condition',
    stemLatex: r`\text{抛物线 }y^2=2px\text{ 的焦点弦 }AB\text{ 中，三组垂直关系正确的是}`,
    answerLatex: r`CF\perp FD,\ NF\perp AB,\ AN\perp BN`,
    distractors: [
      distractor(
        r`CF\perp AB,\ NF\perp FD,\ AN\perp BN`,
        '相似公式混淆',
        '把焦点弦、准线与各投影点之间的垂直关系配错了'
      ),
      distractor(
        r`CF\perp FD,\ NF\perp AN,\ AB\perp BN`,
        '相似公式混淆',
        '后两组垂直关系对应错误'
      ),
      distractor(
        r`CF\perp FD,\ NF\perp AB,\ AN\perp AB`,
        '相似公式混淆',
        '把最后一组垂直关系误写成了 AN 与 AB 垂直'
      )
    ]
  },

  S102: {
    type: 'condition',
    stemLatex: r`\text{抛物线焦点弦图形中，点 }R\text{ 与线段 }MN\text{ 的关系是}`,
    answerLatex: r`R\text{ 为 }MN\text{ 的中点}`,
    distractors: [
      distractor(r`R\text{ 为 }MN\text{ 的三等分点}`, '系数错误', '把中点误写成了三等分点'),
      distractor(r`R\text{ 在 }MN\text{ 的延长线上}`, '符号错误', '把线段内部的中点误写到了延长线上'),
      distractor(r`R\text{ 与 }M,N\text{ 不共线}`, '相似公式混淆', '中点在 MN 上，必然与 M、N 共线')
    ]
  },

  S105: {
    type: 'condition',
    stemLatex: r`\text{抛物线焦点弦 }AB\text{ 中，}C,D\text{ 分别为 }A,B\text{ 在准线上的投影，则}`,
    answerLatex: r`A,D,O\text{ 三点共线，且 }B,C,O\text{ 三点共线}`,
    distractors: [
      distractor(
        r`A,C,O\text{ 三点共线，且 }B,D,O\text{ 三点共线}`,
        '相似公式混淆',
        '把 A、B 与另一侧投影点的对应关系写反了'
      ),
      distractor(
        r`A,B,O\text{ 三点共线，且 }C,D,O\text{ 三点共线}`,
        '相似公式混淆',
        '把焦点弦与原弦的端点对应关系混淆了'
      ),
      distractor(
        r`A,D,O\text{ 三点共线，且 }B,C,F\text{ 三点共线}`,
        '相似公式混淆',
        '把第二组共线关系中的原点 O 换成了焦点 F'
      )
    ]
  },

  S106: {
    type: 'condition',
    stemLatex: r`\text{抛物线焦点弦 }AB\text{ 中，下列圆与准线相切的是}`,
    answerLatex: r`\text{以 }AB\text{ 为直径的圆}`,
    distractors: [
      distractor(r`\text{以 }AF\text{ 为直径的圆}`, '相似公式混淆', '混淆了焦点弦与焦半径所对应的相切关系'),
      distractor(r`\text{以 }BF\text{ 为直径的圆}`, '相似公式混淆', '把另一条焦半径误当成了与准线相切的直径'),
      distractor(r`\text{以 }CD\text{ 为直径的圆}`, '相似公式混淆', '把与 AB 相切的圆误写成了与准线相切')
    ]
  },

  C090: {
    type: 'reconstruct',
    stemLatex: r`\text{任意三角形中，}a>b>c\Leftrightarrow`,
    answerLatex: r`\sin A>\sin B>\sin C`,
    distractors: [
      distractor(r`\sin A<\sin B<\sin C`, '符号错误', '正弦值的大小顺序与边的大小顺序写反了'),
      distractor(r`\cos A>\cos B>\cos C`, '相似公式混淆', '余函数在三角形中的单调方向与正弦不同'),
      distractor(r`\sin 2A>\sin 2B>\sin 2C`, '系数错误', '把角 A、B、C 误写成了 2A、2B、2C')
    ]
  },
  S025: {
    type: 'reconstruct',
    stemLatex: r`\text{三角形中大边对大角：}a>b>c\Leftrightarrow`,
    answerLatex: r`\angle A>\angle B>\angle C`,
    distractors: [
      distractor(r`\angle A<\angle B<\angle C`, '符号错误', '角的大小顺序与边的大小顺序写反了'),
      distractor(r`\cos A>\cos B>\cos C`, '相似公式混淆', '余弦函数在三角形内随角增大而减小'),
      distractor(r`\angle A+\angle B>\angle C`, '漏条件', '只保留了一个三角形不等式，没有给出三个角的大小顺序')
    ]
  },
  C178: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线焦点到一条渐近线的距离 }d=`,
    answerLatex: r`b`,
    distractors: [
      distractor(r`a`, '相似公式混淆', '把双曲线的实半轴长误当成了距离'),
      distractor(r`c`, '相似公式混淆', '把焦点到原点的距离误当成了焦点到渐近线的距离'),
      distractor(r`-b`, '符号错误', '焦点到渐近线的距离应为正')
    ]
  },
  S077: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线焦点到其渐近线距离的结论是 }d=`,
    answerLatex: r`b`,
    distractors: [
      distractor(r`a`, '相似公式混淆', '混淆了实半轴长与焦点到渐近线的距离'),
      distractor(r`c`, '相似公式混淆', '混淆了半焦距与焦点到渐近线的距离'),
      distractor(r`-b`, '符号错误', '焦点到渐近线的距离应为正')
    ]
  },
  S053: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆过焦点的通径 }|MN|=`,
    answerLatex: r`\frac{2b^2}{a}`,
    distractors: [
      distractor(r`\frac{b^2}{a}`, '系数错误', '漏掉了通径公式中的系数 2'),
      distractor(r`\frac{2a^2}{b}`, '分母或根号错误', '把分子分母中的 a、b 写反了'),
      distractor(r`\frac{2c^2}{a}`, '相似公式混淆', '把短半轴平方 b^2 误写成了半焦距平方 c^2')
    ]
  },
  S075: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线过焦点的通径 }|MN|=`,
    answerLatex: r`\frac{2b^2}{a}`,
    distractors: [
      distractor(r`\frac{b^2}{a}`, '系数错误', '漏掉了通径公式中的系数 2'),
      distractor(r`\frac{2a^2}{b}`, '分母或根号错误', '把分子分母中的 a、b 写反了'),
      distractor(r`\frac{2c^2}{a}`, '相似公式混淆', '把 b^2=c^2-a^2 中的 b 误换成了 c')
    ]
  },
  S063: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆过焦点的弦 }AB\text{ 满足 }\frac1{|AF|}+\frac1{|BF|}=`,
    answerLatex: r`\frac{2a}{b^2}`,
    distractors: [
      distractor(r`\frac{a}{b^2}`, '系数错误', '漏掉了结论中的系数 2'),
      distractor(r`\frac{2b}{a^2}`, '分母或根号错误', '把 a 与 b 的位置写反了'),
      distractor(r`\frac{2a}{c^2}`, '相似公式混淆', '把短半轴平方 b^2 误写成了半焦距平方 c^2')
    ]
  },
  S084: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线过焦点的弦 }AB\text{ 满足 }\frac1{|AF|}+\frac1{|BF|}=`,
    answerLatex: r`\frac{2a}{b^2}`,
    distractors: [
      distractor(r`\frac{a}{b^2}`, '系数错误', '漏掉了结论中的系数 2'),
      distractor(r`\frac{2b}{a^2}`, '分母或根号错误', '把 a 与 b 的位置写反了'),
      distractor(r`\frac{2b^2}{a}`, '相似公式混淆', '把焦弦倒数和与通径公式混淆了')
    ]
  },
  S066: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆长轴两端点为 }A,B\text{，}P\text{ 为椭圆上异于 }A,B\text{ 的点，则 }k_{PA}k_{PB}=`,
    answerLatex: r`-\frac{b^2}{a^2}`,
    distractors: [
      distractor(r`\frac{b^2}{a^2}`, '符号错误', '漏掉了椭圆中斜率乘积的负号'),
      distractor(r`-\frac{a^2}{b^2}`, '分母或根号错误', '把 a^2 与 b^2 的位置写反了'),
      distractor(r`-\frac{b^2}{c^2}`, '相似公式混淆', '把长半轴平方 a^2 误写成了半焦距平方 c^2')
    ]
  },
  S067: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆上 }A,B\text{ 关于原点对称，}P\text{ 为椭圆上异于 }A,B\text{ 的点，则 }k_{PA}k_{PB}=`,
    answerLatex: r`-\frac{b^2}{a^2}`,
    distractors: [
      distractor(r`\frac{b^2}{a^2}`, '符号错误', '漏掉了椭圆中斜率乘积的负号'),
      distractor(r`-\frac{a^2}{b^2}`, '分母或根号错误', '把 a^2 与 b^2 的位置写反了'),
      distractor(r`\frac{a^2}{b^2}`, '相似公式混淆', '把结论误写成了双曲线中的斜率乘积')
    ]
  },
  S069: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆上点 }P(x_0,y_0)\text{ 处的切线方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`, '符号错误', '椭圆切线中间应取加号'),
      distractor(r`\frac{x_0x}{b^2}+\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S070: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆外点 }P(x_0,y_0)\text{ 对应的切点弦方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`, '符号错误', '切点弦方程中间应取加号'),
      distractor(r`\frac{x_0x}{b^2}+\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S071: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆内点 }P(x_0,y_0)\text{ 对应的极线方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`, '符号错误', '极线方程中间应取加号'),
      distractor(r`\frac{x_0x}{b^2}+\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S086: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线实轴两端点为 }A,B\text{，}P\text{ 为双曲线上异于 }A,B\text{ 的点，则 }k_{PA}k_{PB}=`,
    answerLatex: r`\frac{b^2}{a^2}`,
    distractors: [
      distractor(r`-\frac{b^2}{a^2}`, '符号错误', '双曲线中的斜率乘积应为正'),
      distractor(r`\frac{a^2}{b^2}`, '分母或根号错误', '把 a^2 与 b^2 的位置写反了'),
      distractor(r`\frac{b^2}{c^2}`, '相似公式混淆', '把实半轴平方 a^2 误写成了半焦距平方 c^2')
    ]
  },
  S087: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线上 }A,B\text{ 关于原点对称，}P\text{ 为双曲线上异于 }A,B\text{ 的点，则 }k_{PA}k_{PB}=`,
    answerLatex: r`\frac{b^2}{a^2}`,
    distractors: [
      distractor(r`-\frac{b^2}{a^2}`, '符号错误', '双曲线中的斜率乘积应为正'),
      distractor(r`\frac{a^2}{b^2}`, '分母或根号错误', '把 a^2 与 b^2 的位置写反了'),
      distractor(r`-\frac{a^2}{b^2}`, '相似公式混淆', '把结论误写成了椭圆中的斜率乘积')
    ]
  },
  S089: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线上点 }P(x_0,y_0)\text{ 处的切线方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`, '符号错误', '双曲线切线中间应取减号'),
      distractor(r`\frac{x_0x}{b^2}-\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S090: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线外点 }P(x_0,y_0)\text{ 对应的切点弦方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`, '符号错误', '切点弦方程中间应取减号'),
      distractor(r`\frac{x_0x}{b^2}-\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S091: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线内点 }P(x_0,y_0)\text{ 对应的极线方程是}`,
    answerLatex: r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=1`,
    distractors: [
      distractor(r`\frac{x_0x}{a^2}+\frac{y_0y}{b^2}=1`, '符号错误', '极线方程中间应取减号'),
      distractor(r`\frac{x_0x}{b^2}-\frac{y_0y}{a^2}=1`, '分母或根号错误', '把 a^2 与 b^2 的分母位置写反了'),
      distractor(r`\frac{x_0x}{a^2}-\frac{y_0y}{b^2}=-1`, '系数错误', '等式右边的常数写错了')
    ]
  },
  S111: {
    type: 'reconstruct',
    stemLatex: r`\text{抛物线 }y^2=2px\text{ 上点 }P(x_0,y_0)\text{ 处的切线方程是}`,
    answerLatex: r`y_0y=p(x+x_0)`,
    distractors: [
      distractor(r`y_0y=p(x-x_0)`, '符号错误', '切线方程括号内应取加号'),
      distractor(r`y_0y=2p(x+x_0)`, '系数错误', '把 p 误写成了 2p'),
      distractor(r`x_0x=p(y+y_0)`, '相似公式混淆', '把 x、y 及 x_0、y_0 的位置整体写反了')
    ]
  },
  S112: {
    type: 'reconstruct',
    stemLatex: r`\text{抛物线 }y^2=2px\text{ 外点 }P(x_0,y_0)\text{ 对应的切点弦方程是}`,
    answerLatex: r`y_0y=p(x+x_0)`,
    distractors: [
      distractor(r`y_0y=p(x-x_0)`, '符号错误', '切点弦方程括号内应取加号'),
      distractor(r`y_0y=2p(x+x_0)`, '系数错误', '把 p 误写成了 2p'),
      distractor(r`x_0x=p(y+y_0)`, '相似公式混淆', '把 x、y 及 x_0、y_0 的位置整体写反了')
    ]
  },
  S113: {
    type: 'reconstruct',
    stemLatex: r`\text{抛物线 }y^2=2px\text{ 内点 }P(x_0,y_0)\text{ 对应的极线方程是}`,
    answerLatex: r`y_0y=p(x+x_0)`,
    distractors: [
      distractor(r`y_0y=p(x-x_0)`, '符号错误', '极线方程括号内应取加号'),
      distractor(r`y_0y=2p(x+x_0)`, '系数错误', '把 p 误写成了 2p'),
      distractor(r`x_0x=p(y+y_0)`, '相似公式混淆', '把 x、y 及 x_0、y_0 的位置整体写反了')
    ]
  },

  C004: {
    type: 'reconstruct',
    stemLatex: r`A\cap B=`,
    answerLatex: r`\{x\mid x\in A\text{ 且 }x\in B\}`,
    distractors: [
      distractor(r`\{x\mid x\in A\text{ 或 }x\in B\}`, '相似公式混淆', '把交集误写成了并集'),
      distractor(r`\{x\mid x\in A,\ x\notin B\}`, '符号错误', '把“同时属于”误写成了“属于 A 但不属于 B”'),
      distractor(r`\{x\mid x\in A\text{ 或 }x\notin B\}`, '符号错误', '逻辑联结词“且”被写成了“或”')
    ]
  },

  C230: {
    type: 'reconstruct',
    stemLatex: r`P(B\mid A)=`,
    answerLatex: r`\frac{P(AB)}{P(A)}`,
    distractors: [
      distractor(r`\frac{P(A)}{P(AB)}`, '分母或根号错误', '把条件概率的分子和分母写反了'),
      distractor(r`\frac{P(AB)}{P(B)}`, '相似公式混淆', '把条件事件 A 与结果事件 B 的位置混淆了'),
      distractor(r`\frac{P(A\mid B)}{P(A)}`, '相似公式混淆', '把条件概率本身再次放进了分子')
    ]
  },

  C239: {
    type: 'reconstruct',
    stemLatex: r`E(X)=`,
    answerLatex: r`np`,
    distractors: [
      distractor(r`n(1-p)`, '相似公式混淆', '把期望与失败次数的期望混淆了'),
      distractor(r`np^2`, '次数错误', '概率 p 多乘了一次'),
      distractor(r`2np`, '系数错误', '期望前多写了系数 2')
    ]
  },

  C016: {
    type: 'blank',
    stemLatex: r`x_1+x_2=`,
    answerLatex: r`-\frac{b}{a}`,
    distractors: [
      distractor(r`\frac{b}{a}`, '符号错误', '漏掉了韦达定理中的负号'),
      distractor(r`-\frac{a}{b}`, '分母或根号错误', '把分子分母中的 a、b 写反了'),
      distractor(r`-\frac{c}{a}`, '相似公式混淆', '把两根之和与两根之积混淆了')
    ]
  },

  C039: {
    type: 'reconstruct',
    stemLatex: r`\sqrt[n]{a^n}=`,
    answerLatex: r`a\ (n\text{ 为奇数})`,
    distractors: [
      distractor(r`|a|\ (n\text{ 为奇数})`, '系数错误', '在 n 为奇数时多写了绝对值'),
      distractor(r`a\ (n\text{ 为偶数})`, '漏条件', '把适用条件中的奇数误写成了偶数'),
      distractor(r`-a\ (n\text{ 为奇数})`, '符号错误', '奇数开方后不应额外加负号')
    ]
  },

  C048: {
    type: 'reconstruct',
    stemLatex: r`f(a)f(b)<0\Rightarrow`,
    answerLatex: r`\exists c\in(a,b),\ f(c)=0`,
    distractors: [
      distractor(r`\forall c\in(a,b),\ f(c)=0`, '符号错误', '把存在量词误写成了全称量词'),
      distractor(r`\exists c\notin(a,b),\ f(c)=0`, '漏条件', '零点的范围不应跑到区间 (a,b) 外'),
      distractor(r`\exists c\in(a,b),\ f(c)\ne0`, '相似公式混淆', '把零点结论误写成了函数值不为零')
    ]
  },

  C060: {
    type: 'reconstruct',
    stemLatex: r`y_{\max}=`,
    answerLatex: r`1\ (x=2k\pi)`,
    distractors: [
      distractor(r`-1\ (x=2k\pi)`, '符号错误', '余弦函数的最大值写成了最小值'),
      distractor(r`1\ (x=\pi+2k\pi)`, '相似公式混淆', '最大值对应的横坐标与最小值位置混淆'),
      distractor(r`1\ (x=k\pi)`, '漏条件', '只保留了周期条件，漏掉了最大值所在的具体相位')
    ]
  },

  C065: {
    type: 'reconstruct',
    stemLatex: r`y=\sin x\to y=\sin\omega x\to y=\sin(\omega x+\varphi)\to`,
    answerLatex: r`y=A\sin(\omega x+\varphi)`,
    distractors: [
      distractor(r`y=A\sin(\omega x-\varphi)`, '符号错误', '相位平移方向写反了'),
      distractor(r`y=A\cos(\omega x+\varphi)`, '相似公式混淆', '把正弦型函数误写成了余弦型函数'),
      distractor(r`y=A\sin(x+\varphi)`, '系数错误', '最后一步漏掉了横向伸缩系数 \omega')
    ]
  },

  C072: {
    type: 'reconstruct',
    stemLatex: r`\vec{a}+\vec{b}=`,
    answerLatex: r`(x_1+x_2,\ y_1+y_2)`,
    distractors: [
      distractor(r`(x_1-x_2,\ y_1+y_2)`, '符号错误', '横坐标误用了减法'),
      distractor(r`(x_1+x_2,\ y_1-y_2)`, '符号错误', '纵坐标误用了减法'),
      distractor(r`(x_1-x_2,\ y_1-y_2)`, '相似公式混淆', '把向量加法写成了向量减法')
    ]
  },

  C073: {
    type: 'reconstruct',
    stemLatex: r`\vec{a}-\vec{b}=`,
    answerLatex: r`(x_1-x_2,\ y_1-y_2)`,
    distractors: [
      distractor(r`(x_1+x_2,\ y_1-y_2)`, '符号错误', '横坐标误用了加法'),
      distractor(r`(x_1-x_2,\ y_1+y_2)`, '符号错误', '纵坐标误用了加法'),
      distractor(r`(x_1+x_2,\ y_1+y_2)`, '相似公式混淆', '把向量减法写成了向量加法')
    ]
  },

  C129: {
    type: 'reconstruct',
    stemLatex: r`A,B\text{ 相互独立}\Leftrightarrow`,
    answerLatex: r`P(AB)=P(A)P(B)`,
    distractors: [
      distractor(r`P(AB)=P(A)+P(B)`, '符号错误', '独立事件的概率应相乘，不是相加'),
      distractor(r`P(A\mid B)=P(A)P(B)`, '相似公式混淆', '把条件概率与事件乘积的概率混淆了'),
      distractor(r`P(AB)=\frac{P(A)}{P(B)}`, '分母或根号错误', '把概率乘法误写成了除法')
    ]
  },

  C131: {
    type: 'reconstruct',
    stemLatex: r`\vec{a},\vec{b}\text{ 不共线，}\vec{p}\text{ 与它们共面}\Leftrightarrow\exists(x,y),\ \vec{p}=`,
    answerLatex: r`x\vec{a}+y\vec{b}`,
    distractors: [
      distractor(r`x\vec{b}+y\vec{a}`, '相似公式混淆', '把基向量 \vec{a}、\vec{b} 的位置写反了'),
      distractor(r`x\vec{a}-y\vec{b}`, '符号错误', '共面分解中的线性组合应取加号'),
      distractor(r`2x\vec{a}+y\vec{b}`, '系数错误', '第一个基向量前多写了系数 2')
    ]
  },

  C138: {
    type: 'reconstruct',
    stemLatex: r`\text{平面 }\alpha\text{ 的法向量可设为 }\vec{n}=`,
    answerLatex: r`(x,y,z)`,
    distractors: [
      distractor(r`(x,y)`, '次数错误', '平面法向量应有三个坐标'),
      distractor(r`(x,0,z)`, '漏条件', '提前把纵坐标限定为 0，条件缺失'),
      distractor(r`(x,y,0)`, '漏条件', '提前把竖坐标限定为 0，条件缺失')
    ]
  },

  C155: {
    type: 'reconstruct',
    stemLatex: r`l_1\perp l_2\Leftrightarrow`,
    answerLatex: r`A_1A_2+B_1B_2=0`,
    distractors: [
      distractor(r`A_1A_2+B_1B_2=1`, '系数错误', '垂直条件的右边应为 0'),
      distractor(r`A_1B_2-A_2B_1=0`, '相似公式混淆', '把垂直条件与平行条件混淆了'),
      distractor(r`k_1k_2=1`, '符号错误', '斜率乘积应为 -1')
    ]
  },

  C111: {
    type: 'reconstruct',
    stemLatex: r`l\perp\alpha,\ a\subset\alpha\Rightarrow`,
    answerLatex: r`l\perp a`,
    distractors: [
      distractor(r`l\parallel a`, '符号错误', '线面垂直时，平面内与该线相交的直线应与其垂直'),
      distractor(r`a\perp\alpha`, '相似公式混淆', '平面内的一条直线不能推出与平面垂直'),
      distractor(r`l\parallel\alpha`, '相似公式混淆', '把线面垂直误判成了线面平行')
    ]
  },

  C115: {
    type: 'blank',
    stemLatex: r`l\perp\beta,\ l\subset\alpha\Rightarrow\boxed{\phantom{\alpha\perp\beta}}`,
    answerLatex: r`\alpha\perp\beta`,
    distractors: [
      distractor(r`\alpha\parallel\beta`, '符号错误', '两个平面的位置关系写反了'),
      distractor(r`\alpha\subset\beta`, '相似公式混淆', '把面面垂直误判成了包含关系'),
      distractor(r`\beta\subset\alpha`, '相似公式混淆', '把面面垂直误判成了反向包含关系')
    ]
  },

  C117: {
    type: 'condition',
    stemLatex: r`\text{两条异面直线所成角为 }\theta\text{，则}`,
    answerLatex: r`\theta\in(0^{\circ},90^{\circ}]`,
    distractors: [
      distractor(r`\theta\in[0^{\circ},90^{\circ}]`, '漏条件', '异面直线不平行，角度不能为 0 度'),
      distractor(r`\theta\in(0^{\circ},180^{\circ}]`, '相似公式混淆', '把异面直线所成角与一般夹角范围混用了'),
      distractor(r`\theta\in(90^{\circ},180^{\circ}]`, '相似公式混淆', '异面直线所成角应取锐角或直角')
    ]
  },

  C125: {
    type: 'condition',
    stemLatex: r`\text{频率分布直方图中，中位数对应}`,
    answerLatex: r`\text{累积频率为 }0.5\text{ 的横坐标}`,
    distractors: [
      distractor(r`\text{累积频率为 }0.25\text{ 的横坐标}`, '系数错误', '中位数对应的是累积频率 0.5'),
      distractor(r`\text{累积频率为 }0.75\text{ 的横坐标}`, '系数错误', '把中位数与上四分位数混用了'),
      distractor(r`\text{频率最大的组的横坐标}`, '相似公式混淆', '频率最大的横坐标对应众数，不是中位数')
    ]
  },

  C249: {
    type: 'reconstruct',
    stemLatex: r`R^2=`,
    answerLatex: r`1-\frac{\sum (y_i-\hat y_i)^2}{\sum (y_i-\bar y)^2}`,
    distractors: [
      distractor(
        r`1-\frac{\sum (y_i-\hat y_i)}{\sum (y_i-\bar y)}`,
        '次数错误',
        '残差平方和与总平方和漏掉了平方'
      ),
      distractor(
        r`1+\frac{\sum (y_i-\hat y_i)^2}{\sum (y_i-\bar y)^2}`,
        '符号错误',
        '相关指数中的分式前应为减号'
      ),
      distractor(
        r`1-\frac{\sum (y_i-\bar y)^2}{\sum (y_i-\hat y_i)^2}`,
        '相似公式混淆',
        '把残差平方和与总平方和的位置写反了'
      )
    ]
  },

  C189: {
    type: 'reconstruct',
    stemLatex: r`n=1\text{ 时，}a_n=`,
    answerLatex: r`S_1`,
    distractors: [
      distractor(r`S_1-S_0`, '系数错误', 'n=1 时不存在 S_0'),
      distractor(r`S_0`, '相似公式混淆', '把首项与前一项和混淆了'),
      distractor(r`a_1+d`, '符号错误', '首项不应额外加公差')
    ]
  },

  S014: {
    type: 'blank',
    stemLatex: r`\sin\alpha=`,
    answerLatex: r`\frac{2\tan\frac{\alpha}{2}}{1+\tan^2\frac{\alpha}{2}}`,
    distractors: [
      distractor(r`\frac{3\tan\frac{\alpha}{2}}{1+\tan^2\frac{\alpha}{2}}`, '系数错误', '分子中的系数 2 写成了 3'),
      distractor(r`\frac{2\tan\frac{\alpha}{2}}{1-\tan^2\frac{\alpha}{2}}`, '符号错误', '分母应取加号'),
      distractor(r`\frac{1-\tan^2\frac{\alpha}{2}}{1+\tan^2\frac{\alpha}{2}}`, '相似公式混淆', '把正弦的万能公式与余弦混淆了')
    ]
  },

  S104: {
    type: 'condition',
    stemLatex:
      r`\text{焦点弦 }AB\text{ 的端点 }A,B\text{ 与准线和 }x\text{ 轴交点 }P\text{ 满足}`,
    answerLatex: r`\angle APF=\angle BPF`,
    distractors: [
      distractor(r`\angle APF=\angle AFP`, '相似公式混淆', '把以 P 为顶点的角与以 A 为顶点的角混用了'),
      distractor(r`\angle BPF=\angle BFP`, '相似公式混淆', '把以 P 为顶点的角与以 B 为顶点的角混用了'),
      distractor(r`\angle APF+\angle BPF=90^{\circ}`, '符号错误', '两个角相等，不是互余关系')
    ]
  },

  S049: {
    type: 'reconstruct',
    stemLatex: r`x\in\left[0,\frac{\pi}{2}\right)\Rightarrow`,
    answerLatex: r`\sin x\le x\le\tan x`,
    distractors: [
      distractor(r`\sin x<x<\tan x`, '漏条件', '漏掉了 x=0 时取等号'),
      distractor(r`\cos x\le x\le\tan x`, '相似公式混淆', '把正弦与余弦放缩混淆了'),
      distractor(r`\sin x\ge x\ge\tan x`, '符号错误', '三个量的大小顺序写反了')
    ]
  },

  C032: {
    type: 'condition',
    stemLatex: r`\text{设 }h(x)=g[f(x)]\text{，下列复合函数奇偶性判断正确的是}`,
    answerLatex: r`\text{奇}[\text{奇}]=\text{奇};\quad \text{偶}[\text{奇}]=\text{偶};\quad \text{奇}[\text{偶}]=\text{偶};\quad \text{偶}[\text{偶}]=\text{偶}`,
    distractors: [
      distractor(
        r`\text{奇}[\text{奇}]=\text{偶};\quad \text{偶}[\text{奇}]=\text{奇};\quad \text{奇}[\text{偶}]=\text{奇};\quad \text{偶}[\text{偶}]=\text{偶}`,
        '相似公式混淆',
        '内层为奇函数时的复合结果判断错误'
      ),
      distractor(
        r`\text{奇}[\text{奇}]=\text{奇};\quad \text{偶}[\text{奇}]=\text{偶};\quad \text{奇}[\text{偶}]=\text{奇};\quad \text{偶}[\text{偶}]=\text{奇}`,
        '相似公式混淆',
        '外层为偶函数时复合结果应恒为偶函数'
      ),
      distractor(
        r`\text{奇}[\text{奇}]=\text{偶};\quad \text{偶}[\text{奇}]=\text{偶};\quad \text{奇}[\text{偶}]=\text{偶};\quad \text{偶}[\text{偶}]=\text{奇}`,
        '符号错误',
        '把复合函数奇偶性的对应关系整体写反了'
      )
    ]
  },

  C103: {
    type: 'condition',
    stemLatex: r`\text{下列线线平行判定或性质正确的是}`,
    answerLatex: r`\text{同位角、内错角、同旁内角、中位线};\quad l\parallel\alpha,\ l\subset\beta,\ \alpha\cap\beta=m\Rightarrow l\parallel m;\quad \alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b`,
    distractors: [
      distractor(
        r`\text{同位角、内错角、同旁内角、中位线};\quad l\parallel\alpha,\ \alpha\cap\beta=m\Rightarrow l\parallel m;\quad \alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b`,
        '漏条件',
        '线面平行性质中漏掉了直线在另一平面内'
      ),
      distractor(
        r`\text{同位角、内错角、同旁内角、中位线};\quad l\parallel\alpha,\ l\subset\beta,\ \alpha\cap\beta=m\Rightarrow l\perp m;\quad \alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b`,
        '符号错误',
        '线面平行得到的交线应与原直线平行'
      ),
      distractor(
        r`\text{同位角、内错角、同旁内角、中位线};\quad l\parallel\alpha,\ l\subset\beta,\ \alpha\cap\beta=m\Rightarrow l\parallel m;\quad \alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\perp b`,
        '相似公式混淆',
        '把两个平行平面被第三平面截得的交线误判为垂直'
      )
    ]
  },

  C108: {
    type: 'condition',
    stemLatex: r`\text{关于面面平行性质，下列判断正确的是}`,
    answerLatex: r`\alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b;\quad \alpha\parallel\beta,\ l\subset\alpha\Rightarrow l\parallel\beta`,
    distractors: [
      distractor(
        r`\alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\perp b;\quad \alpha\parallel\beta,\ l\subset\alpha\Rightarrow l\parallel\beta`,
        '符号错误',
        '两个平行平面被第三平面截得的交线应平行'
      ),
      distractor(
        r`\alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b;\quad \alpha\parallel\beta,\ l\subset\alpha\Rightarrow l\perp\beta`,
        '符号错误',
        '平行平面内的直线与另一平面应平行或在其中'
      ),
      distractor(
        r`\alpha\parallel\beta,\ \gamma\cap\alpha=a,\ \gamma\cap\beta=b\Rightarrow a\parallel b;\quad \alpha\parallel\beta,\ l\subset\alpha\Rightarrow l\subset\beta`,
        '相似公式混淆',
        '把线面平行误写成了直线在平面内'
      )
    ]
  },

  C109: {
    type: 'condition',
    stemLatex: r`\text{下列面面平行的判定或性质正确的是}`,
    answerLatex: r`\alpha\cap\beta=\varnothing;\quad a,b\subset\alpha,\ a\cap b=P,\ a\parallel\beta,\ b\parallel\beta\Rightarrow\alpha\parallel\beta;\quad \alpha\parallel\gamma,\ \beta\parallel\gamma\Rightarrow\alpha\parallel\beta`,
    distractors: [
      distractor(
        r`\alpha\cap\beta=\varnothing;\quad a,b\subset\alpha,\ a\parallel\beta,\ b\parallel\beta\Rightarrow\alpha\parallel\beta;\quad \alpha\parallel\gamma,\ \beta\parallel\gamma\Rightarrow\alpha\parallel\beta`,
        '漏条件',
        '面面平行判定中的两条直线必须相交'
      ),
      distractor(
        r`\alpha\cap\beta=\varnothing;\quad a,b\subset\alpha,\ a\parallel b,\ a\parallel\beta,\ b\parallel\beta\Rightarrow\alpha\parallel\beta;\quad \alpha\parallel\gamma,\ \beta\parallel\gamma\Rightarrow\alpha\parallel\beta`,
        '相似公式混淆',
        '把“相交”误写成了“平行”'
      ),
      distractor(
        r`\alpha\cap\beta=\varnothing;\quad a,b\subset\alpha,\ a\cap b=P,\ a\parallel\beta,\ b\parallel\beta\Rightarrow\alpha\parallel\beta;\quad \alpha\parallel\gamma,\ \beta\parallel\gamma\Rightarrow\alpha\perp\beta`,
        '符号错误',
        '平行于同一平面的两个平面应互相平行'
      )
    ]
  },

  C112: {
    type: 'condition',
    stemLatex: r`\text{下列线面垂直的判定或性质正确的是}`,
    answerLatex: r`l\perp a,\ l\perp b,\ a,b\subset\alpha,\ a\cap b=P\Rightarrow l\perp\alpha;\quad \alpha\perp\beta,\ l\subset\alpha,\ l\perp(\alpha\cap\beta)\Rightarrow l\perp\beta`,
    distractors: [
      distractor(
        r`l\perp a,\ l\perp b,\ a,b\subset\alpha\Rightarrow l\perp\alpha;\quad \alpha\perp\beta,\ l\subset\alpha,\ l\perp(\alpha\cap\beta)\Rightarrow l\perp\beta`,
        '漏条件',
        '判定线面垂直时，平面内两条直线必须相交'
      ),
      distractor(
        r`l\perp a,\ l\perp b,\ a,b\subset\alpha,\ a\cap b=P\Rightarrow l\parallel\alpha;\quad \alpha\perp\beta,\ l\subset\alpha,\ l\perp(\alpha\cap\beta)\Rightarrow l\perp\beta`,
        '符号错误',
        '同时垂直平面内两条相交直线应得到线面垂直'
      ),
      distractor(
        r`l\perp a,\ l\perp b,\ a,b\subset\alpha,\ a\cap b=P\Rightarrow l\perp\alpha;\quad \alpha\perp\beta,\ l\subset\alpha,\ l\perp(\alpha\cap\beta)\Rightarrow l\parallel\beta`,
        '符号错误',
        '面面垂直性质中得到的应为线面垂直'
      )
    ]
  },

  C118: {
    type: 'condition',
    stemLatex: r`\text{求直线与平面所成角时，作法与范围正确的是}`,
    answerLatex: r`\text{找射影}\Rightarrow\text{解直角三角形}\Rightarrow\theta\in[0^{\circ},90^{\circ}]`,
    distractors: [
      distractor(
        r`\text{找射影}\Rightarrow\text{解直角三角形}\Rightarrow\theta\in(0^{\circ},90^{\circ})`,
        '漏条件',
        '直线在平面内或与平面垂直时，端点角也要保留'
      ),
      distractor(
        r`\text{找射影}\Rightarrow\text{解直角三角形}\Rightarrow\theta\in[0^{\circ},180^{\circ}]`,
        '相似公式混淆',
        '把线面角与两向量夹角范围混用了'
      ),
      distractor(
        r`\text{找交点}\Rightarrow\text{数交点个数}\Rightarrow\theta\in(0^{\circ},180^{\circ})`,
        '相似公式混淆',
        '线面角要通过射影转化为直角三角形中的锐角'
      )
    ]
  },

  C126: {
    type: 'condition',
    stemLatex: r`\text{古典概型中概率 }P(A)\text{ 的正确表达式是}`,
    answerLatex: r`P(A)=\frac{\text{A包含的基本事件数}}{\text{总的基本事件个数}}`,
    distractors: [
      distractor(
        r`P(A)=\frac{\text{总的基本事件个数}}{\text{A包含的基本事件数}}`,
        '分母或根号错误',
        '把分子与分母的位置写反了'
      ),
      distractor(
        r`P(A)=\frac{\text{不属于}A\text{的基本事件数}}{\text{总的基本事件个数}}`,
        '相似公式混淆',
        '把事件 A 与其对立事件混淆了'
      ),
      distractor(
        r`P(A)=\frac{(\text{A包含的基本事件数})^2}{\text{总的基本事件个数}}`,
        '次数错误',
        '分子多写了一次平方'
      )
    ]
  },

  C130: {
    type: 'condition',
    stemLatex: r`A_1,A_2,\cdots,A_n\text{ 相互独立时，下列乘法公式正确的是}`,
    answerLatex: r`P(A_1A_2\cdots A_n)=P(A_1)P(A_2)\cdots P(A_n)`,
    distractors: [
      distractor(
        r`P(A_1A_2\cdots A_n)=nP(A_1)P(A_2)\cdots P(A_n)`,
        '系数错误',
        '独立事件同时发生的概率不应再乘 n'
      ),
      distractor(
        r`P(A_1A_2\cdots A_n)=P(A_1)+P(A_2)+\cdots+P(A_n)`,
        '相似公式混淆',
        '把积事件的概率与和事件的概率混用了'
      ),
      distractor(
        r`P(A_1A_2\cdots A_n)=1-\prod_{i=1}^{n}(1-P(A_i))`,
        '相似公式混淆',
        '这是至少一个事件发生的概率，不是积事件概率'
      )
    ]
  },

  C232: {
    type: 'condition',
    stemLatex: r`\text{当 }P(A)>0\text{ 时，积事件 }AB\text{ 的乘法公式是}`,
    answerLatex: r`P(AB)=P(A)P(B\mid A)`,
    distractors: [
      distractor(
        r`P(AB)=P(A)P(B)`,
        '相似公式混淆',
        '只有事件 A、B 独立时才能省略条件概率'
      ),
      distractor(
        r`P(AB)=P(A)+P(B\mid A)`,
        '符号错误',
        '积事件使用乘法，不是加法'
      ),
      distractor(
        r`P(AB)=P(A)P(A\mid B)`,
        '相似公式混淆',
        '条件概率的条件事件写反了'
      )
    ]
  },

  C026: {
    type: 'reconstruct',
    stemLatex: r`y=f(wx)\to`,
    answerLatex: r`y=f\left[w(x\pm a)\right]`,
    distractors: [
      distractor(
        r`y=f\left[w(x\mp a)\right]`,
        '符号错误',
        '括号内左右平移的正负号写反了'
      ),
      distractor(
        r`y=f(wx)\pm a`,
        '相似公式混淆',
        '把左右平移误写成了上下平移'
      ),
      distractor(
        r`y=f\left[w(x)\right]\pm a`,
        '漏条件',
        '没有把平移量 a 放进内层表达式'
      )
    ]
  },

  C027: {
    type: 'reconstruct',
    stemLatex: r`y=f(x)\to`,
    answerLatex: r`y=f\left(\frac{1}{\omega}x\right)`,
    distractors: [
      distractor(
        r`y=f(\omega x)`,
        '相似公式混淆',
        '把横坐标伸缩倍数的倒数关系写反了'
      ),
      distractor(
        r`y=\frac{1}{\omega}f(x)`,
        '系数错误',
        '把自变量前的系数误放到了函数外'
      ),
      distractor(
        r`y=f\left(x+\frac{1}{\omega}\right)`,
        '相似公式混淆',
        '把伸缩变换与平移变换混淆了'
      )
    ]
  },

  C028: {
    type: 'reconstruct',
    stemLatex: r`\text{把 }y=f(x)\text{ 在 }x\text{ 轴下方的图像翻到上方，得到}`,
    answerLatex: r`y=|f(x)|`,
    distractors: [
      distractor(r`y=f(|x|)`, '相似公式混淆', '把函数外加绝对值与自变量加绝对值混淆了'),
      distractor(r`y=|f(|x|)|`, '次数错误', '对函数内外同时加了绝对值'),
      distractor(r`y=-f(x)`, '符号错误', '把整个图像翻折到了 x 轴另一侧')
    ]
  },

  C029: {
    type: 'reconstruct',
    stemLatex: r`\text{偶函数的定义是 }f(-x)=`,
    answerLatex: r`f(x)`,
    distractors: [
      distractor(r`-f(x)`, '相似公式混淆', '把偶函数与奇函数的定义混淆了'),
      distractor(r`f(x)^{-1}`, '次数错误', '把函数值误写成了它的倒数'),
      distractor(r`f(x)+1`, '系数错误', '函数值不应整体加 1')
    ]
  },

  C031: {
    type: 'reconstruct',
    stemLatex: r`\text{奇函数}\times\text{奇函数}=`,
    answerLatex: r`\text{偶函数}`,
    distractors: [
      distractor(r`\text{奇函数}`, '相似公式混淆', '把奇函数乘积的奇偶性记反了'),
      distractor(r`\text{非奇非偶函数}`, '相似公式混淆', '两个奇函数的乘积仍具有对称性'),
      distractor(r`\text{既奇又偶函数}`, '漏条件', '忽略了一般的奇函数乘积不为零函数')
    ]
  },

  C047: {
    type: 'reconstruct',
    stemLatex: r`f(x)=0\text{ 有实数解}\Leftrightarrow`,
    answerLatex: r`y=f(x)\text{ 有零点}`,
    distractors: [
      distractor(r`y=f(x)\text{ 无零点}`, '符号错误', '方程有实数解与函数无零点互相矛盾'),
      distractor(
        r`y=f(x)\text{ 的图像与 }y\text{ 轴有公共点}`,
        '相似公式混淆',
        '零点对应图像与 x 轴的交点'
      ),
      distractor(r`f(0)=0`, '漏条件', '零点不一定是 x=0，不能只检查原点')
    ]
  },

  C050: {
    type: 'reconstruct',
    stemLatex: r`\text{半径为 }r\text{、弧长为 }l\text{ 时，}|\alpha|=`,
    answerLatex: r`\frac{l}{r}`,
    distractors: [
      distractor(r`\frac{r}{l}`, '分母或根号错误', '把弧长与半径的位置写反了'),
      distractor(r`\frac{l}{r^2}`, '次数错误', '半径多写了一次平方'),
      distractor(r`\frac{2l}{r}`, '系数错误', '弧长前多写了系数 2')
    ]
  },

  C061: {
    type: 'reconstruct',
    stemLatex: r`\tan x\text{ 的定义域是}`,
    answerLatex: r`x\neq\frac{\pi}{2}+k\pi,\ k\in\mathbb{Z}`,
    distractors: [
      distractor(
        r`x\neq\pi+2k\pi,\ k\in\mathbb{Z}`,
        '系数错误',
        '把正切函数的周期和间断点位置都写错了'
      ),
      distractor(
        r`x\neq\frac{\pi}{2}+2k\pi,\ k\in\mathbb{Z}`,
        '漏条件',
        '只排除了一个周期内的间断点'
      ),
      distractor(
        r`x\neq k\pi,\ k\in\mathbb{Z}`,
        '相似公式混淆',
        '把正切的零点误当成了无定义点'
      )
    ]
  },

  C064: {
    type: 'reconstruct',
    stemLatex: r`y=\sin x\to`,
    answerLatex: r`y=\sin\omega x`,
    distractors: [
      distractor(r`y=\omega\sin x`, '相似公式混淆', '把横向伸缩写成了纵向伸缩'),
      distractor(
        r`y=\sin\left(x+\omega\right)`,
        '相似公式混淆',
        '把伸缩变换写成了平移变换'
      ),
      distractor(
        r`y=\sin\frac{x}{\omega}`,
        '分母或根号错误',
        '横坐标伸缩倍数的倒数关系写反了'
      )
    ]
  },

  C121: {
    type: 'reconstruct',
    stemLatex: r`\text{分层抽样的抽样比}=`,
    answerLatex: r`\frac{n}{N}`,
    distractors: [
      distractor(r`\frac{N}{n}`, '分母或根号错误', '把样本量与总体容量写反了'),
      distractor(r`\frac{n}{2N}`, '系数错误', '分母多写了系数 2'),
      distractor(r`\frac{2n}{N}`, '系数错误', '分子多写了系数 2')
    ]
  },

  C124: {
    type: 'reconstruct',
    stemLatex:
      r`i=n\times p\%\text{ 为整数时，第 }p\text{ 百分位数为}`,
    answerLatex: r`\frac{1}{2}\left(x_{(i)}+x_{(i+1)}\right)`,
    distractors: [
      distractor(
        r`x_{(i)}+x_{(i+1)}`,
        '系数错误',
        '相邻两项的平均数漏掉了系数 1/2'
      ),
      distractor(
        r`\frac{1}{2}\left(x_{(i-1)}+x_{(i)}\right)`,
        '系数错误',
        '相邻项的下标整体向前错了一位'
      ),
      distractor(
        r`x_{(i+1)}-x_{(i)}`,
        '符号错误',
        '百分位数不是相邻两项之差'
      )
    ]
  },

  C128: {
    type: 'reconstruct',
    stemLatex: r`A,B\text{ 为对立事件时，}P(A)=`,
    answerLatex: r`1-P(B)`,
    distractors: [
      distractor(r`P(B)-1`, '符号错误', '对立事件的概率差方向写反了'),
      distractor(r`1+P(B)`, '符号错误', '两项之间应为减号'),
      distractor(r`-P(B)`, '漏条件', '漏掉了概率和为 1 的常数项')
    ]
  },

  C135: {
    type: 'reconstruct',
    stemLatex: r`\vec a\parallel\vec b\Leftrightarrow`,
    answerLatex: r`x_1=\lambda x_2,\ y_1=\lambda y_2,\ z_1=\lambda z_2`,
    distractors: [
      distractor(
        r`x_1=\lambda x_2,\ y_1=\lambda y_2,\ z_1=\lambda^2 z_2`,
        '次数错误',
        'z 坐标的比例关系中多写了一次平方'
      ),
      distractor(
        r`x_1=\lambda y_2,\ y_1=\lambda x_2,\ z_1=\lambda z_2`,
        '相似公式混淆',
        '把两个向量的同名坐标交叉对应了'
      ),
      distractor(
        r`x_1=-\lambda x_2,\ y_1=\lambda y_2,\ z_1=\lambda z_2`,
        '符号错误',
        '只给 x 坐标的比例关系多加了负号'
      )
    ]
  },

  C139: {
    type: 'blank',
    stemLatex:
      r`l\parallel\alpha\Leftrightarrow\vec a\boxed{\phantom{\perp}}\vec u`,
    answerLatex: r`\perp`,
    distractors: [
      distractor(r`\parallel`, '相似公式混淆', '线面平行对应方向向量与法向量垂直'),
      distractor(r`\subset`, '符号错误', '向量之间不能用集合包含符号'),
      distractor(r`\cap`, '相似公式混淆', '方向向量与法向量应判断垂直关系')
    ]
  },

  C144: {
    type: 'reconstruct',
    stemLatex: r`\text{异面直线距离 }d=`,
    answerLatex: r`\frac{|\overrightarrow{AB}\cdot\vec n|}{|\vec n|}`,
    distractors: [
      distractor(
        r`\frac{|\overrightarrow{AB}\cdot\vec n|}{|\overrightarrow{AB}|}`,
        '分母或根号错误',
        '分母应使用公共法向量的模'
      ),
      distractor(
        r`\frac{|\overrightarrow{AB}\times\vec n|}{|\vec n|}`,
        '相似公式混淆',
        '平面向量使用了叉积符号'
      ),
      distractor(
        r`\frac{|\overrightarrow{AB}|}{|\vec n|}`,
        '漏条件',
        '分子必须保留在法向量上的投影'
      )
    ]
  },

  C148: {
    type: 'reconstruct',
    stemLatex: r`\text{斜率为 }k\text{、纵截距为 }b\text{ 的直线是}`,
    answerLatex: r`y=kx+b`,
    distractors: [
      distractor(r`y=bx+k`, '相似公式混淆', '把斜率与纵截距的位置写反了'),
      distractor(r`x=ky+b`, '相似公式混淆', '把斜截式与横截式混淆了'),
      distractor(r`y=kx-b`, '符号错误', '纵截距的符号写反了')
    ]
  },

  C151: {
    type: 'reconstruct',
    stemLatex: r`\text{过 }(a,0)\text{ 且不平行于 }x\text{ 轴的横截式是}`,
    answerLatex: r`x=my+a`,
    distractors: [
      distractor(r`y=mx+a`, '相似公式混淆', '把横截式与斜截式混淆了'),
      distractor(r`x=my-a`, '符号错误', '横截距 a 的符号写反了'),
      distractor(r`x=\frac{y}{m}+a`, '分母或根号错误', '斜率 m 与自变量的位置写错了')
    ]
  },

  C154: {
    type: 'reconstruct',
    stemLatex: r`l_1\parallel l_2\Leftrightarrow`,
    answerLatex: r`k_1=k_2\ (b_1\neq b_2)`,
    distractors: [
      distractor(
        r`k_1k_2=-1\ (b_1\neq b_2)`,
        '相似公式混淆',
        '把平行条件与垂直条件混淆了'
      ),
      distractor(
        r`k_1=k_2\ (b_1=b_2)`,
        '漏条件',
        '两条直线斜率与截距都相同时会重合'
      ),
      distractor(
        r`k_1\neq k_2\ (b_1\neq b_2)`,
        '符号错误',
        '平行要求斜率相等，不是不等'
      )
    ]
  },

  C159: {
    type: 'reconstruct',
    stemLatex: r`\text{与 }Ax+By+C=0\text{ 平行的直线系是}`,
    answerLatex: r`Ax+By+\lambda=0\ (\lambda\neq C)`,
    distractors: [
      distractor(
        r`Ax-By+\lambda=0\ (\lambda\neq C)`,
        '符号错误',
        'y 项系数的符号写反了'
      ),
      distractor(
        r`Ax+By+\lambda=0\ (\lambda=C)`,
        '漏条件',
        'lambda 等于 C 时会得到原直线'
      ),
      distractor(
        r`Bx+Ay+\lambda=0\ (\lambda\neq C)`,
        '相似公式混淆',
        '把 x 项与 y 项的系数互换了'
      )
    ]
  },

  C181: {
    type: 'reconstruct',
    stemLatex: r`\text{直线与双曲线恰有一个交点时，可能满足}`,
    answerLatex: r`\Delta=0\text{ 或直线平行于渐近线}`,
    distractors: [
      distractor(
        r`\Delta>0\text{ 或直线平行于渐近线}`,
        '符号错误',
        '相交且有两个交点时判别式大于零'
      ),
      distractor(
        r`\Delta=0\text{ 且直线平行于渐近线}`,
        '相似公式混淆',
        '相切与平行于渐近线是两种不同情形'
      ),
      distractor(
        r`\Delta<0\text{ 或直线平行于渐近线}`,
        '符号错误',
        '判别式小于零时直线与双曲线无交点'
      )
    ]
  },

  C191: {
    type: 'reconstruct',
    stemLatex: r`\text{等比数列的通项 }a_n=`,
    answerLatex: r`a_1q^{n-1}`,
    distractors: [
      distractor(r`a_1q^n`, '次数错误', '通项指数应为 n-1'),
      distractor(r`a_1+q^{n-1}`, '符号错误', '首项与公比之间应相乘，不是相加'),
      distractor(r`a_1q^{1-n}`, '系数错误', '指数的正负方向写反了')
    ]
  },

  C195: {
    type: 'reconstruct',
    stemLatex: r`\text{非零等比数列中，}a_{n-1}a_{n+1}=`,
    answerLatex: r`a_n^2`,
    distractors: [
      distractor(r`a_n`, '次数错误', '两个相邻项的乘积应等于中间项的平方'),
      distractor(r`2a_n`, '系数错误', '等比中项关系不是二倍关系'),
      distractor(r`a_{n-1}^2`, '系数错误', '等号右侧的项下标写错了')
    ]
  },

  C202: {
    type: 'reconstruct',
    stemLatex: r`a_{n+1}-a_n=f(n)\Rightarrow`,
    answerLatex: r`a_n=a_1+\sum_{k=1}^{n-1}f(k)`,
    distractors: [
      distractor(
        r`a_n=a_1+\sum_{k=1}^{n}f(k)`,
        '次数错误',
        '累加的上限多取了一项'
      ),
      distractor(
        r`a_n=a_1-\sum_{k=1}^{n-1}f(k)`,
        '符号错误',
        '累加项与首项之间应为加号'
      ),
      distractor(
        r`a_n=a_1+\sum_{k=1}^{n-1}f(n)`,
        '系数错误',
        '求和指标 k 错写成了固定端点 n'
      )
    ]
  },

  C203: {
    type: 'reconstruct',
    stemLatex: r`\frac{a_{n+1}}{a_n}=f(n)\Rightarrow`,
    answerLatex: r`a_n=a_1\prod_{k=1}^{n-1}f(k)`,
    distractors: [
      distractor(
        r`a_n=a_1\prod_{k=1}^{n}f(k)`,
        '次数错误',
        '累乘的上限多取了一项'
      ),
      distractor(
        r`a_n=a_1+\prod_{k=1}^{n-1}f(k)`,
        '符号错误',
        '首项与连乘结果之间应相乘'
      ),
      distractor(
        r`a_n=a_1\prod_{k=1}^{n-1}f(n)`,
        '系数错误',
        '连乘指标 k 错写成了固定端点 n'
      )
    ]
  },

  C209: {
    type: 'reconstruct',
    stemLatex:
      r`\text{曲线 }y=f(x)\text{ 在 }(x_0,f(x_0))\text{ 处的切线是}`,
    answerLatex: r`y=f'(x_0)(x-x_0)+f(x_0)`,
    distractors: [
      distractor(
        r`y=f'(x_0)(x+x_0)+f(x_0)`,
        '符号错误',
        '切线方程中的横坐标差写成了和'
      ),
      distractor(
        r`y=f(x_0)(x-x_0)+f'(x_0)`,
        '相似公式混淆',
        '把函数值与导数值的位置写反了'
      ),
      distractor(
        r`y=f'(x_0)(x-x_0)-f(x_0)`,
        '符号错误',
        '切点纵坐标前的符号写反了'
      )
    ]
  },

  C221: {
    type: 'reconstruct',
    stemLatex: r`n!=`,
    answerLatex: r`1\cdot2\cdot\cdots\cdot n`,
    distractors: [
      distractor(r`1+2+\cdots+n`, '符号错误', '把连乘误写成了连加'),
      distractor(r`2\cdot3\cdot\cdots\cdot n`, '系数错误', '漏掉了因子 1'),
      distractor(r`0\cdot1\cdot\cdots\cdot n`, '系数错误', '多写了会使整个乘积为零的因子 0')
    ]
  },

  C225: {
    type: 'reconstruct',
    stemLatex: r`C_n^m+C_n^{m-1}=`,
    answerLatex: r`C_{n+1}^m`,
    distractors: [
      distractor(r`C_n^{m+1}`, '系数错误', '递推公式的下标没有增加 1'),
      distractor(r`C_{n+1}^{m-1}`, '系数错误', '组合数的上标写错了'),
      distractor(r`C_{n-1}^m`, '符号错误', '组合数下标的变化方向写反了')
    ]
  },

  C228: {
    type: 'reconstruct',
    stemLatex: r`n\text{ 为偶数时，二项式系数最大的是}`,
    answerLatex: r`C_n^{n/2}`,
    distractors: [
      distractor(r`C_n^{(n-1)/2}`, '相似公式混淆', '把奇数情形下的中间项套用到了偶数情形'),
      distractor(r`C_n^{(n+1)/2}`, '相似公式混淆', '把奇数情形下的另一中间项套用了过来'),
      distractor(r`C_n^{n/2-1}`, '系数错误', '最大项的中间位置上标少写了 1')
    ]
  },

  C233: {
    type: 'reconstruct',
    stemLatex: r`A_1,\ldots,A_n\text{ 为完备事件组时，}P(B)=`,
    answerLatex: r`\sum_{i=1}^{n}P(A_i)P(B\mid A_i)`,
    distractors: [
      distractor(
        r`\sum_{i=1}^{n}P(A_i\mid B)P(B\mid A_i)`,
        '相似公式混淆',
        '全概率公式应使用先验概率 P(A_i)'
      ),
      distractor(
        r`\sum_{i=1}^{n}P(A_i)+P(B\mid A_i)`,
        '符号错误',
        '条件概率与先验概率之间应相乘而不是相加'
      ),
      distractor(
        r`\sum_{i=1}^{n-1}P(A_i)P(B\mid A_i)`,
        '漏条件',
        '求和范围漏掉了最后一种情形 A_n'
      )
    ]
  },

  C234: {
    type: 'reconstruct',
    stemLatex: r`P(A_j\mid B)=`,
    answerLatex:
      r`\frac{P(A_j)P(B\mid A_j)}{\sum_{i=1}^{n}P(A_i)P(B\mid A_i)}`,
    distractors: [
      distractor(
        r`\frac{P(A_j)P(B\mid A_j)}{\sum_{i=1}^{n}P(A_i)}`,
        '漏条件',
        '分母漏掉了条件概率 P(B\mid A_i)'
      ),
      distractor(
        r`\frac{P(A_j)P(B\mid A_j)}{\sum_{i=1}^{n}P(B\mid A_i)}`,
        '漏条件',
        '分母漏掉了先验概率 P(A_i)'
      ),
      distractor(
        r`\frac{P(B)P(A_j\mid B)}{\sum_{i=1}^{n}P(A_i)P(B\mid A_i)}`,
        '相似公式混淆',
        '分子把条件概率的条件和结果写反了'
      )
    ]
  },

  C236: {
    type: 'reconstruct',
    stemLatex: r`D(X)=`,
    answerLatex: r`\sum_{i=1}^n (x_i-E(X))^2 p_i`,
    distractors: [
      distractor(
        r`\sum_{i=1}^n (x_i-E(X)) p_i`,
        '次数错误',
        '随机变量偏离均值的平方漏写了指数 2'
      ),
      distractor(
        r`\sum_{i=1}^n (x_i-E(X))^2`,
        '漏条件',
        '期望公式漏掉了每个偏差平方对应的概率 p_i'
      ),
      distractor(
        r`\sum_{i=1}^n (x_i-E(X))^2 p_i^2`,
        '次数错误',
        '概率 p_i 被错误地平方了'
      )
    ]
  },

  C241: {
    type: 'reconstruct',
    stemLatex: r`X\sim H(N,n,M)\Rightarrow E(X)=`,
    answerLatex: r`\frac{nM}{N}`,
    distractors: [
      distractor(r`\frac{NM}{n}`, '分母或根号错误', '总体容量与样本量的位置写反了'),
      distractor(r`\frac{nN}{M}`, '分母或根号错误', '样本量与总体容量的位置写反了'),
      distractor(r`\frac{n+M}{N}`, '符号错误', '分子应相乘，不应相加')
    ]
  },

  C242: {
    type: 'reconstruct',
    stemLatex: r`X\sim N(\mu,\sigma^2)\Rightarrow`,
    answerLatex: r`E(X)=\mu,\ D(X)=\sigma^2`,
    distractors: [
      distractor(r`E(X)=\mu^2,\ D(X)=\sigma^2`, '次数错误', '均值多写了一次平方'),
      distractor(r`E(X)=\mu,\ D(X)=\sigma`, '次数错误', '方差漏写了平方'),
      distractor(r`E(X)=\sigma^2,\ D(X)=\mu`, '相似公式混淆', '把均值与方差的参数对应关系写反了')
    ]
  },

  C247: {
    type: 'reconstruct',
    stemLatex: r`\text{残差 }e_i=`,
    answerLatex: r`y_i-\hat y_i`,
    distractors: [
      distractor(r`\hat y_i-y_i`, '符号错误', '真实值与预报值的顺序写反了'),
      distractor(r`y_i+\hat y_i`, '符号错误', '残差应为真实值减预报值'),
      distractor(r`y_i\hat y_i`, '相似公式混淆', '残差不是两个观测值的乘积')
    ]
  },

  C248: {
    type: 'reconstruct',
    stemLatex: r`\text{残差平方和}=`,
    answerLatex: r`\sum_{i=1}^n (y_i-\hat y_i)^2`,
    distractors: [
      distractor(
        r`\sum_{i=1}^n (y_i-\hat y_i)`,
        '次数错误',
        '残差平方和漏掉了每一项的平方'
      ),
      distractor(
        r`\sum_{i=1}^n (y_i+\hat y_i)^2`,
        '符号错误',
        '真实值与预报值之间的符号写成了加号'
      ),
      distractor(
        r`\sum_{i=1}^n (y_i-\bar y)^2`,
        '相似公式混淆',
        '把残差平方和与总平方和混淆了'
      )
    ]
  },

  S012: {
    type: 'reconstruct',
    stemLatex: r`\log_a b\cdot\log_b c\cdot\log_c d=`,
    answerLatex: r`\log_a d`,
    distractors: [
      distractor(r`\log_d a`, '相似公式混淆', '把换底连乘后的首尾底真顺序写反了'),
      distractor(r`\log_a c`, '漏条件', '中间底数没有全部约去'),
      distractor(r`\log_b d`, '漏条件', '漏掉了最左侧对数的底数')
    ]
  },

  S022: {
    type: 'blank',
    stemLatex:
      r`S_{\triangle OBC}\overrightarrow{OA}+S_{\triangle OAC}\overrightarrow{OB}+\boxed{\phantom{S_{\triangle OAB}\overrightarrow{OC}}}=\vec 0`,
    answerLatex: r`S_{\triangle OAB}\overrightarrow{OC}`,
    distractors: [
      distractor(
        r`S_{\triangle OAC}\overrightarrow{OC}`,
        '相似公式混淆',
        '第三个系数应取 OC 所对三角形的面积'
      ),
      distractor(
        r`S_{\triangle OAB}\overrightarrow{OA}`,
        '系数错误',
        '面积系数与向量的对应关系写错了'
      ),
      distractor(
        r`S_{\triangle ABC}\overrightarrow{OC}`,
        '相似公式混淆',
        '系数不应使用整个三角形的面积'
      )
    ]
  },

  S027: {
    type: 'reconstruct',
    stemLatex: r`\text{原图形面积 }S\text{、射影面积 }S'\text{，则 }\cos\theta=`,
    answerLatex: r`\frac{S'}{S}`,
    distractors: [
      distractor(r`\frac{S}{S'}`, '分母或根号错误', '原图形面积与射影面积写反了'),
      distractor(r`\frac{S-S'}{S}`, '漏条件', '面积射影定理不含面积差'),
      distractor(r`\frac{S'}{2S}`, '系数错误', '分母多写了系数 2')
    ]
  },

  S030: {
    type: 'reconstruct',
    stemLatex: r`\text{四面体体积 }V\text{、全面积 }S\text{，内切球半径 }r=`,
    answerLatex: r`\frac{3V}{S}`,
    distractors: [
      distractor(r`\frac{V}{3S}`, '系数错误', '分子中的系数 3 写错了位置'),
      distractor(r`\frac{3S}{V}`, '分母或根号错误', '体积与面积的位置写反了'),
      distractor(r`\frac{S}{3V}`, '分母或根号错误', '分子分母同时写反了')
    ]
  },

  S094: {
    type: 'reconstruct',
    stemLatex: r`\text{抛物线 }y^2=2px\text{ 的通径 }|MN|=`,
    answerLatex: r`2p`,
    distractors: [
      distractor(r`p`, '系数错误', '通径公式漏掉了系数 2'),
      distractor(r`4p`, '系数错误', '通径公式的系数误写成了 4'),
      distractor(r`\frac{p}{2}`, '分母或根号错误', '把通径误写成了 p 的一半')
    ]
  },

  S096: {
    type: 'reconstruct',
    stemLatex:
      r`\text{抛物线 }y^2=2px\text{ 的焦点弦 }AB\text{，}|AB|=`,
    answerLatex: r`x_1+x_2+p`,
    distractors: [
      distractor(r`x_1+x_2-p`, '符号错误', '焦点弦长中的 p 符号写反了'),
      distractor(r`x_1-x_2+p`, '符号错误', '两个端点的 x 坐标应相加'),
      distractor(r`2(x_1+x_2)+p`, '系数错误', '两个端点横坐标之和前多写了系数 2')
    ]
  },

  S103: {
    type: 'reconstruct',
    stemLatex: r`\text{抛物线焦点弦中，}|RF|=`,
    answerLatex: r`\frac12|MN|=\frac14|AB|`,
    distractors: [
      distractor(
        r`\frac12|MN|=\frac12|AB|`,
        '系数错误',
        '焦点到 R 的距离应等于 |AB| 的四分之一，不是二分之一'
      ),
      distractor(
        r`\frac14|MN|=\frac14|AB|`,
        '系数错误',
        '等式前半段的系数应为二分之一'
      ),
      distractor(
        r`\frac14|MN|=\frac12|AB|`,
        '系数错误',
        '两个系数同时写错了'
      )
    ]
  }
}
