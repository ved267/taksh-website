export function checkSameOrigin(req){
 const origin=req.headers.get('origin'),target=new URL(req.url);
 // Next may normalise the internal URL to localhost. Host retains the browser's address.
 const host=req.headers.get('host');if(host)target.host=host;
 if((origin&&origin!==target.origin)||req.headers.get('sec-fetch-site')==='cross-site')throw new Error('This request is not allowed.');
}
