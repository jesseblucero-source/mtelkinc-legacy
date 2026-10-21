let dialog,records,request,opener,limit=20;
const labels={video:'Video',page:'Page',lesson:'Lesson',call:'Call resource',record:'Historical record',person:'Person'};
const normalize=value=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e};
function create(){
 dialog=document.createElement('dialog');dialog.id='resource-finder';dialog.setAttribute('aria-labelledby','finder-title');
 dialog.innerHTML='<div class="finder-heading"><h2 id="finder-title">Find a resource.</h2><button type="button" id="finder-close">Close ×</button></div><form id="finder-form"><div><label for="finder-query">Search the website</label><input type="search" id="finder-query" placeholder="Try Deer Talk, Laubach, or reed replacement" autocomplete="off"></div><div><label for="finder-kind">Resource type</label><select id="finder-kind"><option value="all">All resources</option><option value="lesson">Lessons</option><option value="call">Call resources</option><option value="record">Historical records</option><option value="person">People</option><option value="video">Videos</option><option value="page">Pages</option></select></div><button type="reset" class="text-link">Clear</button></form><p id="finder-status" role="status" aria-live="polite"></p><ul id="finder-results"></ul><button id="finder-more" class="button charcoal" type="button" hidden>Show More</button><button id="finder-retry" type="button" class="button charcoal" hidden>Retry Search</button><p class="finder-alternative">Or browse <a href="/education/">Education</a>, <a href="/banding/">Call Care</a>, or the <a href="/archive/">Archive</a>.</p>';
 document.body.append(dialog);
 dialog.querySelector('#finder-close').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{const target=opener?.isConnected&&opener.getClientRects().length?opener:document.querySelector('.menu-toggle');target?.focus()});
 dialog.querySelector('#finder-form').onsubmit=e=>e.preventDefault();
 dialog.querySelector('#finder-form').addEventListener('input',()=>{limit=20;render()});
 dialog.querySelector('#finder-form').addEventListener('change',()=>{limit=20;render()});
 dialog.querySelector('#finder-form').addEventListener('reset',()=>{limit=20;queueMicrotask(render)});
 dialog.querySelector('#finder-more').onclick=()=>{limit+=20;render()};
 dialog.querySelector('#finder-retry').onclick=load;
}
function render(){
 if(!records)return;
 const tokens=normalize(dialog.querySelector('#finder-query').value.trim()).split(/\s+/).filter(Boolean),kind=dialog.querySelector('#finder-kind').value;
 const matches=records.filter(r=>(kind==='all'||r.kind===kind)&&tokens.every(t=>normalize(`${r.title} ${r.description} ${r.keywords}`).includes(t)));
 const list=dialog.querySelector('#finder-results');list.replaceChildren();
 for(const r of matches.slice(0,limit)){
  const li=node('li');li.append(node('span',labels[r.kind],'finder-kind'));const a=node('a',r.title);a.href=r.url;li.append(a,node('p',r.description));list.append(li);
 }
 dialog.querySelector('#finder-status').textContent=matches.length?`${matches.length} matching resources. Showing ${Math.min(limit,matches.length)}.`:'No matching resources. Try a call name, a person, or clear the filters.';
 dialog.querySelector('#finder-more').hidden=matches.length<=limit;
}
async function load(){
 if(records){render();return}
 const target=dialog;const status=dialog.querySelector('#finder-status'),retry=dialog.querySelector('#finder-retry');status.textContent='Loading resource index…';retry.hidden=true;
 try{
  if(!request)request=fetch((['fr','es','de'].includes(document.documentElement.lang)?'/'+document.documentElement.lang:'')+'/resource-index.json').then(async response=>{if(!response.ok)throw Error('Index unavailable');const data=await response.json();if(!Array.isArray(data))throw Error('Invalid index');return data.filter(r=>typeof r.url==='string'&&r.url.startsWith('/')&&!r.url.startsWith('//')&&typeof r.title==='string'&&typeof r.description==='string'&&labels[r.kind])});
  const loaded=await request;if(dialog!==target||!target.isConnected)return;records=loaded;render();
 }catch{request=null;status.textContent='Search could not load. Retry or use the browse links below.';retry.hidden=false}
}
export function openFinder(trigger){if(dialog&&!dialog.isConnected){dialog=null;records=null;request=null;limit=20}if(!dialog)create();opener=trigger;if(!dialog.open)dialog.showModal();dialog.querySelector('#finder-query').focus();load()}
