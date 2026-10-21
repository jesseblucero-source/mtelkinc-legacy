# -*- coding: utf-8 -*-
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,urljoin
import re,html,json,hashlib
root=Path('.');dist=root/'dist';origin='https://mtelkinc-educationhub.netlify.app'
base=[p for p in dist.rglob('index.html') if p.relative_to(dist).parts[0] not in ['fr','es','de']]
routes={'/' if p.parent==dist else '/'+p.parent.relative_to(dist).as_posix()+'/' for p in base}
mapping=json.loads(Path('content/translations/de.json').read_text());all_maps={'de':mapping}
for code in ['fr','es']:all_maps[code]=json.loads(Path('content/source/translations/'+code+'.json').read_text())
source=Path('scripts/language-edition.py').read_text();code=source.replace("['en','fr','es']","['en','fr','es','de']").replace("for code in ['fr','es']","for code in ['fr','es','de']");exec(code)
labels={'en':'Language','fr':'Langue','es':'Idioma','de':'Sprache'};names={'en':'English','fr':'Français','es':'Español','de':'Deutsch'}
notes={'fr':'Traduction automatique. Les vidéos et documents originaux restent dans leur langue.','es':'Traducción automática. Los videos y documentos originales conservan su idioma.','de':'Automatische Übersetzung. Videos und Originaldokumente bleiben in ihrer Originalsprache.'}
def bar(lang,route):
 out='<div class="site-language-bar" role="navigation" aria-label="'+labels[lang]+'"><span>'+labels[lang]+'</span>'
 for l,name in names.items():out+=f'<a data-site-language="{l}" lang="{l}" href="'+('' if l=='en' else '/'+l)+route+'"'+(' aria-current="page"' if l==lang else '')+'>'+name+'</a>'
 if lang!='en':out+='<p>'+notes[lang]+'</p>'
 return out+'</div>'
records=json.loads(Path('content/source/archive-records.json').read_text());by_slug={r['slug']:r for r in records};by_pdf={r['pdf']:r for r in records if r['pdf']}
E=lambda s:html.escape(s,quote=True)
def summary(r,preview=None):
 attrs=' data-article-preview="'+preview+'" hidden' if preview else ' id="article-summary" tabindex="-1"'
 out='<aside class="article-language-summary"'+attrs+' lang="de" aria-label="Zusammenfassung auf Deutsch"><p class="mini-label">'+E({'newspaper':'Zeitungsartikel','article':'Artikel','book-review':'Buchrezension','event-profile':'Veranstaltungsbericht','video-review':'Videorezension','advertisement':'Historische Anzeige','correspondence':'Geschäftskorrespondenz','company-record':'Unternehmensdokument'}.get(r['type'],'Originalquelle'))+'</p><h2>Zusammenfassung auf Deutsch</h2><p>'+E(mapping[r['description']])+'</p><p>'+E(mapping.get(r['note'],r['note']))+'</p><p class="article-summary-source">Originalquelle: '+E(r['publication'])+'</p><p class="article-summary-verification">'+E(mapping.get(r['verification'],r['verification']))+'</p><p class="article-summary-note">Diese übersetzte Zusammenfassung basiert auf der erhaltenen Archivbeschreibung. Sie ersetzt keine vollständige Übersetzung des Originaldokuments. Das Original bleibt in seiner ursprünglichen Sprache erhalten.</p>'
 if not preview:out+='<a class="text-link" href="'+('/records/'+r['pdf'] if r['pdf'] else '#original-record')+'">Originaldokument ansehen →</a>'
 return out+'</aside>'
for p in base:
 route='/' if p.parent==dist else '/'+p.parent.relative_to(dist).as_posix()+'/'
 source=p.read_text();source=re.sub(r'<div class="site-language-bar".*?</div>','',source,flags=re.S);source=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',source)
 parser=Edition('de',mapping,route);parser.feed(source);page=''.join(parser.out)
 page=re.sub(r'<div class="canada-controls"[^>]*>.*?</div>',lambda m:'' if 'data-language=' in m[0] else m[0],page,flags=re.S)
 if route.startswith('/archive/') and route.strip('/').split('/')[-1] in by_slug:
  r=by_slug[route.strip('/').split('/')[-1]];page=page.replace('<section class="section record-detail">','<section class="section record-detail">'+summary(r),1).replace('<figure>','<figure id="original-record">',1)
 def adjacent(m):
  r=by_pdf.get(urlsplit(html.unescape(m[1])).path.rsplit('/',1)[-1]);return m[0]+(f' <a class="text-link article-summary-link" href="/de/archive/{r["slug"]}/#article-summary">Zusammenfassung auf Deutsch lesen →</a>' if r else '')
 if not route.startswith('/archive/'):page=re.sub(r'<a\b[^>]*href="([^"]+)"[^>]*>.*?</a>',adjacent,page,flags=re.S)
 if route=='/about/':page=page.replace('<div class="record-zoom-controls"',''.join(summary(by_slug[slug],key) for key,slug in [('cow','cow-call-draws-elk'),('show','more-exposition'),('founder','founder-record')])+'<div class="record-zoom-controls"',1)
 if 'article-language-summary' in page or 'article-summary-link' in page:page=page.replace('</head>','<link rel="stylesheet" href="/article-summaries.css"></head>')
 dest=dist/'de'/p.relative_to(dist);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(page)
for p in dist.rglob('index.html'):
 rel=p.relative_to(dist);lang=rel.parts[0] if rel.parts[0] in ['fr','es','de'] else 'en';route='/' if len(rel.parts)==1 or (lang!='en' and len(rel.parts)==2) else '/'+('/'.join(rel.parts[1:-1]) if lang!='en' else '/'.join(rel.parts[:-1]))+'/'
 s=p.read_text();s=re.sub(r'<div class="site-language-bar".*?</div>','',s,flags=re.S);s=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',s)
 s=re.sub(r'<header[^>]*>',lambda m:bar(lang,route)+m[0],s,count=1)
 s=s.replace('</head>',''.join(f'<link rel="alternate" hreflang="{l}" href="{origin}'+('' if l=='en' else '/'+l)+route+'">' for l in names)+'</head>')
 for name in ['script','page-transitions','site-language']:
  digest=hashlib.sha256((dist/(name+'.js')).read_bytes()).hexdigest()[:12];s=re.sub(r'src="/'+name+r'\.js(?:\?[^\"]*)?"',f'src="/{name}.js?v={digest}"',s)
 p.write_text(s)
rows=[]
for r in json.loads((dist/'resource-index.json').read_text()):
 row=dict(r);row['url']='/de'+r['url'];row['title']=mapping.get(r['title'],r['title']);row['description']=mapping.get(r['description'],r['description']);row['keywords']=r['keywords']+' '+row['title'].lower()+' '+row['description'].lower();rows.append(row)
(dist/'de/resource-index.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')))
dynamic='\n'.join(p.read_text() for p in dist.glob('*.js'))+'\n'+(dist/'resource-index.json').read_text();runtime={k:v for k,v in mapping.items() if k in dynamic or json.dumps(k,ensure_ascii=False)[1:-1] in dynamic}
(dist/'assets/translations-de.json').write_text(json.dumps(runtime,ensure_ascii=False,separators=(',',':')))
urls=sorted(routes|{'/'+lang+route for lang in ['fr','es','de'] for route in routes});(dist/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+url+'</loc></url>' for url in urls)+'</urlset>')
print('Built 110 German pages and four-language selectors, archive summaries, metadata, search index and sitemap.')
