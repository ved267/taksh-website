export function performanceRegressions(base,current,{workerAllowance=0}={}){
 if(![0,256].includes(workerAllowance))throw new Error('Unsupported Worker allowance.');
 const failures=[];
 for(const key of ['jsGzip','cssGzip','workerGzip']){if(!Number.isFinite(base.totals?.[key])||!Number.isFinite(current.totals?.[key]))failures.push(`Missing ${key}`);else if(current.totals[key]>base.totals[key]+(key==='workerGzip'?workerAllowance:0))failures.push(`${key}: ${base.totals[key]} -> ${current.totals[key]} bytes`);}
 for(const [route,metrics]of Object.entries(base.pages||{}))for(const [key,value]of Object.entries(metrics).filter(([key])=>['jsGzip','cssGzip','pageBytes'].includes(key))){const next=current.pages?.[route]?.[key];if(!Number.isFinite(next))failures.push(`Missing ${route} ${key}`);else if(next>value)failures.push(`${route} ${key}: ${value} -> ${next} bytes`);}
 return failures;
}

// One requested backend-security addition, not a general performance tolerance.
// It expires automatically once main advances beyond this exact baseline.
export function adminSecurityAllowance(baseSha,files){
 const allowed=new Set(['app/api/admin/login/route.ts','lib/admin-access.mjs','lib/server.ts','scripts/set-private-setting.mjs','scripts/test-local.mjs','tests/admin-access.test.mjs','tests/admin-lockout.integration.mjs','docs/ARCHITECTURE.md','docs/OPERATIONS.md','lib/cloudflare/performance-regression.mjs','scripts/check-main-performance.mjs','scripts/compare-performance.mjs','tests/performance-regression.test.mjs','lib/cloudflare/main-baseline.mjs','tests/main-baseline.test.mjs','.github/workflows/validate.yml']);
 return baseSha==='171ff74380e4cc41aa145ff4766b1e2ba4f9621b'&&files.length>0&&files.every(file=>allowed.has(file))?256:0;
}
