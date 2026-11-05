import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
for(const environment of ['preview','staging'])test(environment+' never sends customer email even when sender secrets were copied accidentally',async()=>{
 const serverModule={exports:{}};let calls=0;
 const runtime={APP_ENV:environment,RESEND_API_KEY:'synthetic',FROM_EMAIL:'synthetic@example.test'};
 const source=ts.transpileModule(fs.readFileSync('lib/server.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{module:serverModule,exports:serverModule.exports,require:(name)=>name==='@/db'?{runtime}: {},fetch:()=>{calls++;throw Error('Preview attempted email');},console,Response,TextEncoder,crypto});
 assert.equal(await serverModule.exports.sendConfirmation({details:'{"email":"synthetic@example.test"}'}),'not_configured');assert.equal(calls,0);
});
