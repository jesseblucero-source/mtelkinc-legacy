"""Read-only HTTP acceptance of public content; no checkout submission or credentials."""
from pathlib import Path
from urllib.parse import urlsplit
import urllib.request,concurrent.futures,json,re,xml.etree.ElementTree as ET,sys
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';origin=(sys.argv[1]if len(sys.argv)>1 else'https://www.mtelkinc.com').rstrip('/')
paths=['/','/llms.txt','/llms-full.txt','/robots.txt','/sitemap.xml','/catalog/products.json','/shop/','/dealer-application/']
for prefix in ['','fr/','es/','de/']:
 paths+=['/'+p.parent.relative_to(DIST).as_posix()+'/'for p in(DIST/prefix/'catalog').rglob('index.html')]
local_urls={u.text for u in ET.parse(DIST/'sitemap.xml').findall('.//{*}loc')}
local_count=len(json.loads((DIST/'catalog/products.json').read_text())['products'])
def check(path):
 try:
  response=urllib.request.urlopen(origin+path,timeout=30);body=response.read();text=body.decode('utf-8','replace');row={'path':path,'status':response.status,'bytes':len(body)}
  assert response.status==200
  if path.endswith('/'):
   canonical=re.findall(r'<link rel="canonical" href="([^"]+)"',text);assert canonical==['https://www.mtelkinc.com'+path],canonical
  if path in ['/','/catalog/','/shop/']:
   row['nosniff']=response.headers.get('X-Content-Type-Options');row['csp']=response.headers.get('Content-Security-Policy');assert row['nosniff']=='nosniff'and"object-src 'none'"in(row['csp']or'')
  if path=='/catalog/products.json':
   data=json.loads(text);assert len(data['products'])==local_count
   assert not any(re.search(r'\bpatent(?:ed|s|ing)?\b|registered trademark|[®™]',p['description'],re.I)for p in data['products'])
  if path=='/robots.txt':assert 'User-agent: GPTBot\nDisallow: /'in text and'https://www.mtelkinc.com/sitemap.xml'in text
  if path=='/sitemap.xml':
   remote={u.text for u in ET.fromstring(text).findall('.//{*}loc')};assert remote==local_urls;row['canonical_indexable_urls']=len(remote)
  if path in ['/llms.txt','/llms-full.txt']:assert text.startswith('# MT E.L.K., INC.')
  return row
 except Exception as error:return {'path':path,'error':type(error).__name__+': '+str(error)[:180]}
rows=list(concurrent.futures.ThreadPoolExecutor(8).map(check,sorted(set(paths))));errors=[r for r in rows if'error'in r]
report={'origin':origin,'checked_routes':len(rows),'errors':errors,'results':rows};(ROOT/'reports/enterprise-production-http-final.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'checked_routes':len(rows),'errors':errors,'indexable_urls':len(local_urls)}));assert not errors
