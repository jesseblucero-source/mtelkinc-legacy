const {chromium, webkit} = require(process.env.MT_PLAYWRIGHT_MODULE || 'playwright');
const AxeBuilder = require(process.env.MT_AXE_MODULE || '@axe-core/playwright').default;
const assert = require('node:assert/strict'), fs = require('node:fs');
const origin = process.argv[2] || 'http://127.0.0.1:8782';
const ids = ['751639142','751638698','751638462'];
const source = JSON.parse(fs.readFileSync('content/source/store-products.json'));
const sku = source.products.find(p => String(p.id) === ids[0]).sku;
(async () => {
 const report = {origin, rows: []};
 for (const [engine, type] of Object.entries({chromium, webkit})) {
  const browser = await type.launch();
  try {
   for (const [lang, width] of [['en',390],['fr',320],['es',768],['de',1440]]) {
    const context = await browser.newContext({viewport:{width,height:844}, reducedMotion:'reduce'});
    await context.addInitScript(() => {
     window.__shared = []; window.__copied = [];
     Object.defineProperty(navigator, 'share', {configurable:true, value:async data => { if(window.__cancelShare) throw new DOMException('Cancelled','AbortError'); window.__shared.push(data); }});
     Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async value => { if(window.__rejectCopy) throw new DOMException('Denied','NotAllowedError'); window.__copied.push(value); }}});
    });
    const p = await context.newPage(), errors = [];
    p.on('pageerror', e => errors.push(e.message));
    const pre = lang === 'en' ? '' : '/' + lang;
    await p.goto(origin + pre + '/catalog/categories/elk/');
    for (const id of ids) await p.locator('[data-compare-product][value="'+id+'"]').check();
    assert.equal(new URL(p.url()).searchParams.get('compare'), ids.join(','));
    assert.equal(await p.locator('[data-compare-chips] li').count(), 3);
    const fourth = p.locator('[data-catalog-product]:not([hidden]) [data-compare-product]:not(:checked)').first();
    await fourth.click();
    assert.equal(await p.locator('[data-compare-product]:checked').count(), 3);
    assert((await p.locator('[data-compare-feedback]').textContent()).length > 0);
    await p.locator('[name=q]').fill(sku);
    await p.locator('[data-catalog-filters] button').click();
    assert.equal(await p.locator('[data-catalog-product]:visible').count(), 1);
    assert.equal(await p.locator('[data-catalog-product]:visible').getAttribute('data-product-id'), ids[0]);
    await p.locator('[data-compare-rail] a').click();
    await p.waitForFunction(() => location.pathname.endsWith('/catalog/compare/') && !window.MTPageRouter?.booting);
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    assert.equal(await p.locator('[data-comparison-results] a[href$="/education/lessons/cow-talk-call-band-replacement/"]').count(), 1);
    assert.equal(await p.locator('[data-comparison-results] a[href^="/catalog/products/751638704/"]').count(), 1);
    assert((await p.locator('link[rel=canonical]').getAttribute('href')).endsWith(pre + '/catalog/compare/'));
    await p.locator('[data-compare-copy]').click();
    const copied = await p.evaluate(() => window.__copied[0]);
    assert.equal(copied, 'https://www.mtelkinc.com'+pre+'/catalog/compare/?compare='+ids.join('%2C'));
    await p.locator('[data-compare-share]').click();
    assert.equal(await p.evaluate(() => window.__shared[0].url), copied);
    await p.evaluate(() => {window.__cancelShare = true; window.__rejectCopy = true;});
    await p.locator('[data-compare-share]').click();
    assert.equal(await p.locator('[data-compare-manual]').isVisible(), false);
    await p.locator('[data-compare-copy]').click();
    assert(await p.locator('[data-compare-manual]').isVisible());
    assert.equal(await p.locator('[data-compare-url]').inputValue(), copied);
    await p.locator('[data-comparison-results] details').first().locator('summary').click();
    assert(await p.locator('[data-comparison-results] details[open]').first().isVisible());
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const a11y = await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(a11y.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})), []);
    if(engine === 'chromium' && ['en','de'].includes(lang)) await p.screenshot({path:'reports/catalog-comparison-'+lang+'.png',fullPage:true});
    await p.locator('[data-comparison-results] [data-compare-remove="'+ids[0]+'"]').click();
    assert.equal(await p.locator('[data-comparison-results] article').count(), 2);
    await p.goBack();
    await p.waitForFunction(() => document.querySelectorAll('[data-comparison-results] article').length === 3);
    await p.reload();
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    // Language navigation preserves selection and stays on the comparison page.
    const nextLang = lang === 'fr' ? 'de' : 'fr';
    await p.locator('a[data-site-language="'+nextLang+'"]').first().click();
    await p.waitForFunction(code => location.pathname === '/'+code+'/catalog/compare/' && !window.MTPageRouter?.booting, nextLang);
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    await p.locator('[data-comparison-results] a[href^="/catalog/products/"]').first().click();
    await p.waitForFunction(() => /\/catalog\/products\/\d+\//.test(location.pathname) && !window.MTPageRouter?.booting);
    assert.equal(await p.locator('[data-compare-product]:checked').count(), 1);
    await p.waitForFunction(() => document.querySelector('.music-toggle')?.textContent.includes('Music'));
    assert((await p.locator('.music-toggle').textContent()).includes('Music'));
    await p.locator('[data-compare-rail] a').click();
    await p.waitForFunction(() => location.pathname === '/catalog/compare/' && !window.MTPageRouter?.booting);
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    await p.locator('[data-compare-clear]').click();
    assert(await p.locator('[data-comparison-empty]').isVisible());
    assert.equal(await p.locator('[data-comparison-results] article').count(), 0);
    // Unknown, duplicate and excess IDs never inject markup or commercial facts.
    await p.goto(origin+pre+'/catalog/compare/?compare=bogus,751639142,751639142,751638698,751638462,751638443');
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    assert((await p.locator('[data-compare-feedback]').textContent()).length > 0);
    await p.locator('[name=product-0]').selectOption('751638443');
    await p.locator('[data-compare-form] button[type=submit]').click();
    assert.equal(new URL(p.url()).searchParams.get('compare'), ['751638443',ids[1],ids[2]].join(','));
    assert.equal(await p.locator('[data-comparison-results] article').count(), 3);
    assert.deepEqual(errors, []);
    console.log("PASS",engine,lang,width);
    report.rows.push({engine,lang,width,selectionLimit:true,skuSearch:true,combinedFilters:true,shareURL:true,nativeShareMock:true,cancelAndClipboardFallback:true,historyReload:true,languagePreserved:true,spaLifecycle:true,emptyAndInvalidStates:true,axeViolations:0,errors});
    await context.close();
   }
   const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});
   await nojs.goto(origin+'/catalog/compare/?compare='+ids.join(','));
   assert.equal(await nojs.locator('noscript a[href^="/catalog/products/"]').count(), 57);
   assert.equal(await nojs.locator('[data-compare-form]').isVisible(), false);
   await nojs.goto(origin+'/catalog/categories/elk/');
   assert((await nojs.locator('[data-catalog-product]:visible').count()) > 0);
   assert.equal(await nojs.locator('.catalog-compare-choice:visible').count(), 0);
   await nojs.close();
   const blocked = await browser.newContext({viewport:{width:320,height:844}});
   await blocked.addInitScript(() => {Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Denied','SecurityError')}});Object.defineProperty(window, 'sessionStorage', {get(){throw new DOMException('Denied','SecurityError')}})});
   const bp = await blocked.newPage();await bp.goto(origin+'/catalog/compare/?compare='+ids.join(','));
   assert.equal(await bp.locator('[data-comparison-results] article').count(),3);await blocked.close();
  } finally {await browser.close();}
 }
 fs.writeFileSync('reports/catalog-comparison-browser.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({engines:2,languageViews:report.rows.length,axeViolations:0,noJavaScript:true,blockedStorage:true}));
})().catch(error => {console.error(error);process.exit(1)});
