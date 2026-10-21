"""Build the planned University landing pages and their existing-site entry points."""
from pathlib import Path
from html import escape as e
import hashlib,json,re
root=Path('dist');record=json.loads(Path('content/university.json').read_text());locales=record['locales'];name=record['name'];origin='https://mtelkinc-educationhub.netlify.app'
css='/university.css?v='+hashlib.sha256((root/'university.css').read_bytes()).hexdigest()[:12]
def prefix(lang):return '' if lang=='en' else '/'+lang
for lang,t in locales.items():
 pre=prefix(lang);template=(root/pre.strip('/')/'index.html').read_text();head=template.split('</head>')[0]+'</head>'
 head=re.sub(r'<link rel="stylesheet" href="/(?:home-store-campaign|university)\.css[^"]*">','',head)
 title=name+' — '+t['status'];url=origin+pre+'/university/'
 head=re.sub(r'<title>.*?</title>','<title>'+e(title)+'</title>',head)
 head=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="'+e(t['intro'],quote=True)+'">',head)
 for prop,value in [('title',title),('description',t['intro']),('url',url)]:head=re.sub(r'<meta property="og:'+prop+r'"[^>]*>','<meta property="og:'+prop+'" content="'+e(value,quote=True)+'">',head)
 head=re.sub(r'<link rel="canonical"[^>]*>','<link rel="canonical" href="'+url+'">',head);head=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',head)
 head=head.replace('</head>','<link rel="stylesheet" href="'+css+'">'+''.join(f'<link rel="alternate" hreflang="{l}" href="{origin}{prefix(l)}/university/">' for l in locales)+'</head>')
 header=re.search(r'<body[^>]*>(.*?)</header>',template,re.S).group(1);header=re.sub(r' aria-current="page"','',header)
 for l in locales:header=re.sub(r'(<a data-site-language="'+l+r'"[^>]*href=")[^"]*',r'\1'+prefix(l)+'/university/',header)
 header=header.replace('data-site-language="'+lang+'"','data-site-language="'+lang+'" aria-current="page"')
 footer=re.search(r'<footer\b.*?</footer>',template,re.S).group(0)
 themes=''.join(f'<article class="university-theme"><span class="university-number" aria-hidden="true">0{i+1}</span><h3>{e(title)}</h3><p>{e(body)}</p></article>' for i,(title,body) in enumerate(t['themes']))
 resources=''.join(f'<a href="{pre}/{path}/">{e(t[key])}<span aria-hidden="true">→</span></a>' for path,key in [('videos','videos'),('banding','care'),('legacy','legacy')])
 main=f'''<main id="main" class="university-page"><nav class="university-breadcrumbs" aria-label="Breadcrumb"><a href="{pre}/">{e(t['home'])}</a><span aria-hidden="true">/</span><a href="{pre}/education/">{e(t['education'])}</a><span aria-hidden="true">/</span><span aria-current="page">{e(name)}</span></nav><section class="university-hero" aria-labelledby="university-title"><img class="university-image" src="/assets/elk-960-223d36ba.webp" srcset="/assets/elk-480-c801ee61.webp 480w, /assets/elk-960-223d36ba.webp 960w, /assets/elk-1440-23ce7e80.webp 1440w" sizes="(max-width:760px) 100vw, 70vw" width="960" height="640" fetchpriority="high" alt="{e(t['imagealt'],quote=True)}"><div class="university-intro"><span class="university-status">{e(t['status'])}</span><h1 id="university-title"><span>MT E.L.K., INC.</span> UNIVERSITY</h1><p class="university-tagline">{e(t['tagline'])}</p><p>{e(t['intro'])}</p><div class="university-actions"><a class="university-primary" href="{pre}/education/">{e(t['learn'])} <span aria-hidden="true">→</span></a></div></div></section><section class="university-section" aria-labelledby="university-plan"><h2 id="university-plan">{e(t['planned'])}</h2><div class="university-themes">{themes}</div><p class="university-note">{e(t['note'])}</p></section><section class="university-now" aria-labelledby="university-now"><h2 id="university-now">{e(t['now'])}</h2><p>{e(t['nowbody'])}</p><a class="university-primary" href="{pre}/education/">{e(t['learn'])} <span aria-hidden="true">→</span></a><nav aria-label="{e(t['now'],quote=True)}">{resources}</nav></section></main>'''
 scripts=''.join(f'<script type="module" src="/{n}.js?v={hashlib.sha256((root/(n+".js")).read_bytes()).hexdigest()[:12]}"></script>' for n in ['script','site-language'])
 dest=root/pre.strip('/')/'university/index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(head+'<body>'+header+'</header>'+main+footer+scripts+'</body></html>')
