/** @jsx h @jsxFrag Fragment */
// Minimal JSX factory for Satori (no React dep). Auto-injects display:flex on divs.
export const h = (type, props, ...children) => {
  const flat = children.flat(Infinity).filter(c => c !== undefined && c !== null && c !== false);
  const kids = flat.length === 1 ? flat[0] : flat;
  const p = { ...(props || {}) };
  if (type === 'div') {
    p.style = { display: 'flex', ...(p.style || {}) };
  }
  p.children = kids;
  return { type, props: p };
};
export const Fragment = ({ children }) => children;

// ---- Academic palette ----
const C = {
  bannerBg:  '#f6f2e6', bannerBd: '#c3b079',
  phoneBg:   '#ffffff', phoneBd:  '#c7cfdc',
  kbBg:      '#f4f7f2', kbBd:     '#9cb08b',
  cardBg:    '#ffffff', cardBd:   '#d7e0d1',
  userBg:    '#eef2f9', userBd:   '#b4c1da',
  sysBg:     '#f7f7f6', sysBd:    '#d9d9d6',
  rejBg:     '#f8ece9', rejBd:    '#c79b92',
  chipBg:    '#f7ecc9', chipBd:   '#b99a52',  // Used by arrow regex!
  hiliteBg:  '#d3e4c7',
  legendBg:  '#ffffff', legendBd: '#d4cfc0',
  text:      '#1a2332',
  textDim:   '#9aa3b2',
  textMeta:  '#4a5568',
  star:      '#b88a2e',
  tUser:     '#304b78',
  tSys:      '#2a2f3a',
  tRej:      '#8f2f26',
  rLabel:    '#4a6a3a',  // [R#] label color — also used by arrow regex!
  dividerLine: '#e3e6df',
};

const FONT = '"Lato","Helvetica Neue",Arial,sans-serif';

// ---- Flex primitives ----
const Row  = ({ style = {}, children }) => h('div', { style: { display: 'flex', flexDirection: 'row',    ...style } }, children);
const Col  = ({ style = {}, children }) => h('div', { style: { display: 'flex', flexDirection: 'column', ...style } }, children);
const Text = ({ style = {}, children }) => h('div', { style: { display: 'flex', fontFamily: FONT, color: C.text, ...style } }, children);

// ---- Baseline-aligned highlight ----
const Hi = ({ children, size = 22 }) => h('div', {
  style: {
    background: C.hiliteBg, borderRadius: 3, padding: '0 6px',
    fontFamily: FONT, fontSize: size, lineHeight: 1.5, fontWeight: 500, color: C.text,
  },
}, children);

// ---- Citation chip (important: bg matches C.chipBg so arrow regex finds it) ----
const Chip = ({ label }) => h('div', {
  style: {
    background: C.chipBg, border: `0.8px solid ${C.chipBd}`,
    borderRadius: 4, padding: '1px 8px',
    fontFamily: FONT, fontSize: 15, fontWeight: 600, color: '#6b5320',
    letterSpacing: 0.5, alignSelf: 'center',
  },
}, label);

// ---- Avatars drawn with divs ----
const AvatarUser = () => h('div', {
  style: { width: 64, height: 64, borderRadius: 32, background: C.tUser,
           position: 'relative', overflow: 'hidden', flexShrink: 0, display: 'flex' },
}, [
  h('div', { style: { position:'absolute', top:12, left:22, width:20, height:20, borderRadius:10, background:'#fff' }}),
  h('div', { style: { position:'absolute', bottom:-4, left:8, width:48, height:28, borderRadius:24, background:'#fff' }}),
]);

