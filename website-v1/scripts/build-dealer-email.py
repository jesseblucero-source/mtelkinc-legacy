"""Self-host lazy PDF dependencies and refresh the application module imports."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,os
node=os.environ.get('NODE_BINARY') or shutil.which('node') or '/Users/vegastopmarketers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
root=Path('dist');built=json.loads(subprocess.check_output([node,'scripts/build-dealer-pdf-vendor.cjs'],text=True));vendor=root/built['directory']
for source,name in [('node_modules/pdf-lib/LICENSE.md','pdf-lib-LICENSE.md'),('node_modules/@pdf-lib/fontkit/LICENSE.md','fontkit-LICENSE.md')]:
 if Path(source).exists():shutil.copyfile(source,vendor/name)

for source in ['node_modules/@pdf-lib/fontkit/README.md','node_modules/@pdf-lib/fontkit/package.json','node_modules/pako/LICENSE','node_modules/@pdf-lib/standard-fonts/LICENSE.md','node_modules/@pdf-lib/upng/LICENSE','node_modules/tslib/LICENSE.txt']:
 if Path(source).exists():shutil.copyfile(source,vendor/(source.replace('node_modules/','').replace('/','-')))
p=root/'dealer-pdf.js';s=p.read_text();s=re.sub(r"\./vendor/dealer-pdf[^']*/(?:ENGINE|engine)\.js",'./vendor/'+vendor.name+'/engine.js',s);p.write_text(s)
digest=lambda name:hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
p=root/'dealer-email.js';s=p.read_text();s=re.sub(r'dealer-pdf\.js\?v=[A-Za-z0-9_]+','dealer-pdf.js?v='+digest('dealer-pdf.js'),s);p.write_text(s)
p=root/'dealer-application.js';s=p.read_text();s=re.sub(r'dealer-email\.js\?v=[A-Za-z0-9_]+','dealer-email.js?v='+digest('dealer-email.js'),s);p.write_text(s)
p=root/'_headers';s=p.read_text() if p.exists() else '';rule='/vendor/'+vendor.name+'/*';
if rule not in s:s+='\n'+rule+'\n  Cache-Control: public, max-age=31536000, immutable\n'
p.write_text(s)
Path('content/dealer-pdf-vendor.json').write_text(json.dumps({'libraries':{'pdf-lib':json.loads(Path('node_modules/pdf-lib/package.json').read_text())['version'],'@pdf-lib/fontkit':json.loads(Path('node_modules/@pdf-lib/fontkit/package.json').read_text())['version']},'directory':'/'+vendor.relative_to(root).as_posix(),'engine_bytes':(vendor/'engine.js').stat().st_size,'engine_sha256':hashlib.sha256((vendor/'engine.js').read_bytes()).hexdigest(),'font':'/assets/roboto-application-pdf-8c6f2880cb24.ttf','font_source':'/assets/roboto-400.woff2 (preserved; derived TrueType file for PDF embedding)','loading':'Only after an applicant requests a PDF. All answers remain in browser memory; no PDF service receives them.'},indent=2)+'\n')
