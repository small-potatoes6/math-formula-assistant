/*
 * render_formulas_v2.js —— 公式排版改造版渲染管线
 *
 * 相比 v1（render_formulas_svg.js）的三处核心改动：
 *
 *  1) 【修根因】v1 的 splitTopLevel() 把 = + - 也当作断行点，
 *     导致 "A=B" 被拆成 "A" / "=B"，切下的半截又和下一式合并到同一行
 *     （S040 出现过两条不同公式挤在一行的错乱）。
 *     v2 只在 \quad \qquad ; , 处切分，= + - 不再断行，公式保持完整。
 *
 *  2) 【分层行距 + 编号】多公式条目改用 array{l}：
 *     同一结论内换行紧凑，不同结论之间明显留白；
 *     每组首行加 (1)(2)… 编号并用主题色着色。
 *     单公式条目保持原样，不加编号（避免 43% 的单公式被无谓编号）。
 *
 *  3) 【条件灰化】行尾的半角括号限定条件（如 (a>0,b>0)）着灰色，
 *     弱化修饰、突出公式主干。
 *
 * 输出：
 *   SVG  -> extract/build/formulas/<id>-<kind>.svg
 *   数据 -> extract/build/formulas.js
 * 验证通过后再同步进小程序工程（见 sync_to_project.js）。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MJ = path.join(ROOT, 'tools/mathjax/node_modules/mathjax-full/js');
const { mathjax } = require(path.join(MJ, 'mathjax.js'));
const { TeX } = require(path.join(MJ, 'input/tex.js'));
const { SVG } = require(path.join(MJ, 'output/svg.js'));
const { liteAdaptor } = require(path.join(MJ, 'adaptors/liteAdaptor.js'));
const { RegisterHTMLHandler } = require(path.join(MJ, 'handlers/html.js'));
const { AllPackages } = require(path.join(MJ, 'input/tex/AllPackages.js'));

const DATA_PATH = path.join(ROOT, 'prototype/data/公式库-全量.json');
const OUT_DIR = path.join(ROOT, 'extract/build/formulas');
const DATA_OUT = path.join(ROOT, 'extract/build/formulas.js');

const EM_PX = 17;
const OUTPUT_SCALE = 3;
const PADDING_X = 8;
const PADDING_Y = 6;
const MAX_LINE_WIDTH = 270;

// 同一句话的续行贴紧；不同结论之间留出清晰分层。
const LINE_GAP = 0.10;
const GROUP_GAP = 1.18;

const COLOR_MAIN = '#211d18';
const COLOR_INDEX_CORE = '#d9822b';
const COLOR_INDEX_CONCLUSION = '#7c5ce7';
const COLOR_COND = '#a89e93';    // 条件：灰

const SUBSCRIPT_MAP = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ',
  l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ',
  s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ'
};

const SUPERSCRIPT_MAP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ',
  g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ',
  m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ',
  t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ'
};

const DISPLAY_SYMBOLS = [
  [/\\neq|\\ne(?![A-Za-z])/g, '≠'],
  [/\\geq|\\ge(?![A-Za-z])/g, '≥'],
  [/\\leq|\\le(?![A-Za-z])/g, '≤'],
  [/\\gt(?![A-Za-z])/g, '>'],
  [/\\lt(?![A-Za-z])/g, '<'],
  [/\\pm(?![A-Za-z])/g, '±'],
  [/\\mp(?![A-Za-z])/g, '∓'],
  [/\\times(?![A-Za-z])/g, '×'],
  [/\\cdot(?![A-Za-z])/g, '·'],
  [/\\infty(?![A-Za-z])/g, '∞'],
  [/\\ldots|\\dots(?![A-Za-z])/g, '…'],
  [/\\sum(?![A-Za-z])/g, 'Σ'],
  [/\\in(?![A-Za-z])/g, '∈'],
  [/\\notin(?![A-Za-z])/g, '∉'],
  [/\\subseteq(?![A-Za-z])/g, '⊆'],
  [/\\subset(?![A-Za-z])/g, '⊂'],
  [/\\cup(?![A-Za-z])/g, '∪'],
  [/\\cap(?![A-Za-z])/g, '∩'],
  [/\\varnothing(?![A-Za-z])/g, '∅'],
  [/\\forall(?![A-Za-z])/g, '∀'],
  [/\\exists(?![A-Za-z])/g, '∃'],
  [/\\Longrightarrow|\\Rightarrow|\\implies(?![A-Za-z])/g, '⇒'],
  [/\\Longleftrightarrow|\\Leftrightarrow|\\iff(?![A-Za-z])/g, '⇔'],
  [/\\to|\\rightarrow(?![A-Za-z])/g, '→'],
  [/\\angle(?![A-Za-z])/g, '∠'],
  [/\\triangle(?![A-Za-z])/g, '△'],
  [/\\perp(?![A-Za-z])/g, '⊥'],
  [/\\parallel(?![A-Za-z])/g, '∥'],
  [/\\alpha(?![A-Za-z])/g, 'α'],
  [/\\beta(?![A-Za-z])/g, 'β'],
  [/\\theta(?![A-Za-z])/g, 'θ'],
  [/\\pi(?![A-Za-z])/g, 'π'],
  [/\\phi(?![A-Za-z])/g, 'φ'],
  [/\\mu(?![A-Za-z])/g, 'μ'],
  [/\\sigma(?![A-Za-z])/g, 'σ'],
  [/\\max(?![A-Za-z])/g, 'max'],
  [/\\min(?![A-Za-z])/g, 'min']
];

// 这些条目的逗号是“并列公式”分隔符，而不是参数列表。
// 只对明确条目启用，避免把 (x,y) 或 a>0,b>0 误拆成编号列表。
const COMMA_LIST_IDS = new Set(['C001', 'C002']);
const FORCE_SINGLE_LINE_IDS = new Set(['S048', 'S049']);

// 强分隔：\quad \qquad —— 必定新起一组
const STRONG_CMD = /^\\(qquad|quad)(?![A-Za-z])/;
// 逻辑连接命令：仅在这些完整命题连接处作为可断点，不切割单个等式或比较链。
const BREAK_CMD =
  /^\\(Rightarrow|Leftrightarrow|Longleftrightarrow|implies|iff|to|mapsto)(?![A-Za-z])/;

// 行尾括号限定条件：(a>0,b>0) / (n\ge 2) / (a\neq 0)
const TRAILING_COND = /\(([^()]*?(?:\\ge|\\le|\\ne|\\gt|\\lt|>|<)[^()]*?)\)\s*$/;

function textToScript(text, map) {
  let out = '';
  for (const char of String(text)) {
    if (!map[char]) return null;
    out += map[char];
  }
  return out;
}

function replaceScripts(text, map, marker) {
  const markerPattern = marker === '^' ? '\\^' : marker;
  let result = text;
  result = result.replace(
    new RegExp(`${markerPattern}\\{([^{}]+)\\}`, 'g'),
    (match, body) => textToScript(body, map) || match
  );
  result = result.replace(
    new RegExp(`${markerPattern}([A-Za-z0-9+\\-=])`, 'g'),
    (match, body) => textToScript(body, map) || match
  );
  return result;
}

/**
 * 说明/条件/易错里不适合直接显示 LaTeX。
 * 这里只生成展示文本，原始字段仍完整保留在数据源中。
 */
