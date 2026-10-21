"""Read-only checks of the released guide, all 12 cards and control assets."""
from pathlib import Path
import concurrent.futures, hashlib, json, urllib.request

origin = 'https://www.mtelkinc.com'
pdf = '/downloads/mtelkinc-multilingual-distributor-guide.pdf'
paths = [prefix + route for prefix in ['', '/fr', '/es', '/de'] for route in ['/dealers/us/', '/canada/', '/international/']]

def read(path):
    with urllib.request.urlopen(urllib.request.Request(origin + path, headers={'Cache-Control':'no-cache'}), timeout=45) as response:
        return response.status, response.headers.get('Content-Type', ''), response.read()

def check(path):
    status, mime, body = read(path)
    assert status == 200 and 'text/html' in mime, path
    text = body.decode()
    assert text.count('id="distributor-guide"') == 1 and 'data-guide-native' in text and pdf in text, path
    assert '/document-viewer.js' in text and '/distributor-guide.js' in text, path
    return {'path':path, 'status':status, 'guide_card':True}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    cards = list(executor.map(check, paths))
status, mime, body = read(pdf)
sha = hashlib.sha256(body).hexdigest()
assert status == 200 and mime.startswith('application/pdf') and body.startswith(b'%PDF')
assert sha == '6d77900619e928b144773bc37912b179d8c324ea5aea58779a7e1074013dd9f1'
for asset in ['/distributor-guide.js', '/distributor-guide.css', '/document-viewer.js']:
    assert read(asset)[0] == 200
result = {'origin':origin,'cards':cards,'pdf':{'path':pdf,'status':status,'content_type':mime,'bytes':len(body),'sha256':sha}}
Path('reports/distributor-guide-live-results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
