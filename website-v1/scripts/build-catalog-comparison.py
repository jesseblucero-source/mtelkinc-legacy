"""Source-backed comparison and reusable catalog controls. No commercial facts copied."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit
import json,re

def extend_catalog(root, dist, records, categories, category_copy, page, crumb, link):
 ui=json.loads((root/'content/catalog-navigation.json').read_text())
 lessons={r['slug']:r for r in json.loads((root/'content/university-lessons.json').read_text())}
 byid={r['product_id']:r for r in records}
 def payload(lang):
  data={'lang':lang,'copy':ui[lang],'products':[{'id':r['product_id'],'name':r['name']}for r in records]}
  return '<script type="application/json" data-catalog-tools>'+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+'</script>'
 def selector(r,lang):
  return '<label class="catalog-compare-choice" hidden><input type="checkbox" value="'+str(r['product_id'])+'" data-compare-product><span>'+ui[lang]['compareOne']+'<span class="visually-hidden">: '+escape(r['name'])+'</span></span></label>'
 def rail(lang):
  c=ui[lang];pre=''if lang=='en'else'/'+lang
  return '<section class="catalog-compare-rail" data-compare-rail hidden aria-label="'+c['compare']+'"><div><h2>'+c['compare']+'</h2><p data-compare-count aria-live="polite"></p></div><ul data-compare-chips></ul><div class="catalog-compare-actions">'+link(pre+'/catalog/compare/',c['view'],'button')+'<button type="button" data-compare-clear>'+c['clear']+'</button></div><p class="catalog-control-status" data-compare-feedback role="status"></p></section>'
 for p in list(dist.rglob('index.html')):
  relative=p.relative_to(dist).as_posix()
  if not re.match(r'(?:(?:fr|es|de)/)?catalog/',relative)or'/compare/'in relative:continue
  lang=relative.split('/')[0]if relative.startswith(('fr/','es/','de/'))else'en';pre=''if lang=='en'else'/'+lang;c=ui[lang]
  html=p.read_text();head,sep,body=html.partition('</head>')
  # Fresh authority generation replaces prior extension markup, so no cumulative DOM edits.
  if '/catalog/products/' in '/'+relative:
   identity=int(p.parent.name);r=byid[identity]
   body=body.replace('</div></section>',selector(r,lang)+'</div></section>'+rail(lang),1)
  else:
   def card(match):
    chunk=match[0];identity=re.search(r'href="/catalog/products/(\d+)/"',chunk)[1];r=byid[int(identity)]
    chunk=chunk.replace('data-catalog-product','data-catalog-product data-product-id="'+identity+'" data-search="'+escape(r['name']+' '+str(r.get('sku')or''),quote=True)+'"',1)
    chunk=chunk.replace('<h2>','<h2 lang="en">',1).replace('<p>','<p lang="en">',1)
    return chunk.replace('</div></article>',selector(r,lang)+'</div></article>')
   body=re.sub(r'<article class="catalog-card".*?</article>',card,body,flags=re.S)
   body=body.replace('<form class="catalog-filters"','<h2 class="catalog-browse-title">'+c['filters']+'</h2><p id="catalog-search-help">'+c['searchHelp']+'</p><form class="catalog-filters"',1)
   body=body.replace('name="q" type="search"','name="q" aria-describedby="catalog-search-help" type="search"',1)
   body=body.replace('</form>','</form>'+rail(lang),1)
  body=body.replace('</main>',payload(lang)+'</main>',1)
  p.write_text(head+sep+body)
 for lang,c in ui.items():
  pre=''if lang=='en'else'/'+lang;path=pre+'/catalog/compare/'
  options='<option value="">'+c['choose']+'</option>'+''.join('<option value="'+str(r['product_id'])+'">'+escape(r['name'])+'</option>'for r in sorted(records,key=lambda r:r['name'].casefold()))
  form='<form class="catalog-compare-form" data-compare-form hidden><div class="catalog-compare-selects">'+''.join('<label>'+c['slot']+' '+str(i+1)+'<select name="product-'+str(i)+'">'+options+'</select></label>'for i in range(3))+'</div><div class="catalog-compare-actions"><button type="submit" class="button">'+c['update']+'</button><button type="button" data-compare-clear>'+c['clear']+'</button></div></form>'
  templates=[]
  for r in records:
   cats=[category_copy[lang][i]for i,cat in enumerate(categories)if cat['slug']in r['categories']]
   image=(r['images']or[{}])[0];imageurl=image.get('thumbnail')or image.get('url');picture=''
   if imageurl:picture='<a class="catalog-image" href="/catalog/products/'+str(r['product_id'])+'/"><img src="'+escape(imageurl,quote=True)+'" width="'+str(image.get('width')or 800)+'" height="'+str(image.get('height')or 800)+'" loading="lazy" decoding="async" alt="'+escape(r['name'],quote=True)+'"></a>'
   training=''.join('<li>'+link(u,lessons[u.strip('/').split('/')[-1]]['title'])+'</li>'for u in r['instructional_lessons'])
   replacements=''.join('<li>'+link(urlsplit(u).path,byid[int(urlsplit(u).path.strip('/').split('/')[-1])]['name'])+'</li>'for u in r['compatible_replacements'])
   buying=urlsplit(r['live_store_url']);buy=pre+buying.path+('#'+buying.fragment if buying.fragment else'')
   description=''.join('<p lang="en">'+escape(text)+'</p>'for text in r['description'].split('\n\n')if text)or'<p>'+c['support']+'</p>'
   body=picture+'<div class="catalog-comparison-content"><h2>'+escape(r['name'])+'</h2>'+('<p>SKU: '+escape(str(r['sku']))+'</p>'if r.get('sku')else'')+'<p class="catalog-comparison-categories">'+c['categories']+': '+escape(' · '.join(cats))+'</p><details><summary>'+c['information']+'</summary>'+description+'</details><h3>'+c['training']+'</h3>'+('<ul lang="en">'+training+'</ul>'if training else'<p>'+c['noLesson']+'</p>'+link(pre+'/education/',c['education']))+'<h3>'+c['replacements']+'</h3>'+('<ul>'+replacements+'</ul>'if replacements else'<p>'+c['noReplacement']+'</p>')
   body+='<div class="catalog-comparison-links">'+link('/catalog/products/'+str(r['product_id'])+'/',c['fullDetails'])+link(buy,c['buy'],'button')+link(pre+'/support/',c['support'])+'</div><button type="button" data-compare-remove="'+str(r['product_id'])+'">'+c['remove']+'<span class="visually-hidden">: '+escape(r['name'])+'</span></button></div>'
   templates.append('<template data-compare-template="'+str(r['product_id'])+'"><article class="catalog-comparison-card">'+body+'</article></template>')
  content=crumb([(pre+'/', 'MT E.L.K., INC.'),(pre+'/catalog/',c['guide']),(path,c['compare'])])+'<section class="catalog-intro catalog-comparison-intro"><p class="eyebrow">MT E.L.K., INC.</p><h1>'+c['compare']+'</h1><p>'+c['compareHint']+'</p><p>'+c['selectionHelp']+'</p></section>'+form+'<p class="catalog-control-status" data-compare-feedback role="status"></p><section class="catalog-comparison-empty" data-comparison-empty><h2>'+c['empty']+'</h2><p>'+c['emptyHelp']+'</p>'+link(pre+'/catalog/',c['back'],'button')+'</section><p class="catalog-original-note">'+c['original']+'</p><div class="catalog-comparison-grid" data-comparison-results aria-label="'+c['compare']+'"></div><section class="catalog-share" data-comparison-share hidden><h2>'+c['share']+'</h2><div class="catalog-compare-actions"><button type="button" data-compare-share hidden>'+c['share']+'</button><button type="button" data-compare-copy>'+c['copy']+'</button></div><div data-compare-manual hidden><label>'+c['linkLabel']+'<input type="url" data-compare-url readonly></label><p>'+c['manual']+'</p></div><p role="status" data-compare-share-status></p></section>'+link(pre+'/catalog/',c['back'])+'<noscript><p>'+c['nojs']+'</p><ul>'+''.join('<li>'+link('/catalog/products/'+str(r['product_id'])+'/',r['name'])+'</li>'for r in records)+'</ul></noscript>'+''.join(templates)+payload(lang)
  page(path,c['compare'],c['compareHint'],content,lang,True)
  p=dist/path.strip('/')/'index.html';html=p.read_text()
  html=re.sub(r'(data-site-language="(en|fr|es|de)"[^>]*href=")[^"]+"',lambda m:m[1]+(''if m[2]=='en'else'/'+m[2])+'/catalog/compare/"',html)
  p.write_text(html)
 return {'comparison_pages':4,'selection_limit':3,'uses_browser_storage':False,'static_prices_or_stock':False}
