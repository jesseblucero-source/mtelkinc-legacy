"""One read-only acceptance audit. Completion requires public, not just local, proof."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess, sys, zipfile, os, uuid

project=Path(__file__).resolve().parents[1]
runs=[]
audit_id=str(uuid.uuid4())
for script,args in [('test-domain-shortcuts.py',['--local']),('check-domain-launch.py',[]),('test-domain-shortcuts.py',[])]:
    run=subprocess.run([sys.executable,str(project/'scripts'/script),*args],cwd=project,capture_output=True,text=True,
                       env={**os.environ,'MTELK_DOMAIN_AUDIT_RUN_ID':audit_id})
    runs.append({'script':script,'arguments':args,'exit_code':run.returncode})
    print(run.stdout.strip(),flush=True)
    if run.stderr:print(run.stderr[-500:],flush=True)

def read(name):
    try:return json.loads((project/'reports'/name).read_text())
    except (OSError,ValueError):return {}
local=read('domain-shortcut-local-results.json')
public=read('domain-launch-check.json')
deployed=read('domain-shortcut-test-results.json')
scope=read('static-routing-release-scope.json')
files_match=zip_matches=archive_hash=redirect_matches=functions_empty=False
manifest=[]
try:
    release=Path(scope['release_directory'])
    manifest=json.loads((release/'manifest.json').read_text())['files']
    files_match=bool(manifest)and all((release/'public'/entry['path']).is_file() and
                    hashlib.sha256((release/'public'/entry['path']).read_bytes()).hexdigest()==entry['sha256']
                    for entry in manifest)
    archive=Path(scope['archive'])
    with zipfile.ZipFile(archive)as check:
        zip_matches=check.testzip()is None and set(check.namelist())=={entry['path']for entry in manifest}
    archive_hash=hashlib.sha256(archive.read_bytes()).hexdigest()==scope['archive_sha256']
    redirect_matches=hashlib.sha256((project/'dist/_redirects').read_bytes()).hexdigest()==scope['redirect_sha256']
    functions_empty=(release/'empty-functions').is_dir()and not list((release/'empty-functions').iterdir())
except (OSError,ValueError,KeyError,zipfile.BadZipFile):pass
gates=[
 {'name':'Fresh evidence from this audit','passed':all(item.get('audit_run_id')==audit_id for item in [local,public,deployed]),
  'evidence':'All DNS, local and deployed route reports must come from this exact audit run'},
 {'name':'Local routing acceptance','passed':local.get('complete',False),'evidence':f'{local.get("passed",0)}/{local.get("tests",0)} local checks'},
 {'name':'Static release integrity','passed':files_match and zip_matches and archive_hash and redirect_matches and functions_empty,
  'evidence':f'{len(manifest)} files checked against SHA-256 manifest; ZIP integrity and exact file list; no server functions'},
 {'name':'All public hostnames, HTTPS and section destinations','passed':bool(public.get('total'))and public.get('live')==public.get('total'),
  'evidence':f'{public.get("live",0)}/{public.get("total",0)} public hostnames verified'},
 {'name':'Expanded routes deployed and working','passed':deployed.get('complete',False),
  'evidence':f'{deployed.get("passed",0)}/{deployed.get("tests",0)} expanded-route HTTP checks'},
]
report={'checked_at_utc':datetime.now(timezone.utc).isoformat(),'complete':all(gate['passed']for gate in gates),
        'audit_run_id':audit_id,
        'definition':'Every acceptance gate passes on the public domains; local or packaged work alone cannot mark the domain launch complete.',
        'gates':gates,'runs':runs,'pending_hostnames':[item['host']for item in public.get('domains',[])if item['status']!='live'],
        'scope':'Domain launch and routing. Does not certify SMTP delivery, payment processing or new content beyond this release.'}
actions=[]
if not gates[0]['passed']:actions.append('Rerun the audit to obtain fresh evidence for every check.')
if not gates[1]['passed']:actions.append('Fix the failing local routing tests.')
if not gates[2]['passed']:actions.append('Rebuild and verify the static release package.')
if not gates[3]['passed']:actions.append('Finish Directnic DNS and verify HTTPS for every pending hostname.')
if not gates[4]['passed']:actions.append('Publish the scoped static release, then verify its deployed routes. Resolve deployment access or credit limits if publishing is rejected.')
report['required_actions']=actions
(project/'reports/domain-completion-audit.json').write_text(json.dumps(report,indent=2)+'\n')
lines=['# MT E.L.K., INC. — Domain launch acceptance','',
       '**Status: '+('COMPLETE'if report['complete']else'INCOMPLETE')+'**','',
       'Complete means every check below passes on the public launch. A prepared ZIP and passing local tests do not count as a published launch.','',
       '| Acceptance check | Result | Evidence |','| --- | --- | --- |']
for gate in gates:lines.append('| '+gate['name']+' | '+('PASS'if gate['passed']else'PENDING')+' | '+gate['evidence']+' |')
lines+=['','Remaining: '+(' '.join(actions)if actions else'None. All domain-launch acceptance checks pass.'),'',
        'Launch instructions: [Directnic-final-DNS-checklist.md](Directnic-final-DNS-checklist.md).',
        'Run again: `python3 scripts/audit-domain-completion.py`. This command only reads public DNS/HTTPS and local release files; it does not deploy, purchase credits, submit forms or place orders.','',
        'Scope: domain routing. SMTP sender activation and payment-provider settlement require their own verification and are not certified by this report.']
(project/'reports/domain-completion-audit.md').write_text('\n'.join(lines)+'\n')
print('Domain launch: '+('COMPLETE'if report['complete']else'INCOMPLETE'),flush=True)
if not report['complete']:raise SystemExit(1)
