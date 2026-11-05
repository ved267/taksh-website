// Manual, read-only reporting. No schedule, alerts, customer rows or old Free-plan thresholds.
import{mkdir,writeFile}from'node:fs/promises';import{cloudflareRequest}from'./cloudflare-api.mjs';
const asOf=new Date().toISOString(),start=asOf.slice(0,7)+'-01T00:00:00Z',account='60742c7f90408058b71f1065a6815ddd';
const filter=`{datetime_geq:"${start}",datetime_lt:"${asOf}"}`;
const query=`{viewer{accounts(filter:{accountTag:"${account}"}){requests:workersInvocationsAdaptive(limit:10,filter:${filter}){sum{requests errors cpuTimeUs} quantiles{cpuTimeP50 cpuTimeP99}} d1:d1AnalyticsAdaptiveGroups(limit:10,filter:${filter}){sum{rowsRead rowsWritten}} r2:r2OperationsAdaptiveGroups(limit:100,filter:${filter}){sum{requests}} builds:workersBuildsBuildMinutesAdaptiveGroups(limit:10,filter:${filter}){sum{buildMinutes}}}}}`;
const response=await cloudflareRequest('graphql',{method:'POST',body:{query}});
if(response.errors?.length)throw new Error('Analytics query failed: '+response.errors.map(error=>error.message).join('; '));
const metrics=response.data?.viewer?.accounts?.[0];if(!metrics)throw new Error('Account analytics were not returned.');
const databases=(await cloudflareRequest(`accounts/${account}/d1/database?per_page=100`)).result.map(db=>({name:db.name,bytes:db.file_size}));
const report={asOf,periodStart:start,scope:'Account-wide UTC calendar month; analytics and storage metadata may be delayed/sampled. Not an invoice.',metrics,d1Storage:databases,githubActionsMinutes:null,githubReason:'Owner must verify account included-minute pool in GitHub billing; repo-only run count is not account usage.',r2BilledStorage:null,billingReason:'Native usage alerts exclude fixed subscriptions/tax. Verify current invoice and R2 storage in owner dashboard.'};
await mkdir('.local',{recursive:true});await writeFile('.local/cloudflare-paid-usage-latest.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
