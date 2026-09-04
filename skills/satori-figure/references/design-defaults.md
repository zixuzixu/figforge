# Design defaults — "academic paper" aesthetic

These defaults produce a muted, professional-looking figure that doesn't fight the paper's typography. Start here; depart deliberately.

## Palette

```js
const C = {
  // Containers
  bannerBg:  '#f6f2e6', bannerBd: '#c3b079',  // warm parchment banner
  phoneBg:   '#ffffff', phoneBd:  '#c7cfdc',  // near-white with slate border
  kbBg:      '#f4f7f2', kbBd:     '#9cb08b',  // sage tint
  cardBg:    '#ffffff', cardBd:   '#d7e0d1',
  // Bubbles (muted pastels)
  userBg:    '#eef2f9', userBd:   '#b4c1da',  // muted navy
  sysBg:     '#f7f7f6', sysBd:    '#d9d9d6',  // warm neutral
  rejBg:     '#f8ece9', rejBd:    '#c79b92',  // dusty rose
  // Accents
  chipBg:    '#f7ecc9', chipBd:   '#b99a52',  // muted gold for [R1] labels
  hiliteBg:  '#d3e4c7',                       // sage green highlight (not neon)
  // Neutrals
  legendBg:  '#ffffff', legendBd: '#d4cfc0',
  text:      '#1a2332',  // slate-900-ish
  textDim:   '#9aa3b2',  // slate-400
  textMeta:  '#4a5568',  // slate-600
  arrow:     '#1e6537',  // deep forest green — stands out on sage
  star:      '#b88a2e',  // antique gold
  // Label tints (small-caps headers)
  tUser:     '#304b78',  // user = navy
  tSys:      '#2a2f3a',  // system = near-black
  tRej:      '#8f2f26',  // rejection = brick red
  dividerLine: '#e3e6df',
};
```

Rules of thumb:

- **Accents are dark**: Arrow / label tints use saturated but darkish colors, not bright. They read against pale backgrounds and photocopy/print well.
- **Highlights are pale and warm**: `#d3e4c7` sage > `#bfe4a8` bright green. The highlight should not fight the text.
- **One accent per concept**: one green for KB/accountability, one navy for user/preferences, one red for rejection, one amber for citations.

## Typography

Font stack: `"Lato","Helvetica Neue",Arial,sans-serif`. Lato is rare enough to look distinct, universal enough to render on most Linux systems and in paper PDFs.

Fallbacks: if Lato is missing, Roboto or IBM Plex Sans work; stay away from Arial for serious papers.

Weight scale:

| Usage | Size | Weight | Letter-spacing | Other |
|-------|------|--------|----------------|-------|
| Title (TRACE) | 54 px | 900 | 2.2 | uppercase optional |
| Body / bubble text | 20–22 px | 400 | 0 | `line-height: 1.5` |
| Highlighted text | match body | 500 | 0 | inherits line-height |
| Labels (`T1 USER`, `SCENARIO`) | 13–14 px | 700 | 2.2–2.6 | `text-transform: uppercase` |
| Secondary note (italic) | 13–14 px | 400 italic | 0.2 | color: textMeta |
| POI / card title | 20–24 px | 700 | 0.1 | — |
| Stars rating | 15–18 px | 700 | 0 | — |
| Meta (categories, dates) | 13–15 px | 400 | 0.4 | color: textMeta |
| Legend heading | 13 px | 700 | 1.8 | uppercase |
| Legend body | 13 px | 400 | 0 | line-height 1.4 |

**The small-caps + letter-spacing trick on labels is the single biggest signal of "academic" versus "generic SaaS" look.**

## Spacing & shape

- **Border width**: 0.8–1.0 px on cards, 1.0–1.5 on bubbles, 1.8–2.0 on avatars. Thin strokes feel printed.
- **Border radius**: 8–12 px on cards/bubbles, 3–4 on highlights/chips, circle on avatars/icons. Never 20+ px for serious work.
- **Gap**: 4–8 px between inline content items; 12–20 px between blocks; 20–30 px between columns.
- **Padding**: bubble `14 20`; card outer `14 18`; card content left-indent `paddingLeft:22, paddingRight:4` for blockquote look.

## Arrows (post-injected)

```
stroke: "#1e6537"
stroke-width: 3
stroke-dasharray: "9 5"  // long dash, small gap
stroke-linecap: "round"
marker: 10×10 triangle arrowhead
```

Keep arrows inside the gap between containers, never crossing a filled element.

## Output

- Canvas **1664** wide (NeurIPS / ICLR two-column spread ≈ 1600; plus a little bleed).
- Don't pass `height` to Satori unless you need fixed aspect; let the tree's natural content height drive it.
- Export PDF via `rsvg-convert -f pdf` for LaTeX embedding — vector, crisp, small.

## When to break defaults

- **Theme match**: if the paper uses a distinctive color (e.g., a product brand), pull one accent into the figure. Keep everything else muted.
- **Data viz overlay**: if the figure has actual data (bar chart in legend), use categorical ColorBrewer palette instead of the sage/navy/rose trio.
- **Black & white**: replace colors with textures / strokes; the stroke widths still hold.
