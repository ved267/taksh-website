'use client';
import {useStore} from './store';
import {products} from '@/lib/shop';
// The only client code at the end of a set page. Takes the slug, not the whole product, to keep the page light.
export function SetEndingButton({slug,label}:{slug:string;label:string}){const{add,ready}=useStore();const p=products.find(x=>x.slug===slug);if(!p)return null;return <button className="button primary" disabled={!ready} aria-label={`Add ${p.name} to bag`} onClick={()=>add(p)}>{label}</button>}
