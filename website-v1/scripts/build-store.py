# -*- coding: utf-8 -*-
from pathlib import Path
import re,hashlib,json
from urllib.parse import quote
root=Path('dist');origin='https://mtelkinc-educationhub.netlify.app'
motion=json.loads(Path('content/store-motion.json').read_text())['locales']
store_js=root/'store.js';js=store_js.read_text();js=re.sub(r"from '\./store-motion\.js(?:\?[^']*)?'","from './store-motion.js?v="+hashlib.sha256((root/'store-motion.js').read_bytes()).hexdigest()[:12]+"'",js);store_js.write_text(js)
texts={
'en':{'title':'Shop the calls. Keep learning.','intro':'Explore the complete MT E.L.K., INC. product catalog, choose your options, and check out here. Browse calls, replacement bands and reeds, books, DVDs, and blinds.','shop':'Shop','category':'Browse categories','all':'All products','cart':'Cart & checkout','account':'My account','help':'Need help choosing?','note':'Use our calling lessons and model-specific care resources, or contact our team.','support':'Get product support','learn':'Explore education','policy':'Shipping & payment policy','returns':'Returns policy','loading':'Loading the store…','retry':'Retry store','description':'Shop the complete MT E.L.K., INC. catalog with live product options, pricing, cart and checkout.'},
'fr':{'title':'Choisissez votre appeau. Continuez à apprendre.','intro':'Découvrez le catalogue complet de MT E.L.K., INC., choisissez vos options et passez commande ici. Appeaux, élastiques et anches de remplacement, livres, DVD et affûts.','shop':'Boutique','category':'Catégories','all':'Tous les produits','cart':'Panier et paiement','account':'Mon compte','help':'Besoin d’aide pour choisir ?','note':'Consultez nos leçons et conseils d’entretien par modèle, ou contactez notre équipe.','support':'Obtenir de l’aide','learn':'Explorer les leçons','policy':'Livraison et paiement','returns':'Retours','loading':'Chargement de la boutique…','retry':'Réessayer','description':'Découvrez le catalogue MT E.L.K., INC. avec options, prix, panier et paiement intégrés.'},
'es':{'title':'Elija su reclamo. Siga aprendiendo.','intro':'Explore el catálogo completo de MT E.L.K., INC., elija sus opciones y complete su compra aquí. Reclamos, bandas y lengüetas de repuesto, libros, DVD y puestos de caza.','shop':'Tienda','category':'Categorías','all':'Todos los productos','cart':'Carrito y pago','account':'Mi cuenta','help':'¿Necesita ayuda para elegir?','note':'Consulte nuestras lecciones y cuidados por modelo, o contacte con nuestro equipo.','support':'Ayuda con productos','learn':'Explorar lecciones','policy':'Envíos y pagos','returns':'Devoluciones','loading':'Cargando la tienda…','retry':'Reintentar','description':'Explore el catálogo MT E.L.K., INC. con opciones, precios, carrito y pago integrados.'},
'de':{'title':'Den Wildlocker wählen. Weiterlernen.','intro':'Entdecken Sie das vollständige Sortiment von MT E.L.K., INC., wählen Sie Ihre Optionen und bestellen Sie hier. Wildlocker, Ersatzbänder und Rufzungen, Bücher, DVDs und Jagdschirme.','shop':'Shop','category':'Kategorien','all':'Alle Produkte','cart':'Warenkorb und Kasse','account':'Mein Konto','help':'Hilfe bei der Auswahl?','note':'Nutzen Sie unsere Lektionen und Pflegehinweise für Ihr Modell oder kontaktieren Sie unser Team.','support':'Produkthilfe erhalten','learn':'Lektionen entdecken','policy':'Versand und Zahlung','returns':'Rückgaben','loading':'Shop wird geladen…','retry':'Erneut versuchen','description':'Das Sortiment von MT E.L.K., INC. mit Produktoptionen, Preisen, Warenkorb und integrierter Kasse.'}}

