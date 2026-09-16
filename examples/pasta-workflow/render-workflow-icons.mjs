// Adapted from satori-figure: JSX -> esbuild -> Satori -> vector SVG/PDF.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {transform} from 'esbuild';
import satori from 'satori';
import {Resvg} from '@resvg/resvg-js';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
const here=path.dirname(fileURLToPath(import.meta.url)),compiled=path.join(here,'.workflow-icons.compiled.mjs');
const result=await transform(fs.readFileSync(path.join(here,'workflow-icons.jsx'),'utf8'),{loader:'jsx',format:'esm',jsxFactory:'h'});
fs.writeFileSync(compiled,result.code);
const {default:Figure,geometry:g}=await import(pathToFileURL(compiled));
const font=fs.readFileSync(process.env.FIGURE_FONT||'C:/Windows/Fonts/simhei.ttf');
let svg=await satori(Figure({atlas: `data:image/png;base64,${fs.readFileSync(path.join(here,'workflow-icon-atlas.png')).toString('base64')}`}),{width:g.width,height:g.height,fonts:[{name:'FigureCN',data:font,weight:400,style:'normal'}],embedFont:true});
const paths=[];
const arrow=(d,head=true)=>paths.push(`<path d="${d}" fill="none" stroke="#425c67" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${head?'marker-end="url(#arrow)"':''}/>`);
arrow('M290 479 H326',false);arrow('M326 276 V690',false);
for(const y of g.laneYs.map(y=>y+g.laneHeight/2)){arrow(`M326 ${y} H363`);arrow(`M702 ${y} H758`);arrow(`M1060 ${y} H1118`);arrow(`M1420 ${y} H1450`,false)}
arrow('M1450 276 V690',false);arrow('M1450 480 H1478');
arrow('M230 1055 H258 V977 H288');arrow('M258 1055 V1131 H288');
arrow('M573 977 H603 V1058',false);arrow('M573 1131 H603 V1058 H633');
arrow('M1192 1055 H1240');arrow('M1476 1055 H1524');
arrow('M1260 582 H1305');arrow('M1305 582 H1260');
arrow('M1378 582 A22 22 0 1 1 1383 557');
const defs='<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#425c67"/></marker></defs>';
svg=svg.replace(/(<svg[^>]*>)/,`$1${defs}`).replace('</svg>',paths.join('')+'</svg>');
fs.writeFileSync(path.join(here,'workflow-icons.svg'),svg);
fs.writeFileSync(path.join(here,'workflow-icons.png'),new Resvg(svg,{fitTo:{mode:'width',value:2600}}).render().asPng());
// Windows fallback for rsvg-convert: vector-preserving SVG-to-PDFKit.
const doc=new PDFDocument({size:[g.width*.5,g.height*.5],margin:0,compress:true,info:{Title:'实验设计与分析流程',Subject:'虚构研究；科研绘图教学'}});
const out=fs.createWriteStream(path.join(here,'workflow-icons.pdf'));doc.pipe(out);
doc.save();doc.scale(.5);SVGtoPDF(doc,svg,0,0,{width:g.width,height:g.height,assumePt:true});doc.restore();doc.end();
await new Promise((resolve,reject)=>{out.on('finish',resolve);out.on('error',reject)});
fs.unlinkSync(compiled);console.log('Rendered workflow-icons.jsx -> workflow-icons.svg / workflow-icons.pdf / workflow-icons.png');


