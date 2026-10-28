"""Generate policy pages from captured published records; no runtime policy fetching."""
from pathlib import Path
from html import escape
import json,re,hashlib,unicodedata
root=Path('dist');origin='https://mtelkinc-educationhub.netlify.app';records=json.loads(Path('content/disclosures.json').read_text())
copy={
'en':{'hub':'Disclosures & policies','intro':'Read the published MT E.L.K., INC. policies for shipping, payment and returns.','payment':'Shipping & Payment Policy','returns':'Shipping & Returns','pdesc':'Order processing, delivery, payments, fraud protection, disputes, refunds, tax and large orders.','rdesc':'Inspection period, return eligibility, restocking, return shipping, damaged items, exchanges and refunds.','search':'Find a disclosure','placeholder':'Shipping, refunds, verification…','empty':'No policies match. Try another term or clear the search.','read':'Read policy','all':'All disclosures','source':'Original policy on elkinc.com','download':'Download source text (English)','captured':'Source captured','updated':'Source update shown','contents':'On this page','english':'Published English policy','note':'The policy text below preserves the published English wording, with the company name formatted as MT E.L.K., INC. Original source text is available to download.','contact':'Questions about your order?','help':'Contact our team with your order number.','contactlink':'Contact the team','shop':'Back to the store'},
'fr':{'hub':'Informations et politiques','intro':'Consultez les politiques publiées de MT E.L.K., INC. sur la livraison, le paiement et les retours.','payment':'Politique de livraison et de paiement','returns':'Livraison et retours','pdesc':'Traitement des commandes, livraison, paiements, fraude, litiges, remboursements, taxes et grosses commandes.','rdesc':'Inspection, conditions de retour, frais, transport de retour, articles endommagés, échanges et remboursements.','search':'Rechercher une politique','placeholder':'Livraison, remboursements, vérification…','empty':'Aucune politique ne correspond. Essayez un autre terme ou effacez la recherche.','read':'Lire la politique','all':'Toutes les politiques','source':'Politique originale sur elkinc.com','download':'Télécharger le texte source (anglais)','captured':'Source enregistrée le','updated':'Mise à jour indiquée par la source','contents':'Sur cette page','english':'Politique publiée en anglais','note':'Le texte ci-dessous conserve la formulation anglaise publiée, avec le nom de la société présenté sous la forme MT E.L.K., INC. Le texte source original peut être téléchargé.','contact':'Une question sur votre commande ?','help':'Contactez notre équipe avec votre numéro de commande.','contactlink':'Contacter l’équipe','shop':'Retour à la boutique'},
'es':{'hub':'Información y políticas','intro':'Consulte las políticas publicadas de MT E.L.K., INC. sobre envíos, pagos y devoluciones.','payment':'Política de envíos y pagos','returns':'Envíos y devoluciones','pdesc':'Pedidos, entregas, pagos, fraude, disputas, reembolsos, impuestos y pedidos grandes.','rdesc':'Inspección, requisitos de devolución, tarifas, envío de devolución, artículos dañados, cambios y reembolsos.','search':'Buscar una política','placeholder':'Envíos, reembolsos, verificación…','empty':'Ninguna política coincide. Pruebe otro término o borre la búsqueda.','read':'Leer la política','all':'Todas las políticas','source':'Política original en elkinc.com','download':'Descargar texto original (inglés)','captured':'Fuente guardada el','updated':'Actualización indicada en la fuente','contents':'En esta página','english':'Política publicada en inglés','note':'El texto siguiente conserva la redacción inglesa publicada, con el nombre de la empresa presentado como MT E.L.K., INC. Puede descargar el texto original.','contact':'¿Tiene una pregunta sobre su pedido?','help':'Contacte con nuestro equipo e incluya su número de pedido.','contactlink':'Contactar con el equipo','shop':'Volver a la tienda'},
'de':{'hub':'Informationen und Richtlinien','intro':'Lesen Sie die veröffentlichten Richtlinien von MT E.L.K., INC. zu Versand, Zahlung und Rückgaben.','payment':'Versand- und Zahlungsrichtlinie','returns':'Versand und Rückgaben','pdesc':'Bestellabwicklung, Lieferung, Zahlungen, Betrugsschutz, Streitfälle, Erstattungen, Steuern und Großbestellungen.','rdesc':'Prüffrist, Rückgabebedingungen, Gebühren, Rückversand, beschädigte Artikel, Umtausch und Erstattungen.','search':'Richtlinie suchen','placeholder':'Versand, Erstattung, Prüfung…','empty':'Keine passende Richtlinie. Versuchen Sie einen anderen Begriff oder löschen Sie die Suche.','read':'Richtlinie lesen','all':'Alle Richtlinien','source':'Originalrichtlinie auf elkinc.com','download':'Quelltext herunterladen (Englisch)','captured':'Quelle gespeichert am','updated':'In der Quelle angegebene Aktualisierung','contents':'Auf dieser Seite','english':'Veröffentlichte englische Richtlinie','note':'Der folgende Text bewahrt den veröffentlichten englischen Wortlaut; der Firmenname wird als MT E.L.K., INC. dargestellt. Der ursprüngliche Quelltext steht zum Download bereit.','contact':'Fragen zu Ihrer Bestellung?','help':'Kontaktieren Sie unser Team mit Ihrer Bestellnummer.','contactlink':'Team kontaktieren','shop':'Zurück zum Shop'}}
def brand(s):return re.sub(r'MT\s+(?:E\.?L\.?K\.?|Elk)\s*,?\s*Inc\.?', 'MT E.L.K., INC.',s,flags=re.I)
# Apply explicit editorial revisions separately from immutable source captures.
amendment_path=Path('content/payment-policy-amendment.json')
if amendment_path.exists():
 amendment=json.loads(amendment_path.read_text())
 r=next(r for r in records if r['id']==amendment['record_id'])
 for change in amendment['replacements']:
  matches=[i for i,b in enumerate(r['blocks']) if b['text']==change['source_text']]
  assert len(matches)==1, 'Source changed: review the checkout amendment before rebuilding.'
  r['blocks'][matches[0]]=change['replacement']
 r['revision']=amendment
 current_text=r['title']+' | MT E.L.K., INC.\nCheckout information updated: '+amendment['updated']+'\n\n'+'\n\n'.join(brand(b['text']) for b in r['blocks'])+'\n'
 (root/amendment['download'].lstrip('/')).write_text(current_text)
