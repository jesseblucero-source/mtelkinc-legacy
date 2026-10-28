"""Run last, after article reader, archive deduplication and tighten-legacy.py."""
from pathlib import Path
import json,re,hashlib,html
root=Path('dist');ui=json.loads(Path('content/scan-preview-ui.json').read_text());sources={r['slug']:r for r in json.loads(Path('content/source/archive-records.json').read_text())};availability=json.loads(Path('content/full-articles/en.json').read_text())['records']
labels={
'en':dict(refine='Year & record type',listen='Read & listen',read='Read the record',back='All archive records',previous='Previous record',next='Next record',scan='Open original scan',hint='Search the archive, expand a scan, or open a record to read and listen.'),
'fr':dict(refine='Année et type de document',listen='Lire et écouter',read='Lire le document',back='Tous les documents',previous='Document précédent',next='Document suivant',scan='Ouvrir le scan original',hint='Recherchez dans les archives, agrandissez un scan ou ouvrez un document pour lire et écouter.'),
'es':dict(refine='Año y tipo de documento',listen='Leer y escuchar',read='Leer el documento',back='Todos los documentos',previous='Documento anterior',next='Documento siguiente',scan='Abrir el escaneo original',hint='Busque en el archivo, amplíe un escaneo o abra un documento para leer y escuchar.'),
'de':dict(refine='Jahr und Dokumenttyp',listen='Lesen und anhören',read='Dokument lesen',back='Alle Dokumente',previous='Vorheriges Dokument',next='Nächstes Dokument',scan='Originalscan öffnen',hint='Durchsuchen Sie das Archiv, vergrößern Sie einen Scan oder öffnen Sie ein Dokument zum Lesen und Anhören.')}
def esc(s):return html.escape(s,quote=True)
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
def frame(c):return f'<dialog class="legacy-preview-dialog" aria-labelledby="legacy-preview-title"><div class="legacy-preview-toolbar"><h2 id="legacy-preview-title">MT E.L.K., INC.</h2><button type="button" data-preview-zoom aria-pressed="false">{c["zoom"]}</button><button type="button" data-preview-close>{c["close"]} ×</button></div><div class="legacy-preview-scroll"><img alt=""></div><p><a href="/archive/">{c["source"]} →</a></p></dialog>'
def enhance(link,title,pdf,label):
 link=re.sub(r' data-legacy-preview(?:="[^"]*")?| aria-haspopup="dialog"| data-preview-(?:title|source|source-label)="[^"]*"','',link)
 return link.replace('>',f' data-legacy-preview aria-haspopup="dialog" data-preview-title="{esc(title)}" data-preview-source="{esc(pdf)}" data-preview-source-label="{esc(label)}">',1)