discovery={
'en':{'title':'Find your next field resource.','search':'Search products','placeholder':'Call model, band, reed, book…','submit':'Search','reset':'Reset browsing','categories':'Go straight to a category','models':'Know your call. Find its resources.','modelnote':'Browse the model resources before choosing replacement parts. Band and reed replacement are different lessons; use the instructions for your model.','model':'Model resources','native':'Product descriptions and checkout language follow the existing store settings.','guide':'Learn • care • shop'},
'fr':{'title':'Trouvez votre prochaine ressource.','search':'Rechercher des produits','placeholder':'Modèle, élastique, anche, livre…','submit':'Rechercher','reset':'Réinitialiser','categories':'Accéder à une catégorie','models':'Connaissez votre appeau et ses ressources.','modelnote':'Consultez les ressources du modèle avant de choisir une pièce de remplacement. Le remplacement des élastiques et des anches fait l’objet de leçons distinctes.','model':'Ressources du modèle','native':'La langue des descriptions et du paiement dépend des paramètres de la boutique existante.','guide':'Apprendre • entretenir • acheter'},
'es':{'title':'Encuentre su próxima herramienta.','search':'Buscar productos','placeholder':'Modelo, banda, lengüeta, libro…','submit':'Buscar','reset':'Restablecer','categories':'Ir a una categoría','models':'Conozca su reclamo y sus recursos.','modelnote':'Consulte los recursos del modelo antes de elegir piezas de repuesto. Cambiar una banda y una lengüeta son lecciones distintas; use las instrucciones de su modelo.','model':'Recursos del modelo','native':'El idioma de las descripciones y del pago depende de la configuración de la tienda existente.','guide':'Aprender • cuidar • comprar'},
'de':{'title':'Die passende Ausrüstung finden.','search':'Produkte suchen','placeholder':'Modell, Band, Rufzunge, Buch…','submit':'Suchen','reset':'Suche zurücksetzen','categories':'Direkt zur Kategorie','models':'Ihr Modell und seine Ressourcen.','modelnote':'Prüfen Sie die Modellressourcen, bevor Sie Ersatzteile auswählen. Bandwechsel und Rufzungenwechsel haben unterschiedliche Lektionen. Nutzen Sie die Anleitung für Ihr Modell.','model':'Modellressourcen','native':'Die Sprache der Produktbeschreibungen und der Kasse folgt den Einstellungen des bestehenden Shops.','guide':'Lernen • pflegen • einkaufen'}}
category_labels={
'en':['Elk','Mule deer','Whitetail','Antelope','Predators','Bands & reeds','DVDs','Calls','Blinds','Books'],
'fr':['Wapiti','Cerf mulet','Cerf de Virginie','Antilope','Prédateurs','Élastiques et anches','DVD','Appeaux','Affûts','Livres'],
'es':['Wapití','Ciervo mulo','Ciervo de cola blanca','Antílope','Depredadores','Bandas y lengüetas','DVD','Reclamos','Puestos de caza','Libros'],
'de':['Wapiti','Maultierhirsch','Weißwedelhirsch','Antilope','Raubtiere','Bänder und Rufzungen','DVDs','Wildlocker','Jagdschirme','Bücher']}
def discovery_markup(lang,prefix):
 from html import escape
 d=discovery[lang]
 categories=json.loads(Path('content/store-categories.json').read_text())
 controls=''.join(f'<button type="button" data-store-category="{c["slug"]}" data-category-id="{c["id"]}" aria-pressed="false" disabled>{category_labels[lang][i]}</button>' for i,c in enumerate(categories))
 return f'<section class="store-discovery" aria-labelledby="store-discovery-title"><p class="eyebrow dark">{d["guide"]}</p><h2 id="store-discovery-title">{d["title"]}</h2><form id="store-search" role="search"><label for="store-query">{d["search"]}</label><div class="store-search-row"><input id="store-query" name="q" type="search" maxlength="100" placeholder="{d["placeholder"]}" enterkeyhint="search"><button type="submit" disabled>{d["submit"]}</button></div></form><div class="store-category-heading"><h3>{d["categories"]}</h3><button type="button" id="store-reset" disabled>{d["reset"]}</button></div><div class="store-category-grid" aria-label="{d["categories"]}">{controls}</div><p class="store-language-note">{d["native"]}</p></section>'
