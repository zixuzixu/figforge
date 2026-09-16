// Editable JSX; Satori layout and shared connector geometry.
export function h(type,props,...children){const p={...props,children:children.flat(Infinity).filter(v=>v!=null&&v!==false)};if(type==='div')p.style={display:'flex',...p.style};return typeof type==='function'?type(p):{type,props:p}}
const C={ink:'#18313d',muted:'#536773',blue:'#edf3fa',blueB:'#7197bd',gold:'#faf2e2',goldB:'#c39b51',purple:'#f0eef8',purpleB:'#9990c1',teal:'#eaf4f1',tealB:'#69a396'};
const abs=(x,y,w,height)=>({position:'absolute',left:x,top:y,width:w,height});
function Label({x,y,w=500,size=24,color=C.ink,children}){return <div style={{...abs(x,y,w,48),fontSize:size,color}}>{children}</div>}
function Card({x,y,w,h:height=88,title,titleSize=25,detail,bg=C.blue,border=C.blueB,children}){return <div style={{...abs(x,y,w,height),background:bg,border:`1.5px solid ${border}`,borderRadius:10,padding:'16px 18px',flexDirection:'column',justifyContent:'center',gap:10}}><div style={{fontSize:titleSize,lineHeight:1.2}}>{title}</div>{detail&&<div style={{fontSize:17,lineHeight:1.35,color:C.muted}}>{detail}</div>}{children}</div>}
export const geometry={width:1664,height:1100,laneYs:[230,344,458,572],laneHeight:88};
const lanes=[
 ['主对比 · 300份','比较五种拌制方案','5组 × 60份','清拌·C32·C42·C52·加钢筋','口感 / 强度 / SPI','性能与不确定性',C.blue,C.blueB],
 ['成分消融 · 240份','分析组件贡献','5组 × 48份','完整方法与四种消融','组件贡献','完整方法与消融比较',C.gold,C.goldB],
 ['参数网格 · 250份','长度与扭矩组合','25格 × 10份','5 × 5 参数网格','长度–扭矩响应','网格分布与响应趋势',C.purple,C.purpleB],
 ['中介分析 · 280份','分析变量间的路径','L → T → P','长度 → 扭矩 → 口感','间接效应','ab = 0.30',C.teal,C.tealB]];
function Specimen(){return <div style={{position:'relative',width:108,height:92,marginTop:15,alignSelf:'center'}}><div style={{...abs(4,8,100,76),border:'2px solid #78968d',borderRadius:8,background:'#d8e6df'}}/>{[0,1,2,3].map(i=><div style={{...abs(17+i*18,18,10,52),border:'3px solid #b68b3c',borderRadius:5,transform:`rotate(${i%2?15:-15}deg)`}}/>)}</div>}
export default function Workflow(){return <div style={{width:1664,height:1100,position:'relative',background:'#fff',fontFamily:'FigureCN',color:C.ink}}>
 <Label x={40} y={30} size={18} color='#087f8c'>CDFSE / 科研绘图教学</Label>
 <Label x={40} y={70} w={1200} size={43}>实验设计与分析流程</Label>
 <Label x={40} y={134} w={1300} size={22} color={C.muted}>虚构研究 · 四条独立实验分支 · 总计 1,070 份</Label>
 <Label x={40} y={188} size={25}>a  总体实验设计</Label>
 <Card x={40} y={310} w={230} h={268} title='虚构样本设计' detail='拌制方案与参数' bg={C.teal} border={C.tealB}><Specimen/></Card>
 {lanes.map((r,i)=><div style={{display:'contents'}}><Card x={352} y={geometry.laneYs[i]} w={260} title={r[0]} detail={r[1]} bg={r[6]} border={r[7]}/><Card x={666} y={geometry.laneYs[i]} w={300} title={r[2]} detail={r[3]} bg={r[6]} border={r[7]}/><Card x={1020} y={geometry.laneYs[i]} w={300} title={r[4]} detail={r[5]} bg={r[6]} border={r[7]}/></div>)}
 <Card x={1408} y={326} w={216} h={232} title='汇总与局限性' detail='结果汇总' bg={C.blue} border={C.blueB}><div style={{fontSize:19,color:C.muted}}>主要发现</div><div style={{fontSize:19,color:C.muted}}>非盲与混淆</div><div style={{fontSize:19,color:C.muted}}>解释边界</div></Card>
 <Label x={1408} y={580} w={240} size={24}>总计 1,070 份</Label>
 <Label x={40} y={697} w={1500} size={18} color={C.muted}>实线箭头表示流程与信息流；分支采用独立样本。螺丝钉长度用于控制扭矩，不是混入面条的增强材料。</Label>
 <div style={{...abs(40,750,1584,1),background:'#c9d4db'}}/>
 <Label x={40} y={782} w={770} size={29}>b  双通道测量</Label><Label x={870} y={782} w={754} size={29}>c  统计报告</Label>
 <Card x={40} y={866} w={160} h={140} title='样本' detail='1份复合样本' bg={C.teal} border={C.tealB}/>
 <Card x={254} y={838} w={214} h={82} title='口感 P' detail='感官评分（0–10）'/>
 <Card x={254} y={954} w={214} h={82} title='抗压强度 σc' detail='机械测量（MPa）' bg={C.teal} border={C.tealB}/>
 <Card x={540} y={876} w={262} h={122} title='SPI = P × √σc / 10' titleSize={20} detail='结构可食指数' bg={C.purple} border={C.purpleB}/>
 <Card x={870} y={858} w={220} h={172} title='份为分析单位' detail='每份样本一条记录' bg={C.teal} border={C.tealB}><div style={{fontSize:19,color:C.muted}}>按预设分组汇总</div></Card>
 <Card x={1136} y={858} w={220} h={172} title='效应与不确定性' detail='组间效应'><div style={{fontSize:19,color:C.muted}}>置信区间</div></Card>
 <Card x={1402} y={858} w={222} h={172} title='非盲局限' detail='未采用盲法' bg={C.gold} border={C.goldB}><div style={{fontSize:19,color:C.muted}}>可能存在主观偏倚</div></Card>
 <Label x={40} y={1060} w={1500} size={18} color={C.muted}>教学示意，非真实实验。配色用于区分任务类型；示意结构不构成材料学证据。</Label>
 </div>}


