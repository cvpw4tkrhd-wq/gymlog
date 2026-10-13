'use strict';
/* Gymlog – övningsinfo: ritmotor, poser, instruktioner och gränssnitt (genererad av ovn-*.js) */
/* =====================================================================
   Gymlog – ritmotor för övningsfigurer (egna schematiska SVG-figurer)
   Figuren vetter åt höger. Vinklar: 0 = ned, 90 = framåt (höger), 180 = upp, 270 = bakåt.
   ===================================================================== */
const FL={T:24,UA:13,FA:14,TH:19,SH:19};
const FC={body:'#c9d4e3',arm:'#5aa2ff',eq:'#ffc247',eqd:'#c98a12',env:'#51647f',floor:'#34455c'};
function fDir(a,l){const r=a*Math.PI/180;return [Math.sin(r)*l,Math.cos(r)*l];}
function fAdd(a,b){return [a[0]+b[0],a[1]+b[1]];}
function fIk(p0,p1,l1,l2,side){
  let dx=p1[0]-p0[0],dy=p1[1]-p0[1],d=Math.hypot(dx,dy);
  const max=l1+l2-0.05;
  if(d>max){const k=max/d;dx*=k;dy*=k;d=max;p1=[p0[0]+dx,p0[1]+dy];}
  const min=Math.abs(l1-l2)+0.1;if(d<min)d=min;
  const a=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))),b=Math.atan2(dy,dx);
  const c=[[p0[0]+l1*Math.cos(b+a),p0[1]+l1*Math.sin(b+a)],[p0[0]+l1*Math.cos(b-a),p0[1]+l1*Math.sin(b-a)]];
  const pick=side==='fwd'?(c[0][0]>c[1][0]?0:1):side==='back'?(c[0][0]<c[1][0]?0:1):side==='up'?(c[0][1]<c[1][1]?0:1):(c[0][1]>c[1][1]?0:1);
  return {j:c[pick],end:p1};
}
function fSolve(p){
  const hip=p.hip,T=p.T===undefined?180:p.T;
  const neck=fAdd(hip,fDir(T,FL.T));
  const sho=fAdd(hip,fDir(T,FL.T*0.93));
  if(p.shy){sho[1]+=p.shy;neck[1]+=p.shy;}
  const head=fAdd(neck,fDir(T,5.4));
  const leg=fIk(hip,p.ft,FL.TH,FL.SH,p.kb||'fwd');
  const o={hip,neck,sho,head,knee:leg.j,ankle:leg.end};
  if(p.ft2){const l2=fIk(hip,p.ft2,FL.TH,FL.SH,p.kb2||'down');o.knee2=l2.j;o.ankle2=l2.end;}
  if(p.UA!==undefined){o.elbow=fAdd(sho,fDir(p.UA,FL.UA));o.hand=fAdd(o.elbow,fDir(p.FA,FL.FA));}
  else if(p.hr||p.hand){const tgt=p.hand||fAdd(sho,p.hr);const a=fIk(sho,tgt,FL.UA,FL.FA,p.eb||'down');o.elbow=a.j;o.hand=a.end;}
  return o;
}
function fLine(a,b,w,c,extra){return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${extra||''}/>`;}
function fCirc(c,r,fill,stroke,w){return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${w||1}"`:''}/>`;}
function fRect(x,y,w,h,fill,r){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r===undefined?1.2:r}" fill="${fill}"/>`;}

/* Utrustning och miljö (bakom figuren) */
function fEnvSide(eq){
  let s='';
  (eq||[]).forEach(e=>{
    const k=Array.isArray(e)?e[0]:e,a=Array.isArray(e)?e.slice(1):[];
    if(k==='bench')s+=fLine([a[0],a[1]],[a[2],a[3]],a[4]||3.4,FC.env);
    else if(k==='rect')s+=fRect(a[0],a[1],a[2],a[3],FC.env);
    else if(k==='line')s+=fLine([a[0],a[1]],[a[2],a[3]],a[4]||3,FC.env);
    else if(k==='bar')s+=fLine([a[0],a[1]],[a[2],a[3]],2,FC.eq);
  });
  return s;
}
/* Utrustning vid händerna (framför figuren) */
function fEqHand(eq,h,o){
  let s='';
  (eq||[]).forEach(e=>{
    const k=Array.isArray(e)?e[0]:e,a=Array.isArray(e)?e.slice(1):[];
    if(k==='cable'){const an=[a[0],a[1]];s+=fLine(h,an,0.9,'#8fa1b8')+fCirc(an,2.3,'#243044',FC.env,1)+fCirc(h,1.8,FC.eq);}
    else if(k==='barp')s+=fCirc(h,6.6,FC.eq,FC.eqd,1)+fCirc(h,1.4,FC.eqd);
    else if(k==='db')s+=fCirc(h,3.8,FC.eq,FC.eqd,0.8);
    else if(k==='dbl')s+=fCirc(h,5,FC.eq,FC.eqd,0.9);
    else if(k==='handle')s+=fCirc(h,2,FC.eq);
    else if(k==='barAt')s+=fCirc([a[0],a[1]],6.6,FC.eq,FC.eqd,1)+fCirc([a[0],a[1]],1.4,FC.eqd);
    else if(k==='barSho'&&o)s+=fCirc([o.sho[0]+a[0],o.sho[1]+a[1]],6.6,FC.eq,FC.eqd,1)+fCirc([o.sho[0]+a[0],o.sho[1]+a[1]],1.4,FC.eqd);
    else if(k==='wheel')s+=fCirc(h,5,'#243044',FC.eq,1.6);
  });
  return s;
}
function fSide(p,eq,ghost){
  const o=fSolve(p),op=ghost?' opacity="0.28"':'';
  let s=`<g${op}>`;
  if(!ghost)s+=fEnvSide(p.env||[]);
  // ben
  if(o.knee2){s+=fLine(p.hip,o.knee2,4,FC.body)+fLine(o.knee2,o.ankle2,4,FC.body);const t2=p.toe2||fAdd(o.ankle2,[7,0.6]);s+=fLine(o.ankle2,t2,3,FC.body);}
  s+=fLine(p.hip,o.knee,4,FC.body)+fLine(o.knee,o.ankle,4,FC.body);
  const toe=p.toe||fAdd(o.ankle,[7,0.6]);s+=fLine(o.ankle,toe,3,FC.body);
  // bål och huvud
  s+=fLine(p.hip,o.neck,5.4,FC.body)+fCirc(o.head,4.9,'none',FC.body,2);
  // arm
  if(o.elbow)s+=fLine(o.sho,o.elbow,3.6,FC.arm)+fLine(o.elbow,o.hand,3.2,FC.arm)+fCirc(o.hand,1.6,FC.arm);
  if(!ghost&&o.hand)s+=fEqHand(eq,o.hand,o);
  if(!ghost&&p.top)s+=fEqHand(p.top,o.hand||[0,0],o);
  return s+'</g>';
}
function fFloor(y){return `<line x1="4" y1="${y}" x2="96" y2="${y}" stroke="${FC.floor}" stroke-width="1.2"/>`;}

/* Framvy: armar i sidled (sidolyft, pulldowns, chins). Höger arm anges, vänster speglas. */
function fFront(p,eq,ghost){
  const op=ghost?' opacity="0.28"':'';
  const cx=50,sy=36,hy=62,sw=8.5,dy=p.dy||0;
  let s=`<g${op}>`;
  let bars='';
  s+=`<g transform="translate(0,${dy})">`;
  const R=(a,l)=>{const r=a*Math.PI/180;return [Math.sin(r)*l,Math.cos(r)*l];};
  // ben
  const st=p.stance===undefined?5:p.stance;
  if(p.seated)s+=fLine([cx-4,hy],[cx-st-5,76],4.2,FC.body)+fLine([cx+4,hy],[cx+st+5,76],4.2,FC.body)+fLine([cx-st-5,76],[cx-st-6,90-dy],4.2,FC.body)+fLine([cx+st+5,76],[cx+st+6,90-dy],4.2,FC.body);
  else s+=fLine([cx-3,hy],[cx-st-3,88-dy],4.2,FC.body)+fLine([cx+3,hy],[cx+st+3,88-dy],4.2,FC.body);
  // bål, huvud
  s+=fLine([cx,hy],[cx,sy+1],14,FC.body)+fCirc([cx,26],5.6,'none',FC.body,2);
  // armar
  const hands=[];
  [1,-1].forEach(sd=>{
    const a=p.ua,f=p.fa;
    const sh=[cx+sd*sw,sy+2];
    const el=fAdd(sh,[sd*R(a,FL.UA)[0],R(a,FL.UA)[1]]);
    const ha=fAdd(el,[sd*R(f,FL.FA)[0],R(f,FL.FA)[1]]);
    s+=fLine(sh,el,3.6,FC.arm)+fLine(el,ha,3.2,FC.arm)+fCirc(ha,1.6,FC.arm);
    hands.push(ha);
  });
  if(!ghost){
    (eq||[]).forEach(e=>{
      const k=Array.isArray(e)?e[0]:e,a=Array.isArray(e)?e.slice(1):[];
      if(k==='db')hands.forEach(h=>{s+=fCirc(h,3.8,FC.eq,FC.eqd,0.8);});
      else if(k==='bar'){s+=fLine(hands[0],hands[1],2.2,FC.eq);}
      else if(k==='cabledown'){s+=fLine(hands[0],[cx+44,90-dy],0.9,'#8fa1b8')+fLine(hands[1],[cx-44,90-dy],0.9,'#8fa1b8')+fCirc([cx+44,90-dy],2.3,'#243044',FC.env,1)+fCirc([cx-44,90-dy],2.3,'#243044',FC.env,1);}
      else if(k==='seatf'){s+=fRect(cx-17,hy+3,34,4,FC.env);}
      else if(k==='bary'){bars+=fLine([18,a[0]||12],[82,a[0]||12],2.4,FC.eq);}
      else if(k==='cableup'){s+=fLine(hands[0],[cx+10,4-dy],0.9,'#8fa1b8')+fLine(hands[1],[cx-10,4-dy],0.9,'#8fa1b8');}
      else if(k==='cable1'){s+=fLine(hands[0],[a[0],a[1]],0.9,'#8fa1b8')+fCirc([a[0],a[1]],2.3,'#243044',FC.env,1)+fCirc(hands[0],1.8,FC.eq);}
      else if(k==='chinbar'){s+=fLine([20,hands[0][1]],[80,hands[0][1]],2.4,FC.eq);}
      else if(k==='rect')s+=fRect(a[0],a[1],a[2],a[3],FC.env);
      else if(k==='line')s+=fLine([a[0],a[1]],[a[2],a[3]],a[4]||3,FC.env);
    });
  }
  s+='</g>';
  return s+bars+'</g>';
}

/* Hela bilden: start eller slut (med spökbild av motsatt läge) */
function fSvg(view,pose,ghost,eq,fl){
  if(view==='raw')return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">${pose}</svg>`;
  const fn=view==='front'?fFront:fSide;
  const floor=fl===undefined?92:fl;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">${fFloor(floor)}${ghost?fn(ghost,eq,true):''}${fn(pose,eq,false)}</svg>`;
}

/* Poser för övningsfigurer. v: 'side' | 'front'. a = startläge, b = slutläge.
   Koordinater i en ruta på 100 x 100, golv vid y = 92. Se ovn-fig.js för vinkelregler. */
const ST=o=>Object.assign({hip:[46,51.2],T:180,ft:[46,89]},o);                       // stående
const SEAT=(o,hx,hy)=>Object.assign({hip:[hx||36,hy||68],T:180,ft:[(hx||36)+20,89],kb:'fwd'},o);   // sittande
const BNL=[['bench',24,73,78,73,4],['line',30,75,30,92,2.2],['line',72,75,72,92,2.2]];                // plan bänk
const LIE=o=>Object.assign({hip:[64,70],T:270,ft:[80,89],kb:'fwd',env:BNL},o);     // liggande
const INCE=[['line',58,71,41,47,5],['bench',52,75,68,75,3.6],['line',56,77,56,92,2.2]];
const INC=o=>Object.assign({hip:[60,70],T:215,ft:[78,89],kb:'fwd',env:INCE},o);    // lutande bänk
const seatE=(hx,hy)=>[['bench',hx-10,hy+4,hx+10,hy+4,3.6],['line',hx-8,hy+2,hx-8,hy-28,3.4],['line',hx-4,hy+6,hx-4,92,2.2]];
const SEATP=(o,hx,hy)=>Object.assign(SEAT(o,hx,hy),{env:seatE(hx||36,hy||68)});    // sittande med rygg

