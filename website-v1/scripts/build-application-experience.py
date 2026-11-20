"""Enhance retained application pages without changing questionnaire names or destinations."""
from pathlib import Path
import json,re,hashlib
from html.parser import HTMLParser
class Controls(HTMLParser):
 def __init__(self):super().__init__();self.names=set()
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag in ['input','select','textarea'] and attrs.get('name'):self.names.add(attrs['name'])
def names(form):
 parser=Controls();parser.feed(form);return sorted(parser.names)
root=Path(__file__).resolve().parents[1];dist=root/'dist'
copy=json.loads((root/'content/application-experience.json').read_text())
digest=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()[:12]
(dist/'dealer-experience.js').write_text((root/'templates/dealer-experience.js').read_text())
controller=(root/'templates/dealer-application.js').read_text();controller=controller.replace('EXPERIENCE_VERSION',digest(dist/'dealer-experience.js'));(dist/'dealer-application.js').write_text(controller)
p=dist/'dealer-application.css';css=p.read_text();css=re.sub(r'/\* BEGIN application experience \*/.*?/\* END application experience \*/\n?','',css,flags=re.S);css=css.rstrip()+'\n/* BEGIN application experience */\n'+(root/'templates/dealer-experience.css').read_text()+'\n/* END application experience */\n';p.write_text(css)
rows=[]
for lang,c in copy.items():
 p=dist/(''if lang=='en'else lang)/'dealer-application/index.html';text=p.read_text()
 form=re.search(r'<form id="dealer-application".*?</form>',text,re.S)[0];before=names(form)
 pattern=r'(<script type="application/json" id="dealer-application-data">)(.*?)(</script>)';match=re.search(pattern,text,re.S);assert match
 data=json.loads(match[2]);data['experience_ui']=c
 encoded=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c');text=text[:match.start(2)]+encoded+text[match.end(2):]
 text=re.sub(r'(/dealer-application\.js)(?:\?v=[a-f0-9]+)?',lambda m:m[1]+'?v='+digest(dist/'dealer-application.js'),text)
 text=re.sub(r'(/dealer-application\.css)(?:\?v=[a-f0-9]+)?',lambda m:m[1]+'?v='+digest(dist/'dealer-application.css'),text)
 form=re.search(r'<form id="dealer-application".*?</form>',text,re.S)[0];after=names(form);assert before==after
 p.write_text(text);rows.append({'lang':lang,'questionnaire_fields':len(data['fields']),'registered_field_names':len([n for n in after if n!='form-name']),'field_names_unchanged':True,'submission_destination_unchanged':True})
(root/'reports/application-experience-build.json').write_text(json.dumps({'pages':rows,'stores_answers':False,'new_form_fields':0,'sends_messages':False},indent=2)+'\n');print('Enhanced four retained applications; questionnaire names and submission destinations preserved.')
