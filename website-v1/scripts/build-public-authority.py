"""Deterministic public catalog/AI/SEO generation. No network, credentials or private data."""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit, quote
import json, re, hashlib, xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]; DIST=ROOT/'dist'
CONFIG=json.loads((ROOT/'content/public-authority.json').read_text())
ORIGIN=CONFIG['origin']; BRAND=CONFIG['organization']

def read(name): return json.loads((ROOT/name).read_text())
def write(name,text):
 p=DIST/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
def norm(text):
 return re.sub(r'(?:MT\s*)?E\.?\s*L\.?\s*K\.?,?\s*Inc\.?',BRAND,str(text),flags=re.I)
def product_path(p): return '/catalog/products/'+str(p['id'])+'/'
def link(url,label,cls=''): return '<a'+(' class="'+cls+'"' if cls else '')+' href="'+escape(url,quote=True)+'">'+escape(label)+'</a>'
def ld(data): return '<script type="application/ld+json" data-public-authority>'+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+'</script>'
def summary(text,limit=155):
 t=re.sub(r'\s+',' ',text).strip()
 return t if len(t)<=limit else t[:limit-1].rsplit(' ',1)[0]+'…'
def public_description(p):
 # Keep verbatim technical paragraphs; commercial instructions stay with the live merchant.
 parts=re.split(r'\n+',norm(p.get('description','')))
 safe=[]
 for part in parts:
  if not part.strip()or re.search(r'\$\s*\d|\b(?:shipping|refund|wholesale|warrant(?:y|ies)|restocking|payment terms)\b',part,re.I):continue
  # A published marketing claim is not verification of current IP status.
  sentences=re.split(r'(?<=[.!?])\s+',part.strip())
  text=' '.join(s for s in sentences if not re.search(r'\bpatent(?:ed|s|ing)?\b|\bregistered trademark',s,re.I)).replace('®','').replace('™','').strip()
  if text:safe.append(text)
 return safe

COPY={
 'en':{'catalog':'Product guide','intro':'Find your call. Know your equipment.','desc':'Browse published products, find model-specific lessons and replacement resources, then choose current options in our live store.','search':'Search products','category':'Category','all':'All categories','apply':'Apply filters','reset':'Clear filters','empty':'No products match. Clear the filters or try another name.','count':'products shown','details':'Product details','buy':'Choose options in the store','original':'Product descriptions are in their original English.','back':'Back to all products','care':'Lessons and call care','related':'Related products','policy':'Shipping, payment and returns','support':'Ask about this product'},
 'fr':{'catalog':'Guide des produits','intro':'Trouvez votre appeau. Découvrez votre équipement.','desc':'Parcourez les produits publiés et les ressources par modèle, puis choisissez les options actuelles dans notre boutique.','search':'Rechercher des produits','category':'Catégorie','all':'Toutes les catégories','apply':'Appliquer les filtres','reset':'Effacer les filtres','empty':'Aucun produit ne correspond. Effacez les filtres ou recherchez un autre nom.','count':'produits affichés','details':'Détails du produit','buy':'Choisir les options en boutique','original':'Les descriptions des produits sont en anglais original.','back':'Tous les produits','care':'Formation et entretien','related':'Produits associés','policy':'Livraison, paiement et retours','support':'Poser une question'},
 'es':{'catalog':'Guía de productos','intro':'Encuentre su reclamo. Conozca su equipo.','desc':'Explore los productos publicados y los recursos por modelo. Después, elija las opciones actuales en nuestra tienda.','search':'Buscar productos','category':'Categoría','all':'Todas las categorías','apply':'Aplicar filtros','reset':'Borrar filtros','empty':'No hay productos que coincidan. Borre los filtros o pruebe otro nombre.','count':'productos mostrados','details':'Detalles del producto','buy':'Elegir opciones en la tienda','original':'Las descripciones de los productos conservan el inglés original.','back':'Todos los productos','care':'Formación y mantenimiento','related':'Productos relacionados','policy':'Envíos, pagos y devoluciones','support':'Consultar sobre este producto'},
 'de':{'catalog':'Produktübersicht','intro':'Finden Sie Ihren Wildlocker. Lernen Sie Ihre Ausrüstung kennen.','desc':'Entdecken Sie veröffentlichte Produkte und passende Lernangebote. Wählen Sie aktuelle Optionen anschließend in unserem Shop.','search':'Produkte suchen','category':'Kategorie','all':'Alle Kategorien','apply':'Filter anwenden','reset':'Filter zurücksetzen','empty':'Keine passenden Produkte. Setzen Sie die Filter zurück oder suchen Sie nach einem anderen Namen.','count':'angezeigte Produkte','details':'Produktdetails','buy':'Optionen im Shop wählen','original':'Die Produktbeschreibungen bleiben im englischen Original.','back':'Alle Produkte','care':'Lernen und Pflege','related':'Verwandte Produkte','policy':'Versand, Zahlung und Rückgabe','support':'Frage zum Produkt'},
}
CATS={
 'en':['Elk','Mule deer','Whitetail','Antelope','Predator','Bands and reeds','DVDs','Calls','Blinds','Books'],
 'fr':['Wapiti','Cerf mulet','Cerf de Virginie','Antilope','Prédateurs','Élastiques et anches','DVD','Appeaux','Affûts','Livres'],
 'es':['Uapití','Ciervo mulo','Venado de cola blanca','Antílope','Depredadores','Bandas y lengüetas','DVD','Reclamos','Escondites','Libros'],
 'de':['Wapiti','Maultierhirsch','Weißwedelhirsch','Antilope','Raubwild','Bänder und Zungen','DVDs','Wildlocker','Tarnung','Bücher'],
}

