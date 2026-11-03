export const levels=[{name:'Master',slug:'master',range:'Over 1,000 pieces',line:'Over 1,000 pieces'},{name:'Craft',slug:'craft',range:'Under 1,000 pieces',line:'Under 1,000 pieces'}];
export const catalogueLevels=levels;
export const levelForPieces=pieces=>pieces>1000?'Master':'Craft';
export const normaliseLevel=value=>levels.find(l=>l.slug===String(value||'').toLowerCase())?.name||'all';
export const levelDescription=name=>levels.find(l=>l.name===name)?.line||name;
