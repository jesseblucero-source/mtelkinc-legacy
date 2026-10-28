"""Deliver the unchanged homepage hero efficiently; keep WebP/browser fallbacks."""
from pathlib import Path
import hashlib,json,re
root=Path('dist');record=json.loads(Path('content/home-delivery.json').read_text())
for entry in record['avif']+[record['webp_780']]:
 assert hashlib.sha256((root/entry['url'].lstrip('/')).read_bytes()).hexdigest()==entry['sha256'],entry['url']
assert hashlib.sha256((root/record['source'].lstrip('/')).read_bytes()).hexdigest()==record['source_sha256'],'Original hero changed; regenerate variants explicitly.'
srcset=', '.join(x['url']+' '+str(x['width'])+'w' for x in record['avif']);sizes='(max-width: 760px) 100vw, 50vw'
for pre in ['', 'fr/', 'es/', 'de/']:
 p=root/pre/'index.html';s=p.read_text()
 s=re.sub(r'<picture data-home-(?:hero|photo)>.*?(<img\b[^>]*>).*?</picture>',lambda m:m[1],s,flags=re.S)
 def hero(m):
  img=m[0]
  if 'decoding=' not in img:img=img[:-1]+' decoding="async">'
  img=re.sub(r'srcset="[^"]*"',lambda _: 'srcset="/assets/hero-480-203834e0.webp 480w, '+record['webp_780']['url']+' 780w, /assets/hero-960-b3e89c22.webp 960w, /assets/hero-1440-b731d7d3.webp 1440w"',img)
  return '<picture data-home-hero><source type="image/avif" srcset="'+srcset+'" sizes="'+sizes+'">'+img+'</picture>'
 def reused_photo(m):
  img=m[0];card_sizes=re.search(r'sizes="([^"]*)"',img).group(1)
  img=re.sub(r'srcset="[^"]*"',lambda _: 'srcset="/assets/hero-480-203834e0.webp 480w, '+record['webp_780']['url']+' 780w, /assets/hero-960-b3e89c22.webp 960w"',img)
  return '<picture data-home-photo><source type="image/avif" srcset="'+srcset+'" sizes="'+card_sizes+'">'+img+'</picture>'
 s=re.sub(r'<img\b[^>]*src="/assets/hero-960-b3e89c22.webp"[^>]*>',reused_photo,s)
 s,n=re.subn(r'<img\b[^>]*src="/assets/hero-1440-b731d7d3.webp"[^>]*>',hero,s,count=1);assert n==1,pre
 s=re.sub(r'<link data-home-preload[^>]*>','',s)
 preload='<link data-home-preload rel="preload" as="image" type="image/avif" imagesrcset="'+srcset+'" imagesizes="'+sizes+'" fetchpriority="high">'
 s=s.replace('<link rel="stylesheet"',preload+'<link rel="stylesheet"',1);p.write_text(s)
# Original selectors remain equivalent when the responsive picture element is present.
for name in ['styles.css','cinematic.css']:
 p=root/name;s=p.read_text().replace('.hero-image>img','.hero-image img')
 if name=='cinematic.css' and '.hero-image>picture,.cinematic-home picture[data-home-photo]{display:contents}' not in s:s+='\n.hero-image>picture,.cinematic-home picture[data-home-photo]{display:contents}\n'
 p.write_text(s)
p=root/'site-language.js';s=p.read_text()
s=s.replace(" // English UI is already emitted by each controller; no dictionary scan is needed.\n if(locale==='en')return;\n",'')
old="  scan(document.body);new MutationObserver"
new="  // English pages are already emitted in English. Restore only persistent controls from prior locales.\n  if(locale==='en'){document.querySelectorAll('body > [data-site-persist]').forEach(scan);return;}\n  scan(document.body);new MutationObserver"
if new not in s:
 assert old in s,'Translation scan changed; review fast path before building.'
 s=s.replace(old,new)
p.write_text(s)
p=root/'_headers';s=p.read_text()
for entry in record['avif']+[record['webp_780']]:
 rule=entry['url']+'\n  Cache-Control: public, max-age=31536000, immutable\n'
 if rule not in s:s+='\n'+rule
p.write_text(s)
print('Optimized four homepage heroes; responsive AVIF, WebP fallback and matching preload. Original photo preserved.')
