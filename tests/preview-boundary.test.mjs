import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import yaml from'js-yaml';
import{compiledPreviewBase}from'../lib/cloudflare/compiled-preview.mjs';
test('preview activation cannot open the production cutover gate',()=>{
 const production=yaml.load(readFileSync('.github/workflows/production.yml','utf8')).jobs.deploy.if;
 const preview=yaml.load(readFileSync('.github/workflows/deploy-preview.yml','utf8')).jobs.deploy.if;
 const requiredFlags=condition=>[...condition.matchAll(/vars\.(TAKSH_[A-Z_]+)\s*==\s*'true'/g)].map(match=>match[1]);
 const flags={TAKSH_CI_READY:'true',TAKSH_DEPLOYMENT_READY:'true',TAKSH_PRODUCTION_READY:'false'};
 const activationAllowed=condition=>requiredFlags(condition).every(name=>flags[name]==='true');
 assert.equal(activationAllowed(preview),true,'credential-ready previews must be testable before cutover');
 assert.equal(activationAllowed(production),false,'production must still require its separate owner release gate');
 flags.TAKSH_PRODUCTION_READY='true';assert.equal(activationAllowed(production),true);
});
test('branch build never receives deployment credentials; deploy workflow uses trusted main only',()=>{
 const build=readFileSync('.github/workflows/preview.yml','utf8');assert.equal(build.includes('secrets.'),false,'branch workflow must be secret-free');
 const deploy=yaml.load(readFileSync('.github/workflows/deploy-preview.yml','utf8'));
 assert.ok(deploy.on.workflow_run);const steps=deploy.jobs.deploy.steps;
 assert.equal(steps.find(step=>String(step.uses||'').startsWith('actions/checkout')).with.ref,'main');
 assert.equal(steps.filter(step=>step.env?.CLOUDFLARE_API_TOKEN).length,1);
 assert.equal(steps.find(step=>step.env?.CLOUDFLARE_API_TOKEN).run,'node scripts/deploy-preview.mjs');
});
test('credentialed deployment config is constructed from trusted settings and fixed artifact paths',()=>{
 const result=compiledPreviewBase({name:'taksh-store',account_id:'60742c7f90408058b71f1065a6815ddd',d1_databases:[],r2_buckets:[],build:{command:'must never execute'},routes:['production.example'],vars:{DANGEROUS:'must not copy'}},'/tmp/synthetic-bundle');
 assert.equal(result.build,undefined);assert.equal(result.routes,undefined);assert.equal(result.vars.DANGEROUS,undefined);assert.equal(result.no_bundle,true);assert.equal(result.main,'/tmp/synthetic-bundle/dist/server/index.js');
});
