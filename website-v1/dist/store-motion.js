// Original gallery-reveal/depth motion, inspired by HorizonX's public gallery examples.
// Only listing-image frames animate; product detail, pricing, cart and checkout stay untouched.
export function initStoreMotion(host){
 const button=document.querySelector('[data-store-motion-toggle]'),hero=document.querySelector('.store-motion-stage'),photo=hero?.querySelector('img');
 if(!button||!photo)return ()=>{};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:760px)');
 let paused=false,active=true,raf=0,heroAnimation,heroVisible=false,heroSeen=false;
 try{paused=sessionStorage.getItem('mt-store-motion-paused')==='true'}catch{}
 const seen=new WeakSet(),observed=new Set(),running=new Map(),loadWaiters=new Map();
 const canMove=()=>active&&!paused&&!reduced.matches;
 function cancelAll(){running.forEach(list=>list.forEach(a=>a.cancel()));running.clear();heroAnimation?.cancel();heroAnimation=null;}
 function track(target,animation){const list=running.get(target)||[];list.push(animation);running.set(target,list);const clear=()=>{const current=running.get(target);if(!current)return;const next=current.filter(a=>a!==animation);next.length?running.set(target,next):running.delete(target)};animation.onfinish=clear;animation.oncancel=clear;}
 function reveal(frame,index){
  if(!canMove()||document.hidden||frame.contains(document.activeElement)||!frame.animate)return;
  if(running.size>=(phone.matches?3:6))return;
  const images=frame.querySelectorAll('.grid-category__bg-image,.grid-category__picture,.grid-product__picture');
  const options={duration:phone.matches?580:950,delay:Math.min(index,3)*(phone.matches?35:65),easing:'cubic-bezier(.18,.75,.2,1)'};
  track(frame,frame.animate([{clipPath:'inset(16% 0 16% 0)',opacity:.45},{clipPath:'inset(0% 0 0% 0)',opacity:1}],options));
  for(const image of images)track(frame,image.animate([{transform:'translateY('+ (phone.matches?18:36)+'px) scale(1.14) rotate(-1.5deg)'},{transform:'translateY(0) scale(1) rotate(0deg)'}],{...options,duration:phone.matches?650:1150}));
 }
 const revealObserver=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach((entry,i)=>{const frame=entry.target;revealObserver.unobserve(frame);observed.delete(frame);if(seen.has(frame))return;seen.add(frame);const img=frame.querySelector('img');if(img&&!img.complete){const loaded=()=>{loadWaiters.delete(img);if(!active||!host.contains(frame))return;const box=frame.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)reveal(frame,i)};loadWaiters.set(img,loaded);img.addEventListener('load',loaded,{once:true})}else reveal(frame,i)})},{threshold:.14});
 function scan(){raf=0;if(!active)return;for(const frame of observed)if(!host.contains(frame)){revealObserver.unobserve(frame);observed.delete(frame)}
  const catalogView=!host.querySelector('.ec-cart,.ec-checkout,.product-details,.ecwid-productBrowser-CartPage');
  host.dataset.storeMotion=canMove()&&catalogView?'on':'off';
  if(!canMove()||!catalogView){revealObserver.disconnect();observed.clear();running.forEach(list=>list.forEach(a=>a.cancel()));running.clear();return;}
  for(const frame of host.querySelectorAll('.grid-category__image,.grid-product__image'))if(!seen.has(frame)&&!observed.has(frame)){observed.add(frame);revealObserver.observe(frame)}
 }
 function schedule(){if(active&&!raf)raf=requestAnimationFrame(scan)}
 function heroMotion(){heroAnimation?.cancel();heroAnimation=null;if(!canMove()||!heroVisible||document.hidden||!photo.animate)return;
  if(phone.matches){if(heroSeen)return;heroSeen=true;heroAnimation=photo.animate([{transform:'scale(1.14) translateY(12px)'},{transform:'scale(1) translateY(0)'}],{duration:900,easing:'ease-out'});}
  else heroAnimation=photo.animate([{transform:'scale(1.02) translateX(0)'},{transform:'scale(1.19) translateX(-2%)'}],{duration:10500,easing:'ease-in-out',direction:'alternate',iterations:Infinity});
 }
 const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(!heroVisible){heroAnimation?.pause();return}if(heroAnimation&&canMove()&&!document.hidden)heroAnimation.play();else heroMotion()},{threshold:.12});heroObserver.observe(hero);
 const mutations=new MutationObserver(schedule);mutations.observe(host,{childList:true,subtree:true});
 function sync(){cancelAll();revealObserver.disconnect();observed.clear();host.dataset.storeMotion=canMove()?'on':'off';button.disabled=reduced.matches;button.textContent=reduced.matches?button.dataset.reduced:paused?button.dataset.resume:button.dataset.pause;button.setAttribute('aria-pressed',String(paused||reduced.matches));heroMotion();schedule();}
 function toggle(){paused=!paused;try{sessionStorage.setItem('mt-store-motion-paused',String(paused))}catch{}sync()}
 function stopTarget(event){const frame=event.target.closest?.('.grid-category__image,.grid-product__image');if(frame)running.get(frame)?.forEach(a=>a.cancel())}
 function visibility(){if(document.hidden){cancelAll()}else{heroMotion();schedule()}}
 button.addEventListener('click',toggle);host.addEventListener('focusin',stopTarget);host.addEventListener('pointerdown',stopTarget,{passive:true});reduced.addEventListener('change',sync);phone.addEventListener('change',sync);document.addEventListener('visibilitychange',visibility);sync();
 return ()=>{active=false;loadWaiters.forEach((fn,img)=>img.removeEventListener('load',fn));loadWaiters.clear();cancelAll();cancelAnimationFrame(raf);revealObserver.disconnect();heroObserver.disconnect();mutations.disconnect();observed.clear();delete host.dataset.storeMotion;button.removeEventListener('click',toggle);host.removeEventListener('focusin',stopTarget);host.removeEventListener('pointerdown',stopTarget);reduced.removeEventListener('change',sync);phone.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility)};
}
