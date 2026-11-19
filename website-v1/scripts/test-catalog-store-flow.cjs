const {chromium}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.argv[2]||'http://127.0.0.1:8780';
(async()=>{const browser=await chromium.launch(),out=[];try{for(const width of[390,1440]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),p=await context.newPage();let cartTouched=false;
 try{
  await p.goto(origin+'/catalog/products/751639142/');
  await p.locator('.catalog-page a.button[href*="/shop/#!/"]').click();
  await p.waitForFunction(()=>location.pathname==='/shop/'&&window.Ecwid&&!document.querySelector('[data-store-action=cart]').disabled,null,{timeout:60000});
  const add=p.getByRole('button',{name:/Add to Bag|Add to cart/i}).first();await add.waitFor({timeout:45000});await add.click();cartTouched=true;
  await p.locator('[data-store-action=cart]').click();await p.waitForFunction(()=>document.querySelector('#my-store-117609763 input[type=email],#my-store-117609763 input[autocomplete=email],#my-store-117609763 input[inputmode=email]'),null,{timeout:30000});
  assert(p.url().startsWith(origin+'/shop/'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  out.push({width,productGuideToLiveStore:true,anonymousCart:true,onSiteCheckoutEntry:true,customerDataEntered:false,ordersPlaced:0,paymentAuthorization:'Not attempted; merchant sandbox required',canonicals:await p.locator('link[rel=canonical]').evaluateAll(nodes=>nodes.map(n=>n.href))});
 }finally{
  if(cartTouched)await p.evaluate(()=>new Promise(resolve=>Ecwid.Cart.clear(resolve))).catch(()=>{});
  await context.close();
 }
}}finally{await browser.close()}fs.writeFileSync('reports/catalog-store-flow.json',JSON.stringify({origin,results:out},null,2)+'\n');console.log(JSON.stringify(out));})().catch(e=>{console.error(e);process.exit(1)});
