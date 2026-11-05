// Full-population aggregates run only when the authenticated owner opens reports.
// The 5,000-row cap applies to the displayed customer list, never demand totals.
const eligible="traffic_type NOT IN ('test','automated') AND lower(COALESCE(json_extract(details,'$.email'),'')) NOT LIKE '%@example.test' AND lower(COALESCE(json_extract(details,'$.email'),'')) NOT LIKE '%@example.invalid' AND lower(trim(COALESCE(json_extract(details,'$.email'),''))) NOT IN (SELECT value FROM json_each(?)) AND COALESCE(json_extract(details,'$.mobile'),'') NOT IN (SELECT value FROM json_each(?))";
const contactable="(trim(COALESCE(json_extract(details,'$.email'),''))<>'' OR trim(COALESCE(json_extract(details,'$.mobile'),''))<>'')";
export const demandQueries=[
 `WITH eligible AS (SELECT * FROM orders WHERE ${eligible}) SELECT
 COUNT(CASE WHEN status='placed' AND ${contactable} THEN 1 END) requests,
 COALESCE(SUM(CASE WHEN status='placed' AND ${contactable} THEN total ELSE 0 END),0) potentialValue,
 COUNT(DISTINCT CASE WHEN status='placed' AND ${contactable} THEN CASE WHEN trim(COALESCE(json_extract(details,'$.email'),''))<>'' THEN 'email:'||lower(trim(json_extract(details,'$.email'))) WHEN COALESCE(json_extract(details,'$.mobile'),'')<>'' THEN 'mobile:'||json_extract(details,'$.mobile') END END) contacts,
 COUNT(CASE WHEN status='placed' AND NOT ${contactable} THEN 1 END) legacySelections,
 COUNT(CASE WHEN status='draft' THEN 1 END) drafts,
 COUNT(CASE WHEN status='cart' AND json_array_length(items)>0 THEN 1 END) carts FROM eligible`,
 `SELECT json_extract(i.value,'$.slug') slug,MAX(json_extract(i.value,'$.name')) name,COUNT(DISTINCT o.reference) requests,SUM(json_extract(i.value,'$.quantity')) units,SUM(json_extract(i.value,'$.quantity')*json_extract(i.value,'$.price')) potentialValue FROM orders o,json_each(o.items) i WHERE ${eligible} AND o.status='placed' AND ${contactable} GROUP BY slug`,
 `SELECT COALESCE(NULLIF(utm_source,''),NULLIF(referrer,''),'Direct / unknown') name,COUNT(*) requests FROM orders WHERE ${eligible} AND status='placed' AND ${contactable} GROUP BY name`
];
export function assembleDemandReport(results,catalogue=[]){const products=[...results[1].results];for(const p of catalogue)if(!products.some(r=>r.slug===p.slug))products.push({slug:p.slug,name:p.name,requests:0,units:0,potentialValue:0});return {...results[0].results[0],requestedUnits:products.reduce((n,p)=>n+p.units,0),paidOrders:0,products,sources:results[2].results}}