for lang,c in ui.items():
 pre='' if lang=='en' else lang+'/'
 folder=root/pre/'archive';hub=folder/'index.html';s=hub.read_text();l=labels[lang]
 ordered=[]
 def card(m):
  text=m[0];match=re.search(r'href="(/(?:fr/|es/|de/)?archive/([^/]+)/)"',text)
  if not match:return text
  url,slug=match.groups();ordered.append(slug);title=html.unescape(re.sub('<[^>]+>','',re.search(r'<h3[^>]*>(.*?)</h3>',text,re.S)[1]));pdf='/records/'+sources[slug]['pdf'] if sources[slug]['pdf'] else re.search(r'<img[^>]*src="([^"]+)"',text)[1]
  text=re.sub(r'<span class="legacy-preview-label">.*?</span>','',text)
  text=re.sub(r'(<a[^>]*>)(<img\b[^>]*>)',lambda a:enhance(a[1],title,pdf,c['source'] if sources[slug]['pdf'] else l['scan'])+a[2]+f'<span class="legacy-preview-label">{c["preview"]} ↗</span>',text,count=1)
  available=availability[slug]['status']=='full'
  text=re.sub(r'<a\b[^>]*class="[^"]*article-summary-link[^\"]*"[^>]*>.*?</a>','',text,flags=re.S)
  text=re.sub(r'<a class="text-link" href="[^"]+">.*?</a>',f'<a class="text-link" href="{url}'+('#article-audio' if available else '')+f'">{l["listen"] if available else l["read"]} →</a>',text,count=1,flags=re.S)
  return text
 s=re.sub(r'<article class="record-card".*?</article>',card,s,flags=re.S)
 assert len(ordered)==12
 s=re.sub(r'<details class="archive-refine"[^>]*><summary>.*?</summary><div class="archive-refine-fields">(.*?)</div></details>',r'\1',s,flags=re.S)
 s=re.sub(r'(<div><label for="archive-year">.*?</div>)(<div><label for="archive-type">.*?</div>)',lambda m:f'<details class="archive-refine" open><summary>{l["refine"]}</summary><div class="archive-refine-fields">{m[1]}{m[2]}</div></details>',s,count=1,flags=re.S)
 s=re.sub(r'<p class="archive-reader-hint">.*?</p>','',s,flags=re.S)
 s=s.replace('<form class="content-filters"',f'<p class="archive-reader-hint">{l["hint"]}</p><form class="content-filters"',1)
 pages=[(hub,s,'archive-hub')]
 for i,slug in enumerate(ordered):
  p=folder/slug/'index.html';text=p.read_text();title=html.unescape(re.sub('<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',text,re.S)[1]));pdf='/records/'+sources[slug]['pdf'] if sources[slug]['pdf'] else re.search(r'<a class="scan-enlarge"[^>]*href="([^"]+)"',text)[1]
  # Remove unrelated Canada links accidentally injected into historical breadcrumbs.
  text=re.sub(r'(<nav class="breadcrumbs".*?</nav>)',lambda m:re.sub(r'<a href="/(?:fr/|es/|de/)?canada/">.*?</a>','',m[0]),text,flags=re.S)
  text=re.sub(r'<span class="legacy-preview-label">.*?</span>','',text)
  text=re.sub(r'(<a class="scan-enlarge"[^>]*>)(.*?)(</a>)',lambda m:enhance(m[1],title,pdf,c['source'] if sources[slug]['pdf'] else l['scan'])+m[2]+f'<span class="legacy-preview-label">{c["preview"]} ↗</span>'+m[3],text,count=1,flags=re.S)
  text=re.sub(r'<section class="article-reader"(?: id="article-audio")?', '<section class="article-reader" id="article-audio"',text,count=1)
  if 'class="legacy-audio-info"' not in text:
   text=re.sub(r'<p class="article-reader-note">(.*?)</p>',lambda m:f'<details class="legacy-audio-info"><summary>{c["details"]}</summary><p class="article-reader-note">{m[1]}</p></details>',text,count=1,flags=re.S)
  text=re.sub(r'<nav class="section archive-record-nav".*?</nav>','',text,flags=re.S)
  nav=f'<nav class="section archive-record-nav" aria-label="{l["back"]}"><a href="/{pre}archive/#archive-library">← {l["back"]}</a>'
  if i:nav+=f'<a rel="prev" href="/{pre}archive/{ordered[i-1]}/">← {l["previous"]}</a>'
  if i+1<len(ordered):nav+=f'<a rel="next" href="/{pre}archive/{ordered[i+1]}/">{l["next"]} →</a>'
  text=text.replace('</main>',nav+'</nav></main>');pages.append((p,text,'archive-detail'))
 for p,text,cls in pages:
  text=re.sub(r'<main id="main"(?:[^>]*)>',f'<main id="main" class="{cls}" data-archive-page>',text,count=1)
  text=re.sub(r'<link rel="stylesheet" href="/(?:archive-phone|legacy-phone)\.css[^\"]*">','',text)
  text=re.sub(r'<script type="module" src="/legacy-phone.js[^\"]*"></script>','',text)
  text=re.sub(r'<script type="application/json" data-legacy-ui>.*?</script>','',text,flags=re.S)
  text=re.sub(r'<dialog class="legacy-preview-dialog".*?</dialog>','',text,flags=re.S)
  text=text.replace('</main>','</main>'+frame(c)+f'<script type="application/json" data-legacy-ui>{json.dumps(c,ensure_ascii=False)}</script>')
  text=text.replace('</head>',f'<link rel="stylesheet" href="/legacy-phone.css?v={digest("legacy-phone.css")}"><link rel="stylesheet" href="/archive-phone.css?v={digest("archive-phone.css")}"></head>')
  text=text.replace('</body>',f'<script type="module" src="/legacy-phone.js?v={digest("legacy-phone.js")}"></script></body>');assert text.count('</main>')==1 and text.count('<footer>')==1 and text.count('data-legacy-ui')==1,str(p)
  p.write_text(text)
for p in root.rglob('index.html'):
 text=p.read_text()
 for name in ['page-transitions.js','dynamic.js','legacy-phone.js','legacy-phone.css']:
  text=re.sub(r'(/'+re.escape(name)+r')\?v=[a-f0-9]+',r'\1?v='+digest(name),text)
 p.write_text(text)
print('Tightened 4 Archive hubs and 48 unique record pages with shared scan previews and audio styling.')
