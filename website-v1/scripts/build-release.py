"""Repeatable closeout build on the retained V1 site; never rewrites the V1 Git tag."""
from pathlib import Path
import runpy,hashlib,json,re,sys,os
root=Path(__file__).resolve().parents[1];os.chdir(root)
(root/'empty-functions').mkdir(exist_ok=True)
assert not list((root/'empty-functions').glob('*.mts')),'SMTP activation requires an explicit functions release.'
assert (root/'dist/index.html').is_file(),'Restore the website-v1/dist baseline from GitHub tag v1.0.0 before building.'
protected={str(p.relative_to(root/'dist')):hashlib.sha256(p.read_bytes()).hexdigest() for directory in ['records','downloads'] for p in (root/'dist'/directory).rglob('*') if p.is_file()}
# Restore individual style sources before builders remove/reorder their own links.
restore=runpy.run_path(str(root/'scripts/optimize-delivery.py'))['restore']
for page in (root/'dist').rglob('index.html'):page.write_text(restore(page.read_text()))
# Semantic grouping for labeled combined filters across language editions.
for page in (root/'dist').rglob('index.html'):
 html=page.read_text();html=re.sub(r'<div class="education-active-filters"(?! role=)', '<div class="education-active-filters" role="group"',html);page.write_text(html)
for name in ['build-university.py','build-home-delivery.py']:
 runpy.run_path(str(root/'scripts'/name),run_name='__main__')
keeper=root/'scripts/keep-videos-on-site.py'
assert keeper.exists(),'Missing on-site video preservation script.'
runpy.run_path(str(keeper),run_name='__main__')
for name in ['expand-netlify.py','build-video-compatibility.py','build-document-viewer.py']:
 runpy.run_path(str(root/'scripts'/name),run_name='__main__')
# Refresh search descriptions for all languages, preserving resource records and URLs.
for index in (root/'dist').rglob('resource-index.json'):
 rows=json.loads(index.read_text())
 for row in rows:
  page=root/'dist'/row['url'].strip('/')/'index.html'
  if not page.exists():continue
  html=page.read_text();title=re.search(r'<title>(.*?)</title>',html,re.S);desc=re.search(r'<meta name="description" content="([^"]*)"',html)
  from html import unescape
  if title:row['title']=unescape(title[1]).split(' | ')[0]
  if desc:row['description']=unescape(desc[1])
 index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
# Canonical, hreflang, OG and site schema point to the production domain.
for page in (root/'dist').rglob('index.html'):
 html=page.read_text();head,sep,body=html.partition('</head>')
 if sep:page.write_text(head.replace('https://mtelkinc-educationhub.netlify.app','https://www.mtelkinc.com')+sep+body)
p=root/'dist/sitemap.xml';p.write_text(p.read_text().replace('https://mtelkinc-educationhub.netlify.app','https://www.mtelkinc.com'))
optimizer=root/'scripts/optimize-delivery.py'
source=optimizer.read_text().replace("root=Path(__file__).resolve().parent.parent;dist=root/'dist'","root=Path.cwd();dist=root/'dist'")
exec(compile(source,str(optimizer),'exec'),{'__name__':'__main__'})
for path,sha in protected.items():assert hashlib.sha256((root/'dist'/path).read_bytes()).hexdigest()==sha,'Original document changed: '+path
release={'name':'MT E.L.K., INC.','version':'1.1.1','baseline':'v1.0.0','scope':'Homepage responsive hero delivery and English initialization optimization; SMTP activation separately gated.'}
(root/'dist/build-info.json').write_text(json.dumps(release,indent=2)+'\n')
(root/'reports/closeout-build.json').write_text(json.dumps({'version':'1.1.1','original_documents_verified':len(protected),'stages':['home-delivery','guided-university','keep-videos-on-site','resource-index','video-compatibility','document-viewer','canonical','delivery']},indent=2)+'\n')
print('Built 1.1.1; original source documents preserved. Run test:closeout before packaging/deploying.')
