import {configureYouTubePlayer} from './youtube-player.js?v=eb44b35f6e5f';
export function initPage(){
const channel = JSON.parse(document.getElementById('channel-data').textContent);
const videos = channel.videos;
const catalog = new Map(videos.map(video => [video.id, video]));
const cards = [...document.querySelectorAll('.media-card')];
const categories = [...document.querySelectorAll('[data-category]')];
const search = document.getElementById('video-search');
const topic = document.getElementById('video-topic');
const dialog = document.getElementById('media-player');
const frame = document.getElementById('channel-video-frame');
const previous = document.getElementById('player-previous');
const next = document.getElementById('player-next');
const message = document.getElementById('player-message');
let category = 'all'; let visible = videos; let queue = []; let activeId = null; let limit = 12; let opener = null; let libraryScroll = 0;
const model = document.getElementById('video-model'), length = document.getElementById('video-length'), sort = document.getElementById('video-sort');
const seconds = video => video.duration.split(':').reduce((n, part) => n * 60 + Number(part), 0);
const more = document.getElementById('video-more'), jump = document.getElementById('player-select');
const pagination = document.querySelector('.media-pagination');
const speciesLabels = {'elk':'Elk','deer':'Deer','antelope':'Antelope','predators':'Predators','field-gear':'Field & Gear'};
const topicLabels = {'calling-lessons':'Calling Lessons','call-care':'Band & Reed Care','call-sounds':'Call Sounds','field-footage':'Field & Wildlife','previews':'Gear & DVD Previews'};
function readFilters() {
 const params = new URLSearchParams(location.search);
 category = categories.some(button => button.dataset.category === params.get('category')) ? params.get('category') : 'all';
 search.value = params.get('q') || '';
 for (const [control,key,fallback] of [[model,'model','all'],[length,'length','all'],[sort,'sort','catalog']]) control.value = [...control.options].some(o=>o.value===params.get(key)) ? params.get(key) : fallback;
 topic.value = [...topic.options].some(option => option.value === params.get('topic')) ? params.get('topic') : 'all';
 if(model.value!=='all'||length.value!=='all'||sort.value!=='catalog')document.querySelector('.media-advanced').open=true;
}
function updateURL() {
 const url = new URL(location.href);
 for (const [key,value] of [['category',category],['q',search.value.trim()],['topic',topic.value],['model',model.value],['length',length.value],['sort',sort.value === 'catalog' ? null : sort.value],['video',activeId]]) {
  if(value && value !== 'all') url.searchParams.set(key,value); else url.searchParams.delete(key);
 }
 history.replaceState(null,'',url);
}
function paintCards() {
 const shown = visible.slice(0,limit); const ids = new Set(shown.map(v=>v.id));
 cards.forEach(card=>card.hidden=!ids.has(card.dataset.id));
 const grid=document.querySelector('.media-grid');
 visible.forEach(video=>grid.append(cards.find(card=>card.dataset.id===video.id)));
 document.getElementById('video-count').textContent = visible.length + (visible.length === 1 ? ' matching video' : ' matching videos') + '. Showing ' + shown.length + '.';
 document.getElementById('video-empty').hidden = visible.length !== 0;
 pagination.hidden = visible.length <= limit;
 more.textContent = 'Show '+Math.min(12,Math.max(0,visible.length-limit))+' More Videos';
}
function filterVideos(write = true) {
 const tokens=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
 visible=videos.filter(video=>{
  const duration=seconds(video);
  return (category==='all'||video.species===category) && (topic.value==='all'||video.topic===topic.value) &&
   (model.value==='all'||(model.value==='unassigned'?!video.call_id:video.call_id===model.value)) &&
   (length.value==='all'||length.value==='short'&&duration<300||length.value==='medium'&&duration>=300&&duration<=1200||length.value==='long'&&duration>1200) &&
   tokens.every(token=>(video.title+' '+speciesLabels[video.species]+' '+topicLabels[video.topic]).toLowerCase().includes(token));
 });
 if(sort.value==='shortest')visible.sort((a,b)=>seconds(a)-seconds(b));
 if(sort.value==='longest')visible.sort((a,b)=>seconds(b)-seconds(a));
 if(sort.value==='title')visible.sort((a,b)=>a.title.localeCompare(b.title));
 limit=12;paintCards();categories.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
 const activeCount=Number(model.value!=='all')+Number(length.value!=='all')+Number(sort.value!=='catalog');document.querySelector('.media-advanced summary').textContent='More filters & sorting'+(activeCount?' · '+activeCount+' active':'');
 const chips=document.querySelector('.category-chips'),selected=categories.find(button=>button.dataset.category===category);if(chips.scrollWidth>chips.clientWidth&&selected){const r=selected.getBoundingClientRect(),parent=chips.getBoundingClientRect();chips.scrollLeft+=r.left-parent.left-(chips.clientWidth-r.width)/2;}
 if(write)updateURL();
}
function resetFilters(){category='all';search.value='';topic.value='all';model.value='all';length.value='all';sort.value='catalog';filterVideos()}
more.onclick=()=>{const firstNew=visible[limit];limit+=12;paintCards();cards.find(card=>card.dataset.id===firstNew?.id)?.querySelector('[data-play]')?.focus({preventScroll:true})};
function renderPlayer(id, userInitiated = true) {
 const video = catalog.get(id); if(!video)return;
 activeId = id;
 jump.replaceChildren(...queue.map(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.title;return option}));jump.value=id;
 document.getElementById('player-page').href='/videos/watch/'+id+'/';
 const index = queue.findIndex(item => item.id === id);
 document.getElementById('player-title').textContent = video.title;
 document.getElementById('player-category').textContent = speciesLabels[video.species] + ' / ' + topicLabels[video.topic] + ' / ' + video.duration;
 document.getElementById('player-position').textContent = 'Video ' + (index+1) + ' of ' + queue.length;
 previous.disabled = index <= 0; next.disabled = index >= queue.length-1;
 message.textContent = '';
 const lessonLink = document.getElementById('player-lesson');
 lessonLink.hidden = !video.lesson_slug && !video.call_id;
 if(video.lesson_slug){lessonLink.href='/education/lessons/'+video.lesson_slug+'/';lessonLink.textContent='Read the Related Lesson →';}
 else if(video.call_id){lessonLink.href='/calls/'+video.call_id+'/';lessonLink.textContent='Explore This Call’s Resources →';}
 const iframe = document.createElement('iframe');
 iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?playsinline=1&rel=0&autoplay=' + (userInitiated ? '1' : '0');configureYouTubePlayer(iframe);
 iframe.title = video.title; iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
 iframe.referrerPolicy = 'strict-origin-when-cross-origin';
 frame.replaceChildren(iframe);
 const upcoming = document.getElementById('player-queue'); upcoming.replaceChildren();
 const upcomingVideos = queue.slice(index+1,index+4);
 upcomingVideos.forEach(item => {
  const button = document.createElement('button'); button.className = 'queue-video'; button.type = 'button';
  const image = document.createElement('img');image.src = item.thumbnail_url;image.alt = '';image.width = 74;image.height = 48;image.loading='lazy';
  const title = document.createElement('span');title.textContent = item.title;
  button.append(image,title);button.addEventListener('click',()=>{renderPlayer(item.id);dialog.scrollTop=0;});upcoming.append(button);
 });
 if(!upcomingVideos.length){const done=document.createElement('p');done.textContent='You’ve reached the end of this selection. Close the player to explore another category.';upcoming.append(done);}
 updateURL();
}
function openVideo(id,userInitiated=true) {
 if(!dialog.open){opener=document.activeElement;libraryScroll=window.scrollY;}
 if(!catalog.has(id))return;
 queue = visible.some(video=>video.id===id) ? [...visible] : [...videos];
 renderPlayer(id,userInitiated);
 if(!dialog.open)dialog.showModal();
 dialog.scrollTop=0;document.body.classList.add('media-open');
}
function cleanupPlayer() {const id=activeId;frame.replaceChildren();document.body.classList.remove('media-open');activeId=null;updateURL();if(id){const position=visible.findIndex(v=>v.id===id);if(position>=limit){limit=Math.ceil((position+1)/12)*12;paintCards()}const target=opener?.matches?.('[data-play]')&&opener.isConnected?opener:search;requestAnimationFrame(()=>{target?.focus({preventScroll:true});window.scrollTo({top:libraryScroll,behavior:'instant'})})}}
function closePlayer() { if(document.fullscreenElement)document.exitFullscreen().catch(()=>{}); cleanupPlayer(); dialog.close(); }
document.getElementById('player-close').addEventListener('click',closePlayer);
dialog.addEventListener('cancel',cleanupPlayer);dialog.addEventListener('close',cleanupPlayer);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePlayer();}});
document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>openVideo(button.dataset.play)));
previous.addEventListener('click',()=>{const index=queue.findIndex(video=>video.id===activeId);if(index>0){renderPlayer(queue[index-1].id);dialog.scrollTop=0;}});
next.addEventListener('click',()=>{const index=queue.findIndex(video=>video.id===activeId);if(index<queue.length-1){renderPlayer(queue[index+1].id);dialog.scrollTop=0;}});
categories.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;filterVideos();button.scrollIntoView({block:'nearest',inline:'nearest'});}));
search.addEventListener('input',()=>filterVideos());[topic,model,length,sort].forEach(control=>control.addEventListener('change',()=>filterVideos()));
jump.addEventListener('change',()=>{renderPlayer(jump.value);dialog.scrollTop=0});
document.querySelector('.media-controls').addEventListener('submit',event=>{event.preventDefault();filterVideos();});
document.querySelector('.media-clear').addEventListener('click',resetFilters);document.getElementById('empty-reset').addEventListener('click',resetFilters);
document.getElementById('player-expand').addEventListener('click',async()=>{
 const stage=document.getElementById('player-stage');
 try {if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else throw new Error('Fullscreen unavailable');}
 catch {message.textContent='Use the YouTube player’s full-screen button on this browser.';}
});
document.getElementById('stage-exit').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});});
document.getElementById('player-share').addEventListener('click',async()=>{
 const url=new URL(location.href);url.searchParams.set('video',activeId);
 try {await navigator.clipboard.writeText(url.href);message.textContent='Video link copied. It includes your current category and filters.';}
 catch {message.textContent='Copy this video link: '+url.href;}
});
window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('video');readFilters();filterVideos(false);if(id&&catalog.has(id))openVideo(id,false);else if(dialog.open)closePlayer();});
readFilters();filterVideos(false);
const requestedVideo=new URLSearchParams(location.search).get('video');if(requestedVideo&&catalog.has(requestedVideo))openVideo(requestedVideo,false);

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
