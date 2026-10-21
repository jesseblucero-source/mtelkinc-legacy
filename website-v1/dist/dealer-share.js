export function initPage(){
 for(const panel of document.querySelectorAll('.dealer-share')){
  const input=panel.querySelector('input'),share=panel.querySelector('[data-share-application]'),copy=panel.querySelector('[data-copy-application]'),status=panel.querySelector('[role=status]');
  let pending=false;
  async function copyLink(){
   try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(input.value);status.textContent=panel.dataset.linkCopied;}
   catch{try{input.focus({preventScroll:true});input.select();input.setSelectionRange(0,input.value.length)}catch{input.focus();input.select()}status.textContent=panel.dataset.linkManual;}
  }
  async function run(action){if(pending)return;pending=true;share.disabled=copy.disabled=true;status.textContent='';try{await action()}finally{pending=false;share.disabled=copy.disabled=false}}
  copy.addEventListener('click',()=>run(copyLink));
  share.addEventListener('click',()=>run(async()=>{
   if(!navigator.share)return copyLink();
   try{await navigator.share({title:panel.dataset.shareTitle,url:input.value});status.textContent=panel.dataset.shareReady;}
   catch(error){if(error.name!=='AbortError')await copyLink();}
  }));
  share.disabled=copy.disabled=false;
 }
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage()}
