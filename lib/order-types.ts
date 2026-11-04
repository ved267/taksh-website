export type OrderDetails = {
 fullName:string;mobile:string;email:string;pincode:string;house:string;street:string;city:string;state:string;whatsappConsent:boolean;
 landmark?:string;paymentPreference?:string;
};
export type OrderItem = {slug:string;name:string;setNumber:string;level?:string;price:number;quantity:number};
export type StoredOrder = {
 id:string;token_hash:string;reference:string;created_at:string;updated_at:string;placed_at:string|null;
 currency?:string;traffic_type?:string;referrer?:string;status:'cart'|'draft'|'placed';version:number;last_step:number;items:string;total:number;details:string;
 device_type:string;arrival_page:string;utm_source:string;utm_medium:string;utm_campaign:string;email_status:string;
};
export type PublicOrder = {measurementExcluded?:boolean;reference:string;version:number;status:StoredOrder['status'];lastStep:number;createdAt:string;items:OrderItem[];total:number;details:OrderDetails;emailStatus:string};
export type CheckoutResponse = {order:PublicOrder|null;error?:string};
export type SupportRow = {id:string;created_at:string;set_slug:string;description:string;mobile:string;photo_key:string|null;photo_type:string|null};
export type SubscriptionRow = {created_at:string;mobile:string;consent:number};
export type EnquiryRow = {reference:string;created_at:string;name:string;mobile:string;email:string;topic:string;message:string};
export const errorMessage=(error:unknown,fallback='Could not save. Please try again.')=>error instanceof Error?error.message:fallback;
