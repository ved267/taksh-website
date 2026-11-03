// One browser-side source of truth: hydration reads the saved snapshot, and
// same-tab/cross-tab changes notify React without effect-driven reinitialisation.
let raw:string|null|undefined;
export function bagSnapshot(){
 if(raw===undefined){try{raw=localStorage.getItem('taksh-bag')}catch{raw=null}}
 return raw;
}
export function subscribeBag(update:()=>void){
 const otherTab=(event:StorageEvent)=>{if(event.key==='taksh-bag'||event.key===null){raw=event.key===null?null:event.newValue;update()}};
 window.addEventListener('storage',otherTab);window.addEventListener('taksh-bag-updated',update);
 return()=>{window.removeEventListener('storage',otherTab);window.removeEventListener('taksh-bag-updated',update)};
}
export function writeBag(value:string){raw=value;try{localStorage.setItem('taksh-bag',value)}catch{}window.dispatchEvent(new Event('taksh-bag-updated'))}
