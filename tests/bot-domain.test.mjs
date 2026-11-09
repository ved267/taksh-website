import test from 'node:test';
import assert from 'node:assert/strict';
import {automatedRequest,automatedFromRequest,autoCookie,requestFacts} from '../lib/bot-domain.mjs';
import {requestTraffic} from '../lib/demand-domain.mjs';
import {filteredLine} from '../scripts/google-report.mjs';

const phone='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const human={userAgent:phone,acceptLanguage:'en-IN,en;q=0.9'};

test('Indian mobile and home networks count as people',()=>{
 for(const asn of [55836,45609,24560,9829,17488,13335])assert.equal(automatedRequest({...human,asn}),false,`AS${asn}`);
 assert.equal(automatedRequest(human),false);
});
test('data-centre networks, verified bots, bot user agents and missing language are automated',()=>{
 for(const asn of [15169,396982,16509,14618,8075,14061,16276,24940,63949,31898,45102,132203])assert.equal(automatedRequest({...human,asn}),true,`AS${asn}`);
 assert.equal(automatedRequest({...human,asn:'16509'}),true);
 assert.equal(automatedRequest({...human,verifiedBotCategory:'Search Engine Crawler'}),true);
 assert.equal(automatedRequest({...human,userAgent:'Googlebot/2.1'}),true);
 assert.equal(automatedRequest({...human,userAgent:'facebookexternalhit/1.1'}),true);
 assert.equal(automatedRequest({...human,acceptLanguage:null}),true);
});
test('preview and CI Workers skip only the network rule',()=>{
 assert.equal(automatedRequest({...human,asn:8075},{network:false}),false);
 assert.equal(automatedRequest({...human,asn:8075,userAgent:'Googlebot/2.1'},{network:false}),true);
 assert.equal(automatedRequest({...human,asn:8075,acceptLanguage:null},{network:false}),true);
});
test('reads Cloudflare facts and the cookie from a request',()=>{
 const req=new Request('https://taksh.store/',{headers:{'user-agent':phone,'accept-language':'hi-IN'}});
 Object.defineProperty(req,'cf',{value:{asn:16509}});
 assert.equal(requestFacts(req).asn,16509);
 assert.equal(automatedFromRequest(req),true);
 assert.equal(automatedFromRequest(new Request('https://taksh.store/',{headers:{'user-agent':phone,'accept-language':'en-IN'}})),false);
 assert.equal(automatedFromRequest(new Request('https://taksh.store/',{headers:{'user-agent':phone,'accept-language':'en-IN',cookie:'a=1; taksh_auto=1'}})),true);
});
test('cookie is set once for automated visits and cleared when a person returns',()=>{
 assert.match(autoCookie(true,''),/^taksh_auto=1; Path=\/; Max-Age=2592000; SameSite=Lax; Secure$/);
 assert.equal(autoCookie(true,'taksh_auto=1'),null);
 assert.equal(autoCookie(false,''),null);
 assert.match(autoCookie(false,'x=2; taksh_auto=1'),/Max-Age=0/);
});
test('server counting marks automated requests and keeps test first',()=>{
 assert.equal(requestTraffic({},phone,false,true),'automated');
 assert.equal(requestTraffic({},phone,false,false),'external');
 assert.equal(requestTraffic({},phone,true,true),'test');
});
test('report states how many users the city filter removed',()=>{
 assert.equal(filteredLine([['86']],[['42']]).startsWith('Filtered as data-centre traffic: 44 of 86 users.'),true);
 assert.match(filteredLine([],[]),/0 of 0/);
});
