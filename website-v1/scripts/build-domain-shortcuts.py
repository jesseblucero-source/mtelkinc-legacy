"""Generate host redirects without replacing existing page redirects or URLs."""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
import json, re, csv

project = Path(__file__).resolve().parents[1]
config = json.loads((project / 'content/domain-shortcuts.json').read_text())
root = project / 'dist'
origin = config['canonical_origin']
assert origin == 'https://www.mtelkinc.com'
begin = '# BEGIN MT E.L.K., INC. subdomain shortcuts'
end = '# END MT E.L.K., INC. subdomain shortcuts'
lines = [begin, '# Permanent host redirects; Netlify preserves incoming query parameters.']
# Canonical short links remain usable even while a separate domain awaits DNS.
# Put cross-section links before the host catch-alls so a shop-domain application
# link still reaches the application rather than an invented nested shop URL.
for lang in ['', *config['languages']]:
    prefix = '/'+lang if lang else ''
    for old in ['/apply/', '/application/']:
        lines.append(f'{prefix}{old}* {origin}{prefix}/dealer-application/:splat 301!')
    lines.append(f'{prefix}/usadealers/* {origin}{prefix}/dealers/us/:splat 301!')
    for product in json.loads((project/'content/source/store-products.json').read_text())['products']:
        source = urlsplit(product['source_url'])
        assert source.path == '/shop/' and source.fragment.endswith('/'+str(product['id']))
        destination = urlunsplit(('https','www.mtelkinc.com',prefix+source.path,source.query,source.fragment))
        for old in ['/products/', '/shop/products/']:
            lines.append(f'{prefix}{old}{product["id"]} {destination} 301!')
shortcuts = list(config['shortcuts'])
for forward in config.get('domain_forwards', []):
    if forward['hosting'] == 'main-site':
        shortcuts.extend({'host': host, 'path': forward['path']} for host in forward['hosts'])
allowed_hosts = {item['host'] for item in config['shortcuts']}
allowed_hosts.update(host for item in config.get('domain_forwards', []) for host in item['hosts'])
for shortcut in shortcuts:
    host, path = shortcut['host'], shortcut['path']
    assert host in allowed_hosts and re.fullmatch(r'[a-z.]+', host)
    assert (root / path.strip('/') / 'index.html').is_file(), path
    for scheme in ('https', 'http'):
        # Full existing paths must precede short paths, avoiding duplicate prefixes.
        for lang in config['languages']:
            localized = '/' + lang + path
            assert (root / localized.strip('/') / 'index.html').is_file(), localized
            lines.append(f'{scheme}://{host}{localized}* {origin}{localized}:splat 301!')
            lines.append(f'{scheme}://{host}/{lang}/* {origin}{localized}:splat 301!')
        lines.append(f'{scheme}://{host}{path}* {origin}{path}:splat 301!')
        lines.append(f'{scheme}://{host}/* {origin}{path}:splat 301!')
lines.append(end)
redirects = root / '_redirects'
existing = redirects.read_text() if redirects.exists() else ''
existing = re.sub(re.escape(begin) + r'.*?' + re.escape(end) + r'\n*', '', existing, flags=re.S)
redirects.write_text('\n'.join(lines) + '\n' + existing.lstrip('\n'))
report = project / 'reports/mtelkinc-subdomain-dns.csv'
with report.open('w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Type', 'Host', 'Value', 'TTL'])
    for shortcut in config['shortcuts']:
        writer.writerow(['CNAME', shortcut['host'].split('.')[0], config['dns_target'], '3600'])
print(f'Generated {len(lines)-3} routing rules and four CNAME instructions.')