def model_markup(lang,prefix):
 from html import escape
 d=discovery[lang]
 models=json.loads(Path('content/source/calls.json').read_text())
 cards=''.join(f'<a href="{prefix}/calls/{m["id"]}/"><span>{escape(m["name"])}</span><small>{d["model"]} →</small></a>' for m in models)
 return f'<section class="store-model-guide" aria-labelledby="store-model-title"><h2 id="store-model-title">{d["models"]}</h2><p>{d["modelnote"]}</p><div class="store-model-grid">{cards}</div></section>'

Path('content/store-integration.json').write_text(json.dumps({'store_id':117609763,'source':'https://elkinc.com/products/','provider':'Ecwid','mode':'live-existing-store','locales':list(texts),'products':'All products and categories provided by the existing live storefront; no separate price or inventory snapshot.'},indent=2)+'\n')
for lang,t in texts.items():
 prefix='' if lang=='en' else '/'+lang;template=(root/prefix.strip('/')/'index.html').read_text() if prefix else (root/'index.html').read_text()
 head=template.split('</head>')[0]+'</head>';head=re.sub(r'<link rel="stylesheet" href="/home-store-campaign\.css[^"]*">','',head);head=re.sub(r'<title>.*?</title>',f'<title>{t["shop"]} | MT E.L.K., INC.</title>',head);head=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{t["description"]}">',head)
 head=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="{origin}{prefix}/shop/">',head)
 head=re.sub(r'<meta property="og:(?:title|description|url)"[^>]*>','',head);head=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',head)
 head=head.replace('</head>','<link rel="stylesheet" href="/store.css?v='+hashlib.sha256((root/'store.css').read_bytes()).hexdigest()[:12]+'">'+''.join(f'<link rel="alternate" hreflang="{l}" href="{origin}'+('' if l=='en' else '/'+l)+'/shop/">' for l in texts)+'</head>')
 header=re.search(r'<body[^>]*>(.*?)</header>',template,re.S).group(1);header=re.sub(r'href="/(fr/|es/|de/)?"( aria-current="page")?(?=>)',lambda m:m[0],header)
 for code in texts:
  header=re.sub(r'(<a data-site-language="'+code+r'"[^>]*href=")[^"]*',r'\1'+('' if code=='en' else '/'+code)+'/shop/',header)
 footer=re.search(r'<footer\b.*?</footer>',template,re.S).group(0)
 from html import escape
 m=motion[lang]
 motion_control=f'<button type="button" class="store-motion-toggle" data-store-motion-toggle data-pause="{escape(m["pause"],quote=True)}" data-resume="{escape(m["resume"],quote=True)}" data-reduced="{escape(m["reduced"],quote=True)}" aria-pressed="false">{escape(m["pause"])}</button>'
 motion_image=f'<div class="store-hero-visual"><div class="store-motion-stage"><img src="/assets/elk-960-223d36ba.webp" srcset="/assets/elk-480-c801ee61.webp 480w, /assets/elk-960-223d36ba.webp 960w, /assets/elk-1440-23ce7e80.webp 1440w" sizes="(max-width:760px) 88vw, 42vw" width="960" height="640" fetchpriority="high" alt="{escape(m["alt"],quote=True)}"></div>'

 main=f'<main id="main"><section class="store-hero"><div><p class="eyebrow">MT E.L.K., INC. / {t["shop"].upper()}</p><h1>{t["title"]}</h1><p>{t["intro"]}</p>{motion_control}</div>{motion_image}<div class="store-hero-aside"><a href="{prefix}/education/">{t["learn"]} →</a><a href="{prefix}/support/">{t["support"]} →</a></div></div></section><section class="store-section" aria-label="{t["shop"]}">{discovery_markup(lang,prefix)}<div class="store-toolbar"><div class="store-actions">'
 for action,key in [('categories','category'),('all','all'),('cart','cart'),('account','account')]:main+=f'<button type="button" data-store-action="{action}" disabled>{t[key]}</button>'
 main+=f'</div></div><p id="store-status" class="store-loading" role="status">{t["loading"]}</p><button id="store-retry" class="store-retry" hidden>{t["retry"]}</button><div id="my-store-117609763" class="store-catalog" data-live-store></div><noscript><p>Enable JavaScript to browse products and use checkout.</p></noscript>{model_markup(lang,prefix)}<aside class="store-help"><div><h2>{t["help"]}</h2><p>{t["note"]}</p></div><a href="{prefix}/support/">{t["support"]} →</a></aside><div class="store-policies"><a href="{prefix}/disclosures/payment-policy/">{t["policy"]} ↗</a><a href="{prefix}/disclosures/shipping-returns/">{t["returns"]} ↗</a></div></section></main>'
 scripts=''.join(f'<script type="module" src="/{name}.js?v={hashlib.sha256((root/(name+".js")).read_bytes()).hexdigest()[:12]}"></script>' for name in ['script','store','site-language'])
 dest=root/prefix.strip('/')/'shop/index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(head+'<body>'+header+'</header>'+main+footer+scripts+'</body></html>')
