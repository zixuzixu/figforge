// Render fig1_trace_comparison_v1.jsx with Satori and inject citation arrows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import satori from 'satori';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'fig1_trace_comparison_v1.jsx');
const OUT_JS = path.join('/tmp', `fig1_trace_comparison_v1.${process.pid}.compiled.mjs`);
const OUT_SVG = path.join(HERE, 'fig1_trace_comparison_v1.svg');

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
const { GEOM } = mod;

const latoDir = '/usr/share/fonts/truetype/lato';
const fonts = [
  { name: 'Lato', weight: 400, style: 'normal', data: fs.readFileSync(`${latoDir}/Lato-Regular.ttf`) },
  { name: 'Lato', weight: 500, style: 'normal', data: fs.readFileSync(`${latoDir}/Lato-Medium.ttf`) },
  { name: 'Lato', weight: 600, style: 'normal', data: fs.readFileSync(`${latoDir}/Lato-Semibold.ttf`) },
  { name: 'Lato', weight: 700, style: 'normal', data: fs.readFileSync(`${latoDir}/Lato-Bold.ttf`) },
  { name: 'Lato', weight: 900, style: 'normal', data: fs.readFileSync(`${latoDir}/Lato-Black.ttf`) },
  { name: 'Lato', weight: 400, style: 'italic', data: fs.readFileSync(`${latoDir}/Lato-Italic.ttf`) },
  { name: 'Lato', weight: 600, style: 'italic', data: fs.readFileSync(`${latoDir}/Lato-SemiboldItalic.ttf`) },
];

const tree = Fig();
const svg = await satori(tree, {
  width: GEOM.canvasW,
  height: GEOM.canvasH,
  fonts,
  embedFont: true,
});

const rightX = GEOM.pad + GEOM.leftW + GEOM.gap + GEOM.vsW + GEOM.gap;
const panelY = GEOM.pad;
const dialogueX = rightX + GEOM.rightContentX;
const contentY = panelY + GEOM.rightContentY;
const kbX = dialogueX + GEOM.dialogueW + GEOM.dialogueGap;
const channelX = dialogueX + GEOM.dialogueW + GEOM.dialogueGap / 2;

function endpoint(chip, label) {
  return {
    sx: dialogueX + chip.x + chip.w + 8,
    sy: contentY + chip.y + chip.h / 2,
    tx: kbX + label.x + 2,
    ty: contentY + label.y + label.h / 2,
  };
}

function arrowPath({ sx, sy, tx, ty }) {
  return `M ${sx} ${sy} L ${channelX} ${sy} L ${channelX} ${ty} L ${tx} ${ty}`;
}

const arrows = [
  endpoint(GEOM.r1Chip, GEOM.r1Label),
  endpoint(GEOM.r2Chip, GEOM.r2Label),
].map(p =>
  `<path d="${arrowPath(p)}" fill="none" stroke="#17854a" stroke-width="4" stroke-dasharray="12 7" stroke-linecap="round" marker-end="url(#traceArrow)"/>`
).join('');

const defs = `<defs><marker id="traceArrow" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto"><polygon points="0,0 14,5 0,10" fill="#17854a"/></marker></defs>`;

let finalSvg = svg.replace(/(<svg[^>]*>)/, `$1${defs}`);
finalSvg = finalSvg.replace(/<\/svg>\s*$/, `${arrows}</svg>`);

fs.writeFileSync(OUT_SVG, finalSvg);
fs.rmSync(OUT_JS, { force: true });
console.log('wrote', OUT_SVG, '(bytes:', finalSvg.length, ')');
