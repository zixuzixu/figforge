# 案例：TRACE 论文的 Figure 1，13 轮迭代

一张 teaser 从"手写 SVG 改一个字要动十处坐标"到"JSX 里改一个字符串自动重排"，中间淘汰了
OpenAI 3 张、Gemini 5 张候选。这个目录是全部原始材料。

## 先看图

| 文件 | 是什么 | 结局 |
|---|---|---|
| `01-imagegen-candidate-a.jpg` | OpenAI `gpt-image-1`，结构化 prompt | 淘汰。中间那栏把 **Retrieve 拼成了 Releieve**。构图太平 |
| `01-imagegen-candidate-b.jpg` | 同上，对比式构图 | 淘汰。但"左 baseline 右 ours + VS"这个构图被 `04` 继承了 |
| `02-gemini-alternative.jpg` | Gemini，第 5 次修正 | 淘汰。label 位置不可控 |
| `03-final-satori-v9.png` | **论文里的 Figure 1**。Satori JSX，v8m → v9 | 用了 |
| `04-final-satori-comparison.png` | 对比式变体，slides 用 | 用了 |

`01` 和 `04` 放在一起就是整个方法论：**ImageGen 给了构图方向，代码把它做成能发表的样子。**

## 迭代过程

`ITERATION_REPORT.md` 是当时逐轮写的记录：v3 手写 SVG → v5–v7 Python 生成 SVG → v8 迁移到 Satori →
v8c/d/g/h/i/j/k/l/m 每轮修一个问题（emoji 豆腐块、箭头穿气泡、高亮基线、行长不平衡……）→ v9 定稿。

第二部分 "What Went Wrong and How It Was Fixed" 的 9 条，后来全部进了 `satori-figure/references/gotchas.md`。

## ImageGen 的 prompt

`imagegen-prompts.jsonl` 是三条真实 prompt。注意它们的结构完全一样（九个字段），只在
Primary request / Subject / Composition 上不同——这样三张候选之间才有可比性。

```bash
python3 ../../skills/figforge/scripts/imagegen.py imagegen-prompts.jsonl --outdir /tmp/cand
```

## 自己渲染一遍

```bash
npm install --no-save satori esbuild          # 一次
node render_fig1_trace_comparison_v1.mjs      # → fig1_trace_comparison_v1.svg, <2s
uv run ../../skills/figforge/scripts/inspect_figure.py fig1_trace_comparison_v1.svg
../../skills/figforge/scripts/svg2pdf.sh fig1_trace_comparison_v1.svg fig1.pdf
```

需要系统装有 Lato 字体（`/usr/share/fonts/truetype/lato/`，Ubuntu `apt install fonts-lato`）。
没有的话改 `render_*.mjs` 里的 `latoDir`。

`fig1_trace_comparison_v1.jsx` 有 740 行——不是因为复杂，是因为每个视觉元素都是显式的：
头像是 `<div>` 画的、星级是 inline SVG、KB 圆柱是三个叠起来的椭圆。读一遍 `C = {...}` 那段 token 定义，
再读 `LeftPanel` / `RightPanel` 两个组件，就知道这类图怎么搭了。

## 数据来源

对话和评论文本来自论文使用的 Yelp 公开数据集。论文：*TRACE: Tourism Recommendation with
Accountable Citation Evidence*（arXiv 预印本）。
