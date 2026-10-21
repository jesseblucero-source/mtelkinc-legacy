import {configureYouTubePlayer} from './youtube-player.js?v=eb44b35f6e5f';
export function initPage(){
(() => {
 const hub=document.querySelector('[data-education-library]');if(!hub)return;
 const form=hub.querySelector('form'),cards=[...hub.querySelectorAll('[data-item]')],controls=[...form.querySelectorAll('input,select')],count=hub.querySelector('.result-count'),empty=hub.querySelector('.library-empty'),chips=hub.querySelector('.education-active-filters'),refine=hub.querySelector('.education-refinements');let timer;
 function readURL(){const params=new URLSearchParams(location.search);for(const c of controls){const value=params.get(c.name)||'all';c.value=c.tagName==='SELECT'?[...c.options].some(o=>o.value===value)?value:'all':params.get(c.name)||'';}if(innerWidth>760||controls.some(c=>c.value&&c.value!=='all'))refine.open=true;}
 function apply(write){clearTimeout(timer);const data=new FormData(form),query=String(data.get('q')||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');let n=0;
  for(const c of cards){const match=[...data].every(([key,value])=>key==='q'?c.dataset.search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query):value==='all'||!value||c.dataset[key]===value);c.hidden=!match;if(match)n++;}
  count.textContent=n+(n===1?' lesson available':' lessons available');empty.hidden=n!==0;chips.replaceChildren();
  for(const c of controls){if(!c.value||c.value==='all')continue;const button=document.createElement('button');button.type='button';button.dataset.clearFilter=c.name;const value=c.tagName==='SELECT'?c.selectedOptions[0].textContent:c.value.trim();button.textContent=value+' ×';button.setAttribute('aria-label','Remove '+c.name+' filter: '+value);chips.append(button);}
  if(write){const url=new URL(location.href);for(const [key,value] of data){if(value&&value!=='all')url.searchParams.set(key,String(value).trim());else url.searchParams.delete(key);}history.replaceState(null,'',url);}
 }
 form.addEventListener('submit',e=>{e.preventDefault();apply(true);});form.addEventListener('input',e=>{if(e.target.type==='search'){clearTimeout(timer);timer=setTimeout(()=>apply(true),150);}});form.addEventListener('change',e=>{if(e.target.tagName==='SELECT')apply(true);});form.addEventListener('reset',e=>{e.preventDefault();clearTimeout(timer);for(const c of controls)c.value=c.tagName==='SELECT'?'all':'';apply(true);form.querySelector('input').focus();});
 hub.querySelector('[data-education-reset]').addEventListener('click',()=>form.reset());chips.addEventListener('click',e=>{const b=e.target.closest('[data-clear-filter]');if(!b)return;const c=form.elements.namedItem(b.dataset.clearFilter);c.value=c.tagName==='SELECT'?'all':'';apply(true);if(c.tagName==='SELECT'&&!refine.open)form.querySelector('input').focus();else c.focus();});window.addEventListener('popstate',()=>{readURL();apply(false);});readURL();apply(false);
 const dialog=document.getElementById('video-dialog'),frame=document.getElementById('video-frame'),close=dialog.querySelector('.dialog-close');let opener;
 document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.video;if(!/^[\w-]{11}$/.test(id))return;
  if(typeof dialog.showModal!=='function'){location.href=button.dataset.lesson;return;}
  opener=button;document.getElementById('video-title').textContent=button.dataset.title;
  const start=Math.max(0,Math.min(86400,parseInt(button.dataset.start||new URLSearchParams(location.search).get('start')||'0',10)||0));const player=document.createElement('iframe');player.src='https://www.youtube-nocookie.com/embed/'+id+'?start='+start+'&autoplay=0&playsinline=1&rel=0';configureYouTubePlayer(player);player.title=button.dataset.title;player.allow='encrypted-media; picture-in-picture; fullscreen';player.allowFullscreen=true;frame.replaceChildren(player);
  document.getElementById('education-playing-lesson').href=button.dataset.lesson;document.getElementById('education-playing-model').href=button.dataset.model;dialog.showModal();dialog.scrollTop=0;document.body.classList.add('dialog-open');close.focus();
 }));function clearPlayer(){frame.replaceChildren();document.body.classList.remove('dialog-open');}close.addEventListener('click',()=>{clearPlayer();dialog.close();});dialog.addEventListener('cancel',clearPlayer);dialog.addEventListener('close',()=>{clearPlayer();opener?.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 window.addEventListener('pagehide',()=>{frame.replaceChildren();if(dialog.open)dialog.close();document.body.classList.remove('dialog-open');});
})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
