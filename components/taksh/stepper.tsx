'use client';
// Kept independent of select menus: a quantity control needs no menu library.
export function Stepper({value,onChange,label='Quantity'}:{value:number;onChange:(n:number)=>void;label?:string}){return <div className="stepper" role="group" aria-label={label}><button aria-label={`Decrease ${label.toLowerCase()}`} disabled={value<=1} onClick={()=>onChange(value-1)}>−</button><output aria-label={label}>{value}</output><button aria-label={`Increase ${label.toLowerCase()}`} disabled={value>=3} onClick={()=>onChange(value+1)}>+</button></div>}
