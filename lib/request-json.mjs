// Bound both response headers and body. Never automatically retry a submission.
export async function requestJson(url,options={},timeoutMs=20_000){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(url,{...options,signal:controller.signal});
  const data=await response.json();
  return {response,data};
 }catch(error){
  if(controller.signal.aborted)throw new Error('The connection took too long. Your details are still in this tab. Please try again.');
  throw error;
 }finally{clearTimeout(timer)}
}
