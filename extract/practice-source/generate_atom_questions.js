/*
 * Incrementally add one four-choice question for every uncovered formula atom.
 *
 * Existing base and demo questions are kept. This script only replaces its own
 * authoring="atom-auto" questions, assigns real atom IDs to the existing bank,
 * then fills the remaining atom gaps. Run with --apply to write the result.
 */

const fs = require('fs')
const path = require('path')

const {
  buildFormulaAtoms,
  rankQuestionAtoms
} = require('./formula-atoms')
const {
  assertQuestionQuality,
  buildBlankDrafts,
  buildMutations,
  chooseDistractors,
  normalizeLatex,
  normalizeOptionLatex,
  normalizeQuestionOptions
} = require('../generate_practice_questions')

const ROOT = path.resolve(__dirname, '../..')
const FORMULAS_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json')
const QUESTIONS_PATH = path.join(__dirname, 'questions.json')
const DEMO_PATH = path.join(__dirname, 'demo-questions.json')
const REPORT_PATH = path.join(ROOT, 'extract/build/practice-atom-generation-report.json')

const ERROR_KINDS = [
  '符号错误',
  '系数错误',
  '次数错误',
  '分母或根号错误',
  '漏条件',
  '相似公式混淆'
]

// Composite legacy questions intentionally cover one representative atom. The
// remaining atoms in those formulas receive their own questions below.
const BASE_ATOM_OVERRIDES = {
  'P-C002-01': 'C002-atom-ec81681668',
  'P-C031-01': 'C031-atom-fc10002f7e',
  'P-C032-01': 'C032-atom-281d41fbf2',
  'P-C042-01': 'C042-atom-c8fbbd5504',
  'P-C049-01': 'C049-atom-9a2eda32af',
  'P-C054-01': 'C054-atom-975e9242d8',
  'P-C061-01': 'C061-atom-5af817f0c1',
  'P-C063-01': 'C063-atom-86577255a0',
  'P-C153-01': 'C153-atom-63c1d93071',
  'P-C183-01': 'C183-atom-e4db4c969b'
}

// The demos are authored before atom IDs were stable. Keep their exact mapping
// explicit so a parser change can never silently move a demo to another atom.
const DEMO_ATOM_OVERRIDES = {
  'P-C002-02': 'C002-atom-7d22fcf436',
  'P-C002-03': 'C002-atom-8b73bbc5f6',
  'P-C007-02': 'C007-atom-4487847016',
  'P-C007-03': 'C007-atom-4487847016',
  'P-C007-04': 'C007-atom-a03d52bcbc',
  'P-C007-05': 'C007-atom-b7d12a9ccc',
  'P-C007-06': 'C007-atom-4487847016',
  'P-C007-07': 'C007-atom-4487847016',
  'P-C035-02': 'C035-atom-224e89799b',
  'P-C035-03': 'C035-atom-0ba8e3be7e',
  'P-C035-04': 'C035-atom-3f7e197675',
  'P-C035-05': 'C035-atom-cbf35fb9ea',
  'P-C042-02': 'C042-atom-1cf445000c',
  'P-C042-03': 'C042-atom-1fbe0680e7',
  'P-C042-04': 'C042-atom-80bc3b30a9',
  'P-C042-05': 'C042-atom-5ee577b97e',
  'P-C058-02': 'C058-atom-1389a6214e',
  'P-C058-03': 'C058-atom-1389a6214e',
  'P-C058-04': 'C058-atom-a34266726d',
  'P-C058-05': 'C058-atom-7947f3554b',
  'P-C059-02': 'C059-atom-dfa554ec63',
  'P-C059-03': 'C059-atom-1cc840f0f3',
  'P-C059-04': 'C059-atom-1cc840f0f3',
  'P-C059-05': 'C059-atom-b8edf26e61',
  'P-S044-02': 'S044-atom-af6d8901a0',
  'P-S044-03': 'S044-atom-af6d8901a0',
  'P-S045-02': 'S045-atom-a05bc7cb8f',
  'P-S045-03': 'S045-atom-26d7a415e9',
  'P-S045-04': 'S045-atom-9fef69b400',
  'P-S045-05': 'S045-atom-6820ea3b75'
}