function formatDisplayMath(value) {
  let text = String(value || '').trim();
  if (!text) return '';

  let previous = '';
  while (previous !== text) {
    previous = text;
    text = text.replace(/\\text\{([^{}]*)\}/g, '$1');
    text = text.replace(/\\mathbb\{([^{}]+)\}/g, '$1');
    text = text.replace(/\\vec\{?([A-Za-z])\}?/g, '向量$1');
    text = text.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
    text = text.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2');
    text = text.replace(/\\(?:left|right)(?![A-Za-z])/g, '');
  }

  text = text.replace(/C_\{?([A-Za-z0-9-]+)\}?\^\{?([A-Za-z0-9-]+)\}?/g, 'C($1,$2)');
  text = text.replace(/k_\{?(AB|MN)\}?/g, 'k($1)');
  text = text.replace(/k1k2/g, 'k₁k₂');
  text = text.replace(/P\(B\)>0/g, 'P(B)>0');
  text = replaceScripts(text, SUBSCRIPT_MAP, '_');
  text = replaceScripts(text, SUPERSCRIPT_MAP, '^');

  DISPLAY_SYMBOLS.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  text = text
    .replace(/\\(?:quad|qquad|,|;|:|!|\s)/g, ' ')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\([A-Za-z]+)/g, '$1')
    .replace(/\s*([，。；：、])\s*/g, '$1')
    .replace(/\s*([=<>≠≥≤±×·])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({
  packages: AllPackages,
  inlineMath: [['$', '$']],
  displayMath: [['$$', '$$']]
});
const svgJax = new SVG({ fontCache: 'local', scale: 1 });
const doc = mathjax.document('', { InputJax: tex, OutputJax: svgJax });

/* ------------------------------------------------------------------ *
 * SVG 工具
 * ------------------------------------------------------------------ */

function extractOuterSvg(html) {
  const start = html.indexOf('<svg');
  if (start < 0) throw new Error('MathJax did not return SVG');
  const tagPattern = /<\/?svg\b[^>]*>/g;
  tagPattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tagPattern.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, tagPattern.lastIndex);
  }
  throw new Error('MathJax returned an unbalanced SVG');
}

