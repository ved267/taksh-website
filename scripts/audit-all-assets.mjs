import{readFile,readdir,writeFile}from'node:fs/promises';
const report=JSON.parse(await readFile('.local/public-site-audit.json','utf8'));
const checked=new Set(report.assets.map(item=>item.path));
const paths=(await readdir('dist/client',{recursive:true})).filter(p=>/\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?)$/i.test(p)).map(p=>'/'+p).filter(p=>!checked.has(p));
let done=0;for(let i=0;i<paths.length;i+=4)await Promise.all(paths.slice(i,i+4).map(async path=>{
 try{const [a,b]=await Promise.all([fetch(report.live+path,{method:'HEAD',signal:AbortSignal.timeout(30000)}),fetch(report.target+path,{method:'HEAD',signal:AbortSignal.timeout(30000)})]);report.assets.push({path,liveStatus:a.status,targetStatus:b.status});if(a.status!==200||b.status!==200)report.errors.push(`${path}: asset HTTP ${a.status}/${b.status}`);}catch(e){report.errors.push(`${path}: ${e.message}`);}done++;if(done%100===0)console.log(`Checked ${done}/${paths.length} remaining assets`);
}));
report.allBundledImagesFontsChecked=true;report.asOf=new Date().toISOString();await writeFile('.local/public-site-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.pages.length,assets:report.assets.length,errors:report.errors},null,2));if(report.errors.length)process.exitCode=1;
