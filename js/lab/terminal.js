(function(lab){
  lab.mountTerminal=function(parent){
    const {element:el,button}=lab;let timer,finishTyping,epoch=0,queue=Promise.resolve(),closed=false;const history=[];let position=0;
    parent.append(el('p','Terminal simulado. Não executa programas nem comandos do sistema. Digite help para começar.'));
    const screen=el('div',undefined,'lab-terminal');screen.tabIndex=0;screen.setAttribute('role','region');screen.setAttribute('aria-label','Saída do terminal');
    const log=el('div');screen.append(log);parent.append(screen);
    const announcement=el('p','', 'sr-only');announcement.setAttribute('role','status');parent.append(announcement);
    function print(message){
      const line=el('pre');log.append(line);
      if(log.children.length>60)log.firstElementChild.remove();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){line.textContent=message;announcement.textContent=message;return Promise.resolve();}
      return new Promise(resolve=>{finishTyping=resolve;let i=0;function tick(){if(closed){resolve();return;}i+=8;line.textContent=message.slice(0,i);screen.scrollTop=screen.scrollHeight;if(i<message.length)timer=setTimeout(tick,12);else{announcement.textContent=message;resolve();}}tick();});
    }
    log.append(el('pre','Stack Lab / Miguel cs.\nSessão local iniciada. Digite help.'));
    const form=el('form',undefined,'lab-terminal-input');const label=el('label','miguel@stack-lab:~ $');label.htmlFor='lab-command';
    const input=el('input');input.id='lab-command';input.autocomplete='off';input.spellcheck=false;input.maxLength=100;input.setAttribute('aria-label','Comando do terminal');form.append(label,input,button('Executar',()=>form.requestSubmit()));parent.append(form);
    form.addEventListener('submit',event=>{event.preventDefault();const command=input.value.trim();if(!command)return;history.push(command);position=history.length;input.value='';
      if(command.toLowerCase()==='clear'){epoch++;clearTimeout(timer);finishTyping?.();log.replaceChildren();queue=Promise.resolve();announcement.textContent='Terminal limpo.';return;}
      const submittedEpoch=epoch;queue=queue.then(()=>{if(closed||submittedEpoch!==epoch)return;log.append(el('pre','miguel@stack-lab:~ $ '+command));return print(lab.terminalReply(command));});
    });
    input.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();position=Math.max(0,Math.min(history.length,position+(event.key==='ArrowUp'?-1:1)));input.value=history[position]||'';});
    const suggestions=el('div',undefined,'lab-actions');['help','about','skills','projects','contact','stack','clear'].forEach(command=>suggestions.append(button(command,()=>{input.value=command;form.requestSubmit();input.focus();})));parent.append(suggestions);
    return ()=>{closed=true;clearTimeout(timer);finishTyping?.();};
  };
})(window.StackLab);
