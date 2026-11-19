// Read the same public catalog response as the existing storefront. No merchant API token.
const {chromium}=require(process.env.MT_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),origin='https://www.mtelkinc.com';
(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage();
 try {
  let resolve;const response=new Promise(r=>resolve=r);
  page.on('response',async r=>{
   if(/^https:\/\/[a-z0-9-]+\.ecwid\.com\/storefront\/api\/v1\/117609763\/catalog\/search$/.test(r.url())){
    try{resolve(await r.json())}catch{}
   }
  });
  await page.goto(origin+'/shop/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.Ecwid&&!document.querySelector('[data-store-action=all]').disabled,null,{timeout:45000});
  await page.locator('[data-store-action=all]').click();
  const raw=await Promise.race([response,new Promise((_,reject)=>setTimeout(()=>reject(Error('Public catalog timed out')),45000))]);
  if(!raw.products?.length||raw.products.length!==raw.totalProductsCount)throw Error('Incomplete catalog; pagination must be reconciled before applying.');
  const categories=JSON.parse(fs.readFileSync(path.join(root,'content/store-categories.json')));
  const normalized=await page.evaluate(({items,categories,origin})=>items.map(item=>{
   const id=item.identifier?.productId;if(!Number.isSafeInteger(id)||item.identifier.type!=='PUBLISHED')throw Error('Invalid published identity');
   const ld=JSON.parse(item.seo?.jsonLD||'{}');
   const doc=new DOMParser().parseFromString(item.description||'','text/html');
   doc.querySelectorAll('script,style,iframe,object,embed').forEach(n=>n.remove());
   doc.querySelectorAll('p,div,li,br,h1,h2,h3').forEach(n=>n.append('\n'));
   const description=doc.body.textContent.replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n\n').trim();
   const image=Array.isArray(ld.image)?ld.image[0]:ld.image;
   const fragment=new URL(item.urls.directPageUrl).hash;
   if(!fragment.endsWith('/p/'+id))throw Error('Product destination does not match identity');
   const categoryIds=new Set(item.categoryPaths.flatMap(p=>p.categoryPath.map(c=>c.id)));
   const videoIds=[...new Set([...String(item.description||'').matchAll(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/g)].map(m=>m[1]))];
   const images=(Array.isArray(ld.image)?ld.image:ld.image?[ld.image]:[]).map(i=>typeof i==='string'?{url:i}:({url:i.contentUrl||i.url,width:i.width||null,height:i.height||null,thumbnail:i.thumbnail?.contentUrl||i.thumbnailUrl||null})).filter(i=>/^https:\/\/d2j6dbq0eux0bg\.cloudfront\.net\//.test(i.url||''));
   return {id,name:item.name,brand:typeof ld.brand==='string'?ld.brand:ld.brand?.name||null,sku:typeof ld.sku==='string'?ld.sku:null,gtin:ld.gtin||ld.gtin13||ld.gtin12||null,
    image:images[0]?.url||null,images,source_url:origin+'/shop/'+fragment,legacy_source_url:item.urls.directPageUrl,
    source_description_html:item.description||'',description,categories:categories.filter(c=>categoryIds.has(c.id)).map(c=>c.slug),video_ids:videoIds,
    stock_note:'Check current options, price and availability in the live Ecwid storefront.',status:'published',
    specifications:null,materials:null,retail_price:null,availability:null};
  }),{items:raw.products,categories,origin});
  normalized.sort((a,b)=>a.id-b.id);
  if(new Set(normalized.map(p=>p.id)).size!==normalized.length)throw Error('Duplicate product identity');
  const previous=JSON.parse(fs.readFileSync(path.join(root,'content/source/store-products.json')));
  const oldIds=new Set(previous.products.map(p=>p.id)),newIds=new Set(normalized.map(p=>p.id));
  const changes={added:[...newIds].filter(id=>!oldIds.has(id)),unlisted:[...oldIds].filter(id=>!newIds.has(id)),count:normalized.length};
  const output={source:'https://elkinc.com/products/',store_id:117609763,captured_on:new Date().toISOString().slice(0,10),
   capture_method:'Read-only browser response from the existing public Ecwid storefront; public identity, approved description and images only.',
   usage:'Authoritative public identity snapshot of Ecwid. Merchant catalog remains the source of truth; pricing, inventory, options and checkout stay live there. No private merchant data.',products:normalized};
  fs.mkdirSync(path.join(root,'reports'),{recursive:true});
  fs.writeFileSync(path.join(root,'reports/catalog-refresh.json'),JSON.stringify({captured_on:output.captured_on,...changes,applied:process.argv.includes('--apply')},null,2)+'\n');
  if(changes.unlisted.length)throw Error('Unlisted products require owner reconciliation; previous snapshot retained.');
  const destination=path.join(root,process.argv.includes('--apply')?'content/source/store-products.json':'reports/catalog-candidate.json');
  fs.writeFileSync(destination,JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({...changes,applied:process.argv.includes('--apply'),destination}));
 } finally {await browser.close()}
})().catch(error=>{console.error(error.message);process.exit(1)});