const AvatarSys = () => h('div', {
  style: { width: 64, height: 64, borderRadius: 32, background: '#f0f0ef',
           border: `1.8px solid ${C.sysBd}`, position: 'relative', flexShrink: 0, display: 'flex' },
}, [
  h('div', { style: { position:'absolute', top:8,  left:28, width:8,  height:8,  borderRadius:4, background:'#2d3748' }}),
  h('div', { style: { position:'absolute', top:14, left:30, width:4,  height:6,  background:'#2d3748' }}),
  h('div', { style: { position:'absolute', top:22, left:17, width:30, height:22, borderRadius:5, border:'2.5px solid #2d3748', background:'#f0f0ef' }}),
  h('div', { style: { position:'absolute', top:30, left:24, width:4,  height:4,  borderRadius:2, background:'#2d3748' }}),
  h('div', { style: { position:'absolute', top:30, left:36, width:4,  height:4,  borderRadius:2, background:'#2d3748' }}),
]);

const AvatarRej = () => h('div', {
  style: { width: 64, height: 64, borderRadius: 32, background: '#fce2dd',
           border: `1.8px solid ${C.rejBd}`, position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'flex' },
}, [
  h('div', { style: { position:'absolute', top:6, left:6, width:48, height:48, borderRadius:24, background:'#d84f42', overflow:'hidden', display:'flex' }}, [
    h('div', { style: { position:'absolute', top:10, left:18, width:12, height:12, borderRadius:6, background:'#fff' }}),
    h('div', { style: { position:'absolute', bottom:-2, left:7, width:34, height:22, borderRadius:17, background:'#fff' }}),
  ]),
]);

// ---- Dialogue turn shell ----
const Turn = ({ avatar, labelText, labelColor, actionText, actionColor = C.textMeta, bubbleBg, bubbleBd, children }) =>
  h(Row, { style: { alignItems: 'flex-start', marginBottom: 14 } }, [
    avatar,
    h(Col, { style: { marginLeft: 12, flex: 1, alignItems: 'flex-start' } }, [
      h(Row, { style: { alignItems: 'baseline', gap: 14, marginBottom: 4 } }, [
        h(Text, { style: { fontSize: 13, fontWeight: 700, color: labelColor, letterSpacing: 2.6, textTransform: 'uppercase' } }, labelText),
        actionText && h(Text, { style: { fontSize: 13, fontWeight: 500, color: actionColor, letterSpacing: 1.2, fontStyle: 'italic' } }, actionText),
      ]),
      h('div', {
        style: { width: 600, background: bubbleBg, border: `1px solid ${bubbleBd}`,
                 borderRadius: 12, padding: '14px 20px',
                 display: 'flex', flexDirection: 'column', gap: 4,
                 fontFamily: FONT, fontSize: 22, color: C.text, lineHeight: 1.5 },
      }, children),
    ]),
  ]);

// ---- Stars (SVG data-URI; half via overflow clip) ----
const STAR_PATH = 'M12 2 l2.9 6.1 L22 9.2 l-5.1 4.75 L18.2 21 L12 17.55 5.8 21 l1.3-7.05 L2 9.2 l7.1-1.1 z';
const _svg = (body) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`)}`;
const STAR_FULL  = _svg(`<path d="${STAR_PATH}" fill="${C.star}"/>`);
const STAR_EMPTY = _svg(`<path d="${STAR_PATH}" fill="#d9dde3"/>`);

const Stars = ({ rating = 4.5, size = 18 }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const items = [];
  for (let i = 0; i < full; i++) items.push(h('img', { src: STAR_FULL, width: size, height: size, style: { width: size, height: size } }));
  if (hasHalf) items.push(h('div', { style: { position:'relative', width: size, height: size, display:'flex' } }, [
    h('img', { src: STAR_EMPTY, style: { position:'absolute', top:0, left:0, width:size, height:size } }),
    h('div', { style: { position:'absolute', top:0, left:0, width: size/2, height: size, overflow:'hidden', display:'flex' } },
      h('img', { src: STAR_FULL, style: { width:size, height:size } })),
  ]));
  while (items.length < 5) items.push(h('img', { src: STAR_EMPTY, width: size, height: size, style: { width: size, height: size } }));
  return h(Row, { style: { gap: 2, alignItems: 'center' } }, items);
};

