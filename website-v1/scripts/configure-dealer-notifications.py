"""Configure only the four dealer-application forms using Netlify CLI-managed authentication."""
from pathlib import Path
import json,os,shutil,subprocess
site='2235167f-7f96-4631-a741-1394bfa6b8d0'
cli_js=os.environ.get('NETLIFY_CLI_JS')
command=[os.environ.get('NODE_BINARY','node'),cli_js] if cli_js else [shutil.which('netlify') or 'netlify']
def api(name,data):
 result=subprocess.run(command+['api',name,'--data',json.dumps(data)],capture_output=True,text=True,check=True)
 return json.loads(result.stdout)
expected={'dealer-application','dealer-application-fr','dealer-application-es','dealer-application-de'}
forms=[f for f in api('listSiteForms',{'site_id':site}) if f['name'] in expected]
assert {f['name'] for f in forms}==expected,'Deploy all four application pages before configuring notifications.'
hooks=api('listHooksBySiteId',{'site_id':site});configured=[]
for form in forms:
 for email in ['phillip@elkinc.com','jesse@elkinc.com']:
  hook=next((h for h in hooks if h.get('form_id')==form['id'] and h.get('type')=='email' and h.get('data',{}).get('email')==email and not h.get('disabled')),None)
  if not hook:
   body={'site_id':site,'form_id':form['id'],'type':'email','event':'submission_created','data':{'email':email}}
   hook=api('createHookBySiteId',{'site_id':site,'body':body})
  assert hook.get('form_id')==form['id'],'A dealer notification must never be site-wide.'
  configured.append({'form':form['name'],'form_id':form['id'],'email':email,'notification_id':hook['id']})
p=Path('content/dealer-application-delivery.json');record=json.loads(p.read_text()) if p.exists() else {}
record.update({'provider':'Netlify Forms','site_id':site,'notifications':configured,'notification_mode':'Separate application-specific notifications; no Cc header; no Make automation.'})
p.write_text(json.dumps(record,indent=2)+'\n');print('Verified eight application-specific email notifications.')
