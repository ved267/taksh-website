import test from 'node:test';import assert from 'node:assert/strict';
import {productionDeploymentAllowed,previewBranchAllowed} from '../lib/cloudflare/deployment-policy.mjs';
test('production only accepts successful validation of the current main commit in this repository',()=>{
 const valid={checksComplete:true,repository:'ved267/taksh-website',event:'push',branch:'main',validatedSha:'a'.repeat(40),currentMainSha:'a'.repeat(40),conclusion:'success',workflowPath:'.github/workflows/validate.yml'};
 assert.equal(productionDeploymentAllowed(valid),true);
 for(const change of [{checksComplete:false},{conclusion:'failure'},{conclusion:'cancelled'},{event:'pull_request'},{branch:'codex/task'},{repository:'other/repo'},{currentMainSha:'b'.repeat(40)},{workflowPath:'.github/workflows/other.yml'}])assert.equal(productionDeploymentAllowed({...valid,...change}),false);
});
test('Claude and Codex preview branches follow identical policy, while main is rejected',()=>{
 assert.equal(previewBranchAllowed('claude/product'),true);assert.equal(previewBranchAllowed('codex/product'),true);
 for(const value of ['main','master','','codex/','codex/task\nmain','feature/task'])assert.equal(previewBranchAllowed(value),false);
});
test('manual production picks only successful Validate push evidence on current main',async()=>{
 const {validatedMainRun}=await import('../lib/cloudflare/deployment-policy.mjs');const sha='a'.repeat(40),good={id:7,head_sha:sha,head_branch:'main',event:'push',conclusion:'success',path:'.github/workflows/validate.yml',repository:{full_name:'ved267/taksh-website'}};
 assert.equal(validatedMainRun([good],sha).id,7);
 for(const change of [{head_sha:'b'.repeat(40)},{head_branch:'claude/task'},{event:'pull_request'},{conclusion:'failure'},{path:'.github/workflows/other.yml'}])assert.equal(validatedMainRun([{...good,...change}],sha),undefined);
});
