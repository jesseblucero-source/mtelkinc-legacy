export function initPage(){
 const panels=[...document.querySelectorAll('[data-article-reader]')];if(!panels.length)return;
 const supported=!!(window.speechSynthesis&&typeof window.SpeechSynthesisUtterance==='function'),synth=window.speechSynthesis;
 let active=true,current=null,utterance=null,generation=0,deadline;
 const readers=panels.map(panel=>({panel,copy:JSON.parse(panel.querySelector('[data-reader-copy]').textContent),lang:panel.dataset.readerLanguage,play:panel.querySelector('[data-reader-play]'),stop:panel.querySelector('[data-reader-stop]'),rate:panel.querySelector('[data-reader-rate]'),status:panel.querySelector('[data-reader-status]'),text:(panel.dataset.readerPreface+'\n\n'+panel.querySelector('[data-reader-text]').textContent).trim(),state:'idle',index:0,chunks:[],voice:null,available:panel.dataset.readerAvailable==='true'}));
 function show(r,message){r.status.textContent=message;r.panel.dataset.readerState=r.state;r.play.textContent=r.state==='starting'?r.copy.cancel:r.state==='playing'?r.copy.pause:r.state==='paused'?r.copy.resume:r.copy.listen;r.play.disabled=!r.voice||!r.available;r.rate.disabled=!r.available;r.stop.disabled=!['starting','playing','paused'].includes(r.state);r.play.setAttribute('aria-label',r.play.textContent+' — '+r.panel.dataset.readerTitle);}
 function cancelSpeech(){generation++;clearTimeout(deadline);if(supported)synth.cancel();utterance=null;}
 function stop(r,message=r.copy.stopped){if(current===r){cancelSpeech();current=null}r.state='idle';r.index=0;show(r,message);}
 function voices(){if(!active)return;for(const r of readers){const matches=supported?synth.getVoices().filter(v=>v.lang.toLowerCase().split(/[-_]/)[0]===r.lang):[];r.voice=matches.find(v=>v.default)||matches.find(v=>v.localService)||matches[0]||null;if(r.state==='idle')show(r,!r.available?r.copy.unavailable:!supported?r.copy.unsupported:r.voice?r.copy.ready:r.copy.missing);else if(!r.voice)stop(r,r.copy.missing);}}
 function chunks(text,lang){let sentences;try{sentences=[...new Intl.Segmenter(lang,{granularity:'sentence'}).segment(text)].map(s=>s.segment.trim())}catch{sentences=[text]}
  const out=[];for(const sentence of sentences){let piece='';for(const word of sentence.split(/\s+/)){if(piece.length+word.length>180&&piece){out.push(piece);piece=''}piece+=(piece?' ':'')+word}if(piece)out.push(piece)}return out;
 }
 function speak(r){if(!active||!r.voice)return;cancelSpeech();current=r;const token=generation;r.state='starting';show(r,r.copy.starting);
  document.dispatchEvent(new Event('mt-article-audio-start'));document.querySelector('#site-music')?.pause();
  const u=utterance=new SpeechSynthesisUtterance(r.chunks[r.index]);u.voice=r.voice;u.lang=r.voice.lang;u.rate=Number(r.rate.value);u.volume=1;
  u.onstart=()=>{if(!active||token!==generation)return;clearTimeout(deadline);r.state='playing';show(r,r.copy.playing.replace('{n}',r.index+1).replace('{total}',r.chunks.length));};
  u.onend=()=>{if(!active||token!==generation)return;clearTimeout(deadline);r.index++;if(r.index<r.chunks.length)speak(r);else stop(r,r.copy.complete)};
  u.onerror=()=>{if(!active||token!==generation)return;stop(r,r.copy.error)};
  deadline=setTimeout(()=>{if(active&&token===generation&&r.state==='starting')stop(r,r.copy.error)},10000);
  try{synth.speak(u)}catch{stop(r,r.copy.error)}
 }
 for(const r of readers){r.chunks=chunks(r.text,r.lang);r.play.addEventListener('click',()=>{if(!supported||!r.voice||!r.available)return;if(current&&current!==r)stop(current);if(r.state==='starting'){stop(r);return}if(r.state==='playing'){cancelSpeech();r.state='paused';show(r,r.copy.paused);return}if(r.state!=='paused')r.index=0;speak(r)});r.stop.addEventListener('click',()=>stop(r));r.rate.addEventListener('change',()=>{if(current===r){cancelSpeech();r.state='paused';show(r,r.copy.paused);}});}
 function stopForMedia(){if(current)stop(current);}
 function mediaClick(event){if(event.target.closest?.('[data-video],[data-play],[data-store-video-id],.queue-video,#player-next,#player-previous'))stopForMedia();}
 function mediaPlay(event){if(event.target.matches?.('audio,video'))stopForMedia();}
 const observer=new MutationObserver(changes=>{if(!current)return;for(const change of changes)for(const node of change.addedNodes){if(node.nodeType!==1)continue;const frames=node.matches('iframe')?[node]:[...node.querySelectorAll('iframe')];if(frames.some(f=>/youtube(?:-nocookie)?\.com\/embed\//.test(f.src)))stopForMedia();}});observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',mediaClick,true);document.addEventListener('play',mediaPlay,true);if(supported)synth.addEventListener('voiceschanged',voices);voices();
 const leave=()=>{if(!active)return;active=false;cancelSpeech();current=null;observer.disconnect();document.removeEventListener('click',mediaClick,true);document.removeEventListener('play',mediaPlay,true);if(supported)synth.removeEventListener('voiceschanged',voices)};
 if(window.MTPageRouter)window.MTPageRouter.onLeave(leave);else window.addEventListener('pagehide',leave,{once:true});
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
