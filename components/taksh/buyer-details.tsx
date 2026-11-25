import {type Product} from '@/lib/shop';
import {SiteLink} from './site-link';
import {policyDelivery,policyRefund,policyMissing} from '@/lib/policy';
export function BuyerDetails({p}:{p:Product}){return <details className="buyer-details"><summary>Size, delivery & returns</summary><div><p><strong>Assembled size</strong><br/>{p.dimensions}</p><p className="small muted">Size and build-time guidance are estimates pending final product checks.</p><p>{policyDelivery}</p><p>{policyRefund}<br/>{policyMissing}</p><SiteLink href="/returns">Returns and missing pieces</SiteLink></div></details>}
