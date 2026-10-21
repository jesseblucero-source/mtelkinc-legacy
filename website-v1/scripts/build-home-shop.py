from pathlib import Path
from html import escape
import json,re,hashlib
root=Path('dist')
texts=json.loads(Path('content/home-shop.json').read_text());campaign=json.loads(Path('content/home-store-campaign.json').read_text())
for lang,t in texts.items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'index.html';s=p.read_text()
 actions=f'<div class="actions home-store-actions"><a class="button primary home-shop-button" href="{prefix}/shop/">{t["shop"]} <span aria-hidden="true">→</span></a><a class="text-link" href="{prefix}/education/">{t["learn"]} <span aria-hidden="true">→</span></a><a class="text-link" href="{prefix}/legacy/">{t["legacy"]} <span aria-hidden="true">→</span></a></div>'
 s,n=re.subn(r'(<p class="hero-intro">.*?</p>)<div class="actions[^\"]*">.*?</div>',lambda m:m[1]+actions,s,count=1,flags=re.S);assert n==1
 s=re.sub(r'<section class="home-store-entry[^"]*".*?</section>','',s,flags=re.S)
 c=campaign['locales'][lang];media=campaign['media']
 links=''.join(f'<a href="{prefix}/shop/?category={slug}"><span class="shop-category-number" aria-hidden="true">0{i+1}</span><span><strong>{escape(label)}</strong><small>{escape(c["categorylines"][i])}</small></span><span class="shop-category-arrow" aria-hidden="true">↗</span></a>' for i,(slug,label) in enumerate(zip(['elk','mule-deer','whitetail','bands-reeds'],t['categories'])))
 proof=''.join('<span>'+escape(label)+'</span>' for label in c['proof'])
 section=f'<section class="home-store-entry shop-campaign" aria-labelledby="home-store-title"><div class="shop-campaign-lead"><figure class="shop-campaign-art"><img src="{media["src"]}" srcset="{media["srcset"]}" sizes="(max-width:760px) 100vw, (max-width:1100px) 90vw, 55vw" width="{media["width"]}" height="{media["height"]}" loading="lazy" decoding="async" alt="{escape(c["alt"],quote=True)}"><figcaption>THE LANGUAGE OF THE WILD</figcaption></figure><div class="shop-campaign-copy"><p class="eyebrow">MT E.L.K., INC. / {t["label"]}</p><h2 id="home-store-title">{escape(c["headline"][0])}<br><em>{escape(c["headline"][1])}</em></h2><p class="shop-campaign-intro">{escape(c["intro"])}</p><div class="shop-campaign-actions"><a class="button primary" href="{prefix}/shop/">{escape(c["cta"])} <span aria-hidden="true">→</span></a><a class="shop-campaign-learn" href="{prefix}/education/">{escape(c["learn"])} <span aria-hidden="true">→</span></a></div><div class="shop-campaign-proof">{proof}</div></div></div><div class="home-store-entry-links shop-campaign-categories"><p class="shop-category-heading">{escape(c["categoryhead"])}</p><nav aria-label="{t["categorynav"]}">{links}</nav></div></section>'
 s=re.sub(r'<link rel="stylesheet" href="/home-store-campaign\.css[^"]*">','',s)
 s=s.replace('</head>','<link rel="stylesheet" href="/home-store-campaign.css?v='+hashlib.sha256((root/'home-store-campaign.css').read_bytes()).hexdigest()[:12]+'"></head>')
 s=re.sub(r'src="/cinematic\.js(?:\?[^\"]*)?"',f'src="/cinematic.js?v={hashlib.sha256((root/"cinematic.js").read_bytes()).hexdigest()[:12]}"',s)
 s=s.replace('<nav class="home-chapters"',section+'<nav class="home-chapters"',1);p.write_text(s)
print('Added primary homepage Shop buttons and store discovery in all four languages.')
