"""Verify comparison route coverage, public identity, localization and source boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import json,re
root=Path(__file__).resolve().parents[1];dist=root/'dist'
source=json.loads((dist/'catalog/products.json').read_text())
identities={p['product_id']:p['name']for p in source['products']}
ui=json.loads((root/'content/catalog-navigation.json').read_text())
class Tags(HTMLParser):
 def __init__(self):super().__init__();self.tags=[]
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
for lang in ['en','fr','es','de']:
 path=(''if lang=='en'else lang+'/')+'catalog/compare/index.html';text=(dist/path).read_text();p=Tags();p.feed(text)
 payload=json.loads(re.search(r'<script type="application/json" data-catalog-tools>(.*?)</script>',text,re.S)[1])
 assert payload['lang']==lang and payload['copy']==ui[lang]
 assert {p['id']:p['name']for p in payload['products']}==identities
 templates={int(a['data-compare-template'])for t,a in p.tags if t=='template'and'data-compare-template'in a}
 assert templates==set(identities)
 assert len([a for t,a in p.tags if t=='select'and a.get('name','').startswith('product-')])==3
 assert not re.search(r'<(?:input|select)[^>]+name="(?:email|password|credit|card)',text,re.I)
 assert not re.search(r'"(?:aggregateRating|offers|priceCurrency)"\s*:',text)
 for tag,a in p.tags:
  if tag=='a'and'/catalog/products/'in a.get('href',''):
   assert a['href'].startswith('/catalog/products/'),a['href']
   assert (dist/a['href'].strip('/')/'index.html').exists()
js=(dist/'catalog.js').read_text();language=(dist/'site-language.js').read_text()
assert 'localStorage'not in js and 'sessionStorage'not in js
assert 'navigator.clipboard.writeText'in js and 'AbortError'in js
assert len(js.encode())<16000,'Keep the catalog controller small.'
assert "/^\\/catalog\\/products\\//.test(u.pathname)"in language
assert 'function destination(target)'in language and 'link[rel="alternate"]'in language
report={'languages':4,'product_templates_per_language':len(identities),'selected_product_limit':3,'static_commercial_facts':False,'customer_storage':False,'controller_bytes':len(js.encode()),'english_product_routes_preserved':True}
(root/'reports/catalog-comparison-static.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
