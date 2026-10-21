"""Run after video/page builders. Keep official privacy-enhanced players on site."""
from pathlib import Path
import hashlib,re
root=Path('dist')
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
controllers=['learn','education-hub','media','canada','store']
for name in controllers:
 p=root/(name+'.js');s=p.read_text()
 s=re.sub(r"import \{configureYouTubePlayer\} from './youtube-player\.js(?:\?[^']*)?';\n?",'',s)
 # Remove our prior call before rebuilding, then normalize each embed source assignment.
 s=re.sub(r'configureYouTubePlayer\((?:iframe|player|frame)\);','',s)
 pattern=r"((iframe|player|frame)\.src\s*=\s*(?:'https://www\.youtube-nocookie\.com/embed/'[^;]*|`https://www\.youtube-nocookie\.com/embed/[^`]*`);)"
 s,n=re.subn(pattern,lambda m:m[1]+'configureYouTubePlayer('+m[2]+');',s)
 assert n==1,(name,n)
 s="import {configureYouTubePlayer} from './youtube-player.js?v="+digest('youtube-player.js')+"';\n"+s
 p.write_text(s)
p=root/'_headers';s=p.read_text()
if '  Referrer-Policy: strict-origin-when-cross-origin' not in s:
 s=s.replace('/*\n','/*\n  Referrer-Policy: strict-origin-when-cross-origin\n',1)
p.write_text(s)
for p in root.rglob('index.html'):
 s=p.read_text()
 s=re.sub(r'<link rel="stylesheet" href="/video-compatibility\.css[^"]*">','',s)
 if any('/'+name+'.js' in s for name in controllers):
  s=s.replace('</head>','<link rel="stylesheet" href="/video-compatibility.css?v='+digest('video-compatibility.css')+'"></head>')
 for name in [x+'.js' for x in controllers]+['learn.css','store.css']:
  # Shared imports and page entry points keep their existing script types and layout.
  s=re.sub(r'(/'+re.escape(name)+r')(?:\?v=[a-f0-9]+)?',lambda m:m[1]+'?v='+digest(name),s)
 p.write_text(s)
print('Normalized identity on five official embed controllers; refreshed page assets and phone player minimums.')
