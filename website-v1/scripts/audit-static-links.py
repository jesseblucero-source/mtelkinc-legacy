"""Check generated local page/asset destinations without requesting external providers."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path('dist');missing=[];checked=0
class Links(HTMLParser):
 def handle_starttag(self,tag,attrs):
  global checked
  attrs=dict(attrs)
  for key in ['href','src']:
   url=attrs.get(key,'');u=urlsplit(url)
   if not url.startswith('/') or url.startswith('//') or not u.path:continue
   if u.path.startswith('/.netlify/'):continue
   checked+=1;path=root/unquote(u.path).lstrip('/')
   if path.is_dir():path=path/'index.html'
   if not path.exists():missing.append({'page':str(current.relative_to(root)),'url':url})
for current in root.rglob('index.html'):Links().feed(current.read_text())
report={'pages':len(list(root.rglob('index.html'))),'links_checked':checked,'missing':missing}
Path('reports/closeout-static-links.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report));raise SystemExit(bool(missing))
