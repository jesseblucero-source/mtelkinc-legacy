"""Verify deployed short links and catalog routes; never submit forms or orders."""
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit, urlunsplit
import json, http.client, os, subprocess, sys, tempfile

project=Path(__file__).resolve().parents[1]
config=json.loads((project/'content/domain-shortcuts.json').read_text())
products=json.loads((project/'content/source/store-products.json').read_text())['products']
origin=config['canonical_origin']
cases=[]
for prefix in ['', '/fr','/es','/de']:
    for alias, target in [('apply','dealer-application'),('application','dealer-application'),('usadealers','dealers/us')]:
        for slash in ['', '/']:
            cases.append({'host':'www.mtelkinc.com','path':prefix+'/'+alias+slash+'?source=shortcut-test',
                          'expected':origin+prefix+'/'+target+'/?source=shortcut-test','public_tls':True})
    cases.append({'host':'www.mtelkinc.com','path':prefix+'/application/received/',
                  'expected':origin+prefix+'/dealer-application/received/','public_tls':True})
    for slash in ['', '/']:
        cases.append({'host':'mtelkincusa.com','path':prefix+'/apply'+slash,
                      'expected':origin+prefix+'/dealer-application/','public_tls':True})
for product in products:
    source=urlsplit(product['source_url'])
    target=urlunsplit(('https','www.mtelkinc.com',source.path,source.query,source.fragment))
    for old in ['/products/','/shop/products/']:
        cases.append({'host':'www.mtelkinc.com','path':old+str(product['id']),
                      'expected':target,'public_tls':True})
for prefix in ['', '/fr','/es','/de']:
    product=products[0];source=urlsplit(product['source_url'])
    target=urlunsplit(('https','www.mtelkinc.com',prefix+source.path,'source=shortcut-test',source.fragment))
    for host in ['www.mtelkinc.com','mtelkinc.shop','www.mtelkinc.shop']:
        cases.append({'host':host,'path':prefix+'/products/'+str(product['id'])+'?source=shortcut-test',
                      'expected':target,'public_tls':host=='www.mtelkinc.com'})
for host in ['mtelkinc.shop','www.mtelkinc.shop','usadealers.mtelkinc.com']:
    cases.append({'host':host,'path':'/apply/?source=cross-section',
                  'expected':origin+'/dealer-application/?source=cross-section','public_tls':False})

def check(case):
    hostname=case['host'] if case['public_tls'] else 'mtelkinc-educationhub.netlify.app'
    conn=http.client.HTTPSConnection(hostname,timeout=30)
    try:
        conn.request('GET',case['path'],headers={} if case['public_tls'] else {'Host':case['host']})
        response=conn.getresponse();response.read();location=response.getheader('Location')
        return {**case,'status':response.status,'location':location,
                'passed':response.status==301 and location==case['expected']}
    except Exception as error:
        return {**case,'passed':False,'error':str(error)[:240]}
    finally:conn.close()

local = '--local' in sys.argv
if local:
    # Use Netlify's actual local redirect engine, including its query/fragment
    # handling, without treating an unpublished route as a production result.
    cli=Path(os.environ.get('NETLIFY_CLI_JS','/Users/vegastopmarketers/.npm/_npx/b3ca12a867cd0704/node_modules/netlify-cli/bin/run.js'))
    module=cli.parents[2]/'@netlify/redirects/dist/main.js'
    node=os.environ.get('NODE_BINARY','/Users/vegastopmarketers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node')
    source='''
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const {RedirectsHandler}=await import(pathToFileURL(process.argv[1]).href);
const project=process.argv[2],cases=JSON.parse(fs.readFileSync(process.argv[3]));
const make=(dir,pub)=>new RedirectsHandler({configPath:dir+'/netlify.toml',configRedirects:[],jwtRoleClaim:'',jwtSecret:'',projectDir:dir,publicDir:pub,siteURL:'https://www.mtelkinc.com'});
const main=make(project,project+'/dist'),usa=make(project+'/domain-forwarding/usadealers',project+'/domain-forwarding/usadealers');
const results=[];
for(const item of cases){
 const engine=item.host==='mtelkincusa.com'?usa:main;
 const match=await engine.match(new Request('https://'+item.host+item.path));
 if(match?.statusCode!==301||match?.target.href!==item.expected)throw Error(JSON.stringify({item,status:match?.statusCode,actual:match?.target.href}));
 results.push({...item,status:match.statusCode,location:match.target.href,passed:true});
}
console.log(JSON.stringify(results));process.exit(0);
'''
    with tempfile.NamedTemporaryFile(mode='w',suffix='.json')as file:
        json.dump(cases,file);file.flush()
        run=subprocess.run([node,'--input-type=module','-e',source,str(module),str(project),file.name],capture_output=True,text=True,check=True)
        results=json.loads(run.stdout)
else:
    with ThreadPoolExecutor(max_workers=4)as pool:
        results=list(pool.map(check,cases))
report={'tests':len(results),'public_https_cases':sum(item['public_tls']for item in results),
        'checked_at_utc':datetime.now(timezone.utc).isoformat(),
        'audit_run_id':os.environ.get('MTELK_DOMAIN_AUDIT_RUN_ID'),
        'passed':sum(item['passed']for item in results),'failed':sum(not item['passed']for item in results),
        'complete':all(item['passed']for item in results),
        'mode':'Netlify local redirect engine; unpublished rules only' if local else 'Deployed HTTP routing',
        'host_override_limitation':'Tests with public_tls=false verify Netlify routing only, not public domain DNS/TLS.',
        'results':results}
name='domain-shortcut-local-results.json' if local else 'domain-shortcut-test-results.json'
(project/'reports'/name).write_text(json.dumps(report,indent=2)+'\n')
print(f'{"PASS" if report["complete"] else "INCOMPLETE"}: {report["passed"]}/{len(results)} {"local" if local else "deployed"} expanded-route checks. Includes all 57 catalog products, languages, queries, receipt paths, slash variants and cross-section links.')
if not report['complete']:raise SystemExit(1)
