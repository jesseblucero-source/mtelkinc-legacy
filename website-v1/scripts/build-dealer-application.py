"""Generate localized dealer questionnaires and discovery links. No credentials in public files."""
from pathlib import Path
from html import escape
import json,re,hashlib
import runpy
runpy.run_path('scripts/build-dealer-email.py')
root=Path('dist');schema=json.loads(Path('content/dealer-application.json').read_text());copy=json.loads(Path('content/dealer-application-ui.json').read_text())
email_copy=json.loads(Path('content/dealer-email-ui.json').read_text())
signature_copy=json.loads(Path('content/dealer-signature-ui.json').read_text())
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
def field(f,lang,t):
 name=f['name'];ident='dealer-'+name;label=escape(f['labels'][lang]);required=' required' if f['required'] else '';hint='<span data-required-marker>'+(' *' if f['required'] else ' ('+escape(t['optional'])+')')+'</span>'
 attrs=f' id="{ident}" name="{name}"'
 if f.get('hints'):attrs+=' aria-describedby="'+ident+'-hint"'
 if f['kind'] in ['checks','checkbox']:attrs+=' value="yes"' if f['kind']=='checkbox' else ''
 if f['kind']=='textarea':control=f'<textarea{attrs}{required} rows="4" maxlength="2500"></textarea>'
 elif f['kind']=='select':control=f'<select{attrs}{required}><option value="">{escape(t["choose"])}</option>'+''.join(f'<option value="{v}">{escape(schema["options"].get(v,{}).get(lang,v))}</option>' for v in f['options'])+'</select>'
 elif f['kind']=='checks':
  choices=''.join(f'<label class="dealer-choice"><input type="checkbox" name="{name}" value="{v}"><span>{escape(schema["options"].get(v,{}).get(lang,v))}</span></label>' for v in f['options'])
  return f'<div class="dealer-field wide" data-field="{name}"><fieldset><legend>{label}{hint}</legend><div class="dealer-choices">{choices}</div></fieldset></div>'
 elif f['kind']=='checkbox':control=f'<label class="dealer-choice"><input type="checkbox"{attrs}{required}><span>{label}{hint}</span></label>'
 else:
  extra=''
  if f['kind']=='number':extra+=f' min="{f["min"]}" max="{f["max"]}" step="'+('0.01' if f.get('decimal') else '1')+'" inputmode="'+('decimal' if f.get('decimal') else 'numeric')+'"'
  else:extra+=' maxlength="'+str(f.get('maxlength',254 if f['kind']=='email' else 300))+'"'
  for key in ['pattern','inputmode']:
   if key in f:extra+=' '+key+'="'+escape(str(f[key]),quote=True)+'"'
  if name=='ein':extra+=' autocomplete="off"'
  auto={'business_name':'organization','contact_name':'name','email':'email','phone':'tel','business_address':'street-address','city':'address-level2','state_province':'address-level1','postal_code':'postal-code','country':'country-name','contact_title':'organization-title','website':'url'}.get(name)
  if auto:extra+=' autocomplete="'+auto+'"'
  control=f'<input type="{f["kind"]}"{attrs}{required}{extra}>'
 cond=f' data-conditional="{f["conditional"]}"' if f.get('conditional') else ''
 return f'<div class="dealer-field'+(' wide' if f['kind'] in ['checkbox','textarea'] or f.get('wide') else '')+f'" data-field="{name}"{cond}>'+('' if f['kind']=='checkbox' else f'<label for="{ident}">{label}{hint}</label>')+control+(f'<p class="dealer-field-hint" id="{ident}-hint">{escape(f["hints"][lang])}</p>' if f.get('hints') else '')+'</div>'
def share_panel(lang,t):
 url='https://www.mtelkinc.com'+('' if lang=='en' else '/'+lang)+'/dealer-application/'
 attrs=' '.join('data-'+key.replace('_','-')+'="'+escape(t[key],quote=True)+'"' for key in ['link_copied','link_manual','share_ready'])
 return f'<div class="dealer-share" {attrs} data-share-title="{escape(t["title"]+" | MT E.L.K., INC.",quote=True)}"><label>{escape(t["link_label"])}<input type="url" readonly value="{url}" aria-label="{escape(t["link_label"])}" autocomplete="off" spellcheck="false"></label><div class="dealer-share-actions"><button type="button" data-share-application disabled>{escape(t["share"])}</button><button type="button" data-copy-application disabled>{escape(t["copy_link"])}</button></div><p class="dealer-share-note">{escape(t["share_note"])}</p><p class="dealer-share-status" role="status" aria-live="polite" aria-atomic="true"></p></div>'
