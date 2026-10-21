const to='phillip@elkinc.com',cc='jesse@elkinc.com';
export function applicationEmailText(data,englishSteps,filename,lang){
 return ['MT E.L.K., INC. - Dealer or Distributor Application','Reference: '+data.reference,'Prepared: '+data.prepared,'Application language: '+lang,'PDF to attach: '+filename,'','Application for manual review. Submission is not approval.','','Review checklist:',...data.checks.map(c=>data.reviewMessages[c]),'',...data.groups.flatMap((g,i)=>[englishSteps[i],...g.answers.map(a=>a.englishLabel+': '+a.englishValue),'']),...(data.signature?['Electronic signature record',...data.signature.rows.map(r=>r.englishLabel+': '+r.englishValue),'Time and browser details are applicant/device-reported; identity is not verified.']:[])].join('\n');
}
export function initDealerEmailTools({form,ui,copy,lang,englishSteps,reviewMessages,getSnapshot}){
 const panel=form.querySelector('[data-dealer-email-tools]');if(!panel)return;
 const pdfButtons=[...panel.querySelectorAll('[data-dealer-pdf]')],prepare=panel.querySelector('[data-dealer-email-prepare]'),dialog=panel.querySelector('dialog'),close=dialog.querySelector('[data-email-close]'),copyButton=dialog.querySelector('[data-email-copy]'),details=dialog.querySelector('[data-email-details]'),subject=dialog.querySelector('[data-email-subject]'),open=dialog.querySelector('[data-email-open]'),status=panel.querySelector('[data-email-status]'),copyStatus=dialog.querySelector('[data-email-copy-status]');
 let current,opener,busy=false,destroyed=false,downloadURL;
 function capture(){const value=getSnapshot();if(!value)return null;current={...value,reviewMessages};return current}
 const filename=data=>'MTELK-Application-'+data.reference+'.pdf';
 function setStatus(text,error=false){status.textContent=text;status.setAttribute('role',error?'alert':'status')}
 async function download(){if(busy)return;const data=capture();if(!data)return;busy=true;pdfButtons.forEach(b=>b.disabled=true);setStatus(copy.loading);
  try{const {createApplicationPDF}=await import('./dealer-pdf.js?v=32128405bbe2');const blob=await createApplicationPDF(data,ui,copy,lang);if(destroyed)return;if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(blob);const link=document.createElement('a');link.href=downloadURL;link.download=filename(data);link.hidden=true;document.body.append(link);link.click();link.remove();setStatus(copy.ready)}catch(error){if(!destroyed)setStatus(error.message==='PDF_FONT_UNSUPPORTED'?copy.font_error:copy.pdf_error,true)}finally{busy=false;if(!destroyed)pdfButtons.forEach(b=>b.disabled=false)}
 }
 pdfButtons.forEach(b=>b.addEventListener('click',download));
 prepare.addEventListener('click',()=>{if(busy)return;const data=capture();if(!data)return;opener=prepare;subject.value='MT E.L.K., INC. - Dealer or Distributor Application - '+data.reference;details.value=applicationEmailText(data,englishSteps,filename(data),lang);const body='MT E.L.K., INC.\nApplication reference: '+data.reference+'\nPDF: '+filename(data)+'\n\n'+copy.draft;open.href='mailto:'+to+'?cc='+encodeURIComponent(cc)+'&subject='+encodeURIComponent(subject.value)+'&body='+encodeURIComponent(body);copyStatus.textContent='';dialog.showModal()});
 function restore(){if(opener?.isConnected)opener.focus({preventScroll:true});opener=null}
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',restore);
 copyButton.addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(details.value);copyStatus.textContent=copy.copied}catch{details.focus();details.select();copyStatus.textContent=copy.copy_error}});
 // Use a short mailto URL: full answers, EIN and personal details stay out of links.
 open.addEventListener('click',()=>{copyStatus.textContent=copy.notice});
 return {show(visible){panel.hidden=!visible},destroy(){destroyed=true;if(dialog.open)dialog.close();if(downloadURL)URL.revokeObjectURL(downloadURL)}};
}
