// Controlled startup failures. Recovery must never touch an active customer form.
const {chromium,webkit}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8782';
(async()=>{const rows=[];for(const[engine,type]of Object.entries({chromium,webkit})){
 const browser=await type.launch();try{for(const mode of ['manual','recover','permanent','fields']){
 const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.clock.install();
 await p.route('https://app.ecwid.com/script.js?*',route=>route.fulfill({contentType:'text/javascript',body:`
  const mode=${JSON.stringify(mode)},loaded=[],host=document.getElementById('my-store-117609763');window.__destroyCalls=0;
  if(mode==='fields')host.innerHTML='<input aria-label="Controlled customer field" value="Unsent test value">';
  window.Ecwid={OnAPILoaded:{add(fn){fn()}},OnPageLoaded:{add(fn){loaded.push(fn)}},OnPageSwitch:{add(){}},OnCartChanged:{add(){}},Cart:{get(fn){fn({items:[]})}},setStorefrontBaseUrl(){},openPage(){}};
  if(mode!=='manual')Ecwid.destroy=()=>{window.__destroyCalls++;host.replaceChildren()};
  window.ecwid_onBodyDone=()=>{if(mode==='permanent')return;host.innerHTML='<div class="ec-store"><div class="product-details">Controlled storefront render</div></div>';for(const fn of loaded)fn({type:'PRODUCT',productId:751639142})};
 `}));
 await p.goto(origin+'/shop/',{waitUntil:'load'});await p.waitForFunction(()=>window.Ecwid);
 assert(await p.locator('[data-store-action=cart]').isDisabled());await p.clock.runFor(mode==='permanent'?41000:21000);
 if(mode==='recover'){
  assert.equal(await p.evaluate(()=>__destroyCalls),1);assert(await p.locator('#store-status').isHidden());assert(await p.locator('[data-store-action=cart]').isEnabled());
  await p.clock.runFor(60000);assert.equal(await p.evaluate(()=>__destroyCalls),1);
 }else{
  assert(await p.locator('#store-retry').isVisible());assert(await p.locator('#store-status').isVisible());assert(await p.locator('[data-store-action=cart]').isDisabled());
  if(mode==='manual'){
   await p.locator('#store-retry').click();await p.waitForFunction(()=>!document.querySelector('[data-store-action=cart]').disabled);assert(await p.locator('#store-status').isHidden());assert(await p.locator('#store-retry').isHidden());
  }else if(mode==='fields'){
   assert.equal(await p.evaluate(()=>__destroyCalls),0);assert.equal(await p.locator('#my-store-117609763 input').inputValue(),'Unsent test value');
  }else{
   assert.equal(await p.evaluate(()=>__destroyCalls),1);await p.clock.runFor(60000);assert.equal(await p.evaluate(()=>__destroyCalls),1);
  }
 }
 assert.equal(await p.locator('#my-store-117609763 .store-addons-callout,#my-store-117609763 [data-store-suggestions]').count(),0);
 rows.push({engine,mode,apiOnlyDoesNotImplyRendered:true,recoveryBounded:true,customerFieldsPreserved:true,merchantDomNotModifiedByAddons:true,providerMocked:true});await p.close();
 }}finally{await browser.close()}
}fs.writeFileSync('reports/catalog-advance-store-readiness.json',JSON.stringify({origin,rows},null,2)+'\n');console.log(JSON.stringify(rows));})().catch(e=>{console.error(e);process.exit(1)});
