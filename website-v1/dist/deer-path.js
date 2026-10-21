export function initPage(){
(()=>{const chapters=[...document.querySelectorAll('.path-chapter')],links=[...document.querySelectorAll('[data-chapter]')],controls=document.querySelector('#path-controls');let index=0,all=false;
 function draw(){chapters.forEach((c,i)=>c.hidden=!all&&i!==index);links.forEach((a,i)=>{if(!all&&i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});document.querySelector('#path-status').textContent=all?'All 5 chapters':`${index+1} of ${chapters.length}`;document.querySelector('#path-prev').disabled=all||index===0;document.querySelector('#path-next').disabled=all||index===chapters.length-1;document.querySelector('#path-all').textContent=all?'Read One Chapter':'Read All Chapters';document.querySelector('#path-all').setAttribute('aria-pressed',String(all))}
 function go(next){index=Math.max(0,Math.min(chapters.length-1,next));all=false;history.replaceState(null,'','#'+chapters[index].id);draw();chapters[index].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
 function fromHash(){const next=chapters.findIndex(c=>'#'+c.id===location.hash);index=next>=0?next:0;all=false;draw()}
 controls.hidden=false;links.forEach((a,i)=>a.onclick=e=>{e.preventDefault();go(i)});document.querySelector('#path-prev').onclick=()=>go(index-1);document.querySelector('#path-next').onclick=()=>go(index+1);document.querySelector('#path-all').onclick=()=>{all=!all;draw()};window.addEventListener('hashchange',fromHash);fromHash();})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
