(()=>{'use strict';
  const q=(s)=>document.querySelector(s),qa=(s)=>document.querySelectorAll(s);
  qa('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const toggle=q('.menu-toggle'),nav=q('#navigation');
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');nav.classList.toggle('open',open);});
  nav?.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Abrir menú');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');toggle.focus();}});
  const dialog=q('#privacy-dialog');qa('[data-privacy]').forEach(button=>button.addEventListener('click',()=>dialog?.showModal()));q('.dialog-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  const range=q('#hero-exposure'),photo=q('#hero-photo'),compare=q('#hero-compare');
  const updateDemo=()=>{if(!range)return;const original=compare.getAttribute('aria-pressed')==='true';const value=Number(range.value);photo.style.filter=original?'none':`brightness(${1+value/200}) saturate(1.12)`;q('#hero-exposure-value').textContent=(value>=0?'+':'')+(value/50).toFixed(2).replace('.',',');compare.querySelector('span').textContent=original?'Ver edición':'Ver original';};
  range?.addEventListener('input',updateDemo);compare?.addEventListener('click',()=>{compare.setAttribute('aria-pressed',String(compare.getAttribute('aria-pressed')!=='true'));updateDemo();});updateDemo();
  // The stable GitHub link works for every future release, even if the metadata API is unavailable.
  if(q('[data-version]')){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6500);
    fetch('https://api.github.com/repos/Wertuyu16/lumbral-updates/releases/latest',{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}})
      .then(response=>{if(!response.ok)throw new Error('release-unavailable');return response.json();})
      .then(release=>{
        if(typeof release.tag_name!=='string'||!/^v\d+(?:\.\d+)+$/.test(release.tag_name))throw new Error('invalid-release');
        qa('[data-version]').forEach(el=>el.textContent=(/beta/i.test(release.name||'')||release.prerelease?'Beta ':'Versión ')+release.tag_name.slice(1));
        const apk=Array.isArray(release.assets)&&release.assets.find(asset=>asset.name==='Lumbral.apk');
        if(apk&&Number.isFinite(apk.size))qa('[data-size]').forEach(el=>el.textContent=(apk.size/1e6).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1})+' MB');
        const title=q('#release-title');if(title&&typeof release.name==='string')title.textContent=release.name.replace(/^Lumbral\s+(?:Beta\s+)?[\d.]+(?:-beta)?\s*[·:–—-]?\s*/i,'')||'Una nueva versión de Lumbral';
        const points=typeof release.body==='string'?release.body.split('\n').filter(line=>/^\s*[-*]\s/.test(line)).slice(0,4):[];
        const list=q('#release-points');if(list&&points.length){list.replaceChildren(...points.map(line=>{const li=document.createElement('li');li.textContent=line.replace(/^\s*[-*]\s+/,'').replace(/\*\*/g,'');return li;}));}
        const link=q('#release-link');if(link)link.href='https://github.com/Wertuyu16/lumbral-updates/releases/tag/'+encodeURIComponent(release.tag_name);
        const status=q('#release-status');if(status)status.textContent='Versión consultada directamente en GitHub.';
      }).catch(()=>{const status=q('#release-status');if(status)status.textContent='No se han podido actualizar las notas. El botón de descarga sigue apuntando a la última versión de GitHub.';}).finally(()=>clearTimeout(timeout));
  }
})();
