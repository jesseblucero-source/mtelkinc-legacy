export function initPage(){
 for(const panel of document.querySelectorAll('[data-guide-share]')){
  const input=panel.querySelector('input'),share=panel.querySelector('[data-guide-native]'),copy=panel.querySelector('[data-guide-copy]'),status=panel.querySelector('[role=status]');
  let pending=false;
  async function copyLink(){
   try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(input.value);if(panel.isConnected)status.textContent=panel.dataset.copied;}
   catch{if(!panel.isConnected)return;input.focus();input.select();input.setSelectionRange(0,input.value.length);status.textContent=panel.dataset.manual;}
  }
  async function run(action){if(pending)return;pending=true;share.disabled=copy.disabled=true;status.textContent='';try{await action()}finally{pending=false;if(panel.isConnected)share.disabled=copy.disabled=false;}}
  copy.hidden=false;
  copy.addEventListener('click',()=>run(copyLink));
  if(typeof navigator.share==='function'){
   share.hidden=false;
   share.addEventListener('click',()=>run(async()=>{
    try{await navigator.share({title:panel.dataset.title,url:input.value});if(panel.isConnected)status.textContent=panel.dataset.shared;}
    catch(error){if(error.name!=='AbortError'&&panel.isConnected)await copyLink();}
   }));
  }
 }
 for(const reader of document.querySelectorAll('[data-business-reader]')){
  const open=reader.querySelector('[data-load-business-guide]'),intro=reader.querySelector('[data-business-guide-intro]'),stage=reader.querySelector('[data-business-guide-stage]'),toolbar=reader.querySelector('[data-business-guide-toolbar]'),close=reader.querySelector('[data-close-business-guide]'),expand=reader.querySelector('[data-expand-business-guide]'),status=reader.querySelector('[data-business-guide-status]');
  let frame,timer,active=true;
  function unload(focus=true){clearTimeout(timer);frame?.remove();frame=null;stage.hidden=toolbar.hidden=true;intro.hidden=false;status.textContent='';if(focus&&open.isConnected)open.focus({preventScroll:true});}
  open.hidden=false;
  open.addEventListener('click',()=>{
   if(frame)return;
   const url=new URL(open.dataset.embed);
   if(url.origin!=='https://heyzine.com'||!/^\/flip-book\/(?:4883e99951|3cff2c65cf)\.html$/.test(url.pathname)){status.textContent=reader.dataset.fallback;return;}
   frame=document.createElement('iframe');frame.title=open.dataset.guideTitle;frame.allow='fullscreen; clipboard-write';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=url.href;
   frame.addEventListener('load',()=>{if(active&&frame){clearTimeout(timer);status.textContent=reader.dataset.ready;}});
   frame.addEventListener('error',()=>{if(active)status.textContent=reader.dataset.fallback;});
   stage.replaceChildren(frame);intro.hidden=true;stage.hidden=toolbar.hidden=false;status.textContent=reader.dataset.loading;
   expand.hidden=!(document.fullscreenEnabled&&reader.requestFullscreen);
   close.focus({preventScroll:true});timer=setTimeout(()=>{if(active&&frame)status.textContent=reader.dataset.fallback;},15000);
  });
  close.addEventListener('click',()=>{if(document.fullscreenElement===reader)document.exitFullscreen().catch(()=>{});unload();});
  expand.addEventListener('click',async()=>{try{if(document.fullscreenElement===reader)await document.exitFullscreen();else await reader.requestFullscreen();}catch{status.textContent=reader.dataset.expandError;}});
  document.addEventListener('fullscreenchange',()=>{expand.textContent=document.fullscreenElement===reader?expand.dataset.exit:expand.dataset.expand;});
  if(window.MTPageRouter)window.MTPageRouter.onLeave(()=>{active=false;unload(false);});
 }
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
