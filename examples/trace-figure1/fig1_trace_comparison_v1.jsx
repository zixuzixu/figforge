/** @jsx h @jsxFrag Fragment */
// TRACE Figure 1 candidate: benchmark-comparison overview.
// JSX + Satori source; the renderer injects the dashed citation arrows.

export const h = (type, props, ...children) => {
  const flat = children.flat(Infinity).filter(c => c !== undefined && c !== null && c !== false);
  const kids = flat.length === 1 ? flat[0] : flat;
  const p = { ...(props || {}) };
  if (type === 'div') p.style = { display: 'flex', ...(p.style || {}) };
  p.children = kids;
  return { type, props: p };
};
export const Fragment = ({ children }) => children;

export const GEOM = {
  canvasW: 2400,
  canvasH: 980,
  pad: 40,
  leftW: 760,
  vsW: 120,
  gap: 24,
  panelH: 900,
  rightW: 1392,
  rightContentX: 28,
  rightContentY: 118,
  dialogueW: 690,
  dialogueH: 575,
  kbW: 602,
  kbH: 575,
  dialogueGap: 22,
  r1Chip: { x: 488, y: 284, w: 64, h: 31 },
  r2Chip: { x: 492, y: 526, w: 64, h: 31 },
  r1Label: { x: 22, y: 96, w: 56, h: 28 },
  r2Label: { x: 22, y: 338, w: 56, h: 28 },
};

const C = {
  bg: '#ffffff',
  text: '#111827',
  text2: '#374151',
  muted: '#7a8494',
  line: '#d8dee8',
  leftBg: 'linear-gradient(160deg, #fff7f4 0%, #f1ded7 100%)',
  leftBd: '#c99a90',
  leftTitle: '#7a352d',
  leftAccent: '#a54336',
  leftSoft: '#fffdfc',
  leftChip: '#fff6f3',
  leftChipBd: '#d8b5ae',
  rightBg: 'linear-gradient(160deg, #f4fbef 0%, #dcefd1 100%)',
  rightBd: '#75a85d',
  rightTitle: '#224f22',
  green: '#17854a',
  green2: '#2f6f39',
  greenSoft: '#cfe8bf',
  blue: '#1f58ae',
  blueSoft: '#dfeafa',
  red: '#d64d42',
  redSoft: '#fee2de',
  grayCard: '#f5f7fa',
  grayBd: '#b9c3d0',
  quote: '#c9e8b7',
  citeBg: '#fde8a3',
  citeBd: '#c79a28',
  amber: '#b9731e',
  c1Bg: 'linear-gradient(135deg, #e8f2fc 0%, #cfe1f4 100%)',
  c1Bd: '#4a83bf',
  c1Text: '#1b4777',
  c2Bg: 'linear-gradient(135deg, #eef8e7 0%, #cfe8b4 100%)',
  c2Bd: '#4e9638',
  c2Text: '#25521c',
  c3Bg: 'linear-gradient(135deg, #fff1e2 0%, #f7d4a6 100%)',
  c3Bd: '#c37b27',
  c3Text: '#62380a',
};

const FONT = '"Lato","Helvetica Neue",Arial,sans-serif';

const Row = ({ style = {}, children }) => h('div', {
  style: { display: 'flex', flexDirection: 'row', ...style },
}, children);
const Col = ({ style = {}, children }) => h('div', {
  style: { display: 'flex', flexDirection: 'column', ...style },
}, children);
const Text = ({ style = {}, children }) => h('div', {
  style: { display: 'flex', fontFamily: FONT, color: C.text, ...style },
}, children);

const Panel = ({ side, children }) => {
  const isLeft = side === 'left';
  return h(Col, {
    style: {
      width: isLeft ? GEOM.leftW : GEOM.rightW,
      height: GEOM.panelH,
      border: `2px dashed ${isLeft ? C.leftBd : C.rightBd}`,
      borderRadius: 18,
      background: isLeft ? C.leftBg : C.rightBg,
      padding: isLeft ? '24px 26px' : '24px 28px',
      position: 'relative',
      overflow: 'hidden',
    },
  }, children);
};

