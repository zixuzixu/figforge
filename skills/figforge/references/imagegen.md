# ImageGen 的正确用法

## 定位：探索 + 素材，不是终稿

ImageGen 在科研插图里只有两个合法用途：

1. **方向探索**——脑子里没有构图时，花 5 分钟出 3 张候选，看哪种布局讲得清楚，然后**用代码重做**。
2. **栅格素材**——照片级场景、材质、封面底图、氛围图。这些代码画不出来，是 ImageGen 的独占领域。

它不能当终稿的原因不是"不够好看"，而是四个结构性缺陷：

| 缺陷 | 后果 | TRACE 实证 |
|---|---|---|
| 文字会错 | 审稿人看到拼写错误直接扣印象分 | 候选 A 把 *Retrieve* 拼成 *Releieve*（`examples/trace-figure1/01-imagegen-candidate-a.png`） |
| 布局不可控 | 你说"左边放 A 右边放 B"，它大概率照做，细节全靠运气 | 5 张 Gemini 候选没有一张的 label 位置能用 |
| 非矢量 | 打印放大糊；PDF 体积大 | — |
| 不可复现 | 同一 prompt 出不同图；三个月后改不了 | — |

## 结构化 Prompt 模板

自由文本 prompt 出来的图不可比较。用固定的九个字段，每个字段一行，模型会更听话，
而且三张候选之间只改一两个字段就能做受控对比：

```
Primary request: <一句话说这张图要表达什么>
Use case: infographic-diagram | photo-asset | cover | icon-set
Asset type: paper figure 1 candidate | poster background | ...
Scene/backdrop: white conference-paper background, minimal and polished
Subject: <画面主体，用名词短语列出>
Style/medium: high-end scientific infographic, vector-like flat design, publication quality
Composition/framing: horizontal layout, left-to-right flow, large emphasis on <焦点>
Color palette: grayscale base with <accent> highlight
Text (verbatim): "<必须出现的文字，逐字>"   ← 出图后逐字核对这一行
```

TRACE Figure 1 探索时的三条真实 prompt 原文在 `examples/trace-figure1/imagegen-prompts.jsonl`。
三条只在 Primary request / Subject / Composition 上不同，其余字段完全一致——这就是受控对比。

## 批量出图

```bash
# prompts.jsonl 每行: {"prompt": "...", "size": "1536x1024", "quality": "high", "out": "cand-a.png"}
python3 scripts/imagegen.py prompts.jsonl --outdir output/imagegen/
```

脚本读 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`（走代理时后者必设），模型默认 `gpt-image-1`。
`size` 只接受 `1024x1024` / `1536x1024` / `1024x1536`；`quality` 是 `low` / `medium` / `high`。
探索阶段用 `medium` 就够，`high` 留给要嵌进终稿的素材。

## 素材嵌入代码图

出好的 PNG 走这条路进 Satori：

```js
// render.mjs
const b64 = fs.readFileSync('assets/scene.png').toString('base64');
const scene = `data:image/png;base64,${b64}`;
// JSX
<img src={scene} width={320} height={200} style={{ borderRadius: 8 }} />
```

- Satori **必须**给 `<img>` 显式数字 `width`/`height`，否则不渲染
- 大图先缩到目标尺寸的 2× 再嵌，别把 4 MB 原图塞进 SVG
- SVG → PDF 只能用 `rsvg-convert`，inkscape 会静默丢掉 base64 图（`pitfalls.md`）

## OpenAI vs Gemini

| | OpenAI `gpt-image-1` | Gemini |
|---|---|---|
| 文字渲染 | 较好，仍会错 | 差 |
| 遵循布局指令 | 中 | 弱 |
| 配额 | 按次付费 | 免费层每日额度，UTC 零点重置 |
| 环境变量 | `OPENAI_API_KEY` + `OPENAI_BASE_URL` | `GEMINI_API_KEY`；注意 `GOOGLE_API_KEY` 存在时会**覆盖**它 |
| 本仓库入口 | `scripts/imagegen.py` | 用 `cc-toolkit:gemini-image` skill |

探索用哪个都行，出素材优先 OpenAI。
