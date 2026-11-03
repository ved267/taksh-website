import {SiteLink} from '@/components/taksh/site-link';
import {catalogueProducts as products,type Product} from '@/lib/shop';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';

export function Logo({reversed=false,native=false}:{reversed?:boolean;native?:boolean}){const Tag=native?'a':SiteLink;return <Tag href="/" className="logo" aria-label="Taksh home"><img src={imageAsset(reversed?'/logo-reversed.png':'/logo-primary.png')} alt="Taksh" width="780" height="272" /></Tag>}
export function Eyebrow({children}:{number:string,children:React.ReactNode}){return <div className="eyebrow">{children}</div>}

export function ProductImage({p,slug,className='',priority=false,sizes}:{p?:Product,slug?:string,className?:string,priority?:boolean,sizes?:string}){const product=p||products.find(x=>x.slug===slug);if(!product?.image)return null;const info=imageInfo(product.image);return <div className={'product-photo '+className}><img src={imageAsset(product.image)} srcSet={imageSrcSet(product.image)} sizes={sizes??(priority?'(max-width:900px) 100vw, 50vw':'(max-width:640px) 45vw, (max-width:1100px) 30vw, 360px')} alt={product.imageAlt||"The gold Vikram lander and Pragyan rover on a grey lunar display base"} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" width={info?.width||product.imageWidth||1800} height={info?.height||product.imageHeight||1800}/></div>}
