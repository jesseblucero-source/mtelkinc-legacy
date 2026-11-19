const {chromium,webkit}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright');
const AxeBuilder=require(process.env.MT_AXE_MODULE||'@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8780';
const products=JSON.parse(fs.readFileSync('content/source/store-products.json')).products;
(async()=>{const rows=[];for(const[engine,type]of Object.entries({chromium,webkit})){
 const browser=await type.launch();try{
  for(const[lang,width]of[['en',390],['fr',320],['es',768],['de',1440]]){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const pre=lang==='en'?'':'/'+lang;
   await p.goto(origin+pre+'/catalog/?q=cow&category=elk');
   const expected=products.filter(x=>x.name.toLowerCase().includes('cow')&&x.categories.includes('elk')).length;
   assert.equal(await p.locator('[data-catalog-product]:visible').count(),expected);
   await p.locator('[name=q]').fill('no-matching-product-zzzz');await p.locator('[data-catalog-filters] button').click();assert(await p.locator('[data-catalog-empty]').isVisible());assert(new URL(p.url()).searchParams.has('category'));
   await p.goBack();await p.waitForFunction(()=>document.querySelector('[name=q]').value==='cow');assert.equal(await p.locator('[data-catalog-product]:visible').count(),expected);
   await p.reload();assert.equal(await p.locator('[data-catalog-product]:visible').count(),expected);
   await p.goto(origin+pre+'/catalog/categories/predator/');assert.equal(await p.locator('[data-catalog-product]:visible').count(),products.filter(x=>x.categories.includes('predator')).length);
   await p.locator('[name=category]').selectOption('bands-reeds');await p.locator('[data-catalog-filters] button').click();assert.equal(await p.locator('[data-catalog-product]:visible').count(),products.filter(x=>x.categories.includes('bands-reeds')).length);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const a11y=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   rows.push({engine,lang,width,combinedFilters:true,emptyState:true,history:true,categorySwitch:true,overflow:false,axe:a11y.violations.map(v=>({id:v.id,nodes:v.nodes.slice(0,2).map(n=>n.target)})),errors});
   if(lang==='en')await p.screenshot({path:'/private/tmp/mtelk-catalog-'+engine+'.png',fullPage:false});await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage();await p.goto(origin+'/catalog/products/751639142/');
  assert((await p.locator('h1').textContent()).includes('COW TALK'));assert.equal(await p.locator('a[href="/education/lessons/cow-talk-call-band-replacement/"]').count(),1);
  const a11y=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();rows.push({engine,product:true,axe:a11y.violations.map(v=>({id:v.id,nodes:v.nodes.slice(0,2).map(n=>n.target)}))});
  await p.locator('.catalog-page>a[href="/catalog/"]').click();await p.waitForFunction(()=>location.pathname==='/catalog/'&&!MTPageRouter.booting);assert.equal(await p.locator('[data-catalog-product]:visible').count(),57);
  await p.locator('[name=q]').fill('yote');await p.locator('[data-catalog-filters] button').click();assert((await p.locator('[data-catalog-product]:visible').count())>0);await context.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});await nojs.goto(origin+'/catalog/categories/elk/');assert.equal(await nojs.locator('[data-catalog-product]:visible').count(),products.filter(x=>x.categories.includes('elk')).length);await nojs.goto(origin+'/catalog/products/751639142/');assert(await nojs.locator('a.button[href*="/shop/#!/"]').isVisible());await nojs.close();
 }finally{await browser.close()}
}fs.writeFileSync('reports/public-authority-browser.json',JSON.stringify({origin,rows},null,2)+'\n');console.log(JSON.stringify(rows));assert(rows.every(r=>!r.axe?.length&&!r.errors?.length));})().catch(e=>{console.error(e);process.exit(1)});
