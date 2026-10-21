export function initPage(){
// Adapted from HorizonX Gallery Reveal's counter-moving image recipe.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:760px)');
 const toggle=document.querySelector('#cinema-toggle'),hero=document.querySelector('.hero-image'),image=hero?.querySelector('img');
 const windows=[...document.querySelectorAll('.cinema-window')],seen=new WeakSet(),animations=new Set();
 const university=document.querySelector('.home-university');
 const campaign=document.querySelector('.shop-campaign'),campaignPhoto=campaign?.querySelector('.shop-campaign-art img');
 let paused=false,observer,heroMove,campaignObserver,campaignMove,campaignVisible=false,universityObserver;
 function track(animation){animations.add(animation);animation.onfinish=()=>animations.delete(animation);animation.oncancel=()=>animations.delete(animation);return animation}
 function stop(){observer?.disconnect();universityObserver?.disconnect();campaignObserver?.disconnect();campaignMove?.cancel();campaignMove=null;heroMove?.cancel();animations.forEach(a=>a.cancel());animations.clear();heroMove=null}
 function start(){stop();if(paused||reduced.matches){toggle.textContent=reduced.matches?'Motion reduced by device setting':'Resume cinematic motion ▶';return}
  toggle.textContent='Pause cinematic motion Ⅱ';
  if(image&&!hero.classList.contains('has-hero-depth')&&(!document.querySelector('script[src="/hero-depth.js"]')||hero.dataset.depth==='fallback')&&Element.prototype.animate)heroMove=track(image.animate([{transform:'scale(1.015) translateX(0)'},{transform:'scale(1.12) translateX(-1.5%)'}],{duration:phone.matches?9000:11000,easing:'ease-in-out',direction:'alternate',iterations:Infinity}));
  if(campaign){
   if(campaignPhoto&&!phone.matches&&Element.prototype.animate){campaignMove=track(campaignPhoto.animate([{transform:'scale(1.02)'},{transform:'scale(1.09) translateX(-1%)'}],{duration:14000,easing:'ease-in-out',direction:'alternate',iterations:Infinity}));campaignMove.pause();}
   campaignObserver=new IntersectionObserver(entries=>{campaignVisible=entries[0].isIntersecting;if(campaignVisible)campaign.classList.add('campaign-revealed');if(campaignMove)campaignVisible&&!document.hidden?campaignMove.play():campaignMove.pause();},{threshold:.12});campaignObserver.observe(campaign);
  }
  if(university&&!phone.matches&&!seen.has(university)){
   universityObserver=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;seen.add(university);universityObserver.disconnect();
    const art=university.querySelector('img'),copy=university.querySelector('.home-university-copy');
    if(Element.prototype.animate){track(art.animate([{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:1600,easing:'cubic-bezier(.2,.7,.2,1)'}));track(copy.animate([{opacity:.4,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:800,easing:'ease-out'}));}
   },{threshold:.18});universityObserver.observe(university);
  }
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting||seen.has(entry.target))return;seen.add(entry.target);observer.unobserve(entry.target);const outer=entry.target.querySelector('.ogf-item'),inner=entry.target.querySelector('.ogf-item-inner');
   // HorizonX reveal: outer moves down while its inner image counter-moves up.
   const options={delay:windows.indexOf(entry.target)*(phone.matches?30:70),duration:phone.matches?600:850,easing:'cubic-bezier(.2,.7,.2,1)',fill:'none'};
   if(Element.prototype.animate){track(outer.animate([{transform:'translateY(-102%)'},{transform:'translateY(0)'}],options));track(inner.animate([{transform:'translateY(102%)'},{transform:'translateY(0)'}],options))}
  }),{threshold:.12});windows.forEach(w=>{if(!seen.has(w))observer.observe(w)});
 }
 toggle.onclick=()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));document.documentElement.classList.toggle('cinema-paused',paused);document.dispatchEvent(new Event('cinema-motion-change'));start()};
 if(reduced.addEventListener)reduced.addEventListener('change',start);else reduced.addListener?.(start);
 document.addEventListener('hero-depth-ready',()=>{heroMove?.cancel();heroMove=null;});
 document.addEventListener('hero-depth-fallback',start);
 document.addEventListener('visibilitychange',()=>{animations.forEach(a=>document.hidden?a.pause():a.play());if(campaignMove&&!campaignVisible)campaignMove.pause()});
 new IntersectionObserver(entries=>{if(heroMove&&heroMove.playState!=='finished')entries[0].isIntersecting&&!document.hidden?heroMove.play():heroMove.pause()}).observe(hero);
 document.addEventListener('focusin',e=>{windows.forEach(w=>{if(w.parentElement.contains(e.target))w.getAnimations({subtree:true}).forEach(a=>a.cancel())})});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',e=>{if(e.persisted)start()});window.addEventListener('beforeprint',stop);
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
