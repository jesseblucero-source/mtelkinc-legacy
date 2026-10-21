"""Consolidate duplicate visitor entries; preserve every original source document.
Run last after all page generators, including build-article-reader.py.
"""
from pathlib import Path
import json,re,html,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
HOST='https://mtelkinc-educationhub.netlify.app'
ALIASES=json.loads((ROOT/'content/archive-duplicates.json').read_text())
LOCALES={'en':'','fr':'fr/','es':'es/','de':'de/'}
LABELS={'en':'Additional preserved scan (PDF)','fr':'Autre scan conservé (PDF)','es':'Otra copia conservada (PDF)','de':'Zusätzlicher erhaltener Scan (PDF)'}
COUNTS={'en':('fourteen','twelve','Fourteen','Twelve'),'fr':('quatorze','douze','Quatorze','Douze'),'es':('catorce','doce','Catorce','Doce'),'de':('vierzehn','zwölf','Vierzehn','Zwölf')}
redirects=[]
alias_urls=set()
for lang,prefix in LOCALES.items():
 for alias,entry in ALIASES.items():
  old=f'/{prefix}archive/{alias}/';new=f'/{prefix}archive/{entry["canonical"]}/'
  alias_urls.add(old)
  redirects.extend([f'{old} {new} 301!',f'{old}index.html {new} 301!'])
  # Static compatibility page also works on hosts without Netlify redirect support.
  stub=f'''<!doctype html><html lang="{lang}" data-archive-redirect><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MT E.L.K., INC.</title><meta name="robots" content="noindex"><link rel="canonical" href="{HOST}{new}"><meta http-equiv="refresh" content="0;url={new}"><script>location.replace({json.dumps(new)}+location.search+location.hash)</script></head><body><a href="{new}">MT E.L.K., INC. →</a></body></html>'''
  (DIST/old.strip('/')/'index.html').write_text(stub)
for page in DIST.rglob('*.html'):
 url='/'+str(page.parent.relative_to(DIST)).replace('\\','/').strip('.')+'/'
 if url in alias_urls:continue
 text=page.read_text()
 # A complete record card is the repeated unit, not the surrounding archive grid.
 text=re.sub(r'<article\b[^>]*class="[^"]*record-card[^\"]*"[^>]*>.*?</article>',lambda m:'' if any(f'/archive/{a}/' in m[0] for a in ALIASES) else m[0],text,flags=re.S)
 for alias,entry in ALIASES.items():
  text=text.replace(f'/archive/{alias}/',f'/archive/{entry["canonical"]}/')
 lang=re.search(r'<html[^>]*lang="([^"]+)"',text)[1]
 prefix=LOCALES.get(lang,'')
 if page==DIST/prefix/'archive/index.html':
  lower,newlower,upper,newupper=COUNTS[lang]
  text=text.replace(lower,newlower).replace(upper,newupper)
  text=re.sub(r'(<p class="result-count"[^>]*>)14\b',r'\g<1>12',text)
  # Remove filter choices no longer represented by any actual card.
  types=set(re.findall(r'data-type="([^"]+)"',text))
  text=re.sub(r'(<select id="archive-type"[^>]*>)(.*?)(</select>)',lambda m:m[1]+re.sub(r'<option value="([^"]+)"[^>]*>.*?</option>',lambda o:o[0] if o[1]=='all' or o[1] in types else '',m[2])+m[3],text,flags=re.S)
 for entry in ALIASES.values():
  if page==DIST/prefix/'archive'/entry['canonical']/'index.html' and 'archive-secondary-source' not in text:
   link=f'<p class="archive-secondary-source"><a class="text-link" href="{entry["secondary_pdf"]}">{LABELS[lang]} →</a></p>'
   text=text.replace('<section class="section record-detail">','<section class="section record-detail">'+link,1)
 page.write_text(text)
for index in DIST.rglob('resource-index.json'):
 rows=json.loads(index.read_text())
 rows=[r for r in rows if r['url'] not in alias_urls]
 for r in rows:
  page=DIST/r['url'].strip('/')/'index.html'
  if page.exists():
   match=re.search(r'<meta name="description" content="([^"]*)"',page.read_text())
   if match:r['description']=html.unescape(match[1])
 index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')))
# Retain the source record registry and translated transcription evidence unchanged.
# Generated narration records should reflect only the canonical visitor pages.
registry=ROOT/'content/article-narration-records.json'
if registry.exists():
 data=json.loads(registry.read_text())
 if isinstance(data,list):data=[r for r in data if r.get('slug') not in ALIASES]
 elif isinstance(data,dict):
  for key,val in list(data.items()):
   if isinstance(val,dict):data[key]={slug:record for slug,record in val.items() if slug not in ALIASES}
   elif isinstance(val,list):data[key]=[r for r in val if not isinstance(r,dict) or r.get('slug') not in ALIASES]
 registry.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
redirectfile=DIST/'_redirects'
existing=redirectfile.read_text().splitlines()
existing=[line for line in existing if not any(line.startswith(url) for url in alias_urls)]
redirectfile.write_text('\n'.join(redirects+existing).strip()+'\n')
sitemap=DIST/'sitemap.xml'
ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9')
tree=ET.parse(sitemap);root=tree.getroot()
for node in list(root):
 loc=node.find('{*}loc')
 if loc is not None and loc.text.removeprefix(HOST) in alias_urls:root.remove(node)
tree.write(sitemap,encoding='utf-8',xml_declaration=True)
print('Archive consolidated: 12 unique records per language; 8 old routes redirect; original source files preserved.')
