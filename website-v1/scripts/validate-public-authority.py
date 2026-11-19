"""Validate local facts, discovery links, schema shape, sitemap and publication boundaries."""
from pathlib import Path
from urllib.parse import urlsplit
from html import unescape
from html.parser import HTMLParser
import datetime,json,re,xml.etree.ElementTree as ET,hashlib
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';origin='https://www.mtelkinc.com'
source=json.loads((ROOT/'content/source/store-products.json').read_text());graph=json.loads((DIST/'catalog/products.json').read_text())
assert len(source['products'])==len(graph['products'])==len({r['product_id']for r in graph['products']})
assert {p['id']for p in source['products']}=={p['product_id']for p in graph['products']}
class Tags(HTMLParser):
 def __init__(self):super().__init__();self.tags=[]
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
def target(url):
 path=urlsplit(url).path.strip('/');return DIST/(path+'/index.html'if path and not Path(path).suffix else path or'index.html')
schemas=0;pages=0;canonicals=set();product_schemas=0;schema_breadcrumbs=0
for p in DIST.rglob('index.html'):
 html=p.read_text();parser=Tags();parser.feed(html);pages+=1
 canon=[a['href']for t,a in parser.tags if t=='link'and a.get('rel')=='canonical'];assert len(canon)==1,(p,canon)
 expected=origin+('/'+p.parent.relative_to(DIST).as_posix().strip('.')+'/').replace('//','/').replace('https:/','https://')
 assert canon[0]==expected,(p,canon[0],expected);assert canon[0]not in canonicals;canonicals.add(canon[0])
 if '/catalog/'in str(p):assert sum(t=='h1'for t,a in parser.tags)==1,('h1',p)
 for tag,attrs in parser.tags:
  if tag=='link'and attrs.get('hreflang'):
   assert attrs['href'].startswith(origin+'/')and target(attrs['href']).exists(),('hreflang',p)
  if tag=='a'and re.match(r'https?://(?:www\.)?(?:youtube\.com|youtu\.be)',attrs.get('href','')):raise AssertionError(('External video control',p))
 for raw in re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',html,re.S):
  data=json.loads(raw);schemas+=1
  nodes=data.get('@graph',[data])
  for node in nodes:
   if node.get('@type')=='Product':
    product_schemas+=1;assert node.get('name')and node['url']==canon[0];assert not any(k in node for k in ['offers','review','aggregateRating'])
   if node.get('@type')=='BreadcrumbList':schema_breadcrumbs+=1
   if node.get('@type')=='Organization':assert node['name']=='MT E.L.K., INC.'and node['@id']==origin+'/#organization'
assert product_schemas==len(graph['products']);assert schema_breadcrumbs>=101
for name in ['llms.txt','llms-full.txt']:
 text=(DIST/name).read_text();assert text.startswith('# MT E.L.K., INC.')and '\n> 'in text
 assert not re.search(r'collection://|notion\.com|SMTP_PASSWORD|US\$5,000|APPLICATION_SMTP|phillip@',text)
 for url in re.findall(r'\]\((https://[^)]+)\)',text):assert url.startswith(origin+'/')and target(url).exists(),(name,url)
for r in graph['products']:
 assert r['last_verified']==source['captured_on']and r['retail_price']is None and r['availability']is None
 assert not re.search(r'\bpatent(?:ed|s|ing)?\b|registered trademark|[®™]',r['description'],re.I),'Unverified IP claim in generated product copy'
 for url in r['compatible_replacements']+r['suggested_products']+r['instructional_lessons']:
  assert target(url).exists(),url
assert all(target(u.text).exists()and u.text.startswith(origin+'/')for u in ET.parse(DIST/'sitemap.xml').findall('.//{*}loc'))
robots=(DIST/'robots.txt').read_text();assert 'Sitemap: '+origin+'/sitemap.xml'in robots
for bot in ['GPTBot','ClaudeBot','Google-Extended','CCBot']:assert 'User-agent: '+bot+'\nDisallow: /'in robots
for p in DIST.rglob('*'):
 if p.is_file():assert not any(x in p.parts for x in ['.git','.netlify','node_modules','docs']),str(p)
assert not list((DIST/'catalog').rglob('*.map'))
report={'pages':pages,'canonical_urls':len(canonicals),'products':product_schemas,'breadcrumb_lists':schema_breadcrumbs,'json_ld_blocks_parsed':schemas,'ai_documents':2,'sitemap':'local destinations validated','schema_validation':'Local JSON/property checks; Google Rich Results/merchant eligibility not certified. Static offers intentionally omitted.','catalog_age_days':(datetime.date.today()-datetime.date.fromisoformat(source['captured_on'])).days}
(ROOT/'reports/public-authority-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
