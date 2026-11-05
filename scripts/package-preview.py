"""Unprivileged branch build: compiled data only, never credentials."""
import json, os, pathlib, zipfile
root=pathlib.Path.cwd()
output=root/'.local/preview-bundle.zip'
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=1) as archive:
    for directory in ('dist/server','dist/client','drizzle'):
        for path in sorted((root/directory).rglob('*')):
            if path.is_file() and not path.is_symlink():
                archive.write(path,path.relative_to(root).as_posix())
    archive.writestr('metadata.json',json.dumps({'sha':os.environ['TAKSH_BUILD_SHA'],'branch':os.environ['TAKSH_BUILD_BRANCH']}))
print('Compiled preview packaged without any runtime settings.')
