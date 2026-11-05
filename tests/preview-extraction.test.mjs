import test from'node:test';import assert from'node:assert/strict';import{mkdtempSync,existsSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{execFileSync,spawnSync}from'node:child_process';
test('untrusted artifact extraction refuses traversal, symlinks and duplicate entries',()=>{
 for(const kind of ['traversal','symlink','duplicate']){
  const directory=mkdtempSync(join(tmpdir(),'taksh-safe-preview-')),zip=join(directory,'test.zip');
  const source=`import zipfile,stat,sys\nz=zipfile.ZipFile(sys.argv[1],'w')\nkind=sys.argv[2]\nif kind=='traversal': z.writestr('../escape.txt','bad')\nif kind=='duplicate':\n z.writestr('same.txt','one')\n z.writestr('same.txt','two')\nif kind=='symlink':\n i=zipfile.ZipInfo('link');i.external_attr=(stat.S_IFLNK|0o777)<<16;z.writestr(i,'../escape.txt')\nz.close()`;
  execFileSync('python3',['-c',source,zip,kind],{stdio:'ignore'});
  const result=spawnSync('python3',['scripts/extract-preview.py',zip,join(directory,'output')],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.equal(existsSync(join(directory,'escape.txt')),false);
 }
});
