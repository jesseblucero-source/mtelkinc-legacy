import {configureYouTubePlayer} from './youtube-player.js?v=eb44b35f6e5f';
export function initPage(){
(()=>{const planner=document.querySelector('#pilot-planner');if(planner){planner.addEventListener('submit',e=>e.preventDefault());planner.addEventListener('input',()=>{const a=['stores','calls','bands','guides'].map(n=>planner.elements[n].value);const valid=a.every(x=>x!==''&&Number.isInteger(Number(x))&&Number(x)>=0&&Number(x)<=10000);document.querySelector('#pilot-total').textContent=valid?`${Number(a[0])*Number(a[1])} calls · ${Number(a[0])*Number(a[2])} band packs · ${Number(a[0])*Number(a[3])} guides. Planning quantities only.`:'Enter whole numbers from 0 to 10,000 for all fields.'})}const check=document.querySelector('#partner-check');if(check){check.addEventListener('submit',e=>e.preventDefault());check.addEventListener('change',()=>{const v=Object.fromEntries(new FormData(check));document.querySelector('#partner-result').textContent=v.role==='retailer'?'Discuss a dealer relationship. Supplying your own stores alone does not establish a wholesale distributor network.':Object.values(v).some(x=>!x)?'Complete the remaining questions to prepare your conversation.':Object.values(v).includes('no')?'Discuss the operating gaps before committing to distribution. This is conversation guidance, not approval.':'A regional distributor conversation is appropriate. Verify retail coverage and agree on commercial terms; this is not partner approval.';const body='MT E.L.K., INC. — Western Canada discussion\n\n'+Object.entries(v).map(([k,val])=>`${k}: ${val||'To confirm'}`).join('\n')+'\n\nProvinces served and retailer accounts: \nStocking and replenishment plan: ';document.querySelector('#partner-email').href='mailto:office@elkinc.com?subject=Western%20Canada%20distribution%20discussion&body='+encodeURIComponent(body)})}const slides=[...document.querySelectorAll('.canada-slide')];
if(slides.length){
 let index=0,all=false,touch=null;
 const chapter=document.querySelector('#slide-chapter');
 const progress=document.querySelector('#slide-progress');
 const readHash=()=>{const match=location.hash.match(/^#slide-(\d+)$/);return match?Math.max(0,Math.min(slides.length-1,Number(match[1])-1)):0};
 index=readHash();
 const draw=()=>{
  slides.forEach((slide,i)=>slide.hidden=!all&&i!==index);
  document.querySelector('#slide-status').textContent=all?`All ${slides.length} slides`:`${index+1} of ${slides.length}`;
  document.querySelector('#slide-prev').disabled=all||index===0;
  document.querySelector('#slide-next').disabled=all||index===slides.length-1;
  document.querySelector('#slide-all').setAttribute('aria-pressed',String(all));
  document.querySelector('#slide-all').textContent=all?'Show One Slide':'Show All Slides';
  if(chapter)chapter.value=String(index);
  if(progress){progress.value=all?slides.length:index+1;progress.setAttribute('aria-valuetext',all?'All chapters displayed':`Chapter ${index+1} of ${slides.length}`)}
 };
 const go=(next)=>{index=Math.max(0,Math.min(slides.length-1,next));all=false;history.replaceState(null,'',`#${slides[index].id}`);draw()};
 document.querySelector('#slide-prev').onclick=()=>go(index-1);
 document.querySelector('#slide-next').onclick=()=>go(index+1);
 document.querySelector('#slide-all').onclick=()=>{all=!all;draw()};
 if(chapter)chapter.onchange=()=>go(Number(chapter.value));
 window.addEventListener('hashchange',()=>{index=readHash();all=false;draw()});
 document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable||all)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1))}
 });
 slides.forEach(slide=>{
  slide.addEventListener('touchstart',e=>{touch=e.touches.length===1&&!e.target.closest('button,a,input,select,textarea')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
  slide.addEventListener('touchend',e=>{if(!touch||all)return;const end=e.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.7)go(index+(dx<0?1:-1))},{passive:true});
  slide.addEventListener('touchcancel',()=>touch=null,{passive:true});
 });
 const share=document.querySelector('#slide-share');
 if(share)share.onclick=async()=>{
  const url=new URL(location.href);url.hash=slides[index].id;const status=document.querySelector('#share-status');
  try{if(!navigator.clipboard)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(url.href);status.textContent='Slide link copied.'}
  catch{status.replaceChildren(document.createTextNode('Copy this slide link: '));const a=document.createElement('a');a.href=url.href;a.textContent=url.href;status.append(a)}
 };
 document.querySelector('#slide-print')?.addEventListener('click',()=>window.print());
 draw();
}
document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-guide]').forEach(x=>x.hidden=x.dataset.guide!==b.dataset.language);document.querySelectorAll('[data-language]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});const dialog=document.querySelector('#canada-video');document.querySelectorAll('[data-video]').forEach(b=>b.onclick=()=>{document.querySelector('#canada-video-title').textContent=b.dataset.title;const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${b.dataset.video}?start=${b.dataset.start}&autoplay=0&playsinline=1&rel=0`;configureYouTubePlayer(iframe);iframe.title=b.dataset.title;iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;document.querySelector('#canada-frame').replaceChildren(iframe);dialog.showModal()});document.querySelector('#close-video').onclick=()=>dialog.close();dialog.addEventListener('close',()=>document.querySelector('#canada-frame').replaceChildren())})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
