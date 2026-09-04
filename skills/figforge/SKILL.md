---
name: figforge
description: >-
  科研插图工作流编排（paper figure / teaser / pipeline 图 / 海报 / 数据图）。核心原则：ImageGen
  （OpenAI gpt-image、Gemini）只做方向探索和栅格素材，终稿必须由代码渲染（JSX→Satori、HTML→PDF、
  matplotlib、TikZ）以保证文字不出错、矢量、可编辑、可复现。用户说"画一张论文图"、"做 Figure 1"、
  "科研绘图"、"paper figure"、"teaser figure"、"pipeline 图"、"做海报"、"把草图做成正式图"、
  "用 AI 生成论文插图"、"我的论文图不好看"、"Nature 风插图"时触发。按图的类型选工具链 →
  可选 ImageGen 探索 → 代码搭骨架 → 2× 渲染 + 四象限检查迭代 → rsvg-convert 出 PDF。
---

# FigForge — 科研插图工作流

一张发表级插图不是"让 AI 画一张图"，而是三种能力的分工：

| 能力 | 负责什么 | 不负责什么 |
|---|---|---|
| **生成式 AI**（ImageGen） | 探索构图方向；产出照片级素材、纹理、图标风格 | 终稿。它会把 *Retrieve* 拼成 *Releieve*，布局不可控，输出非矢量、不可编辑 |
| **代码渲染**（JSX / HTML / matplotlib / TikZ） | 终稿：精确布局、文字零错误、矢量 PDF、git 可追踪 | 从零想视觉方向（这是 ImageGen 的活） |
| **迭代纪律** | 2× 渲染、四象限放大检查、一次只改一处、版本号文件、迭代报告 | — |

> 真实案例：TRACE（arXiv 预印本，投稿 NeurIPS 2026 D&B）的 Figure 1 经历 13 轮迭代，OpenAI 3 张候选 + Gemini 5 张全部淘汰，
> 最终由 Satori JSX 渲染。全过程见 `examples/trace-figure1/`。

## 第 0 步：先定类型，再选工具

| 图长什么样 | 工具链 | 交付格式 |
|---|---|---|
| 散点 / 柱状 / 折线 / 热力，**数据驱动** | matplotlib → `savefig(pdf, dpi=300)` | PDF（LaTeX）+ PNG |
| Teaser / 对比图 / 对话示意 / 流程卡片，**有文字流和对齐需求** | JSX → Satori → SVG → `rsvg-convert` | PDF + SVG |
| 海报 / 一页纸 / 幻灯片母版，**按物理尺寸排版** | HTML + CSS `@page` → Chromium `--print-to-pdf`（或 Typst） | PDF |
| 数学示意 / 图结构 / 交换图 | TikZ | 直接 LaTeX |
| 照片级素材 / 氛围 / 封面底图 | ImageGen → PNG → 作为素材嵌入上面任一种 | PNG 素材 |
| 单个图标、一根箭头 | 手写 SVG 或 `<div>` 画 | inline |

完整判定规则和边界情况：`references/decision-tree.md`。

## 工作流

### 1. 探索（可选，只在方向不明时做）

用 `scripts/imagegen.py` 从一份 `prompts.jsonl` 批量出 2–3 张候选。Prompt 必须结构化
（Primary request / Use case / Asset type / Scene / Subject / Style / Composition / Palette / Text verbatim），
模板和真实样本见 `references/imagegen.md`。

**候选图的用途是看方向、抄构图，不是交稿。** 看完就进入第 2 步。

### 2. 搭骨架

- JSX 示意图 → 调用 **`satori-figure`** skill（本仓库自带），用它的 `starter.jsx` + `render_template.mjs`
- 数据图 → `references/matplotlib-pub.md` 里的模板；label 位置**手动放**，不信 adjustText
- 海报 → `references/html-print.md` 的 `@page` 模板
- 需要栅格素材 → ImageGen 出图后 base64 嵌入 `<img>`（Satori 要显式 width/height）

### 3. 迭代

```bash
uv run scripts/inspect_figure.py fig1.svg      # → 2× PNG + 四象限 TL/TR/BL/BR
```

每轮只改一处，文件名带版本号（`fig1_v8.svg`, `fig1_v9.svg`），把每轮改了什么、为什么记进
`ITERATION_REPORT.md`。完整纪律见 `references/iteration-loop.md`。

**别盯着缩略图看。** 四象限放大后才看得见 baseline 错位、右边缘不齐、箭头穿过气泡。

### 4. 交付

```bash
scripts/svg2pdf.sh fig1.svg figures/fig1.pdf    # rsvg-convert + pdfimages 校验内嵌图没丢
```

LaTeX 里 `\includegraphics[width=\linewidth]{figures/fig1.pdf}`。海报/社媒另出 300 dpi PNG。

## 已知的坑（先看再动手）

`references/pitfalls.md` 收录了所有踩过的：inkscape 会静默丢掉 base64 内嵌图（用 rsvg-convert）、
Satori 多子元素必须 `display:flex`、字体没有的字形渲染成豆腐块、data-URI 里的渐变不生效、
Gemini 免费额度按 UTC 重置、`GOOGLE_API_KEY` 会覆盖 `GEMINI_API_KEY`……

## 什么时候不用这套

- 纯探索性的草图，不打算发表 → 随便画
- 交互式图表 → 这套只出静态
- 已经有满意的 matplotlib 脚本，只是想换个配色 → 直接改，不用走流程

## 文件

| 路径 | 内容 |
|---|---|
| `references/decision-tree.md` | 图型 → 工具链 判定表 + 边界情况 |
| `references/imagegen.md` | ImageGen 的正确用法、结构化 prompt 模板、为什么不能当终稿 |
| `references/iteration-loop.md` | 迭代纪律：2×、四象限、版本号、迭代报告 |
| `references/matplotlib-pub.md` | 数据图发表规范；手动 label 放置的方法 |
| `references/html-print.md` | HTML 海报：`@page`、mm 单位、设计 token、导出 |
| `references/pitfalls.md` | 所有踩过的坑，按工具分类 |
| `scripts/imagegen.py` | OpenAI Images API 批量出图（读 jsonl） |
| `scripts/inspect_figure.py` | SVG/PNG → 2× + 四象限，迭代辅助 |
| `scripts/svg2pdf.sh` | rsvg-convert + 内嵌图校验 |
| `../satori-figure/` | JSX → Satori 的完整工具链（starter、render、gotchas、patterns） |
