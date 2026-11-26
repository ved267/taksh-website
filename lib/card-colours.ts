// Owner decisions, 26 Nov 2026: every set has its own light colour, used as a frame around its true photo (never over the photo).
export function cardImage(p:{image?:string}){return p.image||''}
// Owner decision, 26 Nov 2026: Padma, Ram Mandir, Gully Cricket and the Map lead; Ulta Chashma and Yellow Taxi come last.
export const setOrder=['padma','ram-mandir','gully-cricket','map-of-india','chandrayaan-3','kamdhenu','surajmukhi','1983-trophy','yellow-taxi','nonsense'];
export const bySetOrder=(a:{slug:string},b:{slug:string})=>{const r=(s:string)=>{const i=setOrder.indexOf(s);return i<0?setOrder.length:i};return r(a.slug)-r(b.slug)};
