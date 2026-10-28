# -*- coding: utf-8 -*-
"""Idempotent static delivery pass: fewer CSS requests and responsive card images."""
from pathlib import Path
import hashlib,html,json,re
root=Path(__file__).resolve().parent.parent;dist=root/'dist'

def restore(s):
 def expand(m):
  return ''.join('<link rel="stylesheet" href="'+html.escape(v,quote=True)+'">' for v in json.loads(html.unescape(m[1])))
 return re.sub(r'<link\b[^>]*data-style-sources="([^"]+)"[^>]*>',expand,s)

if __name__=='__main__':
 fonts=json.loads((root/'content/font-delivery.json').read_text()) if (root/'content/font-delivery.json').exists() else {}
 bundles=set()
 for p in dist.rglob('index.html'):
  s=restore(p.read_text())
  s=re.sub(r'/assets/(roboto-400|robotoslab-600)-optimized-[a-f0-9]+\.woff2',lambda m:'/assets/'+m[1]+'.woff2',s)
  # Keep exact cascade order, including language and palette overrides.
  links=list(re.finditer(r'<link rel="stylesheet" href="(/[^"?]+\.css(?:\?[^\"]*)?)">',s))
  if links:
   sources=[m[1].split("?")[0] for m in links]
   css='\n'.join('/* '+url+' */\n'+(dist/url.lstrip('/')).read_text() for url in sources)
   for original,optimized in fonts.items():css=css.replace(original,optimized)
   digest=hashlib.sha256(css.encode()).hexdigest()[:12];name='page-styles-'+digest+'.css';bundles.add(name)
   (dist/'assets'/name).write_text(css)
   link='<link rel="stylesheet" href="/assets/'+name+'" data-style-sources="'+html.escape(json.dumps(sources,separators=(',',':')),quote=True)+'">'
   first=links[0].start()
   for m in reversed(links):s=s[:m.start()]+(link if m.start()==first else '')+s[m.end():]
  for original,optimized in fonts.items():s=s.replace(original,optimized)
  s=re.sub(r'<script\b[^>]*src="/page-transitions\.js(?:\?[^"]*)?"[^>]*></script>','',s)
  router_hash=hashlib.sha256((dist/'page-transitions.js').read_bytes()).hexdigest()[:12]
  s=s.replace('</head>','<script src="/page-transitions.js?v='+router_hash+'" defer data-site-persist="router"></script></head>')
  def module_entry(m):
   name=m[1];digest=hashlib.sha256((dist/(name+'.js')).read_bytes()).hexdigest()[:12]
   return '<script type="module" src="/'+name+'.js?v='+digest+'"></script>'
  s=re.sub(r'<script\b[^>]*src="/(script|dynamic|learn|media|education-hub|about|canada|deer-path|support|field-guide|cinematic|hero-depth|site-language)\.js(?:\?[^"]*)?"[^>]*></script>',module_entry,s)
  if 'cinematic-home' in s:
   images={'elk-1440-23ce7e80.webp':('elk-480-c801ee61.webp','elk-960-223d36ba.webp',960),'hero-960-b3e89c22.webp':('hero-480-203834e0.webp','hero-960-b3e89c22.webp',960),'cow-call-draws-elk-742-a195f1f1.webp':('cow-call-draws-elk-480-a50a1014.webp','cow-call-draws-elk-742-a195f1f1.webp',742),'landscape-1000-22726ae4.webp':('landscape-480-ee24b30b.webp','landscape-1000-22726ae4.webp',1000)}
   def responsive(m):
    tag=m[0]
    if 'srcset=' in tag:return tag
    for original,(small,large,width) in images.items():
     if '/assets/'+original in tag:
      return tag[:-1]+' srcset="/assets/'+small+' 480w, /assets/'+large+' '+str(width)+'w" sizes="(max-width:760px) 88vw, (max-width:1180px) 44vw, 22vw">'
    return tag
   s=re.sub(r'<img\b[^>]*class="ogf-media"[^>]*>',responsive,s)
  p.write_text(s)
 for p in (dist/'assets').glob('page-styles-*.css'):
  if p.name not in bundles:p.unlink()
 headers=dist/'_headers';s=headers.read_text();rule='/assets/page-styles-*\n  Cache-Control: public, max-age=31536000, immutable\n'
 if rule not in s:s+='\n'+rule
 for path in fonts.values():
  entry=path+'\n  Cache-Control: public, max-age=31536000, immutable\n'
  if entry not in s:s+='\n'+entry
 headers.write_text(s)
 print('Optimized 330 page layouts into',len(bundles),'shared CSS bundles with page fades.')
