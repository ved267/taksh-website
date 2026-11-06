export function previousDeployment(deployments){
 const ordered=[...deployments].sort((a,b)=>Date.parse(b.created_on)-Date.parse(a.created_on));
 if(ordered.some(row=>row.versions.length!==1||row.versions[0].percentage!==100))throw new Error('Review gradual deployments manually before rollback.');
 const current=ordered[0]?.versions[0].version_id;
 const previous=ordered.find(row=>row.versions[0].version_id!==current)?.versions[0].version_id;
 if(!current||!previous)throw new Error('No previous complete deployment is available.');
 return {current,previous};
}

// Read structured provider data, never machine output suppressed by CLI log settings.
export async function workerDeployments(request,account,worker){
 const response=await request(`accounts/${account}/workers/scripts/${worker}/deployments`);
 const rows=response.result?.deployments;
 if(!Array.isArray(rows))throw new Error('Worker deployment history is unavailable.');
 return rows;
}
