'use strict';
/* =====================================================================
   Gymlog – kostmodul: måltidsbyggare och kvalitetsmått
   Näringsvärden: Livsmedelsverkets livsmedelsdatabas (CC BY 4.0), fil: livsmedel.json
   Delar globala variabler med index.html (S, ui, fdate, esc, fmtN, fmtD, ...).
   ===================================================================== */
let FDB=null,FDBP=null,KB=null,KERR='';

/* ---------- Stil ---------- */
(function(){
  const st=document.createElement('style');
  st.textContent=`
  .kchips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
  .kchip{background:var(--card2);font-size:14px;padding:8px 12px;min-height:40px;border-radius:99px}
  .kres{display:block;width:100%;text-align:left;background:var(--card2);margin:6px 0;padding:10px 12px;border-radius:12px;font-size:15px}
  .kres small{color:var(--mute)}
  .krow{border-top:1px solid var(--line);padding:10px 0}
  .krow .khead{display:flex;justify-content:space-between;gap:8px;align-items:center}
  .kx{min-height:36px;width:40px;padding:0;background:transparent;color:var(--mute);font-size:20px}
  .kline{display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap}
  .kline input{width:90px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--bg);text-align:center;font-size:18px}
  .kline select{height:44px;border-radius:12px;border:1px solid var(--line);background:var(--bg);padding:0 8px;font-size:16px}
  .ktags{margin-top:4px}
  .ktags .chip{margin:2px 4px 2px 0}
  .kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;margin:8px 0}
  .kgrid div{background:var(--bg);border-radius:12px;padding:8px 2px}
  .kgrid b{display:block;font-size:20px;font-variant-numeric:tabular-nums}
  .kgrid small{font-size:12px}
  .ebar{display:flex;height:14px;border-radius:99px;overflow:hidden;margin:8px 0 4px;background:var(--bg)}
  .ebar i{display:block;height:100%}
  .qrow{display:grid;grid-template-columns:18px 1fr;gap:8px;padding:8px 0;border-top:1px solid var(--line)}
  .qd{display:inline-block;width:14px;height:14px;border-radius:50%;margin-top:4px;background:#4d5f78}
  .qd.g{background:var(--green)} .qd.y{background:var(--amber)} .qd.r{background:var(--red)}
  .qdots{display:inline-flex;gap:3px;margin-left:6px;vertical-align:middle}
  .qdots .qd{width:9px;height:9px;margin:0}
  .kmeal{display:flex;gap:8px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:8px 0}
  .kmeal .kb{display:flex;gap:6px}
  .kmeal button{min-height:40px;padding:0 12px;font-size:14px}
  .qsum{background:var(--bg);border-radius:12px;padding:10px 12px;margin:8px 0;font-size:15px}
  `;
  document.head.appendChild(st);
})();

