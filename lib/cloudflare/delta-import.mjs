const keys={orders:'id',enquiries:'id',subscriptions:'id',support:'id',reporting_state:'key'};
function value(input){if(input===null)return'NULL';if(typeof input==='number'&&Number.isFinite(input))return String(input);if(typeof input==='string')return"'"+input.replaceAll("'","''")+"'";throw new Error('Unsupported business value.');}
export function completeExportRows(pages,key='id'){
 if(!Array.isArray(pages)||!pages.length)throw new Error('Incomplete export pages.');let expected=0;const rows=[],ids=new Set();
 for(let i=0;i<pages.length;i++){
  const page=pages[i],p=page.model_projection;
  if(page.offset!==expected||!Array.isArray(page.rows)||!p||!Object.hasOwn(p,'next_offset')||p.truncated||p.truncated_values||p.omitted_columns||p.omitted_rows)throw new Error('Incomplete or truncated export.');
  const terminal=p.next_offset===null;
  if(terminal!==(i===pages.length-1)||(page.has_more!==undefined&&page.has_more!==!terminal)||(page.limit!==undefined&&page.rows.length>page.limit))throw new Error('Invalid export termination.');
  expected+=page.rows.length;if(!terminal&&(!page.rows.length||p.next_offset!==expected))throw new Error('Noncontiguous export offsets.');
  for(const row of page.rows){if(typeof row[key]!=='string'||!row[key]||ids.has(row[key]))throw new Error('Missing or duplicate export primary key.');ids.add(row[key]);rows.push(row);}
 }
 return rows;
}
export function reconcileBusinessRow(table,source,target){
 if(!keys[table])throw new Error('Only business tables may be imported.');if(!target)return{action:'insert'};
 const columns=[...new Set([...Object.keys(source),...Object.keys(target)])].sort(),differences=columns.filter(key=>source[key]!==target[key]);
 if(!differences.length)return{action:'keep',reason:'exact'};
 if(table==='orders'){
  if(['id','token_hash','reference','created_at'].some(key=>source[key]!==target[key]))return{action:'conflict',reason:'identity'};
  if(source.status==='placed'&&target.status==='placed'){
   if(differences.length===1&&differences[0]==='email_status'){
    if(target.email_status==='not_configured'&&['sent','failed','not_requested'].includes(source.email_status))return{action:'update',reason:'late-email-completion'};
    if(source.email_status==='not_configured'&&['sent','failed','not_requested'].includes(target.email_status))return{action:'keep',reason:'target-email-completed'};
   }
   return{action:'conflict',reason:'submitted-order-fields'};
  }
  if(target.status==='placed')return source.updated_at<=target.updated_at?{action:'keep',reason:'target-submitted-after-source-draft'}:{action:'conflict',reason:'later-source-draft'};
  if(source.status==='placed')return{action:'update',reason:'source-submitted'};
  if(source.updated_at>target.updated_at)return{action:'update',reason:'source-newer-draft'};
  if(source.updated_at<target.updated_at)return{action:'keep',reason:'target-newer-draft'};
  return{action:'conflict',reason:'same-time-different-draft'};
 }
 if(table==='reporting_state'){
  if(source.updated_at>target.updated_at)return{action:'update',reason:'source-newer-report'};
  if(source.updated_at<target.updated_at)return{action:'keep',reason:'target-newer-report'};
 }
 return{action:'conflict',reason:'unresolved-fields'};
}
export function businessUpsertSql(table,row,target){
 const key=keys[table];if(!key)throw new Error('Only business tables may be imported.');
 const columns=Object.keys(row);if(!columns.length||columns.some(name=>!/^[a-z_][a-z0-9_]*$/i.test(name)))throw new Error('Invalid business column.');if(!(key in row))throw new Error('Missing business primary key.');
 const decision=reconcileBusinessRow(table,row,target);if(decision.action==='conflict')throw new Error('Unresolved business import conflict.');if(decision.action==='keep')return'';
 const insert=`INSERT INTO "${table}" (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(c=>value(row[c])).join(',')})`;
 if(decision.action==='insert')return insert+` ON CONFLICT("${key}") DO NOTHING;`;
 // Compare-and-swap every field read during planning; never overwrite a concurrent write.
 const guard=Object.keys(target).map(c=>{if(!/^[a-z_][a-z0-9_]*$/i.test(c))throw new Error('Invalid business column.');return `"${table}"."${c}" IS ${value(target[c])}`}).join(' AND ');
 const updates=columns.filter(c=>c!==key).map(c=>`"${c}"=excluded."${c}"`).join(',');
 return insert+` ON CONFLICT("${key}") DO UPDATE SET ${updates} WHERE ${guard};`;
}
export const businessTables=Object.keys(keys);
