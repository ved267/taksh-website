import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';import ts from'typescript';
test('staging and preview documents are noindex, including cache hits; production keeps existing headers',async()=>{
 const source=ts.transpileModule(fs.readFileSync('workers/app.ts','utf8').replaceAll('import.meta.env.DEV','false'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const environment of ['production','staging','preview'])for(const hit of [false,true]){
  const workerModule={exports:{}};const domain={publicPageCacheKey:()=>hit?'synthetic':null,readPublicPageCache:async()=>({cache:null,hit:hit?new Response('synthetic',{headers:{'Content-Type':'text/html'}}):null}),cacheablePageResponse:()=>false};
  vm.runInNewContext(source,{exports:workerModule.exports,module:workerModule,require:name=>name==='vinext/server/fetch-handler'?{__esModule:true,default:{fetch:async()=>new Response('synthetic',{headers:{'Content-Type':'text/html'}})}}:domain,Response,Headers,Request,performance,caches:{},__TAKSH_BUILD__:'synthetic'});
  const response=await workerModule.exports.default.fetch(new Request('https://synthetic.example/'),{APP_ENV:environment},{waitUntil(){}});
  assert.equal(response.headers.get('x-robots-tag'),environment==='production'?null:'noindex');
 }
});
