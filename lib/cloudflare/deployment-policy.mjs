export function previewBranchAllowed(branch){return typeof branch==='string'&&/^(claude|codex)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch);}
export function productionDeploymentAllowed(run){
 return run.checksComplete===true&&run.repository==='ved267/taksh-website'&&run.event==='push'&&run.branch==='main'&&run.conclusion==='success'&&run.workflowPath==='.github/workflows/validate.yml'&&/^[a-f0-9]{40}$/.test(run.validatedSha||'')&&run.validatedSha===run.currentMainSha;
}
