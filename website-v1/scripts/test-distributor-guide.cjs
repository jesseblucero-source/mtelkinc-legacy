const {chromium,webkit,firefox}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8772';
const pdf='/downloads/mtelkinc-multilingual-distributor-guide.pdf';
(async()=>{
 const rows=[];
 for(const [engine,type] of Object.entries({chromium,webkit,firefox})){
  if(process.env.GUIDE_TEST_ENGINES&&!process.env.GUIDE_TEST_ENGINES.split(',').includes(engine))continue;
  const browser=await type.launch();
  try{
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__shared=data;if(window.__shareError)throw new DOMException('Share failed',window.__shareError)}});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.__clipboardError)throw Error('Clipboard blocked');window.__copied=text}}});
   });
   for(const lang of ['en','fr','es','de']){
    const prefix=lang==='en'?'':'/'+lang;
    for(const route of ['/dealers/us/','/canada/','/international/']){
     const requests=[];const listener=r=>requests.push(r.url());page.on('request',listener);
     await page.goto(origin+prefix+route,{waitUntil:'networkidle'});
     const card=page.locator('#distributor-guide');assert.equal(await card.count(),1);
     await card.scrollIntoViewIfNeeded();
     assert.equal(await page.locator('html').getAttribute('lang'),lang);
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     assert(!requests.some(x=>x.includes(pdf)||x.includes('pdf.min.mjs')),'No eager PDF or PDF engine');
     const download=card.locator('.distributor-guide-actions > a[download]');assert.equal(await download.getAttribute('href'),pdf);
     const [saved]=await Promise.all([page.waitForEvent('download'),download.click()]);
     assert.equal(saved.suggestedFilename(),'mtelkinc-multilingual-distributor-guide.pdf');
     const locationBefore=page.url();
     await card.locator('[data-guide-copy]').click();assert.equal(await page.evaluate(()=>window.__copied),'https://www.mtelkinc.com'+pdf);
     await card.locator('[data-guide-native]').click();assert.equal((await page.evaluate(()=>window.__shared)).url,'https://www.mtelkinc.com'+pdf);
     for(const control of await card.locator('a,button,input').all()){
      if(!await control.isVisible())continue;const b=await control.boundingBox();assert(b.height>=44,'Touch target height');assert(b.x>=-1&&b.x+b.width<=391,'Control within viewport');
     }
     assert.equal(new URL(await card.locator('a[href^="https://wa.me"]').getAttribute('href')).searchParams.get('text').includes('https://www.mtelkinc.com'+pdf),true);
     await card.locator('.distributor-guide-preview').click();const dialog=page.locator('dialog.document-viewer');await dialog.waitFor({state:'visible'});
     await page.waitForFunction(()=>document.querySelector('[data-document-page]')?.textContent.includes('5')&&document.querySelector('[data-document-stage] canvas'));
     assert.equal(page.url(),locationBefore);await dialog.locator('[data-document-next]').click();await page.waitForFunction(()=>document.querySelector('[data-document-page]')?.textContent.includes('2'));
     await page.keyboard.press('Escape');assert(await dialog.isHidden());await page.waitForFunction(()=>document.activeElement?.matches('.distributor-guide-preview'));
     assert(await card.locator('[role=status]').innerText());
     page.off('request',listener);rows.push({engine,lang,route,width:390,download:true,share:true,preview:true});
    }
   }
   await page.goto(origin+'/dealers/us/',{waitUntil:'networkidle'});
   await page.evaluate(()=>{window.__clipboardError=true});await page.locator('[data-guide-copy]').click();assert(await page.locator('.distributor-guide-status').innerText().then(x=>x.includes('Select')));
   assert.equal(await page.locator('#distributor-guide-link').evaluate(e=>e.selectionEnd-e.selectionStart),('https://www.mtelkinc.com'+pdf).length);
   await page.evaluate(()=>{window.__clipboardError=false;window.__shareError='NotAllowedError';window.__copied=null});await page.locator('[data-guide-native]').click();assert.equal(await page.evaluate(()=>window.__copied),'https://www.mtelkinc.com'+pdf);
   await page.evaluate(()=>{window.__shareError='AbortError';window.__copied=null});await page.locator('[data-guide-native]').click();assert.equal(await page.evaluate(()=>window.__copied),null);
   await page.locator('#distributor-guide .distributor-guide-preview').click();await page.locator('[data-document-close]').click();
   // Shared page transitions must initialize the new controller and preserve history.
   await page.locator('footer a[href="/canada/"]').first().click();await page.waitForURL(origin+'/canada/');await page.waitForFunction(()=>!document.querySelector('#site-page').inert);
   await page.evaluate(()=>{window.__copied=null});await page.locator('[data-guide-copy]').click();assert.equal(await page.evaluate(()=>window.__copied),'https://www.mtelkinc.com'+pdf);
   await page.goBack();await page.waitForFunction(()=>location.pathname==='/dealers/us/'&&!document.querySelector('#site-page').inert);assert.equal(await page.locator('#distributor-guide').count(),1);
   for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   if(engine==='chromium'){await page.setViewportSize({width:390,height:844});await page.locator('#distributor-guide').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/distributor-guide-phone.png',fullPage:false});}
   assert.deepEqual(errors,[]);await page.close();
   const fallback=await browser.newPage();await fallback.addInitScript(()=>Object.defineProperty(navigator,'share',{value:undefined}));await fallback.goto(origin+'/canada/',{waitUntil:'networkidle'});assert(await fallback.locator('[data-guide-native]').isHidden());assert(await fallback.locator('[data-guide-copy]').isVisible());await fallback.close();
   const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});await plain.goto(origin+'/fr/dealers/us/');assert.equal(await plain.locator('#distributor-guide .distributor-guide-actions > a[download]').count(),1);assert(await plain.locator('[data-guide-copy]').isHidden());assert(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await plain.close();
   console.log('PASS',engine,'12 localized pages; downloads, five-page preview, share/copy, cancellation, fallback, SPA and narrow layouts');
   fs.writeFileSync('reports/distributor-guide-browser-results-'+engine+'.json',JSON.stringify({origin,rows:rows.filter(r=>r.engine===engine)},null,2));
  }finally{await browser.close();}
 }
 fs.writeFileSync('reports/distributor-guide-browser-results.json',JSON.stringify({origin,checks:rows.length,rows},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
