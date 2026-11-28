'use client';
import {useEffect,useState} from 'react';
import './address-search.css';
// PIN code and area lookup from public/pin (India Post directory, see scripts/build-pin-data.py). No outside service sees what people type.
export type AddressPick={pincode:string;street:string;city:string;state:string};
type Hit={name:string;pin:string;city:string;state:string};
type PinFile=Record<string,[string,number,string[]]>;
const cache=new Map<string,Promise<unknown>>();
function load<T>(path:string):Promise<T>{if(!cache.has(path))cache.set(path,fetch(path).then(r=>r.ok?r.json():null).catch(()=>{cache.delete(path);return null}));return cache.get(path) as Promise<T>}
const words=(s:string)=>s.toLowerCase().match(/[a-z0-9]+/g)||[];
export async function lookupPin(pin:string){const states=await load<string[]>('/pin/states.json')||[],e=(await load<PinFile>(`/pin/p/${pin.slice(0,2)}.json`))?.[pin];return e?{city:e[0],state:states[e[1]]||''}:null}
async function search(text:string):Promise<Hit[]>{
 const states=await load<string[]>('/pin/states.json')||[],q=text.trim().toLowerCase();
 const hit=async(name:string,pin:string)=>{const e=(await load<PinFile>(`/pin/p/${pin.slice(0,2)}.json`))?.[pin];return {name,pin,city:e?.[0]||'',state:e?states[e[1]]||'':''}};
 if(/^\d{3,6}$/.test(q)){const f=await load<PinFile>(`/pin/p/${q.slice(0,2)}.json`)||{},out:Hit[]=[];for(const pin of Object.keys(f).sort())if(pin.startsWith(q)){const [city,st,offices]=f[pin];for(const name of q.length===6?offices:offices.slice(0,1))out.push({name,pin,city,state:states[st]||''});if(out.length>=8)break}return out.slice(0,8)}
 const typed=words(q),key=[...typed].filter(w=>/^[a-z]{3,}$/.test(w)).sort((a,b)=>b.length-a.length)[0];if(!key)return [];
 const list=await load<[string,string][]>(`/pin/w/${key.slice(0,3)}.json`);if(!Array.isArray(list))return [];
 const near=list.filter(([n])=>words(n).some(w=>w.startsWith(key))).map(([n,p])=>({n,p,s:typed.filter(t=>words(n).some(w=>w.startsWith(t))).length})).sort((a,b)=>b.s-a.s).slice(0,40);
 const hits=await Promise.all(near.map(x=>hit(x.n,x.p)));
 return hits.filter(h=>typed.every(t=>words(`${h.name} ${h.city} ${h.state} ${h.pin}`).some(w=>w.startsWith(t)))).slice(0,8);
}
// Suggestions only help: whatever is typed is kept, and nothing here can stop the request.
export function AddressSearch({initial,onText,onPick}:{initial:string;onText:(text:string)=>void;onPick:(p:AddressPick)=>void}){
 const [q,setQ]=useState(initial),[hits,setHits]=useState<Hit[]>([]),[open,setOpen]=useState(false),[active,setActive]=useState(0);
 useEffect(()=>{const t=q.trim();if(t.length<3)return;let live=true;const id=setTimeout(()=>search(t).then(h=>{if(!live)return;setHits(h);setActive(0)}),150);return()=>{live=false;clearTimeout(id)}},[q]);
 const pick=(h:Hit)=>{onPick({pincode:h.pin,street:h.name,city:h.city,state:h.state});setQ(`${h.name}, ${h.city}, ${h.state} ${h.pin}`);setOpen(false)};
 const show=open&&q.trim().length>=3&&hits.length>0;
 return <div className="field address-search"><label htmlFor="pincode">PIN code or area</label>
 <input id="pincode" name="pincode" data-clarity-mask="True" value={q} placeholder="Type your PIN code or area" role="combobox" aria-expanded={show} aria-controls="address-hits" aria-autocomplete="list" aria-activedescendant={show?`address-hit-${active}`:undefined} autoComplete="off" enterKeyHint="next"
  onChange={e=>{setQ(e.target.value);onText(e.target.value);setOpen(true)}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}
  onKeyDown={e=>{if(!show)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive(a=>(a+(e.key==='ArrowDown'?1:hits.length-1))%hits.length)}else if(e.key==='Enter'){e.preventDefault();pick(hits[active])}else if(e.key==='Escape')setOpen(false)}}/>
 {show&&<ul id="address-hits" role="listbox">{hits.map((h,i)=><li id={`address-hit-${i}`} key={h.pin+h.name} role="option" aria-selected={i===active} onMouseDown={e=>{e.preventDefault();pick(h)}}><strong>{h.name}</strong><span>{h.city}, {h.state} · {h.pin}</span></li>)}</ul>}</div>;
}
