"""Validate retained application boundaries and generated controller versions without network."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib
root=Path(__file__).resolve().parents[1];dist=root/'dist';schema=json.loads((root/'content/dealer-application.json').read_text());copy=json.loads((root/'content/application-experience.json').read_text())
class Controls(HTMLParser):
 def __init__(self):super().__init__();self.names=set();self.form=None
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='form'and attrs.get('id')=='dealer-application':self.form=attrs
  if tag in ['input','select','textarea']and attrs.get('name'):self.names.add(attrs['name'])
rows=[]
for lang in copy:
 pre=''if lang=='en'else'/'+lang;p=dist/(pre.strip('/')+'/'if pre else'')/'dealer-application/index.html';text=p.read_text();form=re.search(r'<form id="dealer-application".*?</form>',text,re.S)[0];parser=Controls();parser.feed(form)
 assert len(parser.names-{'form-name'})==84
 assert {f['name']for f in schema['fields']}<=parser.names
 data=json.loads(re.search(r'<script type="application/json" id="dealer-application-data">(.*?)</script>',text,re.S)[1]);assert data['fields']==schema['fields']and data['options']==schema['options']and data['experience_ui']==copy[lang]
 assert parser.form['action']==pre+'/dealer-application/received/'and parser.form['method']=='POST'and parser.form['netlify-honeypot']=='bot-field'
 digest=hashlib.sha256((dist/'dealer-application.js').read_bytes()).hexdigest()[:12];assert '/dealer-application.js?v='+digest in text
 assert not re.search(r'<input[^>]*name="(?:password|bank_account|credit_card)"',form)
 rows.append({'lang':lang,'questionnaire_fields':len(schema['fields']),'registered_fields':84,'action':parser.form['action']})
helper=(dist/'dealer-experience.js').read_text();controller=(dist/'dealer-application.js').read_text();digest=hashlib.sha256(helper.encode()).hexdigest()[:12]
assert './dealer-experience.js?v='+digest in controller
assert not any(x in helper for x in ['localStorage','sessionStorage','sendBeacon','fetch('])
assert len(helper.encode())<12000
report={'pages':rows,'helper_bytes':len(helper.encode()),'new_fields':0,'questionnaire_and_options_preserved':True,'new_network_or_storage_api':False,'smtp_activation':False};(root/'reports/application-experience-static.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
