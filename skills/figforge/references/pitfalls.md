# 踩过的坑

按工具分组。每条一行症状 + 一行解法。Satori 的坑在 `satori-figure/references/gotchas.md` 有详细版，这里只列索引。

## SVG → PDF

**inkscape 静默丢掉 base64 内嵌图。** 症状：SVG 在浏览器里好好的，PDF 里缩略图/照片消失，
日志里有一行 `WARNING: unsupported target 0`。
→ 只用 `rsvg-convert -f pdf in.svg -o out.pdf`。转完 `pdfimages -list out.pdf` 数一下内嵌图。
`scripts/svg2pdf.sh` 已内置这个校验。

**`pdfimages -list` 会数出几百个小图像对象。** 那是 rsvg-convert 把 Satori 的 `<mask>` 光栅化了，文字仍是矢量 path。
只有"SVG 有 base64 图、PDF 图像数为 0"才是丢图。

**纯文字 SVG 用 inkscape 没问题。** 这个 bug 只针对 `data:image/...;base64` 的 `<image>`。

## Satori（详见 `satori-figure/references/gotchas.md`）

| 症状 | 原因 | 解法 |
|---|---|---|
| `Expected <div> to have explicit "display: flex"` | 多子元素 div 必须声明 flex | JSX factory 自动注入 |
| 👤 ★ ⚙ 渲染成方块 | TTF 字体没有这些字形 | 用 `<div>` 画，或 inline SVG 当 `<img>` |
| data-URI 里的 `<linearGradient>` 不显示 | Satori 不解析 data-URI 内的引用 | 叠两层 `<img>` + `overflow:hidden` |
| 长句不换行 / 高亮被拆到两行 | 换行发生在 flex item 边界，不是单词边界 | 纯文本用单个 `<Text>`；带高亮的手动切分 |
| 高亮块比文字高 2px | `padding` 有上下值 + `alignItems:'center'` | `padding:'0 6px'` + `alignItems:'baseline'` + 显式 `lineHeight` |
| 箭头穿过气泡 | Satori 画不了箭头，后处理时通道 X 落在容器内 | 通道 X 钉在两个容器之间的间隙 |
| 改了 chip 颜色后箭头消失 | 后处理 regex 按 fill 颜色找锚点 | 改颜色同时改 `render.mjs` 里的 regex |
| `<img>` 不显示 | 没给显式数字 `width`/`height` | 必须给 |
| 字重 600 渲染成 400 | 没加载那个 weight 的 TTF | 用到几个 weight 就加载几个 |

## ImageGen

**Gemini 免费额度按 UTC 零点重置。** `limit: 0` 就是耗尽了，等第二天或换 key。多个 key 配额独立。

**`GOOGLE_API_KEY` 优先级高于 `GEMINI_API_KEY`。** SDK 会先读前者。想用后者就 `unset GOOGLE_API_KEY`。

**文字必须逐字核对。** 候选 A 把 Retrieve 拼成 Releieve；这不是偶发，是 ImageGen 的本性。
prompt 里 `Text (verbatim)` 字段写了什么，出图后对着看。

**Gemini 出的示意图 label 位置不可用。** 它会把标签放在"看起来平衡"的地方，而不是"指向正确对象"的地方。
探索可以，终稿走 TikZ 或 Satori（TRACE Fig 2 就是这么退回 TikZ 的）。

## matplotlib

**`adjustText` 在 ≥10 个 label 时必有交叉。** 它优化的是"不重叠"，不是"引线不交叉"。
→ 手动坐标表 + "左右顺序不变量"，见 `matplotlib-pub.md`。

**`bbox_inches='tight'` 会改变最终尺寸。** 你设的 `figsize=(5.2, 3.6)` 出来可能是 5.4×3.7。
论文里用 `width=\linewidth` 让 LaTeX 缩放，不要假设 PDF 尺寸精确等于 figsize。

**中文字体缺失显示方块。** `rcParams['font.sans-serif'] = ['Noto Sans CJK SC', ...]`，
并 `axes.unicode_minus = False`，否则负号也是方块。

**系统 python 没有 matplotlib。** 用 `uv run --with matplotlib script.py` 或项目 venv。

## LaTeX 集成

**PNG 进论文放大糊。** 所有代码生成的图都出 PDF，`\includegraphics{fig.pdf}`。
唯一例外是截图类（UI、标注工具界面）。

**`\includegraphics[width=0.98\linewidth]`** 而不是固定 `width=5in`——双栏/单栏切换时不用改。

**Satori 出的 SVG 里字体是 path 轮廓**（`embedFont: true`），PDF 不依赖系统字体，
但也意味着 PDF 里的文字不可选中、不可搜索。论文 Figure 可接受；如果要可搜索，`embedFont: false` 并确保编译环境有 Lato。

## 流程

**一次改多处。** 图坏了不知道是哪处。→ 一次一处，见 `iteration-loop.md`。

**覆盖了好版本。** `OUT_SVG` 没改版本号，v9 把 v8 盖了，v8 其实更好。→ 文件名带版本号。

**没记为什么。** 三个月后看到 `CHANNEL_X = 706` 不知道 706 怎么来的。
→ 每个魔数旁边一行注释；每轮改动进 `ITERATION_REPORT.md`。

**探索阶段就追求完美。** ImageGen 出的候选图花半小时调 prompt——浪费。候选图看构图就够，细节留给代码。

**跳过 2× 检查直接进论文。** 编译出来才发现 baseline 错位，又回去改，再编译。
→ `inspect_figure.py` 四象限过一遍再转 PDF。
