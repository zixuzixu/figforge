// Hybrid publication figure: Satori vector layout + enlarged original-style icon atlas.
export function h(type,props,...children){const p={...props,children:children.flat(Infinity).filter(v=>v!=null&&v!==false)};if(type==='div')p.style={display:'flex',...p.style};return typeof type==='function'?type(p):{type,props:p}}
export const geometry={width:1800,height:1280,laneYs:[218,356,494,632],laneHeight:116};
const ink='#18313d',muted='#536773';
const colors=[['#edf3fa','#7197bd'],['#faf2e2','#c39b51'],['#f0eef8','#9990c1'],['#eaf4f1','#69a396']];
const pos=(x,y,w,height)=>({position:'absolute',left:x,top:y,width:w,height});
function T({x,y,w=500,size=24,color=ink,children}){return <div style={{...pos(x,y,w,70),fontSize:size,color,lineHeight:1.3}}>{children}</div>}
function Box({x,y,w,h:height,c=0,children}){return <div style={{...pos(x,y,w,height),border:`1.5px solid ${colors[c][1]}`,borderRadius:10,background:'#fff',overflow:'hidden'}}><div style={{...pos(0,0,w,9),background:colors[c][0],borderBottom:`1px solid ${colors[c][1]}`}}/>{children}</div>}
const regions=[[20,85,385,338],[425,95,402,300],[845,205,390,80],[20,550,389,171],[428,600,397,81],[884,466,325,310],[80,835,263,347],[445,865,365,294],[880,825,326,357]];
function Icon({atlas,id,x,y,w,h:height}){const [sx,sy,sw,sh]=regions[id],s=Math.min(w/sw,height/sh),dw=sw*s,dh=sh*s;return <div style={{...pos(x+(w-dw)/2,y+(height-dh)/2,dw,dh),overflow:'hidden'}}><img src={atlas} width={1254*s} height={1254*s} style={{...pos(-sx*s,-sy*s,1254*s,1254*s),maxWidth:1254*s}}/></div>}
function Report({x,y,w=78,h:height=90,warn=false}){return <div style={{...pos(x,y,w,height),border:'2px solid #395565',borderRadius:5,background:'#fff',padding:10,flexDirection:'column',gap:height<60?5:9}}>{(height<60?[1,.75,.9]:[1,.75,.9,.5,.65]).map(a=><div style={{width:(w-24)*a,height:2,background:'#395565'}}/>)}{warn&&<div style={{...pos(w-30,height-36,37,37),borderRadius:19,background:'#395565',color:'#fff',fontSize:30,alignItems:'center',justifyContent:'center'}}>!</div>}</div>}
function Bars({x,y,w=120,h:height=65,error=false}){return <div style={{...pos(x,y,w,height),alignItems:'flex-end',justifyContent:'space-around',borderBottom:'2px solid #395565'}}>{[.3,.48,.7,.91].map((a,i)=><div style={{width:17,height:height*a,background:['#bed7df','#99bccb','#7da4b7','#557b90'][i],border:'1px solid #395565',position:'relative'}}>{error&&<div style={{position:'absolute',width:2,height:18,top:-9,left:7,background:'#395565'}}/>}</div>)}</div>}
export default function Workflow({atlas}){return <div style={{width:1800,height:1280,position:'relative',background:'#fff',fontFamily:'FigureCN',color:ink}}>
 <T x={40} y={27} size={18} color='#087f8c'>CDFSE / 科研绘图教学</T><T x={40} y={64} w={1200} size={43}>实验设计与分析流程</T><T x={40} y={125} w={1300} size={21} color={muted}>虚构研究 · 四条独立实验分支 · 总计 1,070 份</T><T x={40} y={177} size={26}>a  总体实验设计</T>
 <Box x={40} y={300} w={250} h={358} c={3}><T x={22} y={23} w={220} size={27}>虚构样本设计</T><Icon atlas={atlas} id={0} x={15} y={83} w={220} h={195}/><T x={22} y={293} w={214} size={19}>意大利面拌制方案与参数</T></Box>
 {geometry.laneYs.map((y,i)=><div style={{display:'contents'}}>
 <Box x={365} y={y} w={337} h={116} c={i}><Icon atlas={atlas} id={[1,3,1,6][i]} x={12} y={22} w={100} h={84}/><T x={123} y={24} w={209} size={22}>{['主对比 · 300份','成分消融 · 240份','参数网格 · 250份','中介分析 · 280份'][i]}</T><T x={123} y={65} w={200} size={18} color={muted}>{['比较五种拌制方案','评价组件贡献','探索参数组合','分析中介路径'][i]}</T></Box>
 <Box x={760} y={y} w={300} h={116} c={i}><T x={22} y={18} w={260} size={25}>{['5组 × 60份','5组 × 48份','25格 × 10份','L → T → P'][i]}</T>{i<3?<Icon atlas={atlas} id={[2,4,5][i]} x={20} y={i===0?46:52} w={260} h={i===0?47:52}/>:<T x={22} y={66} w={260} size={21}>长度 → 扭矩 → 口感</T>}{i===0&&<div style={{position:"absolute",left:29,top:94,width:230,justifyContent:"space-between",fontSize:13}}>{["清拌","C32","C42","C52","加钢筋"].map(n=><div style={{width:46,justifyContent:"center"}}>{n}</div>)}</div>}</Box>
 <Box x={1120} y={y} w={300} h={116} c={i}><T x={22} y={18} w={276} size={25}>{['口感 / 强度 / SPI','组件贡献','长度–扭矩响应','间接效应'][i]}</T>{i===0&&<div style={{display:'contents'}}><Icon atlas={atlas} id={7} x={22} y={57} w={61} h={48}/><Icon atlas={atlas} id={6} x={108} y={56} w={51} h={49}/><Report x={210} y={56} w={40} h={48}/></div>}{i===1&&<Bars x={91} y={55} w={120} h={48}/>} {i===2&&<div style={{display:'contents'}}><Icon atlas={atlas} id={5} x={21} y={57} w={90} h={49}/></div>}{i===3&&<div style={{position:'absolute',left:30,top:60,alignItems:'center',gap:13}}>{['L','→','T','→','P'].map((v,j)=><div style={{width:j%2?22:43,height:43,border:j%2?'none':'1.5px solid #395565',borderRadius:22,alignItems:'center',justifyContent:'center',fontSize:23}}>{v}</div>)}</div>}</Box>
 </div>)}
 <Box x={1480} y={332} w={280} h={297}><T x={22} y={22} w={248} size={27}>汇总与局限性</T><Report x={102} y={75}/><T x={36} y={183} w={232} size={21}>结果汇总 · 主要发现</T><T x={36} y={229} w={232} size={21}>研究局限 · 解释边界</T></Box><T x={1510} y={651} w={250} size={26}>总计 1,070 份</T>
 <T x={40} y={784} w={1650} size={18} color={muted}>箭头表示流程与信息流；各分支采用独立样本。图标均为教学示意，螺丝钉不混入面条。</T><div style={{...pos(40,828,1720,1),background:'#c9d4db'}}/>
 <T x={40} y={854} size={28}>b  双通道测量</T><T x={958} y={854} size={28}>c  统计报告</T>
 <Box x={40} y={929} w={190} h={253} c={3}><Icon atlas={atlas} id={6} x={32} y={20} w={126} h={148}/><T x={22} y={177} w={164} size={24}>样本（1份）</T><T x={22} y={214} w={166} size={17}>意大利面复合样本</T></Box>
 <Box x={290} y={916} w={283} h={122}><Icon atlas={atlas} id={7} x={12} y={24} w={103} h={83}/><T x={131} y={29} w={150} size={26}>口感 P</T><T x={131} y={74} w={150} size={18}>感官评分</T></Box>
 <Box x={290} y={1070} w={283} h={122} c={3}><Icon atlas={atlas} id={8} x={16} y={14} w={94} h={100}/><T x={126} y={30} w={155} size={23}>抗压强度 σc</T><T x={131} y={73} w={150} size={18}>MPa</T></Box>
 <Box x={635} y={991} w={270} h={137} c={2}><T x={17} y={28} w={249} size={22}>SPI = P × √σc / 10</T><T x={48} y={81} w={210} size={21}>结构可食指数</T></Box>
 <Box x={958} y={925} w={234} h={263} c={3}><T x={20} y={22} w={218} size={24}>份为分析单位</T><Report x={78} y={72}/><T x={20} y={184} w={212} size={18}>每份样本一条记录</T><T x={20} y={220} w={212} size={18}>按预设分组汇总</T></Box>
 <Box x={1242} y={925} w={234} h={263}><T x={16} y={22} w={220} size={24}>效应与不确定性</T><Bars x={54} y={86} w={124} h={74} error/><T x={28} y={184} w={205} size={18}>组间效应与置信区间</T><T x={28} y={220} w={205} size={18}>报告不确定性</T></Box>
 <Box x={1526} y={925} w={234} h={263} c={1}><T x={48} y={22} w={180} size={24}>非盲局限</T><Report x={69} y={72} warn/><T x={22} y={184} w={210} size={18}>未采用盲法</T><T x={22} y={220} w={210} size={18}>可能存在主观偏倚</T></Box>
 <T x={40} y={1230} w={1700} size={18} color={muted}>教学示意，非真实实验。写实图标按原图重新生成并放大；文字、边框、连线及统计符号为矢量。</T>
 </div>}


