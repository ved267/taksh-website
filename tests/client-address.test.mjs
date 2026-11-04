import test from 'node:test';
import assert from 'node:assert/strict';
import {clientAddress} from '../lib/client-address.mjs';
test('Vercel rate limits distinguish clients using the platform header',()=>{
 const req=ip=>new Request('https://taksh.store/api/cart',{headers:{'x-vercel-forwarded-for':ip,'cf-connecting-ip':'spoofed'}});
 assert.equal(clientAddress(req('203.0.113.1'),{VERCEL:'1'}),'203.0.113.1');
 assert.notEqual(clientAddress(req('203.0.113.1'),{VERCEL:'1'}),clientAddress(req('203.0.113.2'),{VERCEL:'1'}));
 assert.equal(clientAddress(new Request('http://localhost'),{}),'local');
});
