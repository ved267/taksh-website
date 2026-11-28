// City and state for a 6-digit PIN, from the India Post directory in public/pin (built by scripts/build-pin-data.py).
type PinFile=Record<string,[string,number,string[]]>;
const cache=new Map<string,Promise<unknown>>();
function load<T>(path:string):Promise<T|null>{if(!cache.has(path))cache.set(path,fetch(path).then(r=>r.ok?r.json():null).catch(()=>{cache.delete(path);return null}));return cache.get(path) as Promise<T|null>}
export async function lookupPin(pin:string){const [states,file]=await Promise.all([load<string[]>('/pin/states.json'),load<PinFile>(`/pin/p/${pin.slice(0,2)}.json`)]);const e=file?.[pin];return e&&states?{city:e[0],state:states[e[1]]||''}:null}
