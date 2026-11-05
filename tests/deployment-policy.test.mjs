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
