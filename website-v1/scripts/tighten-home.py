from pathlib import Path
from html import escape
import json,re
root=Path('dist');texts=json.loads(Path('content/home-tightening.json').read_text())
for lang,t in texts.items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'index.html';s=p.read_text()
 s=re.sub(r'<main id="main"(?: class="home-tight")?>','<main id="main" class="home-tight">',s,count=1)
 s=re.sub(r'(<p class="hero-intro">).*?(</p>)',lambda m:m[1]+escape(t['hero'])+m[2],s,count=1,flags=re.S)
 # Remove duplicated finder and international teaser; full navigation and destination sections remain.
 s=re.sub(r'<div class="home-finder">.*?</div><a\b.*?</a></div>','',s,flags=re.S)
 s=re.sub(r'<div class="home-story-forward">.*?</div><a\b.*?</a></div>','',s,flags=re.S)
 s=re.sub(r'<div class="values-strip">.*?</div>','',s,flags=re.S)
 start=s.index('<section class="section home-pathways"');end=s.index('</section>',start)+10;part=s[start:end]
 cards=list(re.finditer(r'<article class="lesson-detail-card">.*?</article>',part,re.S))
 if len(cards)==4:part=part[:cards[-1].start()]+part[cards[-1].end():]
 part=re.sub(r'(</div><p>).*?(</p></div>)',lambda m:m[1]+escape(t['paths'])+m[2],part,count=1,flags=re.S);s=s[:start]+part+s[end:]
 start=s.index('<section class="story section');end=s.index('</section>',start)+10;part=s[start:end]
 part=re.sub(r'(<h2 id="story-title">.*?</h2><p>).*?(</p>)',lambda m:m[1]+escape(t['story'])+m[2],part,count=1,flags=re.S);s=s[:start]+part+s[end:]
 start=s.index('<section class="section home-story-people"');end=s.index('</section>',start)+10;part=s[start:end]
 part=re.sub(r'(</div><p>).*?(</p></div>)',lambda m:m[1]+escape(t['people'])+m[2],part,count=1,flags=re.S)
 cards=list(re.finditer(r'<article class="lesson-detail-card">.*?</article>',part,re.S));assert len(cards)==4
 for i,m in reversed(list(enumerate(cards))):
  card=re.sub(r'(</h3><p>).*?(</p>)',lambda n:n[1]+escape(t['bios'][i])+n[2],m[0],count=1,flags=re.S);part=part[:m.start()]+card+part[m.end():]
 s=s[:start]+part+s[end:];p.write_text(s)
print('Tightened four homepages while preserving Shop, lessons, source records and international links.')
