export function initPage(){
(() => {
 const records = {
  cow:{title:'Cow Call Draws Elk Like Crazy',description:'The Independent Record · October 10, 1986 · Mark Henckel. Newspaper page preview; the PDF contains the complete preserved file.',image:'/assets/cow-call-draws-elk-742-a195f1f1.webp',pdf:'/records/BRWBCF4D415B79D_002264.pdf',archive:'/archive/cow-call-draws-elk/',width:742,height:963},
  show:{title:'Montana Outdoor Recreation Exposition',description:'The Billings Gazette · March 24, 1988. Advertisement for scheduled presentations at the March 25–27 exposition.',image:'/assets/more-exposition-963-9af07b6c.webp',pdf:'/records/BRWBCF4D415B79D_002308.pdf',archive:'/archive/more-exposition/',width:963,height:742},
  founder:{title:'Don Laubach: Company Biographical Sheet',description:'Company record · July 30, 1998. Biographical text with handwritten seminar and demonstration notes.',image:'/assets/founder-record-742-f5f6c9fb.webp',pdf:'/records/BRWBCF4D415B79D_002267.pdf',archive:'/archive/founder-record/',width:742,height:963}
 };
 const dialog=document.getElementById('record-dialog');if(!dialog)return;
 const image=document.getElementById('record-image'),viewer=dialog.querySelector('.record-viewer'),minus=document.getElementById('record-zoom-out'),plus=document.getElementById('record-zoom-in'),fit=document.getElementById('record-zoom-reset'),status=document.getElementById('record-zoom-status'),close=dialog.querySelector('.dialog-close');let zoom=100,opener;
 function size(value){zoom=Math.max(100,Math.min(250,value));image.style.width=zoom+'%';status.textContent=zoom+'%';minus.disabled=zoom===100;plus.disabled=zoom===250;if(zoom===100){viewer.scrollTop=0;viewer.scrollLeft=0;}}
 document.querySelectorAll('[data-record]').forEach(button=>button.addEventListener('click',()=>{
  const r=records[button.dataset.record];if(!r)return;if(typeof dialog.showModal!=='function'){location.href=r.archive;return;}
  opener=button;document.getElementById('record-dialog-title').textContent=r.title;document.getElementById('record-description').textContent=r.description;
  dialog.querySelectorAll('[data-article-preview]').forEach(panel=>{panel.hidden=panel.dataset.articlePreview!==button.dataset.record;});
  image.width=r.width;image.height=r.height;image.src=r.image;image.alt=r.title+' — '+({fr:'reproduction originale conservée',es:'reproducción original conservada'}[document.documentElement.lang]||'preserved source scan');document.getElementById('record-pdf').href=r.pdf;size(100);dialog.showModal();document.body.classList.add('dialog-open');close.focus();
 }));
 minus.addEventListener('click',()=>size(zoom-25));plus.addEventListener('click',()=>size(zoom+25));fit.addEventListener('click',()=>size(100));close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');size(100);opener?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
})();

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