for p in root.rglob('index.html'):
 rel=p.relative_to(root);lang=rel.parts[0] if rel.parts[0] in ['fr','es','de'] else 'en';prefix='' if lang=='en' else '/'+lang;t=texts[lang];s=p.read_text()
 s=re.sub(r'<a\b[^>]*class="nav-shop"[^>]*>.*?</a>','',s)
 s=re.sub(r'(<nav\b[^>]*id="navigation"[^>]*>)',lambda m:m[0]+f'<a class="nav-shop" href="{prefix}/shop/">{t["shop"]}</a>',s,count=1)
 for name in ['script','page-transitions','site-language']:
  digest=hashlib.sha256((root/(name+'.js')).read_bytes()).hexdigest()[:12];s=re.sub(r'src="/'+name+r'\.js(?:\?[^\"]*)?"',f'src="/{name}.js?v={digest}"',s)
 # Connect existing model-resource pages to live store searches.
 if '/calls/' in '/'+rel.as_posix():
  slug=p.parent.name;model=next((r['name'] for r in json.loads(Path('content/source/calls.json').read_text()) if r['id']==slug),None)
  if model:
   if '<link rel="stylesheet" href="/store.css">' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/store.css"></head>')
   label={'en':'Search the store for this model','fr':'Rechercher ce modèle dans la boutique','es':'Buscar este modelo en la tienda','de':'Dieses Modell im Shop suchen'}[lang]
   s=re.sub(r'<a class="store-model-link[^"]*".*?</a>','',s)
   s=s.replace('<div class="resource-save-bar">',f'<a class="store-model-link button charcoal" href="{prefix}/shop/?q={quote(model.removesuffix(" Call"))}">{label} →</a><div class="resource-save-bar">',1)
 p.write_text(s)
urls=['/' if p.parent==root else '/'+p.parent.relative_to(root).as_posix()+'/' for p in root.rglob('index.html')];(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+url+'</loc></url>' for url in sorted(urls))+'</urlset>')
for lang,t in texts.items():
 index=root/('' if lang=='en' else lang)/'resource-index.json';rows=json.loads(index.read_text());rows=[r for r in rows if not r['url'].endswith('/shop/')];rows.append({'title':t['shop'],'description':t['description'],'url':('' if lang=='en' else '/'+lang)+'/shop/','kind':'page','keywords':'shop store products cart checkout '+t['shop']});index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Built live-store wrappers in four languages and integrated shop navigation and search.')
