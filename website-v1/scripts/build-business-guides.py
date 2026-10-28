"""Add two source-backed Heyzine guides to business sections and shareable pages."""
from pathlib import Path
from html import escape as E
from urllib.parse import quote
import hashlib,json,re

project=Path(__file__).resolve().parents[1];root=project/'dist';base='https://www.mtelkinc.com'
records=json.loads((project/'content/business-guides.json').read_text());locales=json.loads((project/'content/business-guide-ui.json').read_text())
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
def route(prefix,record):return prefix+'/dealer-guides/'+record['id']+'/'
def cover(record,large=False):return f'<img src="{record["cover"]}" width="{record["cover_width"]}" height="{record["cover_height"]}" alt="" loading="lazy" decoding="async" class="business-guide-cover'+(' large' if large else '')+'">'
def assets(s):
 for name,kind in [('distributor-guide.css','css'),('distributor-guide.js','js')]:
  pattern=r'<link rel="stylesheet" href="/'+re.escape(name)+r'[^\"]*">' if kind=='css' else r'<script type="module" src="/'+re.escape(name)+r'[^\"]*"></script>'
  s=re.sub(pattern,'',s)
 s=s.replace('</head>',f'<link rel="stylesheet" href="/distributor-guide.css?v={digest("distributor-guide.css")}"></head>')
 return s.replace('</body>',f'<script type="module" src="/distributor-guide.js?v={digest("distributor-guide.js")}"></script></body>')
