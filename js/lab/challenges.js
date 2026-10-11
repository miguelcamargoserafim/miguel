(function(lab){
  lab.mountClassicChallenges=function(parent){
    const {element:el,button,field}=lab;let progress=lab.readProgress();
    parent.append(el('p','Respostas são verificadas como texto, sem executar código arbitrário. Pontos são concedidos uma vez por desafio; o progresso fica somente neste navegador.'));
    const score=el('p',undefined,'lab-score');parent.append(score);
    const filter=el('select');['Todas','Fácil','Médio','Difícil'].forEach(level=>filter.append(el('option',level)));field(parent,'Dificuldade',filter);
    const select=el('select');field(parent,'Desafio',select);const content=el('div');parent.append(content);
    const history=el('details');history.append(el('summary','Histórico de progresso'));const historyBody=el('div');history.append(historyBody);parent.append(history);
    function refresh(){score.textContent=lab.score(progress)+' / 110 pontos · '+lab.challenges.filter(c=>progress[c.id]?.solved).length+' / '+lab.challenges.length+' resolvidos';const rows=lab.challenges.filter(c=>progress[c.id]).map(c=>({desafio:c.area+' — '+c.id,tentativas:progress[c.id].attempts,estado:progress[c.id].solved?'Resolvido':'Em andamento',data:progress[c.id].date}));historyBody.replaceChildren(rows.length?lab.table(rows,'Seu progresso'):el('p','Nenhuma tentativa registrada.'));}
    function render(){const c=lab.challenges.find(c=>c.id===select.value);content.replaceChildren();if(!c)return;
      content.append(el('h4',c.area+' / '+c.level+' / '+c.points+' pontos'),el('p',c.prompt));
      const form=el('form'),answer=el('textarea',undefined,'lab-code');answer.rows=3;answer.required=true;answer.maxLength=1000;answer.spellcheck=false;field(form,'Sua resposta',answer);
      const submit=el('button','Validar resposta','lab-button');submit.type='submit';form.append(submit);content.append(form);
      const hint=el('details');hint.append(el('summary','Ver dica'),el('p',c.hint));content.append(hint);const status=lab.status(content);
      if(progress[c.id]?.solved)status('Você já resolveu este desafio. Pode praticar novamente.','success');
      form.addEventListener('submit',event=>{event.preventDefault();const correct=lab.grade(c.id,answer.value),previous=progress[c.id];progress[c.id]={attempts:Math.min((previous?.attempts||0)+1,99999),solved:correct||previous?.solved===true,date:new Date().toLocaleDateString('pt-BR')};const saved=lab.saveProgress(progress);refresh();status((correct?'Resposta correta. '+c.explain:'Ainda não. Revise a resposta ou consulte a dica.')+(saved?'':' O navegador bloqueou o armazenamento; progresso mantido apenas nesta sessão.'),correct?'success':'error');});
    }
    function options(){select.replaceChildren();lab.challenges.filter(c=>filter.value==='Todas'||c.level===filter.value).forEach(c=>{const option=el('option',c.area+' · '+c.level+' · '+c.id);option.value=c.id;select.append(option);});render();}
    filter.addEventListener('change',options);select.addEventListener('change',render);
    parent.append(button('Apagar meu progresso',()=>lab.confirm(parent,'Apagar as tentativas e os pontos salvos neste navegador?',()=>{progress={};const saved=lab.saveProgress(progress);refresh();render();if(!saved)content.append(el('p','Não foi possível apagar o armazenamento do navegador.'));})));
    options();refresh();
  };
})(window.StackLab);