// ---- Review card ----
const ReviewCard = ({ label, thumb, title, meta, quoteLines, secondary, date }) =>
  h('div', {
    style: { width: '100%', background: C.cardBg, border: `0.8px solid ${C.cardBd}`,
             borderRadius: 10, padding: '14px 18px',
             display: 'flex', flexDirection: 'column', marginBottom: 10 },
  }, [
    h(Row, { style: { width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 20 } }, [
      h(Row, { style: { alignItems: 'center', gap: 14 } }, [
        h(Text, { style: { fontSize: 14, fontWeight: 700, color: C.rLabel, letterSpacing: 2.2, textTransform: 'uppercase', width: 44 } }, label),
        thumb && h('img', { src: thumb, style: { width: 108, height: 108, borderRadius: 54, objectFit: 'cover', border: '2px solid #fff' } }),
        h(Col, { style: { gap: 2 } }, [
          h(Text, { style: { fontSize: 20, fontWeight: 700, color: '#121823', letterSpacing: 0.1 } }, title),
          h(Text, { style: { fontSize: 13, color: C.textMeta, letterSpacing: 0.4, fontWeight: 400 } }, meta),
        ]),
      ]),
      h(Col, { style: { alignItems: 'flex-end', gap: 3 } }, [
        h(Stars, { size: 18 }),
        h(Row, { style: { alignItems: 'baseline', gap: 5 } }, [
          h(Text, { style: { fontSize: 15, fontWeight: 700 } }, '4.5'),
          h(Text, { style: { fontSize: 13, color: C.textMeta, fontWeight: 400 } }, '· 15 reviews'),
        ]),
      ]),
    ]),
    h('div', { style: { width: '100%', height: 1, background: C.dividerLine, margin: '12px 0 14px 0' } }),
    h(Col, { style: { width: '100%', gap: 6, paddingLeft: 22, paddingRight: 4 } }, [
      h(Col, { style: { gap: 4 } },
        quoteLines.map(segs =>
          h(Row, { style: { flexWrap: 'wrap', alignItems: 'baseline', gap: 2 } },
            segs.map(([text, hi]) =>
              hi
                ? h(Hi, { size: 19 }, text)
                : h(Text, { style: { fontSize: 19, color: C.textDim, fontWeight: 400, lineHeight: 1.5 } }, text)
            )
          )
        )
      ),
      secondary && h(Text, { style: { fontSize: 14, fontStyle: 'italic', color: C.textMeta, marginTop: 8, fontWeight: 400, letterSpacing: 0.2 } }, secondary),
      h(Row, { style: { justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, width: '100%',
                         borderTop: `0.6px dashed ${C.dividerLine}`, paddingTop: 6 } }, [
        h(Text, { style: { fontSize: 13, color: C.textMeta, fontWeight: 500 } }, date),
        h(Text, { style: { fontSize: 12, color: C.textDim, fontStyle: 'italic' } }, 'source.com/…'),
      ]),
    ]),
  ]);

