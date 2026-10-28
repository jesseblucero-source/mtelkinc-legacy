"""Run last after page builders; keep original PDF files and URLs unchanged."""
from pathlib import Path
import json,re,hashlib
root=Path('dist');locales=json.loads(Path('content/document-viewer.json').read_text())
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
p=root/'page-transitions.js';s=p.read_text()
if "'document-viewer'" not in s:s=s.replace("'legacy-phone'","'legacy-phone','document-viewer'",1)
p.write_text(s);count=0;links=0
for p in root.rglob('index.html'):
 s=p.read_text();s=re.sub(r'<link rel="stylesheet" href="/document-viewer\.css[^\"]*">','',s);s=re.sub(r'<script type="module" src="/document-viewer\.js[^\"]*"></script>','',s);s=re.sub(r'<script type="application/json" data-document-copy>.*?</script>','',s,flags=re.S)
 if re.search(r'/(?:records|downloads)/[^\s"<>]+\.pdf',s):
  lang=re.search(r'<html[^>]*lang="([^"]+)"',s)[1];copy=locales.get(lang,locales['en'])
  def source(m):
   global links
   link=m[0]
   if re.search(r'\bdownload(?:=|\s|>)',link):return link
   links+=1;link=re.sub(r' target="[^"]*"','',link);link=re.sub(r' data-document-source(?:="[^"]*")?','',link);link=link.replace('>', ' data-document-source>',1)
   # The source now opens in a modal on this page, so remove external-window arrows.
   link=link.replace(' ↗','').replace('↗','');return link
  s=re.sub(r'<a\b[^>]*href="/[^\"]+\.pdf(?:[?#][^\"]*)?"[^>]*>.*?</a>',source,s,flags=re.S)
  data=json.dumps(copy,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
  s=s.replace('</head>',f'<link rel="stylesheet" href="/document-viewer.css?v={digest("document-viewer.css")}"></head>')
  s=s.replace('</body>',f'<script type="application/json" data-document-copy>{data}</script><script type="module" src="/document-viewer.js?v={digest("document-viewer.js")}"></script></body>');count+=1
 s=re.sub(r'(/page-transitions\.js)\?v=[a-f0-9]+',r'\1?v='+digest('page-transitions.js'),s);p.write_text(s)
p=root/'_headers';s=p.read_text();marker='/vendor/pdfjs-6.4.299/*'
if marker not in s:s+='\n'+marker+'\n  Cache-Control: public, max-age=31536000, immutable\n'
p.write_text(s)
print(f'Added on-page source viewer to {count} pages; {links} source links retain original PDF URLs without opening a new tab.')
