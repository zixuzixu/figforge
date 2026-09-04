# Reusable Layout Patterns

Recipes you can drop into a figure. Each pattern has a tight rationale and the JSX snippet.

## 1. Right-edge-aligned stack of items

**When**: dialogue bubbles or card columns that must share the same right edge regardless of content length.

**Pattern**: put all items in a flex column, give each item the same `width:`. The left edge is the flex start; the right edge is `left + width`, identical for every item.

```js
h(Col, { style: { gap: 14 } }, [
  h(Bubble, { width: 600, content: "..." }),
  h(Bubble, { width: 600, content: "..." }),
  h(Bubble, { width: 600, content: "..." }),
])
```

Do NOT try to align via `justify-content: flex-end` on individual items — it won't fix the end because flex items naturally align to `flex-start`.

## 2. Inline highlight that shares text baseline

**When**: a quote like `A reviewer said "Classy and upscale."` with the quote highlighted.

**Pattern**: parent Row uses `alignItems: 'baseline'`. Hi has horizontal-only padding and a matching `lineHeight`.

```js
h(Row, { style: { flexWrap: 'wrap', alignItems: 'baseline', gap: 6 } }, [
  h(Text,  {}, "A reviewer said"),
  h(Hi,    {}, `"Classy and upscale."`),
])
```

```js
const Hi = ({ children, size = 22 }) => h('div', {
  style: {
    background: '#d3e4c7', borderRadius: 3, padding: '0 6px',
    fontSize: size, lineHeight: 1.5, fontWeight: 500,
  },
}, children);
```

## 3. Wrapping text vs atomic flex children

**Auto-wrap** (plain prose, single string): a single `<Text>` with fixed-width parent wraps at word boundaries.

```js
h('div', { style: { width: 560, display: 'flex', fontSize: 20, lineHeight: 1.5 } }, [
  h(Text, {}, "Hi! I'm a food blogger visiting Tucson and I want a high-end dinner spot..."),
])
```

**Manual wrap** (inline highlights): flex-wrap breaks at child boundaries only. To break a long highlight mid-phrase, split it into two `<Hi>` across two rows:

```js
h(Row, { flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }, [
  h(Text, {}, "A reviewer said"),
  h(Hi, {}, `"Classy and upscale, but there was`),
]),
h(Row, { flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }, [
  h(Hi, {}, `no dress code."`),
  h(Chip, { label: '[R1]' }),
])
```

**Filling a short final row**: append a dim trailing phrase so the last line isn't 20% full. Natural paraphrase ("— perfect for a photo-worthy dinner") is fine if you label it as commentary.

## 4. Citation chip

```js
const Chip = ({ label }) => h('div', {
  style: {
    background: '#f7ecc9', border: '0.8px solid #b99a52',
    borderRadius: 4, padding: '1px 8px',
    fontSize: 15, fontWeight: 600, color: '#6b5320',
    letterSpacing: 0.5,
    alignSelf: 'center',  // stays on baseline center even with smaller fontSize
  },
}, label);
```

Keep fontSize smaller than surrounding text (e.g., 15 vs 22) for a proper "badge" feel. `alignSelf: 'center'` makes the chip center vertically with the tallest line item.

## 5. Drawn avatar (no emoji)

User avatar (blue circle + white head + dome):

```js
const AvatarUser = () => h('div', {
  style: {
    width: 64, height: 64, borderRadius: 32, background: '#1d4ed8',
    position: 'relative', overflow: 'hidden', flexShrink: 0, display: 'flex',
  },
}, [
  h('div', { style: { position:'absolute', top:12, left:22, width:20, height:20,
                       borderRadius:10, background:'#fff' }}),
  h('div', { style: { position:'absolute', bottom:-4, left:8, width:48, height:28,
                       borderRadius:24, background:'#fff' }}),
]);
```

System avatar (gray circle + antenna + body rect + eyes): see `assets/starter.jsx`.

Reject avatar: user avatar nested inside a larger pink halo.

## 6. KB cylinder icon

```js
h('div', { style: { width:44, height:48, position:'relative', display:'flex', flexShrink: 0 } }, [
  h('div', { style: { position:'absolute', top:0,  left:0, width:44, height:16,
                       borderRadius:22, background:'#4a7f38' }}),
  h('div', { style: { position:'absolute', top:8,  left:0, width:44, height:32,
                       background:'#4a7f38' }}),
  h('div', { style: { position:'absolute', top:32, left:0, width:44, height:16,
                       borderRadius:22, background:'#4a7f38' }}),
  h('div', { style: { position:'absolute', top:18, left:0, width:44, height:4,
                       borderRadius:22, background:'rgba(255,255,255,0.25)' }}),
])
```

## 7. Star rating (with half star)

Uses two inline SVG data URIs: full star (gold) and empty star (gray). Half star is full star clipped to left 50% via `overflow:hidden`.

```js
const STAR_PATH = 'M12 2 l2.9 6.1 L22 9.2 l-5.1 4.75 L18.2 21 L12 17.55 5.8 21 l1.3-7.05 L2 9.2 l7.1-1.1 z';
const _svg = (body) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`
)}`;
const STAR_FULL  = _svg(`<path d="${STAR_PATH}" fill="#b88a2e"/>`);
const STAR_EMPTY = _svg(`<path d="${STAR_PATH}" fill="#d9dde3"/>`);

