const keys={orders:'id',enquiries:'id',subscriptions:'id',support:'id',reporting_state:'key'};
function value(input){if(input===null)return'NULL';if(typeof input==='number'&&Number.isFinite(input))return String(input);if(typeof input==='string')return"'"+input.replaceAll("'","''")+"'";throw new Error('Unsupported business value.');}
export function businessUpsertSql(table,row){
 const key=keys[table];if(!key)throw new Error('Only business tables may be imported.');
 const columns=Object.keys(row);if(!columns.length||columns.some(name=>!/^[a-z_][a-z0-9_]*$/i.test(name)))throw new Error('Invalid business column.');if(!(key in row))throw new Error('Missing business primary key.');
 const insert=`INSERT INTO "${table}" (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${columns.map(c=>value(row[c])).join(',')})`;
 if(!['orders','reporting_state'].includes(table))return insert+` ON CONFLICT("${key}") DO NOTHING;`;
 const updates=columns.filter(c=>c!==key).map(c=>`"${c}"=excluded."${c}"`).join(',');
 const condition=table==='orders'?`orders.status!='placed' AND (excluded.status='placed' OR orders.updated_at<=excluded.updated_at)`:`reporting_state.updated_at<=excluded.updated_at`;
 return insert+` ON CONFLICT("${key}") DO UPDATE SET ${updates} WHERE ${condition};`;
}
export const businessTables=Object.keys(keys);
