// Reject unusable uploads before transferring bytes. The server still checks signatures.
export function photoValidationError(file){
 if(!file)return '';
 if(file.size>5*1024*1024)return 'Please use a photo smaller than 5 MB.';
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return 'Please upload a JPG, PNG or WebP photo.';
 return '';
}
