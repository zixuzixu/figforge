# HTML 排版打印件（海报 / 一页纸）

需要**物理尺寸精确**（A0、600×1500 mm、16:9 幻灯片母版）的时候用 HTML + CSS。
浏览器的排版引擎比任何海报软件都强，而且是代码——可 diff、可复用 token、可让模型改。

## 骨架

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  /* 1. 页面物理尺寸 */
  @page { size: 600mm 1500mm; margin: 0; }
  html, body {
    margin: 0; padding: 0;
    width: 600mm;
    background: #fff;
    font-family: "Lato", "Helvetica Neue", Arial, sans-serif;
    -webkit-print-color-adjust: exact;   /* 2. 打印时保留背景色 */
    print-color-adjust: exact;
  }
  /* 3. 设计 token 集中在 :root */
  :root {
    --navy: #0d2e52; --teal: #1e7a8c; --green: #2f7a44;
    --amber: #d97706; --red: #b91c1c;
    --stone: #f5f0e6; --card-border: #d6d3c7; --muted: #6b7280;
  }
  /* 4. 布局用 grid + mm */
  .poster { width: 600mm; padding: 18mm 16mm 12mm; box-sizing: border-box; }
  .three-col { display: grid; grid-template-columns: 1fr 1.05fr 1fr; gap: 8mm; }
  .card { border: 0.6mm solid var(--card-border); border-radius: 4mm; padding: 6mm; }
  .section-bar { display: flex; align-items: center; gap: 6mm; font-weight: 700; color: var(--navy); }
  .section-bar::before, .section-bar::after { content: ""; flex: 1; height: 0.5mm; background: var(--navy); }
</style>
</head>
<body>
<div class="poster">
  <header>...</header>
  <div class="three-col">
    <section class="card">...</section>
    <section class="card">...</section>
    <section class="card">...</section>
  </div>
</div>
</body>
</html>
```

四个要点都在注释里：`@page` 定尺寸、`print-color-adjust` 保底色、token 进 `:root`、grid 用 mm。

## 单位

海报里**全部用 mm**，不用 px。字号也是：`font-size: 9mm` 在 600 mm 宽的海报上约等于正文，
`14mm` 是小标题，`28mm` 是主标题。这样从 A0 换到 A1 只需要改 `@page` 和一个缩放系数。

## 字体

只用系统已安装的字体（Lato、Noto Sans CJK）。**不用 webfont**——导出 PDF 的环境通常没网，
而且 Chromium 打印时 webfont 加载时序不可控。

中文海报：`font-family: "Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", sans-serif`。

## 导出

```bash
chromium --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=poster.pdf poster.html
```

或 Playwright（可脚本化、能等字体加载完）：

```python
page.goto(f'file://{html_path}')
page.pdf(path='poster.pdf', prefer_css_page_size=True, print_background=True)
```

`prefer_css_page_size=True` 是关键，否则 Playwright 会用默认 Letter 尺寸。

## 检查

同 `iteration-loop.md`：转 PNG、切四象限、逐块看。

```bash
pdftoppm -r 40 -png poster.pdf preview      # 40 dpi 足够看版面
uv run scripts/inspect_figure.py preview-1.png
```

海报常见问题：某一列比另外两列长出一截、卡片内 padding 不对称、`section-bar` 两侧横线长度不等。

## 什么时候换 Typst

HTML 适合**卡片式、色块多、像网页**的海报。以下情况换 Typst：

- 公式多（HTML 里 MathJax 打印不稳）
- 想要 LaTeX 那种排版质感（连字、悬挂标点）
- 需要和论文共用 `.bib`

TRACE 海报两种都做了（`trace_poster.html` 和 `trace_poster.typ`），最终用的 Typst 版。
HTML 版胜在迭代快——改一个 token 刷新即见。
