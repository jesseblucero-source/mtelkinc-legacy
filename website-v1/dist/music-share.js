// Share only a public, localized soundtrack link. Never share page/form state.
const copy={
 en:{title:'Pass the soundtrack on.',hint:'Share a track link. It opens here, with playback in the listener’s control.',share:'Share track',copy:'Copy link',email:'Email',link:'Track link',copied:'Track link copied.',manual:'Select and copy the track link below.',unavailable:'Sharing could not open. Use Copy link instead.',choose:'Sharing options closed. You can also copy the link.',site:'Listen on MT E.L.K., INC.',external:'opens sharing in a new tab'},
 fr:{title:'Partagez la bande-son.',hint:'Partagez un lien vers ce morceau. La lecture reste au choix de la personne.',share:'Partager',copy:'Copier le lien',email:'E-mail',link:'Lien du morceau',copied:'Lien du morceau copié.',manual:'Sélectionnez et copiez le lien ci-dessous.',unavailable:'Le partage est indisponible. Utilisez Copier le lien.',choose:'Options de partage fermées. Vous pouvez aussi copier le lien.',site:'Écoutez sur MT E.L.K., INC.',external:'ouvre le partage dans un nouvel onglet'},
 es:{title:'Comparte la banda sonora.',hint:'Comparte el enlace de esta pista. Quien lo reciba decide cuándo reproducirla.',share:'Compartir',copy:'Copiar enlace',email:'Correo',link:'Enlace de la pista',copied:'Enlace de la pista copiado.',manual:'Selecciona y copia el enlace de abajo.',unavailable:'No se pudo abrir el menú. Usa Copiar enlace.',choose:'Opciones cerradas. También puedes copiar el enlace.',site:'Escucha en MT E.L.K., INC.',external:'abre las opciones en una pestaña nueva'},
 de:{title:'Teile den Soundtrack.',hint:'Teile einen Link zu diesem Titel. Die Wiedergabe startet erst auf Wunsch.',share:'Titel teilen',copy:'Link kopieren',email:'E-Mail',link:'Link zum Titel',copied:'Link zum Titel kopiert.',manual:'Markiere und kopiere den Link unten.',unavailable:'Teilen nicht verfügbar. Nutze Link kopieren.',choose:'Teilen geschlossen. Du kannst auch den Link kopieren.',site:'Anhören auf MT E.L.K., INC.',external:'öffnet Teilen in einem neuen Tab'}
};
export function mountMusicSharing(root){
 root.innerHTML='<div class="soundscape-sharing-heading"><h4 id="music-share-title"></h4><p></p></div><div class="soundscape-share-actions"><button type="button" data-music-share></button><button type="button" data-music-copy></button><a data-music-whatsapp target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a><a data-music-facebook target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a><a data-music-email></a></div><div class="soundscape-share-link"><label for="music-share-url"></label><input id="music-share-url" type="url" readonly spellcheck="false" autocapitalize="none"></div><p class="soundscape-share-status" role="status" aria-live="polite"></p>';
 const native=root.querySelector('[data-music-share]'),button=root.querySelector('[data-music-copy]'),field=root.querySelector('input'),status=root.querySelector('[role=status]');
 let ui=copy.en,payload,busy=false;
 function fallback(){status.textContent=ui.manual;field.focus();field.select();field.setSelectionRange(0,field.value.length)}
 button.onclick=async()=>{if(busy)return;try{busy=true;button.disabled=true;await navigator.clipboard.writeText(payload.url);status.textContent=ui.copied}catch{fallback()}finally{busy=false;button.disabled=false}};
 native.onclick=async()=>{if(busy)return;if(!navigator.share){fallback();return}try{busy=true;native.disabled=true;await navigator.share(payload);status.textContent=ui.choose}catch(error){if(error.name!=='AbortError')status.textContent=ui.unavailable;else status.textContent=''}finally{busy=false;native.disabled=false}};
 field.onclick=()=>field.select();
 return {update(track){
  const lang=document.documentElement.lang.slice(0,2),prefix=['fr','es','de'].includes(lang)?'/'+lang:'';ui=copy[lang]||copy.en;
  const url='https://www.mtelkinc.com'+prefix+'/?soundtrack='+encodeURIComponent(track.id);
  payload={title:'MT E.L.K., INC. | '+track.title,text:track.title+' - '+ui.site,url};
  root.lang=lang;root.querySelector('h4').textContent=ui.title;root.querySelector('.soundscape-sharing-heading p').textContent=ui.hint;
  native.textContent=ui.share;native.hidden=typeof navigator.share!=='function';button.textContent=ui.copy;root.querySelector('label').textContent=ui.link;field.value=url;status.textContent='';
  const whatsapp=root.querySelector('[data-music-whatsapp]'),facebook=root.querySelector('[data-music-facebook]'),email=root.querySelector('[data-music-email]');
  whatsapp.href='https://wa.me/?text='+encodeURIComponent(payload.text+' '+url);facebook.href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
  whatsapp.setAttribute('aria-label','WhatsApp - '+ui.external);facebook.setAttribute('aria-label','Facebook - '+ui.external);
  email.textContent=ui.email;email.href='mailto:?subject='+encodeURIComponent(payload.title)+'&body='+encodeURIComponent(payload.text+'\n\n'+url);
 }};
}