// ---- MAIN: edit this to build your figure ----
export default function Fig({ thumbMian, thumbOpa } = {}) {
  return h(Col, {
    style: { width: 1664, padding: '14px 16px 16px 16px', fontFamily: FONT, gap: 12 },
  }, [
    // Banner
    h(Row, {
      style: { background: C.bannerBg, border: `0.8px solid ${C.bannerBd}`,
               borderRadius: 10, padding: '14px 26px',
               alignItems: 'center', gap: 32 },
    }, [
      h(Text, { style: { fontSize: 54, fontWeight: 900, color: '#1a2332', letterSpacing: 2.2 } }, 'YOUR TITLE'),
      h('div', { style: { width: 1, height: 46, background: C.bannerBd, opacity: 0.5 }}),
      h(Col, { style: { gap: 4 } }, [
        h(Row, { style: { gap: 10, alignItems: 'baseline' } }, [
          h(Text, { style: { fontSize: 14, fontWeight: 700, color: '#4a3d1a', letterSpacing: 2.4, textTransform: 'uppercase' } }, 'Subtitle'),
          h(Text, { style: { fontSize: 19, fontWeight: 400, color: '#2a2f3a', letterSpacing: 0.1 } }, 'one-line description here.'),
        ]),
      ]),
    ]),

    // Main row: phone (dialogue) + KB (review cards)
    h(Row, { style: { gap: 20, alignItems: 'stretch' } }, [
      // Phone
      h(Col, {
        style: { width: 820, background: C.phoneBg, border: `1px solid ${C.phoneBd}`,
                 borderRadius: 10, padding: '20px 22px' },
      }, [
        h(Turn, {
          avatar: h(AvatarUser, {}),
          labelText: 'T1  USER', labelColor: C.tUser,
          bubbleBg: C.userBg, bubbleBd: C.userBd,
        }, [
          h(Text, {}, 'Single-string text auto-wraps in Satori at the bubble width. Replace this with your user prompt.'),
        ]),
        h(Turn, {
          avatar: h(AvatarSys, {}),
          labelText: 'T2  SYSTEM', labelColor: C.tSys,
          actionText: 'recommend',
          bubbleBg: C.sysBg, bubbleBd: C.sysBd,
        }, [
          h(Text, {}, 'The system recommends something. A reviewer said'),
          h(Row, { style: { flexWrap: 'wrap', alignItems: 'baseline', gap: 6 } }, [
            h(Hi, {}, '"First half of the highlighted citation"'),
          ]),
          h(Row, { style: { flexWrap: 'wrap', alignItems: 'baseline', gap: 6 } }, [
            h(Hi, {}, '"second half of citation."'),
            h(Chip, { label: '[R1]' }),
          ]),
        ]),
      ]),

      // KB column
      h(Col, {
        style: { flex: 1, background: C.kbBg, border: `1px solid ${C.kbBd}`,
                 borderRadius: 10, padding: '18px 22px' },
      }, [
        // KB header
        h(Row, { style: { alignItems: 'center', gap: 14, marginBottom: 14 } }, [
          // Cylinder icon
          h('div', { style: { width: 44, height: 48, position: 'relative', display: 'flex', flexShrink: 0 } }, [
            h('div', { style: { position:'absolute', top:0,  left:0, width:44, height:16, borderRadius:22, background:'#4a7f38' }}),
            h('div', { style: { position:'absolute', top:8,  left:0, width:44, height:32, background:'#4a7f38' }}),
            h('div', { style: { position:'absolute', top:32, left:0, width:44, height:16, borderRadius:22, background:'#4a7f38' }}),
            h('div', { style: { position:'absolute', top:18, left:0, width:44, height:4,  borderRadius:22, background:'rgba(255,255,255,0.25)' }}),
          ]),
          h(Col, { style: { gap: 2 } }, [
            h(Text, { style: { fontSize: 22, fontWeight: 700, color: '#1a2332', letterSpacing: 0.3 } }, 'Knowledge Base'),
            h(Text, { style: { fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: '#4d7a3f', letterSpacing: 1.3, textTransform: 'uppercase' } }, 'Source'),
          ]),
        ]),

        h(ReviewCard, {
          label: '[R1]', thumb: thumbMian,
          title: 'Some Title Goes Here',
          meta: 'Location  ·  Category  ·  $$$$',
          quoteLines: [
            [['Dim context before the cited quote that fills most of the line width.', false]],
            [['Dim lead-in. ', false], ['The highlighted citation wraps across', true]],
            [['multiple lines of the card quote.', true], ['  Dim trailing context…', false]],
          ],
          secondary: 'optional: also: "…other quote…" — from a 4-star review',
          date: 'User · Mar 10, 2017',
        }),
      ]),
    ]),
  ]);
}
