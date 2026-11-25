'use client';
import {useEffect,useState} from 'react';
import {ProductGrid} from './cards';
import {products} from '@/lib/shop';
import {filterCatalogue} from '@/lib/experience-domain.mjs';
const filters=[{label:'All sets',value:'all'},{label:'Masters',value:'Master'},{label:'Craft',value:'Craft'}];
const defaults={level:'all',budget:'all',age:'all',sort:'featured'};
type Filters=typeof defaults;
const allowed:Record<keyof Filters,string[]>={level:['all','Master','Craft'],budget:['all','2500','5000','7500'],age:['all'],sort:['featured','price-asc','price-desc']};
function fromUrl(){const query=new URLSearchParams(location.search);return Object.fromEntries(Object.entries(defaults).map(([key,value])=>[key,allowed[key as keyof Filters].includes(query.get(key)||'')?query.get(key):value])) as Filters}
export function Catalogue(){
 const [filter,setFilter]=useState(defaults);
 useEffect(()=>{const restore=()=>setFilter(fromUrl());restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore)},[]);
 function change(next:Filters){setFilter(next);const url=new URL(location.href);for(const [key,value] of Object.entries(next)){if(value===defaults[key as keyof Filters])url.searchParams.delete(key);else url.searchParams.set(key,value)}history.pushState(null,'',url.pathname+url.search)}
 const selected=filterCatalogue(products,filter);
 const active=Object.entries(filter).some(([key,value])=>value!==defaults[key as keyof Filters]);
 return <><div className="catalogue-filters" role="group" aria-label="Filter sets by collection">{filters.map(f=><button key={f.value} aria-pressed={filter.level===f.value} onClick={()=>change({...filter,level:f.value})}>{f.label}</button>)}</div>
 <div className="catalogue-controls"><label>Budget<select value={filter.budget} onChange={e=>change({...filter,budget:e.target.value})}><option value="all">Any price</option><option value="2500">Under ₹2,500</option><option value="5000">Under ₹5,000</option><option value="7500">Under ₹7,500</option></select></label><label>Sort by<select value={filter.sort} onChange={e=>change({...filter,sort:e.target.value})}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
 <div className="catalogue-count"><p role="status">{selected.length} {selected.length===1?'set':'sets'} shown</p>{active&&<button onClick={()=>change(defaults)}>Clear filters</button>}</div>
 {selected.length?<ProductGrid items={selected} editorial={false}/>:<div className="empty-state"><h2>No sets match these filters.</h2><button className="button outline" onClick={()=>change(defaults)}>See all sets</button></div>}</>;
}
