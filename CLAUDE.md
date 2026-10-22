# CLAUDE.md - 高中数学公式记忆助手接管指南

> 更新时间：2026-10-22
> 当前工作区：`D:\1shu\2gongshi0.2 - 副本`
> 适用对象：Claude / 下一任代码代理
> 本文件是当前交接入口。它描述的是**这个副本的实际状态**，不是旧会话中的旧目录状态。

## 1. 先看这里

这个项目是给高中生记忆数学公式的微信小程序。用户 `snow` 是开发新手，
不会使用命令行，也不应该被要求手动执行脚本、改代码或操作 Git。

接手后先做只读检查，不要一上来改业务文件。确认现状后，用中文向用户说明：

- 现在实际是什么状态；
- 发现哪些与历史记录不一致的地方；
- 准备改哪些文件、为什么改；
- 改完如何验证、有什么风险。

除非用户在当前对话中明确要求继续执行，否则不要直接实施大范围改造。

## 2. 当前真实状态

### 2.1 工程与数据

- 小程序真身：`新建文件夹/`
- 固定数据量：366 条
  - `C001-C253`：核心知识点，253 条
  - `S001-S113`：二级结论，113 条
- 当前数据文件：`新建文件夹/data/formulas.js`
  - 366 条，366 个唯一 ID
  - 约 358,059 字节
  - 当前数据中有 16 个实际章节
  - 有 172 条带 `blankLatex`
  - 有 6 条带 `example`
- 当前公式资源是 SVG，不是 PNG 精灵图。
- 当前三个公式分包共 544 个 SVG，约 5.07 MiB：
  - `formula-package-a`：197 个文件，1,800,997 字节
  - `formula-package-b`：183 个文件，1,766,736 字节
  - `formula-package-c`：164 个文件，1,751,862 字节

公式尺寸差异很大。当前主公式的宽度范围约为 55-454，
高度范围约为 26-898；最高的几条包括 `S044`（264x898）、
`C058`（228x753）和 `S040`（454x626）。因此不能假设所有公式
都能用同一套固定宽度正确显示。

### 2.2 页面与分包

`新建文件夹/app.json` 当前声明：

- 主包页面：
  - `pages/startup/startup`
  - `pages/index/index`
  - `pages/detail/detail`
  - `pages/favorites/favorites`
  - `pages/practice/practice`
- 公式分包：
  - `formula-package-a` / `formulaA`
  - `formula-package-b` / `formulaB`
  - `formula-package-c` / `formulaC`

每个公式分包目前只有一个 `pages/loader/loader` 页面。
当前启动链路仍然是：

```text
startup
  -> formula-package-a/pages/loader/loader
  -> formula-package-b/pages/loader/loader
  -> formula-package-c/pages/loader/loader
  -> pages/index/index
```

四个页面依次显示约 2%、36%、69%、100% 的进度。这个链路会产生
多次整页跳转、闪屏和重复加载观感，和用户历史反馈一致。

### 2.3 公式显示组件

当前 `新建文件夹/components/formula-image/formula-image.js` 只支持：

- `maxWidth`
- `zoom`

它按资源原始尺寸计算：

```js
const naturalWidth = assetWidth * LOGICAL_RPX * zoom
const naturalHeight = assetHeight * LOGICAL_RPX * zoom
```

组件没有 `maxHeight`、场景模式或统一的公式视觉高度。长公式会把
卡片撑高，短公式又会显得偏小，所以列表、详情和练习中很容易出现
尺寸不统一、基线不一致的观感。

### 2.4 选择题布局

当前 `新建文件夹/pages/practice/practice.wxml` 中，选项仍然是：

- 整行 `choice-item`
- A/B/C/D 使用绝对定位在左上角
- 公式占据整行并居中
- 正确/错误状态使用绝对定位在右上角

对应 `practice.wxss` 仍有 `padding: 58rpx 18rpx 18rpx`、
绝对定位字母和绝对定位状态。公式宽度变化时，这种结构容易显得凌乱。

### 2.5 发布状态