function optimizeSvg(source) {
  const idMap = new Map();
  let idIndex = 0;
  let optimized = source.replace(/\sid="([^"]+)"/g, (match, id) => {
    if (!idMap.has(id)) {
      idIndex += 1;
      idMap.set(id, `a${idIndex}`);
    }
    return ` id="${idMap.get(id)}"`;
  });
  optimized = optimized.replace(
    /xlink:href="#([^"]+)"/g,
    (match, id) => `xlink:href="#${idMap.get(id) || id}"`
  );
  return optimized
    .replace(/\sdata-[a-z0-9-]+="[^"]*"/gi, '')
    .replace(/\srole="[^"]*"/g, '')
    .replace(/\sfocusable="[^"]*"/g, '')
    .replace(/\sclass="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim();
}

function renderExpression(expression) {
  const node = doc.convert(expression, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 100000
  });
  const source = extractOuterSvg(adaptor.outerHTML(node));
  const viewBoxMatch = source.match(/\sviewBox="([^"]+)"/);
  if (!viewBoxMatch) throw new Error('Invalid MathJax SVG');
  const [minX, minY, vbW, vbH] = viewBoxMatch[1].trim().split(/\s+/).map(Number);
  const bodyStart = source.indexOf('>') + 1;
  const bodyEnd = source.lastIndexOf('</svg>');
  const body = source.slice(bodyStart, bodyEnd);

  const scale = EM_PX / 1000;
  const width = Math.ceil(vbW * scale + PADDING_X * 2);
  const height = Math.ceil(vbH * scale + PADDING_Y * 2);
  const transform =
    `translate(${PADDING_X} ${PADDING_Y}) scale(${scale}) ` +
    `translate(${-minX} ${-minY})`;
  const intrinsicWidth = width * OUTPUT_SCALE;
  const intrinsicHeight = height * OUTPUT_SCALE;
  const svg = optimizeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${intrinsicWidth}" height="${intrinsicHeight}" viewBox="0 0 ${width} ${height}" ` +
    `color="${COLOR_MAIN}">` +
    `<g transform="${transform}">${body}</g></svg>`
  );
  return { svg, width, height };
}

const widthCache = new Map();
function measureWidth(expression) {
  if (!widthCache.has(expression)) {
    widthCache.set(expression, renderExpression(expression).width - PADDING_X * 2);
  }
  return widthCache.get(expression);
}

/* ------------------------------------------------------------------ *
 * 结构解析：latex -> [{ lines: [...] }]
 *
 *   强分隔（\quad \qquad ;）      -> 新起一组（组间大间距）
 *   弱分隔（,）与运算符           -> 组内可断点（贪心合并，超宽才断行）
 * ------------------------------------------------------------------ */

