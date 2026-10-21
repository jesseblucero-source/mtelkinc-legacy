# -*- coding: utf-8 -*-
from pathlib import Path
from html.parser import HTMLParser
import json,re,os
for k,v in {'ARGOS_PACKAGES_DIR':'/private/tmp/mt-elk-argos/packages','XDG_DATA_HOME':'/private/tmp/mt-elk-argos/data','XDG_CACHE_HOME':'/private/tmp/mt-elk-argos/cache','XDG_CONFIG_HOME':'/private/tmp/mt-elk-argos/config'}.items():os.environ[k]=v
import argostranslate.package as package
import ctranslate2
root=Path('dist');folder=Path('content/translations');source=Path('content/source')
strings=set(json.loads((source/'translations/fr.json').read_text()))
class Strings(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
  attrs=dict(a)
  for k,v in a:
   if v and (k in ['aria-label','alt','title','placeholder','data-search'] or t=='meta' and k=='content' and (attrs.get('name')=='description' or attrs.get('property') in ['og:title','og:description'])):strings.add(v.strip())
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,t):
  if not self.skip and t.strip():strings.add(t.strip())
for p in root.rglob('index.html'):
 if p.relative_to(root).parts[0] not in ['fr','es','de']:Strings().feed(p.read_text())
records=json.loads((source/'archive-records.json').read_text())
for r in records:strings.add(r['description'])
names=['MT E.L.K., INC.','E.L.K., Inc.','Don Laubach','Gordon Eastman','Mark Henckel','T. Phillip Bowers','Cow Talk','Deluxe Cow Talk','Deer Talk','Deer Stopper','Antelope Talk','Power Bugle','Royal Bugle','Power Howler','Yote Buster','Yote Howler','The Wolf Howler','How to Talk to the Deer','Elk Talk','Stop Em In Their Tracks']+[r['name'] for r in json.loads((source/'calls.json').read_text())]
glossary={'game-call manufacturer':'Hersteller von Wildlockern','game calls':'Wildlocker','calling education':'Schulung im Umgang mit Wildlockern','calling demonstrations':'Lockruf-Vorführungen','calling demonstration':'Lockruf-Vorführung','band replacement':'Bandwechsel','reed replacement':'Wechsel der Rufzunge','call-care':'Lockerpflege','call care':'Lockerpflege','call models':'Lockermodelle','call model':'Lockermodell','cow and calf elk':'Wapiti-Kühe und -Kälber','whitetail deer':'Weißwedelhirsche','elk':'Wapiti'}
manual={'Home':'Startseite','Our Story':'Unsere Geschichte','Our Legacy':'Unser Vermächtnis','Education':'Lernen','Videos':'Videos','Banding':'Band- und Zungenwechsel','Banding Instructions':'Anleitungen zum Bandwechsel','Archive':'Archiv','Support':'Hilfe','Contact':'Kontakt','Get in Touch':'Kontakt aufnehmen','Canada':'Kanada','International':'International','U.S. Dealers':'Händler in den USA','My Field Guide':'Mein Feldführer','THE LANGUAGE OF THE WILD':'DIE SPRACHE DER WILDNIS','Language':'Sprache','English':'English','Français':'Français','Español':'Español','Deutsch':'Deutsch','Play Here':'Hier abspielen','Close ×':'Schließen ×','Close':'Schließen','Find':'Suchen','Find a resource':'Eine Ressource suchen','Search lessons':'Lektionen suchen','Species':'Tierart','Topic':'Thema','Elk':'Wapiti','ELK':'WAPITI','Deer':'Hirsche','Antelope':'Antilope','Predators':'Raubwild','All species':'Alle Tierarten','All call models':'Alle Lockermodelle','All topics':'Alle Themen','Apply Filters →':'Filter anwenden →','Clear All Filters':'Alle Filter zurücksetzen','Clear Filters':'Filter zurücksetzen','Calling demonstrations':'Lockruf-Vorführungen','Band replacement':'Bandwechsel','Reed replacement':'Wechsel der Rufzunge','Lessons':'Lektionen','Learning paths':'Lernwege','Get help':'Hilfe erhalten','Fit scan':'Scan einpassen','Original PDF →':'Original-PDF →','Learn the call.':'Den Lockruf lernen.','Live the story.':'Geschichte erleben.','Learn the sound.':'Den Klang kennenlernen.','Build your confidence.':'Sicherer im Umgang werden.','Choose your next step.':'Wählen Sie Ihren nächsten Schritt.','START WITH YOUR GOAL':'BEGINNEN SIE MIT IHREM ZIEL','Hear a demonstration':'Eine Vorführung anhören','Replace a band':'Ein Band austauschen','Replace a reed':'Eine Rufzunge austauschen','♫ Music':'♫ Musik','Music':'Musik','Find Your Lesson':'Ihre Lektion finden','Back to top':'Nach oben','↑ Back to top':'↑ Nach oben','Find Your Lesson ↓':'Ihre Lektion finden ↓','Play':'Abspielen','Pause':'Pause','Stop':'Stopp','Minimize':'Minimieren','Volume':'Lautstärke','Loop track':'Titel wiederholen','Listen':'Anhören','Saved':'Gespeichert','Remove':'Entfernen','Save for later':'Für später speichern','Saved to Field Guide':'Im Feldführer gespeichert'}
for name in names:manual[name]='MT E.L.K., INC.' if name=='E.L.K., Inc.' else name
pkg=next(x for x in package.get_installed_packages() if x.from_code=='en' and x.to_code=='de');engine=ctranslate2.Translator(str(pkg.package_path/'model'),intra_threads=4,compute_type='int8')
path=folder/'de.json';mapping=json.loads(path.read_text()) if path.exists() else {};pattern=re.compile('|'.join(re.escape(x) for x in sorted(names+list(glossary),key=len,reverse=True)),re.I);jobs=[]
for s in sorted(strings):
 if s in manual:mapping[s]=manual[s];continue
 if s in mapping:continue
 if not re.search('[A-Za-z]',s) or '@' in s or s.startswith(('https:','http:')):mapping[s]=s;continue
 protected=[]
 def mask(m):
  val=m[0];canonical=next((n for n in names if n.lower()==val.lower()),None);target=('MT E.L.K., INC.' if canonical=='E.L.K., Inc.' else canonical) if canonical else glossary[next(k for k in glossary if k.lower()==val.lower())]
  token='ZXQ'+str(len(protected)).zfill(3)+'ZXQ';protected.append((token,target));return token
 jobs.append((s,pattern.sub(mask,s),protected))
