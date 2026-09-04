# Satori Gotchas

All of these cost one iteration cycle to rediscover the first time around. Skim this before authoring.

## `display: flex` is required on every multi-child `<div>`

Satori refuses to render a `<div>` with 2+ children unless the `style` explicitly sets `display: flex` (or `contents` or `none`). Error message:

```
Expected <div> to have explicit "display: flex", "display: contents", or "display: none"
if it has more than one child node.
```

**Fix**: in the JSX factory, auto-inject `display: flex` on every `<div>`:

```js
if (type === 'div') {
  p.style = { display: 'flex', ...(p.style || {}) };
}
```

This is already in `assets/starter.jsx`. Single-child divs don't need it, but injecting universally is simpler and harmless.

## Emoji / symbol glyph tofu ⬛

Satori loads ONLY the TTFs you pass in `fonts: [...]`. Roboto/Lato/Arial don't include emoji or most special symbols (`👤 🤖 ★ ⚙ 🗄 ↻`). They render as boxes.

**Fix options (in order of preference):**

1. **Drawn divs**: for avatars/icons, use `position: relative` parents with `position: absolute` inner shapes (circles, rects). See `patterns.md#avatars`.
2. **Inline SVG data URI**: for stars, arrows, geometric icons:
   ```js
   const STAR_FULL = `data:image/svg+xml;utf8,${encodeURIComponent(
     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2..." fill="#b88a2e"/></svg>'
   )}`;
   return h('img', { src: STAR_FULL, width: 22, height: 22, style: { width: 22, height: 22 }});
   ```
3. **Add an emoji font**: possible but bulky. Only bother if you have many different emoji.

## Gradients in inline-SVG img data URIs do NOT render

You can embed `<svg><path fill="url(#myGrad)">...</svg>` in a data URI, but the `url(#myGrad)` reference does NOT resolve inside Satori's `<img>` rendering — you get the fallback color, not the gradient.

**Fix**: compose the effect from layered `<img>` elements with `overflow: hidden` clipping. A half-star:

```js
const HalfStar = ({ size }) => h('div', {
  style: { position: 'relative', width: size, height: size, display: 'flex' },
}, [
  h('img', { src: STAR_EMPTY, style: { position:'absolute', top:0, left:0, width:size, height:size }}),
  h('div', {
    style: { position:'absolute', top:0, left:0, width: size/2, height:size, overflow:'hidden', display:'flex' },
  }, [h('img', { src: STAR_FULL, style: { width:size, height:size }})]),
]);
```

## Text wrapping is flex-wrap, not word-wrap

- A single `<Text>` with a long string auto-wraps at word boundaries within its parent's width.
- A `<Row style={{flexWrap:'wrap'}}>` with multiple children wraps at child boundaries — each child is atomic.

This is critical for bubbles with inline highlights:

```js
h(Row, { style: { flexWrap:'wrap', alignItems:'baseline', gap:6 } }, [
  h(Text, {}, 'A reviewer said'),
  h(Hi, {}, '"Classy and upscale,"'),  // this whole span is atomic; can't break mid-phrase
])
```

If the `<Hi>` child is too long, it wraps to its own line — the highlight background wraps with it as one rectangle. To break a long highlight across lines, manually split it into two `<Hi>` elements in separate rows.

## Highlight baseline misalignment

`<Hi>` with `padding: '2px 6px'` and parent `alignItems: 'center'` pushes the highlight off the surrounding text baseline — it looks like a badge floating inside a line.

**Fix**:
- Change Hi padding to `'0 6px'` (horizontal-only). The background rect height naturally equals line-height.
- Set `alignItems: 'baseline'` on parent Row.
- Ensure `lineHeight` is identical on Hi and surrounding Text (default to `1.5`).

Bonus: if Hi text size differs from surrounding (e.g. card quote at 19px, bubble quote at 22px), pass a `size` prop:

```js
const Hi = ({ children, size = 22 }) => h('div', {
  style: { background:'#d3e4c7', borderRadius:3, padding:'0 6px',
           fontSize: size, lineHeight: 1.5, fontWeight: 500 },
}, children);
```

## Arrows can't be drawn inside Satori

Satori has no `<line>`, `<path>`, or `<svg>` children — all children become styled boxes. For dashed arrows between figure elements:

1. Don't try `border: '2px dashed'` on 1×N divs — it looks ragged.
2. Post-process the rendered SVG: locate source/target positions by regex-matching known fill colors, then inject `<path d="M sx sy L mid sy L mid ty L tx ty" stroke-dasharray="9 5">`.

The render template script in `scripts/render_template.mjs` shows the pattern. Make your chip/label colors unique in the palette so regex matching stays unambiguous.

## The arrow channel should be between elements

When building an orthogonal arrow path `M sx sy → L channelX sy → L channelX ty → L tx ty`, pick `channelX` as a *constant* in the visual gap between the source container and the target container (e.g. between phone.right=696 and KB.left=716 pick `channelX=706`). If you compute it as `(sx+tx)/2`, you can end up inside a container, and the vertical segment will cut through content.

## Fonts need every weight you use

If JSX uses `fontWeight: 700` but the render script only loads Regular (400), Satori falls back to the Regular TTF and the text looks too light. Load all weights you reference: 400, 500, 700, 900, and their italics if used.

## Always use explicit numeric widths/heights on `<img>`

```js
h('img', { src, width: 96, height: 96, style: { width: 96, height: 96 }})
```

If you omit width/height attributes, Satori may throw: `Image size cannot be determined. Please provide the width and height of the image.`

## Data URIs need `encodeURIComponent`

Direct interpolation of an SVG string into a `data:image/svg+xml,...` URL breaks on `#`, `<`, spaces. Use `encodeURIComponent`:

```js
const _svg = body => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`
)}`;
```

## Height is usually better auto than fixed

If you pass `height` to Satori, content that exceeds it gets clipped or overflows. Omit `height` unless you need a fixed aspect ratio — the container tree's natural height works well.

## Text indentation inside flex column

Padding on a Col shifts ALL children. If you want to indent only the quote block (blockquote style) and leave header/footer flush, wrap the quote-only rows in a sub-Col with its own `paddingLeft`.

## When you change a key color, update the post-process regex

The arrow injection relies on matching the chip's `fill="#f7ecc9"`. If the palette's chip color changes, the regex no longer matches → no arrows render. Search the render script when swapping colors.
