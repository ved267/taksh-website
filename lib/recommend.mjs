// "You might also like" in the bag: sets that pair with what is already there, never one already in the bag.
// Each set lists its closest companions first (owner set order breaks ties).
export const companions={
 'padma':['surajmukhi','kamdhenu','ram-mandir'],
 'surajmukhi':['padma','kamdhenu','yellow-taxi'],
 'ram-mandir':['kamdhenu','padma','map-of-india'],
 'kamdhenu':['ram-mandir','padma','surajmukhi'],
 'gully-cricket':['1983-trophy','yellow-taxi','map-of-india'],
 '1983-trophy':['gully-cricket','map-of-india','chandrayaan-3'],
 'chandrayaan-3':['map-of-india','1983-trophy','ram-mandir'],
 'map-of-india':['chandrayaan-3','ram-mandir','1983-trophy'],
 'yellow-taxi':['gully-cricket','nonsense','map-of-india'],
 'nonsense':['yellow-taxi','gully-cricket','padma']
};
/** @template {{slug:string,catalogueOnly?:boolean}} P @param {string[]} inBag @param {P[]} sets @returns {P[]} */
export function recommend(inBag,sets,count=3){
 const score=new Map();for(const slug of inBag)(companions[slug]||[]).forEach((s,i)=>score.set(s,(score.get(s)||0)+3-i));
 return sets.map((p,i)=>({p,i})).filter(({p})=>!p.catalogueOnly&&!inBag.includes(p.slug)).sort((a,b)=>(score.get(b.p.slug)||0)-(score.get(a.p.slug)||0)||a.i-b.i).slice(0,count).map(x=>x.p);
}
