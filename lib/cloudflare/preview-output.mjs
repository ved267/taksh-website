export function previewUrlFromOutput(output,branch,worker){
 let result;
 // Read Wrangler's structured output file, allowing preceding NDJSON events.
 for(const match of output.matchAll(/^\s*\{/gm)){try{result=JSON.parse(output.slice(match.index).trim());break;}catch{/* Try the next complete top-level JSON suffix. */}}
 if(!result)throw new Error('Preview output did not contain a complete JSON result.');
 if(result.type!=='preview'||result.worker_name!==worker||result.preview_name!==branch)throw new Error('Preview result identity does not match this branch and Worker.');
 const slug=branch.toLowerCase().replace(/[^a-z0-9-]/g,'-');
 const expected=`https://${slug}-${worker}.taksh-ved267.workers.dev`;
 if(!Array.isArray(result.preview_urls)||!result.preview_urls.includes(expected))throw new Error('Preview result did not include the expected stable owner URL.');
 return expected;
}
