// Presentation calculations use only the supplied Model data and engine results.
export const assetAssessments=(results,assetId)=>results.filter(r=>String(r.a.assetId)===String(assetId));
// V1 website totals: the per-assessment cost-benefit rows summed (renderCostBenefit), assessments without a risk curve skipped
export function assetCosts(rows){
 const rs=rows.filter(r=>r.costBenefit&&r.costBenefit.avoided!=null);
 if(!rs.length)return {current:null,proposed:null,delta:null,avoided:null,savings:null,net:null,unpriced:0,failureCur:null,failureProp:null};
 const sum=k=>rs.reduce((s,r)=>s+(r.costBenefit[k]||0),0);
 // task costs: each Model task once per asset even when several assessments credit it (failure costs stay per assessment)
 const cur=new Map(),prop=new Map();
 for(const r of rs)for(const p of r.proposed||[]){const items=p.costItems?.length?p.costItems:[{key:r.id+'|'+p.date+'|'+p.bundle,value:p.cost||0}];for(const c of items){const id=p.kept||p.moved?(c.key.split('|').slice(1).join('|')||c.key):'copy|'+c.key;/* a Model task once; a copy once per date (a shared task's copy and its kept original are two tasks) */prop.set(id,c.value||0);if(p.kept||p.moved)cur.set(id,c.value||0);}}
 const current=[...cur.values()].reduce((s,v)=>s+v,0),proposed=[...prop.values()].reduce((s,v)=>s+v,0),avoided=sum('avoided');
 return {current,proposed,delta:proposed-current,avoided,savings:current-proposed,net:avoided-(proposed-current),unpriced:sum('unpriced'),failureCur:sum('failureCur'),failureProp:sum('failureProp')};
}
// an assessment ranks only when it has a governing HSE/ECON risk curve and a Weibull to plan on (governing CML or a fit)
export const rankable=r=>r.a.scope==='fixed'&&!!r.gov?.measure&&r.L>0&&r.L<1&&!!(r.worstCml||r.a.fit)&&r.feasibility!=='no Weibull fit'&&!!r.expected&&Number.isFinite(r.a.today?.[r.gov.measure==='hse'?'mitHse':'mitEcon']);
export function rankings(all){
 const results=all.filter(rankable);
 const moves=new Map(),assets=new Map();
 for(const r of results){
  if(!assets.has(r.a.assetId))assets.set(r.a.assetId,[]);assets.get(r.a.assetId).push(r);
  for(const p of r.proposed||[])if(p.moved&&p.movedFrom&&p.date){
   const shift=Math.round((Date.parse(p.date)-Date.parse(p.movedFrom))/86400000);if(!shift)continue;
   const key=[r.a.assetId,p.date,p.movedFrom,(p.taskNumbers||[]).slice().sort().join('|')||p.bundle].join('|');
   const prev=moves.get(key);if(prev){prev.held ||=r.exportHold;prev.drivers++;}else moves.set(key,{row:r,task:p,shift,held:r.exportHold,drivers:1});
  }
 }
 const contributors=results.map(row=>{const m=row.gov?.measure,limit=m==='hse'?row.a.cofHse*row.L:m==='econ'?row.a.cofEcon*row.L:null;const risk=m?row.a.today?.[m==='hse'?'mitHse':'mitEcon']:null;return {row,risk,measure:m,ratio:limit>0&&Number.isFinite(risk)?risk/limit:null};}).filter(x=>x.ratio!=null&&x.ratio>0).sort((a,b)=>b.ratio-a.ratio);
 const savings=[...assets.values()].map(rows=>({row:rows.slice().sort((a,b)=>(b.costBenefit?.net||0)-(a.costBenefit?.net||0))[0],...assetCosts(rows),held:rows.some(r=>r.exportHold)})).filter(x=>x.net!=null&&x.net>0&&x.delta!=null).sort((a,b)=>b.net-a.net);
 return {movers:[...moves.values()].sort((a,b)=>Math.abs(b.shift)-Math.abs(a.shift)),contributors,savings};
}