function parseStructure(latex, options = {}) {
  const src = String(latex || '').trim();
  if (!src) return [];
  const commaAsStrong = options.commaAsStrong === true;
  const breakOnWeak = options.breakOnWeak !== false;

  const pieces = [];
  let brace = 0;
  let group = 0;
  let start = 0;
  let strongPending = false;

  const emit = (end, strongAfter) => {
    const text = src.slice(start, end).trim();
    if (text) pieces.push({ text, strongBefore: strongPending });
    strongPending = strongAfter;
  };

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];

    if (ch === '\\') {
      const rest = src.slice(i);
      const strong = rest.match(STRONG_CMD);
      if (strong && brace === 0 && group === 0) {
        emit(i, true);
        i += strong[0].length - 1;
        start = i + 1;
        continue;
      }
      const brk = rest.match(BREAK_CMD);
      if (breakOnWeak && brk && brace === 0 && group === 0) {
        emit(i, false);
        start = i;
        i += brk[0].length - 1;
        continue;
      }
      const cmd = rest.match(/^\\[A-Za-z]+/);
      i += cmd ? cmd[0].length - 1 : 0;
      continue;
    }

    if (ch === '{') brace += 1;
    else if (ch === '}') brace = Math.max(0, brace - 1);
    else if (ch === '(' || ch === '[') group += 1;
    else if (ch === ')' || ch === ']') group = Math.max(0, group - 1);

    if (brace === 0 && group === 0) {
      if (ch === ';') {
        emit(i + 1, true);
        start = i + 1;
        continue;
      }
      if (ch === ',' && breakOnWeak) {
        emit(i + 1, commaAsStrong);
        start = i + 1;
        continue;
      }
    }
  }
  emit(src.length, false);
  if (!pieces.length) return [{ lines: [src] }];

  const groups = [];
  let curLines = [];
  let acc = '';
  const flushLine = () => {
    if (acc.trim()) curLines.push(acc.trim());
    acc = '';
  };
  const flushGroup = () => {
    flushLine();
    if (curLines.length) {
      // 组内若仍有超宽行，回退到运算符处二次断行
      const expanded = [];
      curLines.forEach((line) => {
        splitOverlongLine(line).forEach((piece) => expanded.push(piece));
      });
      groups.push({ lines: expanded });
    }
    curLines = [];
  };

  pieces.forEach((piece, index) => {
    if (piece.strongBefore && index > 0) flushGroup();
    if (!acc) {
      acc = piece.text;
      return;
    }
    const candidate = `${acc} ${piece.text}`;
    if (measureWidth(candidate) <= MAX_LINE_WIDTH) {
      acc = candidate;
    } else {
      flushLine();
      acc = piece.text;
    }
  });
  flushGroup();
  return groups.length ? groups : [{ lines: [src] }];
}

/* ------------------------------------------------------------------ *
 * 排版策略
 * ------------------------------------------------------------------ */

// 行尾条件灰化
function grayifyCondition(line) {
  const m = line.match(TRAILING_COND);
  if (!m) return line;
  const head = line.slice(0, m.index);
  return `${head}{\\color{${COLOR_COND}}(${m[1]})}`;
}

/**
 * 超宽公式不再按运算符二次断行。
 *
 * 裸 = + - < >、绝对值、cases 和比较链都可能被错误切开，且页面本身
 * 已支持横向滚动。保留整块能让数学语义和视觉层级始终完整。
 */
function splitOverlongLine(line) {
  return [line];
}

// 去掉行尾分隔用的分号
function stripTrailingSemicolon(line) {
  return line.replace(/;\s*$/, '').trim();
}

function stripExplicitGroupIndex(line) {
  const wrapped = line.match(/^\\text\{\s*(?:\([0-9]+\)|（[0-9]+）)\s*([^{}]*)\}\s*/);
  if (wrapped) {
    // 保留 \text{...} 之后的正文，不能只返回剥离出的那一小段。
    const rest = line.slice(wrapped[0].length);
    const body = wrapped[1].trim() ? `\\text{${wrapped[1]}}` : '';
    return body + rest;
  }
  return line.replace(/^(?:\([0-9]+\)|（[0-9]+）)\s*/, '');
}

