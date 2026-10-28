"""Capture published policies without drafting or changing their legal terms."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json,urllib.request,hashlib,datetime
class Node:
 def __init__(self,tag='',attrs=None):self.tag=tag;self.attrs=dict(attrs or []);self.children=[]
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
class DOM(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(data)
def walk(n):
 yield n
 for c in n.children:
  if isinstance(c,Node):yield from walk(c)
def clean(n):
 if isinstance(n,str):return escape(n)
 if n.tag in {'script','style','iframe','img','input','form'}:return ''
 if n.tag=='li' and not n.text().strip():return ''
 body=''.join(clean(c) for c in n.children)
 if n.tag=='br':return '<br>'
 if n.tag=='a':
  href=n.attrs.get('href','')
  if href.startswith(('https://','http://','mailto:','tel:','/')):return '<a href="'+escape(href,quote=True)+'">'+body+'</a>'
  return body
 if n.tag in {'p','h1','h2','h3','h4','strong','b','em','i','ul','ol','li'}:return '<'+n.tag+'>'+body+'</'+n.tag+'>'
 return body
def blocks(n):
 if n.tag in {'p','h1','h2','h3','h4','ul','ol'}:
  if n.text().strip():yield {'tag':n.tag,'html':clean(n),'text':n.text().strip()}
  return
 for c in n.children:
  if isinstance(c,Node):yield from blocks(c)
source_dir=Path('content/source/disclosures');source_dir.mkdir(parents=True,exist_ok=True)
public=Path('dist/records/policies');public.mkdir(parents=True,exist_ok=True)
records=[];today=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
for slug,title in [('payment-policy','Shipping & Payment Policy'),('shipping-returns','Shipping & Returns')]:
 url='https://elkinc.com/'+slug+'/'
 raw=urllib.request.urlopen(url,timeout=45).read();(source_dir/(slug+'.html')).write_bytes(raw)
 parser=DOM();parser.feed(raw.decode());main=next(n for n in walk(parser.root) if n.attrs.get('data-elementor-type')=='wp-page')
 items=list(blocks(main));assert items[0]['tag']=='h1';source_title=items[0]['text'];items=items[1:]
 sections=sum(b['tag']=='h2' for b in items);assert sections>=8,(slug,sections)
 text=source_title+'\n\n'+'\n\n'.join(b['text'] for b in items)+'\n';(source_dir/(slug+'.txt')).write_text(text);(public/(slug+'.txt')).write_text(text)
 records.append({'id':slug,'title':title,'source_title':source_title,'source_url':url,'captured':today,'source_sha256':hashlib.sha256(raw).hexdigest(),'source_last_updated':'2026' if slug=='payment-policy' else None,'download':'/records/policies/'+slug+'.txt','blocks':items})
Path('content/disclosures.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
listing=json.load(urllib.request.urlopen('https://elkinc.com/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title',timeout=30))
(source_dir/'published-page-inventory.json').write_text(json.dumps({'checked':today,'endpoint':'https://elkinc.com/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title','pages':listing},ensure_ascii=False,indent=2)+'\n')
print('Captured',[(r['id'],len(r['blocks'])) for r in records])
