(()=>{'use strict';
  const chapters=window.LUMBRAL_GUIDE,byId=id=>document.getElementById(id);
  const flat=chapters.flatMap((chapter,c)=>chapter.lessons.map((lesson,l)=>({chapter,lesson,c,l})));
  const link=(c,l=0)=>'guia.html?capitulo='+c+'&leccion='+l;
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const params=new URLSearchParams(location.search);
  let c=Math.max(0,Math.min(chapters.length-1,parseInt(params.get('capitulo'),10)||0));
  let l=Math.max(0,Math.min(chapters[c].lessons.length-1,parseInt(params.get('leccion'),10)||0));
  const search=byId('guide-search'),content=byId('lesson-content'),nav=byId('chapter-list'),select=byId('mobile-chapter');
  chapters.forEach((chapter,index)=>{
    const button=el('button');button.type='button';button.append(el('span','chapter-n',String(index+1).padStart(2,'0')),el('span','',chapter.title),el('span','chapter-count',chapter.lessons.length));button.addEventListener('click',()=>navigate(index,0));nav.append(button);
    const option=el('option','',String(index+1).padStart(2,'0')+' · '+chapter.title);option.value=index;select.append(option);
  });
  select.addEventListener('change',()=>navigate(Number(select.value),0));
  function navigate(chapter,lesson,push=true){
    c=chapter;l=lesson;search.value='';if(push)history.pushState({c,l},'',link(c,l));render();
    if(push){content.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});content.focus({preventScroll:true});}
  }
  function demo(lesson){
    const box=el('div','lesson-visual'),image=el('img');image.src=lesson.demo==='color'||lesson.demo==='range'?'coast.jpg':'mountains.jpg';image.alt='Ejemplo visual de '+lesson.title;image.width=800;image.height=450;box.append(image,el('span','lesson-demo-tag','DEMOSTRACIÓN ILUSTRATIVA'));
    const controls=el('div','lesson-demo-controls'),label=el('label'),output=el('output'),slider=el('input');slider.type='range';slider.min='0';slider.max='100';slider.value='50';slider.id='lesson-slider';label.htmlFor=slider.id;label.append(el('span','','Prueba el ajuste'),output);controls.append(label,slider);box.append(controls);
    const mode=lesson.demo;let layer;
    if(['brush','linear','radial','range','retouch'].includes(mode)){layer=el('div','mask-example');if(mode==='linear'){layer.style.cssText='inset:30% 0 0;width:100%;height:70%;border-radius:0;border:0;border-top:2px solid #fff9;background:linear-gradient(transparent,#e34d5090)';}if(mode==='retouch')layer.style.borderRadius='36% 45% 39% 50%';box.append(layer);}
    if(mode==='crop'){layer=el('div','crop-example');box.append(layer);}
    if(mode==='curve'){
      layer=el('div','curve-example');const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');
      const grid=document.createElementNS(ns,'path');grid.setAttribute('d','M0 50H100M50 0V100M0 100L100 0');grid.setAttribute('stroke','#ffffff30');svg.append(grid);
      const curve=document.createElementNS(ns,'path');curve.setAttribute('id','demo-curve');curve.setAttribute('d','M0 100C25 95 65 10 100 0');svg.append(curve);layer.append(svg);box.append(layer);
    }
    function update(){const v=Number(slider.value)/100;output.textContent=Math.round(v*100)+' %';
      if(['brush','radial','range','retouch'].includes(mode)){layer.style.transform=`translateX(${(v-.5)*90}%)`;label.firstChild.textContent=mode==='retouch'?'Mueve la zona marcada':'Mueve la máscara';image.style.filter='brightness(1.05)';}
      else if(mode==='linear'){layer.style.opacity=String(.2+v*.8);label.firstChild.textContent='Intensidad de la selección';}
      else if(mode==='crop'){layer.style.transform=`rotate(${(v-.5)*16}deg)`;label.firstChild.textContent='Giro del encuadre';output.textContent=((v-.5)*16).toFixed(1)+'°';}
      else if(mode==='color'){image.style.filter=`saturate(${v*2}) sepia(${v*.18})`;label.firstChild.textContent='Saturación';}
      else if(mode==='zoom'){image.style.transform=`scale(${1+v})`;label.firstChild.textContent='Acercar la foto';output.textContent=(1+v).toFixed(1)+'×';}
      else if(mode==='curve'){image.style.filter=`contrast(${.75+v*.7})`;byId('demo-curve')?.setAttribute('d',`M0 100C${Math.round(45-v*35)} 100 ${Math.round(70+v*20)} 0 100 0`);label.firstChild.textContent='Contraste de la curva';}
      else if(mode==='detail'){image.style.filter=`contrast(${.9+v*.4}) saturate(${.95+v*.15})`;label.firstChild.textContent='Contraste del detalle';}
      else{image.style.filter=`brightness(${.65+v*.7})`;label.firstChild.textContent='Luz del ejemplo';}
    }slider.addEventListener('input',update);update();return box;
  }
  function render(){
    content.replaceChildren();content.className='lesson-content';nav.querySelectorAll('button').forEach((button,index)=>button.setAttribute('aria-current',String(index===c)));select.value=String(c);
    const chapter=chapters[c],lesson=chapter.lessons[l];document.title=lesson.title+' — Guía de Lumbral';
    const row=el('div','chapter-title-row');row.append(el('span','eyebrow',String(c+1).padStart(2,'0')+' / '+chapter.title));const total=el('a','','38 lecciones');total.href='guia.html';row.append(total);content.append(row,el('h2','',lesson.title));
    const tabs=el('nav','lesson-tabs');tabs.setAttribute('aria-label','Lecciones de '+chapter.title);chapter.lessons.forEach((item,index)=>{const a=el('a','',item.title);a.href=link(c,index);a.setAttribute('aria-current',String(index===l));a.addEventListener('click',event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(c,index);}});tabs.append(a);});content.append(tabs,demo(lesson));
    const body=el('div','lesson-body');lesson.body.split('\n\n').forEach(paragraph=>body.append(el('p','',paragraph)));body.append(el('p','lesson-instruction','La imagen interactiva es una ilustración para entender el concepto. El resultado y los controles reales están en la app; la demostración web no reproduce su motor de edición.'));content.append(body);
    const current=flat.findIndex(item=>item.c===c&&item.l===l),pagination=el('nav','lesson-pagination');pagination.setAttribute('aria-label','Continuar aprendiendo');
    const prev=flat[current-1],next=flat[current+1];for(const [item,prefix] of [[prev,'← '],[next,'Siguiente: ']]){if(!item){pagination.append(el('span'));continue;}const a=el('a','',prefix+item.lesson.title+(item===next?' →':''));a.href=link(item.c,item.l);a.addEventListener('click',event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(item.c,item.l);}});pagination.append(a);}content.append(pagination);
  }
  const normalize=value=>value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  search.addEventListener('input',()=>{
    const term=normalize(search.value.trim());if(!term){render();return;}content.replaceChildren();content.className='lesson-content search-results-panel';
    const results=flat.filter(item=>normalize(item.lesson.title+' '+item.lesson.body+' '+item.chapter.title).includes(term));
    const wrapper=el('div','search-results');wrapper.append(el('h2','',results.length+' '+(results.length===1?'lección encontrada':'lecciones encontradas')));
    if(!results.length)wrapper.append(el('p','search-empty','Prueba con “máscaras”, “letras”, “exportar” o “color”.'));
    results.forEach(item=>{const a=el('a');a.href=link(item.c,item.l);a.append(el('span','',item.chapter.title),el('strong','',item.lesson.title),el('p','',item.lesson.body.replace(/\n/g,' ').slice(0,150)+'…'));a.addEventListener('click',event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();navigate(item.c,item.l);}});wrapper.append(a);});content.append(wrapper);
  });
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);const chapter=Math.max(0,Math.min(chapters.length-1,parseInt(p.get('capitulo'),10)||0));const lesson=Math.max(0,Math.min(chapters[chapter].lessons.length-1,parseInt(p.get('leccion'),10)||0));navigate(chapter,lesson,false);});render();
})();
