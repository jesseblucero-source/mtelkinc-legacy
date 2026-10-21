// Local integration checks mock YouTube's response; they do not assert actual video playback.
const {chromium}=require(process.env.MT_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('assert');
(async()=>{const browser=await chromium.launch();const base=process.argv[2]||'http://127.0.0.1:8772';try{
for(const [route,selector,width] of [
 ['/videos/','[data-play]',390],['/education/','[data-video]',320],['/banding/','[data-video]',390],
 ['/videos/watch/UkZx7Ld_SZg/','[data-video]',1440],['/canada/presentation/#slide-4','[data-video]',390],
 ['/fr/education/','[data-video]',390],['/es/education/','[data-video]',390],['/de/education/','[data-video]',390],
 ['/shop/','[data-store-video-id]',390]
]){
 const p=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});const requests=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.route('https://www.youtube-nocookie.com/embed/**',async r=>{requests.push({url:r.request().url(),headers:await r.request().allHeaders()});await r.fulfill({contentType:'text/html',body:'<!doctype html><title>Embedded-player configuration test</title><p>Provider response mocked</p>'})});
 await p.goto(base+route,{waitUntil:'domcontentloaded'});
 if(route==='/shop/'){
  await p.waitForFunction(()=>window.Ecwid&&!document.querySelector('[data-store-action=all]').disabled,null,{timeout:60000});
  await p.evaluate(()=>{const a=document.createElement('a');a.href='https://www.youtube.com/watch?v=UkZx7Ld_SZg';a.textContent='Test product video';document.querySelector('#my-store-117609763').append(a)});
 }
 const button=p.locator(selector+':visible').first();await button.waitFor();await button.click();
 const frame=p.locator('iframe[src*="youtube-nocookie.com/embed/"]');await frame.waitFor();await p.waitForFunction(()=>document.querySelector('iframe[src*="youtube-nocookie.com/embed/"]')?.contentWindow);
 await p.frameLocator('iframe[src*="youtube-nocookie.com/embed/"]').getByText('Provider response mocked').waitFor();
 assert.equal(await frame.getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');const u=new URL(await frame.getAttribute('src'));assert.equal(u.searchParams.get('origin'),base);assert.equal(u.searchParams.get('playsinline'),'1');assert(requests.length===1);assert.equal(requests[0].headers.referer,base+'/');assert(p.url().startsWith(base+'/'));
 const rect=await frame.boundingBox();assert(rect.width>=200&&rect.height>=200,JSON.stringify(rect));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('iframe[src*="youtube-nocookie.com/embed/"]'));
 assert.deepEqual(errors,[]);console.log('PASS',route,width,'identity/referrer, on-site player, minimum viewport, close cleanup');await p.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