def build():
 source=read('content/source/store-products.json');products=sorted(source['products'],key=lambda p:p['id']);categories=read('content/store-categories.json')
 assert source['store_id']==117609763 and len({p['id'] for p in products})==len(products)
 assert source.get('captured_on') and all(p.get('description') is not None for p in products),'Refresh the public catalog first.'
 ids={p['id'] for p in products}; byid={p['id']:p for p in products}
 calls={r['id']:r for r in read('content/source/calls.json')};lessons={r['slug']:r for r in read('content/university-lessons.json')}
 suggestions=read('content/store-suggestions.json'); records=[]
 for p in products:
  assert urlsplit(p['source_url']).netloc=='www.mtelkinc.com' and p['source_url'].endswith('/p/'+str(p['id']))
  assert set(p['categories'])<=set(c['slug'] for c in categories)
  paragraphs=public_description(p);call=calls.get(CONFIG['call_models'].get(str(p['id'])),{})
  lesson_ids=[i for i in call.get('lesson_ids',[]) if i in lessons]
  replacements=CONFIG['verified_replacements'].get(str(p['id']),[])
  assert set(replacements)<=ids
  records.append({'product_id':p['id'],'name':norm(p['name']),'brand':norm(p['brand'])if p.get('brand')else None,'sku':p.get('sku'),'gtin':p.get('gtin'),
   'categories':p['categories'],'description':'\n\n'.join(paragraphs),'materials':None,'technical_specifications':p.get('specifications'),
   'intended_application':None,'images':p.get('images',[]),'instructional_lessons':['/education/lessons/'+i+'/' for i in lesson_ids],
   'product_video_ids':p.get('video_ids',[]),'compatible_replacements':[ORIGIN+product_path(byid[i]) for i in replacements],
   'suggested_products':[ORIGIN+product_path(byid[i]) for i in suggestions.get('pairings',{}).get(str(p['id']),[]) if i in ids and i not in suggestions.get('excluded_products',[])],
   'retail_price':None,'availability':None,'product_status':'superseded per published product name' if str(p['id']) in CONFIG['superseded'] else p['status'],
   'canonical_url':ORIGIN+product_path(p),'live_store_url':p['source_url'],'last_verified':source['captured_on'],
   'fact_source':'Existing public Ecwid storefront','source_url':p['legacy_source_url']})
 graph={'organization':BRAND,'canonical_origin':ORIGIN,'catalog_source':'Ecwid store 117609763','last_verified':source['captured_on'],
  'volatile_facts':'Prices, availability and options are intentionally not copied. Open the live storefront.','products':records}
 write('catalog/products.json',json.dumps(graph,ensure_ascii=False,indent=2)+'\n')
 # Reuse the existing branded shell and controllers, keeping persistent music/navigation.
 template=(DIST/'shop/index.html').read_text();head=template.split('</head>')[0]+'</head>';body=template.split('<body>',1)[1];before=body.split('<main',1)[0];after=body.split('</main>',1)[1]
 after=re.sub(r'<script[^>]*src="/store\.js[^>]*></script>','',after)
 after=re.sub(r'<script[^>]*src="/dealer-application\.js[^>]*></script>','',after)
 generated=[]
 def page(path,title,description,main,lang='en',equivalent=False,schema=None):
  crumb_html=re.search(r'<nav class="catalog-crumbs"[^>]*>(.*?)</nav>',main)
  if crumb_html:
   crumbs=re.findall(r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>',crumb_html[1])
   breadcrumb={'@type':'BreadcrumbList','@id':ORIGIN+path+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':i+1,'name':unescape(label),'item':ORIGIN+unescape(url)}for i,(url,label) in enumerate(crumbs)]}
   schema={'@context':'https://schema.org','@graph':([schema]if schema else[])+[breadcrumb]}
  h=head;h=re.sub(r'<html lang="[^"]+"','<html lang="'+lang+'"',h)
  h=re.sub(r'<title>.*?</title>','<title>'+escape(title+' | '+BRAND)+'</title>',h)
  h=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+escape(description,quote=True)+'">',h)
  h=re.sub(r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+ORIGIN+path+'">',h)
  h=re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]*">','',h)
  h=re.sub(r'<meta property="og:(?:title|description|url)" content="[^"]*">','',h)
  h=re.sub(r'<link rel="stylesheet" href="/catalog.css">','',h)
  h=re.sub(r'<script[^>]*data-public-authority[^>]*>.*?</script>','',h,flags=re.S)
  pre='' if lang=='en' else '/'+lang
  if equivalent:
   for code in COPY:
    basepath=path[len(pre):] if pre else path
    h=h.replace('</head>','<link rel="alternate" hreflang="'+code+'" href="'+ORIGIN+('' if code=='en' else '/'+code)+basepath+'"></head>')
  h=h.replace('</head>','<meta property="og:title" content="'+escape(title,quote=True)+'"><meta property="og:description" content="'+escape(description,quote=True)+'"><meta property="og:url" content="'+ORIGIN+path+'"><link rel="stylesheet" href="/catalog.css">'+(ld(schema)if schema else '')+'</head>')
  # Localized shell is already maintained by the established storefront builder.
  shell=(DIST/((lang+'/'if lang!='en' else '')+'shop/index.html')).read_text()
  b=shell.split('<body>',1)[1].split('<main',1)[0]
  b=re.sub(r'(data-site-language="(en|fr|es|de)"[^>]*href=")[^"]+"',lambda m:m[1]+(''if m[2]=='en'else'/'+m[2])+'/catalog/"',b)
  tail=shell.split('</main>',1)[1];tail=re.sub(r'<script[^>]*src="/store\.js[^>]*></script>','',tail)
  # No new entry executes store scripts on an information page.
  html=h+'<body>'+b+'<main id="main" class="catalog-page">'+main+'</main>'+tail
  html=html.replace('</body>','<script type="module" src="/catalog.js"></script></body>')
  write(path.strip('/')+'/index.html',html);generated.append(path)
 def crumb(entries): return '<nav class="catalog-crumbs" aria-label="Breadcrumb">'+ ' / '.join(link(url,title)for url,title in entries)+'</nav>'
 def image(p,lazy=True):
  if not p.get('image'):return ''
  meta=(p.get('images')or[{}])[0];src=meta.get('thumbnail')or p['image']
  return '<img src="'+escape(src,quote=True)+'" width="'+str(meta.get('width')or 800)+'" height="'+str(meta.get('height')or 800)+'" loading="'+('lazy'if lazy else'eager')+'" decoding="async" alt="'+escape(norm(p['name']),quote=True)+'">'
 def card(p,c):
  return '<article class="catalog-card" data-catalog-product data-categories="'+escape(' '.join(p['categories']))+'" data-name="'+escape(norm(p['name']).casefold(),quote=True)+'"><a class="catalog-image" href="'+product_path(p)+'">'+image(p)+'</a><div><h2>'+link(product_path(p),norm(p['name']))+'</h2><p>'+escape(summary(' '.join(public_description(p)),130))+'</p>'+link(product_path(p),c['details'])+'</div></article>'
 for lang,c in COPY.items():
  prefix=''if lang=='en'else'/'+lang
  for category in [None]+categories:
   slug=category['slug']if category else None;path=prefix+'/catalog/'+('categories/'+slug+'/'if slug else'')
   title=CATS[lang][categories.index(category)]if category else c['catalog']
   selected=[p for p in products if not slug or slug in p['categories']]
   options='<option value="">'+c['all']+'</option>'+''.join('<option value="'+cat['slug']+'"'+(' selected'if cat['slug']==slug else'')+'>'+CATS[lang][i]+'</option>' for i,cat in enumerate(categories))
   form='<form class="catalog-filters" data-catalog-filters data-base-category="'+(slug or'')+'" data-empty="'+escape(c['empty'],quote=True)+'" data-count="'+c['count']+'"><label>'+c['search']+'<input name="q" type="search" maxlength="100" autocomplete="off"></label><label>'+c['category']+'<select name="category">'+options+'</select></label><button type="submit">'+c['apply']+'</button>'+link(prefix+'/catalog/',c['reset'])+'</form>'
   cards=''.join(card(p,c).replace('data-catalog-product','data-catalog-product'+(' hidden'if slug and slug not in p['categories']else''),1)for p in products)
   category_nav='<nav aria-label="'+c['category']+'" class="catalog-category-nav">'+''.join(link(prefix+'/catalog/categories/'+cat['slug']+'/',CATS[lang][i])for i,cat in enumerate(categories))+'</nav>'
   content=crumb([(prefix+'/',BRAND),(prefix+'/shop/','Shop'),(prefix+'/catalog/',c['catalog'])])+'<section class="catalog-intro"><p class="eyebrow">'+BRAND+'</p><h1>'+escape(title if category else c['intro'])+'</h1><p>'+c['desc']+'</p><p>'+c['original']+'</p>'+link(prefix+'/shop/'+('?category='+slug if slug else''),c['buy'],'button')+'</section>'+category_nav+form+'<p role="status" aria-live="polite" data-catalog-status>'+str(len(selected))+' '+c['count']+'</p><div class="catalog-grid">'+cards+'</div><p data-catalog-empty hidden>'+c['empty']+'</p><noscript><p>'+link(prefix+'/catalog/',c['back'])+'</p></noscript>'
   il={'@context':'https://schema.org','@type':'ItemList','name':title,'itemListElement':[{'@type':'ListItem','position':i+1,'url':ORIGIN+product_path(p),'name':norm(p['name'])}for i,p in enumerate(selected)]}
   page(path,title,c['desc'],content,lang,True,il)
 for p,r in zip(products,records):
  path=product_path(p);paragraphs=public_description(p)
  content=crumb([('/',BRAND),('/catalog/','Product guide'),(path,norm(p['name']))])+'<section class="catalog-product"><div class="catalog-product-image">'+image(p,False)+'</div><div><p class="eyebrow">'+BRAND+' / PRODUCT GUIDE</p><h1>'+escape(norm(p['name']))+'</h1>'
  if p.get('sku'):content+='<p>SKU: '+escape(str(p['sku']))+'</p>'
  buy=urlsplit(p['source_url']);buy_path=buy.path+('#'+buy.fragment if buy.fragment else'')
  content+='<p>Product information checked '+source['captured_on']+'. Current options, pricing and stock are provided by our live store.</p>'+link(buy_path,'Choose options and buy','button')+link('/support/','Ask about this product','catalog-support')+'</div></section>'
  if str(p['id'])in CONFIG['superseded']:
   dest=byid[CONFIG['superseded'][str(p['id'])]];content+='<aside class="catalog-notice">The published product name directs customers to '+link(product_path(dest),norm(dest['name']))+'. Confirm the correct replacement with our team before ordering.</aside>'
  content+='<section class="catalog-copy"><h2>Product information</h2>'+(''.join('<p>'+escape(t)+'</p>'for t in paragraphs)if paragraphs else'<p>Ask our team for product details before ordering.</p>')+'</section>'
  lesson_links=r['instructional_lessons']
  if lesson_links:
   content+='<section class="catalog-copy"><h2>Watch and learn</h2><ul>'+''.join('<li>'+link(url,lessons[url.strip('/').split('/')[-1]]['title'])+'</li>'for url in lesson_links)+'</ul><p>Videos play in the on-site lesson player. Match the model shown to your equipment.</p></section>'
  else:content+='<section class="catalog-copy"><h2>Keep learning</h2>'+link('/education/','Explore calling education')+' · '+link('/university/','Explore guided training')+'</section>'
  if r['compatible_replacements']:
   content+='<section class="catalog-copy"><h2>Replacement resources</h2><ul>'+''.join('<li>'+link(url,norm(byid[int(url.strip('/').split('/')[-1])]['name']))+'</li>'for url in r['compatible_replacements'])+'</ul>'+link('/banding/','Band and reed replacement lessons')+'</section>'
  related=r['suggested_products']
  if related:content+='<section class="catalog-copy"><h2>Related products</h2><p>Editorial suggestions from the published catalog. These are not purchase-history or popularity claims.</p><ul>'+''.join('<li>'+link(url,norm(byid[int(url.strip('/').split('/')[-1])]['name']))+'</li>'for url in related)+'</ul></section>'
  content+='<section class="catalog-copy"><h2>Before you order</h2><p>Review the published policies and confirm any order-specific or international arrangements with our team.</p>'+link('/disclosures/','Shipping, payment and returns')+' · '+link('/dealer-application/','Dealer or distributor inquiry')+'</section>'+link('/catalog/','Back to all products')
  product={'@context':'https://schema.org','@type':'Product','@id':ORIGIN+path+'#product','name':r['name'],'description':r['description'],'url':ORIGIN+path,'category':[categories[[c['slug']for c in categories].index(cat)]['name']for cat in p['categories']],'image':[i['url']for i in p.get('images',[])]}
  if r['brand']:product['brand']={'@id':ORIGIN+'/#organization'}if r['brand']==BRAND else{'@type':'Brand','name':r['brand']}
  if p.get('sku'):product['sku']=p['sku']
  if p.get('gtin'):product['gtin']=p['gtin']
  if lesson_links:product['subjectOf']=[{'@type':'WebPage','url':ORIGIN+u}for u in lesson_links]
  page(path,r['name'],summary(r['description']or(r['name']+' product information, training and support from '+BRAND+'.')),content,schema=product)
 import runpy
 comparison=runpy.run_path(str(ROOT/'scripts/build-catalog-comparison.py'))['extend_catalog'](ROOT,DIST,records,categories,CATS,page,crumb,link)
 # New branded sections use existing motion/pause controls, with no continuous phone animation.
 write('catalog.css',CSS+'\n'+(ROOT/'templates/catalog-comparison.css').read_text())
 write('catalog.js',(ROOT/'templates/catalog-navigation.js').read_text())
 for p in DIST.rglob('index.html'):
  html=p.read_text();head,sep,body=html.partition('</head>')
  if not sep:continue
  head=re.sub(r'<script[^>]*data-site-authority[^>]*>.*?</script>','',head,flags=re.S)
  head=re.sub(r'<link rel="describedby" href="/llms.txt" type="text/plain">','',head)
  rel='/'+p.parent.relative_to(DIST).as_posix().strip('.')
  rel='/'if rel=='/'else rel.rstrip('/')+'/'
  canonical=ORIGIN+rel
  head=re.sub(r'<link rel="canonical"[^>]*>','',head)
  head+='<link rel="canonical" href="'+canonical+'">'
  common={'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':ORIGIN+'/#organization','name':BRAND,'url':ORIGIN+'/','logo':ORIGIN+'/assets/mark.png','address':{'@type':'PostalAddress','addressLocality':'Livingston','addressRegion':'MT','addressCountry':'US'}},{'@type':'WebSite','@id':ORIGIN+'/#website','url':ORIGIN+'/','name':BRAND,'publisher':{'@id':ORIGIN+'/#organization'}},{'@type':'WebPage','@id':canonical+'#webpage','url':canonical,'isPartOf':{'@id':ORIGIN+'/#website'},'publisher':{'@id':ORIGIN+'/#organization'},'inLanguage':re.search(r'<html lang="([^"]+)',head)[1]}]}
  head+=ld(common).replace('data-public-authority','data-site-authority')+'<link rel="describedby" href="/llms.txt" type="text/plain">'
  # Existing navigation and shop stay in place; add a discovery link to their footer.
  if '<footer' in body:
   body=re.sub(r'<!-- public-catalog-link -->.*?<!-- /public-catalog-link -->','',body,flags=re.S)
   lang=re.search(r'<html lang="([^"]+)',head)[1];pre=''if lang=='en'else'/'+lang
   body=body.replace('</footer>','<!-- public-catalog-link --><p class="catalog-footer-link">'+link(pre+'/catalog/',COPY.get(lang,COPY['en'])['catalog'])+'</p><!-- /public-catalog-link --></footer>')
  # Share technical facts without repeating the old private launch threshold.
  if '/canada/' in rel:
   body=body.replace('CANADA / PRIVATE LAUNCH PLANNING','CANADA / DISTRIBUTION INQUIRIES')
   body=re.sub(r' The earlier launch draft proposed a US\$5,000 opening threshold; it is a proposal awaiting approval, not a current offer\.',' Confirm current requirements directly with our team.',body)
   body=body.replace('The earlier US$5,000 opening threshold remains unapproved.','Opening order requirements must be confirmed in writing.')
   for old,new in {
    'CANADA / PLANIFICATION DE LA LANCEMENT PRIVÉ':'CANADA / DEMANDES DE DISTRIBUTION',
    'KANADA / PRIVATE LAUNCH PLANUNG':'KANADA / VERTRIEBSANFRAGEN',
    "L'ébauche de lancement précédente proposait un seuil d'ouverture de 5 000 $US; il s'agit d'une proposition en attente d'approbation et non d'une offre actuelle.":'Confirmez les conditions actuelles directement avec notre équipe.',
    "Le premier seuil d'ouverture de 5 000 dollars des États-Unis n'est toujours pas approuvé.":'Les conditions de commande doivent être confirmées par écrit.',
    'El proyecto de lanzamiento anterior propuso un umbral de apertura de US$5,000; es una propuesta pendiente de aprobación, no una oferta actual.':'Confirme las condiciones actuales directamente con nuestro equipo.',
    'Der frühere Entwurf der Markteinführung schlug eine Eröffnungsschwelle von 5.000 US-Dollar vor; es handelt sich um einen Vorschlag, der noch nicht genehmigt wurde, nicht um ein aktuelles Angebot.':'Bestätigen Sie die aktuellen Bedingungen direkt mit unserem Team.',
    'El umbral de apertura anterior de 5.000 dólares sigue sin aprobarse.':'Las condiciones del pedido deben confirmarse por escrito.',
    'Die frühere Öffnungsschwelle von 5.000 US-Dollar bleibt nicht genehmigt.':'Bestellbedingungen müssen schriftlich bestätigt werden.',
   }.items():body=body.replace(old,new)
  p.write_text(head+sep+body)
 router=DIST/'page-transitions.js';text=router.read_text();text=text.replace("'university-training']);","'university-training','catalog']);");router.write_text(text)
 for lang,c in COPY.items():
  pre=''if lang=='en'else'/'+lang;p=DIST/((lang+'/'if lang!='en'else'')+'shop/index.html');html=p.read_text()
  html=re.sub(r'<!-- catalog-store-entry -->.*?<!-- /catalog-store-entry -->','',html,flags=re.S)
  entry='<!-- catalog-store-entry --><section class="catalog-store-entry"><h2>'+c['catalog']+'</h2><p>'+c['desc']+'</p>'+link(pre+'/catalog/',c['catalog'],'button')+'</section><!-- /catalog-store-entry -->'
  html=html.replace('</main>',entry+'</main>');html=html.replace('</head>','<link rel="stylesheet" href="/catalog.css"></head>')if'/catalog.css'not in html else html;p.write_text(html)
 build_llms(records,categories,source)
 build_sitemap()
 for lang in COPY:
  pre=''if lang=='en'else'/'+lang;index=DIST/((lang+'/'if lang!='en'else'')+'resource-index.json');rows=json.loads(index.read_text())
  rows=[row for row in rows if not row['url'].startswith(pre+'/catalog/')]
  for path in generated:
   if lang=='en'and path.startswith('/catalog/')or lang!='en'and path.startswith(pre+'/catalog/'):
    html=(DIST/path.strip('/')/'index.html').read_text();title=unescape(re.search(r'<title>(.*?)</title>',html)[1]).split(' | ')[0];desc=unescape(re.search(r'<meta name="description" content="([^"]*)"',html)[1])
    rows.append({'url':path,'title':title,'description':desc,'kind':'product'if'/products/'in path else'page','keywords':'catalog '+title})
  index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
 write('robots.txt','# '+BRAND+' public crawler policy. Robots is not access control.\nUser-agent: *\nAllow: /\nDisallow: /dealer-application/received/\nDisallow: /fr/dealer-application/received/\nDisallow: /es/dealer-application/received/\nDisallow: /de/dealer-application/received/\nDisallow: /account/\nDisallow: /checkout/\nDisallow: /cart/\n\n'+''.join('User-agent: '+bot+'\nDisallow: /\n\n'for bot in CONFIG['training_crawlers'])+'Sitemap: '+ORIGIN+'/sitemap.xml\n')
 headers=DIST/'_headers';s=headers.read_text();s=re.sub(r'# BEGIN public authority.*?# END public authority\n?','',s,flags=re.S)
 s=s.rstrip()+'\n\n# BEGIN public authority\n/*\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: base-uri \'self\'; object-src \'none\'\n  Permissions-Policy: camera=(), microphone=()\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n/llms-full.txt\n  Content-Type: text/plain; charset=utf-8\n/catalog/products.json\n  Content-Type: application/json; charset=utf-8\n# END public authority\n';headers.write_text(s)
 report={'comparison':comparison,'generated_catalog_pages':len(generated),'published_product_records':len(records),'categories':len(categories),'languages':list(COPY),'catalog_verified':source['captured_on'],'static_offer_count':0,'private_data_exported':False,'merchant_changes':False,'source_sha256':hashlib.sha256((ROOT/'content/source/store-products.json').read_bytes()).hexdigest()}
 (ROOT/'reports/public-authority-build.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

def build_llms(records,categories,source):
 nav=[('Compare products','/catalog/compare/','Compare up to three source-backed product guides and share the selection; live prices and checkout stay in the store.'),('About','/about/','Company account and source-linked history.'),('Legacy','/legacy/','Preserved historical records; distinguish dated records from company accounts.'),('Archive','/archive/','Source scans and original document previews.'),('Education','/education/','Search model-specific demonstrations and care lessons.'),('University','/university/','Guided training using existing verified lessons; progress saved in this browser.'),('Videos','/videos/','Embedded on-site video library.'),('Call care','/banding/','Model-specific band and reed replacement resources.'),('Support','/support/','Product and customer support.'),('Contact','/contact/','Published phone and email contact options.'),('Dealer applications','/dealer-application/','Dealer/distributor qualification inquiry, subject to review; no automatic approval.'),('U.S. dealers','/dealers/us/','Application process and retailer resources; not an authorized dealer directory.'),('Canada','/canada/','Regional distributor inquiries; Western pilot planning, not confirmed national distribution.'),('International','/international/','Research and legacy chapters; not a list of confirmed shipping markets.'),('Policies','/disclosures/','Current policy pages; confirm order-specific and wholesale terms directly.')]
 short=['# '+BRAND,'','> Hunting call manufacturer based in Livingston, Montana, with product education, call care and dealer/distributor inquiries.','','Public product identity checked '+source['captured_on']+'. Prices, stock, options and checkout remain in the existing Ecwid store. Original videos and documents retain their original language. Company accounts place the origin in 1985; dated newspaper records begin in 1986. Do not treat the origin date as independently verified incorporation evidence.','','## Company, learning and support']
 short +=['- ['+name+']('+ORIGIN+path+'): '+desc for name,path,desc in nav]
 short+=['','## Product categories']+['- ['+c['name']+']('+ORIGIN+'/catalog/categories/'+c['slug']+'/): Published category in the existing merchant catalog.'for c in categories]
 short+=['','## Products']+['- ['+r['name']+']('+r['canonical_url']+'): '+', '.join(r['categories'])+'.'for r in records]
 short+=['','## Optional','- [Complete public knowledge]('+ORIGIN+'/llms-full.txt): Public company, product and support details.','- [Structured public product records]('+ORIGIN+'/catalog/products.json): Verified facts and relationships; no customer or private dealer records.','- [Sitemap]('+ORIGIN+'/sitemap.xml): Canonical public pages.','']
 write('llms.txt','\n'.join(short))
 full=['# '+BRAND+' — Public knowledge','','> Public company and product reference generated from approved public website records and the existing Ecwid storefront.','','## Scope and verification','Catalog last checked: '+source['captured_on']+'. This is a public information guide, not live inventory, a binding offer, legal advice or a private dealer agreement. Unknown specifications remain unasserted. No reviews, ratings, sales-history claims, partner approvals or shipping eligibility are inferred.','','## Company and history','MT E.L.K., INC. is a hunting call manufacturer based in Livingston, Montana. The company account dates its origin to 1985; dated primary newspaper coverage is preserved from 1986. Consult the About, Legacy and Archive pages for source distinctions, people and original scans.','','## Education and product care','Education, Videos, University and Banding provide on-site embedded media. Follow model-specific verified demonstrations; a band-replacement lesson is not a reed-replacement lesson. University review checkboxes are local browser progress, not accounts, exams, qualifications or certifications. Videos retain their original spoken language. Do not infer instructions from video titles.','','## Support, policies and wholesale','Use the published contact and support pages for help. Read the current disclosure pages for retail policies. Carrier, return, freight, wholesale and international terms require confirmation for the specific transaction. Published dealer prospectus terms and retail policy wording need owner reconciliation; no new commercial terms are synthesized here. Dealer/distributor applications request review; submission is not approval, exclusivity or an account. There is no published verified dealer directory or authenticated wholesale portal in this release.','','## International and languages','English, French, Spanish and German website resources exist. Product descriptions and original source documents retain their original English where no reviewed translation exists. Canada is a regional distributor inquiry and pilot-planning path. International chapters describe research or legacy context, not confirmed shipping, currency, customs clearance or distributor appointments.','','## Public navigation']
 full+=['- ['+name+']('+ORIGIN+path+'): '+desc for name,path,desc in nav]
 full+=['','## Product catalog']
 for r in records:
  full+=['','### '+r['name'],'- Product ID: '+str(r['product_id']),'- Product guide: '+r['canonical_url'],'- Live options, price and stock: '+r['live_store_url'],'- Categories: '+', '.join(r['categories']),'- Last checked: '+r['last_verified']]
  if r['sku']:full+=['- SKU: '+r['sku']]
  if r['gtin']:full+=['- GTIN: '+str(r['gtin'])]
  full+=['',r['description']or'Ask the company for verified specifications before ordering.']
  if r['compatible_replacements']:full+=['','Verified replacement resources:']+['- '+u for u in r['compatible_replacements']]
  if r['instructional_lessons']:full+=['','On-site lessons:']+['- '+ORIGIN+u for u in r['instructional_lessons']]
 full+=['','## Public questions','Where do I buy? Use the live store linked from each product guide.','How do I identify a replacement? Match the exact model and replacement lesson, or contact support.','Does submitting an application approve my account? No. The team reviews it and confirms next steps.','Are all countries in the international section served? No. Confirm current availability and terms with the team.','Are videos translated automatically? No. Original spoken language is retained.','']
 write('llms-full.txt','\n'.join(full))

def build_sitemap():
 ns='http://www.sitemaps.org/schemas/sitemap/0.9';xh='http://www.w3.org/1999/xhtml';ET.register_namespace('',ns);ET.register_namespace('xhtml',xh);root=ET.Element('{'+ns+'}urlset')
 for page in sorted(DIST.rglob('index.html')):
  html=page.read_text()
  if re.search(r'<meta[^>]+(?:name="robots"[^>]+content="[^"]*noindex|content="[^"]*noindex[^>]+name="robots")',html):continue
  canonical=re.search(r'<link rel="canonical" href="([^"]+)"',html)
  if not canonical:raise ValueError('Missing canonical: '+str(page))
  url=ET.SubElement(root,'{'+ns+'}url');ET.SubElement(url,'{'+ns+'}loc').text=unescape(canonical[1])
  for lang,href in re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"',html):
   dest=DIST/(urlsplit(href).path.strip('/')+'/index.html' if urlsplit(href).path.strip('/')else'index.html')
   if dest.exists():ET.SubElement(url,'{'+xh+'}link',{'rel':'alternate','hreflang':lang,'href':href})
 write('sitemap.xml',ET.tostring(root,encoding='unicode',xml_declaration=True)+'\n')

CSS='''
.catalog-category-nav{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem}.catalog-category-nav a{display:flex;align-items:center;min-height:44px;padding:.5rem .8rem;border:1px solid #c5afa7;background:#faf6f3}
.catalog-page{max-width:1280px;margin:auto;padding:clamp(20px,5vw,70px);color:#0d1311}.catalog-crumbs{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.95rem;margin-bottom:2rem}.catalog-intro{max-width:800px;margin:1rem 0 2.5rem}.catalog-intro h1,.catalog-product h1{font-size:clamp(2rem,5vw,3.7rem);line-height:1.12}.catalog-page a:not(.button){color:#8b271e}.catalog-page a:focus-visible,.catalog-page button:focus-visible,.catalog-page input:focus-visible,.catalog-page select:focus-visible{outline:3px solid #8b271e;outline-offset:4px}.catalog-filters{display:flex;gap:1rem;align-items:end;flex-wrap:wrap;padding:1.4rem;background:#faf6f3;border:1px solid #c5afa7}.catalog-filters label{display:grid;gap:.4rem;flex:1;min-width:180px;font-weight:700}.catalog-filters input,.catalog-filters select,.catalog-filters button{font:inherit;min-height:48px;padding:.7rem;border:1px solid #8b7168;background:#fff;color:#0d1311}.catalog-filters button{background:#ef431f;border-color:#ef431f;font-weight:700;cursor:pointer}.catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5rem;margin:1.5rem 0}.catalog-card{background:#faf6f3;border:1px solid #c5afa7;min-width:0}.catalog-card[hidden]{display:none}.catalog-card>div{padding:1.2rem}.catalog-card h2{font-size:1.3rem;line-height:1.3;margin:0 0 1rem}.catalog-image{display:block;aspect-ratio:4/3;background:#fff;padding:1rem}.catalog-image img{width:100%;height:100%;object-fit:contain}.catalog-product{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center}.catalog-product-image{background:#fff;padding:1.5rem}.catalog-product-image img{width:100%;height:auto;max-height:620px;object-fit:contain}.catalog-support{display:block;margin:1.2rem 0}.catalog-copy{margin:3rem 0;max-width:850px}.catalog-copy p{white-space:pre-line}.catalog-copy li{margin:.8rem 0}.catalog-notice{margin:2rem 0;padding:1.2rem;background:#faf6f3;border-left:4px solid #8b271e}.catalog-store-entry{padding:2rem max(24px,5vw);background:#e6d9d3;color:#0d1311}.catalog-footer-link{padding:1rem 0}.catalog-page .button{color:#0d1311!important}.catalog-page [data-catalog-empty]{padding:2rem;background:#faf6f3}@media(max-width:800px){.catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.catalog-product{grid-template-columns:1fr}.catalog-product-image{max-width:550px}.catalog-crumbs{margin-top:1rem}}@media(max-width:480px){.catalog-grid{grid-template-columns:1fr}.catalog-filters{display:grid}.catalog-filters label{min-width:0}.catalog-page{padding:24px 20px 48px}.catalog-card h2{font-size:1.3rem}}@media(prefers-reduced-motion:reduce){.catalog-page *{scroll-behavior:auto!important;animation:none!important}}
'''
if __name__=='__main__':build()
