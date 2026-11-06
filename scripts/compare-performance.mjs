import {readFile} from 'node:fs/promises';
import {performanceRegressions} from '../lib/cloudflare/performance-regression.mjs';
const [baseline,current]=await Promise.all(process.argv.slice(2,4).map(async file=>JSON.parse(await readFile(file,'utf8'))));
if(!baseline||!current)throw new Error('Provide main and PR performance reports.');
const workerAllowance=Number(process.argv[4]||0);
if(workerAllowance)console.log('Requested admin-lockout baseline adjustment: maximum '+workerAllowance+' compressed Worker bytes; JS/CSS/page weights remain strict. Actual Worker change: '+(current.totals.workerGzip-baseline.totals.workerGzip)+' bytes.');
const failures=performanceRegressions(baseline,current,{workerAllowance});
if(failures.length){console.error('Performance regression against main:\n'+failures.join('\n'));process.exitCode=1;}else console.log(workerAllowance?'Public JS/CSS/page weights unchanged; Worker fits the scoped admin-security baseline.':'No JS, CSS, Worker or key-page weight regression against main.');
