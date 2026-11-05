import test from'node:test';import assert from'node:assert/strict';import{reconcileBusinessRow,completeExportRows}from'../lib/cloudflare/delta-import.mjs';
test('placed order reconciliation compares all fields and only permits explicit email completion',()=>{
 const source={id:'test',token_hash:'synthetic-hash',reference:'TEST',created_at:'2026-11-01',updated_at:'2026-11-05',placed_at:'2026-11-05',status:'placed',details:'{}',items:'[]',total:1,currency:'INR',email_status:'sent',utm_source:'synthetic'};
 assert.equal(reconcileBusinessRow('orders',source,{...source,email_status:'not_configured'}).action,'update');
 for(const key of ['token_hash','reference','placed_at','utm_source'])assert.equal(reconcileBusinessRow('orders',source,{...source,[key]:'different',updated_at:'2026-11-04'}).action,'conflict');
 assert.equal(reconcileBusinessRow('orders',{...source,email_status:'not_configured'},source).action,'keep');
 assert.equal(reconcileBusinessRow('orders',source,{...source,email_status:'failed'}).action,'conflict');
 assert.equal(reconcileBusinessRow('enquiries',{id:'test',message:'one'},{id:'test',message:'two'}).action,'conflict');
});
test('export requires a complete contiguous sequence from offset zero with one final terminal page',()=>{
 const page=(offset,rows,next_offset)=>({offset,rows,model_projection:{next_offset,truncated:false,omitted_columns:0,omitted_rows:0}});
 assert.equal(completeExportRows([page(0,[{id:'a'}],1),page(1,[{id:'b'}],null)]).length,2);
 for(const pages of [[page(100,[{}],null)],[page(0,[{}],1)],[page(0,[{}],null),page(1,[{}],null)],[page(0,[{}],1),page(2,[{}],null)],[page(0,[{}],1),page(0,[{}],null)],[page(0,[{id:'a'}],1),page(1,[{id:'a'}],null)]])assert.throws(()=>completeExportRows(pages),/export/i);
});
