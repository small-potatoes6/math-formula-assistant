# 高中数学公式记忆助手

一个面向高中数学公式记忆的微信小程序，附带一个可直接打开的单文件网页原型。

项目包含 366 条公式条目：253 条核心知识点（C001-C253）和 113 条二级结论（S001-S113）。小程序使用离线 SVG 资源显示公式，不依赖运行时网络。

## 功能

- 按核心公式、二级结论、章节筛选
- 公式详情、适用条件、易错点与例题
- 收藏、练习、填空和错题记录
- 基于遗忘曲线的复习安排
- 手动听背与盲测
- 网页原型可离线打开，公式由 KaTeX 渲染

## 目录

```text
新建文件夹/                 微信小程序源码与离线公式资源
prototype/                  单文件网页原型
prototype/data/             结构化公式数据
extract/                    数据构建、公式渲染和校验脚本
design/                     小程序图标与设计资源
tools/                      开发期使用的第三方工具配置
```

公开仓库不会包含原始扫描 PDF、扫描页裁图、历史备份、私有 AppID、机器绝对路径或个人邮箱。它们保留在本地工作目录中，但不参与提交。

## 运行小程序

1. 安装微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择仓库中的 `新建文件夹/`。
4. 仓库内的 `project.config.json` 使用 `touristappid`，可直接用于本地预览。
5. 如果你要发布自己的小程序，请在微信开发者工具中填写自己的 AppID。个人私有配置不要提交。

## 打开网页原型

直接双击：

```text
prototype/公式记忆助手-原型.html
```

网页原型从 CDN 加载 KaTeX；离线时会降级显示 LaTeX 源码。

## 数据与校验

需要 Node.js 18 或更高版本。

```bash
npm test
```

该命令依次检查：

- 366 条数据、ID 唯一性和三个 SVG 分包资源完整性
- 网页原型的 12 项核心交互断言
- 全部主公式与填空公式的 KaTeX 语法

只检查资源：

```bash
node extract/validate_assets.js
```

## 重新生成公式资源

公式资源已经提交到仓库，一般不需要重新生成。修改 `prototype/data/公式库-全量.json` 后，可按以下顺序执行：

```bash
node extract/render_formulas_v2.js
node extract/build_svg_subpackages.js
node extract/validate_assets.js
```

`render_formulas_v2.js` 需要 `tools/mathjax/node_modules` 中的 MathJax：

```bash
npm install --prefix tools/mathjax
```

## 数据约定

- `id`：`C` 表示核心知识点，`S` 表示二级结论
- `latex`：不带 `$` 的 KaTeX 表达式
- `condition`：适用条件
- `pitfall`：易错点
- 顶层 `\quad` 或 `\qquad` 用作多行公式分隔符
- 二级结论必须写明适用条件

## 许可证

- 代码：MIT，见 `LICENSE`
- 作者原创文档、整理结构与注释：CC BY 4.0，见 `CONTENT-LICENSE.md`
- 第三方组件：见 `THIRD_PARTY_NOTICES.md`

仓库不包含原始扫描 PDF。公式和例题可能来源于公开教学资料；仓库的内容许可仅覆盖项目作者有权许可的部分，不代替对第三方来源权利的判断。

## 参与贡献

提交前请阅读 `CONTRIBUTING.md` 和 `SECURITY.md`。不要在 Issue、截图或提交中加入 AppSecret、私有 AppID、访问令牌或未获授权的整页扫描资料。
