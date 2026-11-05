import test from'node:test';import assert from'node:assert/strict';import{previewUrlFromOutput}from'../lib/cloudflare/preview-output.mjs';
test('preview output accepts progress text but trusts only the typed JSON result and exact owner host',()=>{
 const url='https://codex-test-taksh-store.taksh-ved267.workers.dev',result={type:'preview',worker_name:'taksh-store',preview_name:'codex/test',preview_urls:[url]};
 assert.equal(previewUrlFromOutput('Attaching additional modules:\nprogress\n'+JSON.stringify(result,null,2),'codex/test','taksh-store'),url);
 assert.throws(()=>previewUrlFromOutput('Error '+url,'codex/test','taksh-store'),/JSON/);
 assert.throws(()=>previewUrlFromOutput(JSON.stringify({...result,preview_name:'claude/other'}),'codex/test','taksh-store'),/identity/);
 assert.throws(()=>previewUrlFromOutput(JSON.stringify({...result,preview_urls:[url+'.attacker.example']}),'codex/test','taksh-store'),/URL/);
});
