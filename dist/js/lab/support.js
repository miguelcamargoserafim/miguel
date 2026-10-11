(function(lab){
  lab.mountSupportScenarios=function(parent){
    const {element:el,button,field}=lab;
    parent.append(el('p','Pratique a investigação antes de escolher uma intervenção. Os cenários são educativos e usam sintomas simulados.'));
    const select=el('select');lab.scenarios.forEach((s,i)=>{const option=el('option',s.name);option.value=i;select.append(option);});field(parent,'Cenário de suporte',select);
    const content=el('div');parent.append(content);
    function render(){
      const scenario=lab.scenarios[select.value];content.replaceChildren(el('h4','Sintomas'),el('p',scenario.symptoms),el('h4','Qual seria seu próximo passo?'));
      const choices=el('div',undefined,'lab-choice-list'),feedback=el('p','Escolha uma investigação.','lab-status'),solution=el('div',undefined,'lab-solution');feedback.setAttribute('role','status');solution.hidden=true;
      scenario.choices.forEach(([title,explanation,correct])=>{const choice=button(title,()=>{feedback.textContent=(correct?'Boa investigação. ':'Reavalie a abordagem. ')+explanation;feedback.dataset.state=correct?'success':'error';Array.from(choices.children).forEach(b=>b.setAttribute('aria-pressed','false'));choice.setAttribute('aria-pressed','true');if(correct){solution.hidden=false;solution.replaceChildren(el('h4','Solução recomendada'),el('p',scenario.solution));}});choice.setAttribute('aria-pressed','false');choices.append(choice);});
      content.append(choices,feedback,solution,button('Recomeçar cenário',render));
    }
    select.addEventListener('change',render);render();
  };
})(window.StackLab);