# Register the application controller for persistent page navigation.
p=root/'page-transitions.js';s=p.read_text()
if "'dealer-application'" not in s:s=s.replace("'document-viewer'","'document-viewer','dealer-application'",1)
if "'dealer-share'" not in s:s=s.replace("'dealer-application'","'dealer-application','dealer-share'",1)
p.write_text(s)
for lang,t in copy.items():
 prefix='' if lang=='en' else '/'+lang;dest=prefix+'/dealer-application/';formname=schema['form_name']+('' if lang=='en' else '-'+lang)
 source=(root/prefix.strip('/')/'dealers/us/index.html').read_text()
 # Shared branded shell, without the unrelated dealer video/record controllers.
 shell=re.sub(r'<main\b.*?</main>','__DEALER_MAIN__',source,flags=re.S,count=1)
 shell=re.sub(r'<dialog\b.*?</dialog>','',shell,flags=re.S)
 shell=re.sub(r'<script type="module" src="/(?:learn|dynamic)\.js[^"]*"></script>','',shell)
 shell=re.sub(r'<script type="application/ld\+json">.*?</script>','',shell,flags=re.S)
 shell=re.sub(r'<title>.*?</title>','<title>'+escape(t['title'])+' | MT E.L.K., INC.</title>',shell)
 desc=escape(re.sub('<[^>]+>','',t['intro']),quote=True)
 shell=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',lambda m:m[1]+desc,shell)
 shell=re.sub(r'(<meta property="og:title" content=")[^"]*',lambda m:m[1]+escape(t['title']+' | MT E.L.K., INC.',quote=True),shell)
 shell=re.sub(r'https://(?:mtelkinc-educationhub\.netlify\.app|www\.mtelkinc\.com)(/(?:fr/|es/|de/)?)(?:dealers/us/)',r'https://www.mtelkinc.com\1dealer-application/',shell)
 shell=re.sub(r'<link rel="stylesheet" href="/dealer-start\.css[^"]*">','',shell)
 shell=re.sub(r'<link rel="stylesheet" href="/dealer-application\.css[^"]*">','',shell)
 if 'rel="preload" href="/assets/roboto-400-optimized-007c12f8b9f6.woff2"' not in shell:shell=shell.replace('</head>','<link rel="preload" href="/assets/roboto-400-optimized-007c12f8b9f6.woff2" as="font" type="font/woff2" crossorigin></head>')
 shell=shell.replace('</head>','<link rel="stylesheet" href="/dealer-application.css?v='+digest('dealer-application.css')+'"></head>')
 tabs=''.join(f'<li><button type="button" data-dealer-tab="{i+1}" disabled><span>0{i+1}</span>{escape(label)}</button></li>' for i,label in enumerate(t['steps']))
 sections=''
 for i in range(1,6):
  sections+=f'<section class="dealer-step" data-dealer-step="{i}"{(" hidden" if i>1 else "")} aria-labelledby="dealer-step-{i}"><h2 id="dealer-step-{i}" tabindex="-1">{i:02d} / {escape(t["step_titles"][i-1])}</h2><p>{escape(t["step_notes"][i-1])}</p>'
  if i==5:sections+='<div id="dealer-review" class="dealer-review"></div>'
  sections+='<div class="dealer-field-grid">'+''.join(field(f,lang,t) for f in schema['fields'] if f['step']==i)+'</div>'
  if i==5:
   sig=signature_copy[lang]
   sections+='<section class="dealer-signature-card" aria-labelledby="dealer-signature-title"><h3 id="dealer-signature-title">'+escape(sig['heading'])+'</h3><p>'+escape(sig['help'])+'</p><button type="button" data-dealer-sign disabled>'+escape(sig['save'])+'</button><p data-signature-status role="status" aria-live="polite">'+escape(sig['pending'])+'</p><div data-signature-preview></div><p class="dealer-signature-disclosure">'+escape(sig['disclosure'])+'</p></section>'
  sections+='</section>'
 hidden=''.join(f'<input type="hidden" name="{name}" value="{escape(value,quote=True)}">' for name,value in [('form-name',formname),('subject','MT E.L.K., INC. — Dealer or Distributor application (%{submissionId})'),('application_reference',''),('application_language',lang),('review_route',''),('review_checks',''),('submitted_at','')])+'<textarea name="application_summary" hidden></textarea>'+''.join('<input type="hidden" name="'+name+'" value="">' for name in schema.get('retired_fields',[]))
 hidden+=''.join('<input type="hidden" name="'+name+'" value="">' for name in ['signature_name','signature_saved_at','signature_timezone','signature_device','signature_browser_language','signature_clock_source','signature_version','signature_statement'])
 main=f'''<main id="main"><section class="dealer-hero"><p class="eyebrow">{escape(t['eyebrow'])}</p><h1>{t['headline']}</h1><p>{escape(t['intro'])}</p><p class="dealer-ack">{escape(t['ack'])}</p>{share_panel(lang,t)}</section><div class="dealer-workspace"><aside class="dealer-progress"><nav aria-label="{escape(t['progress'])}"><ol>{tabs}</ol></nav><p>{escape(t['reference'])}<br><strong data-dealer-reference></strong></p><p>{escape(t['help'])}<br><a href="mailto:phillip@elkinc.com">phillip@elkinc.com</a></p></aside><div class="dealer-form-shell"><div id="dealer-status" class="dealer-status" role="status" tabindex="-1" hidden></div><form id="dealer-application" name="{formname}" method="POST" action="{dest}received/" data-netlify="true" netlify-honeypot="bot-field">{hidden}<p class="dealer-honeypot" aria-hidden="true"><label>Leave this field empty<input name="bot-field" tabindex="-1" autocomplete="off"></label></p>{sections}<div class="dealer-actions"><button type="button" class="secondary" data-dealer-back disabled>{escape(t['back'])}</button><button type="button" class="primary" data-dealer-next disabled>{escape(t['next'])} →</button><button type="button" class="secondary" data-dealer-print disabled>{escape(t['print'])}</button><button type="submit" class="primary" data-dealer-send disabled>{escape(t['submit'])} →</button></div><p class="dealer-print-note">{escape(t['print_note'])}</p><p class="dealer-privacy">{escape(t['privacy'])}</p><noscript><p>{escape(t['nojs'])} <a href="mailto:phillip@elkinc.com?cc=jesse%40elkinc.com">phillip@elkinc.com</a></p></noscript></form></div></div></main>'''
 e=email_copy[lang]
 tools=f'''<section class="dealer-email-tools" data-dealer-email-tools hidden aria-labelledby="dealer-email-title"><h2 id="dealer-email-title">{escape(e['title'])}</h2><p>{escape(e['intro'])}</p><div class="dealer-email-actions"><button type="button" data-dealer-pdf>{escape(e['pdf'])}</button><button type="button" data-dealer-email-prepare>{escape(e['prepare'])}</button></div><p data-email-status role="status" aria-live="polite"></p><p class="dealer-email-sensitive">{escape(e['sensitive'])}</p><dialog class="dealer-email-dialog" aria-labelledby="dealer-email-dialog-title"><div class="dealer-email-heading"><h2 id="dealer-email-dialog-title">{escape(e['dialog_title'])}</h2><button type="button" data-email-close>{escape(e['close'])} ×</button></div><ol><li>{escape(e['step_one'])}</li><li>{escape(e['step_two'])}</li><li>{escape(e['step_three'])}</li></ol><dl class="dealer-email-recipients"><div><dt>{escape(e['to'])}</dt><dd>phillip@elkinc.com</dd></div><div><dt>{escape(e['cc'])}</dt><dd>jesse@elkinc.com</dd></div></dl><label>{escape(e['subject'])}<input data-email-subject readonly autocomplete="off"></label><label>{escape(e['details'])}<textarea data-email-details readonly rows="10" autocomplete="off" spellcheck="false"></textarea></label><div class="dealer-email-actions"><button type="button" data-dealer-pdf>{escape(e['pdf'])}</button><button type="button" data-email-copy>{escape(e['copy'])}</button><a data-email-open href="mailto:phillip@elkinc.com?cc=jesse%40elkinc.com">{escape(e['open'])} →</a></div><p role="status" data-email-copy-status aria-live="polite"></p><p>{escape(e['notice'])}</p></dialog></section>'''
 main=main.replace('<p class="dealer-print-note">',tools+'<p class="dealer-print-note">')
 page=shell.replace('__DEALER_MAIN__',main)
 data=json.dumps({'fields':schema['fields'],'options':schema['options'],'ui':t,'lang':lang,'email_ui':e,'signature_ui':signature_copy[lang],'signature_english':signature_copy['en'],'english_steps':copy['en']['step_titles'],'review_messages':{k[5:]:v for k,v in copy['en'].items() if k.startswith('flag_')}},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 page=page.replace('</body>',f'<script type="application/json" id="dealer-application-data">{data}</script><script type="module" src="/dealer-application.js?v={digest("dealer-application.js")}"></script></body>')
 p=root/dest.strip('/')/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(page)
 # A real static receipt target permits an unambiguous AJAX response marker.
 received=shell.replace('__DEALER_MAIN__',f'<main id="main"><section class="dealer-hero" data-dealer-received><p class="eyebrow">MT E.L.K., INC.</p><h1>{escape(t["received_title"])}</h1><p>{escape(t["received_text"])}</p><a class="button primary" href="{dest}">{escape(t["return_link"])}</a></section></main>')
 received=received.replace('</head>','<meta name="robots" content="noindex"></head>');received=received.replace('href="https://www.mtelkinc.com'+dest+'"','href="https://www.mtelkinc.com'+dest+'received/"')
 received=re.sub(r'<title>.*?</title>','<title>'+escape(t['received_title'])+' | MT E.L.K., INC.</title>',received)
 p=p.parent/'received/index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(received)
# Reusable localized dealer CTA and footer entry. Keep all existing routes and source links.
for p in root.rglob('index.html'):
 s=p.read_text();m=re.search(r'<html[^>]*lang="([^"]+)"',s)
 if not m:continue
 lang=m[1];t=copy.get(lang,copy['en']);prefix='' if lang=='en' else '/'+lang;dest=prefix+'/dealer-application/'
 s=re.sub(r'<section class="dealer-apply-strip".*?</section>','',s,flags=re.S)
 route='/'+p.parent.relative_to(root).as_posix().strip('.')+'/'
 if p.parent==root:route='/'
 if route in [prefix+'/dealers/us/',prefix+'/canada/',prefix+'/contact/',prefix+'/shop/']:
  cta=f'<section class="dealer-apply-strip"><p class="eyebrow">MT E.L.K., INC.</p><h2>{escape(t["cta_title"])}</h2><p>{escape(t["cta_text"])}</p><a href="{dest}">{escape(t["apply"])} →</a>{share_panel(lang,t)}</section>'
  s=s.replace('</main>',cta+'</main>')
  if '/dealers/us/' in route:s=re.sub(r'(<div class="actions"><a class="button primary" href=")(?:#dealer-contact|[^"]*/dealer-application/)("[^>]*>).*?</a>',lambda m:m[1]+dest+m[2]+escape(t['apply'])+' →</a>',s,count=1)
  if '/dealer-application.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/dealer-application.css?v='+digest('dealer-application.css')+'"></head>')
 s=re.sub(r'<nav class="dealer-footer-apply".*?</nav>','',s,flags=re.S)
 if '<footer' in s:
  s=s.replace('</footer>',f'<nav class="dealer-footer-apply" aria-label="{escape(t["title"])}"><a data-dealer-application-link href="{dest}">{escape(t["apply"])} →</a></nav></footer>')
 s=re.sub(r'<script type="module" src="/dealer-share\.js[^"]*"></script>','',s)
 if 'data-share-application' in s:s=s.replace('</body>','<script type="module" src="/dealer-share.js?v='+digest('dealer-share.js')+'"></script></body>')
 s=re.sub(r'(/dealer-application\.css)(?:\?v=[a-f0-9]+)?',lambda m:m[1]+'?v='+digest('dealer-application.css'),s)
 s=re.sub(r'(/page-transitions\.js)(?:\?v=[a-f0-9]+)?',lambda m:m[1]+'?v='+digest('page-transitions.js'),s)
 p.write_text(s)
