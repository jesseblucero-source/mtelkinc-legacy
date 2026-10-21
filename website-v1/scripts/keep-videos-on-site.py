from pathlib import Path
import re,html,json
from urllib.parse import urlparse,parse_qs
chapters={525:'doe-call',990:'band-tension',1927:'dry-bands',1962:'rhythm',2422:'field-response'}
import runpy
if 'id="video-model"' not in Path('dist/videos/index.html').read_text():
 runpy.run_path('scripts/expand-video-library.py')
removed=0;changed=0
for p in list(Path('dist').rglob('index.html'))+[Path('templates/footer.html')]:
 s=p.read_text()
 def anchor(m):
  global removed,changed
  tag=m.group(0);href=re.search(r'href="([^"]*)"',tag)
  ident=re.search(r'\bid="([^"]+)"',tag)
  if ident and ident.group(1) in ['youtube-fallback','canada-youtube','player-youtube']:
   removed+=1;return ''
  if not href:return tag
  url=html.unescape(href.group(1));parsed=urlparse(url)
  if parsed.netloc.lower() not in ['www.youtube.com','youtube.com','youtu.be','www.youtu.be']:return tag
  label=re.sub('<[^>]+>','',tag).strip()
  # Existing embedded controls already cover the redundant external alternatives.
  if re.search(r'Open on YouTube|Watch.*on YouTube|YouTube [Aa]lternative|YouTube at|YouTube Alternative|direct YouTube',label):
   removed+=1;return ''
  params=parse_qs(parsed.query);vid=params.get('v',[''])[0]
  if parsed.netloc.endswith('youtu.be'):vid=parsed.path.strip('/')
  start=params.get('t',['0'])[0].rstrip('s');start=int(start) if start.isdigit() else 0
  if vid=='7Z9QTyJRFuY':dest='/education/deer-calling/'+('#'+chapters[start] if start in chapters else '')
  elif vid=='KHT1o03dH-0':dest='/canada/presentation/#slide-4'
  elif re.fullmatch(r'[A-Za-z0-9_-]{11}',vid):dest='/videos/watch/'+vid+'/'+('?start='+str(start) if start else '')
  else:dest='/videos/'
  tag=tag.replace(href.group(0),'href="'+html.escape(dest,quote=True)+'"');tag=re.sub(r'\s(?:target|rel)="[^"]*"','',tag)
  tag=tag.replace('Visit Our YouTube Channel','Watch Videos Here').replace('Visit the Channel ↗','Browse Videos →').replace('YouTube ↗','On-site Videos →').replace('View the complete uploads playlist ↗','Browse the Video Library →')
  changed+=1;return tag
 s=re.sub(r'<a\b[^>]*>.*?</a>',anchor,s,flags=re.S)
 for old,new in [
 ('Explore MT E.L.K., INC.’s YouTube channel for calling demonstrations, techniques, and advice from the field.','Explore calling demonstrations, call care, and field videos in the on-site library.'),
 ('Watch the channel video here, or use the direct YouTube link. Use the source video for its demonstrations and commentary.','Watch this video in the embedded player. Follow the source demonstrations and commentary at your own pace.'),
 ('View this MT E.L.K., INC. channel video, or open the YouTube alternative.','Watch this MT E.L.K., INC. channel video in the embedded player.'),
 ('Load the player when ready, or use the direct YouTube alternative.','Load the embedded player when ready.'),
 ('Use the direct YouTube link if the embedded player is unavailable.','Close and reopen the embedded player if you need to retry playback.'),
 ('The source film is in English. The linked film is in English.','The source film is in English.'),
 ('Use the Open on YouTube links to watch. Search, categories, and the on-site player require JavaScript.','Enable JavaScript to use the embedded video player. Video pages remain available for browsing.'),
 ('Source film in English • Written French guide also available','Source film in English • Written French guide also available')]:s=s.replace(old,new)
 s=re.sub(r'<a href="/videos/">On-site Videos →</a>','',s)
 s=s.replace('Each lesson offers a direct YouTube alternative. Open that link to watch the source video outside the embedded player.','Close and reopen the embedded player to retry. If it still cannot play, contact the office with the video or lesson name.')
 p.write_text(s)
# External alternative elements are no longer part of the interface.
p=Path('dist/learn.js');s=p.read_text();s=re.sub(r"^.*getElementById\('youtube-fallback'\).*\n",'',s,flags=re.M);s=s.replace("button.dataset.start || '0'", "button.dataset.start || new URLSearchParams(location.search).get('start') || '0'");s=s.replace("&autoplay=0&playsinline=1'","&autoplay=0&playsinline=1&rel=0'");p.write_text(s)
p=Path('dist/media.js');s=p.read_text();s=re.sub(r"^.*getElementById\('player-youtube'\).*\n",'',s,flags=re.M);p.write_text(s)
p=Path('dist/canada.js');s=p.read_text();s=re.sub(r"document.querySelector\('#canada-youtube'\)\.href=`[^`]+`;",'',s);s=s.replace('&autoplay=0&playsinline=1`','&autoplay=0&playsinline=1&rel=0`');p.write_text(s)
print('Removed',removed,'external video alternatives; routed',changed,'source/channel links internally.')
