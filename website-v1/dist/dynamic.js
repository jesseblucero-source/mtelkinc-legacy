export function initPage(){
document.querySelectorAll('[data-library]').forEach(library => {
 const form = library.querySelector('form'); const items = [...library.querySelectorAll('[data-item]')];
 if (!form) return;
 const params = new URLSearchParams(location.search);
 for (const control of form.querySelectorAll('input,select')) { const value = params.get(control.name); if (value !== null && (control.tagName !== 'SELECT' || [...control.options].some(o=>o.value === value))) control.value = value; }
 function apply(writeURL) {
  const data = new FormData(form); const query = String(data.get('q') || '').trim().toLowerCase(); let count = 0;
  for (const item of items) { const matches = [...data.entries()].every(([key,value]) => key === 'q' ? (item.dataset.search || '').includes(query) : !value || value === 'all' || item.dataset[key] === value); item.hidden = !matches; if(matches) count++; }
  const recordWords={en:[' record available',' records available'],fr:[' document disponible',' documents disponibles'],es:[' registro disponible',' registros disponibles'],de:[' Dokument verfügbar',' Dokumente verfügbar']}[document.documentElement.lang]||[' record available',' records available'];
  library.querySelector('.result-count').textContent = count + (library.id === 'archive-library' ? recordWords[count===1?0:1] : (count === 1 ? ' lesson available' : ' lessons available'));
  library.querySelector('.library-empty').hidden = count !== 0;
  if(writeURL) { const url = new URL(location.href); for (const [key,value] of data) { if(value && value !== 'all')url.searchParams.set(key,value);else url.searchParams.delete(key); } history.replaceState(null,'',url); }
 }
 form.addEventListener('submit',e=>{e.preventDefault();apply(true);});
 form.addEventListener('input',()=>apply(true));form.addEventListener('change',()=>apply(true));
 form.addEventListener('reset',()=>{setTimeout(()=>apply(true),0);});
 apply(false);
});

}
if(!window.MTPageRouter?.booting){if(window.MTPageRouter)window.MTPageRouter.run(initPage);else initPage();}
