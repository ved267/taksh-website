"""Trusted artifact extraction: no traversal, symlinks, duplicates or zip bombs."""
import pathlib, stat, sys, zipfile
source,destination=map(pathlib.Path,sys.argv[1:])
root=destination.resolve()
root.mkdir(parents=True,exist_ok=False)
with zipfile.ZipFile(source) as archive:
    entries=archive.infolist()
    if len(entries)>10000 or sum(item.file_size for item in entries)>512*1024*1024:
        raise ValueError('Preview archive exceeds the size limit')
    seen=set()
    for item in entries:
        path=pathlib.PurePosixPath(item.filename)
        if path.is_absolute() or '..' in path.parts or '\\' in item.filename or ':' in item.filename or stat.S_ISLNK(item.external_attr>>16) or item.filename in seen:
            raise ValueError('Unsafe preview archive path')
        seen.add(item.filename)
        if not (root/path).resolve().is_relative_to(root):
            raise ValueError('Preview archive escapes its destination')
    archive.extractall(root)
print('Preview archive paths and size verified.')
