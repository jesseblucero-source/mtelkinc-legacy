from pathlib import Path
from html import escape
import json,re
root=Path('dist');texts=json.loads(Path('content/about-tightening.json').read_text())
slugs=['cow-call-draws-elk','more-exposition','founder-record']
for lang,t in texts.items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'about/index.html';s=p.read_text()
 s=re.sub(r'<main id="main"(?: class="about-tight")?>','<main id="main" class="about-tight">',s,count=1)
 s=re.sub(r'(<p class="hero-intro">).*?(</p>)',lambda m:m[1]+escape(t['hero'])+m[2],s,count=1,flags=re.S)
 s=re.sub(r'(<p class="about-manufacturer-intro">).*?(</p>)',lambda m:m[1]+escape(t['manufacturer'])+m[2],s,count=1,flags=re.S)
 start=s.index('<section class="section about-manufacturer"');end=s.index('</section>',start)+10;part=s[start:end]
 part=re.sub(r'<div class="about-purpose-grid">.*?</article></div>','',part,flags=re.S)
 part=re.sub(r'<div class="about-manufacturer-actions">.*?</div>','',part,flags=re.S)
 actions=f'<div class="about-manufacturer-actions"><a class="button primary" href="{prefix}/shop/">{t["shop"]} →</a><a class="text-link" href="{prefix}/education/">{t["learn"]} →</a><a class="text-link" href="{prefix}/support/">{t["support"]} →</a></div>'
 part=part.replace('</section>',actions+'</section>');s=s[:start]+part+s[end:]
 s=re.sub(r'<div class="resource-save-bar">.*?</div>\s*','',s,count=1,flags=re.S)
 s=re.sub(r'<div class="values-strip">.*?</div>\s*','',s,count=1,flags=re.S)
 start=s.index('<section class="origin section"');end=s.index('</section>',start)+10;part=s[start:end];paragraph=iter(t['origin']);i=[0]
 def origin(m):
  i[0]+=1
  if i[0]<=2:return m[1]+escape(next(paragraph))+m[2]
  return ''
 part=re.sub(r'(<p(?: class="lead")?>).*?(</p>)',origin,part,flags=re.S);s=s[:start]+part+s[end:]
 start=s.index('<section class="history section"');end=s.index('<ol class="timeline">',start);part=s[start:end]
 part=re.sub(r'(</div><p>).*?(</p></div>)',lambda m:m[1]+escape(t['timeline'])+m[2],part,count=1,flags=re.S);s=s[:start]+part+s[end:]
 # Use each card's own source and archive entry.
 cards=list(re.finditer(r'<article class="record-card">.*?</article>',s,re.S));assert len(cards)==3
 for i,m in reversed(list(enumerate(cards))):
  card=m[0];card=re.sub(r'(<details class="about-source-context"><summary>.*?</summary><p>).*?(</p></details>)',lambda n:n[1]+escape(t['contexts'][i])+n[2],card,flags=re.S)
  card=re.sub(r'(class="text-link about-archive-link" href=")[^"]*',lambda n:n[1]+prefix+'/archive/'+slugs[i]+'/',card)
  s=s[:m.start()]+card+s[m.end():]
 for meta in ['name="description"','property="og:description"']:
  s=re.sub(r'<meta '+meta+r'[^>]*>','<meta '+meta+' content="'+escape(t['hero'],quote=True)+'">',s)
 p.write_text(s)
 index=root/prefix.strip('/')/'resource-index.json';rows=json.loads(index.read_text())
 for r in rows:
  if r.get('url')==prefix+'/about/':r['description']=t['hero']
 index.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
print('Tightened four About pages; corrected archive context and matching record links.')
