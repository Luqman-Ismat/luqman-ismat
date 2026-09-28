// Fresh chart math. Source curves are Model samples, never quantile ladders.
const DAY=86400000;
export const dateDay=s=>Date.parse(s.slice(0,10))/DAY;
export function weibull(segment,index){if(!segment||!(segment.beta>0&&segment.eta>0))return null;const age=index+1-(segment.origin||0)-(segment.gamma||0);return age<=0?0:1-Math.exp(-Math.pow(age/segment.eta,segment.beta));}
export function sourceValue(source,key,absoluteDay){const days=source.days,values=source[key];if(!days?.length||!values)return null;const index=absoluteDay-dateDay(source.start);if(index<days[0]||index>days.at(-1))return null;let lo=0,hi=days.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(days[mid]<=index)lo=mid;else hi=mid-1;}if(days[lo]===index||lo===days.length-1)return values[lo]??null;const a=values[lo],b=values[lo+1];if(a==null||b==null)return null;return a+(b-a)*(index-days[lo])/(days[lo+1]-days[lo]);}
export function divergenceDay(row){const changes=(row.proposed||[]).filter(p=>!p.kept);const blocked=(row.poolBlocked||[]).map(dateDay);if(!changes.length&&!blocked.length)return Infinity;const changedTimes=[...changes.map(p=>dateDay(p.date)),...blocked];for(const e of row.current?.events||[])if(!row.proposed.some(p=>p.kept&&p.date===e.date&&p.bundle===e.bundle))changedTimes.push(dateDay(e.date));return Math.min(...changedTimes);}
// Model's cap: the largest value its stored unmitigated / mitigated curves reach on this measure. No curve is drawn above it.
export function sampleCap(source,measure='pof'){
 const suffix=measure==='pof'?'Pof':measure==='hse'?'Hse':'Econ';
 source._cap||={};
 if(source._cap[suffix]==null){let m=0;for(const k of ['unmit','mit'])for(const v of source[k+suffix]||[])if(v!=null&&v>m)m=v;source._cap[suffix]=m;}
 return source._cap[suffix];
}
export function curveValue(row,source,absoluteDay,series,measure='pof',before=false){
 const v=rawCurveValue(row,source,absoluteDay,series,measure,before);
 if(v==null||series!=='proposed')return v;
 const cap=sampleCap(source,measure);return cap>0?Math.min(v,cap):v;
}
// the consequence on a given day: Model's own (from its stored risk ÷ PoF) where it changes over time, else the assessment's CoF
export function cofAt(row,source,measure,absoluteDay){
 const s=row.a.cofSeries?.[measure],flat=measure==='hse'?row.a.cofHse:row.a.cofEcon;
 if(!s?.length)return flat;
 const idx=absoluteDay-dateDay(source.start);let v=s[0][1];for(const [d,c] of s){if(d<=idx)v=c;else break;}return v;
}
function rawCurveValue(row,source,absoluteDay,series,measure='pof',before=false){
 const suffix=measure==='pof'?'Pof':measure==='hse'?'Hse':'Econ';
 if(series==='unmit')return sourceValue(source,'unmit'+suffix,absoluteDay);
 if(series==='current')return sourceValue(source,'mit'+suffix,absoluteDay);
 const divergence=divergenceDay(row);
 if(absoluteDay<divergence||(before&&absoluteDay===divergence))return sourceValue(source,'mit'+suffix,absoluteDay);
 const a=row.a,w=row.worstCml;let segment=w?{origin:dateDay(w.start)-dateDay(a.start)+1,beta:w.beta,eta:w.eta,gamma:w.gamma}:a.fit?{...a.fit,origin:0}:null;
 // Keep validated past-task state before entering the candidate plan.
 const lastPast=(a.events||[]).filter(e=>dateDay(e.date)<divergence&&(e.fitAfter||e.qMitAfter)&&!row.current?.events?.some(c=>c.date===e.date)).at(-1);if(lastPast?.fitAfter)segment=lastPast.fitAfter;
 for(const p of row.proposed||[]){const pd=dateDay(p.date);if(pd>absoluteDay||(before&&pd===absoluteDay))break;if(p.params)segment=p.params;}
 const pof=weibull(segment,absoluteDay-dateDay(a.start));if(pof==null)return null;return pof*(measure==='pof'?1:cofAt(row,source,measure,absoluteDay));
}
export function chartPoints(row,source,lo,hi){const days=new Set();for(let i=0;i<=500;i++)days.add(lo+(hi-lo)*i/500);for(const d of source.days){const absolute=dateDay(source.start)+d;if(absolute>=lo&&absolute<=hi)days.add(absolute);}const events=new Set();for(const p of [...row.proposed,...(row.current?.events||[])]){const d=dateDay(p.date);if(d>=lo&&d<=hi){days.add(d);events.add(d);}}return [...days].sort((a,b)=>a-b).flatMap(d=>events.has(d)?[{d,before:true},{d,before:false}]:[{d,before:false}]);}
// days at or above the governing PoF limit from today to the horizon (or to the end of Model's stored curve, whichever is first)
export function daysAbove(row,source,today,horizon,series){if(!(row.L>0&&row.L<1))return null;const end=Math.min(dateDay(horizon),dateDay(source.start)+source.days.at(-1));let count=0;for(let d=dateDay(today);d<=end;d++){const v=curveValue(row,source,d,series);if(v!=null&&v>=row.L)count++;}return count;}
