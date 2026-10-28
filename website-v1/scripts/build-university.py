"""Generate guided training from existing verified lessons; preserve original videos and URLs."""
from pathlib import Path
from html import escape as e,unescape
import hashlib,json,re
root=Path('dist');ui=json.loads(Path('content/university-training-ui.json').read_text());lessons=json.loads(Path('content/university-lessons.json').read_text());origin='https://www.mtelkinc.com'
digest=lambda n:hashlib.sha256((root/n).read_bytes()).hexdigest()[:12]
for lang,t in ui.items():
 pre='' if lang=='en' else '/'+lang;p=root/pre.strip('/')/'university/index.html';s=p.read_text();cards=[]
 for lesson in lessons:
  slug=lesson['slug'];source=(root/pre.strip('/')/'education/lessons'/slug/'index.html').read_text();title=re.search(r'<h1>(.*?)</h1>',source,re.S).group(1);desc=re.search(r'class="detail-intro">(.*?)</p>',source,re.S).group(1)
  cards.append(f'<article class="training-card" data-training-card="{slug}" data-species="{lesson["species"]}"><p class="eyebrow dark">{e(t[lesson["species"]])}</p><h3>{title}</h3><p>{desc}</p><div class="training-card-actions"><button type="button" class="university-primary" data-video="{lesson["video"]}" data-title="{e(unescape(title),quote=True)}">{e(t["watch"])}</button><a href="{pre}/education/lessons/{slug}/">{e(t["lesson"])} →</a></div><label class="training-check"><input type="checkbox" data-training-done="{slug}" disabled> {e(t["mark"])}<span class="sr-only">: {title}</span></label></article>')
 nav=''.join(f'<a href="?path={k}#training" data-training-path="{k}">{e(t[k])}</a>' for k in ['all','deer','elk','predators','antelope'])
 main=f'''<main id="main" class="university-page"><section class="university-hero"><img class="university-image" src="/assets/elk-960-223d36ba.webp" srcset="/assets/elk-480-c801ee61.webp 480w, /assets/elk-960-223d36ba.webp 960w" sizes="(max-width:760px) 100vw, 70vw" width="960" height="640" fetchpriority="high" alt=""><div class="university-intro"><p class="university-status">{e(t['status'])}</p><h1><span>MT E.L.K., INC.</span> UNIVERSITY</h1><p>{e(t['intro'])}</p><a class="university-primary" href="#training">{e(t['learn'])} →</a></div></section><section class="university-section training-section" id="training" data-training-root data-progress-label="{e(t['progress'],quote=True)}" data-storage-message="{e(t['storage'],quote=True)}"><h2>{e(t['heading'])}</h2><p>{e(t['note'])}</p><nav class="training-paths" aria-label="{e(t['heading'],quote=True)}">{nav}</nav><div class="training-progress" hidden><label for="training-progress">{e(t['status'])}</label><progress id="training-progress" max="{len(lessons)}" value="0"></progress><p data-training-count role="status" aria-live="polite"></p><div class="training-tools"><button type="button" data-training-export>{e(t['export'])}</button><button type="button" data-training-reset>{e(t['reset'])}</button></div><p data-training-storage role="status"></p></div><div class="training-grid">{''.join(cards)}</div></section><dialog id="training-reset" aria-labelledby="training-reset-title"><h2 id="training-reset-title">{e(t['clear'])}</h2><button type="button" data-reset-cancel>{e(t['cancel'])}</button><button type="button" data-reset-confirm>{e(t['confirm'])}</button></dialog></main><dialog id="video-dialog" aria-labelledby="video-title"><button class="dialog-close" aria-label="{e(t['close'],quote=True)}">×</button><h2 id="video-title"></h2><div id="video-frame"></div></dialog>'''
 s=re.sub(r'<dialog id="video-dialog".*?</dialog>','',s,flags=re.S)
 s=re.sub(r'<main\b.*?</main>',lambda _:main,s,count=1,flags=re.S)
 # Remove any old provider dialog outside main before replacing (idempotent).
 s=re.sub(r'(<dialog id="video-dialog".*?</dialog>)(?=.*<dialog id="video-dialog")','',s,flags=re.S)
 s=re.sub(r'<title>.*?</title>',f'<title>MT E.L.K., INC. UNIVERSITY | {e(t["status"])}</title>',s,flags=re.S)
 s=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',lambda m:m[1]+e(t['intro'],quote=True),s)
 s=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+e('MT E.L.K., INC. UNIVERSITY | '+t['status'],quote=True),s)
 s=s.replace('https://mtelkinc-educationhub.netlify.app',origin)
 for n in ['university-training','learn']:
  s=re.sub(r'<script type="module" src="/'+n+r'\.js[^\"]*"></script>','',s);s=s.replace('</body>',f'<script type="module" src="/{n}.js?v={digest(n+".js")}"></script></body>')
 for n in ['university','learn','university-training']:
  s=re.sub(r'<link rel="stylesheet" href="/'+n+r'\.css[^\"]*">','',s);s=s.replace('</head>',f'<link rel="stylesheet" href="/{n}.css?v={digest(n+".css")}"></head>')
 p.write_text(s)
 for path in ['index.html','education/index.html']:
  other=root/pre.strip('/')/path;html=other.read_text();html=re.sub(r'(class="(?:university-status|university-teaser-label)">).*?(</p>|</span>)',lambda m:m[1]+e(t['status'])+m[2],html)
  html=re.sub(r'(<a class="university-primary" href="'+re.escape(pre)+r'/university/">).*?(<span)',lambda m:m[1]+e(t['learn'])+' '+m[2],html)
  html=re.sub(r'(<p class="home-university-description">).*?</p>',lambda m:m[1]+e(t['intro'])+'</p>',html)
  html=re.sub(r'(<aside class="university-teaser".*?<h2[^>]*>.*?</h2><p>).*?</p>',lambda m:m[1]+e(t['intro'])+'</p>',html,flags=re.S)
  html=re.sub(r'(<aside class="university-teaser".*?<a class="university-primary"[^>]*>).*?(<span)',lambda m:m[1]+e(t['learn'])+' '+m[2],html,flags=re.S);other.write_text(html)
 for locale in [root/pre.strip('/')/'resource-index.json']:
  rows=json.loads(locale.read_text())
  for row in rows:
   if row['url']==pre+'/university/':row.update(title='MT E.L.K., INC. UNIVERSITY',description=t['intro'],keywords=t['status'])
  locale.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Built four guided-training hubs from 11 existing lessons.')
