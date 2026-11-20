// Applicant-only feedback; no persistence, telemetry or submission endpoints.
export function initDealerExperience({form,fields,steps,tabs,copy:c,lang,values,showStep,returnToReview,canEdit}){
 const element=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
 const format=(text,items)=>text.replace(/\{(\w+)\}/g,(_,key)=>String(items[key]??''));
 const marked=new Set(),statusNodes=new Map();let hasReviewed=false,currentErrors=[];
 const progressBox=element('div',undefined,'dealer-answer-progress'),progressTitle=element('label',c.progress),meter=element('progress');
 meter.id='dealer-required-progress';meter.max=1;meter.value=0;progressTitle.htmlFor=meter.id;
 const fraction=element('p'),position=element('p',undefined,'dealer-step-position'),hint=element('p',c.hint,'dealer-progress-hint');
 position.setAttribute('role','status');position.setAttribute('aria-live','polite');progressBox.append(progressTitle,meter,fraction,position,hint);
 document.querySelector('.dealer-progress').prepend(progressBox);
 const summary=element('section',undefined,'dealer-validation-errors');summary.hidden=true;summary.tabIndex=-1;summary.setAttribute('role','group');summary.setAttribute('aria-labelledby','dealer-errors-title');summary.setAttribute('aria-describedby','dealer-errors-intro');
 const title=element('h3',c.errors),intro=element('p'),list=element('ul');title.id='dealer-errors-title';intro.id='dealer-errors-intro';summary.append(title,intro,list);form.before(summary);
 const backToReview=element('button',c.return,'secondary dealer-return-review');backToReview.type='button';backToReview.hidden=true;backToReview.dataset.returnReview='';form.querySelector('.dealer-actions').append(backToReview);
 backToReview.addEventListener('click',()=>{if(canEdit())returnToReview()});
 for(const tab of tabs){const status=element('small',c.unfinished,'dealer-step-state');status.id='dealer-step-state-'+tab.dataset.dealerTab;tab.append(status);tab.setAttribute('aria-describedby',status.id);statusNodes.set(Number(tab.dataset.dealerTab),status)}
 const groups=new Map(fields.map(f=>[f.name,values(f)])),boxes=new Map(fields.map(f=>[f.name,form.querySelector('[data-field="'+f.name+'"]')]));
 const controls=f=>groups.get(f.name).filter(e=>!e.disabled&&e.willValidate);
 const invalid=f=>controls(f).some(e=>!e.checkValidity());
 const wrapper=f=>boxes.get(f.name);
 function issue(f){
  const input=controls(f).find(e=>!e.validity.valid);if(!input)return '';
  const v=input.validity;
  if(v.customError)return input.validationMessage;
  if(v.valueMissing)return f.kind==='checks'?c.choose:c.required;
  if(v.typeMismatch)return input.type==='email'?c.email:input.type==='url'?c.url:c.invalid;
  if(v.badInput)return c.number;
  if(v.rangeUnderflow||v.rangeOverflow){if(input.min!==''&&input.max!=='')return format(c.range,{min:input.min,max:input.max});return c.number}
  if(v.patternMismatch)return c.format;
  return c.invalid;
 }
 function clearField(f){
  const box=wrapper(f),id='dealer-error-'+f.name;box.querySelector('[data-field-error]')?.remove();box.removeAttribute('aria-invalid');
  for(const input of groups.get(f.name)){input.removeAttribute('aria-invalid');const ids=(input.getAttribute('aria-describedby')||'').split(/\s+/).filter(s=>s&&s!==id);ids.length?input.setAttribute('aria-describedby',ids.join(' ')):input.removeAttribute('aria-describedby')}
 }
 function fieldError(f){
  const box=wrapper(f),text=issue(f);if(!text){clearField(f);return}
  let note=box.querySelector('[data-field-error]');if(!note){note=element('p',undefined,'dealer-field-error');note.id='dealer-error-'+f.name;note.dataset.fieldError='';box.append(note)}
  if(note.textContent!==text)note.textContent=text;box.setAttribute('aria-invalid','true');
  groups.get(f.name).forEach((input,i)=>{if(!input.id)input.id='dealer-'+f.name+'-'+i;input.setAttribute('aria-invalid','true');const ids=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add(note.id);input.setAttribute('aria-describedby',[...ids].join(' '))});
 }
 function renderSummary(){
  currentErrors=currentErrors.filter(f=>invalid(f));list.replaceChildren();
  for(const f of currentErrors){const li=element('li'),button=element('button',f.labels[lang]);button.type='button';button.dataset.errorField=f.name;button.setAttribute('aria-describedby','dealer-error-'+f.name);li.append(button);list.append(li)}
  intro.textContent=format(c.errorIntro,{count:currentErrors.length});summary.hidden=!currentErrors.length;
 }
 list.addEventListener('click',event=>{const button=event.target.closest('[data-error-field]');if(!button||!canEdit())return;const f=fields.find(f=>f.name===button.dataset.errorField);const input=controls(f)[0];if(input){input.focus({preventScroll:true});input.scrollIntoView({block:'center',behavior:'auto'})}});
 function update(){
  if(!canEdit())return;
  const required=fields.filter(f=>controls(f).length&&(f.required||controls(f).some(e=>e.required)));
  const completed=required.filter(f=>!invalid(f)).length;meter.max=Math.max(1,required.length);meter.value=completed;meter.setAttribute('aria-valuetext',format(c.fraction,{complete:completed,total:required.length}));fraction.textContent=format(c.fraction,{complete:completed,total:required.length});
  for(let n=1;n<=5;n++){const valid=fields.filter(f=>f.step===n).every(f=>!invalid(f));statusNodes.get(n).textContent=valid?c.complete:c.unfinished;tabs[n-1].dataset.stepComplete=String(valid)}
  for(const f of fields){if(marked.has(f.name))fieldError(f);else if(f.kind==='checks')wrapper(f).removeAttribute('aria-invalid')}
  if(!summary.hidden)renderSummary();
 }
 function onStep(n){
  if(n===5)hasReviewed=true;summary.hidden=true;currentErrors=[];
  backToReview.hidden=!hasReviewed||n===5||!canEdit();position.textContent=format(c.position,{current:n});update();
  if(matchMedia('(max-width:760px)').matches){const container=tabs[n-1].closest('ol'),item=tabs[n-1].parentElement;container.scrollTo({left:Math.max(0,item.offsetLeft-container.offsetLeft-8),behavior:'auto'})}
 }
 function validate(n){
  const errors=fields.filter(f=>f.step===n&&invalid(f));if(!errors.length){update();return true}
  showStep(n);for(const f of errors){marked.add(f.name);fieldError(f)}currentErrors=errors;renderSummary();summary.focus({preventScroll:true});summary.scrollIntoView({block:'start',behavior:'auto'});return false;
 }
 function reviewButton(n,title){
  const button=element('button',c.edit,'dealer-review-edit');
  button.type='button';button.dataset.reviewStep=String(n);button.setAttribute('aria-label',c.edit+': '+title);button.disabled=!canEdit();
  button.addEventListener('click',()=>{
   if(!canEdit())return;
   showStep(n);
   if(n===5){
    const f=fields.find(f=>f.step===5&&controls(f).length),input=f&&controls(f)[0];
    if(input){input.focus({preventScroll:true});input.scrollIntoView({block:'center',behavior:'auto'})}
   }
  });
  return button;
 }
 return{update,onStep,validate,reviewButton,destroy(){summary.remove();progressBox.remove()}};
}