function stripExplicitGroupIndexes(groups) {
  if (groups.length <= 1) return groups;
  return groups.map(group => ({
    ...group,
    lines: group.lines.map((line, index) => (
      index === 0 ? stripExplicitGroupIndex(line) : line
    ))
  }));
}

/**
 * 完整排版（详情页公式用）
 *  - 单组单行：原样输出（居中、干净）
 *  - 单组多行：gathered 居中堆叠，组内行距
 *  - 多组    ：array{l} 左对齐清单 + (n) 编号着色 + 组间大间距
 */
function layoutFormula(latex, item) {
  const groups = FORCE_SINGLE_LINE_IDS.has(item.id)
    ? [{ lines: [String(latex || '').trim()] }]
    : stripExplicitGroupIndexes(parseStructure(latex, {
      commaAsStrong: COMMA_LIST_IDS.has(item.id),
      breakOnWeak: false
    }));
  const totalLines = groups.reduce((sum, g) => sum + g.lines.length, 0);

  if (groups.length <= 1 && totalLines <= 1) {
    return {
      expression: `\\displaystyle ${stripTrailingSemicolon(groups[0] ? groups[0].lines[0] : latex)}`,
      mode: 'single'
    };
  }

  if (groups.length <= 1) {
    // 单组、因超宽而换行：居中堆叠，不加编号
    const lines = groups[0].lines.map(stripTrailingSemicolon);
    const rows = lines.map((line, i) =>
      i === lines.length - 1
        ? `\\displaystyle ${line}`
        : `\\displaystyle ${line}\\\\[${LINE_GAP}em]`);
    return { expression: `\\begin{array}{@{}l@{}}${rows.join('')}\\end{array}`, mode: 'wrapped' };
  }

  // 多组：编号和公式分两列，换行时保持左侧编号和右侧公式整齐对齐。
  const indexColor = item.type === 'conclusion'
    ? COLOR_INDEX_CONCLUSION
    : COLOR_INDEX_CORE;
  const rows = [];
  groups.forEach((group, gi) => {
    const bodyLines = group.lines.map((rawLine) => {
      return grayifyCondition(stripTrailingSemicolon(rawLine));
    });
    const body = bodyLines.length === 1
      ? `\\displaystyle ${bodyLines[0]}`
      : `\\begin{array}{@{}l@{}}${bodyLines
        .map(line => `\\displaystyle ${line}`)
        .join(`\\\\[${LINE_GAP}em]`)}\\end{array}`;
    const prefix = `{\\color{${indexColor}}\\text{(${gi + 1})}}`;
    const veryLast = gi === groups.length - 1;
    rows.push(veryLast
      ? `${prefix} & ${body}`
      : `${prefix} & ${body}\\\\[${GROUP_GAP}em]`);
  });
  return {
    expression: `\\displaystyle\\begin{array}{@{}l@{\\quad}l@{}}${rows.join('')}\\end{array}`,
    mode: 'list'
  };
}

/**
 * 简化排版（填空版 / 例题用）：只做分层行距，不加编号
 */
