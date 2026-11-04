// Bake public deployment identity for Next and standalone scheduled functions.
// Netlify's NETLIFY/CONTEXT variables are build-only; no credentials are baked here.
import {writeFile,mkdir} from 'node:fs/promises';
const netlify=process.env.NETLIFY==='true'||process.env.TAKSH_BUILD_PLATFORM==='netlify';
const context=netlify?(process.env.TAKSH_BUILD_CONTEXT||process.env.CONTEXT):'local';
if(netlify&&!['production','deploy-preview','branch-deploy','dev'].includes(context))throw new Error('Netlify build context is missing or unsupported.');
await mkdir('.deployment',{recursive:true});
await writeFile('.deployment/host-context.json',JSON.stringify({platform:netlify?'netlify':'local',context})+'\n');
