"""Version the shared music modules after player edits without regenerating page content."""
from pathlib import Path
import hashlib,re
root=Path(__file__).resolve().parents[1]/'dist'
def digest(name):return hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
p=root/'music-player.js';s=p.read_text();s=re.sub(r"from './music-share\.js(?:\?[^']*)?'", "from './music-share.js?v="+digest('music-share.js')+"'",s);s=re.sub(r"style.href='/soundscape\.css(?:\?[^']*)?'", "style.href='/soundscape.css?v="+digest('soundscape.css')+"'",s);p.write_text(s)
p=root/'script.js';s=p.read_text();s=re.sub(r"import\('/music-player\.js(?:\?[^']*)?'\)", "import('/music-player.js?v="+digest('music-player.js')+"')",s);p.write_text(s)
count=0
for p in root.rglob('index.html'):
 s=p.read_text();updated=re.sub(r'src="/script\.js(?:\?[^\"]*)?"','src="/script.js?v='+digest('script.js')+'"',s)
 if updated!=s:p.write_text(updated);count+=1
print('Updated shared player asset versions on',count,'pages. No page content or source-video links regenerated.')
