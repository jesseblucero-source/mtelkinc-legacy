from pathlib import Path
from html import escape
import json,re,hashlib
root=Path('dist');record=json.loads(Path('content/guidefitter.json').read_text())
copy={
'en':{'title':'Guidefitter','intro':'Find MT E.L.K., INC. on Guidefitter.','labels':['Guides & Outfitters','Military & First Responders','Outdoor Industry Pros'],'external':'Opens Guidefitter in a new tab'},
'fr':{'title':'Guidefitter','intro':'Retrouvez MT E.L.K., INC. sur Guidefitter.','labels':['Guides et pourvoyeurs','Militaires et premiers intervenants','Professionnels du secteur de plein air'],'external':'Ouvre Guidefitter dans un nouvel onglet'},
'es':{'title':'Guidefitter','intro':'Encuentre MT E.L.K., INC. en Guidefitter.','labels':['Guías y organizadores de caza','Militares y personal de emergencias','Profesionales del sector de actividades al aire libre'],'external':'Abre Guidefitter en una nueva pestaña'},
'de':{'title':'Guidefitter','intro':'Finden Sie MT E.L.K., INC. auf Guidefitter.','labels':['Jagd- und Outdoor-Guides','Militär und Einsatzkräfte','Fachleute der Outdoor-Branche'],'external':'Öffnet Guidefitter in einem neuen Tab'}}
page_record=json.loads(Path('content/guidefitter-page.json').read_text());origin='https://mtelkinc-educationhub.netlify.app'
def external(url,label,t):
 return f'<a href="{escape(url,quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{escape(label+" — "+t["external"],quote=True)}">{escape(label)} <span aria-hidden="true">↗</span></a>'
def render_program_page(lang,t,main):
 prefix='' if lang=='en' else '/'+lang;path='/guidefitter/';template=(root/prefix.strip('/')/'index.html').read_text();head=template.split('</head>')[0]+'</head>';head=re.sub(r'<link rel="stylesheet" href="/home-store-campaign\.css[^"]*">','',head)
 head=re.sub(r'<title>.*?</title>','<title>'+escape(t['title'])+' | MT E.L.K., INC.</title>',head)
 head=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="'+escape(t['intro'],quote=True)+'">',head)
 for prop,value in [('title',t['title']+' | MT E.L.K., INC.'),('description',t['intro']),('url',origin+prefix+path)]:head=re.sub(r'<meta property="og:'+prop+r'"[^>]*>','<meta property="og:'+prop+'" content="'+escape(value,quote=True)+'">',head)
 head=re.sub(r'<link rel="canonical"[^>]*>','<link rel="canonical" href="'+origin+prefix+path+'">',head);head=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',head)
 head=head.replace('</head>','<link rel="stylesheet" href="/guidefitter.css?v='+hashlib.sha256((root/'guidefitter.css').read_bytes()).hexdigest()[:12]+'">'+''.join(f'<link rel="alternate" hreflang="{l}" href="{origin}'+('' if l=='en' else '/'+l)+path+'">' for l in copy)+'</head>')
 header=re.search(r'<body[^>]*>(.*?)</header>',template,re.S).group(1);header=re.sub(r' aria-current="page"','',header)
 for l in copy:header=re.sub(r'(<a data-site-language="'+l+r'"[^>]*href=")[^"]*',r'\1'+('' if l=='en' else '/'+l)+path,header)
 header=header.replace('data-site-language="'+lang+'"','data-site-language="'+lang+'" aria-current="page"')
 footer=re.search(r'<footer\b.*?</footer>',template,re.S).group(0)
 scripts=''.join(f'<script type="module" src="/{name}.js?v={hashlib.sha256((root/(name+".js")).read_bytes()).hexdigest()[:12]}"></script>' for name in ['script','site-language'])
 dest=root/prefix.strip('/')/'guidefitter/index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(head+'<body>'+header+'</header>'+main+footer+scripts+'</body></html>')
