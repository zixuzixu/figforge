# Fig1 Teaser Iteration Report

Chronicle of turning the TRACE teaser figure from a hand-written SVG into a Satori/JSX-driven pipeline, and the design / alignment lessons captured along the way.

## Timeline at a Glance

| Version | Stack | Key milestone |
|---------|-------|---------------|
| v3 (baseline) | Hand-written SVG | Starting point with layout issues (bubbles unequal width, arrows curve through bubble, highlights not centered, right-edge misaligned) |
| v4 | SVG hand-edit | First spacing pass — compressed turn positions, avoided phone-box overflow from T4 bubble |
| v5 | Python-generated SVG | Regenerated from scratch; added bubble right-edge alignment, unified chip styling, orthogonal arrows |
| v6 | Python-generated SVG | Quote blocks with dim/hi segments; real Yelp review text from KB v3; hi-lite + chip arithmetic stabilized |
| v7 | Python-generated SVG | Major polish — transparent bg, banner aligned to phone, card content rewritten to fill width |
| **v8** | **Satori JSX + post-process arrows** | **Pipeline migration**: flex layout solves all alignment problems, but exposes Satori-specific pitfalls (no gradient in img data-URI, emoji glyph missing, text wrapping model). |
| v8c | Satori | Replaced emoji avatars with `position:absolute` geometric divs; drawn KB cylinder and legend icons |
| v8d | Satori | Inline SVG stars; half-star built from `overflow:hidden` clip |
| v8g (academic) | Satori | Font switched to Lato; muted palette; small-caps labels with letter-spacing; thinner strokes |
| v8h | Satori | Channel arrow fixed to phone-KB gap (no more bubble passthrough) |
| v8i | Satori | Arrows thicker + deeper green; card quote line lengths balanced |
| v8j | Satori | `dress code` protrusion fixed by re-wrapping; blockquote-style `paddingLeft` |
| v8k | Satori | Auto-wrap for T1/T3 (single `<Text>` passes full paragraph to Satori); PDF output via `rsvg-convert -f pdf` |
| v8l | Satori | Highlight baseline fixed (`alignItems:'baseline'`, zero vertical padding on `<Hi>`) |
| v8m | Satori | Final: balanced T2/T4 line lengths with dim trailing context; thumbnails 80→108px; phone widened 780→820 |

---

## What Went Wrong and How It Was Fixed

### 1. Hand-SVG drift

**Symptom**: Every micro-adjustment required updating 10+ coordinate values (bubble x, width, highlight rect x/w, chip x, arrow Mx/Lx). A single line break change in quote text caused a cascade of recalculations.

**Resolution**: Moved to Satori. Flex/CSS Box Model handles positioning; editing a single string in JSX triggers auto-layout.

### 2. Satori requires `display: flex` on multi-child divs

**Symptom**: First run errored with `Expected <div> to have explicit "display: flex", "display: contents", or "display: none" if it has more than one child node`.

**Resolution**: The custom JSX factory now auto-injects `display: flex` on every `<div>`:

```js
export const h = (type, props, ...children) => {
  const flat = children.flat(Infinity).filter(c => c != null && c !== false);
  const kids = flat.length === 1 ? flat[0] : flat;
  const p = { ...(props || {}) };
  if (type === 'div') {
    p.style = { display: 'flex', ...(p.style || {}) };
  }
  p.children = kids;
  return { type, props: p };
};
```

### 3. Emoji / special-glyph tofu

**Symptom**: `👤 🤖 ★ ⚙` rendered as boxes because Roboto/Lato TTF don't include those glyphs.

**Resolution**:
- **Avatars**: drawn with `position:absolute` child divs (head circle + shoulder dome).
- **Stars**: inline SVG via `data:image/svg+xml;utf8,...` and passed as `<img src>`.
- **Half-star**: stacked `<img>` layers with `overflow:hidden` clipping the full-color star to its left half — Satori doesn't resolve gradient refs inside data-URI SVGs.
- **Legend icons**: divs with borders and sizes, not characters.
- **KB cylinder**: 3 stacked ellipse/rect divs with `borderRadius:50%`.
- **Secondary text**: avoided `★` glyph by using `"from a 4-star review"`.

### 4. Arrows through bubbles

**Symptom**: Arrow vertical segment landed at `(chip.x + label.x) / 2`, which was *inside* the phone box, so the dashed line visibly cut through bubble text.

**Resolution**: Arrows can't be drawn in Satori. We post-process the SVG:

