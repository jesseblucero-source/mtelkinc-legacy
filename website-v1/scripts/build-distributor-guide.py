"""Publish the approved distributor PDF with localized, shareable download cards."""
from pathlib import Path
from html import escape as E
from urllib.parse import quote
import hashlib, json, re, shutil

project = Path(__file__).resolve().parents[1]
root = project / 'dist'
source = project / 'source-documents/MT E.L.K., INC. - Multilingual Support and Distributor Partnership.pdf'
filename = 'mtelkinc-multilingual-distributor-guide.pdf'
url = '/downloads/' + filename
absolute = 'https://www.mtelkinc.com' + url
target = root / url.lstrip('/')
target.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(source, target)
copy = json.loads((project / 'content/distributor-guide.json').read_text())
size = f'{source.stat().st_size / 1000000:.1f} MB'
digest = lambda name: hashlib.sha256((root / name).read_bytes()).hexdigest()[:12]
for lang, t in copy.items():
    prefix = '' if lang == 'en' else lang + '/'
    for route in ['dealers/us/', 'canada/', 'international/']:
        page = root / prefix / route / 'index.html'
        s = page.read_text()
        s = re.sub(r'<!-- distributor-guide:start -->.*?<!-- distributor-guide:end -->', '', s, flags=re.S)
        card = f'''<!-- distributor-guide:start --><section class="distributor-guide" id="distributor-guide" aria-labelledby="distributor-guide-title">
<div class="distributor-guide-copy"><p class="distributor-guide-eyebrow">MT E.L.K., INC. / {E(t['eyebrow'])}</p><h2 id="distributor-guide-title">{E(t['title'])}</h2><p>{E(t['description'])}</p><p class="distributor-guide-format">{E(t['format'])} · PDF · 5 {E(t['pages'])} · {size}</p></div>
<div class="distributor-guide-tools"><div class="distributor-guide-actions"><a class="distributor-guide-download" href="{url}" download="{filename}">{E(t['download'])} <span aria-hidden="true">↓</span></a><a class="distributor-guide-preview" data-document-title="{E(t['share_title'],quote=True)}" href="{url}">{E(t['preview'])}</a></div>
<div class="distributor-guide-share" data-guide-share data-title="{E(t['share_title'],quote=True)}" data-copied="{E(t['copied'],quote=True)}" data-manual="{E(t['manual'],quote=True)}" data-shared="{E(t['shared'],quote=True)}">
<label for="distributor-guide-link">{E(t['share_label'])}</label><input id="distributor-guide-link" type="url" value="{absolute}" readonly spellcheck="false">
<div class="distributor-guide-share-actions"><button type="button" data-guide-native hidden>{E(t['share'])}</button><button type="button" data-guide-copy hidden>{E(t['copy'])}</button><a data-no-fade href="https://wa.me/?text={quote(t['share_title'] + ' ' + absolute, safe='')}">WhatsApp</a><a data-no-fade href="mailto:?subject={quote(t['share_title'],safe='')}&amp;body={quote(t['email_body'] + chr(10) + absolute,safe='')}">{E(t['email'])}</a></div><p class="distributor-guide-status" role="status" aria-live="polite"></p></div><p class="distributor-guide-note">{E(t['note'])}</p></div></section><!-- distributor-guide:end -->'''
        if route == 'dealers/us/':
            marker = '<div id="dealer-videos"'
            assert marker in s
            s = s.replace(marker, card + marker, 1)
        else:
            main = s.index('<main')
            end = s.index('</section>', main) + len('</section>')
            s = s[:end] + card + s[end:]
        for name, tag in [('distributor-guide.css','link'),('distributor-guide.js','script')]:
            s = re.sub(r'<link rel="stylesheet" href="/'+re.escape(name)+r'[^\"]*">', '', s)
            s = re.sub(r'<script type="module" src="/'+re.escape(name)+r'[^\"]*"></script>', '', s)
        s = s.replace('</head>', f'<link rel="stylesheet" href="/distributor-guide.css?v={digest("distributor-guide.css")}"></head>')
        s = s.replace('</body>', f'<script type="module" src="/distributor-guide.js?v={digest("distributor-guide.js")}"></script></body>')
        page.write_text(s)
router = root / 'page-transitions.js'
s = router.read_text()
if "'distributor-guide'" not in s:
    s = s.replace("'dealer-share'", "'dealer-share','distributor-guide'", 1)
router.write_text(s)
print('Added distributor PDF download, preview and sharing to 12 localized business pages.')
import runpy
runpy.run_path(str(project/'scripts/build-business-guides.py'))
