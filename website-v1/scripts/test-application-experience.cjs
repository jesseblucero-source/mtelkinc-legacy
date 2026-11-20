const {chromium,webkit}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright');
const AxeBuilder=require(process.env.MT_AXE_MODULE||'@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8783';
(async()=>{const rows=[];for(const[engine,type]of Object.entries({chromium,webkit})){
 const browser=await type.launch();try{for(const[lang,width]of[['en',390],['fr',320],['es',768],['de',1440]]){
 const pre=lang==='en'?'':'/'+lang,path=pre+'/dealer-application/';
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{window.__printed=0;window.print=()=>window.__printed++;Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}});Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}})});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));let posts=0;
 await p.route('**/dealer-application/received/',route=>{if(route.request().method()!=='POST')return route.continue();posts++;const body=new URLSearchParams(route.request().postData());assert(body.get('business_name').includes('REVISED'));assert.equal(body.get('signature_name'),'WEBSITE TEST — NOT A REAL APPLICATION');return route.fulfill(posts===1?{status:500,body:'Controlled failure'}:{status:200,contentType:'text/html',body:'<main data-dealer-received>Controlled receipt</main>'})});
 await p.goto(origin+path);await p.waitForFunction(()=>!document.querySelector('[data-dealer-next]').disabled);
 const form=p.locator('#dealer-application'),schema=JSON.parse(await p.locator('#dealer-application-data').textContent());
 assert.equal(schema.fields.length,67);assert.equal(await p.locator('.dealer-step-state').count(),5);
 assert.equal(Number(await p.locator('#dealer-required-progress').getAttribute('value')),0);
 await p.locator('[data-dealer-next]').click();
 assert(await p.locator('.dealer-validation-errors').isVisible());assert(await p.locator('.dealer-validation-errors').evaluate(e=>e===document.activeElement));
 assert((await p.locator('[data-error-field]').count())>3);
 await p.locator('[data-error-field="email"]').click();assert(await form.locator('[name=email]').evaluate(e=>e===document.activeElement));
 const description=await form.locator('[name=email]').getAttribute('aria-describedby');assert(description.includes('dealer-error-email'));
 const errorAxe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(errorAxe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 await form.locator('[name=email]').fill('not-an-address');assert(await p.locator('#dealer-error-email').isVisible());await form.locator('[name=email]').fill('website-test@example.invalid');assert.equal(await p.locator('#dealer-error-email').count(),0);
 // Conditional distribution requirements change the progress denominator without adding form fields.
 await form.locator('[name=requested_account_type]').selectOption('dealer');const dealerMax=Number(await p.locator('#dealer-required-progress').getAttribute('max'));
 await form.locator('[name=requested_account_type]').selectOption('distributor-account');assert(Number(await p.locator('#dealer-required-progress').getAttribute('max'))>dealerMax);
 async function fillStep(n){for(const f of schema.fields.filter(f=>f.step===n)){
  const input=form.locator('[name="'+f.name+'"]');if(await input.first().isDisabled())continue;
  if(f.kind==='checks'){await input.first().check();continue}if(f.kind==='checkbox'){await input.check();continue}
  if(f.kind==='select'){await input.selectOption(f.name==='requested_account_type'?'distributor-account':f.name==='customer_type'?'retailers':f.options[0]);continue}
  let value=f.kind==='number'?'1':f.kind==='email'?'website-test@example.invalid':f.kind==='url'?'https://example.invalid':'WEBSITE TEST — NOT A REAL APPLICATION';
  if(f.name==='ein')value='000000000';if(f.name==='year_established')value='2020';if(f.name==='country')value='United States';if(f.name==='annual_units')value='120';if(f.name==='opening_units')value='12';if(f.name==='retailer_accounts')value='0';await input.fill(value);
 }}
 for(let n=1;n<=4;n++){await fillStep(n);await p.locator('[data-dealer-next]').click();assert(await p.locator('[data-dealer-step="'+(n+1)+'"]').isVisible())}
 assert.equal(await p.locator('#dealer-review [data-review-step]').count(),5);await fillStep(5);
 await p.locator('[data-dealer-sign]').click();const signed=await form.locator('[name=signature_saved_at]').inputValue();assert(signed);
 const meter=()=>p.locator('#dealer-required-progress').evaluate(e=>({value:e.value,max:e.max}));assert.deepEqual(await meter(),{value:(await meter()).max,max:(await meter()).max});
 await p.locator('#dealer-review [data-review-step="5"]').click();assert.equal(await p.evaluate(()=>document.activeElement.name),'authorized_name');
 await p.locator('#dealer-review [data-review-step="1"]').click();assert(await p.locator('[data-dealer-step="1"]').isVisible());assert(await p.locator('[data-return-review]').isVisible());assert.equal(await form.locator('[name=signature_saved_at]').inputValue(),signed);
 await form.locator('[name=business_name]').fill('WEBSITE TEST — REVISED');assert.equal(await form.locator('[name=signature_saved_at]').inputValue(),'');assert(!await form.locator('[name=signature_consent]').isChecked());
 await p.locator('[data-return-review]').click();assert(await p.locator('[data-dealer-step="5"]').isVisible());assert((await p.locator('#dealer-review').textContent()).includes('REVISED'));
 await p.locator('[data-dealer-print]').click();assert.equal(await p.evaluate(()=>__printed),0);assert(await p.locator('.dealer-validation-errors').isVisible());assert.equal(posts,0);
 await p.locator('[data-error-field="signature_consent"]').click();await form.locator('[name=signature_consent]').check();await p.locator('[data-dealer-sign]').click();
 assert(await form.locator('[name=signature_saved_at]').inputValue());await p.locator('[data-dealer-print]').click();assert.equal(await p.evaluate(()=>__printed),1);assert.equal(await p.locator('#dealer-print [data-review-step]').count(),0);assert((await p.locator('#dealer-print').textContent()).includes('REVISED'));
 const validAxe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(validAxe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
 if(engine==='chromium'&&['en','de'].includes(lang))await p.screenshot({path:'reports/application-review-'+lang+'.png',fullPage:false});
 await p.locator('[data-dealer-send]').click();await p.waitForFunction(()=>!document.querySelector('#dealer-application').inert);assert.equal(posts,1);assert.equal(await p.locator('#dealer-status').getAttribute('role'),'alert');assert((await form.locator('[name=business_name]').inputValue()).includes('REVISED'));
 await p.locator('[data-dealer-send]').click();await p.waitForFunction(()=>!document.querySelector('#dealer-application').inert);assert.equal(posts,2);assert(await p.locator('[data-dealer-send]').isHidden());assert.equal(await p.locator('#dealer-review [data-review-step]:enabled').count(),0);assert.equal(await p.locator('[data-return-review]:visible').count(),0);
 assert.equal(await form.locator('[name=business_name]').inputValue(),'WEBSITE TEST — REVISED');assert(!p.url().includes('REVISED'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 rows.push({engine,lang,width,errorSummary:true,linkedInlineErrors:true,conditionalProgress:true,reviewEdits:true,signatureInvalidation:true,printComplete:true,blockedStorage:true,mockedFailureAndReceipt:true,liveSubmissionSent:false,axeFindings:0,errors});console.log('PASS',engine,lang,width);await context.close();
 }}finally{await browser.close()}
}fs.writeFileSync('reports/application-experience-browser.json',JSON.stringify({origin,rows,submissionResponsesMocked:true},null,2)+'\n');console.log('PASS',rows.length,'application experience views');})().catch(e=>{console.error(e);process.exit(1)});