// A few atoms are either too short for generic mutations or contain a
// repeated equality where a mechanically swapped side can remain true. Keep
// their distractors explicit so every option is unambiguous and balanced.
const ATOM_QUESTION_OVERRIDES = {
  'C072-atom-ec838fa78d': {
    type: 'condition',
    stemLatex: '\\text{向量加法的三角形法则是}',
    answerLatex: '\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}',
    distractors: [
      {
        latex: '\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{CA}',
        errorKind: '符号错误',
        error: '把结果向量的方向写反了'
      },
      {
        latex: '\\overrightarrow{AB}-\\overrightarrow{BC}=\\overrightarrow{AC}',
        errorKind: '相似公式混淆',
        error: '把向量加法写成了向量减法'
      },
      {
        latex: '\\overrightarrow{BA}+\\overrightarrow{BC}=\\overrightarrow{AC}',
        errorKind: '符号错误',
        error: '把第一个向量的起点和终点写反了'
      }
    ]
  },
  'C073-atom-7ad0032469': {
    type: 'condition',
    stemLatex: '\\text{向量减法的三角形法则是}',
    answerLatex: '\\overrightarrow{AC}-\\overrightarrow{AB}=\\overrightarrow{BC}',
    distractors: [
      {
        latex: '\\overrightarrow{AC}-\\overrightarrow{AB}=\\overrightarrow{CB}',
        errorKind: '符号错误',
        error: '把结果向量的方向写反了'
      },
      {
        latex: '\\overrightarrow{AC}+\\overrightarrow{AB}=\\overrightarrow{BC}',
        errorKind: '相似公式混淆',
        error: '把向量减法写成了向量加法'
      },
      {
        latex: '\\overrightarrow{AB}-\\overrightarrow{AC}=\\overrightarrow{BC}',
        errorKind: '符号错误',
        error: '把被减向量与减向量的顺序写反了'
      }
    ]
  },
  'C082-atom-90234e424c': {
    type: 'condition',
    stemLatex: '\\text{若 }P\\text{ 为 }\\triangle ABC\\text{ 的外心，则}',
    answerLatex:
      '|\\overrightarrow{PA}|=|\\overrightarrow{PB}|=|\\overrightarrow{PC}|',
    distractors: [
      {
        latex:
          '|\\overrightarrow{PA}|=|\\overrightarrow{PB}|=|\\overrightarrow{AB}|',
        errorKind: '相似公式混淆',
        error: '把顶点到外心的距离与三角形的边混淆了'
      },
      {
        latex:
          '|\\overrightarrow{PA}|=|\\overrightarrow{PB}|=|\\overrightarrow{AC}|',
        errorKind: '相似公式混淆',
        error: '把顶点到外心的距离与三角形的边混淆了'
      },
      {
        latex:
          '\\overrightarrow{PA}=\\overrightarrow{PB}=\\overrightarrow{PC}',
        errorKind: '相似公式混淆',
        error: '把长度相等误写成了向量相等'
      }
    ]
  },
  'C082-atom-77d74d5ba0': {
    type: 'condition',
    stemLatex: '\\text{若 }P\\text{ 为 }\\triangle ABC\\text{ 的垂心，则}',
    answerLatex:
      '\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=' +
      '\\overrightarrow{PA}\\cdot\\overrightarrow{PC}=' +
      '\\overrightarrow{PB}\\cdot\\overrightarrow{PC}',
    distractors: [
      {
        latex:
          '\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=' +
          '\\overrightarrow{PA}\\cdot\\overrightarrow{PC}=' +
          '\\overrightarrow{AB}\\cdot\\overrightarrow{AC}',
        errorKind: '相似公式混淆',
        error: '把垂心的向量关系与顶角两边的关系混淆了'
      },
      {
        latex:
          '\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=' +
          '\\overrightarrow{PA}\\cdot\\overrightarrow{PC}=' +
          '\\overrightarrow{PB}+\\overrightarrow{PC}',
        errorKind: '相似公式混淆',
        error: '把数量积的相等关系误写成了向量加法'
      },
      {
        latex:
          '\\overrightarrow{PA}\\cdot\\overrightarrow{PB}=' +
          '\\overrightarrow{PB}\\cdot\\overrightarrow{PC}=' +
          '\\overrightarrow{PC}\\cdot\\overrightarrow{AB}',
        errorKind: '符号错误',
        error: '最后一项错误地换成了与对边有关的数量积'
      }
    ]
  },
  'C122-atom-3b5cd27104': {
    type: 'condition',
    stemLatex: '\\text{频率分布直方图中，小长方形的面积等于}',
    answerLatex: '\\text{频率}',
    distractors: [
      {
        latex: '\\text{频数}',
        errorKind: '相似公式混淆',
        error: '把频率与频数混淆了'
      },
      {
        latex: '\\frac{\\text{频率}}{\\text{组距}}',
        errorKind: '分母或根号错误',
        error: '误把小长方形的高当成了面积'
      },
      {
        latex: '\\frac{\\text{频数}}{\\text{组距}}',
        errorKind: '相似公式混淆',
        error: '用频数代替频率计算了小长方形面积'
      }
    ]
  },
  'C196-atom-e47da01c78': {
    type: 'condition',
    stemLatex: '\\text{等差数列中，若下标成等差数列，则对应项的公差为}',
    answerLatex: 'md',
    distractors: [
      {
        latex: 'd',
        errorKind: '系数错误',
        error: '漏掉了下标之间的倍数 m'
      },
      {
        latex: 'm+d',
        errorKind: '系数错误',
        error: '把倍数关系误写成了加法'
      },
      {
        latex: '2md',
        errorKind: '系数错误',
        error: '把公差前的系数写成了 2m'
      }
    ]
  },
  'S019-atom-8120f485d6': {
    type: 'condition',
    stemLatex: '\\text{若 }O\\text{ 为 }\\triangle ABC\\text{ 的外心，则}',
    answerLatex:
      '|\\overrightarrow{OA}|=|\\overrightarrow{OB}|=|\\overrightarrow{OC}|',
    distractors: [
      {
        latex:
          '|\\overrightarrow{OA}|=|\\overrightarrow{OB}|=|\\overrightarrow{AB}|',
        errorKind: '相似公式混淆',
        error: '把顶点到外心的距离与三角形的边混淆了'
      },
      {
        latex:
          '|\\overrightarrow{OA}|=|\\overrightarrow{OB}|=|\\overrightarrow{AC}|',
        errorKind: '相似公式混淆',
        error: '把顶点到外心的距离与三角形的边混淆了'
      },
      {
        latex:
          '\\overrightarrow{OA}=\\overrightarrow{OB}=\\overrightarrow{OC}',
        errorKind: '相似公式混淆',
        error: '把长度相等误写成了向量相等'
      }
    ]
  },
  'S020-atom-57cd9aa0e6': {
    type: 'condition',
    stemLatex: '\\text{若 }O\\text{ 为 }\\triangle ABC\\text{ 的垂心，则}',
    answerLatex:
      '\\overrightarrow{OA}\\cdot\\overrightarrow{OB}=' +
      '\\overrightarrow{OB}\\cdot\\overrightarrow{OC}=' +
      '\\overrightarrow{OC}\\cdot\\overrightarrow{OA}',
    distractors: [
      {
        latex:
          '\\overrightarrow{OA}\\cdot\\overrightarrow{OB}=' +
          '\\overrightarrow{OB}\\cdot\\overrightarrow{OC}=' +
          '\\overrightarrow{AB}\\cdot\\overrightarrow{AC}',
        errorKind: '相似公式混淆',
        error: '最后一项错误地换成了顶角两边的关系'
      },
      {
        latex:
          '\\overrightarrow{OA}\\cdot\\overrightarrow{OB}=' +
          '\\overrightarrow{OB}\\cdot\\overrightarrow{OC}=' +
          '\\overrightarrow{OC}+\\overrightarrow{OA}',
        errorKind: '相似公式混淆',
        error: '把数量积的相等关系误写成了向量加法'
      },
      {
        latex:
          '\\overrightarrow{OA}\\cdot\\overrightarrow{OB}=' +
          '\\overrightarrow{OB}\\cdot\\overrightarrow{OC}=' +
          '\\overrightarrow{BC}\\cdot\\overrightarrow{CA}',
        errorKind: '符号错误',
        error: '最后一项错误地换成了另外两条边'
      }
    ]
  },
  'S104-atom-e6bd4f4dc2': {
    type: 'condition',
    stemLatex:
      '\\text{抛物线焦点弦 }AB\\text{ 中，若 }P\\text{ 为准线与 }x\\text{ 轴交点，}F\\text{ 为焦点，则}',
    answerLatex:
      'CF\\text{ 平分}\\angle AFP,\\ DF\\text{ 平分}\\angle BFP',
    distractors: [
      {
        latex:
          'CF\\text{ 平分}\\angle BFP,\\ DF\\text{ 平分}\\angle AFP',
        errorKind: '相似公式混淆',
        error: '把两条角平分线对应的顶点写反了'
      },
      {
        latex:
          'CF\\text{ 平分}\\angle PAF,\\ DF\\text{ 平分}\\angle PBF',
        errorKind: '相似公式混淆',
        error: '把焦点处的角误写成了端点处的角'
      },
      {
        latex:
          'CF\\text{ 不平分}\\angle AFP,\\ DF\\text{ 不平分}\\angle BFP',
        errorKind: '漏条件',
        error: '漏掉了焦点弦带来的角平分线结论'
      }
    ]
  },
  'C040-atom-715f3bf1c1': {
    type: 'reconstruct',
    stemLatex: '\\sqrt[n]{ab}=',
    answerLatex: '\\sqrt[n]{a}\\cdot\\sqrt[n]{b}',
    distractors: [
      {
        latex: '\\sqrt[n]{a}+\\sqrt[n]{b}',
        errorKind: '符号错误',
        error: '把两个根式之间的乘法写成了加法'
      },
      {
        latex: '\\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}',
        errorKind: '相似公式混淆',
        error: '把积的算术根误写成了两个根式的商'
      },
      {
        latex: '\\sqrt[n]{a}\\cdot\\sqrt[a]{b}',
        errorKind: '分母或根号错误',
        error: '把第二个根式的根指数写错了'
      }
    ]
  },
  'C061-atom-e84d0a0f02': {
    type: 'condition',
    stemLatex: '\\text{正切函数 }y=\\tan x\\text{ 的值域是}',
    answerLatex: '\\mathbf{R}',
    distractors: [
      {
        latex: '\\mathbf{Z}',
        errorKind: '相似公式混淆',
        error: '把实数集与整数集混淆了'
      },
      {
        latex: '[-1,1]',
        errorKind: '相似公式混淆',
        error: '误用了正弦函数与余弦函数的值域'
      },
      {
        latex: '(0,+\\infty)',
        errorKind: '相似公式混淆',
        error: '只保留了正切函数的一部分取值'
      }
    ]
  },
  'C062-atom-5b06a0205b': {
    type: 'reconstruct',
    stemLatex: 'y=A\\sin(\\omega x+\\varphi)\\text{ 为奇函数时，}\\varphi=',
    answerLatex: 'k\\pi',
    distractors: [
      {
        latex: '\\frac{k\\pi}{2}',
        errorKind: '系数错误',
        error: '把奇函数对应的相位间隔写小了一半'
      },
      {
        latex: '2k\\pi',
        errorKind: '系数错误',
        error: '漏掉了其他的奇函数相位情形'
      },
      {
        latex: 'k\\pi+\\frac{\\pi}{2}',
        errorKind: '相似公式混淆',
        error: '把正弦型函数的奇偶性条件写反了'
      }
    ]
  },
  'C099-atom-eed343794d': {
    type: 'condition',
    stemLatex: '\\text{斜二测画法中，原图形与直观图的长度关系是}',
    answerLatex:
      'x\\text{ 轴方向长度不变},\\quad y\\text{ 轴方向长度减半}',
    distractors: [
      {
        latex:
          'x\\text{ 轴方向长度减半},\\quad y\\text{ 轴方向长度不变}',
        errorKind: '相似公式混淆',
        error: '把 x 轴与 y 轴方向的长度变化写反了'
      },
      {
        latex:
          'x\\text{ 轴方向长度不变},\\quad y\\text{ 轴方向长度不变}',
        errorKind: '漏条件',
        error: '漏掉了 y 轴方向长度减半的规则'
      },
      {
        latex:
          'x\\text{ 轴方向长度减半},\\quad y\\text{ 轴方向长度减半}',
        errorKind: '系数错误',
        error: '错把 x 轴方向的长度也缩小了一半'
      }
    ]
  },
  'C103-atom-7f3dd627db': {
    type: 'condition',
    stemLatex: '\\text{证明线线平行常用的依据是}',
    answerLatex: '\\text{同位角、内错角、同旁内角、中位线}',
    distractors: [
      {
        latex: '\\text{同位角、外错角、同旁内角、中位线}',
        errorKind: '相似公式混淆',
        error: '把内错角误写成了外错角'
      },
      {
        latex: '\\text{同位角、内错角、同旁外角、中位线}',
        errorKind: '相似公式混淆',
        error: '把同旁内角误写成了同旁外角'
      },
      {
        latex: '\\text{同位角、内错角、同旁内角、中垂线}',
        errorKind: '相似公式混淆',
        error: '把中位线误写成了中垂线'
      }
    ]
  },
  'C145-atom-2fd40bfb79': {
    type: 'reconstruct',
    stemLatex: 'B\\in',
    answerLatex: '\\alpha,\\ \\vec{n}\\perp\\alpha',
    distractors: [
      {
        latex: '\\alpha,\\ \\vec{n}\\parallel\\alpha',
        errorKind: '相似公式混淆',
        error: '把平面的法向量误写成了平行向量'
      },
      {
        latex: '\\alpha,\\ \\vec{n}\\perp\\beta',
        errorKind: '相似公式混淆',
        error: '把法向量垂直的平面写成了另一个平面'
      },
      {
        latex: '\\beta,\\ \\vec{n}\\perp\\alpha',
        errorKind: '相似公式混淆',
        error: '把平面上的点误写到了另一个平面上'
      }
    ]
  },
  'C179-atom-dd7d14382d': {
    type: 'condition',
    stemLatex: '\\text{焦点在 }x\\text{ 轴上的双曲线焦半径公式是}',
    answerLatex:
      '|PF_{1}|=|ex_{0}+a|,\\ |PF_{2}|=|ex_{0}-a|',
    distractors: [
      {
        latex:
          '|PF_{1}|=|ex_{0}-a|,\\ |PF_{2}|=|ex_{0}-a|',
        errorKind: '符号错误',
        error: '第二个焦半径的正负号也写成了减号'
      },
      {
        latex:
          '|PF_{0}|=|ex_{0}+a|,\\ |PF_{2}|=|ex_{0}-a|',
        errorKind: '系数错误',
        error: '把第一个焦点编号写错了'
      },
      {
        latex:
          '|PF_{1}|=|ex_{0}+a|,\\ |PF_{2}|=|ex_{0}+a|',
        errorKind: '符号错误',
        error: '第二个焦半径的正负号也写成了加号'
      }
    ]
  },
  'C201-atom-028cc7d86a': {
    type: 'reconstruct',
    stemLatex: '\\frac{1}{\\sqrt{n}+\\sqrt{n+1}}=',
    answerLatex: '\\sqrt{n+1}-\\sqrt{n}',
    distractors: [
      {
        latex: '\\sqrt{n-1}-\\sqrt{n}',
        errorKind: '次数错误',
        error: '根号内的下标写错了'
      },
      {
        latex: '\\sqrt{n+2}-\\sqrt{n}',
        errorKind: '次数错误',
        error: '根号内的常数写错了'
      },
      {
        latex: '\\sqrt{n+1}+\\sqrt{n}',
        errorKind: '符号错误',
        error: '有理化后的两项之间应相减'
      }
    ]
  },
  'S037-atom-4278cfcc22': {
    type: 'condition',
    stemLatex:
      '\\text{等差数列 }\\{a_n\\}\\text{ 的前 }n\\text{ 项和为 }S_n\\text{，则}',
    answerLatex:
      '\\left\\lbrace\\frac{S_n}{n}\\right\\rbrace\\text{ 成公差 }\\frac d2\\text{ 的等差数列}',
    distractors: [
      {
        latex:
          '\\left\\lbrace\\frac{n}{S_n}\\right\\rbrace\\text{ 成公差 }\\frac d2\\text{ 的等差数列}',
        errorKind: '分母或根号错误',
        error: '把数列的通项分子和分母写反了'
      },
      {
        latex:
          '\\left\\lbrace\\frac{a_n}{n}\\right\\rbrace\\text{ 成公差 }\\frac d2\\text{ 的等差数列}',
        errorKind: '相似公式混淆',
        error: '把前 n 项和误写成了第 n 项'
      },
      {
        latex:
          '\\left\\lbrace\\frac{S_n}{n}\\right\\rbrace\\text{ 成公差 }\\frac d3\\text{ 的等差数列}',
        errorKind: '系数错误',
        error: '把新等差数列的公差系数写错了'
      }
    ]
  },
  'S056-atom-7343b2f473': {
    type: 'condition',
    stemLatex: '\\text{焦点在 }y\\text{ 轴上的椭圆焦半径公式是}',
    answerLatex: '|PF_1|=a+ey_0,\\ |PF_2|=a-ey_0',
    distractors: [
      {
        latex: '|PF_1|=a-ey_0,\\ |PF_2|=a-ey_0',
        errorKind: '符号错误',
        error: '第一个焦半径的正负号写反了'
      },
      {
        latex: '|PF_0|=a+ey_0,\\ |PF_2|=a-ey_0',
        errorKind: '系数错误',
        error: '把第一个焦点编号写错了'
      },
      {
        latex: '|PF_1|=a+ex_0,\\ |PF_2|=a-ex_0',
        errorKind: '相似公式混淆',
        error: '误用了焦点在 x 轴时的焦半径公式'
      }
    ]
  },
  'S078-atom-9c83e8fa45': {
    type: 'condition',
    stemLatex: '\\text{焦点在 }y\\text{ 轴上的双曲线焦半径公式是}',
    answerLatex:
      '|PF_1|=|ey_0+a|,\\ |PF_2|=|ey_0-a|',
    distractors: [
      {
        latex:
          '|PF_1|=|ey_0-a|,\\ |PF_2|=|ey_0-a|',
        errorKind: '符号错误',
        error: '第一个焦半径的正负号写反了'
      },
      {
        latex:
          '|PF_0|=|ey_0+a|,\\ |PF_2|=|ey_0-a|',
        errorKind: '系数错误',
        error: '把第一个焦点编号写错了'
      },
      {
        latex:
          '|PF_1|=|ex_0+a|,\\ |PF_2|=|ex_0-a|',
        errorKind: '相似公式混淆',
        error: '误用了焦点在 x 轴时的焦半径公式'
      }
    ]
  },
  'C101-atom-952476b0c0': {
    type: 'condition',
    stemLatex: '\\text{两平面有一个公共点，则}',
    answerLatex: '\\text{有过该点的一条公共直线}',
    distractors: [
      {
        latex: '\\text{没有过该点的公共直线}',
        errorKind: '漏条件',
        error: '漏掉了两平面相交必有公共直线这一结论'
      },
      {
        latex: '\\text{有过该点的两条公共直线}',
        errorKind: '系数错误',
        error: '把公共直线的条数写错了'
      },
      {
        latex: '\\text{有且仅有一个公共点}',
        errorKind: '相似公式混淆',
        error: '把相交平面与相切情形混淆了'
      }
    ]
  },
  'C207-atom-e86f76f307': {
    type: 'reconstruct',
    stemLatex: "(cf)'=",
    answerLatex: "cf'",
    distractors: [
      {
        latex: "c'f",
        errorKind: '相似公式混淆',
        error: '把常数与函数的求导位置写反了'
      },
      {
        latex: 'cf',
        errorKind: '相似公式混淆',
        error: '漏掉了对函数部分的求导'
      },
      {
        latex: "c+f'",
        errorKind: '相似公式混淆',
        error: '把乘法的求导写成了相加'
      }
    ]
  },
  'C005-atom-ba65667f04': {
    type: 'condition',
    stemLatex: '\\text{关于全称量词命题的否定，下列表述正确的是}',
    answerLatex:
      '\\forall x\\in M,\\ q(x)\\text{ 的否定是 }\\exists x\\in M,\\ \\neg q(x)',
    distractors: [
      {
        latex:
          '\\forall x\\in M,\\ q(x)\\text{ 的否定是 }\\forall x\\in M,\\ \\neg q(x)',
        errorKind: '相似公式混淆',
        error: '只否定了结论，没有把全称量词改为存在量词'
      },
      {
        latex:
          '\\exists x\\in M,\\ q(x)\\text{ 的否定是 }\\exists x\\in M,\\ \\neg q(x)',
        errorKind: '相似公式混淆',
        error: '把原命题中的全称量词误写成了存在量词'
      },
      {
        latex:
          '\\forall x\\notin M,\\ q(x)\\text{ 的否定是 }\\exists x\\notin M,\\ \\neg q(x)',
        errorKind: '漏条件',
        error: '错误地改动了元素属于集合这一条件'
      }
    ]
  },
  'C034-atom-d958847f96': {
    type: 'reconstruct',
    stemLatex: 'y=',
    answerLatex: 'kx^{\\alpha}\\ (\\alpha\\text{ 为偶数})',
    distractors: [
      {
        latex: '-kx^{\\alpha}\\ (\\alpha\\text{ 为偶数})',
        errorKind: '符号错误',
        error: '把偶函数前的系数符号写反了'
      },
      {
        latex: 'kx^{\\alpha}\\ (\\alpha\\text{ 为奇数})',
        errorKind: '相似公式混淆',
        error: '把幂指数的奇偶条件写反了'
      },
      {
        latex: 'kx^{2\\alpha}\\ (\\alpha\\text{ 为偶数})',
        errorKind: '系数错误',
        error: '把指数中的系数多乘了 2'
      }
    ]
  },
  'C033-atom-c80007d99e': {
    type: 'reconstruct',
    stemLatex: '\\text{常见奇函数：}y=',
    answerLatex: '\\log_a\\frac{m+nx}{m-nx}',
    distractors: [
      {
        latex: '\\log_a\\frac{m-nx}{m+nx}',
        errorKind: '分母或根号错误',
        error: '把对数真数的分子与分母写反了'
      },
      {
        latex: '\\log_a\\frac{m-x}{m+x}',
        errorKind: '系数错误',
        error: '漏掉了 x 前的系数 n'
      },
      {
        latex: '\\log_a\\frac{m+nx}{m-n^2x}',
        errorKind: '次数错误',
        error: '把分母中 x 的系数错误地平方了'
      }
    ]
  },
  'C070-atom-6defc9f497': {
    type: 'reconstruct',
    stemLatex: '\\tan\\varphi=',
    answerLatex: '\\frac{b}{a}',
    distractors: [
      {
        latex: '-\\frac{b}{a}',
        errorKind: '符号错误',
        error: '把正切值的正负号写反了'
      },
      {
        latex: '\\frac{a}{b}',
        errorKind: '分母或根号错误',
        error: '把分子与分母的位置写反了'
      },
      {
        latex: '\\frac{b^2}{a^2}',
        errorKind: '次数错误',
        error: '错误地把分子和分母分别平方'
      }
    ]
  },
  'S040-atom-d599c48358': {
    type: 'reconstruct',
    stemLatex: '\\frac{1}{(2n-1)(2n+1)}=',
    answerLatex:
      '\\frac12\\left(\\frac1{2n-1}-\\frac1{2n+1}\\right)',
    distractors: [
      {
        latex:
          '-\\frac12\\left(\\frac1{2n-1}-\\frac1{2n+1}\\right)',
        errorKind: '符号错误',
        error: '裂项后的整体正负号写反了'
      },
      {
        latex:
          '\\frac14\\left(\\frac1{2n-1}-\\frac1{2n+1}\\right)',
        errorKind: '系数错误',
        error: '裂项系数应为二分之一，不是四分之一'
      },
      {
        latex:
          '\\frac12\\left(\\frac1{2n-1}+\\frac1{2n+1}\\right)',
        errorKind: '符号错误',
        error: '括号内两个分式之间应相减'
      }
    ]
  },
  'S040-atom-e9b723047e': {
    type: 'reconstruct',
    stemLatex: '\\frac{1}{n(n+1)(n+2)}=',
    answerLatex:
      '\\frac12\\left(\\frac1{n(n+1)}-\\frac1{(n+1)(n+2)}\\right)',
    distractors: [
      {
        latex:
          '-\\frac12\\left(\\frac1{n(n+1)}-\\frac1{(n+1)(n+2)}\\right)',
        errorKind: '符号错误',
        error: '裂项后的整体正负号写反了'
      },
      {
        latex:
          '\\frac14\\left(\\frac1{n(n+1)}-\\frac1{(n+1)(n+2)}\\right)',
        errorKind: '系数错误',
        error: '裂项系数应为二分之一，不是四分之一'
      },
      {
        latex:
          '\\frac12\\left(\\frac1{n(n+1)}+\\frac1{(n+1)(n+2)}\\right)',
        errorKind: '符号错误',
        error: '括号内两个分式之间应相减'
      }
    ]
  },
  'S040-atom-f1066904c8': {
    type: 'reconstruct',
    stemLatex: '\\frac{1}{n(n^2-1)}=',
    answerLatex:
      '\\frac12\\left(\\frac1{(n-1)n}-\\frac1{n(n+1)}\\right)',
    distractors: [
      {
        latex:
          '-\\frac12\\left(\\frac1{(n-1)n}-\\frac1{n(n+1)}\\right)',
        errorKind: '符号错误',
        error: '裂项后的整体正负号写反了'
      },
      {
        latex:
          '\\frac14\\left(\\frac1{(n-1)n}-\\frac1{n(n+1)}\\right)',
        errorKind: '系数错误',
        error: '裂项系数应为二分之一，不是四分之一'
      },
      {
        latex:
          '\\frac12\\left(\\frac1{(n-1)n}+\\frac1{n(n+1)}\\right)',
        errorKind: '符号错误',
        error: '括号内两个分式之间应相减'
      }
    ]
  }
}

