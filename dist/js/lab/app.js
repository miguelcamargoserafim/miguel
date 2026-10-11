/* Navegação interna: um único módulo montado por vez, sem abrir outra guia. */
(function(lab){
  const host=document.querySelector('#stack-lab');if(!host)return;
  const cards=host.querySelector('#lab-cards'),workspace=host.querySelector('#lab-workspace'),body=host.querySelector('#lab-body'),title=host.querySelector('#lab-module-title'),selector=host.querySelector('#lab-module-select');
  let cleanup;
  const mounts={code:lab.mountCode,sql:lab.mountSQL,api:lab.mountAPI,terminal:lab.mountTerminal,support:lab.mountSupport,challenges:lab.mountChallenges};
  lab.modules.forEach(([id,icon,name,description,tech])=>{
    const card=lab.element('article',undefined,'lab-card');
    const visual=lab.element('span',icon,'lab-card-icon');visual.setAttribute('aria-hidden','true');
    card.append(visual,lab.element('h3',name),lab.element('p',description),lab.element('p',tech,'lab-tech'));
    const open=lab.button('Abrir laboratório ↗',()=>show(id));open.setAttribute('aria-label','Abrir '+name);card.append(open);cards.append(card);
    const option=lab.element('option',name);option.value=id;selector.append(option);
  });
  function show(id,focus=true){
    const module=lab.modules.find(m=>m[0]===id);if(!module)return;
    cleanup?.();cleanup=undefined;body.replaceChildren();workspace.hidden=false;title.textContent=module[2];selector.value=id;
    document.querySelectorAll('[data-support-link]').forEach(link=>{if(id==='support')link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    if(id!=='support' && location.hash==='#tech-support') history.replaceState(null,'','#stack-lab');
    try{cleanup=mounts[id](body);}catch(error){body.append(lab.element('p','Não foi possível abrir este módulo. Tente selecionar outro laboratório. '+error.message,'lab-status'));}
    host.querySelectorAll('.lab-card').forEach((card,index)=>card.classList.toggle('is-active',lab.modules[index][0]===id));
    if(focus){title.focus();workspace.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
  }
  selector.addEventListener('change',()=>show(selector.value));
  host.querySelector('#lab-close').addEventListener('click',()=>{const id=selector.value;
    if(location.hash==='#tech-support') history.replaceState(null,'','#stack-lab');
    document.querySelectorAll('[data-support-link]').forEach(link=>link.removeAttribute('aria-current'));
    cleanup?.();cleanup=undefined;body.replaceChildren();workspace.hidden=true;host.querySelectorAll('.lab-card').forEach(card=>card.classList.remove('is-active'));const index=lab.modules.findIndex(m=>m[0]===id);cards.children[index]?.querySelector('button').focus();});
  lab.mountProjects(host.querySelector('#lab-real-projects'));

  // Botão abaixo do nome e endereço direto, sem abrir outra guia.
  document.querySelectorAll('a[href="#tech-support"]').forEach(link=>{
    link.addEventListener('click',event=>{
      event.preventDefault();
      if(location.hash!=='#tech-support') history.pushState(null,'','#tech-support');
      show('support');
    });
  });
  window.addEventListener('hashchange',()=>{
    if(location.hash==='#tech-support') show('support');
  });
  if(location.hash==='#tech-support') requestAnimationFrame(()=>show('support'));

})(window.StackLab);
