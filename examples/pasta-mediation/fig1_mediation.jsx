/** @jsx h */
// 图 1 · 中介模型（螺丝钉长度 → 挖掘机扭矩 → 意大利面口感）
// JSX → Satori → SVG。系数与标签全部来自 pasta-paper-{zh,en}.tex 的宏，改数字只改这里。

export const h = (type, props, ...children) => {
  const flat = children.flat(Infinity).filter(c => c !== undefined && c !== null && c !== false);
  const p = { ...(props || {}) };
  if (type === 'div') p.style = { display: 'flex', ...(p.style || {}) };   // Satori 要求多子元素 div 显式 flex
  p.children = flat.length === 1 ? flat[0] : flat;
  return { type, props: p };
};

// 注意：Satori 会剥掉文本节点的首尾空格，相邻片段之间用 gap 拉开，不要靠字符串里的空格。
// ---- 布局常量：三个节点的位置是设计决定，写死；节点内部的对齐交给 flex；箭头按这些常量注入 ----
const CARD = { w: 400, h: 360 };
export const LAYOUT = {
  W: 1664, H: 820, CARD,
  node: { X: { x: 40, y: 360 }, M: { x: 632, y: 40 }, Y: { x: 1224, y: 360 } },
  arrows: {
    a:  { from: [440, 400],  to: [632, 340],  label: [523, 329] },   // X 右缘 → M 左缘
    b:  { from: [1032, 340], to: [1224, 400], label: [1141, 329] },  // M 右缘 → Y 左缘
    cp: { from: [440, 560],  to: [1224, 560], label: [832, 528] },   // X → Y 直接路径（虚线）
  },
  noteY: 742,
};

// ---- 论文配色（figures.tex / make_figs.py 同一套） ----
const C = { ink: '#16202B', mute: '#8A94A6', blue: '#2B6D8F', cardBd: '#cfd6df', bg: '#ffffff' };
const FONT = 'Lato, "Noto Sans CJK SC", sans-serif';

// ---- 系数：\MedA \MedB \MedCp ----
const COEF = { a: '0.62', b: '0.48', cp: '0.09' };

// ---- 标签：中英文各一套，对应 tex 里的 \MedX \MedM \MedY \MedNote ----
const L = {
  zh: {
    kicker: { X: '自变量 · X', M: '中介变量 · M', Y: '因变量 · Y' },
    name:   { X: '螺丝钉长度', M: '挖掘机扭矩', Y: '意大利面口感' },
    unit:   { X: ['L', '（毫米）'], M: ['T', '（牛·米）'], Y: ['P', '（0–10）'] },
    unitGap: 0,
    ns: '（n.s.）',
    note1: ['间接效应', 'ab', '= 0.30，Bootstrap 95% CI [0.18, 0.44]'],
    note2: '直接效应不显著，构成完全中介',
  },
  en: {
    kicker: { X: 'INDEPENDENT · X', M: 'MEDIATOR · M', Y: 'OUTCOME · Y' },
    name:   { X: 'Screw length', M: 'Excavator torque', Y: 'Pasta palatability' },
    unit:   { X: ['L', '(mm)'], M: ['T', '(N·m)'], Y: ['P', '(0–10)'] },
    unitGap: 5,
    ns: '(n.s.)',
    note1: ['Indirect effect', 'ab', '= 0.30, bootstrap 95% CI [0.18, 0.44]'],
    note2: 'Direct path not significant → full mediation',
  },
};

const Text = ({ style = {}, children }) =>
  h('div', { style: { fontFamily: FONT, color: C.ink, ...style } }, children);

// 节点卡片：kicker / 素材图 / 变量名 + 单位
const Card = ({ role, t, img, accent }) => {
  const { x, y } = LAYOUT.node[role];
  return h('div', {
    style: {
      position: 'absolute', left: x, top: y, width: CARD.w, height: CARD.h,
      flexDirection: 'column', background: C.bg, borderRadius: 14, padding: '16px 20px 18px',
      border: `${accent ? 1.6 : 1.2}px solid ${accent ? C.blue : C.cardBd}`,
    },
  },
    h(Text, { style: { fontSize: 13, fontWeight: 700, letterSpacing: 2.4, textTransform: 'uppercase', color: accent ? C.blue : C.mute } }, t.kicker[role]),
    h('div', { style: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' } },
      h('img', { src: img.src, width: img.w, height: img.h, style: { width: img.w, height: img.h } })),
    h('div', { style: { flexDirection: 'column', alignItems: 'center', width: '100%', gap: 2 } },
      h(Text, { style: { fontSize: 30, fontWeight: 700 } }, t.name[role]),
      h('div', { style: { alignItems: 'baseline', gap: t.unitGap } },
        h(Text, { style: { fontSize: 19, fontStyle: 'italic', color: C.mute } }, t.unit[role][0]),
        h(Text, { style: { fontSize: 19, color: C.mute } }, t.unit[role][1]))));
};

// 路径系数标签：以 (cx, cy) 为中心的 400×40 盒子，文字居中
const Coef = ({ at: [cx, cy], sym, val, suffix }) =>
  h('div', { style: { position: 'absolute', left: cx - 200, top: cy - 20, width: 400, height: 40, justifyContent: 'center', alignItems: 'baseline', gap: 8 } },
    h(Text, { style: { fontSize: 28, fontWeight: 700, fontStyle: 'italic' } }, sym),
    h(Text, { style: { fontSize: 28, fontWeight: 700 } }, `= ${val}`),
    suffix && h(Text, { style: { fontSize: 22, color: C.mute } }, suffix));

export default function Fig({ lang = 'zh', assets }) {
  const t = L[lang];
  const A = LAYOUT.arrows;
  return h('div', { style: { position: 'relative', width: LAYOUT.W, height: LAYOUT.H, background: C.bg, fontFamily: FONT } },
    h(Card, { role: 'X', t, img: assets.X }),
    h(Card, { role: 'M', t, img: assets.M, accent: true }),
    h(Card, { role: 'Y', t, img: assets.Y }),
    h(Coef, { at: A.a.label,  sym: 'a',  val: COEF.a }),
    h(Coef, { at: A.b.label,  sym: 'b',  val: COEF.b }),
    h(Coef, { at: A.cp.label, sym: 'c′', val: COEF.cp, suffix: t.ns }),
    h('div', { style: { position: 'absolute', left: 0, top: LAYOUT.noteY, width: LAYOUT.W, flexDirection: 'column', alignItems: 'center', gap: 4 } },
      h('div', { style: { alignItems: 'baseline', gap: 7 } },
        h(Text, { style: { fontSize: 22 } }, t.note1[0]),
        h(Text, { style: { fontSize: 22, fontStyle: 'italic' } }, t.note1[1]),
        h(Text, { style: { fontSize: 22 } }, t.note1[2])),
      h(Text, { style: { fontSize: 20, color: C.mute } }, t.note2)));
}
