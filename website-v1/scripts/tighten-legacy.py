"""Run after article-reader and archive deduplication generators."""
from pathlib import Path
import re,json,hashlib,html
root=Path('dist')
copy=json.loads(Path('content/scan-preview-ui.json').read_text())
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
router=root/'page-transitions.js';s=router.read_text();s=re.sub(r"(?:,'legacy-phone')+", "", s);s=s.replace("'disclosures','article-reader'","'disclosures','article-reader','legacy-phone'");router.write_text(s)
for lang,c in copy.items():
 prefix='' if lang=='en' else lang+'/'
 p=root/prefix/'legacy/index.html';s=p.read_text()
 s=re.sub(r'<link rel="stylesheet" href="/legacy-phone.css[^\"]*">','',s)
 s=re.sub(r'<script type="module" src="/legacy-phone.js[^\"]*"></script>','',s)
 s=re.sub(r'<script type="application/json" data-legacy-ui>.*?</script>','',s,flags=re.S)
 s=re.sub(r'<dialog class="legacy-preview-dialog".*?</dialog>','',s,flags=re.S)
 s=re.sub(r'<p class="legacy-reader-hint">.*?</p>','',s,flags=re.S)
 s=s.replace('<nav class="legacy-years"',f'<p class="legacy-reader-hint">{c["hint"]}</p><nav class="legacy-years"',1)
 def card(m):
  text=m[0]
  text=re.sub(r'<span class="legacy-preview-label">.*?</span>','',text)
  text=re.sub(r'(<figure class="legacy-record-image"><a)([^>]*)(>)(.*?)(</a>)',lambda a:a[1]+re.sub(r' data-legacy-preview(?:="[^"]*")?| aria-haspopup="dialog"','',a[2])+' data-legacy-preview aria-haspopup="dialog"'+a[3]+a[4]+f'<span class="legacy-preview-label">{c["preview"]} ↗</span>'+a[5],text,count=1,flags=re.S)
  # Keep detailed source notices available without repeating a long paragraph above every control.
  text=re.sub(r'<p class="article-reader-note">(.*?)</p>',lambda a:f'<details class="legacy-audio-info"><summary>{c["details"]}</summary><p class="article-reader-note">{a[1]}</p></details>' if 'class="legacy-audio-info"' not in text else a[0],text,count=1,flags=re.S)
  # The reader already provides the original PDF; retain one clear record-page action.
  text=re.sub(r'<a\b[^>]*class="[^"]*article-summary-link[^"]*"[^>]*>.*?</a>','',text,flags=re.S)
  text=re.sub(r'(<div class="legacy-actions">)(.*?)(</div>)',lambda a:a[1]+re.sub(r'<a\b[^>]*href="[^"]+\.pdf"[^>]*>.*?</a>','',a[2])+a[3],text,flags=re.S)
  return text
 s=re.sub(r'<article class="legacy-record record-card".*?</article>',card,s,flags=re.S)
 modal=f'''<dialog class="legacy-preview-dialog" aria-labelledby="legacy-preview-title"><div class="legacy-preview-toolbar"><h2 id="legacy-preview-title">MT E.L.K., INC.</h2><button type="button" data-preview-zoom aria-pressed="false">{c['zoom']}</button><button type="button" data-preview-close>{c['close']} ×</button></div><div class="legacy-preview-scroll"><img alt=""></div><p><a href="/archive/">{c['source']} →</a></p></dialog>'''
 s=s.replace('</main>','</main>'+modal+f'<script type="application/json" data-legacy-ui>{json.dumps(c,ensure_ascii=False)}</script>')
 s=s.replace('</head>',f'<link rel="stylesheet" href="/legacy-phone.css?v={digest("legacy-phone.css")}"></head>')
 s=s.replace('</body>',f'<script type="module" src="/legacy-phone.js?v={digest("legacy-phone.js")}"></script></body>')
 p.write_text(s)
# Cache keys for shared controllers must be current across independent page entry points.
for p in root.rglob('index.html'):
 s=p.read_text()
 for name in ['page-transitions.js','article-reader.js']:
  s=re.sub(r'(/'+re.escape(name)+r')\?v=[a-f0-9]+',r'\1?v='+digest(name),s)
 p.write_text(s)
print('Tightened four Legacy pages; added localized scan previews and compact phone audio controls.')
