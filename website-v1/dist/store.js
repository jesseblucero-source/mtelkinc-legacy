import {configureYouTubePlayer} from './youtube-player.js?v=eb44b35f6e5f';
import {initStoreSuggestions} from './store-suggestions.js?v=3ea9813979be';
import {initStoreMotion} from './store-motion.js?v=5df109310ef5';
// Live catalog and checkout use the existing MT E.L.K., INC. Ecwid store.
let pending,routingGuard=false;
const persist=fn=>window.MTPageRouter?window.MTPageRouter.persist(fn):fn();
export function initPage(){
 const placeholder=document.getElementById('my-store-117609763');if(!placeholder)return;let cache=document.getElementById('site-store-cache');if(!cache){cache=document.createElement('div');cache.id='site-store-cache';cache.dataset.sitePersist='commerce';cache.hidden=true;document.body.append(cache)}const saved=cache.querySelector('#my-store-117609763'),host=saved||placeholder;if(saved)placeholder.replaceWith(saved);host.dataset.sitePersist='storefront';
 const stopMotion=initStoreMotion(host);
 const suggestions=initStoreSuggestions(host);
 const status=document.getElementById('store-status'),retry=document.getElementById('store-retry'),lang=document.documentElement.lang||'en';
 const copy={en:{loading:'Loading the store…',error:'The store could not load. Please retry or contact our team.'},fr:{loading:'Chargement de la boutique…',error:'La boutique n’a pas pu se charger. Réessayez ou contactez notre équipe.'},es:{loading:'Cargando la tienda…',error:'La tienda no pudo cargarse. Inténtelo de nuevo o contacte con nuestro equipo.'},de:{loading:'Shop wird geladen…',error:'Der Shop konnte nicht geladen werden. Versuchen Sie es erneut oder kontaktieren Sie unser Team.'}}[lang]||{loading:'Loading the store…',error:'The store could not load. Please retry or contact our team.'};
 let active=true,ready=false,apiReady=false,deadline,observer;const bound=fn=>window.MTPageRouter?window.MTPageRouter.bindPage(fn):fn;
 function configured(){window.ecwid_script_defer=true;window.ecwid_dynamic_widgets=true;window.ec=window.ec||{};ec.config=ec.config||{};ec.config.store_main_page_url=location.origin+location.pathname;ec.config.chameleon={font:{'font-family':'Roboto,Arial,sans-serif'},colors:{'color-background':'#faf6f3','color-foreground':'#0d1311','color-link':'#8b271e','color-button':'#ec4123','color-price':'#0d1311'}};ec.config.scroll_indent=76;ec.config.storefrontUrls=ec.config.storefrontUrls||{};ec.config.storefrontUrls.cleanUrls=false;window._xnext_initialization_scripts=[{widgetType:'ProductBrowser',id:host.id,arg:['id='+host.id,'categoriesPerRow=3','views=grid(3,24) list(60) table(60)','categoryView=grid','searchView=grid','defaultCategoryId=0']}];}
 function loaded(){if(!active||ready||!apiReady)return;ready=true;clearTimeout(deadline);status.hidden=true;retry.hidden=true;document.querySelectorAll('[data-store-action],[data-store-category],#store-search button,#store-reset').forEach(b=>b.disabled=false);}
 function failed(){if(!active||ready)return;status.hidden=false;status.textContent=copy.error;retry.hidden=false;}
 async function start(){status.hidden=false;status.textContent=copy.loading;retry.hidden=true;ready=false;deadline=setTimeout(failed,20000);
  try{persist(()=>{configured();});
   if(!document.getElementById('ecwid-store-script')){
    pending=persist(()=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.id='ecwid-store-script';script.dataset.sitePersist='commerce';script.src='https://app.ecwid.com/script.js?117609763&lang='+encodeURIComponent(lang)+'&data_platform=code';script.charset='utf-8';script.async=true;script.onload=resolve;script.onerror=()=>{script.remove();pending=null;reject(Error('Store unavailable'))};document.body.append(script)}));
    await pending;
   }else{if(pending)await pending;if(!active)return;if(!saved)persist(()=>{configured();window.ecwid_onBodyDone?.()});}
   if(!active)return;
   persist(()=>Ecwid.OnAPILoaded.add(bound(()=>{if(!active)return;apiReady=true;loaded();suggestions.connect();if(!routingGuard){routingGuard=true;persist(()=>Ecwid.OnPageSwitch.add(()=>/^(?:\/(?:fr|es|de))?\/shop\/$/.test(location.pathname)?undefined:false));}persist(()=>Ecwid.setStorefrontBaseUrl(location.origin+location.pathname));applyBrowseUrl();})));if(host.querySelector('.ec-store,.ecwid-productBrowser'))loaded();
  }catch{failed();}
 }
 const videoLabel={en:'Product video',fr:'Vidéo du produit',es:'Vídeo del producto',de:'Produktvideo'}[lang]||'Product video';let videoDialog,videoOpener;
 function keepVideosOnSite(){for(const a of host.querySelectorAll('a[href]')){let url;try{url=new URL(a.href)}catch{continue}if(!/^(?:www\.)?(?:youtube\.com|youtu\.be)$/.test(url.hostname))continue;const id=url.hostname.endsWith('youtu.be')?url.pathname.slice(1):url.searchParams.get('v')||url.pathname.match(/\/(?:shorts|embed)\/([^/]+)/)?.[1];a.dataset.originalVideoUrl=a.href;a.removeAttribute('target');if(id&&/^[A-Za-z0-9_-]{11}$/.test(id)){a.dataset.storeVideoId=id;a.href='#store-video'}else a.href=(lang==='en'?'':'/'+lang)+'/videos/';}}
 function clearVideo(){videoDialog?.querySelector('iframe')?.remove();}
 function openVideo(event){const a=event.target.closest?.('[data-store-video-id]');if(!a||!active)return;event.preventDefault();event.stopPropagation();videoOpener=a;if(!videoDialog){videoDialog=document.createElement('dialog');videoDialog.className='store-video-dialog';videoDialog.setAttribute('aria-label',videoLabel);const close=document.createElement('button');close.type='button';close.textContent={en:'Close ×',fr:'Fermer ×',es:'Cerrar ×',de:'Schließen ×'}[lang]||'Close ×';close.onclick=()=>{clearVideo();videoDialog.close();};videoDialog.append(close);videoDialog.addEventListener('cancel',clearVideo);videoDialog.addEventListener('close',()=>{clearVideo();if(videoOpener?.isConnected)videoOpener.focus({preventScroll:true})});document.body.append(videoDialog)}clearVideo();const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+a.dataset.storeVideoId+'?autoplay=0&playsinline=1&rel=0';configureYouTubePlayer(frame);frame.title=videoLabel;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;videoDialog.append(frame);videoDialog.showModal();videoDialog.querySelector('button').focus();}
 host.addEventListener('click',openVideo,true);
 observer=new MutationObserver(()=>{keepVideosOnSite();if(host.querySelector('.grid-category,.grid-product,.ec-cart,.product-details,.ecwid-productBrowser-productsGrid,.ecwid-productBrowser-CartPage'))loaded();});observer.observe(host,{childList:true,subtree:true});keepVideosOnSite();
 retry.addEventListener('click',()=>{clearTimeout(deadline);start();});
 document.querySelectorAll('[data-store-action]').forEach(button=>button.addEventListener('click',()=>{if(!ready||!window.Ecwid?.openPage)return;const action=button.dataset.storeAction;persist(()=>{Ecwid.OnAPILoaded.add(()=>{if(!active)return;if(action==='all')Ecwid.openPage('search',{priceFrom:'0'});else if(action==='cart')Ecwid.openPage('cart');else if(action==='account')Ecwid.openPage('account');else Ecwid.openPage('category',{id:0});});});host.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));

 let lastBrowseSearch=location.search;
 const searchForm=document.getElementById('store-search'),queryInput=document.getElementById('store-query'),categoryButtons=[...document.querySelectorAll('[data-store-category]')];
 function markCategory(slug){categoryButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.storeCategory===slug)));}
 function scrollCatalog(){host.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 function browse(page,params={}){if(!apiReady||!active)return;persist(()=>Ecwid.openPage(page,params));}
 function setBrowseUrl(q,category){const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('category');if(q)url.searchParams.set('q',q);if(category)url.searchParams.set('category',category);history.replaceState(history.state,'',url.pathname+url.search+url.hash);lastBrowseSearch=location.search;queryInput.value=q||'';markCategory(category);}
 function applyBrowseUrl(){lastBrowseSearch=location.search;const params=new URLSearchParams(location.search),q=(params.get('q')||'').trim().slice(0,100),slug=params.get('category'),category=categoryButtons.find(b=>b.dataset.storeCategory===slug);queryInput.value=q;markCategory(category?.dataset.storeCategory);if(q)browse('search',{keyword:q});else if(category)browse('category',{id:Number(category.dataset.categoryId)});}
 categoryButtons.forEach(button=>button.addEventListener('click',()=>{if(!ready)return;setBrowseUrl('',button.dataset.storeCategory);browse('category',{id:Number(button.dataset.categoryId)});scrollCatalog();}));
 searchForm.addEventListener('submit',event=>{event.preventDefault();if(!ready)return;const q=queryInput.value.trim().slice(0,100);setBrowseUrl(q,'');browse('search',q?{keyword:q}:{priceFrom:'0'});scrollCatalog();});
 document.getElementById('store-reset').addEventListener('click',()=>{if(!ready)return;setBrowseUrl('','');browse('category',{id:0});scrollCatalog();});
 document.querySelectorAll('[data-store-action]').forEach(button=>button.addEventListener('click',()=>{if(ready&&['categories','all'].includes(button.dataset.storeAction))setBrowseUrl('','');}));
 window.addEventListener('popstate',()=>{if(active&&apiReady&&lastBrowseSearch!==location.search)applyBrowseUrl();});
 const titleObserver=new MutationObserver(()=>{if(active&&!document.title.includes('MT E.L.K., INC.'))document.title=document.title+' | MT E.L.K., INC.';});titleObserver.observe(document.head,{childList:true,subtree:true,characterData:true});
 const leave=()=>{active=false;stopMotion();suggestions.leave();titleObserver.disconnect();host.removeEventListener('click',openVideo,true);clearVideo();if(videoDialog?.open)videoDialog.close();clearTimeout(deadline);observer.disconnect();cache.append(host);cache.hidden=true;};
 if(window.MTPageRouter)window.MTPageRouter.onLeave(leave);else window.addEventListener('pagehide',leave);
 start();
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