for lang,t in locales.items():
 prefix='' if lang=='en' else '/'+lang
 cards=''
 for record in records:
  words=t[record['id']];path=route(prefix,record);size=f'{record["bytes"]/1000000:.1f} MB'
  cards+=f'<article class="business-guide-card" id="guide-{record["id"]}"><a class="business-guide-cover-link" href="{path}" aria-label="{E(words["title"],quote=True)}">{cover(record)}</a><div><p class="business-guide-format">{E(t["format"])} · {record["pages"]} {E(t["pages"])}</p><h4><a href="{path}">{E(words["title"])}</a></h4><p>{E(words["description"])}</p><div class="business-guide-card-actions"><a class="business-guide-primary" href="{path}">{E(t["read"])} →</a><a href="{record["pdf"]}" download>{E(t["download"])} <span class="business-guide-size">({size})</span></a></div></div></article>'
 library='<!-- business-guides:start --><div class="business-guides" aria-labelledby="business-guides-title"><h3 id="business-guides-title">'+E(t['heading'])+'</h3><p>'+E(t['intro'])+'</p><div class="business-guide-grid">'+cards+'</div></div><!-- business-guides:end -->'
 for section in ['dealers/us/','canada/','international/']:
  page=root/prefix.strip('/')/section/'index.html';s=page.read_text();s=re.sub(r'<!-- business-guides:start -->.*?<!-- business-guides:end -->','',s,flags=re.S)
  marker='</section><!-- distributor-guide:end -->';assert marker in s,page
  page.write_text(assets(s.replace(marker,library+marker,1)))
 template=(root/prefix.strip('/')/'contact/index.html').read_text()
 for record in records:
  words=t[record['id']];path=route(prefix,record);absolute=base+path;title=words['title']+' | MT E.L.K., INC.';other=next(r for r in records if r['id']!=record['id'])
  share=f'<div class="distributor-guide-share business-guide-page-share" data-guide-share data-title="{E(title,quote=True)}" data-copied="{E(t["copied"],quote=True)}" data-manual="{E(t["manual"],quote=True)}" data-shared="{E(t["shared"],quote=True)}"><label for="business-guide-link">{E(t["share_label"])}</label><input id="business-guide-link" type="url" readonly value="{absolute}" spellcheck="false"><div class="distributor-guide-share-actions"><button type="button" data-guide-native hidden>{E(t["share"])}</button><button type="button" data-guide-copy hidden>{E(t["copy"])}</button><a data-no-fade href="https://wa.me/?text={quote(title+chr(10)+absolute,safe="")}">WhatsApp</a><a data-no-fade href="mailto:?subject={quote(title,safe="")}&amp;body={quote(absolute,safe="")}">{E(t["email"])}</a></div><p class="distributor-guide-status" role="status" aria-live="polite"></p></div>'
  main=f'''<main id="main" class="business-guide-page"><nav class="business-guide-crumb" aria-label="Breadcrumb"><a href="{prefix}/">{E(t['home'])}</a><span aria-hidden="true"> / </span><a href="{prefix}/dealers/us/#business-guides-title">{E(t['business'])}</a><span aria-hidden="true"> / </span><span aria-current="page">{E(words['title'])}</span></nav><section class="business-guide-hero"><p class="eyebrow">MT E.L.K., INC. / {E(t['heading'])}</p><h1>{E(words['title'])}</h1><p>{E(words['description'])}</p><p class="business-guide-format">{E(t['format'])} · {record['pages']} {E(t['pages'])} · PDF</p></section>
<section class="business-guide-reader" id="read-guide" aria-labelledby="business-guide-reader-title" data-business-reader data-loading="{E(t['loading'],quote=True)}" data-ready="{E(t['ready'],quote=True)}" data-fallback="{E(t['fallback'],quote=True)}" data-expand-error="{E(t['expand_error'],quote=True)}"><div data-business-guide-intro class="business-guide-reader-intro">{cover(record,True)}<div><h2 id="business-guide-reader-title">{E(t['reader'])}</h2><p>{E(t['hosted'])}</p><button type="button" class="business-guide-primary" data-load-business-guide data-embed="{record['flipbook']}" data-guide-title="{E(title,quote=True)}" hidden>{E(t['open'])} →</button><noscript><p>{E(t['fallback'])}</p></noscript></div></div><div class="business-guide-reader-toolbar" data-business-guide-toolbar hidden><button type="button" data-expand-business-guide data-expand="{E(t['expand'],quote=True)}" data-exit="{E(t['exit_fullscreen'],quote=True)}" hidden>{E(t['expand'])}</button><button type="button" data-close-business-guide>{E(t['close'])} ×</button></div><div class="business-guide-frame" data-business-guide-stage hidden></div><p data-business-guide-status class="business-guide-reader-status" role="status" aria-live="polite"></p><div class="business-guide-fallback-actions"><a href="{record['pdf']}" data-document-title="{E(title,quote=True)}">{E(t['preview'])}</a><a href="{record['pdf']}" download>{E(t['download'])} ↓</a></div></section>
<section class="business-guide-after" aria-label="{E(t['share_label'],quote=True)}">{share}<div class="business-guide-next"><p>{E(t['note'])}</p><a href="{route(prefix,other)}">{E(t['other'])} →</a><a href="{prefix}/support/">{E(t['help'])} →</a><a href="{prefix}/dealer-application/">{E(t['apply'])} →</a></div></section></main>'''
  s=re.sub(r'<main\b.*?</main>',lambda _:main,template,count=1,flags=re.S)
  s=s.replace('aria-current="page"','').replace('<span >'+E(words['title'])+'</span>','<span aria-current="page">'+E(words['title'])+'</span>')
  head_end=s.index('</head>');head=s[:head_end];body=s[head_end:]
  head=re.sub(r'<title>.*?</title>','<title>'+E(title)+'</title>',head,flags=re.S)
  head=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',lambda m:m[1]+E(words['description'],quote=True),head)
  head=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+E(title,quote=True),head)
  head=head.replace('https://mtelkinc-educationhub.netlify.app',base).replace('/contact/','/dealer-guides/'+record['id']+'/')
  head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
  crumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':t['home'],'item':base+prefix+'/'},{'@type':'ListItem','position':2,'name':t['business'],'item':base+prefix+'/dealers/us/'},{'@type':'ListItem','position':3,'name':words['title'],'item':absolute}]}
  s=head+'<script type="application/ld+json">'+json.dumps(crumbs,ensure_ascii=False).replace('<','\\u003c')+'</script>'+body
  s=re.sub(r'<script type="module" src="/(?:learn|dealer-share)\.js[^\"]*"></script>','',s)
  s=s.replace('<body id="top">','<body id="top" class="business-guide-body">')
  dest=root/path.strip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(assets(s))
 index=root/prefix.strip('/')/'resource-index.json';rows=json.loads(index.read_text());rows=[r for r in rows if not r['url'].startswith(prefix+'/dealer-guides/')]
 rows.extend({'url':route(prefix,r),'title':t[r['id']]['title'],'description':t[r['id']]['description'],'kind':'page','keywords':t['heading']+' '+t[r['id']]['title']} for r in records);index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
sitemap=root/'sitemap.xml';s=sitemap.read_text();s=re.sub(r'<url><loc>[^<]*/dealer-guides/[^<]+</loc></url>','',s);entries=''.join('<url><loc>'+base+route('' if lang=='en' else '/'+lang,r)+'</loc></url>' for lang in locales for r in records);sitemap.write_text(s.replace('</urlset>',entries+'</urlset>'))
print('Added two business guides to 12 sections and generated eight localized on-site reading pages.')
