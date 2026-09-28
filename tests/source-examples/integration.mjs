import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {build} from 'esbuild';
const root=process.cwd()+'/public';let result;
const ctx=vm.createContext({console,Blob,Response,DecompressionStream,setTimeout,fetch:async p=>new Response(fs.readFileSync(root+p.split('?')[0])),self:{postMessage:d=>{result=d}}});
ctx.importScripts=p=>vm.runInContext(fs.readFileSync(root+p,'utf8'),ctx);
vm.runInContext(fs.readFileSync(root+'/examples/inspection/optimizer.worker.js','utf8'),ctx);
for(const scenario of ['1001','1002']){
 await ctx.self.onmessage({data:{scenario,requestId:1,settings:{horizon:'2034-12-01'},userLinks:{}}});
 assert.equal(result.type,'result');assert.equal(result.results.length,36);
 assert.equal(Object.values(result.bucketCounts).reduce((a,b)=>a+b,0),36);
}
console.log('PASS actual inspection worker: both scenarios, 36 assessments, exhaustive classification');
const base=process.env.SITE_URL||'http://127.0.0.1:3187';
const parsed=[];
for(const version of [1,2]){
 const form=new FormData();form.append('file',new File([fs.readFileSync(`public/examples/project/sample-plan-${version}.xml`)],`sample-${version}.xml`));
 const r=await fetch(base+'/api/examples/parse-project',{method:'POST',body:form});assert.equal(r.status,200);const data=await r.json();assert.equal(data.success,true);assert.equal(data.tasks.length,23);assert.equal(data.summary.dependencies.totalPredecessorLinks,15);assert.ok(data.tasks.some(t=>t.resourceAssignments.length));parsed.push(data.tasks);
}
const compiled=await build({stdin:{contents:`export {mapMppOutput} from './examples/project/lib/mpp-mapper';export {buildWbsDiff} from './examples/project/lib/version-diff';`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node',alias:{'@project':process.cwd()+'/examples/project'}});
const {mapMppOutput,buildWbsDiff}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const [a,b]=parsed.map(t=>mapMppOutput(t,'test'));assert.equal(a.tasks.length,18);assert.equal(a.phases.length,3);assert.equal(a.units.length,1);
const ids=new Set(a.tasks.map(t=>t.id));assert.equal(a.tasks.filter(t=>ids.has(t.predecessor_task_id)).length,15);
const diff=buildWbsDiff(a,b);assert.equal(diff.summary.changed,3);assert.ok(diff.topChanges.every(c=>c.finish_shift_days===12));
console.log('PASS real parser → mapper → version diff: resources, hierarchy, 15 dependencies, three 12-day shifts');
const invalid=new FormData();invalid.append('file',new File(['invalid'],'sample.txt'));assert.equal((await fetch(base+'/api/examples/parse-project',{method:'POST',body:invalid})).status,400);
const headers=(await fetch(base+'/examples/project/index.html')).headers;assert.equal(headers.get('x-frame-options'),'SAMEORIGIN');assert.equal((await fetch(base+'/')).headers.get('x-frame-options'),'DENY');
console.log('PASS upload validation and same-origin-only embedding');