1. Grep for `<path fill="#f7ecc9">` (chip background) to get chip rects.
2. Grep for `fill="#fff"/></mask><g><path fill="#4a6a3a">` (the mask preceding `[R1]/[R2]` label) to get label positions.
3. Force `channelX = 706` — a constant in the 20px gap between phone.right (~696) and KB.left (~716).
4. Inject `<path d="M sx sy L channelX sy L channelX ty L tx ty" stroke="#1e6537" ...>` with a marker head, at the end of SVG.

### 5. Highlight / text baseline misalignment

**Symptom**: `<Hi>` spans had `padding: '2px 6px'` (adding vertical thickness), which with `alignItems: 'center'` pushed them off the surrounding text baseline.

**Resolution**:
- Change `<Hi>` padding to `'0 6px'` (horizontal-only).
- Parent rows use `alignItems: 'baseline'`.
- Explicit `lineHeight: 1.5` on Hi AND surrounding text so the background rect matches line height exactly.
- `<Hi>` accepts `size` prop so card quotes (19px) and bubble (22px) both get matching text size for their context.

### 6. Text wrapping strategy

**Symptom**: Manual line breaks gave each bubble line different lengths — e.g. `"Classy and upscale, but there"` visibly shorter than `"I recommend MiAn Sushi and Modern Asian Cuisine."`.

**Resolution**:
- For plain text (T1/T3): pass the whole paragraph to a single `<Text>`; Satori auto-wraps at word boundaries within the fixed bubble width.
- For highlighted (T2/T4): Satori only wraps at *flex item* boundaries, so highlights stay atomic. To balance line length, restructure where the `<Hi>` is split and append a dim `<Text>` trailing phrase (`"— perfect for a photo-worthy dinner."`) to fill the final row.

### 7. Right-edge and card-consistency issues

**Symptom**: Two review cards had different visible right whitespace; individual lines ended far short of card edge.

**Resolution**:
- Dropped `alignSelf:'center'; width:CARD_INNER_W` center block. Content now `width:'100%'` stretches full card inner.
- Card: symmetric outer padding `14px 18px` guarantees top/bottom cards have identical right margins.
- Content `<Col>` has `paddingLeft: 22, paddingRight: 4` — blockquote-style asymmetric indent.
- Widen phone (680→820) to shrink KB proportionally; lines fill ≥90% of card width.
- Rewrite quote lines so both cards have comparable char counts per line.

### 8. Typography tuning for "academic" feel

Default colors were pastel; switched to muted "stone + slate + sage" palette:

- `#f6f2e6` banner, `#c3b079` banner border (muted amber)
- `#eef2f9` / `#b4c1da` user bubble (muted navy)
- `#f7f7f6` system bubble (warm neutral)
- `#f8ece9` / `#c79b92` reject bubble (dusty rose)
- `#d3e4c7` highlight (sage)
- `#1e6537` arrow (deep forest — contrasts with highlights)

Typography:
- Font stack: `"Lato","Helvetica Neue",Arial,sans-serif` (Lato has a full family + italic variants available as system fonts on most Linux).
- Small-caps + letter-spacing 2.2–2.6 for labels (`T1 USER`, `SCENARIO`, `VERBATIM CITATIONS`, `YELP REVIEWS`).
- Thin 0.8–1.0px borders, 8–12px corner radius (not bubbly).
- Italic secondary text (`also: "..." — from a 4-star review`).

### 9. Paper integration

**Symptom**: PNG import to paper was pixel-based and fuzzy at scale.

**Resolution**: `rsvg-convert -f pdf fig1_v8.svg -o figures/fig1_v8.pdf` → `\includegraphics{figures/fig1_v8.pdf}`. The PDF is vector and scales crisp at any zoom.

---

## Takeaways for Future Figures

1. **Start with Satori if content has any text flow**. The hand-SVG approach wastes time on geometry. Even for simple figures, flex handles alignment automatically.
2. **Plan the 4-step arrow pipeline up-front**. Inline arrow drawing is impossible in Satori; budget for a post-process regex step that anchors on unique fill colors.
3. **Avatars & icons: use divs, not emoji**. Roboto/Lato don't include pictorial glyphs. Positioned `<div>` shapes are cheap and render crisp.
4. **SVG `<linearGradient>` inside a data-URI img does NOT resolve**. Build gradient-like effects with overlapping `<img>` layers and `overflow:hidden`.
5. **Text wrapping is flex-wrap, not word-wrap**. A long `<Text>` auto-wraps; a `<Row>` of children wraps at child boundaries. Don't mix unless you know the tradeoffs.
6. **Export as PDF via `rsvg-convert -f pdf`** for LaTeX. That single step doubles the visual quality in print.
7. **Iterate on a viewer**. Render at 2× width (2400–2800px) for high-res comparison, then crop quadrants to debug local issues instead of squinting at the thumbnail.
