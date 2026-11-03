import type {Metadata} from 'next';
import {OwnerDashboard} from '@/components/taksh/owner-dashboard';
export const metadata:Metadata={title:'Taksh owner dashboard',robots:{index:false,follow:false}};
export default function Page(){return <OwnerDashboard/>}
