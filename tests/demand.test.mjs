import test from 'node:test';import assert from 'node:assert/strict';
import {requestTraffic,preserveTraffic,aggregateDemand} from '../lib/demand-domain.mjs';
test('reserved synthetic contacts and obvious automation are excluded without guessing identities',()=>{assert.equal(requestTraffic({email:'qa@example.test'},'Mozilla/5.0'),'test');assert.equal(requestTraffic({email:'real@example.com'},'Googlebot/2.1'),'automated');assert.equal(requestTraffic({email:'real@example.com'},'Mozilla/5.0'),'external')});
test('demand counts confirmed non-test requests once and preserves historical prices',()=>{const row={id:'1',reference:'TK-1',status:'placed',is_test:0,traffic_type:'external',total:200,items:[{slug:'gully-cricket',name:'Gully Cricket',price:100,quantity:2}],details:{email:'x@example.com'}};const d=aggregateDemand([row,row,{...row,id:'2',reference:'TK-2',is_test:1},{...row,id:'3',reference:'TK-3',status:'draft'}]);assert.equal(d.requests,1);assert.equal(d.requestedUnits,2);assert.equal(d.potentialValue,200);assert.equal(d.paidOrders,0);assert.equal(d.products[0].potentialValue,200);assert.equal(d.contacts,1)});
test('record exclusions survive later external updates',()=>{assert.equal(preserveTraffic('test','external'),'test');assert.equal(preserveTraffic('automated','external'),'automated');assert.equal(preserveTraffic('external','test'),'test')});

test('owner demand aggregates include submitted history beyond the displayed 5000 rows',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const {demandQueries,assembleDemandReport}=await import('../lib/demand-report.mjs');
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE orders(reference TEXT,status TEXT,items TEXT,total INTEGER,details TEXT,traffic_type TEXT,utm_source TEXT,referrer TEXT)');
 const insert=db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?)');
 insert.run('old-request','placed',JSON.stringify([{slug:'gully-cricket',name:'Gully Cricket',price:99,quantity:2}]),198,JSON.stringify({email:'buyer@outside.invalid'}),'external','','Instagram');
 for(let i=0;i<5001;i++)insert.run('cart-'+i,'cart','[]',0,'{}','external','','');
 insert.run('test','placed',JSON.stringify([{slug:'gully-cricket',price:2999,quantity:3}]),8997,JSON.stringify({email:'qa@example.test'}),'external','','');
 const result=assembleDemandReport(demandQueries.map(q=>({results:db.prepare(q).all('[]','[]')})));
 assert.equal(result.requests,1);assert.equal(result.requestedUnits,2);assert.equal(result.potentialValue,198);assert.equal(result.contacts,1);assert.equal(result.sources[0].name,'Instagram');db.close();
});

test('private owner contact matching excludes known internal submissions without guessing other identities',()=>{const known={emails:['owner@outside.invalid'],mobiles:['9000000000']};assert.equal(requestTraffic({email:' OWNER@outside.invalid '},'',false,known),'test');assert.equal(requestTraffic({mobile:'9000000000'},'',false,known),'test');assert.equal(requestTraffic({email:'buyer@outside.invalid'},'',false,known),'external')});
test('legacy selections without a contact remain separate from customer requests',()=>{const result=aggregateDemand([{reference:'legacy',status:'placed',details:{},total:123,items:[{slug:'set',price:123,quantity:1}]}]);assert.equal(result.requests,0);assert.equal(result.legacySelections,1);assert.equal(result.potentialValue,0)});

test('full SQL demand excludes private owner contacts and retains contactless legacy selections separately',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const {demandQueries,assembleDemandReport}=await import('../lib/demand-report.mjs');const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE orders(reference TEXT,status TEXT,items TEXT,total INTEGER,details TEXT,traffic_type TEXT,utm_source TEXT,referrer TEXT)');const insert=db.prepare('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?)');for(const [ref,details] of [['owner-email',{email:' OWNER@outside.invalid '}],['owner-mobile',{mobile:'9000000000'}],['legacy',{}],['buyer',{email:'buyer@outside.invalid'}]])insert.run(ref,'placed',JSON.stringify([{slug:'set',name:'Set',price:100,quantity:1}]),100,JSON.stringify(details),'external','','');const report=assembleDemandReport(demandQueries.map(q=>({results:db.prepare(q).all(JSON.stringify(['owner@outside.invalid']),JSON.stringify(['9000000000']))})));assert.equal(report.requests,1);assert.equal(report.potentialValue,100);assert.equal(report.requestedUnits,1);assert.equal(report.legacySelections,1);db.close();
});