const Card = ({ children, style = {} }) => h(Col, {
  style: {
    background: '#ffffff',
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: '16px 18px',
    ...style,
  },
}, children);

const Title = ({ children, sub, color, size = 40 }) => h(Col, { style: { gap: 4 } }, [
  h(Text, { style: { fontSize: size, fontWeight: 900, color, letterSpacing: 0.2, lineHeight: 1.05 } }, children),
  sub && h(Text, {
    style: { fontSize: 18, color: C.text2, fontWeight: 600, fontStyle: 'italic' },
  }, sub),
]);

const CrossIcon = ({ size = 28 }) => h('div', {
  style: {
    width: size,
    height: size,
    borderRadius: size / 2,
    border: `2px solid ${C.red}`,
    background: '#fff4f2',
    position: 'relative',
    flexShrink: 0,
  },
}, [
  h('div', { style: {
    position: 'absolute', left: size * 0.22, top: size * 0.47,
    width: size * 0.56, height: 3, borderRadius: 2,
    background: C.red, transform: 'rotate(45deg)',
  } }),
  h('div', { style: {
    position: 'absolute', left: size * 0.22, top: size * 0.47,
    width: size * 0.56, height: 3, borderRadius: 2,
    background: C.red, transform: 'rotate(-45deg)',
  } }),
]);

const CheckIcon = ({ size = 28, color = C.green }) => h('div', {
  style: { width: size, height: size, position: 'relative', flexShrink: 0 },
}, [
  h('div', { style: {
    position: 'absolute', left: size * 0.12, top: size * 0.55,
    width: size * 0.38, height: 4, borderRadius: 2,
    background: color, transform: 'rotate(45deg)',
  } }),
  h('div', { style: {
    position: 'absolute', left: size * 0.34, top: size * 0.48,
    width: size * 0.60, height: 4, borderRadius: 2,
    background: color, transform: 'rotate(-45deg)',
  } }),
]);

const UserAvatar = ({ size = 54, color = C.blue }) => h('div', {
  style: {
    width: size, height: size, borderRadius: size / 2,
    background: color, position: 'relative', overflow: 'hidden', flexShrink: 0,
  },
}, [
  h('div', { style: {
    position: 'absolute', top: size * 0.20, left: size * 0.35,
    width: size * 0.30, height: size * 0.30,
    borderRadius: size * 0.15, background: '#ffffff',
  } }),
  h('div', { style: {
    position: 'absolute', bottom: -size * 0.05, left: size * 0.14,
    width: size * 0.72, height: size * 0.42,
    borderRadius: size * 0.28, background: '#ffffff',
  } }),
]);

const BotAvatar = ({ size = 54 }) => h('div', {
  style: {
    width: size, height: size, borderRadius: size / 2,
    background: '#f5f6f7',
    border: `2px solid ${C.grayBd}`,
    position: 'relative', flexShrink: 0,
  },
}, [
  h('div', { style: {
    position: 'absolute', top: size * 0.17, left: size * 0.45,
    width: size * 0.10, height: size * 0.10,
    borderRadius: size * 0.05, background: C.text2,
  } }),
  h('div', { style: {
    position: 'absolute', top: size * 0.26, left: size * 0.48,
    width: size * 0.04, height: size * 0.12, background: C.text2,
  } }),
  h('div', { style: {
    position: 'absolute', top: size * 0.39, left: size * 0.26,
    width: size * 0.48, height: size * 0.32,
    borderRadius: 6, border: `3px solid ${C.text2}`,
  } }),
  h('div', { style: {
    position: 'absolute', top: size * 0.50, left: size * 0.38,
    width: 4, height: 4, borderRadius: 2, background: C.text2,
  } }),
  h('div', { style: {
    position: 'absolute', top: size * 0.50, left: size * 0.58,
    width: 4, height: 4, borderRadius: 2, background: C.text2,
  } }),
]);