const TEXT_SWAPS = [
  ['奇函数', '偶函数', '相似公式混淆', '混淆了奇函数与偶函数'],
  ['偶函数', '奇函数', '相似公式混淆', '混淆了偶函数与奇函数'],
  ['非空真子集', '真子集', '漏条件', '漏掉了“非空”这一条件'],
  ['真子集', '子集', '漏条件', '漏掉了“真”这一条件'],
  ['充分不必要', '必要不充分', '相似公式混淆', '混淆了充分与必要'],
  ['必要不充分', '充分不必要', '相似公式混淆', '混淆了必要与充分'],
  ['充分', '必要', '相似公式混淆', '混淆了充分条件与必要条件'],
  ['必要', '充分', '相似公式混淆', '混淆了必要条件与充分条件'],
  ['充要条件', '充分不必要条件', '相似公式混淆', '把充要条件写成了充分不必要条件'],
  ['大于等于', '小于等于', '符号错误', '不等号方向或等号关系写错了'],
  ['小于等于', '大于等于', '符号错误', '不等号方向或等号关系写错了'],
  ['大于', '小于', '符号错误', '不等号方向写反了'],
  ['小于', '大于', '符号错误', '不等号方向写反了'],
  ['递增', '递减', '相似公式混淆', '把递增与递减写反了'],
  ['递减', '递增', '相似公式混淆', '把递减与递增写反了'],
  ['最大值', '最小值', '相似公式混淆', '把最大值与最小值写反了'],
  ['最小值', '最大值', '相似公式混淆', '把最小值与最大值写反了'],
  ['极大值', '极小值', '相似公式混淆', '把极大值与极小值写反了'],
  ['极小值', '极大值', '相似公式混淆', '把极小值与极大值写反了'],
  ['有理数', '无理数', '相似公式混淆', '混淆了有理数与无理数'],
  ['无理数', '有理数', '相似公式混淆', '混淆了无理数与有理数'],
  ['正整数', '整数', '相似公式混淆', '混淆了正整数集与整数集'],
  ['非空', '空', '漏条件', '漏掉了“非空”这一条件'],
  ['不共线', '共线', '漏条件', '漏掉了“不共线”这一条件'],
  ['相切', '相交', '相似公式混淆', '把相切与相交混淆了'],
  ['相交', '相切', '相似公式混淆', '把相交与相切混淆了'],
  ['同增异减', '同增同减', '相似公式混淆', '把复合函数的单调性规律写错了'],
  ['奇', '偶', '相似公式混淆', '把奇偶性写反了'],
  ['偶', '奇', '相似公式混淆', '把奇偶性写反了'],
  ['增', '减', '相似公式混淆', '把增与减写反了'],
  ['减', '增', '相似公式混淆', '把减与增写反了'],
  ['正', '负', '符号错误', '把正与负写反了'],
  ['负', '正', '符号错误', '把负与正写反了'],
  ['左', '右', '符号错误', '把左右方向写反了'],
  ['右', '左', '符号错误', '把左右方向写反了'],
  ['上', '下', '符号错误', '把上下方向写反了'],
  ['下', '上', '符号错误', '把上下方向写反了'],
  ['内', '外', '相似公式混淆', '把内部与外部混淆了'],
  ['外', '内', '相似公式混淆', '把外部与内部混淆了'],
  ['开区间', '闭区间', '相似公式混淆', '把开区间与闭区间混淆了'],
  ['闭区间', '开区间', '相似公式混淆', '把闭区间与开区间混淆了'],
  ['锐角', '钝角', '相似公式混淆', '把锐角与钝角混淆了'],
  ['钝角', '锐角', '相似公式混淆', '把钝角与锐角混淆了'],
  ['存在', '任意', '相似公式混淆', '混淆了存在量词与全称量词'],
  ['任意', '存在', '相似公式混淆', '混淆了全称量词与存在量词'],
  ['至少', '至多', '符号错误', '把“至少”与“至多”写反了'],
  ['至多', '至少', '符号错误', '把“至多”与“至少”写反了'],
  ['凹', '凸', '相似公式混淆', '把凹凸性写反了'],
  ['凸', '凹', '相似公式混淆', '把凸凹性写反了']
]

