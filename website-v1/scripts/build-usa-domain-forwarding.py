"""Build a standalone redirect deploy for the existing U.S. dealer Netlify site."""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
import json

project = Path(__file__).resolve().parents[1]
config = json.loads((project/'content/domain-shortcuts.json').read_text())
forward = next(item for item in config['domain_forwards'] if item['domain']=='mtelkincusa.com')
origin = config['canonical_origin']
root = project/'domain-forwarding/usadealers'
root.mkdir(parents=True, exist_ok=True)
lines = ['# MT E.L.K., INC. — U.S. dealer domain forwarding', '# Keep old product links connected to verified catalog products.']
products = json.loads((project/'content/source/store-products.json').read_text())['products']
for product in products:
    source = urlsplit(product['source_url'])
    assert source.path=='/shop/' and source.fragment.endswith('/'+str(product['id']))
    destination = urlunsplit(('https','www.mtelkinc.com',source.path,source.query,source.fragment))
    lines.append(f'/products/{product["id"]} {destination} 301!')
for lang in ['', *config['languages']]:
    prefix = '/'+lang if lang else ''
    for old in ['/apply/', '/application/', '/dealer-application/']:
        lines.append(f'{prefix}{old}* {origin}{prefix}/dealer-application/:splat 301!')
    lines.append(f'{prefix}/shop/* {origin}{prefix}/shop/:splat 301!')
    lines.append(f'{prefix}{forward["path"]}* {origin}{prefix}{forward["path"]}:splat 301!')
    if lang:
        lines.append(f'/{lang}/* {origin}/{lang}{forward["path"]} 301!')
# URL fragments are carried by the browser; the server never receives them.
# Preserve queries and send unknown old
# routes to the dealer landing page rather than a non-existent nested page.
lines.append(f'/* {origin}{forward["path"]} 301!')
(root/'_redirects').write_text('\n'.join(lines)+'\n')
(root/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>U.S. Dealers | MT E.L.K., INC.</title><link rel="canonical" href="https://www.mtelkinc.com/dealers/us/"><style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#220401;color:#faf6f2;font:18px/1.6 system-ui}main{padding:32px;max-width:680px}p:first-child{color:#ff7d55;letter-spacing:.12em;font-weight:700}h1{font:700 clamp(2rem,7vw,4rem)/1.1 Georgia,serif}a{display:inline-block;background:#ef431f;color:#0d1510;padding:16px 24px;font-weight:800;text-decoration:none}a:focus-visible{outline:3px solid white;outline-offset:5px}</style></head><body><main><p>MT E.L.K., INC.</p><h1>U.S. dealers.<br>One place to get started.</h1><p>Dealer information, training resources, and the dealer or distributor application are now together on our main website.</p><a href="https://www.mtelkinc.com/dealers/us/">Continue to U.S. dealers →</a></main></body></html>''')
(root/'netlify.toml').write_text('[build]\n  publish = "."\n')
print(f'Generated U.S. domain forwarding and {len(products)} verified product redirects.')
