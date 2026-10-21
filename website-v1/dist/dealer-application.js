import {initDealerEmailTools} from './dealer-email.js?v=93bdae78433b';
export function initPage(){
 const form=document.querySelector('#dealer-application');if(!form)return;
 const {fields,options,ui,lang,review_messages,email_ui,english_steps,signature_ui,signature_english}=JSON.parse(document.querySelector('#dealer-application-data').textContent);
 const steps=[...form.querySelectorAll('[data-dealer-step]')],tabs=[...document.querySelectorAll('[data-dealer-tab]')];
 const back=form.querySelector('[data-dealer-back]'),next=form.querySelector('[data-dealer-next]'),send=form.querySelector('[data-dealer-send]'),print=form.querySelector('[data-dealer-print]'),status=document.querySelector('#dealer-status'),review=document.querySelector('#dealer-review');
 let step=1,dirty=false,submitted=false,pending=false,snapshot,emailTools,signature;
 const signButton=form.querySelector('[data-dealer-sign]'),signatureStatus=form.querySelector('[data-signature-status]'),signaturePreview=form.querySelector('[data-signature-preview]');
 const token=typeof crypto.randomUUID==='function'?crypto.randomUUID().slice(0,8):Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>n.toString(16).padStart(2,'0')).join('');
 const ref='MTELK-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+token.toUpperCase();
 form.elements.application_reference.value=ref;document.querySelectorAll('[data-dealer-reference]').forEach(e=>e.textContent=ref);
 const values=f=>[...form.querySelectorAll('[name="'+f.name+'"]')];
 function raw(f){const es=values(f);if(f.kind==='checks')return es.filter(e=>e.checked).map(e=>e.value);if(f.kind==='checkbox')return es[0].checked?'yes':'no';const v=es[0].value.trim();return f.name==='ein'&&/^[0-9]{9}$/.test(v)?v.slice(0,2)+'-'+v.slice(2):v}
 function answer(f,locale=lang){const v=raw(f);const label=value=>options[value]?.[locale]||value;const text=Array.isArray(v)?v.map(label).join(', '):f.kind==='checkbox'?(v==='yes'?(locale==='en'?'Confirmed':ui.yes):(locale==='en'?'Not selected':ui.no)):label(v);return text||(locale==='en'?'Not provided':ui.not_provided)}
 const distributionNeeded=()=>form.elements.requested_account_type.value==='distributor-account'||['retailers','both'].includes(form.elements.customer_type.value);
 function routes(){const label=form.elements.requested_account_type.value==='distributor-account'?ui.route_distribution:Number(form.elements.store_locations.value)>1?ui.route_chain:ui.route_retail;return label+(form.elements.volume_review.value==='yes-request'?' · '+ui.route_volume:'')}
 function routingCode(){return (form.elements.requested_account_type.value==='distributor-account'?'distributor-review':Number(form.elements.store_locations.value)>1?'multi-location-dealer-review':'dealer-review')+(form.elements.volume_review.value==='yes-request'?'; volume-review-requested':'')}
 function reviewChecks(){const checks=['standard'];const requested=form.elements.requested_account_type.value,wholesale=['retailers','both'].includes(form.elements.customer_type.value);
  if((requested==='distributor-account'&&!wholesale)||(requested==='dealer'&&wholesale))checks.push('mismatch');
  if(distributionNeeded()&&Number(form.elements.retailer_accounts.value)===0)checks.push('network');
  if(['stockholding','replenishment','training'].some(n=>form.elements[n].value!=='ready'))checks.push('capacity');
  if(['registration_status','resale_status'].some(n=>form.elements[n].value!=='available'))checks.push('documents');
  if(form.elements.funding.value!=='available')checks.push('funding');if(Number(form.elements.opening_budget.value)===0)checks.push('budget');if(['ein-pending','ein-none'].includes(form.elements.ein_status.value))checks.push('ein');return checks;
 }
 function sync(){const distribution=distributionNeeded(),references=Boolean(form.elements.trade_reference_one.value.trim()||form.elements.trade_reference_two.value.trim());
  const conditions={ein:form.elements.ein_status.value==='ein-available',distribution,dealer:form.elements.requested_account_type.value==='dealer',references,documentation:['ein-pending','ein-none'].includes(form.elements.ein_status.value)||['registration_status','resale_status'].some(n=>['pending','not-applicable'].includes(form.elements[n].value))};
  for(const f of fields){const show=!f.conditional||Boolean(conditions[f.conditional]),required=Boolean(f.required||f.required_when&&conditions[f.required_when]);const wrapper=form.querySelector('[data-field="'+f.name+'"]');wrapper.hidden=!show;for(const input of values(f)){input.disabled=!show;input.required=show&&required&&f.kind!=='checks';}const marker=wrapper.querySelector('[data-required-marker]');if(marker)marker.textContent=required?' *':' ('+ui.optional+')';}
  const ein=form.elements.ein;ein.setCustomValidity(!ein.disabled&&ein.value&&!/^[0-9]{2}-?[0-9]{7}$/.test(ein.value.trim())?ui.ein_error:'');
  // Zero existing retailers is valid for a launch proposal; the review checklist requests verification.
  form.elements.retailer_accounts.setCustomValidity('');
  const annual=form.elements.annual_units;annual.setCustomValidity(annual.value&&form.elements.opening_units.value&&Number(annual.value)<Number(form.elements.opening_units.value)?ui.annual_error:'');
  for(const f of fields.filter(f=>f.kind==='checks')){const es=values(f),valid=es[0].disabled||!f.required||es.some(e=>e.checked);es[0].setCustomValidity(valid?'':ui.required_group);form.querySelector('[data-field="'+f.name+'"]').setAttribute('aria-invalid',String(!valid));}
 }
 function makeSnapshot(){return {reference:ref,prepared:new Date().toISOString(),route:routes(),checks:reviewChecks(),signature,groups:ui.step_titles.map((title,i)=>({title,answers:fields.filter(f=>f.step===i+1&&!values(f)[0].disabled).map(f=>({name:f.name,label:f.labels[lang],englishLabel:f.labels.en,value:answer(f),englishValue:answer(f,'en')}))}))}}
 function element(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e}
 function fillSummary(target,data,forPrint=false){target.replaceChildren();if(forPrint){target.append(element('h1',ui.print_heading));target.append(element('p',ui.reference+': '+data.reference+'\n'+ui.prepared+': '+new Date(data.prepared).toLocaleString(lang),'print-meta'));target.append(element('p',ui.route_label+': '+data.route));target.append(element('p',ui.ack));}
  else{target.append(element('h3',ui.review_title));const route=element('div',ui.route_label+': '+data.route,'dealer-route');route.append(element('small',ui.route_note));target.append(route);}
  target.append(element(forPrint?'h2':'h4',ui.checks_title));const checks=element('ul',undefined,'dealer-checks');for(const code of data.checks)checks.append(element('li',ui['flag_'+code]));target.append(checks,element('p',ui.checks_note,'dealer-checks-note'));
  for(const group of data.groups){target.append(element(forPrint?'h2':'h4',group.title));const dl=document.createElement('dl');for(const a of group.answers){const row=element('div',undefined,'print-answer');row.append(element('dt',a.label),element('dd',a.value));dl.append(row)}target.append(dl)}
  if(forPrint&&data.signature){const section=element('section',undefined,'dealer-signature-record');section.append(element('h2',data.signature.heading));renderSignature(section,data.signature);target.append(section)}
  if(forPrint)target.append(element('p',ui.print_note));
 }
 function renderSignature(target,record,includeDisclosure=true){const dl=element('dl',undefined,'dealer-signature-details');for(const row of record.rows){const div=element('div',undefined,'signature-answer');div.append(element('dt',row.label),element('dd',row.value,row.name==='signature_name'?'dealer-typed-signature':undefined));dl.append(div)}target.append(dl);if(includeDisclosure)target.append(element('p',record.disclosure,'dealer-signature-disclosure'))}
 function saveSignature(){if(!signature){let timezone=signature_ui.missing;try{timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||timezone}catch{}const value={name:form.elements.authorized_name.value.trim(),savedAt:new Date().toISOString(),timezone,device:(navigator.userAgent||signature_ui.missing).slice(0,512)+' | Platform: '+(navigator.platform||signature_ui.missing).slice(0,80),language:(navigator.language||signature_ui.missing).slice(0,40),version:'MTELK-APPLICATION-SIGNATURE-1'};
   const entries=[['signature_name','name',value.name],['signature_saved_at','signed_at',value.savedAt],['signature_timezone','timezone',value.timezone],['signature_device','device',value.device],['signature_browser_language','language',value.language],['signature_clock_source','source',signature_ui.device_clock,signature_english.device_clock],['signature_version','version',value.version],['signature_statement','agreement',signature_ui.consent,signature_english.consent]];
   const rows=entries.map(([name,key,text,english])=>({name,label:signature_ui[key],englishLabel:signature_english[key],value:text,englishValue:english||text}));signature={...value,heading:signature_ui.heading,disclosure:signature_ui.disclosure,rows};for(const row of rows)form.elements[row.name].value=row.englishValue;snapshot=null;
  }signatureStatus.textContent=signature_ui.saved;signaturePreview.replaceChildren();renderSignature(signaturePreview,signature,false);return signature;
 }
 function invalidateSignature(){if(!signature)return;for(const row of signature.rows)form.elements[row.name].value='';signature=null;snapshot=null;form.elements.signature_consent.checked=false;signatureStatus.textContent=signature_ui.changed;signaturePreview.replaceChildren()}
 function completedSnapshot(){if(pending||!submitted&&!validateAll())return null;if(!signature)saveSignature();return snapshot||(snapshot=makeSnapshot())}
 function show(n,focus=true){step=n;steps.forEach((e,i)=>e.hidden=i+1!==step);tabs.forEach((e,i)=>{if(i+1===step)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});back.hidden=step===1;next.hidden=step===5||submitted;send.hidden=step!==5||submitted;print.hidden=step!==5;
  emailTools?.show(step===5);if(step===5)fillSummary(review,snapshot||makeSnapshot());if(focus){const h=steps[step-1].querySelector('h2');h.focus({preventScroll:true});h.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
 }
 function validate(n){sync();const controls=[...steps[n-1].querySelectorAll('input,select,textarea')].filter(e=>!e.disabled);const invalid=controls.find(e=>!e.checkValidity());if(invalid){show(n);invalid.reportValidity();return false}return true}
 function validateAll(){for(let n=1;n<=5;n++)if(!validate(n))return false;return true}
 function move(n){if(pending||submitted)return;if(n>step)for(let i=1;i<n;i++)if(!validate(i))return;show(n)}
 tabs.forEach(b=>{b.disabled=false;b.addEventListener('click',()=>move(Number(b.dataset.dealerTab)))});
 back.addEventListener('click',()=>move(step-1));next.addEventListener('click',()=>move(step+1));
 const changed=event=>{if(!event.target.name)return;invalidateSignature();dirty=true;snapshot=null;sync();if(step===5)fillSummary(review,makeSnapshot())};form.addEventListener('input',changed);form.addEventListener('change',changed);
 const printRegion=element('section',undefined,'dealer-print');printRegion.id='dealer-print';printRegion.hidden=true;document.body.append(printRegion);
 function preparePrint(){if(!signature&&!pending&&!submitted){sync();if(form.checkValidity())saveSignature()}snapshot=snapshot||makeSnapshot();fillSummary(printRegion,snapshot,true)}
 signButton.addEventListener('click',()=>{if(pending||submitted||!validateAll())return;saveSignature();snapshot=makeSnapshot();fillSummary(review,snapshot)});
 print.addEventListener('click',()=>{if(!completedSnapshot())return;preparePrint();window.print()});window.addEventListener('beforeprint',preparePrint);
 function message(title,text,error=false){status.hidden=false;status.replaceChildren(element('h3',title),element('p',text));status.setAttribute('role',error?'alert':'status');status.focus();status.scrollIntoView({block:'center',behavior:'auto'})}
 form.addEventListener('submit',async event=>{event.preventDefault();if(pending||submitted||!validateAll())return;if(form.elements['bot-field'].value){message(ui.help,ui.error,true);return}saveSignature();snapshot=makeSnapshot();show(5,false);const payload=new URLSearchParams(new FormData(form));for(const f of fields){if(values(f)[0].disabled){payload.delete(f.name);continue}const v=raw(f);payload.set(f.name,Array.isArray(v)?v.map(x=>options[x]?.en||x).join(', '):answer(f,'en'))}
  payload.set('review_route',routingCode());payload.set('review_checks',snapshot.checks.map(code=>review_messages[code]).join('\n'));payload.set('submitted_at',snapshot.prepared);payload.set('application_summary',ui.print_heading+'\nReference: '+ref+'\nLanguage: '+lang+'\nReview route: '+routingCode()+'\nReview checklist:\n'+snapshot.checks.map(code=>review_messages[code]).join('\n')+'\nManual verification required; no automatic approval.\n\n'+snapshot.groups.map(g=>g.answers.map(a=>a.englishLabel+': '+a.englishValue).join('\n')).join('\n\n'));
  payload.set('application_summary',payload.get('application_summary')+'\n\nElectronic signature record:\n'+snapshot.signature.rows.map(r=>r.englishLabel+': '+r.englishValue).join('\n'));
  const controls=[...form.querySelectorAll('input,select,textarea,button')].filter(e=>!e.disabled),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
  pending=true;form.inert=true;controls.forEach(e=>e.disabled=true);send.textContent=ui.sending;
  try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString(),signal:controller.signal});const text=await response.text();if(!response.ok||!text.includes('data-dealer-received'))throw Error('Receipt not confirmed');submitted=true;dirty=false;for(const e of form.querySelectorAll('input,select,textarea'))e.disabled=true;message(ui.success,ui.reference+': '+ref+'\n'+ui.success_note);show(5,false);preparePrint();}
  catch{message(ui.help,ui.error+' '+ui.reference+': '+ref,true)}finally{clearTimeout(timeout);pending=false;form.inert=false;if(!submitted)controls.forEach(e=>e.disabled=false);else{print.disabled=false;controls.filter(e=>e.closest('[data-dealer-email-tools]')).forEach(e=>e.disabled=false)}send.disabled=false;send.textContent=ui.submit}
 });
 window.addEventListener('beforeunload',e=>{if(dirty&&!submitted){e.preventDefault();e.returnValue=''}});
 document.addEventListener('click',event=>{const a=event.target.closest?.('a[href]');if(!a||a.hasAttribute('download')||a.matches('[data-email-open]')||!dirty||submitted||event.defaultPrevented)return;const u=new URL(a.href,location.href);if(u.pathname===location.pathname&&u.origin===location.origin)return;if(!confirm(ui.leave)){event.preventDefault();event.stopImmediatePropagation()}else dirty=false},{capture:true});
 emailTools=initDealerEmailTools({form,ui,copy:email_ui,lang,englishSteps:english_steps,reviewMessages:review_messages,getSnapshot:completedSnapshot});
 window.MTPageRouter?.onLeave(()=>{printRegion.remove();emailTools?.destroy()});window.addEventListener('pagehide',()=>{printRegion.remove();emailTools?.destroy()});
 sync();show(1,false);for(const b of [back,next,send,print,signButton])b.disabled=false;form.noValidate=true;
}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage()}
