import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Order storage is temporarily unavailable. Please try again.');return env.DB}
export function storage(){if(!env.BUCKET)throw new Error('Photo storage is temporarily unavailable. Please try again.');return env.BUCKET}
export const runtime=env as unknown as Record<string,string|undefined>;
