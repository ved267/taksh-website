// Cancel obsolete image requests without replacing the last usable photograph.
export function createImageSelection(load, commit, status) {
 let sequence=0;
 return {
  async select(index){const token=++sequence;status('loading');try{const result=await load(index);if(token===sequence){commit(index,result);status('ready')}}catch{if(token===sequence)status('error')}},
  cancel(){sequence++}
 };
}
export function nextCheckoutField(id){const fields=['fullName','mobile','email','request-submit'];const index=fields.indexOf(id);return index<0?null:fields[index+1]??null}
export function filterCatalogue(products,{level='all',budget='all',age='all',sort='featured'}={}){
 const selected=products.filter(p=>(level==='all'||p.level===level)&&(budget==='all'||p.price<=Number(budget))&&(age==='all'||p.age<=Number(age)));
 if(sort==='price-asc')selected.sort((a,b)=>a.price-b.price);else if(sort==='price-desc')selected.sort((a,b)=>b.price-a.price);
 return selected;
}
