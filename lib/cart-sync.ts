import {internalTracking} from './tracking';
import {requestJson} from './request-json.mjs';
import type {CartItem} from './shop';
let latest:CartItem[]=[];let timer:ReturnType<typeof setTimeout>|undefined;let queue=Promise.resolve();let pending=false;
// Debounce quantity taps and serialise writes so an older response cannot win.
export function syncCart(items:CartItem[]){latest=items.map(i=>({...i}));pending=true;clearTimeout(timer);timer=setTimeout(flushCart,400)}
export function flushCart(){clearTimeout(timer);if(!pending)return queue;pending=false;const items=latest;let attribution={};try{attribution=JSON.parse(sessionStorage.getItem('taksh-arrival')||'{}')}catch{}
 queue=queue.then(async()=>{try{const {response}=await requestJson('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,attribution,internal:internalTracking()}),keepalive:true},8000);if(!response.ok)pending=true}catch{pending=true}});return queue;
}
