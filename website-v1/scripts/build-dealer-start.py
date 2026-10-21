"""Keep the application, original program video and verified staff lessons together."""
from pathlib import Path
from html import escape as E
import json,re,hashlib
root=Path('dist');data=json.loads(Path('content/dealer-start.json').read_text());ui=json.loads(Path('content/dealer-start-ui.json').read_text())
def poster(video,title,cta,featured=False):
 return f'<button type="button" class="dealer-film-poster'+(' featured' if featured else '')+f'" data-video="{video}" data-title="{E(title,quote=True)}" aria-label="{E(cta+": "+title,quote=True)}"><img src="https://i.ytimg.com/vi/{video}/hqdefault.jpg" width="480" height="360" alt="" loading="lazy" decoding="async"><span><b aria-hidden="true">▶</b>{E(cta)}</span></button>'
for lang,t in ui.items():
 prefix='' if lang=='en' else '/'+lang;dest=prefix+'/dealer-application/';p=root/prefix.strip('/')/'dealers/us/index.html';s=p.read_text()
 strips=re.findall(r'<section class="dealer-apply-strip".*?</section>',s,re.S)
 assert len(strips)==1,(lang,'Run the application builder first to prepare one reusable application/share block.')
 apply=strips[0];s=s.replace(apply,'');s=re.sub(r'<!-- dealer-start:start -->.*?<!-- dealer-start:end -->','',s,flags=re.S)
 # Keep the share controls next to the application; use a short, clear primary action.
 apply=re.sub(r'(<a href="'+re.escape(dest)+r'">).*?(</a>)',lambda m:m[1]+E(t['apply'])+' →'+m[2],apply,count=1,flags=re.S)
 steps='<ol class="dealer-start-steps">'+''.join('<li><span aria-hidden="true">0'+str(i)+'</span><div><h3>'+E(t['step'+str(i)+'_title'])+'</h3><p>'+E(t['step'+str(i)+'_text'])+'</p></div></li>' for i in range(1,4))+'</ol>'
 program=data['program'];featured='<article class="dealer-program-film"><div>'+poster(program['id'],t['program_title'],t['watch'],True)+'</div><div><p class="mini-label">'+E(t['program_label'])+'</p><h3>'+E(t['program_title'])+'</h3><p>'+E(t['program_desc'])+'</p><div class="dealer-start-actions"><a class="button primary" href="'+dest+'">'+E(t['apply'])+' →</a><a class="text-link" href="#dealer-resources">'+E(t['guide'])+' ↓</a></div></div></article>'
 cards=''
 for record,copy in zip(data['training'],t['training']):
  cards+='<article class="dealer-training-card">'+poster(record['id'],copy['title'],t['play'])+'<div><h3>'+E(copy['title'])+'</h3><p>'+E(copy['description'])+'</p><a class="text-link" href="'+prefix+'/education/lessons/'+record['slug']+'/">'+E(t['lesson'])+' →</a></div></article>'
 hub='<!-- dealer-start:start --><section class="section dealer-start" id="dealer-start" aria-labelledby="dealer-start-title"><header class="dealer-start-heading"><p class="eyebrow dark">'+E(t['eyebrow'])+'</p><h2 id="dealer-start-title">'+E(t['heading'])+'</h2><p>'+E(t['intro'])+'</p></header><div class="dealer-start-grid">'+apply+'<div class="dealer-step-panel"><h3>'+E(t['steps_heading'])+'</h3>'+steps+'</div></div><div id="dealer-videos" class="dealer-videos">'+featured+'<div class="dealer-staff-heading"><h3>'+E(t['videos_heading'])+'</h3><p>'+E(t['videos_note'])+'</p></div><div class="dealer-training-grid">'+cards+'</div><a class="text-link dealer-library-link" href="'+prefix+'/videos/">'+E(t['library'])+' →</a></div></section><!-- dealer-start:end -->'
 hero=re.search(r'<section class="dealer-hero">.*?</section>',s,re.S);assert hero
 updated=re.sub(r'(<div class="actions">).*?(</div>)',lambda m:m[1]+'<a class="button primary" href="'+dest+'">'+E(t['apply'])+' →</a><a class="text-link" href="#dealer-start">'+E(t['how'])+' ↓</a>'+m[2],hero[0],count=1,flags=re.S)
 s=s[:hero.start()]+updated+hub+s[hero.end():]
 s=re.sub(r'<a class="text-link" href="#dealer-contact">.*?</a>',lambda m:'<a class="text-link" href="'+dest+'">'+E(t['apply'])+' →</a>',s,flags=re.S)
 # The old single care video now belongs to the grouped training area above.
 s=re.sub(r'<div class="dealer-training">.*?</div></div>(?=</section>)','',s,flags=re.S)
 faq=re.search(r'<section class="section dealer-faq".*?</section>',s,re.S)
 if faq:
  details=list(re.finditer(r'<details>.*?</details>',faq[0],re.S));assert details
  last=details[-1];new='<details><summary>'+E(t['faq_question'])+'</summary><p>'+E(t['faq_answer'])+'</p><a class="text-link" href="'+dest+'">'+E(t['apply'])+' →</a></details>'
  s=s[:faq.start()]+faq[0][:last.start()]+new+faq[0][last.end():]+s[faq.end():]
 contact='<section class="section dealer-contact" id="dealer-contact" aria-labelledby="dealer-contact-title"><div><p class="eyebrow">MT E.L.K., INC.</p><h2 id="dealer-contact-title">'+E(t['contact_heading'])+'</h2><p>'+E(t['contact_text'])+'</p><div class="dealer-start-actions"><a class="button primary" href="'+dest+'">'+E(t['apply'])+' →</a><a class="text-link" href="mailto:office@elkinc.com">'+E(t['email'])+' →</a></div><a class="dealer-phone" href="tel:+14065178923">(406) 517-8923</a><p>office@elkinc.com<br>PO BOX 473 · Livingston, MT 59047</p></div><div><h3>'+E(t['steps_heading'])+'</h3><p>'+E(t['contact_note'])+'</p><a class="text-link" href="#dealer-videos">'+E(t['back_videos'])+' ↑</a></div></section>'
 s=re.sub(r'<section class="section dealer-contact".*?</section>',contact,s,flags=re.S)
 s=re.sub(r'<link rel="stylesheet" href="/dealer-start\.css[^"]*">','',s)
 digest=hashlib.sha256((root/'dealer-start.css').read_bytes()).hexdigest()[:12];s=s.replace('</head>','<link rel="stylesheet" href="/dealer-start.css?v='+digest+'"></head>')
 s=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',lambda m:m[1]+E(t['meta'],quote=True),s)
 s=s.replace('https://mtelkinc-educationhub.netlify.app','https://www.mtelkinc.com')
 p.write_text(s)
print('Grouped application, original dealer presentation and three verified staff videos on four localized dealer pages.')

# Homepage dealer discovery reaches the application or presentation directly.
for lang,t in ui.items():
 prefix='' if lang=='en' else '/'+lang;p=root/prefix.strip('/')/'index.html';s=p.read_text();m=re.search(r'<section class="section us-dealer-entry".*?</section>',s,re.S)
 if not m:continue
 actions='<div class="actions" data-dealer-home-start><a class="button charcoal" href="'+prefix+'/dealer-application/">'+E(t['apply'])+' →</a><a class="text-link" href="'+prefix+'/dealers/us/#dealer-videos">'+E(t['watch'])+' →</a></div>'
 part=m[0]
 if 'data-dealer-home-start' in part:part=re.sub(r'<div class="actions" data-dealer-home-start>.*?</div>',actions,part,flags=re.S)
 else:part=re.sub(r'<a class="button charcoal" href="'+re.escape(prefix)+'/dealers/us/">.*?</a>',actions,part,flags=re.S)
 s=s[:m.start()]+part+s[m.end():];p.write_text(s)
