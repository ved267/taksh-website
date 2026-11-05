import {createHash} from 'node:crypto';
export function previewIdentity(branch){
 if(typeof branch!=='string'||!branch.trim())throw new Error('A branch name is required.');
 if(['main','master'].includes(branch))throw new Error('Use the production deployment command on main.');
 const slug=branch.toLowerCase().replace(/[^a-z0-9-]+/g,'-').slice(0,25).replace(/^-|-$/g,'');
 const digest=createHash('sha256').update(branch).digest('hex').slice(0,12);
 const name=`taksh-pr-${slug}-${digest}`;
 return {databaseName:name,bucketName:name,previewName:branch};
}
export function isolatedPreviewConfig(base,branch,databaseId){
 const identity=previewIdentity(branch),config=structuredClone(base);
 if(!databaseId||base.d1_databases.some(db=>db.database_id===databaseId))throw new Error('Preview database must differ from production.');
 config.d1_databases[0].preview_database_id=databaseId;
 config.previews={vars:{APP_ENV:'preview'},d1_databases:[{binding:'DB',database_name:identity.databaseName,database_id:databaseId,migrations_dir:'drizzle'}],r2_buckets:[{binding:'BUCKET',bucket_name:identity.bucketName}]};
 return config;
}
