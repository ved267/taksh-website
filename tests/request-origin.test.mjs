import test from 'node:test';
import assert from 'node:assert/strict';
import {checkSameOrigin} from '../lib/request-origin.mjs';
test('Next internal hostname does not reject the actual browser origin',()=>{
 assert.doesNotThrow(()=>checkSameOrigin(new Request('http://localhost:5274/api/checkout',{headers:{host:'127.0.0.1:5274',origin:'http://127.0.0.1:5274'}})));
});
test('cross-site form requests stay blocked',()=>{
 for(const headers of [{host:'taksh.store',origin:'https://evil.example'},{host:'taksh.store',origin:'https://taksh.store','sec-fetch-site':'cross-site'}])assert.throws(()=>checkSameOrigin(new Request('https://taksh.store/api/checkout',{headers})),/not allowed/);
});