const RestaurantIcon = ({ size = 44, bg = '#fff7ed', color = '#8a4f15' }) => h('div', {
  style: {
    width: size,
    height: size,
    borderRadius: size / 2,
    background: bg,
    border: `1.5px solid ${color}`,
    position: 'relative',
    flexShrink: 0,
  },
}, [
  // plate
  h('div', {
    style: {
      position: 'absolute',
      left: size * 0.33,
      top: size * 0.34,
      width: size * 0.34,
      height: size * 0.34,
      borderRadius: size * 0.17,
      border: `2px solid ${color}`,
    },
  }),
  h('div', {
    style: {
      position: 'absolute',
      left: size * 0.43,
      top: size * 0.44,
      width: size * 0.14,
      height: size * 0.14,
      borderRadius: size * 0.07,
      border: `1.6px solid ${color}`,
    },
  }),
  // fork
  h('div', { style: { position: 'absolute', left: size * 0.20, top: size * 0.24, width: 2.4, height: size * 0.52, background: color, borderRadius: 2 } }),
  h('div', { style: { position: 'absolute', left: size * 0.16, top: size * 0.24, width: 2, height: size * 0.16, background: color, borderRadius: 2 } }),
  h('div', { style: { position: 'absolute', left: size * 0.22, top: size * 0.24, width: 2, height: size * 0.16, background: color, borderRadius: 2 } }),
  // knife
  h('div', { style: { position: 'absolute', right: size * 0.20, top: size * 0.24, width: 3, height: size * 0.52, background: color, borderRadius: 3 } }),
  h('div', { style: { position: 'absolute', right: size * 0.17, top: size * 0.24, width: 5, height: size * 0.25, background: color, borderRadius: '5px 5px 2px 2px' } }),
]);

const STAR_PATH = 'M12 2 l2.9 6.1 L22 9.2 l-5.1 4.75 L18.2 21 L12 17.55 5.8 21 l1.3-7.05 L2 9.2 l7.1-1.1 z';
const starSvg = (fill) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${STAR_PATH}" fill="${fill}"/></svg>`)}`;
const STAR_FULL = starSvg('#d9a430');
const STAR_EMPTY = starSvg('#d9dde3');

const Star = ({ size = 18, filled = true }) =>
  h('img', { src: filled ? STAR_FULL : STAR_EMPTY, width: size, height: size, style: { width: size, height: size } });

const HalfStar = ({ size = 18 }) => h('div', {
  style: { position: 'relative', width: size, height: size, flexShrink: 0 },
}, [
  h('img', {
    src: STAR_EMPTY, width: size, height: size,
    style: { position: 'absolute', left: 0, top: 0, width: size, height: size },
  }),
  h('div', {
    style: { position: 'absolute', left: 0, top: 0, width: size / 2, height: size, overflow: 'hidden' },
  }, [
    h('img', { src: STAR_FULL, width: size, height: size, style: { width: size, height: size } }),
  ]),
]);

const Stars = ({ size = 18, rating = 4.5 }) => {
  const full = Math.floor(rating);
  const frac = rating - full;
  const hasHalf = frac >= 0.25 && frac < 0.75;
  const extraFull = frac >= 0.75 ? 1 : 0;
  const items = [];
  for (let i = 0; i < full; i++) items.push(h(Star, { size, key: `f${i}` }));
  if (hasHalf) items.push(h(HalfStar, { size, key: 'h' }));
  for (let i = 0; i < extraFull; i++) items.push(h(Star, { size, key: `x${i}` }));
  while (items.length < 5) items.push(h(Star, { size, filled: false, key: `e${items.length}` }));
  return h(Row, { style: { gap: 2, alignItems: 'center' } }, items);
};

