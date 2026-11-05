// Server-only owner configuration; never send these lists to the browser or GA.
import {runtime} from '@/db';
import {parseInternalContacts,requestTraffic,preserveTraffic} from './demand-domain.mjs';
export const internalContacts=parseInternalContacts(runtime.INTERNAL_CONTACTS);
export const storedTraffic=(row:{traffic_type?:string;details:string})=>preserveTraffic(row.traffic_type,requestTraffic(JSON.parse(row.details),'',false,internalContacts));
