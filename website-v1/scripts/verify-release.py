"""Verify the active public static release without network access."""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parents[1]
release=json.loads((root/'RELEASE.json').read_text());manifest=json.loads((root/'DIST-MANIFEST.json').read_text())
assert (root/'VERSION').read_text().strip()==release['version']
assert manifest['release']==release
rows=manifest['files'];canonical=json.dumps(rows,sort_keys=True,separators=(',',':')).encode()
assert hashlib.sha256(canonical).hexdigest()==release['dist_manifest_sha256']
expected={row['path'] for row in rows};actual={p.relative_to(root/'dist').as_posix() for p in (root/'dist').rglob('*') if p.is_file()}
assert expected==actual,'Static file list differs from release manifest'
for row in rows:
 p=root/'dist'/row['path'];assert p.is_file() and not p.is_symlink(),row['path']
 assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
 assert not p.name.startswith('.env') and 'application-notification' not in row['path'],row['path']
assert len(rows)==release['dist_file_count']
assert all(p.name=='.gitkeep' for p in (root/'empty-functions').iterdir())
for prefix in ['', 'fr/', 'es/', 'de/']:
 for page in ['', 'education/','shop/','legacy/','dealer-application/','dealer-guides/customer-support/','dealer-guides/distributor-network/']:
  assert (root/'dist'/prefix/page/'index.html').is_file(),prefix+page
print(json.dumps({'version':release['version'],'files_verified':len(rows),'bytes_verified':sum(r['bytes'] for r in rows),'static_only':True,'production_deploy_id':release['production_deploy_id']},indent=2))