# Localized search indexes and sitemap list application pages, never receipt pages.
for lang,t in copy.items():
 name='resource-index.json' if lang=='en' else 'resource-index-'+lang+'.json';p=root/name
 if not p.exists():continue
 rows=json.loads(p.read_text());prefix='' if lang=='en' else '/'+lang;url=prefix+'/dealer-application/'
 rows=[r for r in rows if 'dealer-application/' not in r.get('url','')]
 rows.append({'title':t['title'],'description':re.sub('<[^>]+>','',t['intro']),'url':url,'kind':'page','keywords':'dealer distributor wholesale application volume business retail questionnaire'})
 p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
p=root/'sitemap.xml';s=p.read_text();s=re.sub(r'<url><loc>[^<]*dealer-application/[^<]*</loc></url>','',s)
s=s.replace('</urlset>',''.join('<url><loc>https://www.mtelkinc.com'+('' if l=='en' else '/'+l)+'/dealer-application/</loc></url>' for l in copy)+'</urlset>');p.write_text(s)
print(f'Built four {len(schema["fields"])}-field Dealer or Distributor applications, receipt targets, print/review controls and discovery links.')

# Keep dealer discovery and existing program videos beside the generated application CTA.
import runpy
runpy.run_path('scripts/build-dealer-start.py')
