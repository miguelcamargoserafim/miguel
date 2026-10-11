const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
context.window = context;
for (const name of ['data', 'engines', 'games-data', 'support-data']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js/lab', name + '.js'), 'utf8'), context);
}
const lab = context.StackLab;
const plain = value => JSON.parse(JSON.stringify(value));

test('SQL: filtros, joins e totais reais das relações fictícias', () => {
  assert.deepEqual(plain(lab.executeSQL(lab.queries[1].sql).rows).map(r => r.price), [19.9, 24.9]);
  assert.deepEqual(plain(lab.executeSQL(lab.queries[2].sql).rows).map(r => r.name), ['Ana Demo', 'Bruno Demo', 'Ana Demo']);
  assert.deepEqual(plain(lab.executeSQL(lab.queries[4].sql).rows), [{id:101,total:79.7},{id:102,total:24.9},{id:103,total:49.9}]);
  assert.equal(lab.executeSQL('  SELECT   * FROM games; ').rows.length, 4);
  assert.throws(() => lab.executeSQL('DROP TABLE users;'), /não suportada/);
  assert.throws(() => lab.executeSQL('SELECT * FROM games; DELETE FROM games;'), /não suportada/);
});

test('API: CRUD confirmado, schemas, rotas e isolamento por sessão', () => {
  const request = lab.createAPI();
  const body = {title:'Teste',category:'Demo',price:12.345,secret:'discard'};
  assert.equal(request('POST','/games',body).status,409);
  assert.equal(request('GET','/games').data.length,4);
  const created = request('POST','/games',body,true);
  assert.equal(created.status,201);
  assert.equal(created.data.price,12.35);
  assert.equal(created.data.secret,undefined);
  assert.equal(request('PUT','/games/'+created.data.id,{...body,title:'Alterado'},true).status,200);
  assert.equal(request('GET','/games/'+created.data.id).data.title,'Alterado');
  assert.equal(request('DELETE','/games/'+created.data.id,null,true).status,200);
  assert.equal(request('GET','/games/'+created.data.id).status,404);
  assert.equal(request('POST','/games',{...body,price:-1},true).status,422);
  assert.equal(request('PUT','/games',body,true).status,405);
  assert.equal(request('GET','https://example.com').status,404);
  assert.equal(request('GET','/games/999').status,404);
  assert.equal(lab.createAPI()('GET','/games').data.length,4);
  const snapshot=request('GET','/games').data;snapshot[0].title='Mutation';
  assert.equal(request('GET','/games/1').data.title,'Orbit Runner');
});

test('Desafios: respostas, pontuação única e progresso inválido', () => {
  assert.equal(lab.grade('js-equality',' FALSE '),true);
  assert.equal(lab.grade('js-map','[2, 4, 6]'),true);
  assert.equal(lab.grade('js-map','[1,2,3]'),false);
  assert.equal(lab.grade('unknown','false'),false);
  const progress=lab.cleanProgress({'js-map':{solved:true,attempts:3,date:'11/10/2026'},fake:{solved:true,attempts:1},'js-equality':{solved:true,attempts:-1}});
  assert.equal(lab.score(progress),20);
  progress['js-map'].attempts++;
  assert.equal(lab.score(progress),20);
  assert.equal(Object.keys(lab.cleanProgress(null)).length,0);
});

test('Terminal: comandos documentados e entrada tratada como texto', () => {
  assert.match(lab.terminalReply(' PROJECTS '), /em desenvolvimento/);
  assert.match(lab.terminalReply('contact'), /99976-5334/);
  assert.match(lab.terminalReply('rm -rf /'), /não encontrado/);
  assert.match(lab.terminalReply('stack'), /sem shell/);
});

test('Todos os cards têm módulos e recursos locais disponíveis', () => {
  assert.equal(lab.modules.length,6);
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const [,file] of [...index.matchAll(/(?:src|href)="([^"#]+)"/g)]) {
    if (/^(https?:|mailto:|tel:)/.test(file)) continue;
    assert.ok(fs.existsSync(path.join(root,file.split('#')[0])),file);
  }
  for(const [id] of lab.modules) assert.ok(fs.existsSync(path.join(root,'js/lab',id==='code'?'playground.js':id+'.js')));
});

test('Segurança: iframe opaco, CSP e ausência de fetch/eval nas simulações', () => {
  const source=fs.readFileSync(path.join(root,'js/lab/playground.js'),'utf8');
  assert.match(source,/setAttribute\('sandbox','allow-scripts'\)/);
  assert.doesNotMatch(source,/setAttribute\('sandbox',.*allow-same-origin/);
  assert.match(source,/connect-src/);
  assert.match(source,/event.source!==frame\?\.contentWindow/);
  for(const file of fs.readdirSync(path.join(root,'js/lab'))) {
    const code=fs.readFileSync(path.join(root,'js/lab',file),'utf8');
    if (file === 'game-runner.js') {
      assert.match(code,/new Worker/);
      assert.match(code,/2200/);
      assert.match(code,/connect-src/);
      assert.match(code,/frame.remove/);
    } else assert.doesNotMatch(code,/\b(?:eval|fetch)\s*\(|new Function\s*\(/,file);
  }
});


test('Minijogos: código preenchido e validação específica sem falsos acertos', () => {
  assert.equal(lab.games.length,5);
  for(const game of lab.games) {
    assert.ok(game.steps.length <= 3);
    for(const code of Object.values(game.code)) assert.ok(code.trim().length > 0);
    assert.ok(Object.values(game.code).some(code => code.includes('ALTERE AQUI')));
  }
  const guess=lab.games[0];
  assert.equal(lab.checkGame(guess,{facts:{tentativa:5,numeroSecreto:5},logs:['Parabéns! Você acertou!']},guess.code),false);
  assert.equal(lab.checkGame(guess,{facts:{tentativa:7,numeroSecreto:7},logs:['Parabéns! Você acertou!']},guess.solution),true);
  const operator=lab.games[2];
  assert.equal(lab.checkGame(operator,{facts:{numero1:10,numero2:5,resultado:50},logs:['50']},operator.code),false);
  assert.equal(lab.checkGame(operator,{facts:{numero1:10,numero2:5,resultado:50},logs:['50']},operator.solution),true);
  assert.equal(lab.checkGame(lab.games[1],{facts:{text:'Meu botão',background:'rgb(139, 92, 246)',padding:'20px 32px',radius:'24px'}},{}),true);
  const progress=lab.cleanGameProgress({'guess-number':{solved:true,attempts:2},fake:{solved:true,attempts:1},'style-page':{solved:true,attempts:-1}});
  assert.equal(lab.gameScore(progress),10);
  progress['guess-number'].attempts++;
  assert.equal(lab.gameScore(progress),10);
});

test('Suporte: categorias completas, mensagem fiel e campos obrigatórios', () => {
  assert.equal(lab.supportProblems.length,12);
  const fields={problem:'internet',level:'severe',duration:'other',otherPeriod:'Desde ontem',device:'notebook',description:'Wi-Fi conecta, mas os sites não abrem.',tried:'Testei outro aparelho.'};
  const message=lab.supportMessage(fields);
  assert.match(message,/Internet não funciona/);
  assert.match(message,/Grave/);
  assert.match(message,/Desde ontem/);
  assert.match(message,/Notebook/);
  assert.match(message,/Testei outro aparelho/);
  assert.throws(()=>lab.supportMessage({...fields,description:'  '}),/Preencha/);
  assert.throws(()=>lab.supportMessage({...fields,otherPeriod:''}),/Preencha/);
  assert.throws(()=>lab.supportMessage({...fields,level:'constructor'}),/Selecione/);
});
