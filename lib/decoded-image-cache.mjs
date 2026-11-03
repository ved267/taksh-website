// Reuse in-flight and decoded images; failed loads remain retryable.
export function createDecodedImageCache(load,limit=8){
 const entries=new Map();
 return request=>{
  const key=JSON.stringify([request.src,request.sizes,request.viewportWidth,request.pixelRatio]);
  if(entries.has(key)){const value=entries.get(key);entries.delete(key);entries.set(key,value);return value}
  const pending=Promise.resolve().then(()=>load(request));
  entries.set(key,pending);
  pending.catch(()=>{if(entries.get(key)===pending)entries.delete(key)});
  if(entries.size>limit)entries.delete(entries.keys().next().value);
  return pending;
 };
}
