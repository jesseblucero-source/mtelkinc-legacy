# -*- coding: utf-8 -*-
from pathlib import Path
import re,json,hashlib,html
root=Path('dist')
s=(root/'script.js').read_text();start=s.index('const toggle =');end=s.index('// Subtle progressive motion:')
s=s[:start]+Path('templates/mobile-menu.js').read_text()+'\n'+s[end:];(root/'script.js').write_text(s)
p=root/'page-transitions.js';s=p.read_text();s=s.replace("const main=page.querySelector('main');if(!main?.animate)return Promise.resolve();animation=main.animate(enter?", "const main=page.querySelector('main');if(!main?.animate)return Promise.resolve();const phone=matchMedia('(max-width:760px)').matches;animation=main.animate(enter?")
s=s.replace("{duration:enter?260:140,easing:","{duration:phone?(enter?200:100):(enter?260:140),easing:")
s=s.replace("filter:'blur(2px)'", "filter:phone?'none':'blur(2px)'").replace("filter:'blur(0px)'", "filter:phone?'none':'blur(0px)'")
s=s.replace("for(const src of scripts){if(src.pathname==='/page-transitions.js')continue;const module=await import(src.href);", "const modules=await Promise.all(scripts.filter(src=>src.pathname!=='/page-transitions.js').map(src=>import(src.href)));for(const module of modules){")
p.write_text(s)
texts=json.loads(Path('content/learning-pathways.json').read_text())
cssHash=hashlib.sha256((root/'mobile-navigation.css').read_bytes()).hexdigest()[:12]
for page in root.rglob('index.html'):
 s=page.read_text();s=re.sub(r'<link rel="stylesheet" href="/mobile-navigation.css[^\"]*">','',s)
 s=s.replace('</head>',f'<link rel="stylesheet" href="/mobile-navigation.css?v={cssHash}"></head>')
 if page.parent.name=='education' and page.parent.parent in [root,root/'fr',root/'es']:
  lang='fr' if 'fr' in page.parts else 'es' if 'es' in page.parts else 'en';t=texts[lang];prefix='' if lang=='en' else '/'+lang
  section='<section class="section education-start" aria-labelledby="education-start-title"><p class="eyebrow dark">'+t['eyebrow']+'</p><h2 id="education-start-title">'+t['title']+'</h2><div class="education-start-grid">'
  for title,desc,topic,cta in t['items']:section+=f'<a href="{prefix}/education/?topic={topic}#lesson-library"><strong>{title}</strong><span>{desc}</span><b>{cta} →</b></a>'
  section+='</div><p class="education-start-help">'+t['help']+f' <a href="{prefix}/support/">'+t['support']+' →</a></p></section>'
  s=re.sub(r'<section class="section education-start".*?</section>','',s,flags=re.S)
  s=s.replace('<section class="section education-library"',section+'<section class="section education-library"',1)
 for name in ['script','page-transitions','cinematic','hero-depth']:
  digest=hashlib.sha256((root/(name+'.js')).read_bytes()).hexdigest()[:12]
  s=re.sub(r'src="/'+name+r'\.js(?:\?[^\"]*)?"',f'src="/{name}.js?v={digest}"',s)
 page.write_text(s)
# Keep the index records and original descriptions; refresh entries from current page metadata.
rows=json.loads((root/'resource-index.json').read_text())
for row in rows:
 page=root/row['url'].strip('/')/'index.html';s=page.read_text();row['title']=html.unescape(re.search(r'<title>(.*?)</title>',s,re.S).group(1)).split(' | ')[0];row['description']=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s).group(1))
(root/'resource-index.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Expanded 330 page navigation layouts and three localized Education starting points; refreshed 110 indexed resources.')
# Preserve shareable subdomain routes whenever the static resource index is rebuilt.
import runpy
runpy.run_path(str(Path(__file__).resolve().parent/'build-domain-shortcuts.py'))
