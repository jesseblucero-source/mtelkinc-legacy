"""Create a durable, static-only release; never package server functions or secrets."""
from pathlib import Path
import hashlib, json, shutil, zipfile

project=Path(__file__).resolve().parents[1]
source=project/'dist'
release=project/'releases/static-routing'
public=release/'public'
marker=release/'.mtelk-static-release'
release.mkdir(parents=True,exist_ok=True)
if public.exists():
    assert marker.is_file(), 'Refusing to replace a directory not created by this packager.'
    shutil.rmtree(public)
marker.write_text('Generated static release for MT E.L.K., INC.\n')
shutil.copytree(source,public)
empty=release/'empty-functions'
empty.mkdir(exist_ok=True)
assert not list(empty.iterdir()), 'The release must not contain server functions.'
(release/'netlify.toml').write_text('[build]\n  publish = "public"\n[functions]\n  directory = "empty-functions"\n')
manifest=[]
for file in sorted(public.rglob('*')):
    if not file.is_file():continue
    name=file.relative_to(public).as_posix()
    assert not file.name.startswith('.env') and 'application-notification' not in name and 'netlify/functions' not in name
    manifest.append({'path':name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size})
archive=release/'Final-Website-static-routing.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED)as out:
    for entry in manifest:out.write(public/entry['path'],entry['path'])
with zipfile.ZipFile(archive)as check:
    assert check.testzip() is None
    assert set(check.namelist())=={entry['path']for entry in manifest}
proof={'release_directory':str(release),'publish_directory':str(public),'file_count':len(manifest),
       'server_function_files':0,'contains_smtp_function':False,'archive':str(archive),
       'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),
       'redirect_sha256':hashlib.sha256((public/'_redirects').read_bytes()).hexdigest(),
       'scope':'Public static website and redirects only. The configured functions directory is empty.'}
(release/'manifest.json').write_text(json.dumps({'scope':proof,'files':manifest},indent=2)+'\n')
(project/'reports/static-routing-release-scope.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof))
