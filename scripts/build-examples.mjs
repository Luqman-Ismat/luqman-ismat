import {build} from 'esbuild';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
for(const name of ['inspection','project']){
 const dest=`public/examples/${name}`;await mkdir(dest,{recursive:true});
 await build({entryPoints:[`examples/${name}/main.tsx`],bundle:true,minify:true,outfile:`${dest}/app.js`,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},alias:{'@project':path.resolve('examples/project')},loader:{'.css':'css'}});
 await writeFile(`${dest}/index.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name==='inspection'?'Inspection Planning':'Project Controls'} · Fictional work example</title><link rel="stylesheet" href="style.css"><script>document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')==='dark'?'dark':'light'</script></head><body><div id="root"></div><script src="app.js"></script></body></html>`);
}
