import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({Date,Map,Set});
vm.runInContext(await fs.readFile(new URL('../integrations/customer-sheet.gs',import.meta.url),'utf8'),context);
function fakeSheet(){const rows=Array.from({length:5},()=>Array(17).fill(''));rows[4][0]='Before';rows[4][12]='TK-1';rows[4][15]='Contacted';rows[4][16]='Call Friday';return {rows,getMaxRows:()=>1000,insertRowsBefore(){throw new Error('No capacity expansion expected')},getRange(r,c,h=1,w=1){return {getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??'')),getDisplayValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>String(rows[r-1+i]?.[c-1+j]??''))),setNumberFormat(){return this},setValue(v){return this.setValues([[v]])},setValues(values){values.forEach((a,i)=>{rows[r-1+i]??=Array(17).fill('');a.forEach((v,j)=>rows[r-1+i][c-1+j]=v)});return this}}}}}
const request=(ref,name)=>({reference:ref,values:[name,'9000000000','Yellow Taxi × 1',1,1749,'test@example.com','Kolkata','West Bengal','700001','Test address','Yes','2026-10-12T06:00:00.000Z',ref,'test','test']});
test('sync retries preserve follow-up notes and never duplicate a request',()=>{
 const s=fakeSheet();const batch=[request('TK-1','After'),request('TK-2','New buyer')];
 context.applyRequests_(s,batch);context.applyRequests_(s,batch);
 assert.equal(s.rows[4][0],'After');assert.equal(s.rows[4][15],'Contacted');assert.equal(s.rows[4][16],'Call Friday');
 assert.equal(s.rows.filter(r=>r[12]==='TK-2').length,1);assert.equal(s.rows[5][15],'New');assert.equal(s.rows[5][11].toISOString(),'2026-10-12T06:00:00.000Z');
});
