import {writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../public/examples/inspection/',import.meta.url);
const write=async(path,obj)=>{const url=new URL(path,root);await mkdir(new URL('.',url),{recursive:true});await writeFile(url,JSON.stringify(obj));};
const DAY=864e5,start='2025-01-01',today='2026-09-01';
const day=d=>Math.round((Date.parse(d)-Date.parse(start))/DAY);
const levels=[.0001,.001,.005,.01,.02,.05,.1,.2,.3,.5,.7,.9,.95,.99];
const pof=(d,eta,beta=2.8)=>1-Math.exp(-Math.pow(Math.max(0,d+1)/eta,beta));
for(const sid of ['1001','1002']){
 const assets=[],assessments=[],costs=[],windows=[],curves={};
 for(let u=0;u<3;u++)for(let year=2027;year<2035;year+=2)windows.push({id:`window-${u}-${year}`,unitId:`area-${u}`,name:`Area ${u+1} turnaround ${year}`,start:`${year}-04-01`,end:`${year}-04-21`});
 for(let i=0;i<18;i++){
  const assetId=`asset-${i+1}`,unitId=`area-${i%3}`;
  const asset={id:assetId,name:`${['Vessel','Exchanger','Piping circuit'][i%3]} ${String(i+1).padStart(2,'0')}`,clientId:`DEMO-${i+1}`,unitId,unit:['Process area','Utilities','Storage'][i%3],type:['Vessel','Exchanger','Piping'][i%3]};assets.push(asset);curves[assetId]={asset,assessments:[],tasks:[]};
  for(let j=0;j<2;j++){
   const id=`assessment-${i+1}-${j+1}`,eta=1500+i*135+j*420,beta=2.8,cofHse=3500000+i*140000,cofEcon=5000000+i*210000;
   const date=`${sid==='1001'?2029:2027+i%3}-04-01`,number=`TASK-${i+1}-${j+1}`,bundle=j?'Replace':['UT / thickness','API internal','API external','Clean & inspect','RT profile'][i%5];
   const event={date,day:day(date),bundle,types:[bundle],taskNumbers:[number],definitions:[bundle],targets:['Assessment'],endDate:date};
   const q=levels.map(p=>Math.round(eta*Math.pow(-Math.log(1-p),1/beta)-1));
   const a={id,assetId,component:`${asset.name} | ${j?'External corrosion':'Wall thinning'}`,mechanism:j?'Corrosion under insulation':'General thinning',category:j?'External Thinning':['Thinning','Cracking/Metallurgical','External Thinning','Creep','Thinning'][i%5],scope:'fixed',grain:'Assessment',status:2,start,fit:{beta,eta,gamma:0},q,qMit:q,hasHse:true,hasEcon:true,cofHse,cofEcon,events:[event],today:{unmitPof:pof(day(today),eta),mitPof:pof(day(today),eta),unmitHse:pof(day(today),eta)*cofHse,mitHse:pof(day(today),eta)*cofHse,unmitEcon:pof(day(today),eta)*cofEcon,mitEcon:pof(day(today),eta)*cofEcon}};
   assessments.push(a);const task={id:number,assetId,number,date,bundle,definition:bundle,cost:2200+i*180+j*4500,statusCode:2,credit:[id],description:`Fictional ${bundle.toLowerCase()} scope`,duration:1};costs.push(task);curves[assetId].tasks.push(task);
   const days=Array.from({length:366},(_,n)=>n*10),unmitPof=days.map(d=>pof(d,eta,beta)),mitPof=days.map(d=>pof(d>=day(date)&&j?d-day(date):d,eta,beta));
   curves[assetId].assessments.push({id,start,days,unmitPof,mitPof,unmitHse:unmitPof.map(v=>v*cofHse),mitHse:mitPof.map(v=>v*cofHse),unmitEcon:unmitPof.map(v=>v*cofEcon),mitEcon:mitPof.map(v=>v*cofEcon)});
  }
 }
 await write(`models/${sid}.json.gz`,{today,start,snapshotAt:today,scenarioName:sid==='1001'?'Baseline planning':'Earlier intervention',assets,assessments,windows,levels,bundles:["Replace","Overhaul","Inspect + conditional repair","API internal","Planned TAR task","Clean & inspect","Pressure test","Pigging","RT profile","UT / thickness","API external","Online inspection","Other"]});
 await write(`models/costs-${sid}.json.gz`,costs);
 for(const [prefix,value] of [['cml',{assessments:{}}],['cof',{}],['fineq',null],['breach',null],['rows',{rows:{}}],['taskrows',{tasks:{}}]])await write(`models/${prefix}-${sid}.${prefix==='cof'?'json':'json.gz'}`,value);
 for(const [id,c] of Object.entries(curves))await write(`curves/${sid}/${id}.json.gz`,c);
}
await write('models/index.json',{scenarios:[{id:'1001',name:'Baseline planning',ready:true,today},{id:'1002',name:'Earlier intervention',ready:true,today}]});
await write('models/sample-import-template.json',{headers:{Tasks:['Action','Asset Client ID','Task Number','Task Definition','Task Description','Task Type','Target','Implementation Status','Start Date','Total Duration Hours','Total Downtime Hours','Total Cost ($)','Notes'], 'Assessments & CMLs':['Action','Asset Client ID','Assessment','Task Number','CML','Notes'], Steps:['Action','Asset Client ID','Task Number','Step ID','Critical','Description','Duration','Downtime','Labor cost','Material cost','Executor','Notes','Sort order'], 'Prerequisite Tasks':['Task','Prerequisite'], 'Planned Downtime':['Action','Unit','ID','Name','Type','Description','Start','Production impact','Duration','Units','Lockdown']}});
console.log('Generated fictional inspection fixtures: 18 assets, 36 assessments, two scenarios.');
