export function performanceRegressions(base,current){
 const failures=[];
 for(const key of ['jsGzip','cssGzip','workerGzip']){if(!Number.isFinite(base.totals?.[key])||!Number.isFinite(current.totals?.[key]))failures.push(`Missing ${key}`);else if(current.totals[key]>base.totals[key])failures.push(`${key}: ${base.totals[key]} -> ${current.totals[key]} bytes`);}
 for(const [route,metrics]of Object.entries(base.pages||{}))for(const [key,value]of Object.entries(metrics).filter(([key])=>['jsGzip','cssGzip','pageBytes'].includes(key))){const next=current.pages?.[route]?.[key];if(!Number.isFinite(next))failures.push(`Missing ${route} ${key}`);else if(next>value)failures.push(`${route} ${key}: ${value} -> ${next} bytes`);}
 return failures;
}
