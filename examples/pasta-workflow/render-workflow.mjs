// Adapted from satori-figure: JSX -> esbuild -> Satori -> vector SVG/PDF.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {transform} from 'esbuild';
import satori from 'satori';
import {Resvg} from '@resvg/resvg-js';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
const here=path.dirname(fileURLToPath(import.meta.url)),compiled=path.join(here,'.workflow.compiled.mjs');
const result=await transform(fs.readFileSync(path.join(here,'workflow.jsx'),'utf8'),{loader:'jsx',format:'esm',jsxFactory:'h'});
fs.writeFileSync(compiled,result.code);
const {default:Figure,geometry:g}=await import(pathToFileURL(compiled));
const font=fs.readFileSync(process.env.FIGURE_FONT||'C:/Windows/Fonts/simhei.ttf');
let svg=await satori(Figure(),{width:g.width,height:g.height,fonts:[{name:'FigureCN',data:font,weight:400,style:'normal'}],embedFont:true});
const paths=[];
const arrow=(d,head=true)=>paths.push(`<path d="${d}" fill="none" stroke="#425c67" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${head?'marker-end="url(#arrow)"':''}/>`);
arrow('M270 444 H316',false);arrow('M316 274 V616',false);
for(const y of g.laneYs.map(y=>y+g.laneHeight/2)){arrow(`M316 ${y} H350`);arrow(`M612 ${y} H664`);arrow(`M966 ${y} H1018`);arrow(`M1320 ${y} H1364`,false)}
arrow('M1364 274 V616',false);arrow('M1364 442 H1406');
arrow('M200 936 H226 V879 H252');arrow('M226 936 V995 H252');arrow('M468 879 H505 V937',false);arrow('M468 995 H505 V937 H538');arrow('M1090 944 H1134');arrow('M1356 944 H1400');
const defs='<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#425c67"/></marker></defs>';
svg=svg.replace(/(<svg[^>]*>)/,`$1${defs}`).replace('</svg>',paths.join('')+'</svg>');
fs.writeFileSync(path.join(here,'workflow.svg'),svg);
fs.writeFileSync(path.join(here,'workflow.png'),new Resvg(svg,{fitTo:{mode:'width',value:2600}}).render().asPng());
// Windows fallback for rsvg-convert: vector-preserving SVG-to-PDFKit.
const doc=new PDFDocument({size:[g.width*.5,g.height*.5],margin:0,compress:true,info:{Title:'实验设计与分析流程',Subject:'虚构研究；科研绘图教学'}});
const out=fs.createWriteStream(path.join(here,'workflow.pdf'));doc.pipe(out);
doc.save();doc.scale(.5);SVGtoPDF(doc,svg,0,0,{width:g.width,height:g.height,assumePt:true});doc.restore();doc.end();
await new Promise((resolve,reject)=>{out.on('finish',resolve);out.on('error',reject)});
fs.unlinkSync(compiled);console.log('Rendered workflow.jsx -> workflow.svg / workflow.pdf / workflow.png');