const DownArrow = () => h(Col, {
  style: { alignItems: 'center', margin: '5px 0 6px' },
}, [
  h('div', { style: { width: 9, height: 18, background: '#c4cbd5' } }),
  h('div', {
    style: {
      width: 0, height: 0,
      borderLeft: '15px solid transparent',
      borderRight: '15px solid transparent',
      borderTop: '16px solid #c4cbd5',
    },
  }),
]);

const Pill = ({ children, tone = 'left' }) => h('div', {
  style: {
    border: `1px solid ${tone === 'left' ? C.leftChipBd : '#a7c890'}`,
    background: tone === 'left' ? C.leftChip : '#ffffff',
    color: tone === 'left' ? '#684039' : C.green2,
    borderRadius: 14,
    padding: tone === 'left' ? '6px 13px' : '4px 10px',
    fontFamily: FONT,
    fontSize: tone === 'left' ? 17 : 15,
    fontWeight: 800,
    letterSpacing: 0.2,
  },
}, children);

const LimitRow = ({ label, detail }) => h(Row, {
  style: { alignItems: 'flex-start', gap: 10, marginBottom: 9 },
}, [
  h(CrossIcon, { size: 24 }),
  h(Col, { style: { gap: 2, flex: 1 } }, [
    h(Text, { style: { fontSize: 20, fontWeight: 900, color: C.leftAccent } }, label),
    h(Text, { style: { fontSize: 14, fontWeight: 600, color: C.text2, lineHeight: 1.25 } }, detail),
  ]),
]);

const LeftPanel = () => h(Panel, { side: 'left' }, [
  h(Title, {
    color: C.leftTitle,
    size: 30,
    sub: 'Fragmented coverage: recommendation lists without end-to-end audit',
  }, 'Existing Tourism Recommendation Benchmark'),

  h(Card, { style: { marginTop: 14, padding: '12px 18px', background: C.blueSoft, border: `1px solid #7fa6df` } }, [
    h(Row, { style: { gap: 14, alignItems: 'center' } }, [
      h(UserAvatar, { size: 54 }),
      h(RestaurantIcon, { size: 42, bg: '#ffffff', color: '#315f9d' }),
      h(Text, {
        style: { fontSize: 24, fontWeight: 700, lineHeight: 1.35 },
      }, 'Can you recommend a place for my trip?'),
    ]),
  ]),

  h(DownArrow),

  h(Card, { style: { padding: '12px 16px', marginBottom: 12 } }, [
    h(Text, {
      style: {
        fontSize: 15, fontWeight: 900, color: C.muted,
        letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10,
      },
    }, 'Typical Output'),
    h(Row, { style: { borderBottom: `1px solid ${C.line}`, paddingBottom: 8 } }, [
      h(Text, { style: { width: 42, fontSize: 16, fontWeight: 900, color: C.muted } }, 'Rank'),
      h(Text, { style: { flex: 1, fontSize: 16, fontWeight: 900, color: C.muted } }, 'Item'),
      h(Text, { style: { width: 122, fontSize: 16, fontWeight: 900, color: C.muted } }, 'Rating'),
    ]),
    [
      ['1', 'Restaurant mention', '4.5'],
      ['2', 'Hotel mention', '4.2'],
      ['?', 'evidence not checked', 'X'],
    ].map((r, i) =>
      h(Row, {
        style: {
          borderBottom: i === 2 ? 'none' : `1px dashed ${C.line}`,
          padding: '7px 0',
          alignItems: 'center',
        },
      }, [
        h(Text, { style: { width: 42, fontSize: 18, fontWeight: 900, color: i === 2 ? C.red : C.text2 } }, r[0]),
        h(Row, { style: { flex: 1, gap: 8, alignItems: 'center' } }, [
          i === 0 ? h(RestaurantIcon, { size: 28, bg: '#fff7ed', color: '#8a4f15' }) : h(RestaurantIcon, { size: 28, bg: '#f8fafc', color: '#6b7280' }),
          h(Text, { style: { fontSize: 19, fontWeight: 700, color: i === 2 ? C.muted : C.text } }, r[1]),
        ]),
        i === 2
          ? h(Text, { style: { width: 122, fontSize: 18, fontWeight: 900, color: C.red } }, r[2])
          : h(Row, { style: { width: 122, alignItems: 'center', gap: 6 } }, [
              h(Text, { style: { fontSize: 18, fontWeight: 900, color: '#1f6b30' } }, r[2]),
              h(Stars, { size: 14, rating: Number(r[2]) }),
            ]),
      ])
    ),
  ]),

  h(Card, { style: { padding: '13px 16px', marginBottom: 12 } }, [
    h(Text, {
      style: {
        fontSize: 15, fontWeight: 900, color: C.leftAccent,
        letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 8,
      },
    }, 'Coverage Gaps'),
    h(LimitRow, { label: 'Entity Recall', detail: 'leaderboards stop at item mentions' }),
    h(LimitRow, { label: 'No Review Evidence', detail: 'recommendation claims are not auditable' }),
    h(LimitRow, { label: 'Weak Tourism Context', detail: 'spatial and itinerary constraints stay partial' }),
    h(LimitRow, { label: 'No Repair Test', detail: 'user rejection is not a benchmark target' }),
  ]),

  h(Card, { style: { padding: '12px 16px' } }, [
    h(Text, {
      style: {
        fontSize: 15, fontWeight: 900, color: C.leftAccent,
        letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 9,
      },
    }, 'Compared Resources'),
    h(Row, { style: { gap: 8, marginBottom: 7, flexWrap: 'wrap' } }, [
      h(Pill, {}, 'ReDial'),
      h(Pill, {}, 'TG-ReDial'),
      h(Pill, {}, 'INSPIRED'),
      h(Pill, {}, 'DuRecDial'),
    ]),
    h(Row, { style: { gap: 8, flexWrap: 'wrap' } }, [
      h(Pill, {}, 'OpenDialKG'),
      h(Pill, {}, 'TourismQA'),
      h(Pill, {}, 'RETAIL'),
    ]),
  ]),
]);

