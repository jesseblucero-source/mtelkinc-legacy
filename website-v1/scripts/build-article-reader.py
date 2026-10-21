"""Attach localized summary narration to Legacy, its archive records and home story."""
from pathlib import Path
from html import escape,unescape
from html.parser import HTMLParser
import json,re,hashlib
root=Path('dist');locales=json.loads(Path('content/article-reader.json').read_text())['locales']
class Plain(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,s):self.parts.append(s)
def plain(s):
 p=Plain();p.feed(s);s=' '.join(' '.join(p.parts).split());return re.sub(r'(?<!MT )E\.L\.K\.,? Inc\.', 'MT E.L.K., INC.',s)
def digest(p):return hashlib.sha256((root/p).read_bytes()).hexdigest()[:12]
def panel(record,lang,ident):
 c=dict(locales[lang]);full=record['full'];available=full['status']=='full' and bool(full['paragraphs']);reason=c['reasons'].get(full.get('reason_code',''),'')
 c['unavailable']+=' '+reason
 note=c['note'] if available else c['unavailable']
 if available and lang!='en':note+=' '+c['translation']
 if full.get('has_gaps'):note+=' '+c['gap']
 data=json.dumps(c,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 transcript='\n\n'.join('<p>'+escape(p)+'</p>' for p in full['paragraphs']) if available else '<p>'+escape(c['unavailable'])+'</p>'
 links=f'<a href="{escape(full["source_url"],quote=True)}" target="_blank" rel="noopener noreferrer">{escape(c["source"])} ↗</a>'
 if full.get('corroborating_source_url'):links+=f'<a href="{full["corroborating_source_url"]}" target="_blank" rel="noopener noreferrer">{escape(c["clearer"])} ↗</a>'
 if available:links+=f'<a href="/records/transcripts/{lang}/{record["slug"]}.txt" download>{escape(c["download"])}</a>'
 state='full-with-gaps' if full.get('has_gaps') else full['status']
 return f'<section class="article-reader" data-article-reader data-reader-language="{lang}" data-reader-available="{str(available).lower()}" data-reader-completeness="{state}" data-reader-preface="{escape(c["preface"]+" "+record["source_label"].replace(" / ",". ")+".",quote=True)}" data-reader-title="{escape(record["title"],quote=True)}" aria-label="{escape(c["listen"]+" — "+record["title"],quote=True)}"><p class="article-reader-label">{escape(c["listen"])} · {escape(c["voice"])}</p><p class="article-reader-note">{escape(note)}</p><div class="article-reader-controls"><button type="button" data-reader-play disabled>{escape(c["listen"])}</button><button type="button" data-reader-stop disabled>{escape(c["stop"])}</button><label for="reader-rate-{ident}">{escape(c["speed"])}<select id="reader-rate-{ident}" data-reader-rate><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label></div><p data-reader-status role="status" aria-live="polite">{escape(c["initial"] if available else c["unavailable"])}</p><details><summary>{escape(c["transcript"])}</summary><div data-reader-text lang="{lang}">{transcript}</div></details><nav class="article-reader-sources" aria-label="{escape(c["source"],quote=True)}">{links}</nav><script type="application/json" data-reader-copy>{data}</script><noscript><p>{escape(c["noscript"])}</p></noscript></section>'

full_records={lang:json.loads(Path('content/full-articles/'+lang+'.json').read_text())['records'] for lang in locales}
assert all(len(rows)==14 for rows in full_records.values()),'Full-text language editions are incomplete'
for slug,r in full_records['en'].items():
 assert hashlib.sha256((root/r['source_url'].lstrip('/')).read_bytes()).hexdigest()==r['source_sha256'], 'Source changed: '+slug
 for lang,rows in full_records.items():
  assert slug in rows and rows[slug]['status']==r['status'], 'Availability differs: '+lang+'/'+slug
  assert len(rows[slug]['paragraphs'])==len(r['paragraphs']), 'Transcript paragraphs differ: '+lang+'/'+slug
  assert not any('XQNAME' in p for p in rows[slug]['paragraphs']), 'Translation marker leaked'
# Strip prior generated components, leaving source content intact.
for p in root.rglob('index.html'):
 s=p.read_text();s=re.sub(r'<section class="article-reader".*?</noscript></section>','',s,flags=re.S);s=re.sub(r'<link rel="stylesheet" href="/article-reader\.css[^"]*">','',s);s=re.sub(r'<script type="module" src="/article-reader\.js[^"]*"></script>','',s);p.write_text(s)
records={}
overrides=json.loads(Path('content/article-reader-overrides.json').read_text())
for lang in locales:
 pre='' if lang=='en' else lang;records[lang]={}
 for p in (root/pre/'archive').glob('*/index.html'):
  s=p.read_text();heading=re.search(r'<section class="detail-heading.*?</section>',s,re.S)
  if not heading:continue
  title=plain(re.search(r'<h1[^>]*>(.*?)</h1>',heading[0],re.S)[1]);meta=re.search(r'<p class="eyebrow[^>]*>(.*?)</p>',heading[0],re.S)
  aside=re.search(r'<aside class="article-language-summary".*?</aside>',s,re.S)
  if aside:body=' '.join(plain(m) for m in re.findall(r'<p>(.*?)</p>',aside[0],re.S))
  else:body=plain(re.search(r'<p class="detail-intro">(.*?)</p>',heading[0],re.S)[1])
  override=overrides.get(lang,{}).get(p.parent.name,{})
  title=override.get('title',title);body=override.get('summary',body)
  metadata=plain(meta[1]) if meta else ''
  if lang!='en':
   original=(root/'archive'/p.parent.name/'index.html').read_text()
   source=re.search(r'<p class="eyebrow[^>]*>(.*?)</p>',original,re.S)
   if source and ' / ' in metadata:metadata=plain(source[1]).rsplit(' / ',1)[0]+' / '+metadata.rsplit(' / ',1)[-1]
  text=re.sub(r'\.{2,}', '.',title+'. '+(metadata+'. ' if metadata else '')+body)
  full=full_records[lang][p.parent.name]
  record={'slug':p.parent.name,'source_label':metadata,'title':title,'text':'\n\n'.join(full['paragraphs']),'summary':body,'full':full};records[lang][p.parent.name]=record
  if full['status']=='full':
   transcript_path=root/'records/transcripts'/lang/(p.parent.name+'.txt');transcript_path.parent.mkdir(parents=True,exist_ok=True)
   transcript_path.write_text(title+'\n'+metadata+'\n\n'+locales[lang]['note']+(' '+locales[lang]['translation'] if lang!='en' else '')+'\n\n'+record['text']+'\n\nSource: https://mtelkinc-educationhub.netlify.app'+full['source_url']+'\n')
  s=s.replace('<section class="section record-detail">','<section class="section record-detail">'+panel(record,lang,'archive'),1);p.write_text(s)
 for file in ['legacy/index.html','index.html']:
  p=root/pre/file;s=p.read_text()
  pattern=r'<article class="legacy-record record-card".*?</article>' if file.startswith('legacy') else r'<details class="home-story-record".*?</details>'
  def add(m):
   block=m[0];link=re.search(r'href="/(?:fr/|es/|de/)?archive/([^/]+)/',block)
   if not link or link[1] not in records[lang]:return block
   record=records[lang][link[1]];marker='<div class="legacy-actions">' if file.startswith('legacy') else '<div class="home-source-actions">'
   return block.replace(marker,panel(record,lang,link[1])+marker,1)
  s=re.sub(pattern,add,s,flags=re.S);p.write_text(s)
# Teach the persistent router about this page controller.
p=root/'page-transitions.js';s=p.read_text();s=re.sub(r"(?:,'article-reader')+", ",'article-reader'", s)
if "'article-reader'" not in s:s=s.replace("'store','disclosures'","'store','disclosures','article-reader'")
p.write_text(s)
# Cancel pending music loads as well as music already playing before narration starts.
p=root/'music-player.js';s=p.read_text();marker=" document.addEventListener('visibilitychange',syncVisual"
if "'mt-article-audio-start'" not in s:
 s=s.replace(marker," document.addEventListener('mt-article-audio-start',()=>{cancelLoad();audio.pause();status.textContent='Music paused for article audio.';},{persistent:true});\n"+marker)
p.write_text(s)
p=root/'script.js';s=p.read_text();s=re.sub(r"import\('/music-player\.js(?:\?[^']*)?'\)","import('/music-player.js?v="+digest('music-player.js')+"')",s);p.write_text(s)
count=0
for p in root.rglob('index.html'):
 s=p.read_text()
 if 'data-article-reader' in s:
  count+=1;s=s.replace('</head>',f'<link rel="stylesheet" href="/article-reader.css?v={digest("article-reader.css")}"></head>');s=s.replace('</body>',f'<script type="module" src="/article-reader.js?v={digest("article-reader.js")}"></script></body>')
 for n in ['script','page-transitions']:
  s=re.sub(r'src="/'+n+r'\.js(?:\?[^\"]*)?"',f'src="/{n}.js?v={digest(n+".js")}"',s)
 p.write_text(s)
Path('content/article-narration-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('Added full-text article audio controls to',count,'pages; indexed',sum(len(r) for r in records.values()),'archive records.')
