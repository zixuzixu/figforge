# 案例：意大利面拌混凝土论文的图 1，中介路径图

《意大利面就应该拌 42 号混凝土》——一篇数据全部虚构、格式完全严肃的教学论文（题材出自博主 @延边刺客 的那句梗）。
它的图 1 是中介模型：螺丝钉长度经由挖掘机扭矩影响面食口感。这个目录是把它从"图像模型直出"做成"JSX → Satori"的全部材料。

| 图像模型直出 | JSX → Satori |
|---|---|
| <img src="source/mediation-photo-1600.jpg"> | <img src="fig1_mediation_zh.png"> |
| 文字画在像素里，改一个系数要整张重生成 | 矢量、可编辑；`node render.mjs en` 出英文版 |

| 文件 | 是什么 |
|---|---|
| `fig1_mediation.jsx` | 整张图：`LAYOUT` 常量（节点位置、箭头锚点）、`COEF`（系数）、`L`（中英文标签）、`Card` 组件 |
| `render.mjs` | esbuild 编译 → Satori 渲染 → 按 `LAYOUT` 注入三条箭头 → `fig1_mediation_<lang>.svg` |
| `cut_assets.py` | 从 `source/mediation-photo.png` 抠出螺丝钉 / 挖掘机 / 面盘 → `assets/` |
| `extract_fonts.py` | Satori 不认 `.ttc`：把系统 Noto Sans CJK SC 抽成 `fonts/*.otf` |
| `fig1_mediation_zh.png` / `_en.png` | 1664 px 预览。SVG 和 PDF 不入库，跑一遍 30 秒 |

## 布局哲学：哪些写死，哪些交给 flex

三个节点的位置是设计决定（X 左下、M 上中、Y 右下是中介图的惯例），写死在 `LAYOUT` 里；
箭头起止点和系数标签的位置也从同一份常量算出来。节点**内部**——角标、素材图、变量名、单位——的对齐和居中全是 flex 的事，一个坐标都没写。

Satori 画不了的三样东西：

- **箭头**：渲染完往 SVG 末尾注入 `<path>` + `<marker>`，实线蓝 = 显著路径，虚线灰 = 不显著的直接路径 c′
- **照片素材**：从图像模型那张图里抠出来（白底四周泛洪、只留最大连通块、青色箭头按色键抹掉），base64 嵌进 `<img>`
- **中文**：`extract_fonts.py` 抽 Noto CJK；`fonts` 列表里 Lato 在前管西文和数字，Noto 兜底汉字，Satori 逐字回退

外加一个坑：Satori 会剥掉文本节点的首尾空格，`'a'` + `' = 0.62'` 出来是 `a= 0.62`。片段之间用 `gap`。

## 自己渲染一遍

```bash
npm install                                                          # satori + esbuild
uv run --no-project --with fonttools python extract_fonts.py         # → fonts/NotoSansCJKsc-{Regular,Bold}.otf
uv run --no-project --with scipy --with pillow --with numpy python cut_assets.py   # → assets/*.png（已附带，可跳过）
node render.mjs zh && node render.mjs en                             # → fig1_mediation_{zh,en}.svg，各 < 1 秒
rsvg-convert -f pdf fig1_mediation_zh.svg -o fig1_mediation_zh.pdf   # 进 LaTeX
rsvg-convert -w 3328 fig1_mediation_zh.svg -o /tmp/2x.png            # 2× 检查，切四象限看
```

需要系统有 Lato（`apt install fonts-lato`）和 Noto Sans CJK（`apt install fonts-noto-cjk`）。

## 三轮迭代

- **v1**：骨架一次成型。三处问题：首尾空格被吃、画布不够高裁掉底部注释、挖掘机铲斗带着生图的半透明残影
- **v2**：2× 切四象限，缩略图上看不见的两处现形：面盘底下露出原图标签的笔画上沿、英文单位 `T(N·m)` 少空格
- **v3**：定稿

## 数字来源

三个系数和六个标签在论文 `.tex` 里是宏（`\MedA` `\MedB` `\MedCp` `\MedX` …），JSX 里是 `COEF` 和 `L`。
全部数据为虚构，混凝土不可食用。
