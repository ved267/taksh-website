import assets from './image-assets.json';
type ImageAsset={original?:string;width:number;height:number;fullWidth:number;full:string;thumb:string;card:string;small:string;medium:string;large:string};
const images:Record<string,ImageAsset>=assets;
export function imageAsset(src:string,size:'full'|'thumb'|'card'|'small'|'medium'|'large'='full'){return images[src]?.[size]||src}
export function imageInfo(src:string){return images[src]}
export function imageSrcSet(src:string){
 const image=images[src];
 if(!image)return undefined;
 const candidates=new Map<number,string>();
 for(const [size,width] of [['card',320],['small',600],['medium',900],['large',1200],['full',image.fullWidth]] as const){
  candidates.set(Math.min(width,image.width),image[size]);
 }
 return [...candidates].map(([width,url])=>`${url} ${width}w`).join(', ');
}

export function imageOriginal(src:string){return images[src]?.original||src}
