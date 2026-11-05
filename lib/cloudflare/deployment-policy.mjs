export function previewBranchAllowed(branch){return typeof branch==='string'&&/^(claude|codex)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch);}
export function productionDeploymentAllowed(run){
 return run.checksComplete===true&&run.repository==='ved267/taksh-website'&&run.event==='push'&&run.branch==='main'&&run.conclusion==='success'&&run.workflowPath==='.github/workflows/validate.yml'&&/^[a-f0-9]{40}$/.test(run.validatedSha||'')&&run.validatedSha===run.currentMainSha;
}
export function validatedMainRun(runs,sha){return runs.find(run=>run.head_sha===sha&&run.head_branch==='main'&&run.event==='push'&&run.conclusion==='success'&&run.path==='.github/workflows/validate.yml'&&run.repository?.full_name==='ved267/taksh-website');}
