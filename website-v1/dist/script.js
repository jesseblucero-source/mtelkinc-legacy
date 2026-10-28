export function initPage(){
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const lang=document.documentElement.lang.slice(0,2),prefix=['fr','es','de'].includes(lang)?'/'+lang:'';
const labels={de:{shop:'Shop',menu:'Entdecken',close:'Menü schließen',learn:'Lernen',videos:'Videos',saved:'Merkliste',find:'Suchen',quick:'Schnellnavigation',guide:'Mein Feldführer',international:'International'},en:{shop:'Shop',menu:'Explore',close:'Close menu',learn:'Learn',videos:'Videos',saved:'Saved',find:'Find',quick:'Quick navigation',guide:'My Field Guide',international:'International'},fr:{shop:'Boutique',menu:'Explorer',close:'Fermer le menu',learn:'Formation',videos:'Vidéos',saved:'Favoris',find:'Chercher',quick:'Navigation rapide',guide:'Mon guide de terrain',international:'International'},es:{shop:'Tienda',menu:'Explorar',close:'Cerrar menú',learn:'Aprender',videos:'Vídeos',saved:'Guardados',find:'Buscar',quick:'Navegación rápida',guide:'Mi guía de campo',international:'Internacional'}}[lang]||{menu:'Explore',close:'Close menu',learn:'Learn',videos:'Videos',saved:'Saved',find:'Find',quick:'Quick navigation',guide:'My Field Guide',international:'International'};
const menuTop=document.createElement('div');menuTop.className='mobile-menu-heading';
const menuTitle=document.createElement('strong');menuTitle.textContent=labels.menu;
const menuClose=document.createElement('button');menuClose.type='button';menuClose.className='mobile-menu-close';menuClose.textContent=labels.close+' ×';menuTop.append(menuTitle,menuClose);navigation.prepend(menuTop);
for(const [path,label] of [['/field-guide/',labels.guide],['/international/',labels.international]]){const a=document.createElement('a');a.href=prefix+path;a.textContent=label;a.className='mobile-menu-extra';navigation.insertBefore(a,navigation.querySelector('.nav-contact'))}
for(const a of navigation.querySelectorAll('a[href]')){const url=new URL(a.href,location.href);if(url.pathname===location.pathname)a.setAttribute('aria-current','page')}
let inertItems=[];
function closeMenu(restoreFocus=false){navigation.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');document.body.classList.remove('mobile-menu-open');navigation.removeAttribute('aria-modal');navigation.removeAttribute('role');for(const [node,value] of inertItems)node.inert=value;inertItems=[];if(restoreFocus&&toggle.isConnected)toggle.focus({preventScroll:true});}
function openMenu(){navigation.classList.add('is-open');toggle.setAttribute('aria-expanded','true');if(matchMedia('(max-width:1360px)').matches){document.body.classList.add('mobile-menu-open');navigation.setAttribute('role','dialog');navigation.setAttribute('aria-modal','true');inertItems=[...document.querySelectorAll('#site-page > :not(header), header > :not(#navigation), body > [data-site-persist]:not(#site-navigation-status):not(#site-navigation-light)')].map(node=>[node,node.inert]);for(const [node] of inertItems)node.inert=true;menuClose.focus({preventScroll:true});}}
toggle.addEventListener('click',()=>toggle.getAttribute('aria-expanded')==='true'?closeMenu(true):openMenu());
menuClose.addEventListener('click',()=>closeMenu(true));
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',event=>{if(toggle.getAttribute('aria-expanded')!=='true')return;if(event.key==='Escape'){event.preventDefault();closeMenu(true)}else if(event.key==='Tab'&&navigation.getAttribute('aria-modal')==='true'){const items=[...navigation.querySelectorAll('a[href],button')].filter(e=>e.getClientRects().length&&!e.disabled);const first=items[0],last=items[items.length-1];if(event.shiftKey&&(document.activeElement===first||!navigation.contains(document.activeElement))){event.preventDefault();last?.focus()}else if(!event.shiftKey&&(document.activeElement===last||!navigation.contains(document.activeElement))){event.preventDefault();first?.focus()}}});
window.MTPageRouter?.onLeave(()=>closeMenu());
const quick=document.createElement('nav');quick.className='mobile-quick-nav';quick.setAttribute('aria-label',labels.quick);
for(const [path,label] of [['/shop/',labels.shop],['/education/',labels.learn],['/videos/',labels.videos]]){const a=document.createElement('a');a.href=prefix+path;a.textContent=label;if(path==='/shop/'){a.className='quick-shop';a.insertAdjacentHTML('afterbegin','<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>')}if(location.pathname.startsWith(prefix+path))a.setAttribute('aria-current','page');quick.append(a)}
const quickFind=document.createElement('button');quickFind.type='button';quickFind.textContent=labels.find;quickFind.dataset.resourceFinder='';quickFind.setAttribute('aria-haspopup','dialog');quick.append(quickFind);document.body.append(quick);

// Subtle progressive motion: content stays visible without JavaScript.
(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 760px)');
  const seen = new WeakSet();
  const running = new Map();
  let observer;
  const targets = [...document.querySelectorAll('main h2, main .story-photo, main .record-card, main .lesson-detail-card, main .media-card')].filter(target => !target.closest('.home-university'));
  function finishAll() {
    running.forEach(animation => animation.cancel());
    running.clear();
  }
  function connect() {
    observer?.disconnect();
    finishAll();
    if (reduced.matches || document.documentElement.classList.contains('cinema-paused')) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const target = entry.target;
        if (!entry.isIntersecting) continue;
        observer.unobserve(target);
        seen.add(target);
        // Reading, keyboard focus, and rapid scrolling take priority over motion.
        if (document.hidden || target.contains(document.activeElement) ||
            entry.boundingClientRect.bottom < 0 || running.size >= (phone.matches ? 4 : 8)) continue;
        try {
          const animation = target.animate([
            { opacity: 0.7, transform: `translateY(${phone.matches ? 6 : 12}px)` },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: phone.matches ? 320 : 440, easing: 'cubic-bezier(.2,.7,.2,1)' });
          running.set(target, animation);
          const clear = () => { if (running.get(target) === animation) running.delete(target); };
          animation.onfinish = clear;
          animation.oncancel = clear;
        } catch { /* Unsupported motion leaves the original content intact. */ }
      }
    }, { threshold: 0.08 });
    for (const target of targets) {
      if (seen.has(target)) continue;
      const box = target.getBoundingClientRect();
      // Keep the initial viewport and restored scroll position immediately readable.
      if (box.height && box.top < innerHeight && box.bottom > 0) seen.add(target);
      else observer.observe(target);
    }
  }
  document.addEventListener('focusin', event => {
    running.forEach((animation, target) => {
      if (target === event.target || target.contains(event.target)) animation.cancel();
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.addEventListener('pagehide', () => { observer?.disconnect(); finishAll(); });
  window.addEventListener('pageshow', event => { if (event.persisted) connect(); });
  window.addEventListener('beforeprint', finishAll);
  if(reduced.addEventListener)reduced.addEventListener('change',connect);else reduced.addListener?.(connect);
  document.addEventListener('cinema-motion-change', connect);
  connect();
})();

// Navigation support for long pages and touch screens.
(() => {
  document.addEventListener('click', event => {
    if (toggle.getAttribute('aria-expanded') === 'true' &&
        !navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (getComputedStyle(toggle).display === 'none') closeMenu();
  });
  navigation.addEventListener('keydown', event => {
    if (toggle.getAttribute('aria-expanded') !== 'true' ||
        !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const links = [...navigation.querySelectorAll('a, button')];
    const current = links.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 :
      (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  });
  if (!('IntersectionObserver' in window)) return;
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.type = 'button';
  button.textContent = '↑ Back to top';
  button.hidden = true;
  const sentinel = document.createElement('span');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100vh;pointer-events:none;visibility:hidden';
  document.body.append(sentinel, button);
  const observer = new IntersectionObserver(entries => {
    button.hidden = entries[0].boundingClientRect.bottom > 0;
  });
  observer.observe(sentinel);
  button.addEventListener('click', () => {
    const target = document.querySelector('header .brand');
    target?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();

// Load search code and its index only after someone requests the finder.
(() => {
  let module;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-finder';
  button.textContent = 'Find';
  button.setAttribute('aria-label', 'Find a resource');
  button.setAttribute('aria-haspopup', 'dialog');
  navigation.insertBefore(button, navigation.querySelector('.nav-contact'));
  const status = document.createElement('span');
  status.className = 'finder-load-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  async function open(trigger) {
    closeMenu();
    status.textContent = '';
    try {
      module ||= import('/resource-finder.js');
      {const finder=await module;if(trigger?.isConnected){if(window.MTPageRouter)window.MTPageRouter.run(()=>finder.openFinder(trigger));else finder.openFinder(trigger);}}
    } catch {
      module = null;
      status.textContent = 'Search could not open. Use Education or Archive, or try Find again.';
    }
  }
  button.onclick = () => open(button);
  document.querySelectorAll('[data-resource-finder]').forEach(link => {
    link.addEventListener('click', event => { event.preventDefault(); open(link); });
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]')) {
      event.preventDefault(); open(document.activeElement instanceof HTMLElement ? document.activeElement : button);
    }
  });
})();

// Save verified page links; storage is local to this browser, with no account sync.
(() => {
  const path = location.pathname.replace(/^\/(?:fr|es|de)(?=\/)/,'');
  if (!/^\/(?:education(?:\/(?:lessons\/[a-z0-9-]+|deer-calling))?|calls\/[a-z0-9-]+|archive(?:\/[a-z0-9-]+)?|legacy|support|videos(?:\/watch\/[A-Za-z0-9_-]{11})?|banding|about|canada(?:\/education|\/presentation)?)\/$/.test(path)) return;
  const hero = document.querySelector('main h1')?.closest('section');
  if (!hero) return;
  const bar = document.querySelector('.resource-save-bar');
  if (!bar) return;
  const guide = document.createElement('a');guide.href = '/field-guide/';guide.textContent = 'My Field Guide →';

  import('/saved-resources.js').then((window.MTPageRouter?.bindPage||((fn)=>fn))(({ makeSaveButton }) => {
    if(!bar.isConnected)return;
    const record = {url: path, title: document.title.split(' | ')[0], description: document.querySelector('meta[name="description"]')?.content || ''};
    const {button, status} = makeSaveButton(record);bar.replaceChildren(button,guide,status);
  })).catch(() => { bar.replaceChildren(guide); });
})();

// Optional music: neither the player nor audio files load before interaction.
(() => {
  if(document.getElementById('music-dock'))return;
  const root = document.createElement('aside');root.dataset.sitePersist='music';root.id = 'music-dock';root.setAttribute('aria-label', 'Optional music');
  const toggle = document.createElement('button');toggle.type = 'button';toggle.className = 'music-toggle';toggle.textContent = '♫ Music';toggle.setAttribute('aria-expanded', 'false');
  root.append(toggle);document.body.append(root);
  let module;
  toggle.onclick = async () => {
    try { module ||= import('/music-player.js?v=1d837db319b5');await (await module).openMusic(root,toggle,new URLSearchParams(location.search).get('soundtrack')); }
    catch { module = null;toggle.textContent = 'Music unavailable · Retry'; }
  };
  // A shared soundtrack opens its controls only. Playback still requires Play.
  if(['cowtalk-song','stop-em-in-their-tracks'].includes(new URLSearchParams(location.search).get('soundtrack')))toggle.onclick();
})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
