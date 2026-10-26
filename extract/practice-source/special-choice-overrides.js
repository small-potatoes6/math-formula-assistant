const r = String.raw

function distractor(latex, errorKind, error) {
  return { latex, errorKind, error }
}

module.exports = {
  C006: {
    type: 'condition',
    stemLatex: r`p\Rightarrow q\text{ 且 }q\Rightarrow p\text{ 时，}p\text{ 是 }q\text{ 的}`,
    answerLatex: r`\text{充要条件}`,
    distractors: [
      distractor(r`\text{充分不必要条件}`, '漏条件', '同时能反向推出时，不只充分且不必要'),
      distractor(r`\text{必要不充分条件}`, '漏条件', '同时能正向推出时，不只必要且不充分'),
      distractor(r`\text{既不充分也不必要条件}`, '相似公式混淆', '把双向推出误判成不能推出')
    ]
  },

  C009: {
    type: 'blank',
    stemLatex: r`\bigl||a|-|b|\bigr|\leq|a-b|\leq\boxed{\phantom{|a|+|b|}}`,
    answerLatex: r`|a|+|b|`,
    distractors: [
      distractor(r`|a|-|b|`, '符号错误', '右侧应是两个模长之和'),
      distractor(r`|a+b|`, '相似公式混淆', '把向量的三角不等式混入了实数绝对值'),
      distractor(r`\bigl||a|+|b|\bigr|`, '其他', '外层绝对值多余，且不符合最右端的标准形式')
    ]
  },

  C010: {
    type: 'blank',
    stemLatex: r`a>0,\ b>0\text{ 时，}a+b\geq2\cdot\boxed{\phantom{\sqrt{ab}}}`,
    answerLatex: r`\sqrt{ab}`,
    distractors: [
      distractor(r`ab`, '分母或根号错误', '漏掉了根号'),
      distractor(r`\sqrt{a+b}`, '相似公式混淆', '根号内应是两个数的乘积'),
      distractor(r`\frac{a+b}{2}`, '相似公式混淆', '把乘积的平方根误写成了算术平均数')
    ]
  },

  C011: {
    type: 'reconstruct',
    stemLatex: r`a^2+b^2\geq`,
    answerLatex: r`2ab`,
    distractors: [
      distractor(r`ab`, '系数错误', '漏掉了系数 2'),
      distractor(r`-2ab`, '符号错误', '平方和不可能总大于等于负数项'),
      distractor(r`(a+b)^2`, '相似公式混淆', '右侧把平方和与完全平方公式混用了')
    ]
  },

  C012: {
    type: 'blank',
    stemLatex: r`a>0,\ b>0\text{ 时，}\sqrt{ab}\leq\boxed{\phantom{\frac{a+b}{2}}}\leq\sqrt{\frac{a^2+b^2}{2}}`,
    answerLatex: r`\frac{a+b}{2}`,
    distractors: [
      distractor(r`\frac{2ab}{a+b}`, '相似公式混淆', '这是调和平均数，不是两数的算术平均数'),
      distractor(r`\frac{2}{a+b}`, '分母或根号错误', '把算术平均数写成了倒数关系'),
      distractor(r`\frac{a^2+b^2}{2}`, '次数错误', '中间项没有开根号，次数与原式不一致')
    ]
  },

  C015: {
    type: 'condition',
    stemLatex: r`a>b>0,\ a>m>0\text{ 时，下列糖水不等式正确的是}`,
    answerLatex: r`\frac{b-m}{a-m}<\frac{b}{a}<\frac{b+m}{a+m}`,
    distractors: [
      distractor(
        r`\frac{b-m}{a-m}>\frac{b}{a}>\frac{b+m}{a+m}`,
        '符号错误',
        '两个不等号方向都写反了'
      ),
      distractor(
        r`\frac{b+m}{a+m}<\frac{b}{a}<\frac{b-m}{a-m}`,
        '符号错误',
        '把加糖与减糖后的浓度大小关系颠倒了'
      ),
      distractor(
        r`\frac{b-m}{a-m}<\frac{b}{a}<\frac{b-m}{a-m}`,
        '相似公式混淆',
        '两端用了同一个分式，没有体现加糖后的变化'
      )
    ]
  },

  C216: {
    type: 'condition',
    stemLatex: r`x>0\text{ 时，下列指对不等式链正确的是}`,
    answerLatex: r`e^x\geq x+1,\quad \ln(x+1)\leq x,\quad \ln x\leq x-1`,
    distractors: [
      distractor(
        r`e^x\leq x+1,\quad \ln(x+1)\leq x,\quad \ln x\leq x-1`,
        '符号错误',
        '把指数不等式的不等号方向写反了'
      ),
      distractor(
        r`e^x\geq x+1,\quad \ln(x+1)\geq x,\quad \ln x\leq x-1`,
        '符号错误',
        '把 ln(x+1) 与 x 的大小关系写反了'
      ),
      distractor(
        r`e^x\geq x+1,\quad \ln(x+1)\leq x,\quad \ln x\geq x-1`,
        '符号错误',
        '把 ln x 与 x-1 的大小关系写反了'
      )
    ]
  },

  C243: {
    type: 'blank',
    stemLatex:
      r`X\sim N(\mu,\sigma^2)\Rightarrow P(\mu-\sigma<X<\mu+\sigma)\approx\boxed{\phantom{0.6827}}`,
    answerLatex: r`0.6827`,
    distractors: [
      distractor(r`0.9545`, '系数错误', '误用了 2σ 对应的概率'),
      distractor(r`0.9973`, '系数错误', '误用了 3σ 对应的概率'),
      distractor(r`\frac12`, '漏条件', '没有体现正态分布区间概率，只写了中心概率')
    ]
  },

  C251: {
    type: 'reconstruct',
    stemLatex: r`\text{相关系数 }r\text{ 的取值范围是 }r\in`,
    answerLatex: r`[-1,1]`,
    distractors: [
      distractor(r`[0,1]`, '相似公式混淆', '把相关系数与决定系数的范围混用了'),
      distractor(r`(0,1]`, '漏条件', '遗漏了负相关时相关系数小于 0 的情形'),
      distractor(r`[-1,0)`, '漏条件', '遗漏了正相关时相关系数大于 0 的情形')
    ]
  },

  S015: {
    type: 'blank',
    stemLatex:
      r`\bigl||\vec a|-|\vec b|\bigr|\leq\boxed{\phantom{|\vec a+\vec b|}}\leq|\vec a|+|\vec b|`,
    answerLatex: r`|\vec a+\vec b|`,
    distractors: [
      distractor(r`|\vec a-\vec b|`, '符号错误', '中间向量与右侧和向量的关系不匹配'),
      distractor(r`|\vec a|+|\vec b|`, '相似公式混淆', '把右侧上界直接放到了中项'),
      distractor(r`|\vec a|-|\vec b|`, '分母或根号错误', '漏掉了中项的绝对值')
    ]
  },

  S059: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆上点 }P\text{ 满足 }|PF_1|\cdot|PF_2|\in`,
    answerLatex: r`[b^2,a^2]`,
    distractors: [
      distractor(r`(b^2,a^2)`, '漏条件', '漏掉了能取到两个端点值'),
      distractor(r`[a^2,b^2]`, '符号错误', '区间端点大小顺序写反了'),
      distractor(r`[b^2-c^2,a^2-c^2]`, '相似公式混淆', '误用了焦点向量的点积范围')
    ]
  },

  S060: {
    type: 'reconstruct',
    stemLatex: r`\text{椭圆上点 }P\text{ 满足 }\overrightarrow{PF_1}\cdot\overrightarrow{PF_2}\in`,
    answerLatex: r`[b^2-c^2,a^2-c^2]`,
    distractors: [
      distractor(r`[b^2,a^2]`, '相似公式混淆', '把焦半径乘积范围误当成点积范围'),
      distractor(r`(b^2-c^2,a^2-c^2)`, '漏条件', '漏掉了两个端点值'),
      distractor(r`[-b^2,a^2]`, '系数错误', '左端点的参数关系写错了')
    ]
  },

  S076: {
    type: 'reconstruct',
    stemLatex: r`F\text{ 为双曲线左焦点时，}|PF|\in`,
    answerLatex: r`[c-a,+\infty)`,
    distractors: [
      distractor(r`(c-a,+\infty)`, '漏条件', '漏掉了最近点处能取到等号'),
      distractor(r`[c+a,+\infty)`, '相似公式混淆', '把左焦点误当成右焦点'),
      distractor(r`(0,+\infty)`, '漏条件', '没有使用双曲线的参数限制')
    ]
  },

  S080: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线上点 }P\text{ 满足 }|PF_1|\cdot|PF_2|\in`,
    answerLatex: r`[b^2,+\infty)`,
    distractors: [
      distractor(r`(b^2,+\infty)`, '漏条件', '漏掉了乘积能取到最小值 b²'),
      distractor(r`[0,+\infty)`, '漏条件', '没有使用双曲线的参数下界'),
      distractor(r`[b^2,a^2]`, '相似公式混淆', '把椭圆中的焦半径乘积范围套用了过来')
    ]
  },

  S081: {
    type: 'reconstruct',
    stemLatex: r`\text{双曲线上点 }P\text{ 满足 }\overrightarrow{PF_1}\cdot\overrightarrow{PF_2}\in`,
    answerLatex: r`[-b^2,+\infty)`,
    distractors: [
      distractor(r`[b^2,+\infty)`, '符号错误', '焦点向量点积的最小值应为负值'),
      distractor(r`(-b^2,+\infty)`, '漏条件', '漏掉了最小值处能取到等号'),
      distractor(r`[-a^2,+\infty)`, '系数错误', '最小值的参数用错了')
    ]
  }
}
