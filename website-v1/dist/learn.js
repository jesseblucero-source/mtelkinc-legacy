import {configureYouTubePlayer} from './youtube-player.js?v=eb44b35f6e5f';
export function initPage(){
const videoDialog = document.getElementById('video-dialog');
const frame = document.getElementById('video-frame');
let videoOpener;
document.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click', () => {
 videoOpener=button;
 const id = button.dataset.video;
 const start = Math.max(0, Number.parseInt(button.dataset.start || new URLSearchParams(location.search).get('start') || '0', 10) || 0);
 document.getElementById('video-title').textContent = button.dataset.title;
 const iframe = document.createElement('iframe');
 iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?start=' + start + '&autoplay=0&playsinline=1&rel=0';configureYouTubePlayer(iframe);
 iframe.title = button.dataset.title; iframe.allow = 'encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
 frame.replaceChildren(iframe); videoDialog.showModal(); document.body.classList.add('dialog-open');
}));
function clearVideo() { frame.replaceChildren(); document.body.classList.remove('dialog-open'); }
function restoreVideoFocus(){const target=videoOpener;videoOpener=null;if(target?.isConnected)target.focus({preventScroll:true});}
function closeVideo() { clearVideo(); videoDialog.close(); restoreVideoFocus(); }
document.querySelector('#video-dialog .dialog-close').addEventListener('click', closeVideo);
videoDialog.addEventListener('cancel', clearVideo);
videoDialog.addEventListener('close',()=>{clearVideo();restoreVideoFocus()});
videoDialog.addEventListener('click', event => { if (event.target === videoDialog) { const r = videoDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeVideo(); } });
const search = document.getElementById('call-search');
if (search) {
 let activeFilter = 'all';
 const buttons = [...document.querySelectorAll('[data-filter]')];
 const bandingParams = new URLSearchParams(location.search);
 search.value = bandingParams.get('q') || '';
 const requested = bandingParams.get('species');
 if (buttons.some(b => b.dataset.filter === requested)) activeFilter = requested;
 function update() {
  const query = search.value.toLowerCase().trim(); let count = 0;
  document.querySelectorAll('[data-call]').forEach(card => { const match = (activeFilter === 'all' || card.dataset.species === activeFilter) && card.dataset.call.includes(query); card.hidden = !match; if (match) count++; });
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  document.getElementById('result-count').textContent = count + (count === 1 ? ' lesson available' : ' lessons available');
  document.querySelector('.empty-results').hidden = count !== 0;
 }
 buttons.forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; update(); const url = new URL(location.href); if(activeFilter === 'all')url.searchParams.delete('species');else url.searchParams.set('species',activeFilter); history.replaceState(null,'',url); }));
 search.addEventListener('input',()=>{update();const url=new URL(location.href);const q=search.value.trim();if(q)url.searchParams.set('q',q);else url.searchParams.delete('q');history.replaceState(null,'',url);});
 document.getElementById('reset-search').addEventListener('click', () => { search.value = ''; activeFilter = 'all'; const url = new URL(location.href); url.searchParams.delete('species'); url.searchParams.delete('q'); history.replaceState(null,'',url); update(); search.focus(); });
 update();
}

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
