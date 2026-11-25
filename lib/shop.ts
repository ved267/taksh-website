import data from './catalogue.json';
import {levelForPieces} from './levels.mjs';
export const catalogueProducts=data.products.map(p=>({...p,level:levelForPieces(p.pieces)})) as Product[];
export const products=catalogueProducts;
export type Product={gallery?:{image:string;label:string;alt:string}[];catalogueOnly?:boolean;slug:string;name:string;shortName?:string;subtitle?:string;collection?:string;level:string;pieces:number;approximate?:boolean;price:number;setNumber:string;age:number;maxAge?:number;buildTime:string;dimensions:string;inTheBox?:string;weight:string;image?:string;imageAlt?:string;imageWidth?:number;imageHeight?:number;description:string;stories:Record<'build'|'details'|'process'|'display',{title:string;text:string}>};
export type CartItem={slug:string;quantity:number};
export const money=(amount:number)=>'₹'+new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(amount);
export {levels,catalogueLevels,normaliseLevel,levelDescription} from './levels.mjs';
export const brand={whatsapp:'919830200960',instagram:'taksh.build',email:'[EMAIL]',legalName:'[LEGAL NAME]',address:'[ADDRESS]',gstin:'[GSTIN]',grievance:'[NAME, EMAIL]',country:'[COUNTRY]',bis:'[BIS_LICENCE]',pixel:'29283360584637655',clarity:'z9fvuelbga',ga:'G-NHQFYHTNLP'};
export const origin='https://taksh.store';
export function pageMeta(title:string,description:string){return {title:`${title} | Taksh`,description,openGraph:{title:`${title} | Taksh`,description,images:[{url:`${origin}/og.png`,width:1200,height:630}]},twitter:{card:'summary_large_image' as const,title:`${title} | Taksh`,description,images:[`${origin}/og.png`]}}}
export const shots=['Built model, plain background','Box beside the model','30-second build video','Model held in two hands for scale','Close-up detail: shape','Close-up detail: connection','Close-up detail: finish','Size with height, width and depth in cm','Model on a shelf in a home',"What’s in the box: numbered bags and book",'The box'];

export const productMoney=(p:Product,value=p.price)=>money(value);
export const pieceLabel=(p:Product)=>(p.approximate?'About ':'')+p.pieces.toLocaleString('en-IN');

export const ageLabel=(p:Product)=>p.maxAge?`${p.age}–${p.maxAge}`:`${p.age}+`;

/** "In the box" line for set pages: catalogue text where a set has its own, then the built size. */
export function inTheBox(p:Pick<Product,'dimensions'|'inTheBox'>){return `${p.inTheBox??'In the box: numbered bags, a printed instruction book and spare pieces.'} Built size: ${p.dimensions.replace(/^About/,'about').replace(/\.\s*Life-size\.?$/,', life-size').replace(/\.$/,'')}.`}
