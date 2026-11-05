import{createHash}from'node:crypto';
import{resolve}from'node:path';
export function compiledPreviewBase(trusted,bundleRoot){
 if(trusted.name!=='taksh-store'||trusted.account_id!=='60742c7f90408058b71f1065a6815ddd')throw new Error('Trusted preview parent is not the Taksh storefront.');
 // Do not load the artifact's wrangler.json, build hooks, vars, routes or bindings.
 return{account_id:trusted.account_id,name:trusted.name,compatibility_date:trusted.compatibility_date,compatibility_flags:trusted.compatibility_flags,limits:trusted.limits,observability:trusted.observability,workers_dev:false,preview_urls:true,vars:{APP_ENV:'production'},main:resolve(bundleRoot,'dist/server/index.js'),assets:{binding:'ASSETS',directory:resolve(bundleRoot,'dist/client')},no_bundle:true,rules:[{type:'ESModule',globs:['**/*.js']}],d1_databases:structuredClone(trusted.d1_databases),r2_buckets:structuredClone(trusted.r2_buckets)};
}

// Public synthetic QA fixtures, never production credentials or customer data.
export function syntheticPreviewSecrets(){return{ADMIN_PASSWORD_HASH:createHash('sha256').update('taksh-local-demand-qa').digest('hex'),CUSTOMER_SHEET_SYNC_KEY:'a'.repeat(64),RESEND_API_KEY:'preview-email-disabled',FROM_EMAIL:'preview@invalid.test',INTERNAL_CONTACTS:'preview-disabled'};}