def section_id(text):
 plain=unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()
 return re.sub(r'[^a-z0-9]+','-',plain).strip('-')
def page(lang,path,title,description,main,hub=False):
 t=copy[lang];prefix='' if lang=='en' else '/'+lang;template=(root/prefix.strip('/')/'index.html').read_text();head=template.split('</head>')[0]+'</head>';head=re.sub(r'<link rel="stylesheet" href="/home-store-campaign\.css[^"]*">','',head)
 head=re.sub(r'<title>.*?</title>','<title>'+escape(title)+' | MT E.L.K., INC.</title>',head)
 head=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="'+escape(description,quote=True)+'">',head)
 head=re.sub(r'<meta property="og:(?:title|description|url)"[^>]*>','',head);head=re.sub(r'<link\b[^>]*hreflang=[^>]*>','',head)
 head=re.sub(r'<link rel="canonical"[^>]*>','<link rel="canonical" href="'+origin+prefix+path+'">',head)
 head=head.replace('</head>','<link rel="stylesheet" href="/disclosures.css?v='+hashlib.sha256((root/'disclosures.css').read_bytes()).hexdigest()[:12]+'">'+''.join(f'<link rel="alternate" hreflang="{l}" href="{origin}'+('' if l=='en' else '/'+l)+path+'">' for l in copy)+'</head>')
 header=re.search(r'<body[^>]*>(.*?)</header>',template,re.S).group(1)
 header=re.sub(r' aria-current="page"','',header)
 for l in copy:header=re.sub(r'(<a data-site-language="'+l+r'"[^>]*href=")[^"]*',r'\1'+('' if l=='en' else '/'+l)+path,header)
 header=header.replace('data-site-language="'+lang+'"','data-site-language="'+lang+'" aria-current="page"')
 footer=re.search(r'<footer\b.*?</footer>',template,re.S).group(0)
 scripts=''.join(f'<script type="module" src="/{name}.js?v={hashlib.sha256((root/(name+".js")).read_bytes()).hexdigest()[:12]}"></script>' for name in (['script','disclosures','site-language'] if hub else ['script','site-language']))
 dest=root/(prefix+path).lstrip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(head+'<body>'+header+'</header>'+main+footer+scripts+'</body></html>')
