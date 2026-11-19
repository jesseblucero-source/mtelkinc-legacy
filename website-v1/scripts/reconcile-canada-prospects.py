"""Private, read-only review of a local Notion export. Never writes Notion or sends outreach."""
from pathlib import Path
from urllib.parse import urlsplit
import argparse,csv,json,unicodedata,re,hashlib,datetime,collections,ipaddress

REGIONS={'AB':'Alberta','BC':'British Columbia','MB':'Manitoba','NB':'New Brunswick','NL':'Newfoundland and Labrador','NS':'Nova Scotia','NT':'Northwest Territories','NU':'Nunavut','ON':'Ontario','PE':'Prince Edward Island','QC':'Quebec','SK':'Saskatchewan','YT':'Yukon'}
def normalize(value):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',str(value)).encode('ascii','ignore').decode().casefold())
ALIASES={normalize(k):k for k in REGIONS};ALIASES.update({normalize(v):k for k,v in REGIONS.items()});ALIASES.update({'pq':'QC','newfoundland':'NL','pei':'PE','nwt':'NT','ileduprinceedouard':'PE','colombiebritannique':'BC','nouveaubrunswick':'NB','nouvelleecosse':'NS','terreneuveetlabrador':'NL','territoiresdunordouest':'NT'})
OUTREACH={'Not contacted','Contacted','Interested','Do not contact'};VERIFICATION={'Needs confirmation','Website checked','Closed'}
def website(value):
 try:
  u=urlsplit(str(value).strip());host=(u.hostname or'').casefold().rstrip('.')
  if u.scheme not in ['http','https']or not host or u.username or u.password:return None
  if host=='localhost'or'.'not in host or host.endswith(('.local','.localhost','.internal','.test','.invalid')):return None
  try:
   if not ipaddress.ip_address(host).is_global:return None
  except ValueError:pass
  return host.removeprefix('www.') if hasattr(host,'removeprefix')else re.sub('^www\\.','',host)
 except ValueError:return None
def review(rows,today):
 results=[];identities=collections.defaultdict(list);coverage=collections.Counter();suppressed=0
 for index,row in enumerate(rows):
  ref=str(row.get('id')or row.get('URL')or'row-'+str(index+1));issues=[]
  region=ALIASES.get(normalize(row.get('Province','')));coverage[region or'Unclassified']+=1
  if not region:issues.append('province-needs-review')
  domain=website(row.get('Website',''))
  if not domain:issues.append('website-missing-or-invalid')
  if not row.get('Company'):issues.append('company-missing')
  if not row.get('Sources'):issues.append('source-evidence-missing')
  if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',str(row.get('Email')or'')):issues.append('email-missing-or-invalid')
  if row.get('Outreach')not in OUTREACH:issues.append('unrecognized-outreach-status')
  if row.get('Verification')not in VERIFICATION:issues.append('unrecognized-verification-status')
  closed=row.get('Verification')=='Closed';opted_out=row.get('Outreach')=='Do not contact';blocked=closed or opted_out or row.get('Suppressed')is True
  if blocked:suppressed+=1
  # Existing Date Added and Website checked cannot establish verification freshness.
  verified=row.get('Last Verified');freshness='unknown'
  if verified:
   try:
    days=(today-datetime.date.fromisoformat(str(verified)[:10])).days
    freshness='future-date-invalid'if days<0 else'stale'if days>90 else'recent-recorded-date'
   except ValueError:freshness='invalid'
  if freshness!='recent-recorded-date':issues.append('verification-'+freshness)
  if not row.get('Preferred Language'):issues.append('preferred-language-unconfirmed')
  if not row.get('Consent Evidence'):issues.append('outreach-basis-unconfirmed')
  if not row.get('Assigned Representative'):issues.append('owner-unassigned')
  # Include location: separate branches sharing a domain must remain separate identities.
  location=normalize(str(row.get('Address')or'')+' '+str(row.get('City')or'')+' '+str(region or''))
  if row.get('Company')and domain and location:
   key=hashlib.sha256((normalize(row['Company'])+'|'+domain+'|'+location).encode()).hexdigest();identities[key].append(ref)
  results.append({'reference':ref,'province':region,'suppressed':blocked,'freshness':freshness,'outreach_ready':False,'issues':issues})
 return {'read_only':True,'notion_writes':0,'outreach_sent':0,'records':len(rows),'coverage':dict(sorted(coverage.items())),
  'suppressed':suppressed,'duplicate_review_groups':[refs for refs in identities.values()if len(refs)>1],
  'note':'No record is made campaign-eligible automatically. Consent/legal basis, language, relevance, freshness, suppression and explicit campaign authorization require review.',
  'review':results}
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');p.add_argument('--output',required=True);args=p.parse_args()
 dest=Path(args.output).resolve();root=Path(__file__).resolve().parents[1]
 if root==dest or root in dest.parents:raise SystemExit('Write private review output outside the website/repository, never under dist.')
 source=Path(args.input)
 if source.suffix.lower()=='.csv':rows=list(csv.DictReader(source.open(newline='',encoding='utf-8-sig')))
 else:
  data=json.loads(source.read_text());rows=data.get('rows',[])if isinstance(data,dict)else data
 if not isinstance(rows,list)or any(not isinstance(row,dict)for row in rows):raise SystemExit('Expected flat Notion export rows as objects.')
 dest.write_text(json.dumps(review(rows,datetime.date.today()),indent=2)+'\n')
 print('Private review written. No records changed or messages sent.')
if __name__=='__main__':main()