历史会话中，2026-09-19 用户提供的截图显示“小程序备案审核中”。
这只是历史状态，**当前是否已经备案通过、提交代码审核、点击发布，
必须以用户当前微信公众平台后台为准，不能根据本仓库判断。**

以下内容都不等于正式发布：

- 微信开发者工具中的“编译”；
- 真机预览码；
- 体验版；
- 开发版；
- 历史二维码图片。

正式上线通常需要：备案完成 -> 代码审核通过 -> 点击发布 ->
搜索收录。不要宣称小程序已经公开上线。

## 3. 数据真源与生成链路

数据真源只有一个：

```text
prototype/data/公式库-全量.json
```

不要随手直接改小程序里的生成文件。

标准数据链路：

```text
prototype/data/公式库-全量.json
  -> extract/render_formulas_v2.js
  -> extract/build/formulas.js + extract/build/formulas/*.svg
  -> extract/build_svg_subpackages.js
  -> 新建文件夹/data/formulas.js
  -> formula-package-a/b/c/assets/formulas/*.svg
```

注意：`extract/build_svg_subpackages.js` 会重新清理并生成三个分包中的
公式资源目录，属于有覆盖风险的构建操作。运行前必须先备份，并确认
用户允许重新生成公式资源。

### 3.1 公式条目 schema

数据条目通常包含：

```jsonc
{
  "id": "C042",
  "chapter": "数列",
  "name": "等差数列求和",
  "latex": "S_n=\\frac{n(a_1+a_n)}{2}",
  "condition": "适用条件",
  "pitfall": "易错点",
  "example": "例题",
  "voiceText": "纯中文口语朗读版",
  "tags": ["数列"],
  "type": "core|conclusion",
  "grade": "高一|高二",
  "blankLatex": "S_n=\\frac{\\square}{2}",
  "blankAnswer": "\\frac{n(a_1+a_n)}{2}"
}
```

### 3.2 数据红线

- 公式数学正确性高于排版和文案。
- 不确定时使用保守、标准、可验证的公式形式。
- 二级结论必须写清适用条件。
- `latex` 不加 `$` 包裹。
- 中文放进 `\text{}`。
- 顶层 `\quad` / `\qquad` 是 UI 拆行分隔符，不要随意放进 `\text{}`。
- KaTeX 不支持 ①②③ 等圈号，必须转成 `(1)(2)`。
- `\square` 后面必须有空格或非字母字符。
- 不要修改稳定的 366 个 ID 编号。
- 不展示年级分类；`grade` 仅供数据溯源。

## 4. 产品固定决策

以下决定已经确认，不要在未征得用户同意时改回去：

- 分类只按“核心公式 / 二级结论 / 全部”+“章节”两级筛选。
- 不增加年级分类。
- 卡片默认只显示公式本体；条件、易错点、例题折叠显示。
- 长公式按顶层 `\quad` / `\qquad` 拆行，短公式保持单行。
- 听背只念公式名，用户手动点“看公式”，再手动点“下一条”。
- 听背没有定时停顿、没有倒计时。
- 练习和听背的自评都写入遗忘曲线。
- 自评规则保持：会=7 天后；模糊=明天；不会=当天重现并进错题本。
- 收藏页有章节分类条，并有“听背收藏”“练习收藏”入口。
- 练习范围支持“仅收藏”。
- 听背默认 10 条，可选 5/10/15/20/全部；保留盲测和标记错题逻辑。
- 合规定位只能是工具：查询、记忆、自测；不要写“辅导”“课程”
  “提分”“名师”“押题”“卖课”等容易触发教育类目风险的文案。
- 工程目录名 `新建文件夹` 不要重命名。

## 5. 历史决策与当前副本的冲突

2026-09-12 前后的历史会话中，用户反馈过：

1. 首次打开持续屏闪、似乎反复转圈。
2. 公式大小差异明显，部分公式没有对齐。
3. 选择题 A/B/C/D 布局不美观。

用户当时明确选择了“方案 B”：

- 保留 SVG 三个分包；
- 只保留一个启动进度页；
- 在启动页并发加载 A/B/C 三个分包；
- 只显示一次进度，不再连续跳转多个 loader 页面；
- 为公式显示增加统一高度/适配模式；
- 选择题改为更整齐的单列布局。