const VsBadge = () => h(Col, {
  style: { width: GEOM.vsW, height: GEOM.panelH, alignItems: 'center', justifyContent: 'center' },
}, [
  h('div', {
    style: {
      width: 98, height: 98, borderRadius: 49,
      border: `3px solid ${C.amber}`,
      background: 'linear-gradient(135deg, #fff3c8 0%, #f6c77e 100%)',
      alignItems: 'center', justifyContent: 'center',
    },
  }, [
    h(Text, { style: { fontSize: 42, fontWeight: 900, color: '#753d0b', letterSpacing: 2 } }, 'VS'),
  ]),
]);

const CitationChip = ({ label, x, y }) => h('div', {
  style: {
    position: 'absolute', left: x, top: y,
    width: 64, height: 31, borderRadius: 6,
    border: `1px solid ${C.citeBd}`,
    background: C.citeBg,
    alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT, fontSize: 20, fontWeight: 900,
    color: '#684e12', letterSpacing: 0.5,
  },
}, label);

const Hi = ({ children, style = {} }) => h('div', {
  style: {
    background: C.quote,
    borderRadius: 5,
    padding: '1px 7px',
    fontFamily: FONT,
    fontSize: 23,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1.28,
    ...style,
  },
}, children);

const TurnLabel = ({ children, color, x, y, action }) => h(Row, {
  style: { position: 'absolute', left: x, top: y, alignItems: 'baseline', gap: 12 },
}, [
  h(Text, {
    style: {
      fontSize: 15, fontWeight: 900, color,
      letterSpacing: 2.2, textTransform: 'uppercase',
    },
  }, children),
  action && h(Text, {
    style: {
      fontSize: 14, fontWeight: 800, color,
      letterSpacing: 1.1, fontStyle: 'italic',
    },
  }, action),
]);

