# 图型 → 工具链 判定

先回答三个问题，答案直接决定工具：

1. **图里的内容是数据算出来的，还是人排出来的？**
   数据 → matplotlib。人排 → 往下。
2. **有没有需要对齐的文字流？**（多行文字、气泡、卡片、引用、标签）
   有 → JSX/Satori 或 HTML。没有 → 往下。
3. **有没有物理尺寸要求？**（A0 海报、600mm 宽、幻灯片 16:9 精确到 mm）
   有 → HTML `@page`。没有 → JSX/Satori。

## 判定表

| 识别特征 | 工具链 | 起手模板 | 交付 | TRACE 里的实例 |
|---|---|---|---|---|
| 坐标轴、图例、误差线、数据点 | matplotlib | `matplotlib-pub.md` | `fig.pdf` + `fig.png@300dpi` | Fig 4 CGS-vs-Recall 散点（13 个 label 手动放） |
| 对话气泡、引用高亮、卡片、"vs" 对比、pipeline 节点带说明文字 | JSX → Satori → SVG | `satori-figure/assets/starter.jsx` | `rsvg-convert -f pdf` | Fig 1 teaser（v8–v10）、Fig 3 pipeline |
| 海报、一页纸摘要、需要 `mm` 精度 | HTML + CSS `@page` | `html-print.md` | Chromium `--print-to-pdf` | NeurIPS 海报 600×1500 mm |
| 数学符号密集、图论、张量形状 | TikZ | 直接写 `.tex` | `\input{}` | Fig 2 pipeline v5（Gemini 版被替换） |
| 需要"看起来像照片"的东西：场景、材质、封面 | ImageGen（OpenAI `gpt-image-1` / Gemini） | `imagegen.md` prompt 模板 | PNG → 嵌入上面任一种 | Fig 1 探索阶段的 8 张候选 |
| 一个图标、一根箭头、一个圆柱 | `<div>` 画或手写 `<svg>` | `satori-figure/references/patterns.md` §5–7 | inline | 头像、KB 圆柱、星级 |

## 边界情况

**混合图**（代码框架 + 栅格素材）是最常见的真实情况。TRACE Fig 1 v9 的餐厅缩略图就是栅格
（真实 Yelp 照片；换成 ImageGen 出的图走同一条路）：

```
PNG 素材 → base64 → JSX 里 <img src="data:image/jpeg;base64,..." width={108} height={108}>
```

Satori 要求 `<img>` 显式 `width`/`height`；转 PDF 必须用 `rsvg-convert`，inkscape 会静默丢掉这些内嵌图。

**"ImageGen 出的已经很好了，能不能直接用？"** 检查四件事，任一不过就不能：
1. 图里所有文字逐字核对（TRACE 候选 A 把 Retrieve 拼成 Releieve）
2. 审稿人要求改一个词，你能改吗？（PNG 不能）
3. 放大 4× 还清晰吗？（栅格不行）
4. 三个月后能一键重出吗？（prompt 不可复现）

**"数据图但想要 Satori 那种排版感"**：matplotlib 出核心图 → 存 SVG → 作为 `<img>` 嵌进 JSX 加标题栏、说明卡片。
两者各管各的，别在 matplotlib 里硬排文字卡片。

**"只有一个 pipeline 框图，几个节点几根箭头"**：如果节点里有 ≥2 行说明文字，走 Satori；
如果只是单词 + 箭头，TikZ 更快。TRACE Fig 2 就是从 Gemini PNG 退回 TikZ 的。

## 反模式

- 在 PPT 里画完截图贴进论文 → 栅格、字体不一致、改不动
- 让 ImageGen "生成一张 Nature 风的 Figure 1" 然后直接用 → 文字必错
- matplotlib 里用 `adjustText` 自动排 label 就交稿 → 13 个 label 以上必有交叉，见 `matplotlib-pub.md`
- 手写 SVG 坐标 → 改一个字号要动 10 处坐标，TRACE v3–v7 的血泪史见 `examples/trace-figure1/ITERATION_REPORT.md` §1
