import importlib.util,datetime
from pathlib import Path
p=Path(__file__).with_name('reconcile-canada-prospects.py');s=importlib.util.spec_from_file_location('canada',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
for code,name in m.REGIONS.items():assert m.ALIASES[m.normalize(name)]==code and m.ALIASES[m.normalize(code)]==code
assert m.ALIASES[m.normalize('Québec')]=='QC'
for url in ['file:///etc/passwd','http://localhost/','http://127.0.0.1/','https://10.0.0.1/','https://user:password@example.com/','https://example.local/']:assert m.website(url)is None
row={'id':'fixture-a','Company':'Example Retailer','Website':'https://www.example.com','Address':'123 Example Road','City':'Example','Province':'British Columbia','Sources':'Fixture only','Outreach':'Not contacted','Verification':'Website checked','Date Added':'2026-11-19'}
data=m.review([row,{**row,'id':'fixture-b'},{**row,'id':'different-branch','Address':'456 Other Road','Outreach':'Do not contact'},{**row,'id':'closed','Address':'789 Other Road','Verification':'Closed'}],datetime.date(2026,11,19))
assert data['duplicate_review_groups']==[['fixture-a','fixture-b']]
assert data['suppressed']==2
assert all(r['freshness']=='unknown'and r['outreach_ready']is False for r in data['review'])
assert data['notion_writes']==data['outreach_sent']==0
assert m.review([{**row,'Last Verified':'2030-01-01'}],datetime.date(2026,11,19))['review'][0]['freshness']=='future-date-invalid'
missing=m.review([{'id':'missing','Company':None,'Address':None,'City':None,'Website':None,'Email':None}],datetime.date(2026,11,19))
assert missing['records']==1 and 'email-missing-or-invalid'in missing['review'][0]['issues']
print('PASS: 13 regions, accents, URL safety, branch-preserving duplicate review, suppression, unknown freshness and no outreach/Notion writes.')