const PO={
  /* ---- Biceps ---- */
  bbcurl:{v:'side',a:ST({hr:[2,24],eb:'back'}),b:ST({hr:[9,-2],eb:'down'}),eq:['barp']},
  dbcurl:{v:'side',a:SEATP({hr:[1,24],eb:'back'}),b:SEATP({hr:[8,-2],eb:'down'}),eq:['db']},
  inclcurl:{v:'side',a:INC({hr:[0,24],eb:'back'}),b:INC({hr:[9,-3],eb:'down'}),eq:['db']},
  hammer:{v:'side',a:ST({hr:[2,24],eb:'back'}),b:ST({hr:[9,-2],eb:'down'}),eq:['db']},
  cablecurl:{v:'side',a:ST({hr:[5,22],eb:'back'}),b:ST({hr:[9,-2],eb:'down'}),eq:[['cable',88,90]]},
  scott:{v:'side',a:SEAT({T:165,hr:[16,16],eb:'down',env:[['bench',24,72,46,72,3.6],['line',44,46,58,64,3.6],['line',52,64,52,92,2.2]]},34,66),
         b:SEAT({T:165,hr:[10,-6],eb:'down',env:[['bench',24,72,46,72,3.6],['line',44,46,58,64,3.6],['line',52,64,52,92,2.2]]},34,66),eq:['barp']},
  /* ---- Triceps ---- */
  rope:{v:'side',a:ST({hr:[12,9],eb:'down'}),b:ST({hr:[2,24],eb:'back'}),eq:[['cable',60,6]]},
  bar:{v:'side',a:ST({hr:[12,9],eb:'down'}),b:ST({hr:[2,24],eb:'back'}),eq:[['cable',60,6]]},
  ohext:{v:'side',a:ST({hr:[-5,-8],eb:'up'}),b:ST({hr:[0,-25],eb:'up'}),eq:['db']},
  french:{v:'side',a:LIE({hr:[0,-25]}),b:LIE({hr:[-9,-9],eb:'up'}),eq:['barp']},
  kick:{v:'side',a:{hip:[40,54],T:105,ft:[44,89],UA:270,FA:0},b:{hip:[40,54],T:105,ft:[44,89],UA:270,FA:270},eq:['db']},
  cgbench:{v:'side',a:LIE({hr:[3,-6],eb:'down'}),b:LIE({hr:[0,-25]}),eq:['barp']},
  /* ---- Bröst ---- */
  chest:{v:'side',a:LIE({hr:[2,-5],eb:'down'}),b:LIE({hr:[0,-25]}),eq:['barp']},
  bench:{v:'side',a:LIE({hr:[2,-5],eb:'down'}),b:LIE({hr:[0,-25]}),eq:['barp']},
  dbpress:{v:'side',a:LIE({hr:[2,-5],eb:'down'}),b:LIE({hr:[0,-25]}),eq:['dbl']},
  inclpress:{v:'side',a:INC({hr:[2,-5],eb:'down'}),b:INC({hr:[0,-25]}),eq:['dbl']},
  flyes:{v:'side',a:LIE({hr:[0,-25]}),b:LIE({hr:[3,-8],eb:'up'}),eq:['db']},
  flatfly:{v:'side',a:LIE({hr:[0,-25]}),b:LIE({hr:[3,-8],eb:'up'}),eq:['db']},
  inclfly:{v:'side',a:INC({hr:[0,-25]}),b:INC({hr:[3,-8],eb:'up'}),eq:['db']},
  lowfly:{v:'side',a:ST({hr:[2,22],eb:'back'}),b:ST({hr:[16,5],eb:'down'}),eq:[['cable',70,90]]},
  crossover:{v:'side',a:ST({hr:[-1,-10],eb:'up'}),b:ST({hr:[14,16],eb:'down'}),eq:[['cable',64,6]]},
  pecdeck:{v:'side',a:SEATP({UA:270,FA:180}),b:SEATP({UA:90,FA:180}),eq:['handle']},
  machchest:{v:'side',a:SEATP({hr:[4,6],eb:'back'}),b:SEATP({hr:[24,4],eb:'down'}),eq:['handle']},
  dbpullover:{v:'side',a:LIE({hr:[0,-25]}),b:LIE({hr:[-24,-6],eb:'up'}),eq:['db']},
  pushup:{v:'side',a:{hip:[56,70],T:250,ft:[86,88],kb:'up',hand:[36,89],eb:'back'},b:{hip:[56,79],T:262,ft:[86,88],kb:'up',hand:[36,89],eb:'back'},eq:[]},
  dips:{v:'side',a:{hip:[47,60],T:172,ft:[38,88],kb:'down',hand:[50,63],eb:'back',env:[['line',44,63,64,63,2.6]]},
        b:{hip:[47,72],T:160,ft:[34,88],kb:'down',hand:[50,63],eb:'back',env:[['line',44,63,64,63,2.6]]},eq:[]},
  /* ---- Axlar ---- */
  shpress:{v:'side',a:SEATP({hr:[3,-5],eb:'down'}),b:SEATP({hr:[0,-25]}),eq:['db']},
  ohpress:{v:'side',a:ST({hr:[6,-4],eb:'down'}),b:ST({hr:[0,-22],eb:'up'}),eq:['barp']},
  arnold:{v:'side',a:SEATP({hr:[8,-1],eb:'down'}),b:SEATP({hr:[0,-25]}),eq:['db']},
  machpress:{v:'side',a:SEATP({hr:[3,-5],eb:'down'}),b:SEATP({hr:[0,-25]}),eq:['handle']},
  frontraise:{v:'side',a:ST({hr:[2,24],eb:'back'}),b:ST({hr:[24,0],eb:'down'}),eq:['db']},
  latraise:{v:'front',a:{ua:8,fa:6},b:{ua:90,fa:90},eq:['db']},
  cablelat:{v:'front',a:{ua:8,fa:6},b:{ua:90,fa:90},eq:['db','cabledown']},
  reardelt:{v:'side',a:{hip:[40,54],T:115,ft:[44,89],hr:[0,24],eb:'back'},b:{hip:[40,54],T:115,ft:[44,89],hr:[0,4],eb:'up'},eq:['db']},
  revpec:{v:'side',a:SEATP({UA:90,FA:180}),b:SEATP({UA:270,FA:180}),eq:['handle']},
  uprow:{v:'side',a:ST({hr:[8,21],eb:'back'}),b:ST({hr:[8,3],eb:'up'}),eq:['barp']},
  shrug:{v:'side',a:ST({hr:[1,24],eb:'back'}),b:ST({hr:[1,24],eb:'back',shy:-4}),eq:['db']},
  facepull:{v:'side',a:ST({T:176,hr:[24,-1]}),b:ST({T:176,hr:[7,-4],eb:'up'}),eq:[['cable',92,28]]},
  /* ---- Rygg ---- */
  pulldown:{v:'front',a:{ua:155,fa:155,seated:1},b:{ua:40,fa:210,seated:1},eq:['bar','cableup','seatf']},
  widepd:{v:'front',a:{ua:158,fa:160,seated:1},b:{ua:50,fa:210,seated:1},eq:['bar','cableup','seatf']},
  pulldownclose:{v:'front',a:{ua:170,fa:172,seated:1},b:{ua:22,fa:205,seated:1},eq:['bar','cableup','seatf']},
  pullup:{v:'front',a:{ua:165,fa:165,dy:8},b:{ua:30,fa:175,dy:-14},eq:[['bary',20]]},
  row:{v:'side',a:SEAT({T:182,hr:[24,6],eb:'down',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),b:SEAT({T:182,hr:[2,13],eb:'back',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),eq:[['cable',94,52]]},
  cablerow:{v:'side',a:SEAT({T:182,hr:[24,6],eb:'down',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),b:SEAT({T:182,hr:[2,13],eb:'back',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),eq:[['cable',94,52]]},
  vrow:{v:'side',a:SEAT({T:182,hr:[24,6],eb:'down',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),b:SEAT({T:182,hr:[2,13],eb:'back',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),eq:[['cable',94,52]]},
  suprow:{v:'side',a:SEAT({T:182,hr:[24,6],eb:'down',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),b:SEAT({T:182,hr:[2,13],eb:'back',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14]]},30,68),eq:[['cable',94,52]]},
  machrow:{v:'side',a:SEAT({T:182,hr:[24,6],eb:'down',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14],['line',46,36,50,58,4]]},30,68),b:SEAT({T:182,hr:[2,13],eb:'back',ft:[62,80],env:[['bench',20,72,42,72,3.6],['rect',60,78,10,14],['line',46,36,50,58,4]]},30,68),eq:['handle']},
  bbrow:{v:'side',a:{hip:[40,52],T:120,ft:[44,89],hr:[0,24],eb:'back'},b:{hip:[40,52],T:120,ft:[44,89],hr:[-4,10],eb:'back'},eq:['barp']},
  dbrow:{v:'side',a:{hip:[40,54],T:118,ft:[44,89],hr:[0,24],eb:'back',env:[['bench',58,66,82,66,3.6],['line',62,68,62,92,2.2],['line',78,68,78,92,2.2]]},b:{hip:[40,54],T:118,ft:[44,89],hr:[-8,10],eb:'back',env:[['bench',58,66,82,66,3.6],['line',62,68,62,92,2.2],['line',78,68,78,92,2.2]]},eq:['db']},
  straightarm:{v:'side',a:ST({T:172,hr:[18,-16],eb:'down'}),b:ST({T:172,hr:[4,24],eb:'back'}),eq:[['cable',64,8]]},
  backext:{v:'side',a:{hip:[52,54],T:70,ft:[30,82],kb:'down',hr:[3,3],eb:'down',env:[['line',44,62,58,56,4],['line',30,84,30,92,2.2],['line',58,58,62,92,2.2]]},
           b:{hip:[52,54],T:144,ft:[30,82],kb:'down',hr:[3,3],eb:'down',env:[['line',44,62,58,56,4],['line',30,84,30,92,2.2],['line',58,58,62,92,2.2]]},eq:[]},
  deadlift:{v:'side',a:{hip:[36,68],T:122,ft:[48,89],hr:[-3,25],eb:'back'},b:ST({hr:[1,24],eb:'back'}),eq:['barp']},
  /* ---- Ben ---- */
  squat:{v:'side',a:ST({hr:[-3,0],eb:'down',top:[['barSho',-3,-1]]}),b:{hip:[36,70],T:140,ft:[46,89],hr:[-3,0],eb:'down',top:[['barSho',-3,-1]]},eq:[]},
  rdl:{v:'side',a:ST({hr:[1,24],eb:'back'}),b:{hip:[36,54],T:115,ft:[44,89],hr:[-2,25],eb:'back'},eq:['barp']},
  goblet:{v:'side',a:ST({hr:[9,6],eb:'down'}),b:{hip:[36,70],T:150,ft:[46,89],hr:[9,6],eb:'down'},eq:['dbl']},
  legpress:{v:'side',a:{hip:[30,70],T:225,ft:[62,48],kb:'fwd',hr:[8,0],eb:'down',env:[['line',24,76,12,56,5],['bench',22,76,38,78,3.6],['line',58,58,70,38,3.4],['line',42,86,76,36,1.4]]},
            b:{hip:[30,70],T:225,ft:[46,62],kb:'fwd',hr:[8,0],eb:'down',env:[['line',24,76,12,56,5],['bench',22,76,38,78,3.6],['line',42,70,54,50,3.4],['line',42,86,76,36,1.4]]},eq:[]},
  legext:{v:'side',a:SEATP({T:182,ft:[52,89]},36,66),b:SEATP({T:182,ft:[72,64]},36,66),eq:[]},
  legcurl:{v:'side',a:{hip:[62,66],T:90,ft:[24,66],kb:'down',hr:[8,6],eb:'down',env:[['bench',18,70,96,70,4],['line',24,72,24,92,2.2],['line',90,72,90,92,2.2]]},
           b:{hip:[62,66],T:90,ft:[42,50],kb:'down',hr:[8,6],eb:'down',env:[['bench',18,70,96,70,4],['line',24,72,24,92,2.2],['line',90,72,90,92,2.2]]},eq:[]},
  lyingcurl:{v:'side',a:{hip:[62,66],T:90,ft:[24,66],kb:'down',hr:[8,6],eb:'down',env:[['bench',18,70,96,70,4],['line',24,72,24,92,2.2],['line',90,72,90,92,2.2]]},
           b:{hip:[62,66],T:90,ft:[42,50],kb:'down',hr:[8,6],eb:'down',env:[['bench',18,70,96,70,4],['line',24,72,24,92,2.2],['line',90,72,90,92,2.2]]},eq:[]},
  seatedcurl:{v:'side',a:SEATP({T:172,ft:[72,70],kb:'up'},36,64),b:SEATP({T:172,ft:[50,88],kb:'fwd'},36,64),eq:[]},
  lunge:{v:'side',a:ST({hr:[1,24],eb:'back'}),b:{hip:[42,62],T:180,ft:[56,89],kb:'fwd',ft2:[26,88],kb2:'down',hr:[1,24],eb:'back'},eq:['db']},
  lungedb:{v:'side',a:ST({hr:[1,24],eb:'back'}),b:{hip:[42,62],T:180,ft:[56,89],kb:'fwd',ft2:[26,88],kb2:'down',hr:[1,24],eb:'back'},eq:['db']},
  splitsq:{v:'side',a:{hip:[44,50],T:180,ft:[56,89],kb:'fwd',ft2:[20,72],kb2:'down',hr:[1,24],eb:'back',env:[['bench',10,74,26,74,3.6],['line',14,76,14,92,2.2]]},
           b:{hip:[44,62],T:180,ft:[56,89],kb:'fwd',ft2:[20,72],kb2:'down',hr:[1,24],eb:'back',env:[['bench',10,74,26,74,3.6],['line',14,76,14,92,2.2]]},eq:['db']},
  stepup:{v:'side',a:{hip:[50,56],T:180,ft:[60,74],kb:'fwd',ft2:[40,89],kb2:'fwd',hr:[1,24],eb:'back',env:[['rect',54,74,24,18]]},
          b:{hip:[64,38],T:180,ft:[64,74],kb:'fwd',ft2:[56,60],kb2:'fwd',hr:[1,24],eb:'back',env:[['rect',54,74,24,18]]},eq:['db']},
  hipthrust:{v:'side',a:{hip:[48,84],T:235,ft:[64,89],kb:'fwd',env:[['bench',8,72,34,72,3.8],['line',14,74,14,92,2.2]],top:[['barAt',48,82]]},
             b:{hip:[48,68],T:268,ft:[64,89],kb:'fwd',env:[['bench',8,72,34,72,3.8],['line',14,74,14,92,2.2]],top:[['barAt',48,66]]},eq:[]},
  calf:{v:'side',a:{hip:[46,52.5],T:180,ft:[46,90],toe:[54,86],hr:[1,24],eb:'back',env:[['rect',50,86,22,6]]},b:{hip:[46,44.5],T:180,ft:[46,82],toe:[54,86],hr:[1,24],eb:'back',env:[['rect',50,86,22,6]]},eq:['db']},
  seatedcalf:{v:'side',a:{hip:[34,57],T:180,ft:[53,78],toe:[61,76],hr:[2,12],eb:'back',env:[['bench',24,61,44,61,3.6],['rect',48,50,10,5],['rect',50,80,20,4]]},b:{hip:[34,57],T:180,ft:[53,72],toe:[61,76],hr:[2,12],eb:'back',env:[['bench',24,61,44,61,3.6],['rect',48,50,10,5],['rect',50,80,20,4]]},eq:[]},
  /* ---- Bål ---- */
  abs:{v:'side',a:{hip:[58,89],T:270,ft:[74,89],kb:'up',hr:[-7,-3],eb:'up'},b:{hip:[58,89],T:245,ft:[74,89],kb:'up',hr:[-7,-3],eb:'up'},eq:[]},
  revcrunch:{v:'side',a:{hip:[54,89],T:270,ft:[72,70],kb:'fwd',hr:[-4,3],eb:'down'},b:{hip:[54,84],T:270,ft:[66,58],kb:'fwd',hr:[-4,3],eb:'down'},eq:[]},
  cablecrunch:{v:'side',a:{hip:[44,64],T:180,ft:[28,88],kb:'down',hr:[6,-6],eb:'down'},b:{hip:[44,64],T:125,ft:[28,88],kb:'down',hr:[8,0],eb:'down'},eq:[['cable',62,6]]},
  hangleg:{v:'side',a:{hip:[46,54],T:180,ft:[46,91],hr:[0,-26],eb:'back',env:[['bar',36,5.5,56,5.5]]},b:{hip:[46,54],T:180,ft:[82,52],kb:'down',hr:[0,-26],eb:'back',env:[['bar',36,5.5,56,5.5]]},eq:[]},
  seatedleg:{v:'side',a:{hip:[38,72],T:205,ft:[76,84],kb:'up',hr:[-2,10],eb:'back',env:[['bench',24,76,46,76,3.6],['line',30,78,30,92,2.2]]},b:{hip:[38,72],T:205,ft:[54,56],kb:'fwd',hr:[-2,10],eb:'back',env:[['bench',24,76,46,76,3.6],['line',30,78,30,92,2.2]]},eq:[]},
  abwheel:{v:'side',a:{hip:[32,66],T:160,ft:[12,89],kb:'down',hr:[10,22],eb:'down'},b:{hip:[50,76],T:85,ft:[12,89],kb:'down',hr:[14,15],eb:'down'},eq:['wheel']},
  plank:{v:'side',one:1,a:{hip:[56,76],T:262,ft:[88,89],kb:'up',UA:0,FA:90},b:null,eq:[],fl:92},
  sideplank:{v:'raw',one:1,svg:'<line x1="6" y1="90" x2="94" y2="90" stroke="#34455c" stroke-width="1.2"/><line x1="76" y1="72" x2="30" y2="86" stroke="#c9d4e3" stroke-width="5.4" stroke-linecap="round"/><circle cx="22" cy="80" r="4.9" fill="none" stroke="#c9d4e3" stroke-width="2"/><line x1="30" y1="86" x2="76" y2="72" stroke="#c9d4e3" stroke-width="0"/><line x1="76" y1="72" x2="88" y2="88" stroke="#c9d4e3" stroke-width="4" stroke-linecap="round"/><line x1="40" y1="82" x2="40" y2="90" stroke="#5aa2ff" stroke-width="3.6" stroke-linecap="round"/><line x1="40" y1="90" x2="52" y2="90" stroke="#5aa2ff" stroke-width="3.2" stroke-linecap="round"/><line x1="43" y1="80" x2="43" y2="62" stroke="#5aa2ff" stroke-width="3" stroke-linecap="round" opacity="0.45"/>'},
  russian:{v:'side',one:1,a:{hip:[44,78],T:210,ft:[76,64],kb:'up',hr:[17,-3],eb:'down',env:[]},eq:['dbl']},
  bicycle:{v:'side',a:{hip:[56,88],T:245,ft:[90,80],kb:'down',ft2:[68,66],kb2:'fwd',hr:[-6,-3],eb:'up'},b:{hip:[56,88],T:245,ft:[68,66],kb:'fwd',ft2:[90,80],kb2:'down',hr:[-6,-3],eb:'up'},eq:[]},
  legraise:{v:'side',a:{hip:[48,89],T:270,ft:[86,88],kb:'up',hr:[-2,2],eb:'down'},b:{hip:[48,89],T:270,ft:[50,54],kb:'up',hr:[-2,2],eb:'down'},eq:[]},
  mountain:{v:'side',a:{hip:[56,70],T:250,ft:[86,88],kb:'up',hand:[36,89],eb:'back'},b:{hip:[56,70],T:250,ft:[86,88],kb:'up',ft2:[66,66],kb2:'fwd',hand:[36,89],eb:'back'},eq:[]},
  woodchop:{v:'side',a:ST({hr:[-8,-16],eb:'up'}),b:ST({hr:[12,18],eb:'down'}),eq:[['cable',16,8]]}
};

/* Instruktioner per övning. s = så gör du (steg), m = vanliga misstag, t = tips. */
const EXI={
chest:{s:["Lägg dig på bänken med fötterna stadigt i golvet. Ögonen ska vara under stången (eller håll hantlarna över bröstet med raka armar).","För ihop skulderbladen och tryck ned dem mot bänken. Behåll en liten naturlig svank, men låt rumpan ligga kvar på bänken hela setet.","Ta tag i stången med ett grepp som är ca 1,5 gånger axelbredd. Lyft ur den med raka armar.","Andas in och sänk kontrollerat tills stången nuddar mitten av bröstet (hantlar: tills överarmarna är ungefär parallella med golvet). Armbågarna pekar ca 45° ut från kroppen.","Pressa upp stången och något inåt mot en punkt över axlarna medan du andas ut.","Lägg tillbaka stången i stället eller sätt ned hantlarna kontrollerat när setet är klart."],
 m:["Rumpan lyfter från bänken, eller ryggen svankar kraftigt.","Armbågarna pekar rakt ut åt sidorna, vilket belastar axlarna.","Stången studsar mot bröstet.","Tunga set utan spotter eller säkerhetspins."],
 t:"Hantlar är skonsammare för axlar och handleder. Vid tunga set ska du alltid ha spotter eller säkerhetspins."},
bench:{s:["Lägg dig på bänken med ögonen rakt under stången och fötterna stadigt i golvet.","För ihop skulderbladen och tryck ned dem mot bänken. Håll en liten svank men låt rumpan ligga kvar.","Greppa stången något bredare än axlarna och lyft ur den med raka armar.","Andas in och sänk stången kontrollerat till mitten av bröstet. Armbågarna pekar ca 45° ut från kroppen.","Pressa upp stången medan du andas ut, tills armarna är nästan helt raka.","Lägg tillbaka stången i stället när setet är klart, med hjälp av spotter om du kör tungt."],
 m:["Rumpan lyfter från bänken.","Stången studsar mot bröstet.","Handlederna viker sig bakåt. Håll stången över underarmarna.","Tungt set utan spotter eller säkerhetspins."],
 t:"Kör aldrig till failure ensam utan säkerhetspins eller spotter."},
dbpress:{s:["Sätt dig på bänken med hantlarna på låren och lägg dig ned. Använd knäna för att hjälpa upp hantlarna till bröstet.","För ihop skulderbladen mot bänken, fötterna stadigt i golvet.","Börja med hantlarna över bröstet och raka armar.","Andas in och sänk hantlarna kontrollerat ned mot sidorna av bröstet tills överarmarna är ungefär parallella med golvet.","Pressa upp hantlarna medan du andas ut och för dem något mot varandra upptill.","Sätt ned hantlarna på låren och rulla ur bänken när du är klar."],
 m:["Hantlarna sjunker för djupt och belastar axlarna.","Hantlarna dras isär eller slår ihop med en smäll.","Armbågarna pekar rakt ut åt sidorna.","Ryggen svankar och rumpan lyfter."],
 t:"Välj en vikt du kan kontrollera hela vägen, särskilt när du blir trött."},
inclpress:{s:["Ställ bänken i ca 30° lutning. Sätt dig ned med hantlarna på låren och lägg dig ned.","Pressa upp hantlarna med hjälp av knäna så att du får dem över övre bröstet.","För ihop skulderbladen och håll dem nere mot bänken.","Andas in och sänk hantlarna kontrollerat ned mot övre bröstet. Armbågarna ca 45° ut från kroppen.","Pressa upp hantlarna rakt över axlarna medan du andas ut.","Sätt ned hantlarna på låren när du är klar."],
 m:["Bänken står för brant (över 45°), vilket tar över mycket av axlarna.","Hantlarna sänks för djupt.","Du lyfter rumpan eller svankar kraftigt."],
 t:"En vinkel på ca 30° träffar övre bröstet bra utan att axlarna tar över."},
flyes:{s:["Lägg dig på en plan bänk med en hantel i varje hand och pressa upp dem över bröstet med lätt böjda armbågar.","Vrid handflatorna mot varandra och för ihop skulderbladen.","Andas in och sänk armarna i en bred båge ut åt sidorna. Behåll samma lätta böj i armbågarna hela tiden.","Sänk tills du känner en tydlig stretch i bröstet, ungefär till bröstets höjd.","Andas ut och för hantlarna tillbaka i samma båge, som om du kramade en stor tunna.","Pausa kort upptill och upprepa."],
 m:["Armbågarna är rakt sträckta, vilket belastar armbågsleden.","Du sänker för djupt så att axlarna tar stryk.","Du pressar upp hantlarna som en bänkpress i stället för att göra en båge."],
 t:"Använd en lätt till måttlig vikt. Det här är en stretch- och isoleringsövning, inte en tung övning."},
flatfly:{s:["Lägg dig på en plan bänk och pressa upp hantlarna över bröstet med lätt böjda armbågar.","Vrid handflatorna mot varandra och för ihop skulderbladen.","Andas in och sänk armarna i en bred båge ut åt sidorna, med bibehållen böj i armbågarna.","Sänk tills du känner en tydlig stretch i bröstet, ungefär till bröstets höjd.","Andas ut och för hantlarna tillbaka i samma båge och mot varandra.","Håll spänningen i bröstet hela vägen och undvik att slå ihop hantlarna."],
 m:["Rakt sträckta armar belastar armbågarna.","Hantlarna sänks för djupt.","Bågen blir en press, och då tar triceps över."],
 t:"Lätt vikt och full kontroll ger bäst effekt. Tänk på att krama om en stor tunna."},
inclfly:{s:["Ställ en bänk i ca 30° lutning och lägg dig med en hantel i varje hand över bröstet. Armbågarna är lätt böjda.","Vrid handflatorna mot varandra och för ihop skulderbladen.","Andas in och sänk armarna i en bred båge ut åt sidorna tills du känner en stretch i övre bröstet.","Behåll samma armbågsvinkel under hela rörelsen.","Andas ut och för hantlarna tillbaka upp i samma båge.","Pausa kort upptill utan att slå ihop hantlarna."],
 m:["Armbågarna sträcks eller böjs mer under rörelsen, så att den blir en press.","Du sänker för djupt.","Bänken är för brant, vilket tar över mycket av axlarna."],
 t:"Håll vikten lätt. Känn stretchen i övre bröstet."},
lowfly:{s:["Ställ kablarna längst ned. Ta ett handtag i varje hand och kliv fram ett steg så att du står stadigt med lätt böjda knän.","Luta överkroppen lätt framåt. Armarna är lätt böjda och ligger nere vid sidorna.","Andas ut och för händerna upp och in mot varandra i en bred båge, så att de möts framför bröstet i ungefär hakans höjd.","Pressa ihop bröstet i toppläget och håll kort.","Andas in och sänk tillbaka i samma båge med kontroll tills du känner en stretch i bröstet.","Behåll samma armbågsböj under hela rörelsen."],
 m:["Du sträcker armarna fullt eller drar med biceps.","Du svingar med kroppen för att få upp vikten.","Armarna går för långt bakåt i startläget."],
 t:"Det här tränar särskilt övre bröstet. Håll tempot lugnt."},
crossover:{s:["Ställ kablarna högst upp. Ta ett handtag i varje hand och kliv fram ett steg med den ena foten framför den andra.","Luta överkroppen lätt framåt och låt armarna vara lätt böjda ut åt sidorna, ungefär i axelhöjd.","Andas ut och dra händerna ned och in mot varandra i en bred båge tills de möts framför höften eller nedre bröstet.","Pressa ihop bröstet och håll kort.","Andas in och för armarna tillbaka upp i samma båge tills du känner en stretch i bröstet.","Behåll armbågsböjen hela tiden."],
 m:["Du drar med armarna som i en triceps-pushdown.","Du svingar med kroppen.","Du släpper vikten för snabbt vid återgången."],
 t:"Du kan variera händernas slutposition (högre eller lägre) för att träffa olika delar av bröstet."},
pecdeck:{s:["Justera sätet så att handtagen ligger i höjd med bröstet och armbågarna är i samma höjd som axlarna.","Sitt med ryggen mot ryggstödet och för ihop skulderbladen. Greppa handtagen eller lägg underarmarna mot kuddarna.","Andas ut och för armarna framåt och in mot varandra tills de möts framför bröstet.","Pressa ihop bröstet och håll kort.","Andas in och för tillbaka armarna kontrollerat tills du känner en stretch i bröstet.","Stanna innan armarna dras för långt bakåt."],
 m:["Axlarna dras upp mot öronen.","Du rör dig för snabbt eller sänker för långt bakåt.","Ryggen lämnar ryggstödet."],
 t:"En bra övning för att ta bröstet nära trötthet utan att belasta armbågarna."},
machchest:{s:["Justera sätet så att handtagen är i höjd med mitten av bröstet.","Sitt med ryggen mot ryggstödet, fötterna i golvet och skulderbladen ihop.","Greppa handtagen och börja med armbågarna lite bakom kroppen.","Andas ut och pressa handtagen rakt framåt tills armarna är nästan helt raka.","Andas in och för tillbaka handtagen kontrollerat tills du känner en stretch i bröstet.","Låt inte viktstapeln slå i vila mellan repetitionerna."],
 m:["Axlarna dras framåt och upp.","Du låser armbågarna hårt.","Du ändrar sitthöjden för lågt eller högt."],
 t:"En trygg övning när du är trött eller kör nära failure."},
dbpullover:{s:["Lägg dig med ryggen tvärs över en bänk så att bara övre ryggen vilar på den, fötterna i golvet och höften lätt sänkt.","Håll en hantel med båda händerna över bröstet med lätt böjda armbågar.","Andas in och sänk hanteln i en båge bakom huvudet tills du känner en stretch i bröstet och ryggen.","Behåll armbågsböjen och bålen stilla.","Andas ut och för hanteln tillbaka i samma båge upp över bröstet.","Känn arbetet i bröstet och bredaste ryggmuskeln."],
 m:["Armbågarna böjs mer och rörelsen blir en triceps-extension.","Du sänker för djupt och ländryggen svankar.","Du håller en för tung hantel."],
 t:"Håll vikten måttlig. Hanteln ska kännas kontrollerad hela tiden."},
pushup:{s:["Placera händerna i golvet något bredare än axlarna, direkt under axlarna. Sträck ut benen bakåt så att du bildar en rak linje från huvud till hälar.","Spänn magen och rumpan så att kroppen hålls rak. Blicken är lite framför händerna.","Andas in och sänk kroppen genom att böja armbågarna ca 45° från kroppen.","Sänk tills bröstet är nära golvet utan att magen eller höften sjunker.","Andas ut och pressa upp till raka armar.","Hela kroppen rör sig som en stel planka."],
 m:["Höften sjunker eller sticker upp.","Armbågarna pekar rakt ut åt sidorna.","Du sänker bara halvvägs.","Huvudet hänger framåt."],
 t:"Är det för tungt: gör det med händerna på en bänk. För tungt blir lätt: lägg en vikt på ryggen eller höj fötterna."},
dips:{s:["Greppa dipsstängerna med raka armar och lyft dig upp. Luta överkroppen lätt framåt och låt benen hänga eller korsa dem bakom dig.","Spänn magen och dra ned axlarna bort från öronen.","Andas in och sänk kroppen genom att böja armbågarna tills överarmarna är ungefär parallella med golvet.","Håll armbågarna nära kroppen om du vill belasta triceps mer. Luta framåt om du vill belasta bröstet mer.","Andas ut och pressa upp till nästan raka armar.","Undvik att sänka dig så djupt att det gör ont i axlarna."],
 m:["Du sänker dig för djupt och belastar axlarna.","Axlarna dras upp mot öronen.","Du svingar med kroppen."],
 t:"Är det för tungt: använd en assisterad maskin eller ett gummiband. Är det för lätt: häng en vikt i ett bälte."},
shpress:{s:["Ställ ryggstödet så att det är i nästan upprätt läge. Sätt dig med en hantel i varje hand vilande på låren.","Lyft hantlarna med hjälp av knäna till axelhöjd. Underarmarna är lodräta.","Spänn magen och håll ryggen mot ryggstödet utan att svanka.","Andas ut och pressa hantlarna rakt upp och något inåt tills armarna är nästan raka.","Andas in och sänk kontrollerat tillbaka till axelhöjd, med armbågarna något framför kroppen.","Sätt ned hantlarna på låren när du är klar."],
 m:["Ryggen svankar och hantlarna pressas för långt bakom huvudet.","Du låser armbågarna hårt.","Du sänker hantlarna för djupt."],
 t:"Håll nacken avslappnad. Pressa gärna något framåt i stället för rakt upp om det känns bättre för axlarna."},
ohpress:{s:["Ställ dig med fötterna ca axelbredd isär och stången vilande mot framsidan av axlarna, strax under hakan. Greppa något bredare än axlarna.","Spänn rumpan och magen så att kroppen är stabil. Håll armbågarna något framför stången.","Andas in och pressa stången rakt upp. Flytta huvudet bakåt ur vägen när stången passerar ansiktet.","Fortsätt tills armarna är nästan raka med stången rakt över mitten av fötterna.","Andas ut och sänk kontrollerat tillbaka till axlarna.","Låt huvudet gå tillbaka framför stången i toppläget."],
 m:["Du svankar kraftigt och pressar med ländryggen.","Stången går i en båge framåt i stället för rakt upp.","Du gör en knäböj och kör på knäna (det blir en push press)."],
 t:"Kör nära failure bara med säkerhetspins eller en rack som ger skydd. Använd lätta uppvärmningsset."},
arnold:{s:["Sätt dig med ryggstödet upprätt. Håll hantlarna framför bröstet med handflatorna mot dig och armbågarna framför kroppen.","Spänn magen och håll ryggen mot ryggstödet.","Pressa hantlarna uppåt och vrid samtidigt handflatorna så att de pekar framåt när hantlarna är i axelhöjd.","Fortsätt pressa tills armarna är nästan raka.","Andas in och sänk kontrollerat med en omvänd vridning tillbaka till startläget.","Rör dig lugnt och i full kontroll."],
 m:["Vridningen blir hackig och ryckig.","Du svankar eller lutar bakåt.","Du använder för tung vikt och tappar tekniken."],
 t:"Använd en lättare vikt än i vanlig hantelpress."},
machpress:{s:["Justera sätet så att handtagen är i axelhöjd när du sitter med ryggen mot ryggstödet.","Greppa handtagen med fötterna stadigt i golvet.","Spänn magen och håll ryggen mot ryggstödet utan att svanka.","Andas ut och pressa handtagen rakt upp tills armarna är nästan raka.","Andas in och sänk kontrollerat tills handtagen är i axelhöjd.","Låt inte vikterna slå i vila mellan repetitionerna."],
 m:["Du svankar och drar ned axlarna.","Du låser armbågarna hårt.","Du sänker för djupt."],
 t:"Bra när du vill pressa nära failure på ett tryggt sätt."},
frontraise:{s:["Stå upprätt med en hantel i varje hand framför låren, handflatorna mot låren eller nedåt.","Spänn magen och rumpan. Låt armbågarna vara lätt böjda.","Andas ut och lyft armarna rakt framåt till axelhöjd.","Pausa kort upptill.","Andas in och sänk långsamt tillbaka utan att svinga.","Du kan lyfta en arm i taget om det hjälper dig hålla kroppen stilla."],
 m:["Du svingar med överkroppen för att få upp vikten.","Du lyfter över axelhöjd.","Du använder för tung vikt."],
 t:"Främre axeln jobbar redan mycket i alla pressar, så låt det här vara ett lätt komplement."},
latraise:{s:["Stå med en hantel i varje hand vid sidorna, lätt framåtlutad och med lätt böjda armbågar.","Håll handflatorna nedåt och spänn magen.","Andas ut och lyft armarna ut åt sidorna, ledda av armbågarna, tills de är i axelhöjd.","Tänk på att hälla ut en kanna: lillfingret ska vara något högre än tummen.","Pausa kort och andas in när du sänker kontrollerat.","Stanna innan hantlarna vilar mot kroppen så att spänningen finns kvar."],
 m:["Du svingar med kroppen.","Du lyfter med handen i stället för armbågen.","Du lyfter över axelhöjd och axlarna dras upp mot öronen."],
 t:"Lätt vikt, högt antal reps och långsam sänkning ger bäst effekt."},
cablelat:{s:["Ställ kabeln längst ned. Ta handtaget i handen längst från maskinen. Stå med sidan mot maskinen.","Spänn magen och luta dig lätt bort från maskinen. Armbågen är lätt böjd.","Andas ut och lyft armen ut åt sidan, ledd av armbågen, tills den är i axelhöjd.","Pausa kort och sänk kontrollerat tillbaka framför kroppen.","Kabeln ger jämn belastning även längst ned i rörelsen.","Gör alla repetitioner på ena sidan och byt sedan."],
 m:["Du svingar med kroppen.","Du lyfter över axelhöjd.","Du för armen för långt bakom kroppen."],
 t:"Kabel ger konstant spänning och är en bra komplettering till hantlar."},
reardelt:{s:["Stå med fötterna ca axelbredd isär och luta överkroppen framåt ca 45° (eller så att den är nästan parallell med golvet) med rak rygg. Böj knäna lätt.","Håll en lätt hantel i varje hand med armarna hängande rakt ned och lätt böjda armbågar.","Andas ut och lyft armarna ut åt sidorna ledda av armbågarna tills de är i ryggens höjd.","För ihop skulderbladen kort i toppläget.","Andas in och sänk långsamt tillbaka.","Håll nacken i förlängning av ryggen."],
 m:["Du rundar ryggen.","Du svingar med överkroppen för att få upp vikten.","Du lyfter med trapezius och nacken i stället för bakre axeln."],
 t:"Använd riktigt lätta hantlar. Bakre axeln är liten och behöver kontroll."},
revpec:{s:["Ställ in maskinen för bakre axel (eller vänd dig mot ryggstödet). Justera sätet så att handtagen är i axelhöjd.","Sitt med bröstet mot kudden och greppa handtagen med raka eller lätt böjda armar.","Andas ut och dra armarna ut åt sidorna och bakåt, ledda av armbågarna.","För ihop skulderbladen kort när armarna är i ryggens linje.","Andas in och för tillbaka kontrollerat.","Håll ned axlarna bort från öronen."],
 m:["Du drar med ryggen i stället för bakre axeln.","Du rycker och använder för mycket vikt.","Axlarna dras upp mot öronen."],
 t:"Lätt vikt och hög repetition fungerar bäst för bakre axeln."},
uprow:{s:["Stå med en EZ-stång eller skivstång i ett grepp ungefär axelbrett, hängande framför låren.","Spänn magen och håll överkroppen upprätt.","Andas ut och dra stången rakt upp längs kroppen, ledd av armbågarna.","Armbågarna ska vara högre än handlederna. Stanna när stången är i höjd med bröstet.","Pausa kort och andas in när du sänker kontrollerat.","Håll stången nära kroppen hela tiden."],
 m:["Du drar stången för högt (mot hakan), vilket kan irritera axlarna.","Du svingar med kroppen.","Du använder för smalt grepp, vilket belastar handlederna."],
 t:"Ett bredare grepp och stopp vid bröstet är skonsammare för axlarna."},
shrug:{s:["Stå med en hantel i varje hand vid sidorna, med armarna raka och handflatorna mot kroppen.","Håll huvudet rakt fram och bröstet uppe.","Andas ut och lyft axlarna rakt upp mot öronen så högt du kan.","Pausa en sekund i toppen och pressa ihop trapezius.","Andas in och sänk långsamt tillbaka.","Böj inte armbågarna."],
 m:["Du rullar axlarna runt, vilket gör ingen nytta.","Du böjer armbågarna.","Du använder så tung vikt att rörelsen blir kort."],
 t:"Håll tempot lugnt och pausa uppe i varje repetition."},
facepull:{s:["Ställ kabeln i ansiktshöjd med ett rep. Ta repet med båda händerna, handflatorna mot varandra, och backa tills kabeln är spänd.","Stå med lätt böjda knän och rak överkropp. Armarna är raka framför dig.","Andas ut och dra repet mot ansiktet, med armbågarna högt och ut åt sidorna.","Dra isär repets ändar så att händerna hamnar vid öronen och skulderbladen förs ihop.","Pausa kort och andas in när du släpper tillbaka kontrollerat.","Håll nacken avslappnad."],
 m:["Armbågarna hänger ned i stället för att vara högt.","Du lutar dig bakåt och drar med ryggen.","Du använder för tung vikt."],
 t:"Bra för axelns hälsa. Gör gärna fler repetitioner (12–15)."},
pulldown:{s:["Ställ in knäkudden så att låren sitter fast. Greppa stången med ett grepp ungefär 1,5 gånger axelbredd, med handflatorna framåt.","Luta överkroppen lätt bakåt (ca 10°) och dra bröstet uppåt.","Andas ut och dra ned stången mot övre bröstet. Led rörelsen med armbågarna ned mot höfterna.","För ihop skulderbladen i bottenläget.","Andas in och släpp upp stången långsamt tills armarna är raka och du känner en stretch i ryggen.","Titta rakt fram under hela rörelsen."],
 m:["Du lutar dig för långt bakåt och drar med ryggen i en rodd.","Du drar stången bakom nacken.","Du drar med armarna i stället för ryggen."],
 t:"Tänk att du drar armbågarna ned i bakfickorna. Det hjälper dig att använda ryggen."},
widepd:{s:["Ställ in knäkudden så att låren sitter fast. Greppa stången med ett brett grepp, ungefär 1,5–2 gånger axelbredd, med handflatorna framåt.","Luta överkroppen lätt bakåt och dra bröstet uppåt.","Andas ut och dra ned stången mot övre bröstet, ledd av armbågarna ut och ned.","För ihop skulderbladen och pressa ned dem i bottenläget.","Andas in och släpp upp stången långsamt tills armarna är raka.","Behåll en lätt bågform i ryggen under hela rörelsen."],
 m:["Du drar stången bakom nacken.","Du lutar dig bakåt och svingar.","Gripet är så brett att axlarna belastas."],
 t:"Ett brett grepp ger mer bredd i ryggen men kortare rörelse. Prova att variera greppet."},
pulldownclose:{s:["Fäst ett smalt handtag eller V-grepp i latsmaskinen. Ställ in knäkudden så att låren sitter fast.","Greppa handtaget med neutrala handflator mot varandra.","Luta överkroppen lätt bakåt och dra bröstet uppåt.","Andas ut och dra handtaget ned mot övre bröstet. Armbågarna går ned längs sidorna.","Pressa ihop skulderbladen i bottenläget.","Andas in och släpp upp handtaget långsamt tills armarna är raka."],
 m:["Du lutar dig för mycket bakåt.","Du drar med armarna i stället för ryggen.","Du släpper upp för snabbt."],
 t:"Ett smalt, neutralt grepp gör rörelsen längre och ger mer arbete åt mellanryggen."},
pullup:{s:["Greppa stången med ett grepp lite bredare än axlarna, handflatorna framåt. Häng med raka armar.","Dra ned axlarna bort från öronen och spänn magen. Korsa gärna fötterna bakom dig.","Andas ut och dra dig upp genom att dra armbågarna ned mot höfterna.","Dra tills hakan är över stången. Bröstet ska vara upp mot stången.","Andas in och sänk dig kontrollerat tills armarna är raka.","Undvik att svinga med kroppen."],
 m:["Du svingar eller sparkar med benen för att få upp dig.","Du drar bara halvvägs upp.","Du släpper dig snabbt ned och belastar axlar och armbågar."],
 t:"Är det för tungt: använd en assisterad maskin, ett gummiband eller gör negativa repetitioner (hoppa upp och sänk dig långsamt). Är det för lätt: häng en vikt i ett bälte."},
row:{s:["Sätt dig vid kabelrodden med fötterna mot plattan och knäna lätt böjda. Greppa handtaget.","Sitt upprätt med rak rygg och bröstet uppe. Börja med armarna raka framför dig.","Andas ut och dra handtaget mot nedre delen av magen. För armbågarna bakåt längs kroppen.","För ihop skulderbladen i slutläget och pausa kort.","Andas in och släpp tillbaka långsamt tills armarna är raka igen.","Låt överkroppen vara stilla under hela rörelsen."],
 m:["Du lutar dig bakåt och svingar med ryggen.","Axlarna dras upp mot öronen.","Du släpper fram för snabbt och rundar ryggen."],
 t:"Tänk att du drar armbågarna bakåt, inte händerna. Det hjälper dig att använda ryggen."},
cablerow:{s:["Sätt dig vid kabelrodden med fötterna mot plattan och knäna lätt böjda. Greppa handtaget.","Sitt upprätt med rak rygg och bröstet uppe. Armarna är raka framför dig.","Andas ut och dra handtaget mot nedre delen av magen. För armbågarna bakåt längs kroppen.","För ihop skulderbladen och pausa kort.","Andas in och släpp tillbaka långsamt tills armarna är raka.","Överkroppen ska vara stilla under hela rörelsen."],
 m:["Du lutar dig bakåt och svingar.","Axlarna dras upp mot öronen.","Du släpper fram för snabbt och rundar ryggen."],
 t:"Ändra handtaget (V-grepp, rakt handtag) för att variera arbetet i ryggen."},
vrow:{s:["Fäst ett brett V-handtag i kabelrodden. Sätt dig med fötterna mot plattan och knäna lätt böjda.","Greppa handtaget med handflatorna mot varandra och sitt upprätt med rak rygg.","Andas ut och dra handtaget mot bröstet och nedre delen av revbenen. Armbågarna går bakåt och något ut.","För ihop skulderbladen och pausa en sekund.","Andas in och släpp tillbaka långsamt tills armarna är raka.","Håll överkroppen stilla."],
 m:["Du drar med armarna och inte med ryggen.","Du lutar dig bakåt och svingar.","Du rundar ryggen i startläget."],
 t:"Ett brett grepp träffar mellanryggen. Pausa i slutläget för bättre effekt."},
suprow:{s:["Fäst ett rakt handtag eller stång i kabelrodden. Sätt dig med fötterna mot plattan och knäna lätt böjda.","Greppa med underhandsgrepp (handflatorna uppåt) ungefär axelbrett.","Sitt upprätt med rak rygg och dra bröstet uppåt.","Andas ut och dra handtaget mot nedre delen av magen med armbågarna nära kroppen.","Pausa och för ihop skulderbladen. Andas in och släpp tillbaka långsamt.","Håll ryggen stilla hela tiden."],
 m:["Du drar med handleden och biceps i stället för ryggen.","Du lutar dig bakåt.","Armbågarna går ut åt sidorna."],
 t:"Underhandsgreppet ger ett strikt ryggarbete och aktiverar biceps mer."},
machrow:{s:["Justera sätet så att bröstet vilar mot kudden och handtagen är i bröstets höjd.","Greppa handtagen med raka armar och sitt med bröstet stadigt mot kudden.","Andas ut och dra handtagen bakåt tills armbågarna är i ryggens linje.","För ihop skulderbladen och pausa en sekund.","Andas in och släpp tillbaka långsamt tills du känner en stretch i ryggen.","Lyft inte bröstet från kudden."],
 m:["Du drar med armarna, inte ryggen.","Axlarna dras upp mot öronen.","Du lyfter från kudden och svingar."],
 t:"Kudden tar bort juckandet, så du kan fokusera på ryggen."},
straightarm:{s:["Ställ kabeln högt upp med en rak stång. Stå med fötterna i ca axelbredd och luta överkroppen lätt framåt.","Greppa stången med handflatorna nedåt och armarna raka eller med en lätt böj.","Andas ut och dra stången i en båge ned mot låren med raka armar.","Pressa ihop bredaste ryggmuskeln i bottenläget.","Andas in och för stången tillbaka upp i samma båge med kontroll.","Rör bara armarna. Överkroppen står stilla."],
 m:["Du böjer armbågarna och drar som i en triceps-pushdown.","Du lutar kroppen mer för att få upp vikten.","Du drar för tungt och tappar kontrollen."],
 t:"Använd lätt vikt. Tänk att du pressar kabeln ned med ryggen, inte armarna."},
bbrow:{s:["Stå med fötterna axelbredd isär och stången över mitten av fötterna. Böj knäna lätt och luta överkroppen framåt till ca 45° med rak rygg.","Greppa stången något bredare än axlarna med handflatorna nedåt, och lyft den så att armarna hänger raka.","Spänn magen och håll nacken i förlängning av ryggen.","Andas ut och dra stången mot nedre delen av magen. Armbågarna går bakåt och ned längs kroppen.","Pausa kort när skulderbladen är ihop. Andas in och sänk stången kontrollerat.","Lägg ned stången på golvet när setet är klart."],
 m:["Du rundar ryggen.","Du reser dig upp och svingar med kroppen.","Du drar stången mot bröstet i stället för magen."],
 t:"Stanna ett par repetitioner före failure på tunga set. En rund rygg under last är det vanligaste skadeområdet."},
dbrow:{s:["Stöd ena handen och knät på en bänk. Håll ryggen rak och parallell med golvet. Ta en hantel i den fria handen.","Låt armen hänga rakt ned med axeln nära bänken.","Andas ut och dra hanteln upp mot höften genom att dra armbågen bakåt, nära kroppen.","Pausa kort när armbågen är över ryggen och skulderbladet är ihop.","Andas in och sänk hanteln kontrollerat tills armen är sträckt.","Byt sida efter alla repetitioner."],
 m:["Du vrider överkroppen för att få upp vikten.","Du drar med biceps och inte ryggen.","Du låter axeln hänga ned och rundar ryggen."],
 t:"Håll bålen stilla. Tänk att du drar armbågen mot taket."},
backext:{s:["Ställ in maskinen så att höftvecket vilar mot kudden och fötterna är fastlåsta.","Korsa armarna över bröstet eller håll en vikt mot bröstet. Börja med överkroppen böjd framåt och rak rygg.","Andas ut och lyft överkroppen med höft och ländrygg tills kroppen är i en rak linje.","Pressa ihop rumpan och ländryggen i toppläget utan att böja bakåt.","Andas in och sänk långsamt tillbaka.","Håll nacken i förlängning av ryggen."],
 m:["Du böjer bakåt över rak linje, vilket belastar ländryggen.","Du rycker och svingar.","Du rundar ryggen i bottenläget."],
 t:"Stoppa när kroppen är rak. Mer är inte bättre."},
deadlift:{s:["Stå med fötterna höftbrett isär och stången över mitten av fötterna. Böj dig ned och greppa stången strax utanför benen.","Böj knäna tills skenbenen nuddar stången. Bröstet är uppe och ryggen är rak.","Spänn magen och dra ihop skulderbladen. Stången ska vara nära kroppen.","Andas in, tryck genom hälarna och res dig upp med rak rygg. Stången följer benen.","Sträck ut höfterna fullt i toppläget utan att svanka över.","Sänk stången kontrollerat längs benen genom att först skjuta höften bakåt och sedan böja knäna."],
 m:["Du rundar ryggen.","Stången är för långt från kroppen.","Höften skjuter upp före axlarna.","Du lutar dig bakåt i toppläget."],
 t:"Börja med lätta uppvärmningsset. Använd gärna lyftarbälte vid tunga set. Dra aldrig stången med armarna."},
bbcurl:{s:["Stå med fötterna ca axelbredd isär och greppa stången med ett underhandsgrepp ungefär axelbrett.","Låt armarna hänga rakt ned med armbågarna intill kroppen.","Spänn magen och håll överkroppen stilla.","Andas ut och böj armbågarna så att stången kommer upp mot axlarna. Armbågarna ska stanna vid sidorna.","Pausa en sekund i toppläget och pressa ihop biceps.","Andas in och sänk långsamt (ca 2 sekunder) tills armarna är nästan raka."],
 m:["Du svingar med ryggen för att få upp stången.","Armbågarna flyttar sig framåt.","Du släpper stången och använder inte hela rörelsen."],
 t:"Använd en EZ-stång om raka stången känns obekväm för handlederna."},
dbcurl:{s:["Sitt på en bänk med upprätt rygg och en hantel i varje hand, armarna hängande vid sidorna.","Vrid handflatorna framåt, mot dig i toppläget.","Andas ut och böj armbågarna så att hantlarna kommer upp mot axlarna. Vrid handen utåt under lyftet.","Pausa en sekund i toppen och pressa ihop biceps.","Andas in och sänk långsamt tills armarna är raka.","Du kan göra en arm i taget eller båda samtidigt."],
 m:["Du lutar dig bakåt och svingar.","Armbågarna flyttar sig framåt.","Du sänker snabbt och tappar spänningen."],
 t:"Att sitta ned minskar risken för svingar. Håll ryggen mot stödet."},
inclcurl:{s:["Ställ en bänk i 45–60° lutning. Sätt dig med ryggen mot bänken och en hantel i varje hand, armarna hängande rakt ned.","Låt axlarna vara bakåt mot bänken så att bicepsen sträcks.","Andas ut och böj armbågarna och lyft hantlarna upp mot axlarna. Vrid handflatorna uppåt.","Håll armbågarna stilla och bakom kroppen.","Pausa kort och andas in när du sänker långsamt (ca 3 sekunder) tills armarna är helt raka.","Känn stretchen i biceps i bottenläget."],
 m:["Armbågarna flyttar sig framåt.","Du lutar överkroppen framåt och svingar.","Du sänker för snabbt och missar stretchen."],
 t:"En bra övning för biceps långa huvud. Håll tempot lugnt."},
hammer:{s:["Stå med en hantel i varje hand, armarna hängande vid sidorna och handflatorna mot kroppen (neutralt grepp, som när du håller en hammare).","Håll armbågarna intill kroppen och spänn magen.","Andas ut och böj armbågarna så att hantlarna kommer upp mot axlarna. Håll tummarna uppåt hela tiden.","Pausa kort i toppen.","Andas in och sänk långsamt tills armarna är raka.","Du kan göra en arm i taget eller båda samtidigt."],
 m:["Du svingar med ryggen.","Du vrider handen och förlorar det neutrala greppet.","Armbågarna flyttar sig framåt."],
 t:"Neutralt grepp tränar underarmen och brachialis, den muskel som ligger under biceps."},
cablecurl:{s:["Ställ kabeln längst ned och fäst en rak stång eller EZ-stång. Stå ca ett steg från maskinen med fötterna axelbredd isär.","Greppa med underhandsgrepp. Armbågarna hänger intill kroppen.","Spänn magen och stå stilla.","Andas ut och böj armbågarna så att stången kommer upp mot axlarna.","Pausa och pressa ihop biceps. Andas in och sänk långsamt tills armarna är raka.","Kabeln ger jämn spänning, även i bottenläget."],
 m:["Du lutar dig bakåt och svingar.","Armbågarna flyttar sig framåt.","Du släpper snabbt tillbaka och tappar spänningen."],
 t:"Lås inte ut armbågarna helt i bottenläget så att spänningen finns kvar."},
scott:{s:["Justera sätet så att armarna ligger över kudden med armhålorna mot kuddens överkant.","Greppa stången eller hantlarna med underhandsgrepp. Låt armarna hänga ned längs kudden.","Andas ut och böj armbågarna och lyft vikten upp mot axlarna. Överarmarna ligger kvar mot kudden.","Pausa kort och andas in när du sänker långsamt tills armarna är nästan raka.","Sträck inte ut armbågarna helt i bottenläget om det gör ont.","Håll ryggen rak och ryck inte med överkroppen."],
 m:["Du sänker för snabbt och armbågarna tar stryk i bottenläget.","Du lyfter rumpan från sätet.","Du låter överarmarna lyfta från kudden."],
 t:"Kudden tar bort juckandet. Var försiktig i bottenläget för att skona armbågarna och senan."},
rope:{s:["Fäst ett rep i en högt placerad kabel. Stå med fötterna axelbredd isär och greppa repet med handflatorna mot varandra.","Håll armbågarna intill kroppen och armarna böjda ca 90°.","Spänn magen och stå stilla.","Andas ut och pressa ned repet tills armarna är raka. Dra isär repets ändar i bottenläget.","Pausa och pressa ihop triceps.","Andas in och låt händerna gå upp kontrollerat tills underarmarna är ungefär parallella med golvet."],
 m:["Armbågarna flyttar sig framåt eller ut.","Du lutar överkroppen över kabeln och pressar med tyngden.","Du släpper upp för högt."],
 t:"Repet gör att du kan dra isär händerna i slutläget, vilket ger extra tryck på triceps."},
bar:{s:["Fäst en rak stång eller V-stång i en högt placerad kabel. Stå med fötterna axelbredd isär och greppa med handflatorna nedåt.","Håll armbågarna intill kroppen och armarna böjda ca 90°.","Spänn magen och stå stilla.","Andas ut och pressa ned stången tills armarna är raka.","Pausa och pressa ihop triceps.","Andas in och släpp upp kontrollerat tills underarmarna är ungefär parallella med golvet."],
 m:["Armbågarna flyttar sig framåt eller ut.","Du lutar dig över kabeln.","Du släpper upp för högt."],
 t:"Håll handlederna raka. Använd inte vikt som får dig att luta kroppen framåt."},
ohext:{s:["Stå eller sitt med en hantel hållen med båda händerna (eller ett rep i en kabel) ovanför huvudet med raka armar.","Håll överarmarna stilla och nära öronen. Armbågarna pekar rakt upp.","Andas in och sänk hanteln bakom huvudet genom att böja bara armbågarna tills du känner en stretch i triceps.","Håll bålen stilla och undvik att svanka.","Andas ut och pressa upp hanteln tills armarna är raka.","Pausa kort upptill."],
 m:["Armbågarna flyger ut åt sidorna.","Du svankar och trycker huvudet framåt.","Du sänker för djupt och belastar armbågarna."],
 t:"Övningen ger tricepsens långa huvud en stor stretch. Använd lättare vikt än i vanliga tricepsövningar."},
french:{s:["Lägg dig på en bänk med en EZ-stång (eller hantlar). Pressa upp stången över bröstet med raka armar.","Håll överarmarna ungefär lodräta och armbågarna pekande mot taket.","Andas in och sänk stången kontrollerat mot pannan (eller strax bakom huvudet) genom att böja bara armbågarna.","Håll överarmarna stilla under hela rörelsen.","Andas ut och pressa upp stången tills armarna är nästan raka.","Ha gärna en spotter vid tunga set."],
 m:["Armbågarna flyger ut åt sidorna.","Överarmarna rör sig fram och tillbaka.","Du sänker stången för snabbt mot huvudet."],
 t:"Om armbågarna ömmar: byt till en kabelvariant, sänk vikten eller byt greppet till neutralt med hantlar."},
kick:{s:["Stöd ena handen och knät på en bänk, eller stå lätt framåtlutad med rak rygg. Ta en lätt hantel i den fria handen.","Håll överarmen parallell med golvet och nära kroppen, armbågen böjd ca 90°.","Andas ut och sträck ut underarmen bakåt tills armen är rak.","Pressa ihop triceps i slutläget och pausa en sekund.","Andas in och böj tillbaka kontrollerat till 90°.","Gör alla repetitioner på ena sidan och byt sedan."],
 m:["Överarmen sjunker och rör sig under rörelsen.","Du svingar med hanteln.","Du använder för tung vikt."],
 t:"Håll vikten lätt och kontrollerad. Överarmen ska vara helt stilla."},
cgbench:{s:["Lägg dig på bänken med ögonen under stången och fötterna stadigt i golvet.","Greppa stången med ett grepp ungefär axelbrett (inte smalare, det belastar handlederna).","För ihop skulderbladen mot bänken och lyft ur stången med raka armar.","Andas in och sänk stången till nedre delen av bröstet med armbågarna nära kroppen.","Pressa upp stången medan du andas ut tills armarna är nästan raka.","Lägg tillbaka stången i stället när du är klar."],
 m:["Gripet är för smalt, vilket belastar handlederna.","Armbågarna flyger ut åt sidorna.","Du kör nära failure utan spotter eller säkerhetspins."],
 t:"Den här övningen tränar triceps tungt. Använd alltid spotter eller säkerhetspins."},
legpress:{s:["Sätt dig i maskinen med ryggen mot ryggstödet och sätt fötterna på plattan ca axelbredd isär, med tårna lätt utåt.","Låt knäna följa tårnas riktning. Rumpan ligger kvar mot sätet.","Lås upp säkerhetshandtagen och sänk plattan kontrollerat tills knäna är böjda ca 90° (eller så djupt du kan utan att rumpan lyfter).","Andas in på vägen ned.","Andas ut och pressa plattan uppåt genom hela foten, utan att låsa knäna helt.","Ställ tillbaka säkerhetshandtagen när du är klar."],
 m:["Rumpan lyfter från sätet och ländryggen rundas.","Knäna faller inåt.","Du låser knäna hårt i toppläget."],
 t:"Fotplaceringen ändrar belastningen: högre och bredare ger mer rumpa och baksida lår, lägre ger mer framsida lår."},
squat:{s:["Ställ stången på en rack i höjd med övre delen av bröstet. Gå under, placera stången på övre ryggen (inte på nacken) och greppa med händerna så att armbågarna pekar nedåt.","Lyft ur stången och ta två till tre steg bakåt. Stå med fötterna ca axelbredd isär och tårna lätt utåt.","Spänn magen och dra in luft. Rak rygg och blicken rakt fram.","Andas in och böj knäna och höften samtidigt. Sänk dig tills låren är parallella med golvet (eller så djupt du kan med rak rygg).","Håll knäna i linje med tårna och vikten på hela foten.","Andas ut och pressa dig upp genom hälarna och mitten av foten tillbaka till stående. Sätt tillbaka stången i racken."],
 m:["Knäna faller inåt.","Hälarna lyfter eller ryggen rundas i bottenläget.","Överkroppen lutar för långt framåt.","Du kör tungt utan säkerhetspins eller spotter."],
 t:"Du kan också göra benpress eller goblet squat om du saknar rack. Använd säkerhetspins vid tunga set."},
rdl:{s:["Stå med fötterna höftbrett isär och håll stången framför låren med ett grepp ca axelbrett. Knäna är lätt böjda.","Dra axlarna bakåt och ned och spänn magen. Rak rygg.","Andas in och skjut höften bakåt (som om du stängde en bildörr med rumpan). Sänk stången längs benen.","Sänk tills du känner en tydlig stretch i baksidan av låren, vanligen strax under knäna. Ryggen förblir rak.","Andas ut och driv höften framåt och res dig upp med rak rygg.","Stå upprätt i toppläget utan att svanka över."],
 m:["Du rundar ryggen.","Du böjer knäna för mycket så att det blir en knäböj.","Stången är för långt från benen."],
 t:"Det är en höftrörelse, inte en ryggrörelse. Tänk att du skjuter höften bakåt."},
lunge:{s:["Stå med en hantel i varje hand vid sidorna. Ta ett långt steg framåt.","Spänn magen och stå upprätt med bröstet uppe.","Andas in och sänk det bakre knäet mot golvet tills båda knäna är böjda ca 90°.","Det främre knäet ska vara över foten, inte långt framför tårna.","Andas ut och driv dig upp genom främre hälen, och sätt ihop fötterna eller ta nästa steg.","Alternera ben eller gå framåt."],
 m:["Steget är för kort så att knäet åker långt över tårna.","Överkroppen lutar framåt.","Du faller åt sidorna."],
 t:"Lungear tränar balans och ben. Kan du inte hålla balansen: håll i något med ena handen."},
lungedb:{s:["Stå med en hantel i varje hand vid sidorna. Ta ett långt steg framåt.","Spänn magen och stå upprätt med bröstet uppe.","Andas in och sänk det bakre knäet mot golvet tills båda knäna är böjda ca 90°.","Det främre knäet ska vara över foten, inte långt framför tårna.","Andas ut och driv dig upp genom främre hälen och ta nästa steg.","Alternera ben tills du har gjort alla steg."],
 m:["Steget är för kort så att knäet åker långt över tårna.","Överkroppen lutar framåt.","Du faller åt sidorna."],
 t:"Räkna steg per ben om du tränar i en rad."},
splitsq:{s:["Stå ca ett långt steg framför en bänk. Lägg den bakre fotens ovansida på bänken. Håll en hantel i varje hand.","Främre foten är stadigt i golvet, höften och axlarna är rakt framåt.","Spänn magen och stå upprätt.","Andas in och sänk dig rakt ned genom att böja det främre knäet tills det är ca 90°.","Det främre knäet följer tårnas riktning och ska inte falla inåt.","Andas ut och pressa dig upp genom främre hälen."],
 m:["Du står för nära bänken så att knäet åker långt över tårna.","Främre knäet faller inåt.","Du lutar överkroppen framåt."],
 t:"Justera stegavståndet så att främre knäet hamnar ungefär över foten i bottenläget."},
hipthrust:{s:["Sätt dig på golvet med övre ryggen mot kanten av en bänk och stången över höften (använd gärna en pad). Fötterna står ca höftbrett isär.","Böj knäna ca 90° i toppläget. Hakan lätt intryckt.","Spänn rumpan och magen.","Andas ut och driv höften uppåt tills kroppen är i en rak linje från axlar till knän.","Pressa ihop rumpan i toppläget och pausa en sekund.","Andas in och sänk långsamt tills rumpan nästan nuddar golvet."],
 m:["Du svankar över i toppläget.","Fötterna står för långt fram eller bak.","Du driver med ländryggen i stället för rumpan."],
 t:"Fotplaceringen är rätt när underbenen är lodräta i toppläget."},
calf:{s:["Stå med trampdynan på en kant eller ett steg, med hälarna fria. Håll gärna i något för balans.","Håll benen raka (men lås inte knäna hårt) och spänn magen.","Sänk hälarna ned under kanten tills du känner en stretch i vaderna.","Andas ut och pressa dig upp på tårna så högt du kan.","Pausa en sekund i toppläget.","Andas in och sänk långsamt ned i full stretch."],
 m:["Du studsar och använder inte full rörelse.","Du lutar dig framåt.","Du böjer knäna och gör en annan övning."],
 t:"Vaderna tål mycket volym. Gör långsamma repetitioner med paus i toppläget."},
seatedcalf:{s:["Sätt dig i maskinen med knäna under kudden och tårna på plattan.","Justera kudden så att den ligger mot de nedre låren, strax ovanför knäna.","Sänk hälarna så att du får en tydlig stretch i vaderna.","Andas ut och pressa dig upp på tårna så högt du kan.","Pausa en sekund i toppläget.","Andas in och sänk långsamt ned i full stretch."],
 m:["Du studsar och använder inte full rörelse.","Du lyfter knäna från kudden.","Du använder för tung vikt."],
 t:"Den sittande varianten tränar soleus, den djupare vadmuskeln."},
abs:{s:["Lägg dig på rygg med knäna böjda och fötterna i golvet. Placera händerna lätt bakom huvudet eller över bröstet.","Spänn magen och tryck ned ländryggen mot golvet.","Andas ut och rulla upp huvud och axlar mot knäna genom att krulla ihop bröstkorgen.","Lyft bara tills bröstkorgen är ca 20–30 cm från golvet. Ländryggen ska fortfarande vara kvar mot golvet.","Pausa en sekund i toppen och pressa ihop magen.","Andas in och sänk långsamt tillbaka utan att släppa spänningen."],
 m:["Du drar i nacken med händerna.","Du lyfter hela ryggen och använder höftböjarna.","Du rycker fram och tillbaka."],
 t:"Fokus på kvalitet, inte antal. Gör långsamma och kontrollerade repetitioner."},
revcrunch:{s:["Lägg dig på rygg med armarna längs sidorna eller händerna under rumpan. Lyft benen med knäna böjda ca 90° och låren lodräta.","Spänn magen och tryck ned ländryggen mot golvet.","Andas ut och lyft höften några centimeter från golvet genom att rulla upp bäckenet mot bröstet.","Rörelsen kommer från magen, inte från att svinga benen.","Pausa kort i toppläget.","Andas in och sänk långsamt tills rumpan nuddar golvet utan att benen faller bakåt."],
 m:["Du svingar benen för att få upp höften.","Du lyfter benen och inte bäckenet.","Ländryggen svankar i bottenläget."],
 t:"En liten rörelse räcker. Det är bäckenets vippning som gör jobbet."},
cablecrunch:{s:["Fäst ett rep i en högt placerad kabel. Knäböj ca ett halvt meter från maskinen och ta tag i repet bakom huvudet (eller vid pannan).","Sitt på hälarna med rak rygg och spänn magen.","Andas ut och rulla ihop överkroppen genom att dra armbågarna mot knäna. Böj ryggraden, inte höften.","Pressa ihop magen i bottenläget och pausa en sekund.","Andas in och rulla tillbaka långsamt till startläget, utan att släppa spänningen.","Höfterna ska stå stilla under rörelsen."],
 m:["Du böjer från höften och drar med armarna.","Du använder för tung vikt och tappar kontrollen.","Du rör höfterna fram och tillbaka."],
 t:"Det är en rullande rörelse i ryggraden. Tänk att du kramar ihop bröstkorgen mot bäckenet."},
hangleg:{s:["Häng i ett räcke eller en stång med raka armar. Dra ned axlarna bort från öronen.","Spänn magen och håll kroppen stilla utan att svinga.","Andas ut och lyft benen (böjda knän eller raka ben) upp mot höften eller högre.","Rulla upp bäckenet i slutläget så att magen jobbar och inte bara höftböjarna.","Pausa kort.","Andas in och sänk långsamt tills benen hänger rakt ned igen."],
 m:["Du svingar kroppen för att få upp benen.","Du drar bara benen utan att rulla bäckenet.","Du låter axlarna hänga och belastar axelleden."],
 t:"Är det för tungt: böj knäna. Är det för lätt: raka ben, eller håll en hantel mellan fötterna."},
abwheel:{s:["Knäböj på en matta med en bukrulle (ab-wheel) i händerna rakt under axlarna.","Spänn magen och rumpan. Rund ryggen lätt (som en katt).","Andas in och rulla fram långsamt tills kroppen är nästan rak. Ryggen ska inte svanka.","Gå bara så långt du kan hålla magen spänd och ländryggen neutral.","Andas ut och dra tillbaka rullen genom att spänna magen.","Håll ryggraden lätt rundad hela tiden."],
 m:["Du svankar i slutläget, vilket belastar ländryggen.","Du rullar för långt och tappar kontrollen.","Du drar tillbaka med höften i stället för magen."],
 t:"Börja med en kort rörelse. Du kan stå mot en vägg och rulla mot den."},
woodchop:{s:["Ställ kabeln högt upp med ett handtag. Stå med sidan mot maskinen, fötterna axelbredd isär och knäna lätt böjda.","Greppa handtaget med båda händerna och håll armarna nästan raka.","Spänn magen och rumpan.","Andas ut och dra handtaget diagonalt ned över kroppen mot motsatt höft. Rotera från bålen och låt fötterna följa med.","Kontrollera rörelsen tillbaka upp till startläget.","Gör alla repetitioner på ena sidan och byt sedan."],
 m:["Du drar med armarna och inte bålen.","Du roterar från ländryggen i stället för hela bålen.","Du använder för tung vikt."],
 t:"Du kan också köra uppåt från en låg kabel. Hela bålen ska arbeta."},
sideplank:{s:["Lägg dig på sidan med armbågen under axeln och underarmen framåt. Fötterna ligger ovanpå varandra.","Spänn magen och lyft höften från golvet så att kroppen är en rak linje från huvud till fötter.","Håll den övre armen längs sidan eller på höften.","Håll positionen och andas lugnt.","Tryck armbågen mot golvet så att du inte sjunker ned i axeln.","Byt sida när tiden är slut."],
 m:["Höften sjunker mot golvet.","Du roterar överkroppen framåt eller bakåt.","Axeln sjunker ned mot örat."],
 t:"Är det för tungt: sätt knäet i golvet. Är det för lätt: lyft ett ben eller lägg på en vikt."},
plank:{s:["Lägg dig på mage och stöd dig på underarmarna med armbågarna under axlarna. Ställ tårna i golvet.","Lyft kroppen från golvet så att den är en rak linje från huvud till hälar.","Spänn magen, rumpan och låren.","Titta ned mot golvet så att nacken är i linje med ryggraden.","Håll positionen och andas lugnt.","Avsluta när du inte längre kan hålla kroppen rak."],
 m:["Höften sjunker och ländryggen svankar.","Rumpan sticker upp.","Du håller andan."],
 t:"Räkna tid snarare än antal. Är det för lätt: lyft ett ben eller lägg en vikt på ryggen."},
russian:{s:["Sitt på golvet med knäna böjda och fötterna lätt lyfta (eller i golvet om det är för tungt). Luta överkroppen bakåt ca 45° med rak rygg.","Håll en hantel eller en vikt med båda händerna framför bröstet.","Spänn magen och håll bröstet uppe.","Andas ut och rotera överkroppen åt ena sidan så att vikten följer med.","Rotera åt andra sidan. Rörelsen kommer från bålen, inte från armarna.","Räkna en repetition per sida."],
 m:["Du rör bara armarna och inte bålen.","Du rundar ryggen.","Du svingar snabbt och tappar kontrollen."],
 t:"Är det för tungt: ha fötterna i golvet och utan vikt."},
bicycle:{s:["Lägg dig på rygg med händerna lätt bakom huvudet och benen lyfta med knäna böjda.","Spänn magen och tryck ned ländryggen mot golvet.","Andas ut och för ena knät mot bröstet medan du vrider överkroppen så att motsatt armbåge närmar sig knät.","Sträck samtidigt ut det andra benet rakt framåt, strax ovanför golvet.","Byt sida i ett jämnt, kontrollerat tempo, som om du cyklade.","Håll nacken avslappnad och dra inte i huvudet."],
 m:["Du drar i nacken med händerna.","Du rör sig för snabbt och använder fart.","Du låter ländryggen svanka."],
 t:"Långsamma repetitioner är mer effektiva än snabba."},
legraise:{s:["Lägg dig på rygg med benen raka och händerna under rumpan eller längs sidorna.","Tryck ned ländryggen mot golvet och spänn magen.","Andas ut och lyft benen rakt upp tills de är lodräta.","Rulla upp bäckenet lätt i toppläget.","Andas in och sänk långsamt tills benen är strax ovanför golvet, utan att ländryggen lyfter.","Böj knäna lätt om det är för tungt."],
 m:["Ländryggen svankar och lämnar golvet.","Du sänker för snabbt och släpper spänningen.","Du svingar benen."],
 t:"Sänk bara så långt som ländryggen ligger kvar mot golvet."},
mountain:{s:["Stå i plankposition med händerna i golvet under axlarna och kroppen i en rak linje.","Spänn magen och rumpan.","Dra ena knät framåt mot bröstet utan att höften lyfter eller sjunker.","Byt snabbt ben så att det andra knät dras fram medan det första sträcks ut bakåt.","Fortsätt i ett jämnt tempo som om du sprang på stället.","Andas lugnt och jämnt."],
 m:["Höften sticker upp.","Du hoppar för mycket eller tappar kroppsspänningen.","Händerna flyttas framåt."],
 t:"Är det för tungt: gör det långsamt. Är det för lätt: öka tempot."},
lyingcurl:{s:["Lägg dig på mage på maskinen med knäna precis utanför bänkens kant och kudden strax ovanför hälarna.","Greppa handtagen och spänn magen. Höften ligger mot bänken.","Andas ut och böj knäna och dra hälarna mot rumpan.","Pausa en sekund och pressa ihop baksidan av låren.","Andas in och sänk långsamt tills benen är nästan raka.","Lyft inte höften från bänken."],
 m:["Höften lyfter från bänken.","Du rycker och svingar vikten.","Du sänker för snabbt."],
 t:"Håll tempot lugnt. Du kan flytta tårna för att variera arbetet."},
legcurl:{s:["Lägg dig på mage på maskinen med knäna precis utanför bänkens kant och kudden strax ovanför hälarna.","Greppa handtagen och spänn magen. Höften ligger mot bänken.","Andas ut och böj knäna och dra hälarna mot rumpan.","Pausa en sekund och pressa ihop baksidan av låren.","Andas in och sänk långsamt tills benen är nästan raka.","Lyft inte höften från bänken."],
 m:["Höften lyfter från bänken.","Du rycker och svingar vikten.","Du sänker för snabbt."],
 t:"Håll tempot lugnt och kontrollerat."},
seatedcurl:{s:["Sätt dig i maskinen med ryggen mot ryggstödet och benen sträckta, med kudden strax ovanför hälarna.","Justera lårkudden så att den ligger fast mot låren.","Greppa handtagen och spänn magen.","Andas ut och böj knäna och dra hälarna ned och bakåt mot sätet.","Pausa en sekund och pressa ihop baksidan av låren.","Andas in och släpp upp långsamt tills benen är nästan raka."],
 m:["Du lyfter rumpan från sätet.","Du rycker och svingar.","Du sänker för snabbt."],
 t:"Den sittande varianten sträcker baksidan av låren mer i startläget."},
legext:{s:["Sätt dig i maskinen med ryggen mot ryggstödet och knäna i linje med maskinens axel.","Placera kudden strax ovanför fotlederna och greppa handtagen.","Spänn magen och håll rumpan mot sätet.","Andas ut och sträck knäna tills benen är nästan raka.","Pausa en sekund och pressa ihop framsidan av låren.","Andas in och sänk långsamt tillbaka utan att släppa vikten."],
 m:["Du rycker fram vikten och låser knäna hårt.","Rumpan lyfter från sätet.","Du sänker för snabbt."],
 t:"En bra isoleringsövning för framsidan av låret. Använd måttlig vikt."},
goblet:{s:["Stå med fötterna lite bredare än axlarna och tårna lätt utåt. Håll en hantel lodrätt mot bröstet med båda händerna.","Armbågarna pekar nedåt. Håll bröstet uppe och spänn magen.","Andas in och sänk dig genom att böja knäna och höften samtidigt.","Gå så djupt du kan med rak rygg. Armbågarna kan nudda insidan av knäna.","Håll knäna i linje med tårna och hälarna i golvet.","Andas ut och pressa dig upp genom hela foten."],
 m:["Knäna faller inåt.","Hälarna lyfter eller ryggen rundas.","Överkroppen lutar framåt."],
 t:"Den bästa övningen för att lära sig knäböjen med bra teknik."},
stepup:{s:["Stå framför en stabil bänk eller låda med en hantel i varje hand. Sätt ena foten helt på lådan.","Lådans höjd ska vara så att knät är böjt ca 90°.","Spänn magen och stå upprätt.","Andas ut och pressa dig upp genom foten på lådan tills benet är rakt.","Använd inte det bakre benet för att trycka ifrån.","Andas in och sänk kontrollerat ned. Gör alla repetitioner med samma ben och byt sedan."],
 m:["Du trycker ifrån med det bakre benet.","Du lutar överkroppen framåt.","Du låter knäet falla inåt."],
 t:"Är det för lätt: höj lådan eller använd tyngre hantlar."},
seatedleg:{s:["Sitt på kanten av en bänk med händerna greppande bänken vid sidorna av rumpan. Luta överkroppen lätt bakåt.","Sträck benen framåt strax ovanför golvet.","Spänn magen.","Andas ut och dra upp knäna mot bröstet samtidigt som du lutar överkroppen framåt.","Pausa en sekund.","Andas in och sträck ut benen igen utan att ställa fötterna i golvet."],
 m:["Du svingar benen.","Du rundar ryggen för mycket.","Du släpper spänningen i botten."],
 t:"Är det för tungt: böj knäna hela tiden. Är det för lätt: håll benen raka."}
};

/* Övningsinfo: rubrik som fälls ut med bilder och steg-för-steg-instruktioner */
(function(){
  const st=document.createElement('style');
  st.textContent=`
  details.exd{background:transparent;padding:0;margin:0;border-radius:0}
  details.exd>summary{list-style:none;cursor:pointer;padding:0;min-height:0;display:block;font-weight:inherit}
  details.exd>summary::-webkit-details-marker{display:none}
  details.exd>summary h3{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px}
  details.exd>summary h3 .chip{margin-left:0}
  .exi{margin-left:auto;font-size:12px;color:var(--blue);font-weight:700;white-space:nowrap}
  details.exd[open] .exi{color:var(--mute)}
  .exbody{background:var(--bg);border-radius:12px;padding:10px 12px;margin:8px 0}
  .exfig{display:flex;gap:8px}
  .exfig figure{margin:0;flex:1;background:#131a24;border-radius:10px;padding:4px;text-align:center}
  .exfig svg{width:100%;height:auto;display:block}
  .exfig figcaption{font-size:12px;color:var(--mute);font-weight:700}
  .exbody h4{margin:12px 0 4px;font-size:15px}
  .exbody ol,.exbody ul{margin:4px 0;padding-left:20px}
  .exbody li{margin:6px 0;font-size:15px}
  .extip{background:var(--card2);border-radius:10px;padding:8px 10px;font-size:14px;margin:10px 0 4px}
  .exnote{font-size:12px;margin:8px 0 0}
  `;
  document.head.appendChild(st);
})();
function exFigHtml(id){
  const po=typeof PO!=='undefined'?PO[id]:null;if(!po)return '';
  let figs='';
  try{
    if(po.v==='raw')figs=`<figure>${fSvg('raw',po.svg)}<figcaption>Position</figcaption></figure>`;
    else{
      const a=fSvg(po.v,po.a,null,po.eq,po.fl);
      if(po.b)figs=`<figure>${a}<figcaption>Start</figcaption></figure><figure>${fSvg(po.v,po.b,po.a,po.eq,po.fl)}<figcaption>Slut</figcaption></figure>`;
      else figs=`<figure>${a}<figcaption>Position</figcaption></figure>`;
    }
  }catch(e){return '';}
  return `<div class="exfig">${figs}</div>`;
}
function exInfoHtml(id,title,group,maint){
  const info=typeof EXI!=='undefined'?EXI[id]:null;
  const chips=`<span class="chip">${esc(group)}</span>${maint?'<span class="chip a">underhåll</span>':''}`;
  if(!info)return `<h3>${title}${chips}</h3>`;
  let b=exFigHtml(id);
  b+=`<h4>Så gör du</h4><ol>${info.s.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;
  if(info.m&&info.m.length)b+=`<h4>Vanliga misstag</h4><ul>${info.m.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  if(info.t)b+=`<p class="extip"><b>Tips:</b> ${esc(info.t)}</p>`;
  b+=`<p class="mute exnote">Bilderna är schematiska figurer som visar start- och slutläge.</p>`;
  return `<details class="exd"><summary><h3>${title}${chips}<span class="exi">Teknik ▾</span></h3></summary><div class="exbody">${b}</div></details>`;
}