/* ---------- Databas ---------- */
function kLoad(){
  if(FDB)return Promise.resolve(FDB);
  if(!FDBP)FDBP=fetch('livsmedel.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(d=>{kPrep(d);FDB=d;KERR='';return d;}).catch(e=>{FDBP=null;KERR=String(e.message||e);throw e;});
  return FDBP;
}
function kPrep(d){
  d.byId={};d.cpSet=new Set(d.cp);d.pinLabel={};d.pinDef={};
  d.pins.forEach(p=>{d.pinLabel[String(p[0])]=p[1];d.pinDef[String(p[0])]=p[2];});
  d.foods=d.foods.map(r=>{
    const v={};d.keys.forEach((k,i)=>{v[k]=r[3+i];});
    const id=String(r[0]);
    const o={id,n:r[1],g:r[2],v,cpf:d.cpSet.has(r[2])?1:0,lc:r[1].toLowerCase()+' '+(d.alias[id]||'')};
    d.byId[id]=o;return o;
  });
}
function kCF(id){return (S.cfoods||[]).find(c=>c.id===id&&!c.del);}
function kFood(id){
  id=String(id);
  if(id.startsWith('c_')){const c=kCF(id);return c?{id,n:c.n,v:c.per,cpf:c.cpf||0,custom:true}:null;}
  return FDB&&FDB.byId[id]||null;
}
function kName(f){return f?((FDB&&FDB.pinLabel[f.id])||f.n):'?';}

/* ---------- Enheter ---------- */
function kUnits(id){
  const out=[['g',1]];
  ((FDB&&FDB.units[id])||[]).forEach(u=>out.push(u));
  const cf=kCF(id);if(cf&&cf.units)cf.units.forEach(u=>out.push(u));
  (S.units||[]).filter(x=>x.fid===id&&!x.del).forEach(x=>out.push([x.u,x.g]));
  return out;
}
function kUnitG(id,u){
  if(!u||u==='g')return 1;
  const m=kUnits(id).slice().reverse().find(x=>x[0]===u);
  return m?m[1]:1;
}
function kItemG(it){return (+it.amt||0)*kUnitG(it.id,it.u);}

/* ---------- Beräkning ---------- */
function kZero(){const T={g:0,cp:0,miss:{}};FDB.keys.forEach(k=>{T[k]=0;});return T;}
function kSum(items){
  const T=kZero();
  items.forEach(it=>{
    const f=kFood(it.id);if(!f)return;
    const g=kItemG(it);T.g+=g;
    FDB.keys.forEach(k=>{const v=f.v[k];if(v===null||v===undefined){T.miss[k]=(T.miss[k]||0)+1;}else T[k]+=v*g/100;});
    T.cp+=((f.v.p||0)*g/100)*(f.cpf||0);
  });
  return T;
}
function kRound(x,d){const m=Math.pow(10,d===undefined?1:d);return Math.round((x||0)*m)/m;}
function kLvl(l){return l==='g'?'g':l==='y'?'y':l==='r'?'r':'n';}

/* Kvalitetsregler: transparenta riktvärden, se "Så bedöms det" i appen */
function kQuality(T,peri){
  const kcal=T.kcal,rows=[];
  if(!(kcal>0))return {rows,good:[],watch:[]};
  const miss=k=>T.miss&&T.miss[k]?` (data saknas för ${T.miss[k]} ingrediens${T.miss[k]>1?'er':''})`:'';
  const dens=T.p/kcal*100,cps=T.p>0?T.cp/T.p:0,fd=T.fib/kcal*100,sE=4*T.fsug/kcal*100,tE=9*T.sat/kcal*100,sd=T.salt/kcal*100;
  rows.push({k:'p',label:'Protein',lvl:dens>=6?'g':dens>=3?'y':'n',val:`${fmtD(T.p)} g · ${fmtD(dens)} g per 100 kcal`,
    ex:'Bra proteintäthet: minst 6 g per 100 kcal (som kvarg och ägg).'+(dens<3?' Lite protein i förhållande till energin. Komplettera gärna med kvarg, ägg eller mjölk.':'')+(T.p>=3?` ${Math.round(cps*100)} % av proteinet kommer från kompletta källor (mjölk, ägg, kött, fisk).`:'')});
  rows.push({k:'fib',label:'Fibrer',lvl:peri?'n':fd>=1.3?'g':fd>=0.6?'y':'r',val:`${fmtD(T.fib)} g · ${fmtD(fd)} g per 100 kcal`+miss('fib'),
    ex:peri?'Kring träning är fibrer inte viktiga, de kan till och med ge magbesvär.':'Mål: minst ca 1,3 g per 100 kcal, vilket ger 25–35 g per dag.',c:'fib'});
  rows.push({k:'sug',label:'Fritt socker',lvl:peri?'n':sE<=5?'g':sE<=10?'y':'r',val:`${fmtD(T.fsug)} g · ${fmtD(sE)} % av energin`+miss('fsug'),
    ex:peri?'Snabba kolhydrater är okej kring träning.':'Riktvärde: fritt socker (inkl. honung) under 10 % av energin per dag.',c:'fsug'});
  rows.push({k:'sat',label:'Mättat fett',lvl:tE<=10?'g':tE<=15?'y':'r',val:`${fmtD(T.sat)} g · ${fmtD(tE)} % av energin`+miss('sat'),
    ex:'Riktvärde: mättat fett under 10 % av energin per dag.',c:'sat'});
  rows.push({k:'salt',label:'Salt',lvl:sd<=0.25?'g':sd<=0.4?'y':'r',val:`${fmtD(T.salt)} g · ${fmtD(sd)} g per 100 kcal`+miss('salt'),
    ex:'Riktvärde: högst 6 g salt per dag, ca 0,2 g per 100 kcal.',c:'salt'});
  rows.push({k:'wg',label:'Fullkorn',lvl:T.wg>=25?'g':'n',val:`${fmtN(T.wg)} g`,ex:'Dagsmål: ca 70–90 g fullkorn.'});
  const o3=T.ala+T.epa+T.dha;
  if(o3>0.05)rows.push({k:'o3',label:'Omega-3',lvl:'n',val:`${fmtD(o3)} g`,ex:'Från bland annat fet fisk, rapsolja och chiafrön.'});
  const good=rows.filter(r=>r.lvl==='g').map(r=>r.label.toLowerCase());
  const watch=rows.filter(r=>r.lvl==='r'||r.lvl==='y').map(r=>r.label.toLowerCase());
  return {rows,good,watch,sE,tE};
}
function kContrib(items,key){
  const arr=items.map(it=>{const f=kFood(it.id);return {n:kName(f),v:(f&&f.v[key]!=null)?f.v[key]*kItemG(it)/100:0};}).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const tot=arr.reduce((a,x)=>a+x.v,0);if(!tot)return '';
  return arr.slice(0,2).map(x=>`${esc(x.n)} ${fmtD(x.v)} g (${Math.round(x.v/tot*100)} %)`).join(', ');
}
function kTags(f){
  const v=f.v,kc=v.kcal||0;if(kc<25)return [];
  const t=[];
  if((v.p||0)/kc*100>=6)t.push(['mycket protein','g']);
  if((v.fib||0)/kc*100>=1.3)t.push(['fiberrik','g']);
  if((v.wg||0)>=50)t.push(['fullkorn','g']);
  if(4*(v.fsug||0)/kc*100>10)t.push(['fritt socker','y']);
  if(9*(v.sat||0)/kc*100>15)t.push(['mycket mättat fett','r']);
  if((v.salt||0)/kc*100>0.4)t.push(['saltrik','y']);
  return t;
}
function kTagHtml(f){return kTags(f).map(t=>`<span class="chip ${t[1]==='g'?'g':t[1]==='r'?'r':'a'}">${t[0]}</span>`).join('');}

/* ---------- Utkast ---------- */
function kbInit(){
  if(KB)return;
  let d=null;try{d=JSON.parse(localStorage.getItem('gymlog_kdraft')||'null');}catch(e){}
  KB=Object.assign({name:'',items:[],peri:false,q:'',pick:null,editCf:null},d||{});
  KB.q='';KB.pick=null;
  if(!Array.isArray(KB.items))KB.items=[];
}
function kbSave(){try{localStorage.setItem('gymlog_kdraft',JSON.stringify({name:KB.name,items:KB.items,peri:KB.peri,editCf:KB.editCf}));}catch(e){}}

/* ---------- Sökning ---------- */
function kSearch(q){
  q=q.trim().toLowerCase();if(!q)return [];
  const toks=q.split(/\s+/);
  const all=FDB.foods.concat((S.cfoods||[]).filter(c=>!c.del).map(c=>({id:c.id,n:c.n,v:c.per,cpf:c.cpf||0,custom:true,lc:c.n.toLowerCase()})));
  const res=[];
  all.forEach(f=>{
    const hay=((FDB.pinLabel[f.id]||'')+' '+f.n+' '+f.lc).toLowerCase();
    let s=0;
    for(const t of toks){
      const esc2=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(new RegExp('(^|[\\s,.\\-/(])'+esc2).test(hay))s+=3;
      else if(hay.includes(t))s+=1;
      else return;
    }
    if(f.custom)s+=4;
    if(FDB.pinLabel[f.id])s+=3;
    if(f.lc.startsWith(toks[0]))s+=2;
    res.push([s,f]);
  });
  res.sort((a,b)=>b[0]-a[0]||a[1].n.length-b[1].n.length);
  return res.slice(0,12).map(x=>x[1]);
}
function kResultsHtml(q){
  if(!q.trim())return '';
  const r=kSearch(q);
  if(!r.length)return '<p class="mute" style="font-size:14px">Inga träffar. Rå frukt och nötter finns inte i listan, men du kan skapa en egen produkt längst ned.</p>';
  return r.map(f=>{const v=f.v||{};return `<button class="kres" data-act="kpick" data-id="${esc(f.id)}"><b>${esc(kName(f))}</b>${f.custom?' <span class="chip b">egen</span>':''}<br><small>${fmtN(v.kcal||0)} kcal · ${fmtD(v.p||0)} g protein · ${fmtD(v.fib||0)} g fibrer per 100 g</small><div class="ktags">${kTagHtml(f)}</div></button>`;}).join('');
}

/* ---------- Vyer ---------- */
function viewBuild(){
  if(!FDB){
    kLoad().then(()=>{if(ui.tab==='food'&&ui.fv==='build')render();}).catch(()=>{if(ui.tab==='food'&&ui.fv==='build')render();});
    return KERR?`<div class="card"><p class="err">Kunde inte läsa livsmedelsdatabasen (${esc(KERR)}).</p><button class="pri" data-act="kretry">Försök igen</button></div>`
      :'<div class="card"><p class="mute">Laddar livsmedelsdatabasen …</p><p class="mute" style="font-size:13px">Första gången behövs internet. Därefter fungerar den offline.</p></div>';
  }
  kbInit();
  const dlab=fdate===today()?'idag':fd(fdate);
  let h=`<h2>Bygg måltid</h2><p class="mute" style="font-size:14px">Välj ingredienser och mängd, så räknas kalorier, protein, fibrer och kvalitet ut. Loggas på: <b>${esc(dlab)}</b></p>`;
  const meals=(S.meals||[]).filter(m=>!m.del);
  if(meals.length){
    h+=`<div class="card"><h3>Mina måltider</h3>`;
    meals.forEach(m=>{
      const T=kSum(m.items);
      h+=`<div class="kmeal"><span><b>${esc(m.n)}</b><br><small class="mute">${fmtN(T.kcal)} kcal · ${fmtD(T.p)} g protein · ${fmtD(T.fib)} g fibrer</small></span><span class="kb"><button class="pri" data-act="kmeallog" data-id="${m.id}">Logga</button><button class="ghost" data-act="kmealedit" data-id="${m.id}" aria-label="Redigera">✎</button><button class="ghost" data-act="kmealdel" data-id="${m.id}" aria-label="Ta bort">✕</button></span></div>`;
    });
    h+=`</div>`;
  }
  const cfs=(S.cfoods||[]).filter(c=>!c.del);
  h+=`<div class="card"><h3>Lägg till ingrediens</h3><div class="kchips">${FDB.pins.map(p=>`<button class="kchip" data-act="kpin" data-id="${p[0]}">${esc(p[1])}</button>`).join('')}${cfs.map(c=>`<button class="kchip" data-act="kpick" data-id="${c.id}" style="outline:1px solid var(--blue)">${esc(c.n)}</button>`).join('')}</div>
  <label class="f">Sök bland 2 400 livsmedel<input id="kq" type="text" data-kb="q" placeholder="t.ex. kyckling, ris, lax" autocomplete="off" value="${esc(KB.q)}"></label><div id="kres">${kResultsHtml(KB.q)}</div></div>`;
  if(KB.pick){
    const f=kFood(KB.pick.id);
    if(f){
      const uo=kUnits(f.id).map(u=>u[0]).filter((u,i,a)=>a.indexOf(u)===i);
      h+=`<div class="card" style="outline:2px solid var(--blue)"><h3>${esc(kName(f))}</h3><div class="ktags">${kTagHtml(f)}</div>
      <div class="kline"><input id="kpa" type="text" inputmode="decimal" data-kb="pa" value="${KB.pick.amt===''?'':esc(KB.pick.amt)}" aria-label="Mängd"><select data-kb="pu" aria-label="Enhet">${uo.map(u=>`<option${u===KB.pick.u?' selected':''}>${esc(u)}</option>`).join('')}</select><button class="pri" data-act="kadd">Lägg till</button><button class="ghost" data-act="kcancel">Avbryt</button></div>
      <div class="mute" id="kpv" style="margin-top:6px;font-size:14px">${kPickPreview()}</div>
      <details><summary>Egen enhet</summary><p class="mute" style="font-size:13px">Ange till exempel "fralla" och hur många gram den väger.</p><div class="kline"><input id="kun" type="text" placeholder="enhet" style="width:120px"><input id="kug" type="text" inputmode="decimal" placeholder="gram"><button class="ghost" data-act="kunit">Spara enhet</button></div></details></div>`;
    }
  }
  h+=`<div class="card"><h3>Ingredienser</h3>`;
  if(!KB.items.length)h+=`<p class="mute">Inga ingredienser än. Tryck på en av dina vanliga råvaror eller sök ovan.</p>`;
  KB.items.forEach((it,i)=>{
    const f=kFood(it.id);if(!f)return;
    const uo=kUnits(it.id).map(u=>u[0]).filter((u,j,a)=>a.indexOf(u)===j);
    h+=`<div class="krow"><div class="khead"><b>${esc(kName(f))}</b><button class="kx" data-act="kdel" data-i="${i}" aria-label="Ta bort">✕</button></div>
    <div class="kline"><input type="text" inputmode="decimal" data-kb="amt" data-i="${i}" value="${it.amt===''?'':esc(it.amt)}" aria-label="Mängd"><select data-kb="unit" data-i="${i}" aria-label="Enhet">${uo.map(u=>`<option${u===it.u?' selected':''}>${esc(u)}</option>`).join('')}</select><span class="mute" id="kr${i}" style="font-size:14px">${kRowText(it)}</span></div><div class="ktags">${kTagHtml(f)}</div></div>`;
  });
  if(KB.items.length)h+=`<div style="margin-top:8px"><button class="ghost" data-act="kclear">Töm måltiden</button></div>`;
  h+=`</div>`;
  h+=`<label class="chk2"><input type="checkbox" data-kb="peri"${KB.peri?' checked':''}> Måltid kring träning (före eller efter)</label>`;
  h+=`<div id="kcalc">${kCalcHtml()}</div>`;
  h+=`<div class="card"><h3>Spara och logga</h3>
  <label class="f">Namn på måltiden<input id="kname" type="text" data-kb="name" placeholder="t.ex. Frukost" value="${esc(KB.name)}" autocomplete="off"></label>
  <button class="pri" data-act="klog" style="width:100%;margin-top:10px">Lägg till i dagens logg</button>
  <div style="display:flex;gap:8px;margin-top:8px"><button class="ghost" data-act="ksavemeal" style="flex:1">Spara som måltid</button></div>
  <details><summary>Spara som recept eller produkt</summary><p class="mute" style="font-size:14px">För hemmagjorda saker som granola. Ange färdig vikt efter tillagning (ugnen tar bort vatten), så blir värdena per 100 g rätt. Därefter kan du lägga till den som en ingrediens.</p>
  <div class="fields"><label class="f">Färdig vikt (g)<input id="kyield" type="text" inputmode="decimal" placeholder="${fmtN(kSum(KB.items).g)}"></label><label class="f">En portion (g, valfritt)<input id="kport" type="text" inputmode="decimal" placeholder="40"></label></div>
  <button class="ghost" data-act="ksaverec" style="width:100%;margin-top:10px">${KB.editCf?'Uppdatera receptet':'Spara som recept'}</button></details></div>`;
  if(cfs.length){
    h+=`<details><summary>Mina recept och egna produkter</summary>${cfs.map(c=>`<div class="kmeal"><span><b>${esc(c.n)}</b><br><small class="mute">${fmtN(c.per.kcal||0)} kcal · ${fmtD(c.per.p||0)} g protein per 100 g</small></span><span class="kb">${c.rec?`<button class="ghost" data-act="kcfedit" data-id="${c.id}" aria-label="Redigera">✎</button>`:''}<button class="ghost" data-act="kcfdel" data-id="${c.id}" aria-label="Ta bort">✕</button></span></div>`).join('')}</details>`;
  }
  h+=`<details><summary>Ny egen produkt (från förpackning)</summary><p class="mute" style="font-size:14px">Skriv in värdena per 100 g från näringsdeklarationen.</p>
  <label class="f">Namn<input id="cfn" type="text" autocomplete="off"></label>
  <div class="fields" style="margin-top:8px"><label class="f">Kcal<input id="cfk" type="text" inputmode="decimal"></label><label class="f">Protein (g)<input id="cfp" type="text" inputmode="decimal"></label>
  <label class="f">Kolhydrater (g)<input id="cfc" type="text" inputmode="decimal"></label><label class="f">Fett (g)<input id="cff" type="text" inputmode="decimal"></label>
  <label class="f">varav mättat (g)<input id="cfs" type="text" inputmode="decimal"></label><label class="f">varav sockerarter (g)<input id="cfg" type="text" inputmode="decimal"></label>
  <label class="f">varav tillsatt socker (g)<input id="cfa" type="text" inputmode="decimal"></label><label class="f">Fibrer (g)<input id="cfi" type="text" inputmode="decimal"></label>
  <label class="f">Salt (g)<input id="cfz" type="text" inputmode="decimal"></label><label class="f">1 portion/st (g, valfritt)<input id="cfu" type="text" inputmode="decimal"></label></div>
  <button class="pri" data-act="kcfsave" style="width:100%;margin-top:10px">Spara produkt</button></details>`;
  h+=`<p class="mute" style="font-size:12px;margin-top:14px">Näringsvärden: ${esc(FDB.src)}, version ${esc(FDB.date)}. Värdena gäller råvikt eller tillagad vikt enligt namnet. Kontrollera alltid om du väger maten rå eller tillagad. Rå frukt och nötter finns inte i listan.</p>`;
  return h;
}
function kPickPreview(){
  if(!KB.pick)return '';
  const f=kFood(KB.pick.id);if(!f)return '';
  const g=(+KB.pick.amt||0)*kUnitG(f.id,KB.pick.u),v=f.v||{};
  return `= ${fmtN(g)} g · ${fmtN((v.kcal||0)*g/100)} kcal · ${fmtD((v.p||0)*g/100)} g protein · ${fmtD((v.fib||0)*g/100)} g fibrer`;
}
function kRowText(it){
  const f=kFood(it.id);if(!f)return '';
  const g=kItemG(it),v=f.v||{};
  return `= ${fmtN(g)} g · ${fmtN((v.kcal||0)*g/100)} kcal · ${fmtD((v.p||0)*g/100)} g protein`;
}
function kCalcHtml(){
  const items=KB.items;
  if(!items.length)return '';
  const T=kSum(items),Q=kQuality(T,KB.peri);
  const eP=4*T.p,eC=4*T.c,eF=9*T.fat,eA=7*T.alc,eT=eP+eC+eF+eA||1;
  let h=`<div class="card"><h3>Summa</h3><div class="kgrid"><div><b>${fmtN(T.kcal)}</b><small>kcal</small></div><div><b>${fmtD(T.p)}</b><small>protein g</small></div><div><b>${fmtD(T.c)}</b><small>kolhydr. g</small></div><div><b>${fmtD(T.fat)}</b><small>fett g</small></div></div>
  <div class="mute" style="font-size:14px">Fibrer ${fmtD(T.fib)} g · mättat fett ${fmtD(T.sat)} g · sockerarter ${fmtD(T.sug)} g (varav fritt ${fmtD(T.fsug)} g) · salt ${fmtD(T.salt)} g · vikt ${fmtN(T.g)} g</div>
  <div class="ebar"><i style="width:${eP/eT*100}%;background:var(--blue)"></i><i style="width:${eC/eT*100}%;background:var(--amber)"></i><i style="width:${eF/eT*100}%;background:var(--red)"></i>${eA?`<i style="width:${eA/eT*100}%;background:#9b8cff"></i>`:''}</div>
  <small class="mute">Energi: <span style="color:var(--blue)">protein ${Math.round(eP/eT*100)} %</span> · <span style="color:var(--amber)">kolhydrater ${Math.round(eC/eT*100)} %</span> · <span style="color:var(--red)">fett ${Math.round(eF/eT*100)} %</span></small></div>`;
  h+=`<div class="card"><h3>Hur bra är måltiden?</h3>`;
  const sugK=4*T.fsug,satK=9*T.sat;
  h+=`<div class="qsum">${Q.good.length?`<b>Styrkor:</b> ${esc(Q.good.join(', '))}. `:''}${Q.watch.length?`<b>Att tänka på:</b> ${esc(Q.watch.join(', '))}.`:''}${!Q.good.length&&!Q.watch.length?'Inget som sticker ut.':''}<br><small class="mute">Av ${fmtN(T.kcal)} kcal kommer ${fmtN(sugK)} kcal (${Math.round(sugK/T.kcal*100)} %) från fritt socker och ${fmtN(satK)} kcal (${Math.round(satK/T.kcal*100)} %) från mättat fett.</small></div>`;
  Q.rows.forEach(r=>{
    const ct=r.c?kContrib(items,r.c):'';
    h+=`<div class="qrow"><span class="qd ${kLvl(r.lvl)}"></span><div><b>${esc(r.label)}</b> <span>${esc(r.val)}</span><br><small class="mute">${esc(r.ex)}</small>${ct&&(r.lvl==='r'||r.lvl==='y')?`<br><small>Störst bidrag: ${ct}</small>`:''}</div></div>`;
  });
  h+=`<details><summary>Så bedöms det</summary><ul>
  <li><b>Grönt, gult, rött</b> är riktvärden, inte domar. De bygger på allmänna näringsrekommendationer och gäller egentligen hela dagen.</li>
  <li><b>Protein:</b> grönt från 6 g per 100 kcal, gult från 3 g. Lägre än så markeras grått, eftersom kolhydratrika måltider inte är dåliga, men du får se att proteinet behöver komplettas.</li>
  <li><b>Fibrer:</b> grönt från 1,3 g per 100 kcal, gult från 0,6 g.</li>
  <li><b>Fritt socker:</b> grönt upp till 5 % av energin, gult upp till 10 %. Honung och sirap räknas som fritt socker.</li>
  <li><b>Mättat fett:</b> grönt upp till 10 % av energin, gult upp till 15 %.</li>
  <li><b>Salt:</b> grönt upp till 0,25 g per 100 kcal, gult upp till 0,4 g.</li>
  <li><b>Kring träning</b> bedöms inte fibrer och socker, eftersom snabba kolhydrater då är okej.</li>
  <li>Rött betyder inte att maten är förbjuden. Det visar vad som bidrar mest, så att du kan balansera resten av dagen.</li></ul></details></div>`;
  return h;
}
function kRefreshCalc(){const el=$('#kcalc');if(el)el.innerHTML=kCalcHtml();}

/* ---------- Dagsvy och kvalitetsprickar i loggen ---------- */
function kDayAgg(ds){
  const d=S.food[ds];if(!d||!FDB)return null;
  const T=kZero();let all=0,an=0,peri=false;
  d.entries.forEach(e=>{if(e.del)return;all+=+e.k||0;if(e.v){an+=e.v.kcal||0;FDB.keys.forEach(k=>{T[k]+=+e.v[k]||0;});T.cp+=+e.v.cp||0;T.g+=+e.v.g||0;}});
  return an>0?{T,all,an}:null;
}
function kostDayQuality(ds){
  if(!FDB)return '';
  const a=kDayAgg(ds);if(!a)return '';
  const Q=kQuality(a.T,false),cov=Math.round(a.an/Math.max(a.all,1)*100);
  const tg=targetsFor(ds)||{};
  let h=`<details><summary>Dagens kvalitet</summary><p class="mute" style="font-size:13px">Bygger på måltider som är byggda från ingredienser (${cov} % av dagens loggade kalorier).${cov<100?' Manuellt inmatade poster ingår inte.':''}</p>`;
  Q.rows.filter(r=>['p','fib','sug','sat','salt'].includes(r.k)).forEach(r=>{h+=`<div class="qrow"><span class="qd ${kLvl(r.lvl)}"></span><div><b>${esc(r.label)}</b> <span>${esc(r.val)}</span></div></div>`;});
  const T=a.T;
  h+=`<div class="qrow"><span class="qd ${T.fib>=25?'g':'n'}"></span><div><b>Fibrer hittills</b> ${fmtD(T.fib)} g av 25–35 g</div></div>`;
  h+=`<div class="qrow"><span class="qd ${T.wg>=70?'g':'n'}"></span><div><b>Fullkorn hittills</b> ${fmtN(T.wg)} g av ca 70–90 g</div></div>`;
  h+=`<div class="qrow"><span class="qd ${T.salt>6?'r':'n'}"></span><div><b>Salt hittills</b> ${fmtD(T.salt)} g (högst 6 g)</div></div></details>`;
  return h;
}
function kostDots(e){
  if(!e.v||!FDB)return '';
  const Q=kQuality(Object.assign({},e.v,{cp:e.v.cp||0,miss:{}}),e.peri);
  const pick=['p','fib','sug','sat'].map(k=>Q.rows.find(r=>r.k===k)).filter(Boolean);
  return `<span class="qdots" title="protein, fibrer, socker, mättat fett">${pick.map(r=>`<i class="qd ${kLvl(r.lvl)}"></i>`).join('')}</span>`;
}

/* ---------- Skapa loggpost ---------- */
function kEntryFrom(items,name,peri){
  const T=kSum(items),v={};
  FDB.keys.forEach(k=>{v[k]=kRound(T[k],2);});v.cp=kRound(T.cp,2);v.g=Math.round(T.g);
  return {id:uid(),n:name||'Måltid',p:kRound(T.p,1),k:Math.round(T.kcal),f:kRound(T.fib,1),v,peri:!!peri,
    it:items.map(i=>({n:kName(kFood(i.id)),g:Math.round(kItemG(i))})),updatedAt:Date.now()};
}
function kLogItems(items,name,peri){
  const d=fday(fdate,true);
  d.entries.push(kEntryFrom(items,name,peri));
  ftouch(d);
}

/* ---------- Händelser ---------- */
function kostAct(a,t,e){
  if(!a||a[0]!=='k')return false;
  if(a==='kretry'){FDBP=null;KERR='';render();return true;}
  if(!FDB)return false;
  kbInit();
  const num=id=>{const el=$('#'+id);return el?parseNum(el.value):'';};
  if(a==='kpin'||a==='kpick'){
    const id=t.dataset.id,def=FDB.pinDef[id];
    KB.pick={id,amt:def?def[0]:100,u:def?def[1]:'g'};
    render();const pe=$('#kpa');if(pe)pe.scrollIntoView({block:'center'});return true;
  }
  if(a==='kcancel'){KB.pick=null;render();return true;}
  if(a==='kadd'){
    if(!KB.pick)return true;
    if(!(+KB.pick.amt>0)){toast('Fyll i en mängd');return true;}
    KB.items.push({id:KB.pick.id,amt:+KB.pick.amt,u:KB.pick.u});
    KB.pick=null;KB.q='';kbSave();render();toast('Tillagd');return true;
  }
  if(a==='kdel'){KB.items.splice(+t.dataset.i,1);kbSave();render();return true;}
  if(a==='kclear'){if(confirm('Tömma måltiden?')){KB.items=[];KB.name='';KB.editCf=null;kbSave();render();}return true;}
  if(a==='kunit'){
    const u=($('#kun').value||'').trim(),g=num('kug');
    if(!u||!(g>0)||!KB.pick){toast('Fyll i namn och gram');return true;}
    S.units=S.units||[];S.units.push({id:uid(),fid:KB.pick.id,u,g,updatedAt:Date.now()});
    KB.pick.u=u;persist();queueSync();render();toast('Enhet sparad');return true;
  }
  if(a==='klog'){
    if(!KB.items.length){toast('Lägg till ingredienser först');return true;}
    const nm=(KB.name||'').trim()||'Måltid';
    kLogItems(KB.items,nm,KB.peri);
    KB.items=[];KB.name='';KB.editCf=null;kbSave();ui.fv='log';render();window.scrollTo(0,0);toast('Loggad: '+nm);return true;
  }
  if(a==='ksavemeal'){
    const nm=(KB.name||'').trim();
    if(!KB.items.length||!nm){toast('Ange namn och ingredienser');return true;}
    S.meals=S.meals||[];
    S.meals.push({id:uid(),n:nm,items:KB.items.map(i=>({id:i.id,amt:i.amt,u:i.u})),peri:!!KB.peri,updatedAt:Date.now()});
    persist();queueSync();render();toast('Måltid sparad');return true;
  }
  if(a==='kmeallog'){
    const m=(S.meals||[]).find(x=>x.id===t.dataset.id);if(!m)return true;
    kLogItems(m.items,m.n,m.peri);ui.fv='log';render();window.scrollTo(0,0);toast('Loggad: '+m.n);return true;
  }
  if(a==='kmealedit'){
    const m=(S.meals||[]).find(x=>x.id===t.dataset.id);if(!m)return true;
    KB.items=m.items.map(i=>({id:i.id,amt:i.amt,u:i.u}));KB.name=m.n;KB.peri=!!m.peri;KB.editCf=null;kbSave();render();window.scrollTo(0,0);return true;
  }
  if(a==='kmealdel'){
    const m=(S.meals||[]).find(x=>x.id===t.dataset.id);
    if(m&&confirm('Ta bort måltiden "'+m.n+'"?')){m.del=true;m.updatedAt=Date.now();persist();queueSync();render();}return true;
  }
  if(a==='ksaverec'){
    const nm=(KB.name||'').trim();
    if(!KB.items.length||!nm){toast('Ange namn och ingredienser');return true;}
    const T=kSum(KB.items);
    const yld=num('kyield')||T.g,port=num('kport');
    if(!(yld>0)){toast('Fyll i färdig vikt');return true;}
    const per={};FDB.keys.forEach(k=>{per[k]=kRound(T[k]/yld*100,2);});
    const cf={id:KB.editCf||('c_'+uid()),n:nm,per,cpf:T.p>0?kRound(T.cp/T.p,3):0,units:port>0?[['portion',port]]:[],rec:{items:KB.items.map(i=>({id:i.id,amt:i.amt,u:i.u})),yield:yld},updatedAt:Date.now()};
    S.cfoods=S.cfoods||[];
    const ex=S.cfoods.findIndex(c=>c.id===cf.id);
    if(ex>=0)S.cfoods[ex]=cf;else S.cfoods.push(cf);
    KB.editCf=null;KB.items=[];KB.name='';kbSave();persist();queueSync();render();toast('Recept sparat. Sök efter "'+nm+'" för att använda det.');return true;
  }
  if(a==='kcfedit'){
    const c=kCF(t.dataset.id);if(!c||!c.rec)return true;
    KB.items=c.rec.items.map(i=>({id:i.id,amt:i.amt,u:i.u}));KB.name=c.n;KB.editCf=c.id;kbSave();render();window.scrollTo(0,0);toast('Receptet är inläst. Ändra och spara.');return true;
  }
  if(a==='kcfdel'){
    const c=kCF(t.dataset.id);
    if(c&&confirm('Ta bort "'+c.n+'"?')){c.del=true;c.updatedAt=Date.now();persist();queueSync();render();}return true;
  }
  if(a==='kcfsave'){
    const nm=($('#cfn').value||'').trim(),kc=num('cfk');
    if(!nm||kc===''){toast('Ange namn och kcal');return true;}
    const o=(id)=>{const v=num(id);return v===''?null:v;};
    const per={kcal:kc,p:o('cfp'),c:o('cfc'),fat:o('cff'),sat:o('cfs'),sug:o('cfg'),fsug:o('cfa'),fib:o('cfi'),salt:o('cfz')};
    FDB.keys.forEach(k=>{if(!(k in per))per[k]=null;});
    const port=num('cfu');
    S.cfoods=S.cfoods||[];
    S.cfoods.push({id:'c_'+uid(),n:nm,per,cpf:0,units:port>0?[['st',port]]:[],updatedAt:Date.now()});
    persist();queueSync();render();toast('Produkt sparad');return true;
  }
  return false;
}
function kostInput(el){
  const k=el.dataset.kb;if(!k||!FDB)return;kbInit();
  if(k==='q'){KB.q=el.value;const r=$('#kres');if(r)r.innerHTML=kResultsHtml(KB.q);}
  else if(k==='pa'){if(KB.pick){KB.pick.amt=parseNum(el.value);const p=$('#kpv');if(p)p.textContent=kPickPreview();}}
  else if(k==='amt'){const i=+el.dataset.i;if(KB.items[i]){KB.items[i].amt=parseNum(el.value);const s=$('#kr'+i);if(s)s.textContent=kRowText(KB.items[i]);kRefreshCalc();kbSave();}}
  else if(k==='name'){KB.name=el.value;kbSave();}
}
function kostChange(t){
  const k=t.dataset.kb;if(!k||!FDB)return;kbInit();
  if(k==='pu'){if(KB.pick){KB.pick.u=t.value;const p=$('#kpv');if(p)p.textContent=kPickPreview();}}
  else if(k==='unit'){const i=+t.dataset.i;if(KB.items[i]){KB.items[i].u=t.value;const s=$('#kr'+i);if(s)s.textContent=kRowText(KB.items[i]);kRefreshCalc();kbSave();}}
  else if(k==='peri'){KB.peri=t.checked;kbSave();kRefreshCalc();}
}
