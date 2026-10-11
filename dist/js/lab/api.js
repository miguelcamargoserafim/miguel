(function(lab){
  lab.mountAPI=function(parent){
    const {element:el,button,field}=lab;let request=lab.createAPI(),closed=false,busy=false;
    parent.append(el('p','API simulada, sem requisições de rede. GET lista ou consulta; POST cria; PUT substitui; DELETE remove. As alterações duram somente esta visita ao módulo.'));
    const form=el('form'),row=el('div',undefined,'lab-form-row'),method=el('select'),endpoint=el('input');['GET','POST','PUT','DELETE'].forEach(m=>method.append(el('option',m)));endpoint.value='/games';endpoint.required=true;endpoint.maxLength=80;
    field(row,'Método',method);field(row,'Endpoint local',endpoint);form.append(row);
    const json=el('textarea',undefined,'lab-code');json.rows=6;json.spellcheck=false;json.value=JSON.stringify({title:'Novo jogo demo',category:'Aventura',price:29.9},null,2);field(form,'Corpo JSON (POST e PUT)',json);
    const actions=el('div',undefined,'lab-actions');const send=el('button','Enviar','lab-button');send.type='submit';actions.append(send,button('Restaurar dados',()=>lab.confirm(parent,'Restaurar os dados fictícios desta sessão?',()=>{request=lab.createAPI();output.textContent='Dados restaurados. Envie GET /games para consultar.';status('Dados fictícios restaurados.','success');})));form.append(actions);parent.append(form);
    const status=lab.status(parent),output=el('pre','Envie uma requisição para ver a resposta.','lab-response');output.tabIndex=0;output.setAttribute('aria-label','Resposta JSON');parent.append(output);
    const routes=el('p','Rotas: /games e /games/1. POST usa /games; PUT e DELETE exigem um id.');parent.append(routes);
    function updateBody(){json.disabled=!['POST','PUT'].includes(method.value);}
    method.addEventListener('change',updateBody);updateBody();
    form.addEventListener('submit',event=>{event.preventDefault();if(busy)return;let body;const verb=method.value,path=endpoint.value;
      if(['POST','PUT'].includes(verb)){try{body=JSON.parse(json.value);}catch{status('JSON inválido. Confira aspas, vírgulas e chaves.','error');output.textContent=JSON.stringify({status:400,error:'Corpo JSON inválido'},null,2);return;}}
      async function execute(){busy=true;send.disabled=true;status('Enviando para a simulação…');try{await new Promise(resolve=>setTimeout(resolve,250));if(closed)return;const response=request(verb,path,body,true);output.textContent=JSON.stringify(response.data,null,2);status('HTTP '+response.status+(response.status<400?' — requisição concluída.':' — confira a resposta.'),response.status<400?'success':'error');}catch(error){if(!closed)status('Não foi possível simular: '+error.message,'error');}finally{busy=false;send.disabled=false;}}
      if(verb==='GET')execute();else lab.confirm(parent,verb+' '+path+': confirmar alteração apenas nos dados fictícios desta sessão?',execute);
    });
    return ()=>{closed=true;};
  };
})(window.StackLab);