for lang,t in page_record['locales'].items():
 prefix='' if lang=='en' else '/'+lang;labels=copy[lang]['labels'];programs='';jumps=''
 for i,ident in enumerate(page_record['program_ids']):
  jumps+=f'<a href="#{ident}">{escape(labels[i])} <span aria-hidden="true">↓</span></a>'
  programs+=f'<article class="gf-program" id="{ident}"><span class="gf-number" aria-hidden="true">0{i+1}</span><h3>{escape(labels[i])}</h3><p>{escape(t["descriptions"][i])}</p>{external(record["destination"],t["continue"],t)}</article>'
 steps=''.join(f'<li><h3>{escape(title)}</h3><p>{escape(body)}</p></li>' for title,body in t['steps'])
 resources=''.join(f'<a href="{prefix}/{path}/"><h3>{escape(title)} <span aria-hidden="true">→</span></h3><p>{escape(body)}</p></a>' for path,(title,body) in zip(['education','banding','shop'],t['resources']))
 questions=''.join(f'<details><summary>{escape(q)}</summary><p>{escape(a)}</p></details>' for q,a in t['questions'])
 main=f'<main id="main"><section class="gf-hero"><div class="gf-hero-copy"><p class="eyebrow">MT E.L.K., INC. / GUIDEFITTER</p><h1>{escape(t["heading"])}</h1><p>{escape(t["intro"])}</p><a class="gf-primary" href="#programs">{escape(t["choose"])} ↓</a></div><div class="gf-hero-image"><img src="/assets/elk-960-223d36ba.webp" srcset="/assets/elk-480-c801ee61.webp 480w, /assets/elk-960-223d36ba.webp 960w, /assets/elk-1440-23ce7e80.webp 1440w" sizes="(max-width:760px) 100vw, 50vw" width="960" height="640" fetchpriority="high" decoding="async" alt="{escape(t["imagealt"],quote=True)}"></div></section><nav class="gf-jumps" aria-label="{escape(t["choose"],quote=True)}">{jumps}</nav><section class="gf-section" id="programs"><p class="eyebrow dark">GUIDEFITTER</p><h2>{escape(t["choose"])}</h2><p class="gf-lead">{escape(t["lead"])}</p><div class="gf-programs">{programs}</div><p class="gf-external-note">{escape(t["external"])} ↗</p></section><section class="gf-steps gf-section"><h2>{escape(t["how"])}</h2><ol>{steps}</ol>{external(page_record["sources"]["verification"],t["verify"],t)}</section><section class="gf-section"><h2>{escape(t["learn"])}</h2><p class="gf-lead">{escape(t["learnintro"])}</p><div class="gf-resources">{resources}</div></section><section class="gf-section gf-faq"><h2>{escape(t["faqs"])}</h2>{questions}<a class="gf-support" href="{prefix}/contact/">{escape(t["support"])} →</a></section><aside class="gf-sources"><h2>{escape(t["sources"])}</h2><a href="{page_record["sources"]["brand"]}">{escape(t["sourcebrand"])} ↗</a>{external(page_record["sources"]["program"],t["sourceguide"],t)}</aside></main>'
 render_program_page(lang,t,main)
for p in root.rglob('index.html'):
 parts=p.relative_to(root).parts;lang=parts[0] if parts[0] in copy else 'en';t=copy[lang];pt=page_record['locales'][lang];prefix='' if lang=='en' else '/'+lang;s=p.read_text()
 if 'data-archive-redirect' in s or 'http-equiv="refresh"' in s:continue
 s=re.sub(r'<section class="footer-guidefitter".*?</section>','',s,flags=re.S)
 cards=''.join(f'<a href="{escape(record["destination"],quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{escape(label+" — "+t["external"],quote=True)}">{escape(label)} <span aria-hidden="true">↗</span></a>' for label in t['labels'])
 section=f'<section class="footer-guidefitter" aria-labelledby="footer-guidefitter-title"><div><h2 id="footer-guidefitter-title">{t["title"]}</h2><p>{t["intro"]}</p><a class="footer-guidefitter-overview" href="{prefix}/guidefitter/">{pt["overview"]} →</a><small>{t["external"]} ↗</small></div><nav aria-label="Guidefitter">{cards}</nav></section>'
 s=s.replace('<nav class="footer-disclosures"',section+'<nav class="footer-disclosures"',1)
 digest=hashlib.sha256((root/'mobile-navigation.css').read_bytes()).hexdigest()[:12]
 s=re.sub(r'href="/mobile-navigation\.css(?:\?[^\"]*)?"',f'href="/mobile-navigation.css?v={digest}"',s)
 assert s.count('class="footer-guidefitter"')==1,str(p)
 if '/shop/' in '/'+p.relative_to(root).as_posix():
  s=re.sub(r'<a class="store-guidefitter-link".*?</a>','',s)
  s=s.replace('<aside class="store-help">',f'<a class="store-guidefitter-link" href="{prefix}/guidefitter/">{pt["storelink"]} →</a><aside class="store-help">',1)
 p.write_text(s)
print('Added Guidefitter footer section to all',len(list(root.rglob('index.html'))),'pages in four languages.')

urls=['/' if p.parent==root else '/'+p.parent.relative_to(root).as_posix()+'/' for p in root.rglob('index.html')]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+url+'</loc></url>' for url in sorted(urls))+'</urlset>')
for lang,t in page_record['locales'].items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'resource-index.json';rows=[r for r in json.loads(p.read_text()) if not r['url'].endswith('/guidefitter/')];rows.append({'title':t['title'],'description':t['intro'],'url':prefix+'/guidefitter/','kind':'page','keywords':'guidefitter guides outfitters military first responders outdoor industry '+t['title']});p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Generated four Guidefitter program pages and integrated footer/store discovery.')
