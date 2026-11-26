// Owner decision, 26 Nov 2026: every set has its own light colour. The studio photos of nine sets are
// recoloured to it (public/<set>/gallery-card.webp, backdrop only, shadows kept); Kamdhenu has no studio photo yet.
const recoloured=new Set(['padma','ram-mandir','gully-cricket','map-of-india','chandrayaan-3','surajmukhi','1983-trophy','yellow-taxi','nonsense']);
export function cardImage(p:{slug:string;image?:string}){return recoloured.has(p.slug)&&p.image?p.image.replace(/[^/]+$/,'gallery-card.webp'):p.image||''}
