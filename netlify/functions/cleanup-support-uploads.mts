import {database,storage} from '../../db/index.ts';
import {cleanupPhotoUploads} from '../../lib/support-upload.mjs';
export default async function(){
 // Scheduled functions run only on published deploys; keep preview data separate.
 await cleanupPhotoUploads(database(),storage());
}
export const config={schedule:'@hourly'};