for i in range(0,len(jobs),24):
 batch=jobs[i:i+24];outs=engine.translate_batch([pkg.tokenizer.encode(x[1]) for x in batch],beam_size=2,max_decoding_length=512,max_batch_size=24)
 for (s,masked,protected),o in zip(batch,outs):
  value=pkg.tokenizer.decode(o.hypotheses[0]);value=re.sub(r'ZXQ\s*(\d{3})\s*ZXQ',r'ZXQ\1ZXQ',value)
  if any(token not in value for token,target in protected):
   parts=re.split(r'(ZXQ\d+ZXQ)',masked);chunks=[x for x in parts if x.strip() and not re.fullmatch(r'ZXQ\d+ZXQ',x)]
   outputs=engine.translate_batch([pkg.tokenizer.encode(x.strip()) for x in chunks],beam_size=2,max_decoding_length=512);it=iter(pkg.tokenizer.decode(x.hypotheses[0]) for x in outputs);value=' '.join(dict(protected)[x] if x in dict(protected) else next(it) for x in parts if x.strip())
  for token,target in protected:value=value.replace(token,target)
  value=re.sub(r'\s+([.,;:!?])',r'\1',value).strip();mapping[s]=value
 path.write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n');print('German',min(i+24,len(jobs)),'/',len(jobs),flush=True)
# The existing French guide is source-authored; map its excerpts from the matching English text.
guides=json.loads((source/'canada-education.json').read_text())
for en,fr in zip(guides.get('en',[]),guides.get('fr',[])):
 for english,french in zip(en.get('paragraphs',[]),fr.get('paragraphs',[])):mapping[french]=mapping.get(english,english)
mapping.update(manual);path.write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n')
print('German dictionary complete:',len(mapping),flush=True)
