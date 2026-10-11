(function(lab){
  lab.mountSQL=function(parent){
    const {element:el,button,field}=lab;
    parent.append(el('p','Dados fictícios de uma loja de jogos. Somente as consultas do catálogo são aceitas; nenhum banco externo é conectado.'));
    const schema=el('details');schema.append(el('summary','Explorar tabelas e relacionamentos'));
    schema.append(el('pre','users.id ← orders.user_id\norders.id ← items.order_id\ngames.id ← items.game_id','lab-code-block'));
    Object.entries(lab.seed).forEach(([name,rows])=>schema.append(lab.table(rows,name)));parent.append(schema);
    const select=el('select');lab.queries.forEach((q,i)=>{const option=el('option',q.title);option.value=i;select.append(option);});field(parent,'Consulta educativa',select);
    const editor=el('textarea',undefined,'lab-code');editor.rows=5;editor.spellcheck=false;editor.value=lab.queries[0].sql;field(parent,'SQL (somente exemplos suportados)',editor);
    select.addEventListener('change',()=>{editor.value=lab.queries[select.value].sql;});
    const result=el('div');const status=lab.status(parent);
    function execute(){try{const response=lab.executeSQL(editor.value);result.replaceChildren(lab.table(response.rows,'Resultado da consulta'),el('p',response.explanation));status(response.rows.length+' registros retornados.','success');}catch(error){result.replaceChildren();status(error.message,'error');}}
    parent.append(button('Executar consulta',execute),result);execute();
  };
})(window.StackLab);