function layoutPlain(latex) {
  const groups = parseStructure(latex);
  const totalLines = groups.reduce((sum, g) => sum + g.lines.length, 0);
  if (totalLines <= 1) {
    const only = groups[0] ? groups[0].lines[0] : latex;
    return { expression: `\\displaystyle ${stripTrailingSemicolon(only)}`, mode: 'single' };
  }
  const rows = [];
  groups.forEach((group, gi) => {
    group.lines.forEach((rawLine, li) => {
      const lastOfGroup = li === group.lines.length - 1;
      const veryLast = gi === groups.length - 1 && lastOfGroup;
      const gap = lastOfGroup ? GROUP_GAP : LINE_GAP;
      const body = grayifyCondition(stripTrailingSemicolon(rawLine));
      rows.push(veryLast ? body : `${body}\\\\[${gap}em]`);
    });
  });
  return { expression: `\\displaystyle\\begin{array}{@{}l@{}}${rows.join('')}\\end{array}`, mode: 'wrapped' };
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function toKey(id, kind) {
  return `${id.toLowerCase()}-${kind}`;
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true });

  const source = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const items = source.items;

  const tasks = [];
  const itemMap = {};
  for (const item of items) {
    const formula = {
      key: toKey(item.id, 'formula'),
      kind: 'formula',
      latex: item.latex,
      id: item.id,
      type: item.type
    };
    tasks.push(formula);
    itemMap[item.id] = { formula };

    if (item.blankLatex && item.blankLatex !== item.latex) {
      const blank = { key: toKey(item.id, 'blank'), kind: 'blank', latex: item.blankLatex };
      tasks.push(blank);
      itemMap[item.id].blank = blank;
    }
    if (item.example) {
      const example = { key: toKey(item.id, 'example'), kind: 'example', latex: item.example };
      tasks.push(example);
      itemMap[item.id].example = example;
    }
  }

  const measurements = {};
  const modeStat = { single: 0, wrapped: 0, list: 0 };
  const failed = [];

  tasks.forEach((task, index) => {
    try {
      const laid = task.kind === 'formula'
        ? layoutFormula(task.latex, task)
        : layoutPlain(task.latex);
      const rendered = renderExpression(laid.expression);
      measurements[task.key] = rendered;
      modeStat[laid.mode] = (modeStat[laid.mode] || 0) + 1;
      fs.writeFileSync(path.join(OUT_DIR, `${task.key}.svg`), rendered.svg, 'utf8');
    } catch (error) {
      failed.push(`${task.key}: ${error.message}`);
    }
    if ((index + 1) % 100 === 0 || index === tasks.length - 1) {
      console.log(`  rendered ${index + 1}/${tasks.length}`);
    }
  });

  // 数据模块
  const rows = items.map((item) => {
    const formula = measurements[itemMap[item.id].formula.key];
    const blankRef = itemMap[item.id].blank;
    const blank = blankRef ? measurements[blankRef.key] : null;
    const exampleRef = itemMap[item.id].example;
    const example = exampleRef ? measurements[exampleRef.key] : null;
    return {
      id: item.id,
      chapter: item.chapter,
      name: item.name,
      latex: item.latex,
      condition: item.condition || '',
      conditionDisplay: formatDisplayMath(item.condition || ''),
      pitfall: item.pitfall || '',
      pitfallDisplay: formatDisplayMath(item.pitfall || ''),
      example: item.example || '',
      explanation: item.explanation || '',
      voiceText: item.voiceText || item.name,
      tags: item.tags || [],
      type: item.type,
      typeLabel: item.type === 'conclusion' ? '二级结论' : '核心公式',
      grade: item.grade || '',
      blankLatex: item.blankLatex || '',
      blankAnswer: item.blankAnswer || '',
      formulaImage: `/assets/formulas/${item.id.toLowerCase()}-formula.svg`,
      formulaWidth: formula ? formula.width : 0,
      formulaHeight: formula ? formula.height : 0,
      blankImage: blank ? `/assets/formulas/${item.id.toLowerCase()}-blank.svg` : '',
      blankWidth: blank ? blank.width : 0,
      blankHeight: blank ? blank.height : 0,
      exampleImage: example ? `/assets/formulas/${item.id.toLowerCase()}-example.svg` : '',
      exampleWidth: example ? example.width : 0,
      exampleHeight: example ? example.height : 0
    };
  });

  const chapters = [...new Set(rows.map((item) => item.chapter))];
  const chapterCounts = {};
  for (const item of rows) {
    chapterCounts[item.chapter] = (chapterCounts[item.chapter] || 0) + 1;
  }

  fs.writeFileSync(DATA_OUT, `// Generated by extract/render_formulas_v2.js. Do not edit manually.
const FORMULAS = ${JSON.stringify(rows)};

const CHAPTERS = ${JSON.stringify(chapters)};

const CHAPTER_COUNTS = ${JSON.stringify(chapterCounts)};

module.exports = {
  FORMULAS,
  CHAPTERS,
  CHAPTER_COUNTS
};
`, 'utf8');

  console.log('');
  console.log('排版模式统计:', JSON.stringify(modeStat));
  console.log('渲染失败:', failed.length ? failed.join('; ') : '无');
  console.log('SVG 输出:', OUT_DIR);
  console.log('数据输出:', DATA_OUT);
}

main();
