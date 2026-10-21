import {selectSuggestions} from './store-suggestion-rules.js?v=b616efc21d49';
let connected=false,view={type:'CATEGORY',categoryId:0},cartIds=[],current=null;
const persist=fn=>window.MTPageRouter?window.MTPageRouter.persist(fn):fn();
function safePage(page){return{type:String(page.type||''),productId:Number(page.productId)||0,categoryId:Number(page.categoryId)||0,mainCategoryId:Number(page.mainCategoryId)||0};}
export function initStoreSuggestions(host){
 const section=document.querySelector('[data-store-suggestions]');if(!section)return{connect(){},leave(){}};
 const copy=JSON.parse(section.querySelector('[data-suggestion-copy]').textContent),list=section.querySelector('[data-suggestion-list]'),heading=section.querySelector('h2'),note=section.querySelector('[data-suggestion-context]'),shortcut=document.querySelector('.store-suggestions-shortcut'),position=section.querySelector('[data-suggestion-position]'),previous=section.querySelector('[data-suggestion-direction="-1"]'),next=section.querySelector('[data-suggestion-direction="1"]');
 const home=document.createComment('suggestions return position');section.before(home);
 const callout=document.createElement('aside');callout.className='store-addons-callout';callout.hidden=true;callout.setAttribute('aria-label',copy.shortcut);
 const intro=document.createElement('div'),label=document.createElement('p'),calloutTitle=document.createElement('h2'),mini=document.createElement('div'),browse=document.createElement('a');intro.className='store-addons-intro';label.className='store-addons-label';label.textContent=copy.shortcut;mini.className='store-addons-preview';browse.className='store-addons-browse';browse.href='#store-recommendations';intro.append(label,calloutTitle);callout.append(intro,mini,browse);
 let active=true,data=null,last='',abort=new AbortController(),frame=0,chosen=[];
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function returnSection(){if(home.isConnected&&section.previousSibling!==home)home.after(section);}
 function place(){
  if(!active)return;
  const product=view.type==='PRODUCT'?host.querySelector('.product-details'):null,cart=view.type==='CART'?host.querySelector('.ec-cart'):null,target=product||cart;
  if(target&&section.previousElementSibling!==target)target.after(section);
  else if(!target)returnSection();
  if(!target||!chosen.length){callout.hidden=true;callout.remove();return;}
  const near=product?(product.querySelector('.details-product-purchase')||product.querySelector('.product-details__sidebar')):(cart.querySelector('.ec-cart__products'));
  const anchor=near||target;if(product&&near){if(callout.parentElement!==near)near.append(callout);}else if(callout.previousElementSibling!==anchor)anchor.after(callout);
  // If no purchase-area selector is present, keep the preview before the full row.
  if(anchor===target&&section.previousElementSibling!==callout)callout.after(section);
  callout.hidden=false;
 }
 function updatePosition(){frame=0;if(!active||section.hidden||!list.children.length)return;const cards=[...list.children],first=cards[0],step=(cards[1]?.offsetLeft-first.offsetLeft)||first.getBoundingClientRect().width,start=Math.min(cards.length,Math.max(1,Math.round(list.scrollLeft/step)+1)),visible=Math.max(1,Math.floor((list.clientWidth+16)/step)),end=Math.min(cards.length,start+visible-1),max=list.scrollWidth-list.clientWidth;
  previous.disabled=list.scrollLeft<=2;next.disabled=list.scrollLeft>=max-2;position.textContent=(start===end?start:start+'–'+end)+' / '+cards.length;position.setAttribute('aria-label',copy.position.replace('{start}',start).replace('{end}',end).replace('{total}',cards.length));section.dataset.suggestionOverflow=String(max>2);
 }
 function schedulePosition(){if(!frame)frame=requestAnimationFrame(updatePosition);}
 function productLink(p,attr){const link=document.createElement('a');link.href=location.pathname+'#!/'+encodeURIComponent(p.name.replace(/[^a-z0-9]+/gi,'-'))+'/p/'+p.id;link.dataset[attr]=p.id;return link;}
 function image(p,size){const image=document.createElement('img');image.src=p.image;image.alt='';image.width=size;image.height=size===64?64:240;image.loading='lazy';image.decoding='async';return image;}
 const controller={hide(){section.hidden=true;shortcut.hidden=true;callout.hidden=true;last='';chosen=[];returnSection();callout.remove();},render(){if(!active||!data)return;chosen=selectSuggestions(data,view,cartIds);const key=JSON.stringify([view.type,view.productId,view.categoryId,cartIds,chosen.map(p=>p.id)]);if(key===last){place();schedulePosition();return;}last=key;section.hidden=!chosen.length;shortcut.hidden=!chosen.length;if(!chosen.length){list.replaceChildren();callout.remove();returnSection();return;}
 heading.textContent=view.type==='PRODUCT'?copy.product:view.type==='CART'?copy.cart:copy.title;note.textContent=view.type==='CART'?copy.cartNote:copy.context;
 const focus=document.activeElement,focused=focus?.closest('[data-suggestion-product],[data-addon-product]'),focusedId=focused?.dataset.suggestionProduct||focused?.dataset.addonProduct,wasMini=!!focused?.dataset.addonProduct;
 list.replaceChildren(...chosen.map(p=>{const item=document.createElement('li');item.className='store-suggestion-card';const link=productLink(p,'suggestionProduct'),body=document.createElement('div');body.className='store-suggestion-copy';const reason=document.createElement('span');reason.className='store-suggestion-reason';reason.textContent=copy.reasons[p.reason]||copy.reasons.related;const title=document.createElement('h3');title.dataset.liveStore='product-name';title.textContent=p.name;const cta=document.createElement('span');cta.className='store-suggestion-cta';cta.textContent=copy.view+' →';body.append(reason,title,cta);link.append(image(p,320),body);item.append(link);return item;}));
 calloutTitle.textContent=view.type==='CART'?copy.calloutCart:copy.calloutProduct;browse.textContent=copy.browse.replace('{n}',chosen.length)+' ↓';mini.replaceChildren(...chosen.slice(0,2).map(p=>{const a=productLink(p,'addonProduct'),text=document.createElement('span');text.dataset.liveStore='product-name';text.textContent=p.name;a.append(image(p,64),text);return a;}));
 place();list.scrollLeft=0;schedulePosition();
 if(focusedId){const scope=wasMini?mini:list,selector=wasMini?'data-addon-product':'data-suggestion-product',target=scope.querySelector('['+selector+'="'+focusedId+'"]');if(target)target.focus({preventScroll:true});else heading.focus({preventScroll:true});}
 }};
 function openProduct(event){const link=event.target.closest('[data-suggestion-product],[data-addon-product]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();event.stopPropagation();const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('category');history.replaceState(history.state,'',url.pathname+url.search+url.hash);const query=document.querySelector('#store-query');if(query)query.value='';document.querySelectorAll('[data-store-category]').forEach(button=>button.setAttribute('aria-pressed','false'));persist(()=>Ecwid.openPage('product',{id:Number(link.dataset.suggestionProduct||link.dataset.addonProduct)}));host.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});}
 list.addEventListener('click',openProduct);mini.addEventListener('click',openProduct);
 function jump(event){event.preventDefault();event.stopPropagation();heading.focus({preventScroll:true});section.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});}
 browse.addEventListener('click',jump);shortcut.addEventListener('click',jump);
 section.querySelectorAll('[data-suggestion-direction]').forEach(button=>button.addEventListener('click',()=>{const cards=list.children,step=cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:list.clientWidth;list.scrollBy({left:Number(button.dataset.suggestionDirection)*step,behavior:reduced()?'instant':'smooth'});}));
 list.addEventListener('scroll',schedulePosition,{passive:true});const resize=new ResizeObserver(schedulePosition);resize.observe(list);
 const placementObserver=new MutationObserver(()=>{if(active&&chosen.length&&['PRODUCT','CART'].includes(view.type)&&(!host.contains(section)||!host.contains(callout)))place();});placementObserver.observe(host,{childList:true,subtree:true});
 async function connect(){if(!active)return;current=controller;
  if(!connected){connected=true;persist(()=>{Ecwid.OnPageSwitch.add(page=>{view=safePage(page);current?.hide();return undefined;});Ecwid.OnPageLoaded.add(page=>{view=safePage(page);current?.render();});Ecwid.OnCartChanged.add(cart=>{cartIds=(cart.items||[]).map(item=>Number(item.product?.id)).filter(Boolean);current?.render();});});}
  Ecwid.Cart.get(cart=>{if(!active)return;cartIds=(cart.items||[]).map(item=>Number(item.product?.id)).filter(Boolean);controller.render();});
  try{const response=await fetch(section.dataset.catalog,{signal:abort.signal});if(!response.ok)throw Error('Unavailable');const payload=await response.json();if(!active)return;data=payload;controller.render();}catch{if(active)controller.hide();}
 }
 function leave(){active=false;abort.abort();resize.disconnect();placementObserver.disconnect();if(frame)cancelAnimationFrame(frame);callout.remove();returnSection();home.remove();if(current===controller)current=null;}
 return{connect,leave};
}
