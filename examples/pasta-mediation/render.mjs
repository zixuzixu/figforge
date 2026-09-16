// fig1_mediation.jsx --esbuild--> satori --> SVG --> 注入三条箭头 --> fig1_mediation_<lang>.svg
//   node render.mjs zh      # 或 en
// 之后：rsvg-convert -f pdf fig1_mediation_zh.svg -o fig1_mediation_zh.pdf
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import satori from 'satori';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const lang = process.argv[2] || 'zh';
const COMPILED = path.join(HERE, '.fig1_mediation.compiled.mjs');

await build({ entryPoints: [path.join(HERE, 'fig1_mediation.jsx')], bundle: false, format: 'esm', platform: 'node',
              jsx: 'transform', jsxFactory: 'h', outfile: COMPILED, logLevel: 'warning' });
const { default: Fig, LAYOUT } = await import(COMPILED + `?t=${Date.now()}`);

// 字体：Lato 管西文和数字，Noto Sans CJK SC 兜底中文（Satori 按字形逐字回退）
const font = (name, file, weight, style = 'normal') => ({ name, data: fs.readFileSync(file), weight, style });
const LATO = '/usr/share/fonts/truetype/lato';
const fonts = [
  font('Lato', `${LATO}/Lato-Regular.ttf`, 400), font('Lato', `${LATO}/Lato-Bold.ttf`, 700),
  font('Lato', `${LATO}/Lato-Italic.ttf`, 400, 'italic'), font('Lato', `${LATO}/Lato-BoldItalic.ttf`, 700, 'italic'),
  font('Noto Sans CJK SC', path.join(HERE, 'fonts/NotoSansCJKsc-Regular.otf'), 400),
  font('Noto Sans CJK SC', path.join(HERE, 'fonts/NotoSansCJKsc-Bold.otf'), 700),
];

// 素材：PNG 读尺寸，等比缩进给定盒子，base64 内嵌
const pngSize = buf => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });
const asset = (name, bw, bh) => {
  const buf = fs.readFileSync(path.join(HERE, 'assets', `${name}.png`));
  const { w, h } = pngSize(buf);
  const s = Math.min(bw / w, bh / h);
  return { src: `data:image/png;base64,${buf.toString('base64')}`, w: Math.round(w * s), h: Math.round(h * s) };
};
const assets = { X: asset('screw', 340, 150), M: asset('excavator', 360, 210), Y: asset('pasta', 360, 210) };

let svg = await satori(Fig({ lang, assets }), { width: LAYOUT.W, height: LAYOUT.H, fonts, embedFont: true });

// 箭头：Satori 画不了线，按 LAYOUT 里的常量注入。实线蓝 = 显著路径，虚线灰 = 不显著的直接路径
const BLUE = '#2B6D8F', GRAY = '#8A94A6';
const marker = (id, color) =>
  `<marker id="${id}" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="14" refX="18" refY="7" orient="auto">` +
  `<path d="M 0 0 L 18 7 L 0 14 z" fill="${color}"/></marker>`;
const line = ({ from: [x1, y1], to: [x2, y2] }, color, dashed) =>
  `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="3.5"` +
  (dashed ? ' stroke-dasharray="11 8"' : '') + ` marker-end="url(#${dashed ? 'ah-gray' : 'ah-blue'})"/>`;
const { a, b, cp } = LAYOUT.arrows;
svg = svg.replace(/(<svg[^>]*>)/, `$1<defs>${marker('ah-blue', BLUE)}${marker('ah-gray', GRAY)}</defs>`);
svg = svg.replace(/<\/svg>\s*$/, `${line(cp, GRAY, true)}${line(a, BLUE)}${line(b, BLUE)}</svg>`);

const out = path.join(HERE, `fig1_mediation_${lang}.svg`);
fs.writeFileSync(out, svg);
console.log(`wrote ${path.basename(out)} (${(svg.length / 1024).toFixed(0)} KB)`);