for p in root.rglob('index.html'):
 lang=p.relative_to(root).parts[0];lang=lang if lang in locales else 'en';pre=prefix(lang);t=locales[lang];s=p.read_text()
 if 'data-archive-redirect' in s or 'http-equiv="refresh"' in s:continue
 s=re.sub(r'<a class="footer-university"[^>]*>.*?</a>','',s,flags=re.S)
 s=re.sub(r'(<footer>.*?<nav\b[^>]*>)(.*?)(</nav>)',lambda m:m[1]+m[2]+f'<a class="footer-university" href="{pre}/university/">{e(name)}</a>'+m[3],s,count=1,flags=re.S)
 if p==root/pre.strip('/')/'education/index.html':
  s=re.sub(r'<aside class="university-teaser".*?</aside>','',s,flags=re.S)
  teaser=f'<aside class="university-teaser" aria-labelledby="university-teaser-title"><div><p class="university-teaser-label">{e(t["status"])}</p><h2 id="university-teaser-title">{e(name)}</h2><p>{e(t["teaser"])}</p></div><a class="university-primary" href="{pre}/university/">{e(t["details"])} <span aria-hidden="true">→</span></a></aside>'
  s=s.replace('<section class="section education-help"',teaser+'<section class="section education-help"',1)
  s=re.sub(r'<link rel="stylesheet" href="/university\.css[^"]*">','',s);s=s.replace('</head>','<link rel="stylesheet" href="'+css+'"></head>')
 if p==root/pre.strip('/')/'index.html':
  s=re.sub(r'<section class="home-university".*?</section>','',s,flags=re.S)
  home=t['homepage']
  topics=''.join('<li>'+e(label)+'</li>' for label in home['topics'])
  section=f'<section class="home-university" id="university" aria-labelledby="home-university-title"><div class="home-university-art"><img src="/assets/elk-960-223d36ba.webp" srcset="/assets/elk-480-c801ee61.webp 480w, /assets/elk-960-223d36ba.webp 960w, /assets/elk-1440-23ce7e80.webp 1440w" sizes="(max-width:760px) 100vw, 55vw" width="960" height="640" loading="lazy" decoding="async" alt="{e(t["imagealt"],quote=True)}"></div><div class="home-university-copy"><p class="university-status">{e(t["status"])}</p><h2 id="home-university-title"><span>MT E.L.K., INC.</span> UNIVERSITY</h2><p class="home-university-tagline">{e(t["tagline"])}</p><p class="home-university-description">{e(home["body"])}</p><ul class="home-university-topics">{topics}</ul><a class="university-primary" href="{pre}/university/">{e(home["button"])} <span aria-hidden="true">→</span></a></div></section>'
  marker='<section class="story section legacy-home'
  assert marker in s,str(p)
  s=s.replace(marker,section+marker,1)
 # Keep this component stylesheet on only the pages that use it.
 s=re.sub(r'<link rel="stylesheet" href="/university\.css[^"]*">','',s)
 if p in [root/pre.strip('/')/'index.html',root/pre.strip('/')/'education/index.html',root/pre.strip('/')/'university/index.html']:
  s=s.replace('</head>','<link rel="stylesheet" href="'+css+'"></head>')
 assert s.count('class="footer-university"')==1,str(p)
 p.write_text(s)
urls=['/' if p.parent==root else '/'+p.parent.relative_to(root).as_posix()+'/' for p in root.rglob('index.html')]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+u+'</loc></url>' for u in sorted(urls))+'</urlset>')
for lang,t in locales.items():
 pre=prefix(lang);p=root/pre.strip('/')/'resource-index.json';rows=[r for r in json.loads(p.read_text()) if not r['url'].endswith('/university/')];rows.append(dict(title=name,description=t['intro'],url=pre+'/university/',kind='page',keywords='university coming soon planned education calling care history '+t['status']));p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Built four University pages, Education teasers, footer links, sitemap and search indexes.')