const Stars = ({ rating = 4.5, size = 20 }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const items = [];
  for (let i = 0; i < full; i++) items.push(h('img', {
    src: STAR_FULL, width: size, height: size, style: { width: size, height: size }
  }));
  if (half) items.push(h('div', {
    style: { position:'relative', width: size, height: size, display:'flex' }
  }, [
    h('img', { src: STAR_EMPTY, style: { position:'absolute', width:size, height:size }}),
    h('div', { style: { position:'absolute', width: size/2, height: size, overflow:'hidden', display:'flex' }},
      h('img', { src: STAR_FULL, style: { width:size, height:size }})),
  ]));
  while (items.length < 5) items.push(h('img', {
    src: STAR_EMPTY, width: size, height: size, style: { width: size, height: size }
  }));
  return h(Row, { style: { gap: 2, alignItems: 'center' } }, items);
};
```

## 8. Review card with space-between header

Header row has left block (label + thumbnail + title) and right block (stars + rating), separated by `justifyContent: 'space-between'`. The right block fills what would otherwise be empty whitespace.

```js
h(Row, { style: { width:'100%', alignItems:'center', justifyContent:'space-between', gap: 20 } }, [
  h(Row, { style: { alignItems:'center', gap: 14 } }, [
    h(Label), h(Thumb), h(TitleBlock)
  ]),
  h(Col, { style: { alignItems: 'flex-end', gap: 3 } }, [
    h(Stars), h(RatingText)
  ]),
])
```

Body content below the divider uses `width:'100%'` + symmetric card padding so both cards in a list have identical right whitespace.

## 9. Legend with 4 equal columns

```js
h(Row, { style: { background:'#fff', border:'0.8px solid #d4cfc0', borderRadius:8,
                   padding:'16px 10px', alignItems:'stretch' } }, [
  h(LegendItem, {...}),
  h('div', { style: { borderLeft:'1.3px dashed #d4cfc0', margin:'8px 0' }}),
  h(LegendItem, {...}),
  h('div', { style: { borderLeft:'1.3px dashed #d4cfc0', margin:'8px 0' }}),
  h(LegendItem, {...}),
  h('div', { style: { borderLeft:'1.3px dashed #d4cfc0', margin:'8px 0' }}),
  h(LegendItem, {...}),
])
```

Each `LegendItem` uses `flex: 1` to share equal width. The inner text column consistently starts at icon + gap, so text alignment matches across columns.

```js
const LegendItem = ({ Icon, iconBg, iconBd, head, headColor, b1, b2 }) =>
  h(Row, { style: { flex: 1, alignItems:'center', gap: 16, padding:'0 20px' } }, [
    h('div', {
      style: { width: 48, height: 48, borderRadius: 24, background: iconBg,
               border: `0.8px solid ${iconBd}`, display:'flex',
               alignItems:'center', justifyContent:'center', flexShrink: 0 }
    }, h(Icon, { color: headColor })),
    h(Col, { style: { gap: 3 } }, [
      h(Text, { style: { fontSize:13, fontWeight:700, color:headColor,
                         letterSpacing:1.8, textTransform:'uppercase' } }, head),
      h(Text, { style: { fontSize:13, color:'#4a5568', lineHeight:1.4 } }, b1),
      h(Text, { style: { fontSize:13, color:'#4a5568', lineHeight:1.4 } }, b2),
    ]),
  ]);
```

## 10. Orthogonal arrow (post-injected)

Can't be in JSX. Emitted by the render script after satori:

```js
// in render_fig1.mjs after `const svg = await satori(...)`
const chips  = findChips(svg);     // match <path fill="#f7ecc9"> - chip bg
const labels = findLabels(svg);    // match <rect ... fill="#fff"/></mask><g><path fill="#4a6a3a"> - [R#] label
const CHANNEL_X = 706;             // constant in phone-KB gap; NEVER computed from endpoints

let arrowDefs = '';
for (let i = 0; i < Math.min(chips.length, labels.length); i++) {
  const c = chips[i], l = labels[i];
  const sx = c.x + c.w + 4, sy = c.y + c.h/2;
  const tx = l.x + 4, ty = l.y + 13;
  arrowDefs += `<path d="M ${sx} ${sy} L ${CHANNEL_X} ${sy} L ${CHANNEL_X} ${ty} L ${tx} ${ty}"
    fill="none" stroke="#1e6537" stroke-width="3" stroke-dasharray="9 5" stroke-linecap="round" marker-end="url(#ah)"/>`;
}

const defs = '<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">' +
             '<polygon points="0,0 10,5 0,10" fill="#1e6537"/></marker></defs>';
let final = svg.replace(/(<svg[^>]*>)/, `$1${defs}`);
final = final.replace(/<\/svg>\s*$/, `${arrowDefs}</svg>`);
```

## 11. Blockquote indent on card content

Asymmetric padding inside the card's content Col creates "pulled quote" feel:

```js
// Card header + divider span full width; quote and below indent 22px from left only
h('div', { card_outer }, [
  h(Row, { header_row }),
  h('div', { divider, width:'100%' }),
  h(Col, { style: { width:'100%', gap: 6, paddingLeft: 22, paddingRight: 4 }},
     quoteBlock, secondary, footer)
])
```

The right side stays flush with the card, which is what the reader expects in a review / quote card.