const Bubble = ({ x, y, w, hgt, bg, bd, children }) => h(Col, {
  style: {
    position: 'absolute', left: x, top: y,
    width: w, height: hgt,
    borderRadius: 12,
    border: `1px solid ${bd}`,
    background: bg,
    padding: '14px 18px',
    gap: 5,
  },
}, children);

const DialogueCard = () => h('div', {
  style: {
    width: GEOM.dialogueW,
    height: GEOM.dialogueH,
    borderRadius: 12,
    border: `1px solid #9fb7d9`,
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
}, [
  h('div', { style: { position: 'absolute', left: 22, top: 34 } }, h(UserAvatar, { size: 54, color: C.blue })),
  h(TurnLabel, { x: 92, y: 22, color: C.blue }, 'T1 USER'),
  h(Bubble, { x: 92, y: 50, w: 558, hgt: 98, bg: C.blueSoft, bd: '#7fa6df' }, [
    h(Text, { style: { fontSize: 21, fontWeight: 750, lineHeight: 1.28 } },
      'I am a food blogger visiting Tucson. I want a high-end dinner spot downtown with wow-factor ambiance.'),
  ]),

  h('div', { style: { position: 'absolute', left: 22, top: 174 } }, h(BotAvatar, { size: 54 })),
  h(TurnLabel, { x: 92, y: 158, color: C.text, action: 'recommend' }, 'T2 SYSTEM'),
  h(Bubble, { x: 92, y: 186, w: 558, hgt: 145, bg: C.grayCard, bd: C.grayBd }, [
    h(Text, { style: { fontSize: 22, fontWeight: 800, lineHeight: 1.20 } },
      'MiAn Sushi and Modern Asian Cuisine fits the upscale, photo-worthy dinner request.'),
    h(Row, { style: { alignItems: 'baseline', gap: 6, flexWrap: 'wrap' } }, [
      h(Text, { style: { fontSize: 20, fontWeight: 700 } }, 'A reviewer wrote'),
      h(Hi, { style: { fontSize: 20 } }, '"Classy and upscale"'),
      h(Text, { style: { fontSize: 20, fontWeight: 700 } }, 'with no dress code.'),
    ]),
  ]),
  h(CitationChip, { label: '[R1]', x: GEOM.r1Chip.x, y: GEOM.r1Chip.y }),

  h('div', { style: { position: 'absolute', left: 22, top: 352 } }, h(UserAvatar, { size: 54, color: C.red })),
  h(TurnLabel, { x: 92, y: 338, color: C.red, action: 'reject_and_refine' }, 'T3 USER'),
  h(Bubble, { x: 92, y: 366, w: 558, hgt: 84, bg: C.redSoft, bd: C.red }, [
    h(Text, { style: { fontSize: 21, fontWeight: 750, lineHeight: 1.28 } },
      'Thanks, but I have had a lot of sushi lately. Could you suggest something Mediterranean instead?'),
  ]),

  h('div', { style: { position: 'absolute', left: 22, top: 474 } }, h(BotAvatar, { size: 54 })),
  h(TurnLabel, { x: 92, y: 458, color: C.text, action: 'recommend' }, 'T4 SYSTEM'),
  h(Bubble, { x: 92, y: 486, w: 558, hgt: 76, bg: C.grayCard, bd: C.grayBd }, [
    h(Row, { style: { alignItems: 'baseline', gap: 6, flexWrap: 'wrap' } }, [
      h(Text, { style: { fontSize: 20, fontWeight: 800 } }, 'Then Opa\'s Best Greek matches the revised cuisine.'),
    ]),
    h(Row, { style: { alignItems: 'baseline', gap: 6, flexWrap: 'wrap' } }, [
      h(Text, { style: { fontSize: 19, fontWeight: 700 } }, 'Review span:'),
      h(Hi, { style: { fontSize: 19 } }, '"Santorini"'),
    ]),
  ]),
  h(CitationChip, { label: '[R2]', x: GEOM.r2Chip.x, y: GEOM.r2Chip.y }),
]);

const DbIcon = () => h('div', {
  style: { width: 42, height: 48, position: 'relative', flexShrink: 0 },
}, [
  h('div', { style: { position: 'absolute', top: 0, left: 0, width: 42, height: 15, borderRadius: 21, background: '#4b8038' } }),
  h('div', { style: { position: 'absolute', top: 8, left: 0, width: 42, height: 31, background: '#4b8038' } }),
  h('div', { style: { position: 'absolute', top: 31, left: 0, width: 42, height: 15, borderRadius: 21, background: '#4b8038' } }),
  h('div', { style: { position: 'absolute', top: 18, left: 0, width: 42, height: 3, background: 'rgba(255,255,255,0.25)' } }),
]);

const ReviewCard = ({ label, title, y, meta, rating = '4.5', reviews = '15 reviews', lines }) => h(Col, {
  style: {
    position: 'absolute', left: 20, top: y,
    width: GEOM.kbW - 40,
    height: 206,
    borderRadius: 12,
    border: `1px solid #c9d9c2`,
    background: '#ffffff',
    padding: '14px 18px',
  },
}, [
  h(Row, { style: { alignItems: 'center', gap: 12, marginBottom: 9 } }, [
    h(Text, {
      style: {
        width: 56, fontSize: 17, fontWeight: 900,
        color: C.green, letterSpacing: 1.4,
      },
    }, label),
    h(RestaurantIcon, { size: 58, bg: '#fff7ed', color: '#8a4f15' }),
    h(Col, { style: { gap: 2, flex: 1 } }, [
      h(Text, { style: { fontSize: 22, fontWeight: 900, color: C.text } }, title),
      h(Text, { style: { fontSize: 14, fontWeight: 700, color: C.text2 } }, meta),
    ]),
    h(Col, { style: { alignItems: 'flex-end', gap: 3 } }, [
      h(Stars, { size: 17, rating: Number(rating) }),
      h(Row, { style: { alignItems: 'baseline', gap: 4 } }, [
        h(Text, { style: { fontSize: 17, fontWeight: 900, color: C.text } }, rating),
        h(Text, { style: { fontSize: 13, fontWeight: 700, color: C.text2 } }, reviews),
      ]),
    ]),
  ]),
  h('div', { style: { width: '100%', height: 1, background: C.line, marginBottom: 9 } }),
  h(Col, { style: { gap: 5, paddingLeft: 20 } },
    lines.map(parts => h(Row, { style: { alignItems: 'baseline', gap: 4, flexWrap: 'wrap' } },
      parts.map(([text, hi]) => hi
        ? h(Hi, { style: { fontSize: 20 } }, text)
        : h(Text, { style: { fontSize: 20, color: C.muted, fontWeight: 600, lineHeight: 1.25 } }, text)
      )
    ))
  ),
]);

const KnowledgeBase = () => h('div', {
  style: {
    width: GEOM.kbW,
    height: GEOM.kbH,
    borderRadius: 12,
    border: `1px solid ${C.rightBd}`,
    background: 'linear-gradient(160deg, #f1faec 0%, #e1efd7 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
}, [
  h(Row, { style: { position: 'absolute', left: 24, top: 22, alignItems: 'center', gap: 14 } }, [
    h(DbIcon),
    h(Col, { style: { gap: 1 } }, [
      h(Text, { style: { fontSize: 30, fontWeight: 900, color: C.text } }, 'Yelp Reviews'),
      h(Text, {
        style: { fontSize: 15, fontWeight: 800, color: C.green2, letterSpacing: 2, textTransform: 'uppercase' },
      }, 'Review-span evidence'),
    ]),
  ]),
  h(ReviewCard, {
    label: '[R1]',
    title: 'MiAn Sushi',
    meta: 'Tucson · Sushi · $$$$ · Fine Dining',
    rating: '4.5',
    y: 92,
    lines: [
      [['A reviewer wrote: ', false], ['Classy and upscale', true]],
      [['with no dress code and great service.', false]],
      [['Good fit for an upscale dinner, but cuisine may conflict.', false]],
    ],
  }),
  h(ReviewCard, {
    label: '[R2]',
    title: 'Opa\'s Best Greek',
    meta: 'Tucson · Greek · $$$ · Mediterranean',
    rating: '4.5',
    y: 334,
    lines: [
      [['The space shouted ', false], ['Santorini', true]],
      [['with blue and white tile.', false]],
      [['Better match after the explicit cuisine rejection.', false]],
    ],
  }),
]);

const Competency = ({ tag, name, detail, bg, bd, color, chips }) => h(Col, {
  style: {
    flex: 1,
    height: 108,
    borderRadius: 12,
    border: `1.6px solid ${bd}`,
    background: bg,
    padding: '12px 16px',
    gap: 5,
  },
}, [
  h(Row, { style: { alignItems: 'center', gap: 10 } }, [
    h('div', {
      style: {
        borderRadius: 7,
        border: `1.6px solid ${bd}`,
        background: '#ffffff',
        padding: '2px 9px',
        fontFamily: FONT,
        fontSize: 19,
        fontWeight: 900,
        color,
      },
    }, tag),
    h(Text, { style: { fontSize: 22, fontWeight: 900, color } }, name),
  ]),
  h(Text, { style: { fontSize: 15, fontWeight: 650, color: C.text2, lineHeight: 1.22 } }, detail),
  h(Row, { style: { gap: 6, flexWrap: 'wrap', marginTop: 1 } },
    chips.map(chip => h(Pill, { tone: 'right' }, chip))
  ),
]);

const RightPanel = () => h(Panel, { side: 'right' }, [
  h(Title, {
    color: C.rightTitle,
    sub: 'A single audit unit: choose the POI, cite the review span, then repair after rejection',
  }, 'TRACE'),

  h(Row, {
    style: {
      position: 'absolute',
      left: GEOM.rightContentX,
      top: GEOM.rightContentY,
      gap: GEOM.dialogueGap,
      alignItems: 'stretch',
    },
  }, [
    h(DialogueCard),
    h(KnowledgeBase),
  ]),

  h(Row, {
    style: {
      position: 'absolute',
      left: GEOM.rightContentX,
      right: 28,
      bottom: 72,
      gap: 14,
    },
  }, [
    h(Competency, {
      tag: 'C1', name: 'Accuracy',
      detail: 'Right POI under closed/open pools.',
      bg: C.c1Bg, bd: C.c1Bd, color: C.c1Text,
      chips: ['Spatial', 'Multi-aspect'],
    }),
    h(Competency, {
      tag: 'C2', name: 'Grounding',
      detail: 'Claims must point to cited review spans.',
      bg: C.c2Bg, bd: C.c2Bd, color: C.c2Text,
      chips: ['Review-span', 'Provenance'],
    }),
    h(Competency, {
      tag: 'C3', name: 'Recovery',
      detail: 'Rejection becomes a measured repair turn.',
      bg: C.c3Bg, bd: C.c3Bd, color: C.c3Text,
      chips: ['Repair test', 'Difficulty tiers'],
    }),
  ]),

  h(Text, {
    style: {
      position: 'absolute', left: 32, bottom: 24,
      fontSize: 17, fontWeight: 800, color: C.rightTitle,
      fontStyle: 'italic',
    },
  }, 'TRACE exposes the three-competency gap hidden by single-axis leaderboards.'),
]);

export default function Fig() {
  return h(Row, {
    style: {
      width: GEOM.canvasW,
      height: GEOM.canvasH,
      background: C.bg,
      padding: `${GEOM.pad}px`,
      gap: GEOM.gap,
      alignItems: 'stretch',
      fontFamily: FONT,
      boxSizing: 'border-box',
    },
  }, [
    h(LeftPanel),
    h(VsBadge),
    h(RightPanel),
  ]);
}