const COMMAND_SWAPS = [
  ['\\sin', '\\cos', '相似公式混淆', '把正弦与余弦混淆了'],
  ['\\cos', '\\sin', '相似公式混淆', '把余弦与正弦混淆了'],
  ['\\tan', '\\cot', '相似公式混淆', '把正切与余切混淆了'],
  ['\\cot', '\\tan', '相似公式混淆', '把余切与正切混淆了'],
  ['\\arcsin', '\\arccos', '相似公式混淆', '把反正弦与反余弦混淆了'],
  ['\\arccos', '\\arcsin', '相似公式混淆', '把反余弦与反正弦混淆了'],
  ['\\cap', '\\cup', '相似公式混淆', '把交集与并集混淆了'],
  ['\\cup', '\\cap', '相似公式混淆', '把并集与交集混淆了'],
  ['\\parallel', '\\perp', '相似公式混淆', '把平行与垂直混淆了'],
  ['\\perp', '\\parallel', '相似公式混淆', '把垂直与平行混淆了'],
  ['\\subseteq', '\\subsetneq', '漏条件', '漏掉了可以相等的情况'],
  ['\\subsetneq', '\\subseteq', '漏条件', '把真包含误写成了包含'],
  ['\\subset', '\\supset', '符号错误', '包含关系方向写反了'],
  ['\\supset', '\\subset', '符号错误', '包含关系方向写反了'],
  ['\\in', '\\notin', '符号错误', '把属于误写成了不属于'],
  ['\\notin', '\\in', '符号错误', '把不属于误写成了属于'],
  ['\\forall', '\\exists', '相似公式混淆', '把全称量词与存在量词混淆了'],
  ['\\exists', '\\forall', '相似公式混淆', '把存在量词与全称量词混淆了'],
  ['\\leq', '\\geq', '符号错误', '不等号方向写反了'],
  ['\\geq', '\\leq', '符号错误', '不等号方向写反了'],
  ['\\le', '\\ge', '符号错误', '不等号方向写反了'],
  ['\\ge', '\\le', '符号错误', '不等号方向写反了'],
  ['\\Rightarrow', '\\Leftarrow', '符号错误', '推出方向写反了'],
  ['\\Leftarrow', '\\Rightarrow', '符号错误', '推出方向写反了'],
  ['\\Leftrightarrow', '\\Rightarrow', '漏条件', '把等价关系误写成了单向推出'],
  ['\\Rightarrow', '\\Leftrightarrow', '相似公式混淆', '把单向推出误写成了等价关系'],
  ['\\max', '\\min', '相似公式混淆', '把最大值与最小值混淆了'],
  ['\\min', '\\max', '相似公式混淆', '把最小值与最大值混淆了'],
  // Replacing \log with \ln would leave a base behind, e.g. \ln_a.
  // Other mutations already produce enough safe distractors for log atoms.
  ['\\ln', '\\log', '相似公式混淆', '把自然对数与常用对数混淆了']
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function countBy(items, getKey) {
  const result = {}
  items.forEach(item => {
    const key = getKey(item)
    result[key] = (result[key] || 0) + 1
  })
  return Object.fromEntries(
    Object.entries(result).sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
  )
}

function unique(values) {
  return [...new Set(values)]
}

function inferPromptForm(question) {
  if (question.promptForm === 'qa' || question.promptForm === 'completion') {
    return question.promptForm
  }
  return question.type === 'blank' ? 'completion' : 'qa'
}

function commandBoundaryReplaceAll(source, from, to) {
  if (!from.startsWith('\\')) return source.split(from).join(to)
  const pattern = new RegExp(
    `${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`,
    'g'
  )
  return source.replace(pattern, to)
}

function candidateLengthAllowed(correct, candidate) {
  const correctLength = normalizeOptionLatex(correct).length
  const candidateLength = normalizeOptionLatex(candidate).length
  if (!correctLength || !candidateLength) return false
  if (/\text\{/.test(candidate) && !/\text\{/.test(correct)) return false
  if (correctLength <= 4) {
    return candidateLength <= Math.max(6, Math.ceil(correctLength * 1.8) + 2)
  }
  return (
    candidateLength >= Math.floor(correctLength * 0.5)
    && candidateLength <= Math.ceil(correctLength * 1.6) + 6
  )
}

function obviousSemanticKey(value) {
  let source = normalizeOptionLatex(value)
    .replace(/\\left|\\right/g, '')
    .replace(/\\tfrac/g, '\\frac')
  if (/^[-+]?0(?:\.0+)?$/.test(source)) return '0'
  const fraction = source.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/)
  if (fraction) {
    if (fraction[1] === fraction[2]) return '1'
    if (/^\d+(?:\.\d+)?$/.test(fraction[1])
      && /^\d+(?:\.\d+)?$/.test(fraction[2])
      && Number(fraction[2]) !== 0) {
      return String(Number(fraction[1]) / Number(fraction[2]))
    }
  }
  return source
}

function findDegenerateFraction(value) {
  const source = normalizeOptionLatex(value)
  let match
  const braced = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g
  while ((match = braced.exec(source))) {
    const numerator = match[1].replace(/\s+/g, '')
    const denominator = match[2].replace(/\s+/g, '')
    if (/^[-+]?0(?:\.0+)?$/.test(denominator)) {
      return '分母为零'
    }
    if (numerator === denominator) {
      return '分子与分母相同'
    }
  }
  const simple = /\\frac\s*([A-Za-z0-9])\s*([A-Za-z0-9])/g
  while ((match = simple.exec(source))) {
    if (match[2] === '0') return '分母为零'
    if (match[1] === match[2]) return '分子与分母相同'
  }
  return ''
}

function addCandidate(output, seen, correct, latex, errorKind, error, priority) {
  const normalized = normalizeLatex(latex)
  const key = normalizeOptionLatex(normalized)
  const correctKey = normalizeOptionLatex(correct)
  const semanticKey = obviousSemanticKey(normalized)
  if (
    !normalized
    || !key
    || key === correctKey
    || seen.has(key)
    || !candidateLengthAllowed(correct, normalized)
    || !ERROR_KINDS.includes(errorKind)
    || !String(error || '').trim()
    || /\\boxed|\\phantom/.test(normalized)
    || Boolean(findDegenerateFraction(normalized))
    || semanticKey === obviousSemanticKey(correct)
    || output.some(item => obviousSemanticKey(item.latex) === semanticKey)
  ) {
    return
  }
  seen.add(key)
  output.push({
    latex: normalized,
    errorKind,
    error: String(error).trim(),
    priority: Number(priority) || 0
  })
}

function replaceOneText(source, from, to) {
  const index = source.indexOf(from)
  if (index < 0) return null
  return `${source.slice(0, index)}${to}${source.slice(index + from.length)}`
}

function collectTextSwaps(correct, output, seen) {
  TEXT_SWAPS.forEach(([from, to, errorKind, error], index) => {
    const candidate = replaceOneText(correct, from, to)
    if (candidate) {
      addCandidate(output, seen, correct, candidate, errorKind, error, 1 + index / 1000)
    }
  })
}

function collectCommandSwaps(correct, output, seen) {
  COMMAND_SWAPS.forEach(([from, to, errorKind, error], index) => {
    if (!correct.includes(from)) return
    const candidate = commandBoundaryReplaceAll(correct, from, to)
    addCandidate(output, seen, correct, candidate, errorKind, error, 1 + index / 1000)
  })
}

function collectRelationSwaps(correct, output, seen) {
  const replacements = [
    ['\\leqslant', '\\geqslant'],
    ['\\geqslant', '\\leqslant'],
    ['\\leq', '\\geq'],
    ['\\geq', '\\leq'],
    ['\\le', '\\ge'],
    ['\\ge', '\\le'],
    ['<', '>'],
    ['>', '<']
  ]
  replacements.forEach(([from, to]) => {
    if (!correct.includes(from)) return
    const candidate = commandBoundaryReplaceAll(correct, from, to)
    addCandidate(
      output,
      seen,
      correct,
      candidate,
      '符号错误',
      '不等号或关系方向写反了',
      0.8
    )
  })
}

function collectBracketSwaps(correct, output, seen) {
  const intervalPattern = /(?<![A-Za-z\\])([\[(])([^\[\]()]+,[^\[\]()]+)([\])])/g
  let match
  let intervalCount = 0
  while ((match = intervalPattern.exec(correct)) && intervalCount < 2) {
    const opening = match[1]
    const closing = match[3]
    const offset = match.index
    const candidates = [
      `${correct.slice(0, offset)}${opening === '(' ? '[' : '('}` +
        correct.slice(offset + 1),
      `${correct.slice(0, offset + match[0].length - 1)}` +
        `${closing === ')' ? ']' : ')'}` +
        correct.slice(offset + match[0].length)
    ]
    candidates.forEach(candidate => {
      addCandidate(
        output,
        seen,
        correct,
        candidate,
        '漏条件',
        '区间端点的开闭写错了',
        1.8
      )
    })
    intervalCount += 1
  }
}

function collectNumberSwaps(correct, output, seen) {
  const replacements = {
    0: ['1', '-1'],
    1: ['0', '2'],
    2: ['1', '3'],
    3: ['2', '4'],
    4: ['2'],
    5: ['2'],
    6: ['2'],
    8: ['2'],
    10: ['12'],
    12: ['10'],
    90: ['180'],
    180: ['360'],
    360: ['180']
  }
  let count = 0
  const pattern = /\d+(?:\.\d+)?/g
  let match
  while ((match = pattern.exec(correct)) && count < 18) {
    const values = replacements[match[0]]
    if (!values) continue
    values.forEach((value, index) => {
      const candidate =
        `${correct.slice(0, match.index)}${value}` +
        correct.slice(match.index + match[0].length)
      addCandidate(
        output,
        seen,
        correct,
        candidate,
        '系数错误',
        '系数或常数项写错了',
        2 + index / 10
      )
    })
    count += 1
  }
}

function collectSymbolSwaps(correct, output, seen) {
  const replacements = [
    ['\\mathbb{N}^{+}', '\\mathbb{N}', '相似公式混淆', '混淆了正整数集与自然数集'],
    ['\\mathbb{N}', '\\mathbb{Z}', '相似公式混淆', '混淆了自然数集与整数集'],
    ['\\varnothing', '\\{0\\}', '相似公式混淆', '把空集与含零集合混淆了'],
    ['\\infty', '0', '相似公式混淆', '把无穷与零混淆了'],
    ['\\pi', '2\\pi', '系数错误', '把圆周率与圆周角混淆了'],
    ['\\pi', '\\frac{\\pi}{2}', '系数错误', '角度中的系数写错了'],
    ['\\alpha', '\\beta', '相似公式混淆', '把角的位置或名称写错了'],
    ['\\beta', '\\alpha', '相似公式混淆', '把角的位置或名称写错了'],
    ['\\omega', '2\\omega', '系数错误', '角频率的系数写错了'],
    ['\\theta', '2\\theta', '系数错误', '角的系数写错了']
  ]
  replacements.forEach(([from, to, errorKind, error], index) => {
    if (!correct.includes(from)) return
    const candidate = correct.replace(from, to)
    addCandidate(output, seen, correct, candidate, errorKind, error, 2 + index / 1000)
  })
}

function collectVariableSwaps(correct, output, seen) {
  const identifiers = unique(
    (correct.match(/(?<![\\A-Za-z])[A-Za-z](?![A-Za-z])/g) || [])
  )
  const nearby = ['a', 'b', 'x', 'n', 'A', 'B']
  identifiers.slice(0, 4).forEach(identifier => {
    nearby
      .filter(value => value !== identifier)
      .slice(0, 2)
      .forEach((replacement, index) => {
        const pattern = new RegExp(
          `(?<![\\\\A-Za-z])${identifier}(?![A-Za-z])`
        )
        const candidate = correct.replace(pattern, replacement)
        addCandidate(
          output,
          seen,
          correct,
          candidate,
          '相似公式混淆',
          '变量或对应对象写错了',
          4 + index / 10
        )
      })
  })
}

function collectConditionRemovals(correct, output, seen) {
  const parts = correct.split(/,\\s*/)
  if (parts.length < 2 || parts.length > 6) return
  parts.forEach((part, index) => {
    if (!part.trim()) return
    const candidate = parts.filter((item, itemIndex) => itemIndex !== index).join(',\\ ')
    addCandidate(
      output,
      seen,
      correct,
      candidate,
      '漏条件',
      '漏掉了其中一个适用条件',
      3
    )
  })
}

function collectShortAnswerFallbacks(correct, output, seen) {
  const normalized = normalizeLatex(correct)
  const fallbacks = []
  if (/^[A-Za-z]$/.test(normalized)) {
    const choices = ['A', 'B', 'C', 'x', 'y', '0', '\\varnothing']
    choices.forEach(value => {
      if (value !== normalized) {
        fallbacks.push([
          value,
          '相似公式混淆',
          '对象或符号对应错误'
        ])
      }
    })
  }
  if (/^-?[A-Za-z]$/.test(normalized)) {
    fallbacks.push([
      normalized.startsWith('-') ? normalized.slice(1) : `-${normalized}`,
      '符号错误',
      '正负号写反了'
    ])
    fallbacks.push([
      `2${normalized.replace(/^-/, '')}`,
      '系数错误',
      '系数写错了'
    ])
  }
  if (/^\d+$/.test(normalized)) {
    const numericFallbacks = normalized === '0'
      ? [
        ['1', '系数错误', '常数项写错了'],
        ['2', '系数错误', '常数项写错了'],
        ['-1', '符号错误', '正负号写反了']
      ]
      : normalized === '1'
        ? [
          ['0', '系数错误', '常数项写错了'],
          ['2', '系数错误', '常数项写错了'],
          ['-1', '符号错误', '正负号写反了']
        ]
        : [
          ['0', '系数错误', '常数项写错了'],
          ['1', '系数错误', '常数项写错了'],
          [`-${normalized}`, '符号错误', '正负号写反了']
        ]
    numericFallbacks.forEach(item => fallbacks.push(item))
  }
  if (/^\\text\{[^{}]+\}$/.test(normalized)) {
    fallbacks.push(['\\text{无法判断}', '相似公式混淆', '给出了错误的判断结论'])
    fallbacks.push(['\\text{都不正确}', '相似公式混淆', '给出了错误的判断结论'])
  }
  fallbacks.forEach(([latex, errorKind, error], index) => {
    addCandidate(output, seen, correct, latex, errorKind, error, 6 + index / 100)
  })
}

function richMutations(correct, siblingAtoms) {
  const output = []
  const seen = new Set([normalizeOptionLatex(correct)])
  buildMutations(correct).forEach(item => {
    addCandidate(
      output,
      seen,
      correct,
      item.latex,
      item.errorKind,
      item.error,
      0
    )
  })

  collectTextSwaps(correct, output, seen)
  collectCommandSwaps(correct, output, seen)
  collectRelationSwaps(correct, output, seen)
  collectBracketSwaps(correct, output, seen)
  collectNumberSwaps(correct, output, seen)
  collectSymbolSwaps(correct, output, seen)
  collectVariableSwaps(correct, output, seen)
  collectConditionRemovals(correct, output, seen)
  collectShortAnswerFallbacks(correct, output, seen)

  siblingAtoms.forEach((atom, index) => {
    addCandidate(
      output,
      seen,
      correct,
      atom.rhs,
      '相似公式混淆',
      '混淆了同一公式中的另一条结论',
      5 + index / 100
    )
  })

  return output
}

function pickDistractors(correct, candidates) {
  const sorted = candidates
    .slice()
    .sort((left, right) => left.priority - right.priority)
  const selected = []
  const usedKinds = new Set()
  sorted.forEach(candidate => {
    if (selected.length >= 3 || usedKinds.has(candidate.errorKind)) return
    usedKinds.add(candidate.errorKind)
    selected.push(candidate)
  })
  sorted.forEach(candidate => {
    if (selected.length >= 3) return
    if (selected.some(item => (
      normalizeOptionLatex(item.latex) === normalizeOptionLatex(candidate.latex)
    ))) return
    selected.push(candidate)
  })
  return selected.map(({ priority, ...candidate }) => candidate)
}

function makeReconstructQuestion(formula, atom, siblingAtoms, id) {
  const stemLatex =
    atom.operator === ':'
      ? `${atom.lhs}:`
      : `${atom.lhs}${atom.operator}`
  const type = atom.operator === ':' ? 'condition' : 'reconstruct'
  const distractors = pickDistractors(
    atom.rhs,
    richMutations(atom.rhs, siblingAtoms)
  )
  if (distractors.length !== 3) return null
  return normalizeQuestionOptions({
    id,
    sourceId: formula.id,
    chapter: formula.chapter,
    title: formula.name,
    type,
    stemLatex,
    answerLatex: atom.rhs,
    distractors,
    authoring: 'atom-auto',
    atomId: atom.atomId,
    promptForm: 'qa'
  })
}

function makeBlankQuestion(formula, atom, id) {
  const drafts = buildBlankDrafts({
    lhs: atom.lhs,
    operator: atom.operator,
    rhs: atom.rhs
  })
  if (!drafts.length) return null
  const draft = drafts[0]
  return normalizeQuestionOptions({
    id,
    sourceId: formula.id,
    chapter: formula.chapter,
    title: formula.name,
    type: 'blank',
    stemLatex: draft.stemLatex,
    answerLatex: draft.answerLatex,
    distractors: draft.distractors,
    authoring: 'atom-auto',
    atomId: atom.atomId,
    promptForm: 'completion'
  })
}

function makeConditionQuestion(formula, atom, id) {
  const statement = atom.statement
  const stemLatex =
    `\\text{关于${formula.name}，下列表述正确的是}`
  const distractors = pickDistractors(
    statement,
    richMutations(statement, [])
  )
  if (distractors.length !== 3) return null
  return normalizeQuestionOptions({
    id,
    sourceId: formula.id,
    chapter: formula.chapter,
    title: formula.name,
    type: 'condition',
    stemLatex,
    answerLatex: statement,
    distractors,
    authoring: 'atom-auto',
    atomId: atom.atomId,
    promptForm: 'qa'
  })
}

function generateQuestion(formula, atom, siblings, id, failures) {
  const override = ATOM_QUESTION_OVERRIDES[atom.atomId]
  if (override) {
    return normalizeQuestionOptions({
      id,
      sourceId: formula.id,
      chapter: formula.chapter,
      title: formula.name,
      type: override.type,
      stemLatex: override.stemLatex,
      answerLatex: override.answerLatex,
      distractors: override.distractors,
      authoring: 'atom-auto',
      atomId: atom.atomId,
      promptForm: 'qa'
    })
  }

  const attempts = [
    () => makeReconstructQuestion(formula, atom, siblings, id),
    () => makeBlankQuestion(formula, atom, id),
    () => makeConditionQuestion(formula, atom, id)
  ]
  const attemptFailures = []
  for (const attempt of attempts) {
    try {
      const question = attempt()
      if (question) return question
    } catch (error) {
      attemptFailures.push(error.message)
    }
  }
  failures.push({
    atomId: atom.atomId,
    sourceId: formula.id,
    reason: attemptFailures.length
      ? attemptFailures.join(' | ')
      : 'all question forms were empty'
  })
  return null
}

function assignAtomId(question, atoms) {
  const override = question.demo === true
    ? DEMO_ATOM_OVERRIDES[question.id]
    : BASE_ATOM_OVERRIDES[question.id]
  if (override) {
    if (!atoms.some(atom => atom.atomId === override)) {
      throw new Error(`${question.id}: override atom ${override} does not exist`)
    }
    return override
  }
  if (atoms.length === 1) return atoms[0].atomId
  const ranked = rankQuestionAtoms(atoms, question)
  if (!ranked.length || !ranked[0].atom) {
    throw new Error(`${question.id}: cannot match an atom`)
  }
  return ranked[0].atom.atomId
}

function allocateQuestionId(sourceId, usedIds) {
  const prefix = `P-${sourceId}-`
  const highest = [...usedIds]
    .filter(id => id.startsWith(prefix))
    .map(id => Number(id.slice(prefix.length)))
    .filter(Number.isInteger)
    .reduce((max, value) => Math.max(max, value), 1)
  let next = highest + 1
  while (usedIds.has(`${prefix}${String(next).padStart(2, '0')}`)) next += 1
  const id = `${prefix}${String(next).padStart(2, '0')}`
  usedIds.add(id)
  return id
}

function buildMeta(items, formulas, atomsByFormula, coveredAtomIds) {
  const formal = items.filter(item => item.demo !== true)
  const demos = items.filter(item => item.demo === true)
  const allAtoms = [...atomsByFormula.values()].flat()
  return {
    version: 6,
    description: '全部公式原子至少一道选择题，保留旧基础题与示范题',
    source: 'prototype/data/公式库-全量.json',
    chapterCount: new Set(formulas.map(item => item.chapter)).size,
    questionCount: items.length,
    baseQuestionCount: formal.length,
    formalQuestionCount: formal.length,
    demoQuestionCount: demos.length,
    coveredFormulaCount: new Set(formal.map(item => item.sourceId)).size,
    formulaCount: formulas.length,
    atomCount: allAtoms.length,
    coveredAtomCount: coveredAtomIds.size,
    coveragePolicy: 'every-base-question-covers-an-atom',
    formPolicy: 'every-formula-atom-has-a-formal-choice',
    types: ['reconstruct', 'blank', 'condition'],
    typeCounts: countBy(items, item => item.type),
    authoringCounts: countBy(items, item => item.authoring),
    promptFormCounts: countBy(items, item => item.promptForm),
    errorKindCounts: countBy(
      items.flatMap(item => item.distractors || []),
      item => item.errorKind
    ),
    fillPolicy: 'removed',
    variantsPolicy: 'formula atoms may have question and completion variants'
  }
}

function main() {
  const apply = process.argv.includes('--apply')
  const formulaSource = readJson(FORMULAS_PATH)
  const questionSource = readJson(QUESTIONS_PATH)
  const demoSource = readJson(DEMO_PATH)
  if (!Array.isArray(formulaSource.items)
    || !Array.isArray(questionSource.items)
    || !Array.isArray(demoSource.items)) {
    throw new Error('公式库、题库或示范题缺少 items')
  }

  const formulas = formulaSource.items
  const formulaMap = new Map(formulas.map(formula => [formula.id, formula]))
  const atomsByFormula = new Map(
    formulas.map(formula => [formula.id, buildFormulaAtoms(formula)])
  )
  const atomById = new Map()
  atomsByFormula.forEach(atoms => {
    atoms.forEach(atom => atomById.set(atom.atomId, atom))
  })

  const keptQuestions = questionSource.items
    .filter(question => question.authoring !== 'atom-auto')
  const usedIds = new Set(keptQuestions.map(question => question.id))
  const failures = []
  const assigned = keptQuestions.map(question => {
    const formula = formulaMap.get(question.sourceId)
    if (!formula) throw new Error(`${question.id}: unknown sourceId ${question.sourceId}`)
    const atoms = atomsByFormula.get(question.sourceId)
    const atomId = assignAtomId(question, atoms)
    return {
      ...question,
      atomId,
      promptForm: inferPromptForm(question)
    }
  }).map(question => {
    const override = ATOM_QUESTION_OVERRIDES[question.atomId]
    if (!override || question.demo === true) return question
    const formula = formulaMap.get(question.sourceId)
    const atoms = atomsByFormula.get(question.sourceId)
    const atom = atoms.find(item => item.atomId === question.atomId)
    const siblings = atoms.filter(item => item.atomId !== question.atomId)
    const replacement = generateQuestion(
      formula,
      atom,
      siblings,
      question.id,
      failures
    )
    if (!replacement) {
      throw new Error(`${question.id}: failed to apply atom override`)
    }
    return replacement
  })

  // Demos are a separate preview deck and must never satisfy formal coverage.
  const coveredAtomIds = new Set(
    assigned
      .filter(question => question.demo !== true)
      .map(question => question.atomId)
  )
  const generated = []
  formulas.forEach(formula => {
    const atoms = atomsByFormula.get(formula.id)
    atoms.forEach((atom, atomIndex) => {
      if (coveredAtomIds.has(atom.atomId)) return
      const siblings = atoms.filter(item => item.atomId !== atom.atomId)
      const id = allocateQuestionId(formula.id, usedIds)
      const question = generateQuestion(formula, atom, siblings, id, failures)
      if (!question) {
        failures.push({
          atomId: atom.atomId,
          sourceId: formula.id,
          atomIndex,
          reason: 'no question form produced three valid distractors'
        })
        return
      }
      generated.push(question)
      coveredAtomIds.add(atom.atomId)
    })
  })

  const items = [...assigned, ...generated]
  items.forEach(question => {
    if (!atomById.has(question.atomId)) {
      throw new Error(`${question.id}: final atomId ${question.atomId} is unknown`)
    }
    assertQuestionQuality(question)
  })

  const missingAtoms = [...atomById.keys()]
    .filter(atomId => !coveredAtomIds.has(atomId))
  const missingFormulas = formulas
    .filter(formula => !items.some(question => (
      question.demo !== true && question.sourceId === formula.id
    )))
    .map(formula => formula.id)
  const duplicateIds = items
    .map(item => item.id)
    .filter((id, index, values) => values.indexOf(id) !== index)

  const output = {
    meta: buildMeta(items, formulas, atomsByFormula, coveredAtomIds),
    items
  }
  const report = {
    generatedAt: new Date().toISOString(),
    applied: false,
    formulas: formulas.length,
    atoms: atomById.size,
    existingKeptQuestions: assigned.length,
    generatedQuestions: generated.length,
    totalQuestions: items.length,
    coveredAtoms: coveredAtomIds.size,
    missingAtoms,
    missingFormulas,
    duplicateIds,
    generationFailures: failures,
    typeCounts: output.meta.typeCounts,
    authoringCounts: output.meta.authoringCounts,
    promptFormCounts: output.meta.promptFormCounts
  }

  if (missingAtoms.length || missingFormulas.length || duplicateIds.length || failures.length) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.error(JSON.stringify(report, null, 2))
    throw new Error(
      `原子补题未完成: missingAtoms=${missingAtoms.length}, ` +
      `missingFormulas=${missingFormulas.length}, failures=${failures.length}`
    )
  }

  if (apply) {
    const nextDemoSource = {
      ...demoSource,
      items: demoSource.items.map(question => ({
        ...question,
        atomId: DEMO_ATOM_OVERRIDES[question.id] || question.atomId,
        promptForm: inferPromptForm(question)
      }))
    }
    fs.writeFileSync(
      QUESTIONS_PATH,
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8'
    )
    fs.writeFileSync(
      DEMO_PATH,
      `${JSON.stringify(nextDemoSource, null, 2)}\n`,
      'utf8'
    )
    report.applied = true
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

try {
  main()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
