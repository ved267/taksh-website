import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({Date,Map,Set});
const awaitSource=await fs.readFile(new URL('../integrations/customer-sheet.gs',import.meta.url),'utf8');vm.runInContext(awaitSource,context);
function fakeSheet(){const rows=Array.from({length:5},()=>Array(17).fill(''));rows[4][0]='Before';rows[4][12]='TK-1';rows[4][15]='Contacted';rows[4][16]='Call Friday';return {rows,getMaxRows:()=>1000,insertRowsBefore(){throw new Error('No capacity expansion expected')},getRange(r,c,h=1,w=1){return {getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??'')),getDisplayValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>String(rows[r-1+i]?.[c-1+j]??''))),setNumberFormat(){return this},setValue(v){return this.setValues([[v]])},setValues(values){values.forEach((a,i)=>{rows[r-1+i]??=Array(17).fill('');a.forEach((v,j)=>rows[r-1+i][c-1+j]=v)});return this}}}}}
const request=(ref,name)=>({reference:ref,values:[name,'9000000000','Yellow Taxi × 1',1,1749,'test@example.com','Kolkata','West Bengal','700001','Test address','Yes','2026-10-12T06:00:00.000Z',ref,'test','test']});
test('sync retries preserve follow-up notes and never duplicate a request',()=>{
 const s=fakeSheet();const batch=[request('TK-1','After'),request('TK-2','New buyer')];
 context.applyRequests_(s,batch);context.applyRequests_(s,batch);
 assert.equal(s.rows[4][0],'After');assert.equal(s.rows[4][15],'Contacted');assert.equal(s.rows[4][16],'Call Friday');
 assert.equal(s.rows.filter(r=>r[12]==='TK-2').length,1);assert.equal(s.rows[5][15],'New');assert.equal(s.rows[5][11].toISOString(),'2026-10-12T06:00:00.000Z');
});

test('test requests do not queue owner alerts and repeat application adds no demand',()=>{const s=fakeSheet();const row={...request('TK-QA','Taksh QA'),isTest:true};assert.equal(context.applyRequests_(s,[row]),0);assert.equal(context.applyRequests_(s,[row]),0);assert.equal(s.rows.filter(r=>r[12]==='TK-QA').length,0)});

test('partial Sheet failure retries exactly once without losing pending owner alerts',()=>{
 const s=fakeSheet(),props=new Map([['TAKSH_SYNC_KEY','a'.repeat(64)],['INITIAL_IMPORT_DONE','yes']]);let fail=true;
 const c=vm.createContext({Date,Map,Set,JSON,Number,String,Error,
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},
 SpreadsheetApp:{getActiveSpreadsheet:()=>({getId:()=> '1PP8TvtPv5nD9XAbedCjQ7woxrjMu6G0ygUWRgfol9X0',getSheetByName:()=>s,getUrl:()=>''}),flush(){if(fail){fail=false;throw new Error('Injected flush failure')}}},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v),setProperties:p=>Object.entries(p).forEach(([k,v])=>props.set(k,v))})},
 UrlFetchApp:{fetch:(_url,options)=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify(JSON.parse(options.payload).action?{recorded:true}:{requests:[request('TK-PARTIAL','New buyer'),{...request('TK-QA','QA'),isTest:true}],nextCursor:{at:'2026-10-12T06:00:00.000Z',id:'last'},hasMore:false})})},
 MailApp:{getRemainingDailyQuota:()=>0},Utilities:{formatDate:()=> 'test time'}});
 // This test does not need the status cell; all customer data uses numeric ranges.
 const original=s.getRange;s.getRange=(r,...args)=>typeof r==='string'?{setValue(){}}:original(r,...args);
 vm.runInContext(awaitSource,c);assert.throws(()=>c.syncTakshRequests(),/Injected flush/);assert.equal(s.rows.filter(r=>r[12]==='TK-PARTIAL').length,1);
 c.syncTakshRequests();assert.equal(s.rows.filter(r=>r[12]==='TK-PARTIAL').length,1);assert.equal(s.rows.filter(r=>r[12]==='TK-QA').length,0);assert.equal(JSON.parse(props.get('SYNC_STATE')).pending,1);
 c.syncTakshRequests();assert.equal(JSON.parse(props.get('SYNC_STATE')).pending,1);
});
