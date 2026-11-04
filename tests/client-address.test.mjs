import test from 'node:test';
import assert from 'node:assert/strict';
import {clientAddress} from '../lib/client-address.mjs';
test('Vercel rate limits distinguish clients using the platform header',()=>{
 const req=ip=>new Request('https://taksh.store/api/cart',{headers:{'x-vercel-forwarded-for':ip,'cf-connecting-ip':'spoofed'}});
 assert.equal(clientAddress(req('203.0.113.1'),{VERCEL:'1'}),'203.0.113.1');
 assert.notEqual(clientAddress(req('203.0.113.1'),{VERCEL:'1'}),clientAddress(req('203.0.113.2'),{VERCEL:'1'}));
 assert.equal(clientAddress(new Request('http://localhost'),{}),'local');
});

test('Netlify rate limiting trusts its platform address instead of caller Cloudflare headers',()=>{
 const req=new Request('https://taksh.store/api/support',{headers:{'x-nf-client-connection-ip':'203.0.113.17','cf-connecting-ip':'198.51.100.44','x-forwarded-for':'198.51.100.45'}});
 assert.equal(clientAddress(req,{NETLIFY:'true'}),'203.0.113.17');
 assert.equal(clientAddress(req,{SITE_ID:'site'}),'203.0.113.17');
 assert.equal(clientAddress(new Request('https://taksh.store'),{NETLIFY:'true'}),'unavailable');
});
