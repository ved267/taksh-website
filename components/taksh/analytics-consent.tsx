'use client';
import {useState,useSyncExternalStore} from 'react';
import {usePathname} from 'next/navigation';
import {analyticsConfigured,analyticsChoiceKey,setAnalyticsConsent} from '@/lib/tracking';
import {analyticsEnabled} from '@/lib/consent-domain.mjs';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {SiteLink} from './site-link';
function subscribe(update:()=>void){
 const storage=(e:StorageEvent)=>{if(e.key===analyticsChoiceKey||e.key===null)location.reload()};
 window.addEventListener('taksh-analytics-updated',update);window.addEventListener('storage',storage);
 return()=>{window.removeEventListener('taksh-analytics-updated',update);window.removeEventListener('storage',storage)};
}
let choicesRequest=0;
let choicesTrigger:HTMLElement|null=null;
function requestChoices(){choicesTrigger=document.activeElement instanceof HTMLElement?document.activeElement:null;choicesRequest++;window.dispatchEvent(new Event('taksh-analytics-choices'))}
function subscribeChoices(update:()=>void){window.addEventListener('taksh-analytics-choices',update);return()=>window.removeEventListener('taksh-analytics-choices',update)}
function snapshot(){try{return localStorage.getItem(analyticsChoiceKey)}catch{return null}}
export function AnalyticsChoices(){return <button type="button" className="analytics-choices" onClick={requestChoices}>Cookie choices</button>}
export function AnalyticsConsent(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>null);
  const request=useSyncExternalStore(subscribeChoices,()=>choicesRequest,()=>0);
 const [closedRequest,setClosedRequest]=useState(0),[selected,setSelected]=useState<boolean|null>(null),[message,setMessage]=useState('');
 const open=request>closedRequest;
 function setOpen(value:boolean){if(value)requestChoices();else{setClosedRequest(choicesRequest);setSelected(null)}}
 const path=usePathname();
 function save(analytics:boolean){const saved=setAnalyticsConsent(analytics&&analyticsConfigured);setOpen(false);setMessage(saved?'':"Your browser couldn't save this choice. It applies to this page; we'll ask again next time.")}
 if(path.startsWith('/admin'))return null;
 return <>{message&&<p className="cookie-save-status" role="status">{message}</p>}
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="taksh-dialog cookie-dialog" onCloseAutoFocus={e=>{if(choicesTrigger?.isConnected){e.preventDefault();choicesTrigger.focus()}}}><DialogTitle>Cookie choices</DialogTitle><DialogDescription>Essential storage keeps your bag and checkout working. Analytics is on unless you turn it off.</DialogDescription>
 <label className="cookie-toggle"><span>Analytics</span><input type="checkbox" checked={selected??analyticsEnabled(raw)} disabled={!analyticsConfigured} onChange={e=>setSelected(e.target.checked)}/></label>
 <p className="small muted">Includes Google Analytics, Clarity and Meta. Meta gets hashed contact details.</p>
 <div className="cookie-dialog-actions"><button type="button" className="button outline" onClick={()=>save(false)}>Essential only</button><button type="button" className="button primary" onClick={()=>save(selected??analyticsEnabled(raw))}>Save choices</button></div><SiteLink href="/privacy" className="text-link" onClick={()=>setOpen(false)}>Privacy details</SiteLink>
 </DialogContent></Dialog></>;
}
