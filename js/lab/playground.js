/* A prévia nunca recebe allow-same-origin. CSP bloqueia rede e navegação de formulários. */
(function (lab) {
  lab.playgroundDefaults = {
    html:'<main>\n  <p class="eyebrow">MEU PRIMEIRO EXPERIMENTO</p>\n  <h1>Olá, laboratório.</h1>\n  <p>HTML estrutura. CSS apresenta. JavaScript responde.</p>\n  <button id="counter" type="button">Cliques: 0</button>\n</main>',
    css:'body { margin: 0; padding: 32px; background: #091421; color: #e4f6ff; font-family: system-ui; }\nmain { max-width: 440px; margin: auto; }\nh1 { font-size: 36px; }\n.eyebrow { color: #67e8f9; font-size: 12px; letter-spacing: 2px; }\nbutton { padding: 12px 20px; border: 0; border-radius: 8px; background: #67e8f9; color: #091421; cursor: pointer; }',
    js:'let count = 0;\nconst button = document.querySelector("#counter");\nbutton.addEventListener("click", () => {\n  count += 1;\n  button.textContent = "Cliques: " + count;\n});'
  };
  lab.previewDocument = function (code, token) {
    const template=document.createElement('template');
    template.innerHTML=code.html;
    const parsed=template.content;
    parsed.querySelectorAll('script,iframe,object,embed,meta,base,link,form').forEach(node=>node.remove());
    parsed.querySelectorAll('*').forEach(node=>Array.from(node.attributes).forEach(attr=>{
      if (/^on/i.test(attr.name) || ['src','srcset','href','action','formaction','target'].includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
    }));
    const css=code.css.replace(/<\/style/gi,'<\\/style');
    const js=code.js.replace(/<\/script/gi,'<\\/script');
    const bridge='const report=(type,message)=>parent.postMessage({stackLab:'+JSON.stringify(token)+',type,message:String(message).slice(0,1000)},"*");window.addEventListener("error",e=>report("error",e.message));window.addEventListener("unhandledrejection",e=>report("error",e.reason));window.addEventListener("load",()=>report("ready","Prévia executada."));';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\'"><style>'+css+'</style></head><body>'+template.innerHTML+'<script>'+bridge+'<\/script><script>'+js+'<\/script></body></html>';
  };
  lab.mountCode = function (parent) {
    const {element:el,button,field}=lab;
    const code={...lab.playgroundDefaults};let active='html',frame,token,failed=false;
    parent.append(el('p','Experimente uma interface pequena. A prévia é isolada, sem acesso ao portfólio, armazenamento ou rede. Links, formulários e recursos externos do HTML são removidos.'));
    const layout=el('div',undefined,'lab-split'),editor=el('div'),preview=el('div');layout.append(editor,preview);parent.append(layout);
    const tabs=el('div',undefined,'lab-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Linguagem do editor');
    const input=el('textarea',undefined,'lab-code');input.spellcheck=false;input.id='lab-code-input';input.rows=14;
    const panel=el('div');panel.setAttribute('role','tabpanel');panel.id='lab-code-panel';
    const tabButtons=[];
    function select(language,focus=false) {
      code[active]=input.value;active=language;input.value=code[active];input.setAttribute('aria-label','Código '+language.toUpperCase());panel.setAttribute('aria-labelledby','lab-tab-'+language);
      tabButtons.forEach(b=>{const chosen=b.dataset.language===active;b.setAttribute('aria-selected',String(chosen));b.tabIndex=chosen?0:-1;if(chosen&&focus)b.focus();});
    }
    ['html','css','js'].forEach((language,index)=>{
      const b=button(language.toUpperCase(),()=>select(language));b.dataset.language=language;b.id='lab-tab-'+language;b.setAttribute('role','tab');b.setAttribute('aria-controls',panel.id);tabButtons.push(b);tabs.append(b);
      b.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=(index+1)%3;if(event.key==='ArrowLeft')target=(index+2)%3;if(event.key==='Home')target=0;if(event.key==='End')target=2;if(target!==undefined){event.preventDefault();select(['html','css','js'][target],true);}});
    });
    input.value=code.html;panel.append(input);editor.append(tabs,panel);select('html');
    const actions=el('div',undefined,'lab-actions');editor.append(actions);
    const setStatus=lab.status(parent);preview.append(el('h4','Pré-visualização'));
    const frameHost=el('div',undefined,'lab-frame-host');preview.append(frameHost);
    function run(){
      code[active]=input.value;failed=false;setStatus('Executando…');
      token=crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random();
      frame=el('iframe');frame.title='Resultado isolado do Code Playground';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');
      frame.srcdoc=lab.previewDocument(code,token);frameHost.replaceChildren(frame);
    }
    const listener=event=>{if(event.source!==frame?.contentWindow||event.data?.stackLab!==token)return;if(event.data.type==='error'){failed=true;setStatus('Erro na prévia: '+String(event.data.message).slice(0,1000),'error');}else if(event.data.type==='ready'&&!failed)setStatus('Prévia executada. Teste o botão dentro dela.','success');};
    window.addEventListener('message',listener);
    actions.append(button('Executar',run),button('Restaurar',()=>{Object.assign(code,lab.playgroundDefaults);input.value=code[active];run();}),button('Copiar',async()=>{try{await lab.copy(input.value);setStatus('Código da aba copiado.','success');}catch(error){setStatus(error.message,'error');}}));
    run();return ()=>{window.removeEventListener('message',listener);frame?.remove();};
  };
})(window.StackLab);
