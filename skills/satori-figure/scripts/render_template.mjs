// Satori render pipeline: fig1.jsx --esbuild--> compiled JS -> satori -> SVG
// --post-process--> arrows injected -> final SVG. Designed to live next to fig1.jsx.
//
// Usage:   node render_fig1.mjs
// Expects: fig1.jsx in the same directory; at least two base64 thumbnails saved to
//          /tmp/img0.b64 and /tmp/img1.b64 (optional — remove if your figure has no imgs).
//
// Convert to PDF after running this:
//   rsvg-convert -f pdf fig1.svg -o figures/fig1.pdf

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import satori from 'satori';

const HERE    = path.dirname(fileURLToPath(import.meta.url));
const SRC     = path.join(HERE, 'fig1.jsx');
const OUT_JS  = path.join(HERE, '.fig1.compiled.mjs');
const OUT_SVG = path.join(HERE, 'fig1.svg');

// ---- 1. esbuild compiles JSX with the custom h() factory ----
await build({
  entryPoints: [SRC],
  bundle: false,
  format: 'esm',
  platform: 'node',
  jsx: 'transform',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  outfile: OUT_JS,
  logLevel: 'warning',
});

const mod = await import(OUT_JS + `?t=${Date.now()}`);
const Fig = mod.default;

// ---- 2. Fonts: Lato preferred, fallback to Roboto ----
function loadFontDir(dir, prefix) {
  const want = [
    [`${prefix}-Light.ttf`,         300, 'normal'],
    [`${prefix}-Regular.ttf`,       400, 'normal'],
    [`${prefix}-Medium.ttf`,        500, 'normal'],
    [`${prefix}-Semibold.ttf`,      600, 'normal'],
    [`${prefix}-Bold.ttf`,          700, 'normal'],
    [`${prefix}-Black.ttf`,         900, 'normal'],
    [`${prefix}-Italic.ttf`,        400, 'italic'],
    [`${prefix}-MediumItalic.ttf`,  500, 'italic'],
    [`${prefix}-SemiboldItalic.ttf`,600, 'italic'],
  ];
  const out = [];
  for (const [file, weight, style] of want) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) {
      out.push({ name: prefix, weight, style, data: fs.readFileSync(p) });
    }
  }
  return out;
}

let fonts = loadFontDir('/usr/share/fonts/truetype/lato', 'Lato');
if (fonts.length === 0) {
  fonts = loadFontDir('/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF', 'Roboto');
}
if (fonts.length === 0) {
  throw new Error('No font family found. Install lato or roboto TTFs, or edit render_fig1.mjs fontDir.');
}

// ---- 3. Optional: base64 thumbnails ----
function b64ToDataURI(b64) { return `data:image/jpeg;base64,${b64}`; }
let thumbMian = null, thumbOpa = null;
if (fs.existsSync('/tmp/img0.b64'))
  thumbMian = b64ToDataURI(fs.readFileSync('/tmp/img0.b64', 'utf-8').trim());
if (fs.existsSync('/tmp/img1.b64'))
  thumbOpa  = b64ToDataURI(fs.readFileSync('/tmp/img1.b64', 'utf-8').trim());

// ---- 4. Render via Satori ----
const tree = Fig({ thumbMian, thumbOpa });
const svg = await satori(tree, {
  width: 1664,
  fonts,
  embedFont: true,
});

// ---- 5. Post-process: inject orthogonal arrows ----
//
// Satori has no way to draw arrow paths. We locate citation chip & label positions
// by regex-matching on characteristic fill colors. Adjust regex when palette changes.
//
// Key colors to set in JSX:
//   chip background = '#f7ecc9'   (sensed from rect fill)
//   [R#] label color = '#4a6a3a'  (sensed from mask/path fill pattern)
//
const CHIP_FILL_HEX   = '#f7ecc9';
const LABEL_FILL_HEX  = '#4a6a3a';

function findChips(svg) {
  const re = new RegExp(
    `<path\\s+x="([\\d.\\-]+)"\\s+y="([\\d.\\-]+)"\\s+width="([\\d.\\-]+)"\\s+height="([\\d.\\-]+)"\\s+fill="${CHIP_FILL_HEX}"`,
    'g'
  );
  const out = [];
  let m;
  while ((m = re.exec(svg)) !== null) {
    out.push({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
  }
  return out.sort((a, b) => a.y - b.y);
}

function findLabels(svg) {
  // [R#] label is rendered as <rect .../><path fill="<color>">
  // The rect right before the fill="<LABEL_FILL_HEX>" has the label bbox.
  const re = new RegExp(
    `<rect\\s+x="([\\d.\\-]+)"\\s+y="([\\d.\\-]+)"\\s+width="\\d+"\\s+height="\\d+"\\s+fill="#fff"\\s*\\/><\\/mask><g\\s*><path fill="${LABEL_FILL_HEX}"`,
    'g'
  );
  const out = [];
  let m;
  while ((m = re.exec(svg)) !== null) {
    out.push({ x: +m[1], y: +m[2] });
  }
  return out.sort((a, b) => a.y - b.y);
}

// Channel X: constant in the visual gap between source and target containers.
// Computed once based on your phone.right and KB.left. CHANGE this if you redo layout.
const CHANNEL_X = 706;
const CHIP_PAD_R = 4;

function arrowPath(sx, sy, tx, ty, channelX) {
  return `M ${sx} ${sy} L ${channelX} ${sy} L ${channelX} ${ty} L ${tx} ${ty}`;
}

const chips  = findChips(svg);
const labels = findLabels(svg);

let arrowDefs = '';
for (let i = 0; i < Math.min(chips.length, labels.length); i++) {
  const c = chips[i], l = labels[i];
  const sx = c.x + c.w + CHIP_PAD_R;
  const sy = c.y + c.h / 2;
  const tx = l.x + 4;
  const ty = l.y + 13;
  arrowDefs += `<path d="${arrowPath(sx, sy, tx, ty, CHANNEL_X)}" ` +
    `fill="none" stroke="#1e6537" stroke-width="3" stroke-dasharray="9 5" ` +
    `stroke-linecap="round" marker-end="url(#ah)"/>`;
}

const defs = `<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">` +
  `<polygon points="0,0 10,5 0,10" fill="#1e6537"/></marker></defs>`;

let finalSvg = svg.replace(/(<svg[^>]*>)/, `$1${defs}`);
finalSvg = finalSvg.replace(/<\/svg>\s*$/, `${arrowDefs}</svg>`);

fs.writeFileSync(OUT_SVG, finalSvg);

console.log(`wrote ${OUT_SVG} (${finalSvg.length} bytes)`);
console.log(`arrows: chips=${chips.length} labels=${labels.length} drawn=${Math.min(chips.length, labels.length)}`);
