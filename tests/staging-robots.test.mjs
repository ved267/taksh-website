import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';import ts from'typescript';
test('staging and preview documents are noindex, including cache hits; production keeps existing headers',async()=>{
 const botDomain=await import('../lib/bot-domain.mjs');
 const source=ts.transpileModule(fs.readFileSync('workers/app.ts','utf8').replaceAll('import.meta.env.DEV','false'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const environment of ['production','staging','preview'])for(const hit of [false,true]){
  const workerModule={exports:{}};const domain={publicPageCacheKey:()=>hit?'synthetic':null,readPublicPageCache:async()=>({cache:null,hit:hit?new Response('synthetic',{headers:{'Content-Type':'text/html'}}):null}),cacheablePageResponse:()=>false};
  vm.runInNewContext(source,{exports:workerModule.exports,module:workerModule,require:name=>name==='vinext/server/fetch-handler'?{__esModule:true,default:{fetch:async()=>new Response('synthetic',{headers:{'Content-Type':'text/html'}})}}:name.includes('bot-domain')?botDomain:domain,Response,Headers,Request,performance,caches:{},__TAKSH_BUILD__:'synthetic'});
  const response=await workerModule.exports.default.fetch(new Request('https://synthetic.example/'),{APP_ENV:environment},{waitUntil(){}});
  assert.equal(response.headers.get('x-robots-tag'),environment==='production'?null:'noindex');
  assert.equal(response.headers.get('set-cookie'),null,'a missing Accept-Language alone never marks the browser');
  const bot=await workerModule.exports.default.fetch(new Request('https://synthetic.example/',{headers:{'accept-language':'en-IN','user-agent':'Googlebot/2.1'}}),{APP_ENV:environment},{waitUntil(){}});
  assert.match(bot.headers.get('set-cookie')||'',/^taksh_auto=1;/,'a bot user agent is marked automated');
  const prefetch=await workerModule.exports.default.fetch(new Request('https://synthetic.example/',{headers:{'x-purpose':'preview','x-fb-http-engine':'Liger','user-agent':'Googlebot/2.1'}}),{APP_ENV:environment},{waitUntil(){}});
  assert.equal(prefetch.headers.get('set-cookie'),null,'a prefetch never changes the mark');
  const person=await workerModule.exports.default.fetch(new Request('https://synthetic.example/',{headers:{'accept-language':'en-IN','user-agent':'Mozilla/5.0 (iPhone)'}}),{APP_ENV:environment},{waitUntil(){}});
  assert.equal(person.headers.get('set-cookie'),null,'people get no cookie');
 }
});
