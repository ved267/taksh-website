import {photoValidationError} from './support-photo.mjs';
// Large photos use two bounded requests; the visible form and exact photo bytes stay unchanged.
export async function submitSupport(form){
 const photo=form.get('photo'),problem=photoValidationError(photo);if(problem)throw new Error(problem);
 if(photo instanceof File&&photo.size>3*1024*1024){
  const first=new FormData();for(const key of ['set','description','mobile'])first.set(key,form.get(key)||'');
  first.set('photoFirst',photo.slice(0,3*1024*1024,photo.type),'photo-part');first.set('photoSize',String(photo.size));
  const prepared=await fetch('/api/support/photo-part',{method:'POST',body:first}),data=await prepared.json();
  if(!prepared.ok)throw new Error(data.error||'Could not save. Please try again.');
  form.delete('photo');form.set('uploadToken',data.uploadToken);form.set('photoRemainder',photo.slice(3*1024*1024,photo.size,photo.type),'photo-remainder');
 }
 return fetch('/api/support',{method:'POST',body:form});
}
