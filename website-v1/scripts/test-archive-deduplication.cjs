const {chromium}=require(process.env.MT_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('assert');
(async()=>{const base=process.argv[2]||'http://127.0.0.1:8772',browser=await chromium.launch();try{
for(const pre of ['','/fr','/es','/de']){
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await p.goto(base+pre+'/archive/');await p.waitForFunction(()=>document.querySelector('.result-count')?.textContent.startsWith('12'));
 const cards=p.locator('[data-library] [data-item]');assert.equal(await cards.count(),12);
 const urls=await cards.evaluateAll(es=>es.map(e=>e.querySelector('a').getAttribute('href')));assert.equal(new Set(urls).size,12);
 await p.locator('#archive-search').fill('cow');await p.locator('#archive-year').selectOption('1986');
 assert.equal(await p.locator('[data-library] [data-item]:visible').count(),2);
 assert(p.url().includes('year=1986'));await p.reload();assert.equal(await p.locator('[data-library] [data-item]:visible').count(),2);
 await p.locator('#archive-search').fill('no-match-zzzz');await p.waitForFunction(()=>!document.querySelector('.library-empty').hidden);
 await p.locator('button[type=reset]').click();await p.waitForFunction(()=>document.querySelector('.result-count').textContent.startsWith('12'));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(const [old,target] of [['more-show','more-exposition'],['talk-to-the-elk','cow-talk-for-elk']]){
  await p.goto(base+pre+'/archive/'+old+'/#source');await p.waitForURL('**/'+target+'/**');
  assert.equal(await p.locator('.archive-secondary-source a').count(),1);assert.equal(await p.locator('[data-article-reader]').getAttribute('data-reader-available'),'true');
 }
 await p.goto(base+pre+'/legacy/#legacy-records');assert.equal(await p.locator('#legacy-records [data-article-reader]').count(),3);
 const rows=await(await p.request.get(base+pre+'/resource-index.json')).json();assert(!rows.some(r=>/\/archive\/(more-show|talk-to-the-elk)\//.test(r.url)));
 await p.close();console.log('PASS '+(pre||'/')+' unique cards, combined filters, shareable URL, empty/reset, phone width, redirects, source links, audio availability, Legacy and index.');
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
