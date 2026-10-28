const {chromium,webkit}=require(process.env.MT_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8772';
const records=JSON.parse(fs.readFileSync('content/business-guides.json'));
(async()=>{const results=[];
for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch();try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://heyzine.com/**',r=>r.fulfill({contentType:'text/html',body:'<html><body>Mock guide for site-control testing</body></html>'}));
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{window.__share=d;if(window.__shareError)throw new DOMException('Unavailable',window.__shareError)}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{if(window.__copyError)throw Error('blocked');window.__copy=s}}});});
 for(const lang of ['en','fr','es','de']){const prefix=lang==='en'?'':'/'+lang;
 for(const path of ['/dealers/us/','/canada/','/international/']){
 await page.goto(origin+prefix+path,{waitUntil:'networkidle'});assert.equal(await page.locator('#distributor-guide .business-guide-card').count(),2);
 for(const r of records)assert.equal(await page.locator('#guide-'+r.id+' h4 a').getAttribute('href'),prefix+'/dealer-guides/'+r.id+'/');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const r of records){const path=prefix+'/dealer-guides/'+r.id+'/';let eager=[];const onRequest=x=>eager.push(x.url());page.on('request',onRequest);
 await page.goto(origin+path,{waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.mtelkinc.com'+path);
 assert.equal(await page.locator('[data-business-reader] iframe').count(),0);assert(!eager.some(x=>x.startsWith('https://heyzine.com/')||x.endsWith('.pdf')||x.includes('pdf.min.mjs')));page.off('request',onRequest);
 await page.locator('[data-load-business-guide]').click();const frame=page.locator('[data-business-reader] iframe');await frame.waitFor();assert.equal(await frame.getAttribute('src'),r.flipbook);assert.equal(page.url(),origin+path);assert(await page.locator('[data-close-business-guide]').isVisible());
 await page.locator('[data-close-business-guide]').click();assert.equal(await frame.count(),0);assert(await page.locator('[data-load-business-guide]').evaluate(e=>e===document.activeElement));
 await page.locator('[data-guide-copy]').click();assert.equal(await page.evaluate(()=>window.__copy),'https://www.mtelkinc.com'+path);
 await page.locator('[data-guide-native]').click();assert.equal((await page.evaluate(()=>window.__share)).url,'https://www.mtelkinc.com'+path);
 await page.locator('.business-guide-fallback-actions a:not([download])').click();await page.locator('dialog.document-viewer').waitFor({state:'visible'});await page.waitForFunction(n=>document.querySelector('[data-document-page]')?.textContent.includes(String(n))&&document.querySelector('[data-document-stage] canvas'),r.pages);
 assert.equal(page.url(),origin+path);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.document-viewer')?.open);
 assert.equal(await page.locator('.business-guide-fallback-actions a[download]').getAttribute('href'),r.pdf);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({engine,lang,id:r.id,embeddedReader:true,pdfPages:r.pages,sharing:true});
 }
 }
 await page.evaluate(()=>{window.__copyError=true});await page.locator('[data-guide-copy]').click();assert(await page.locator('.distributor-guide-status').innerText());assert(await page.locator('#business-guide-link').evaluate(e=>e.selectionEnd===e.value.length));
 await page.evaluate(()=>{window.__copyError=false;window.__shareError='AbortError';window.__copy=null});await page.locator('[data-guide-native]').click();assert.equal(await page.evaluate(()=>window.__copy),null);
 await page.evaluate(()=>{window.__shareError='NotAllowedError'});await page.locator('[data-guide-native]').click();assert(await page.evaluate(()=>window.__copy));
 for(const viewport of [{width:320,height:844},{width:768,height:900},{width:1440,height:1000},{width:844,height:390}]){await page.setViewportSize(viewport);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.goto(origin+'/dealer-guides/customer-support/',{waitUntil:'networkidle'});await page.locator('[data-load-business-guide]').click();await page.locator('.business-guide-next a').first().click();await page.waitForURL(origin+'/dealer-guides/distributor-network/');await page.waitForFunction(()=>!document.querySelector('#site-page').inert);assert.equal(await page.locator('[data-business-reader] iframe').count(),0);await page.locator('[data-load-business-guide]').click();assert.equal(await page.locator('[data-business-reader] iframe').getAttribute('src'),records[1].flipbook);await page.goBack();await page.waitForFunction(()=>location.pathname==='/dealer-guides/customer-support/'&&!document.querySelector('#site-page').inert);assert.equal(await page.locator('[data-business-reader] iframe').count(),0);
 if(engine==='chromium'){await page.setViewportSize({width:390,height:844});await page.locator('.business-guide-reader').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/business-guide-phone.png'});await page.goto(origin+'/dealers/us/#business-guides-title');await page.locator('.business-guides').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/business-guides-list-phone.png'});}
 assert.deepEqual(errors,[]);await page.close();
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});await plain.goto(origin+'/fr/dealer-guides/customer-support/');assert(await plain.locator('[data-load-business-guide]').isHidden());assert.equal(await plain.locator('.business-guide-fallback-actions a').count(),2);assert(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await plain.close();
 console.log('PASS',engine,'12 listings, 8 guide pages, lazy embedded readers, PDF previews, share/copy, SPA, no-JS and narrow/landscape layouts');
 }finally{await browser.close();}
}
fs.writeFileSync('reports/business-guides-browser-results.json',JSON.stringify({origin,providerIframeMocked:true,nativeShareMocked:true,results},null,2));})().catch(e=>{console.error(e);process.exit(1)});
