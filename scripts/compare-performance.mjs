import {readFile} from 'node:fs/promises';
import {performanceRegressions} from '../lib/cloudflare/performance-regression.mjs';
const [baseline,current]=await Promise.all(process.argv.slice(2,4).map(async file=>JSON.parse(await readFile(file,'utf8'))));
if(!baseline||!current)throw new Error('Provide main and PR performance reports.');
const failures=performanceRegressions(baseline,current);
if(failures.length){console.error('Performance regression against main:\n'+failures.join('\n'));process.exitCode=1;}else console.log('No JS, CSS, Worker or key-page weight regression against main.');
