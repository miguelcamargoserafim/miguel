/* Funções independentes da interface, também usadas pelos testes. */
(function (lab) {
  const normalizeSQL = value => value.trim().replace(/;$/, '').replace(/\s+/g, ' ').toLowerCase();
  lab.executeSQL = function (sql) {
    const query = lab.queries.find(q => normalizeSQL(q.sql) === normalizeSQL(sql));
    if (!query) throw new Error('Consulta não suportada. Selecione um dos exemplos disponíveis; SQL arbitrário não é executado.');
    return {rows:query.run(lab.seed), explanation:query.explanation};
  };
  lab.createAPI = function () {
    let games = lab.seed.games.map(g => ({...g}));
    let nextID = 5;
    return function request(method, endpoint, body, confirmed = false) {
      const match = /^\/games(?:\/(\d+))?\/?$/.exec(endpoint.trim());
      const response = (status, data) => ({status, data});
      if (!match) return response(404,{error:'Endpoint inexistente. Use /games ou /games/1.'});
      if (!['GET','POST','PUT','DELETE'].includes(method)) return response(405,{error:'Método não permitido.'});
      const id = match[1] ? Number(match[1]) : null;
      const index = games.findIndex(g=>g.id===id);
      if (method === 'GET') return id === null ? response(200,games.map(g=>({...g}))) : index<0 ? response(404,{error:'Jogo não encontrado.'}) : response(200,{...games[index]});
      if (!confirmed) return response(409,{error:'Confirme a alteração dos dados desta sessão.'});
      if (method === 'POST' && id !== null || ['PUT','DELETE'].includes(method) && id === null) return response(405,{error:'POST usa /games; PUT e DELETE usam /games/:id.'});
      if (method !== 'POST' && index < 0) return response(404,{error:'Jogo não encontrado.'});
      if (method === 'DELETE') { games.splice(index,1); return response(200,{message:'Jogo removido apenas desta sessão.',id}); }
      if (!body || typeof body.title !== 'string' || !body.title.trim() || body.title.length>80 || typeof body.category !== 'string' || !body.category.trim() || body.category.length>40 || typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price<0 || body.price>10000) return response(422,{error:'Informe title (1–80 caracteres), category (1–40) e price numérico entre 0 e 10000.'});
      const game = {id:method==='POST'?nextID++:id,title:body.title.trim(),category:body.category.trim(),price:Math.round(body.price*100)/100};
      if (method === 'POST') games.push(game); else games[index] = game;
      return response(method==='POST'?201:200,{...game});
    };
  };
  lab.grade = function (id, answer) {
    const challenge = lab.challenges.find(c=>c.id===id);
    if (!challenge) return false;
    const normalize = value => value.trim().toLowerCase().replace(/\s+/g,'');
    return challenge.answers.some(a=>normalize(a)===normalize(answer));
  };
  lab.cleanProgress = function (input) {
    const result = {};
    if (!input || typeof input !== 'object') return result;
    for (const c of lab.challenges) {
      const p=input[c.id];
      if (p && typeof p === 'object' && Number.isInteger(p.attempts) && p.attempts>0 && p.attempts<100000) result[c.id]={attempts:p.attempts,solved:p.solved===true,date:typeof p.date==='string'?p.date.slice(0,30):''};
    }
    return result;
  };
  lab.score = progress => lab.challenges.reduce((sum,c)=>sum+(progress[c.id]?.solved?c.points:0),0);
  lab.terminalReply = function (command) {
    const responses = {
      help:'Comandos: help, about, skills, projects, contact, clear, stack. Use ↑ e ↓ para o histórico.',
      about:'Miguel Camargo Serafim. Desenvolvo meus projetos web e compartilho o processo em lives de programação.',
      skills:'Habilidades cadastradas: HTML, CSS, JavaScript, TypeScript, Cobalt e AI Specialist. A implementação deste portfólio usa HTML, CSS e JavaScript puro.',
      stack:'Portfólio e Stack Lab: HTML + CSS + JavaScript puro. Demonstrações locais; sem shell ou banco de produção.',
      projects:'Signal Solution — website em desenvolvimento. Daí Lanches — website em desenvolvimento. Leads Signal Solution — aplicativo interno em desenvolvimento. DreamStation: documentação pendente.',
      contact:'WhatsApp: +55 (24) 99976-5334\nLinkedIn: linkedin.com/in/miguel-camargo-serafim-10173b38b/\nTwitch: twitch.tv/lazzines_\nInstagram: instagram.com/serafymx_/'
    };
    return responses[command.trim().toLowerCase()] || 'Comando não encontrado. Digite help para ver os comandos disponíveis.';
  };
})(window.StackLab);
