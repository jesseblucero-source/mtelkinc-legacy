export function initPage(){
 const section=document.querySelector('#legacy-records')||document.querySelector('[data-archive-page]');if(!section)return;
 const copy=JSON.parse(document.querySelector('[data-legacy-ui]').textContent);
 const refine=section.querySelector('.archive-refine');
 if(refine){const wide=matchMedia('(min-width:761px)'),params=new URLSearchParams(location.search),filtered=['year','type'].some(key=>params.has(key)&&params.get(key)!=='all');refine.open=wide.matches||filtered;wide.addEventListener('change',()=>{refine.open=wide.matches||filtered;});}

 const dialog=document.querySelector('.legacy-preview-dialog'),image=dialog.querySelector('img'),title=dialog.querySelector('h2'),scroll=dialog.querySelector('.legacy-preview-scroll'),zoom=dialog.querySelector('[data-preview-zoom]'),source=dialog.querySelector('a');let trigger;
 section.querySelectorAll('[data-legacy-preview]').forEach(link=>link.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||typeof dialog.showModal!=='function')return;
  event.preventDefault();trigger=link;const card=link.closest('.legacy-record,.record-card'),original=link.querySelector('img');image.src=original.src;image.alt=original.alt;title.textContent=link.dataset.previewTitle||card?.querySelector('h3')?.textContent||document.querySelector('h1').textContent;source.href=link.dataset.previewSource||card.querySelector('.article-reader-sources a').href;source.textContent=(link.dataset.previewSourceLabel||copy.source)+' →';scroll.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent=copy.zoom;document.documentElement.classList.add('legacy-preview-open');dialog.showModal();dialog.querySelector('[data-preview-close]').focus();
 }));
 zoom.addEventListener('click',()=>{const expanded=scroll.classList.toggle('is-zoomed');zoom.setAttribute('aria-pressed',String(expanded));zoom.textContent=expanded?copy.fit:copy.zoom;});
 dialog.querySelector('[data-preview-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('legacy-preview-open');trigger?.focus()});
 const leave=()=>{if(dialog.open)dialog.close()};if(window.MTPageRouter)window.MTPageRouter.onLeave(leave);else window.addEventListener('pagehide',leave,{once:true});
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
