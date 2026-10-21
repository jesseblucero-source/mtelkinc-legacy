"""Read-only public DNS/HTTPS checks for configured MT E.L.K., INC. domains."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json, subprocess, urllib.request, os

project = Path(__file__).resolve().parents[1]
config = json.loads((project/'content/domain-shortcuts.json').read_text())
cases = [(item['host'], item['path']) for item in config['shortcuts']]
cases += [(host, item['path']) for item in config.get('domain_forwards', []) for host in item['hosts']]

def check(case):
    host, path = case
    expected = config['canonical_origin']+path+'?source=domain-launch-check'
    result = {'host':host, 'expected_destination':expected, 'dns':{}, 'status':'pending'}
    for kind in ['CNAME','A','AAAA','NS']:
        try:
            run = subprocess.run(['dig','@1.1.1.1','+short','+time=3','+tries=1',host,kind],
                                 capture_output=True,text=True,timeout=5,check=True)
            # Keep resolver diagnostics separate from actual record values.
            result['dns'][kind] = [line.rstrip('.') for line in run.stdout.splitlines()
                                   if line and not line.startswith(';') and ' ' not in line]
        except (subprocess.SubprocessError,OSError):
            result['dns'][kind] = []
    try:
        with urllib.request.urlopen('https://'+host+'/?source=domain-launch-check', timeout=12) as response:
            result.update({'http_status':response.status, 'final_url':response.url,
                           'https_verified':True, 'destination_verified':response.url==expected})
            result['status'] = 'live' if response.status==200 and response.url==expected else 'wrong destination'
    except Exception as error:
        result.update({'https_verified':False,'destination_verified':False,'error':str(error)[:240]})
    return result

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(check,cases))
report = {'checked_at_utc':datetime.now(timezone.utc).isoformat(),
          'audit_run_id':os.environ.get('MTELK_DOMAIN_AUDIT_RUN_ID'),
          'method':'Public Cloudflare DNS and normal HTTPS redirects with certificate verification; no writes or form submissions.',
          'live':sum(item['status']=='live' for item in results),'total':len(results),'domains':results}
out = project/'reports/domain-launch-check.json'
out.write_text(json.dumps(report,indent=2)+'\n')
for item in results:
    print(f'{item["host"]}: {item["status"]}')
print(f'{report["live"]}/{report["total"]} public hostnames verified. Report: {out}')
