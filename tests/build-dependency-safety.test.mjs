import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),braces=require('braces');
const guarded=error=>error instanceof SyntaxError&&/nesting/.test(error.message);
test('build glob parsing rejects deep nesting before recursive walkers overflow',()=>{
 const pattern='{'.repeat(4000)+'a,b'+'}'.repeat(4000);
 for(const method of ['compile','expand','stringify'])assert.throws(()=>braces[method](pattern),guarded);
});
test('direct AST input cannot bypass the build glob nesting guard',()=>{
 let ast={type:'text',value:'a'};
 for(let i=0;i<150;i++)ast={type:'root',nodes:[ast]};
 assert.throws(()=>braces.compile(ast),guarded);
 assert.throws(()=>braces.stringify(ast),guarded);
});
test('normal nested build globs still compile and expand',()=>{
 assert.deepEqual(braces.expand('app/{api,{sets,help}}/*.{ts,tsx}'),['app/api/*.ts','app/api/*.tsx','app/sets/*.ts','app/sets/*.tsx','app/help/*.ts','app/help/*.tsx']);
 assert.equal(braces.compile('src/{app,lib}/*.tsx'),'src/(app|lib)/*.tsx');
});