但请特别注意：**当前副本没有体现这套改造。**

- `startup.js` 仍然是四段跳转。
- `formula-image` 仍然没有 `maxHeight` 或 fit 模式。
- 选择题仍然使用多组绝对定位。
- 旧的 `assets/formulas`、`assets/sprites`、`data/sprite-map.js`
  仍然实际存在，只是在 `project.config.json` 中被打包忽略。

因此不能把“方案 B”写成已经完成，也不能假设旧会话中描述的修复
已经在当前文件里。Claude 接手后应先判断：这个副本是旧快照、
回退版本，还是当前工作区发生了回归。判断前不要用旧会话覆盖现有文件。

如果用户明确要求继续方案 B，可参考以下方向，但仍需先向用户确认：

1. 把 `pages/startup/startup` 改成唯一启动页。
2. 在该页并发调用 `wx.loadSubpackage` 加载 A/B/C。
3. 只维护一个进度条，增加失败提示和重试。
4. 保留三个分包各自的 loader 页面作为占位页，因为分包通常至少需要
   一个页面，但不再通过页面跳转加载它们。
5. 重点验证：主包页面引用分包内 SVG 是否能在目标微信运行时正常显示。
   如果运行时不支持，方案 B 需要重新评估，不能只看静态文件。
6. 为 `formula-image` 增加 `maxHeight` / fit 模式，并为列表、详情、
   练习分别设置固定展示框。
7. 把选择题改成单列 Flex：左侧固定字母，中间统一高度公式区，
   右侧预留状态区，去掉多层绝对定位。

## 6. 构建与验证

常规静态验证：

```bash
npm test
```

如果 PowerShell 提示 `npm.ps1` 被系统执行策略禁止，不要修改系统策略，
直接使用等价的：

```powershell
npm.cmd test
```

它会依次执行：

- `node extract/validate_assets.js`
- `node extract/smoke3.js`
- `node extract/check_katex.js`

只检查数据与 SVG 资产：

```bash
node extract/validate_assets.js
```

当前资产校验的已核实基线：

```json
{
  "formulas": 366,
  "uniqueIds": 366,
  "assetFiles": 544,
  "assetMB": 5.07,
  "errorCount": 0,
  "warningCount": 0
}
```

当前完整校验基线为：21 项运行时断言通过、0 失败；KaTeX 主公式和
填空版渲染失败均为 0。

修改公式数据后的标准顺序：

```bash
node extract/render_formulas_v2.js
node extract/build_svg_subpackages.js
node extract/validate_assets.js
npm test
```

`render_formulas_v2.js` 需要 `tools/mathjax/node_modules` 中的 MathJax。
如果需要补齐依赖：

```bash
npm install --prefix tools/mathjax
```

但用户不会使用命令行。Claude 应自行运行这些命令并把结果翻译成中文
结论，不要把命令清单直接交给用户。

如果只改 UI，不要无谓地重新渲染全部 366 条公式和 544 个 SVG。
先做局部验证，再决定是否触发完整数据构建。

静态测试通过不代表微信运行时通过。涉及启动、分包、公式图片和触控
布局的改动，至少还需要：

- 微信开发者工具编译；
- 首页、详情、收藏、练习四个界面的截图检查；
- 真机或预览环境检查首次启动、分包加载和长公式显示；
- 错误日志/控制台检查。

## 7. 发布与敏感信息

- `新建文件夹/project.config.json` 当前使用 `touristappid`，适合本地预览。
- 不要在公开文件、截图、日志或回答中输出真实 AppID、AppSecret、令牌、
  私人路径或未经授权的扫描资料。
- 历史会话和旧交接文档中出现过真实 AppID 或其他平台配置，不能复制到
  当前文档或代码中。
- `project.private.config.json`、`.env`、本地开发者工具配置和原始扫描
  PDF 不应进入公开提交。
- `原始资料/` 是扫描件，不能当作可公开分发的素材。
- 当前发布状态未知，不要根据预览二维码或历史截图判断已上线。

## 8. 已过时或不可直接依赖的资料