for lang,t in copy.items():
 prefix='' if lang=='en' else '/'+lang
 cards=''
 for r in records:
  key='payment' if r['id']=='payment-policy' else 'returns';desc=t['pdesc' if key=='payment' else 'rdesc'];terms=brand(' '.join(b['text'] for b in r['blocks']))
  cards+=f'<article class="disclosure-card" data-disclosure-card data-search="{escape(t[key]+" "+desc+" "+terms,quote=True)}"><p class="eyebrow dark">MT E.L.K., INC.</p><h2>{t[key]}</h2><p>{desc}</p><a href="{prefix}/disclosures/{r["id"]}/">{t["read"]} →</a></article>'
 main=f'<main id="main"><section class="disclosure-hero"><p class="eyebrow">MT E.L.K., INC.</p><h1>{t["hub"]}</h1><p>{t["intro"]}</p></section><section class="disclosure-hub"><label for="disclosure-query">{t["search"]}</label><input id="disclosure-query" type="search" placeholder="{t["placeholder"]}" maxlength="100" aria-controls="disclosure-results"><div id="disclosure-results" class="disclosure-cards">{cards}</div><p id="disclosure-empty" role="status" hidden>{t["empty"]}</p></section></main>'
 page(lang,'/disclosures/',t['hub'],t['intro'],main,True)
 for r in records:
  key='payment' if r['id']=='payment-policy' else 'returns';title=t[key];body='';toc='';ids=set()
  for b in r['blocks']:
   html=brand(b['html'])
   if b['tag'] in ['h2','h3','h4']:
    ident=section_id(b['text']);assert ident not in ids;ids.add(ident)
    html=html.replace('<'+b['tag']+'>','<'+b['tag']+' id="'+ident+'">',1)
    if b['tag']=='h2':toc+=f'<li><a href="#{ident}">{escape(brand(b["text"]))}</a></li>'
   body+=html
  metadata=f'<p>{t["captured"]}: <time datetime="{r["captured"]}">{r["captured"]}</time></p>'
  if r['source_last_updated']:metadata+=f'<p>{t["updated"]}: {r["source_last_updated"]}</p>'
  notice='';policy_note=t['note'];current_link=''
  if r.get('revision'):
   revision=r['revision'];labels=revision['labels'][lang];policy_note=labels['note']
   metadata+=f'<p>{labels["updated"]}: <time datetime="{revision["updated"]}">{revision["updated"]}</time></p>'
   current_link=f'<a href="{revision["download"]}" download="payment-policy-current.txt">{labels["download"]} ↓</a>' 
  main=f'<main id="main"><section class="disclosure-hero"><nav aria-label="Breadcrumb"><a href="{prefix}/disclosures/">{t["all"]}</a><span aria-hidden="true"> / </span><span>{title}</span></nav><h1>{title}</h1><p>{t["pdesc" if key=="payment" else "rdesc"]}</p></section><div class="disclosure-layout"><aside class="disclosure-toc"><details open><summary>{t["contents"]}</summary><nav lang="en" data-policy-source><ol>{toc}</ol></nav></details></aside><article class="disclosure-document"><div class="disclosure-source"><p class="eyebrow dark">{t["english"]}</p><p>{policy_note}</p>{metadata}<div class="disclosure-source-links"><a href="{r["source_url"]}">{t["source"]} ↗</a><a href="{r["download"]}" download="{r["id"]}-source.txt">{t["download"]} ↓</a>{current_link}</div>{notice}</div><div class="disclosure-text" lang="en" data-policy-source>{body}</div><aside class="disclosure-contact"><h2>{t["contact"]}</h2><p>{t["help"]}</p><a href="{prefix}/contact/">{t["contactlink"]} →</a><a href="{prefix}/shop/">{t["shop"]} →</a></aside></article></div></main>'
  page(lang,'/disclosures/'+r['id']+'/',title,t['pdesc' if key=='payment' else 'rdesc'],main)
for p in root.rglob('index.html'):
 lang=p.relative_to(root).parts[0];lang=lang if lang in copy else 'en';t=copy[lang];prefix='' if lang=='en' else '/'+lang;s=p.read_text()
 s=re.sub(r'<nav class="footer-disclosures".*?</nav>','',s,flags=re.S)
 links=f'<nav class="footer-disclosures" aria-label="{t["hub"]}"><a href="{prefix}/disclosures/">{t["hub"]}</a><a href="{prefix}/disclosures/payment-policy/">{t["payment"]}</a><a href="{prefix}/disclosures/shipping-returns/">{t["returns"]}</a></nav>'
 s=s.replace('<div class="footer-bottom">',links+'<div class="footer-bottom">',1)
 if '/shop/' in '/'+p.relative_to(root).as_posix():
  for slug in ['payment-policy','shipping-returns']:s=s.replace('href="https://elkinc.com/'+slug+'/" target="_blank" rel="noopener noreferrer"','href="'+prefix+'/disclosures/'+slug+'/"')
 for name in ['script','page-transitions','site-language']:
  s=re.sub(r'src="/'+name+r'\.js(?:\?[^\"]*)?"',f'src="/{name}.js?v={hashlib.sha256((root/(name+".js")).read_bytes()).hexdigest()[:12]}"',s)
 p.write_text(s)
urls=['/' if p.parent==root else '/'+p.parent.relative_to(root).as_posix()+'/' for p in root.rglob('index.html')]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+origin+url+'</loc></url>' for url in sorted(urls))+'</urlset>')
for lang,t in copy.items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'resource-index.json';rows=[r for r in json.loads(p.read_text()) if '/disclosures/' not in r['url']];rows.append({'title':t['hub'],'description':t['intro'],'url':prefix+'/disclosures/','kind':'page','keywords':'disclosures policies shipping payment returns '+t['hub']})
 for r in records:
  key='payment' if r['id']=='payment-policy' else 'returns';rows.append({'title':t[key],'description':t['pdesc' if key=='payment' else 'rdesc'],'url':prefix+'/disclosures/'+r['id']+'/','kind':'page','keywords':'policy disclosure '+t[key]})
 p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
p=root/'_redirects';current=p.read_text() if p.exists() else '';aliases={('' if lang=='en' else '/'+lang)+'/'+r['id']+'/' for lang in copy for r in records};lines=[line for line in current.splitlines() if not line.split() or line.split()[0] not in aliases]
for lang in copy:
 prefix='' if lang=='en' else '/'+lang
 for r in records:lines.insert(0,f'{prefix}/{r["id"]}/ {prefix}/disclosures/{r["id"]}/ 301')
p.write_text('\n'.join(lines)+'\n')
print('Generated 12 disclosure pages, footer/store links, resource indexes, sitemap and source-route aliases.')