### `交接-Codex接管.md`

写于 2026-09-13，曾经有价值，但其中这些描述已经过时或不适用于本副本：

- PNG 精灵图作为当前公式资源；
- 旧主包体积约 1815 KB；
- 真实 AppID；
- 当前页面结构、分包状态和发布状态。

只把它当作历史记录，不要把它当成当前事实来源。

### `AGENTS.md`

- §1、§5、§6 是早期网页原型阶段的描述，已过时。
- §2 的数据管线、§4 的 schema 与数据红线、§7 的协作规矩仍然有效。
- 本文件与 AGENTS 的现状描述冲突时，以当前代码、`README.md`、
  `CHANGELOG.md` 和本文件的已核实事实为准；产品红线不可违背。

### 历史会话

`D:\91\.codex` 中的沟通记录可用于理解用户意图，但不是当前工程状态的
证明。可参考的关键记录：

- `D:\91\.codex\sessions\2026\09\12\rollout-2026-09-12T22-31-20-01a09607-ade1-7bc2-938e-fb65316ebac9.jsonl`
  - 用户反馈启动屏闪、多次转圈、公式大小不一、选择题布局差；
  - 用户明确选择方案 B。
- `D:\91\.codex\sessions\2026\09\19\rollout-2026-09-19T23-10-55-01a0ba38-6e4a-79f3-b2ec-fc784388ffeb.jsonl`
  - 当时的发布状态是备案审核中；
  - 开发版、体验版、预览码都不等于正式发布。

历史会话中另有一些声音工具和审批相关内容，与本小程序无关，不要扩大读取
范围，也不要把会话原文复制进项目。

### Git

当前根目录虽然存在 `.git`，但没有可用的历史提交，绝大多数文件处于未跟踪
状态。不要依赖 `git reset`、`git checkout` 或 `git diff` 回滚。
动文件前使用文件系统备份，例如复制到 `_backup/` 下带时间戳的目录，
并先确认目标路径没有越出工作区。

## 9. 安全操作顺序

1. 先读本文件、`README.md`、`package.json` 和当前相关源码。
2. 用 `rg` 查找引用，不凭旧文档猜测。
3. 先运行 `npm test`，记录当前基线。
4. 检查 `新建文件夹/app.json`、启动页、三个 loader、
   `formula-image`、`practice` 和 `project.config.json`。
5. 如果要改动，先做当前工程备份。
6. 只改与当前任务直接相关的文件，不做无关重构。
7. 不删除历史文件；先列出候选、确认无引用、征得用户同意后再移到备份区。
8. 改完运行自动验证，并报告具体文件、数字和未验证项。
9. 如果无法运行微信开发者工具或真机验证，必须明确说明，不要写成已通过。

## 10. Claude 的第一次检查清单

第一次接手时，建议只做只读检查并按以下顺序汇报：

1. `新建文件夹/app.json` 是否仍然是四段启动链路。
2. `pages/startup` 和三个 `loader` 是否仍各自跳转。
3. `components/formula-image` 是否仍没有 `maxHeight` / fit 模式。
4. `pages/practice` 是否仍使用绝对定位的 A/B/C/D 和状态。
5. `新建文件夹/data/formulas.js` 是否仍是生成物，且 366 条数据完整。
6. 544 个 SVG 是否齐全，`npm test` 是否仍然通过。
7. 旧 `assets/formulas`、`assets/sprites`、`data/sprite-map.js`
   是否仍被 `project.config.json` 忽略。
8. 发布状态是否只能由用户在微信公众平台核实。

汇报后先提出小范围方案，等用户确认再改。方案至少说明：

- 是否继续方案 B；
- 是否需要重构公式显示组件；
- 是否重排选择题；
- 是否清理旧资源；
- 验证会用哪些命令和哪些真机检查；
- 失败时如何回退。

## 11. 一句话交接

当前副本是一个数据完整、SVG 分包可用、静态验证通过，但启动链路和
公式/选择题布局仍未对齐历史方案 B 的微信小程序工程。先核实，再讨论，
再改动；不要用旧交接文档或旧会话直接覆盖当前文件。
