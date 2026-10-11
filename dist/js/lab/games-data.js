/** Atividades guiadas: textos, códigos iniciais e soluções editáveis. */
(function (lab) {
  lab.games = [
    {
      id: 'guess-number', name: 'Descubra o número', level: 'Iniciante', points: 10,
      language: 'JavaScript', goal: 'Faça a tentativa acertar o número secreto: 7.',
      steps: ['Encontre a linha let tentativa = 5.', 'Troque somente o 5 pelo número 7.', 'Clique em Executar código e veja a mensagem.'],
      edit: 'Altere apenas o valor de tentativa. Uma variável é um nome que guarda um valor.',
      expected: 'A mensagem “Parabéns! Você acertou!” aparecerá.',
      hints: ['A linha marcada ALTERE AQUI guarda seu palpite.', 'O símbolo === pergunta se os dois valores são iguais.', 'Troque let tentativa = 5; por let tentativa = 7;'],
      code: {js: '// ALTERE AQUI: mude o 5 para tentar acertar!\nlet tentativa = 5;\n\n// Mantenha o número secreto como está.\nlet numeroSecreto = 7;\n\nif (tentativa === numeroSecreto) {\n  console.log("Parabéns! Você acertou!");\n} else {\n  console.log("Tente novamente!");\n}'},
      solution: {js: '// ALTERE AQUI: o palpite agora é igual ao segredo.\nlet tentativa = 7;\n\n// Mantenha o número secreto como está.\nlet numeroSecreto = 7;\n\nif (tentativa === numeroSecreto) {\n  console.log("Parabéns! Você acertou!");\n} else {\n  console.log("Tente novamente!");\n}'},
      explanation: 'tentativa e numeroSecreto guardam 7. A comparação === é verdadeira, então a primeira mensagem é exibida.',
      capture: '{tentativa, numeroSecreto}'
    },
    {
      id: 'style-button', name: 'Personalize um botão', level: 'Iniciante', points: 10,
      language: 'HTML + CSS', goal: 'Crie um botão roxo, maior, arredondado e com o texto “Meu botão”.',
      steps: ['Na aba HTML, troque Clique aqui por Meu botão.', 'Na aba CSS, use #8b5cf6, 20px 32px e 24px nas linhas marcadas.', 'Execute e compare o botão com o objetivo.'],
      edit: 'background é a cor; padding é o espaço interno; border-radius arredonda os cantos.',
      expected: 'Um botão roxo com mais espaço, cantos arredondados e seu novo texto.',
      hints: ['HTML muda o texto; CSS muda a aparência.', 'Use background: #8b5cf6; e padding: 20px 32px;.', 'Use border-radius: 24px; e o texto Meu botão na aba HTML.'],
      code: {html:'<!-- ALTERE AQUI: texto entre as tags do botão. -->\n<button type="button">Clique aqui</button>',css:'/* ALTERE AQUI: cor, espaço e cantos do botão. */\nbutton {\n  background: #0891b2;\n  padding: 12px 20px;\n  border-radius: 8px;\n  color: white;\n  border: 0;\n  font-size: 18px;\n}\n/* Base da prévia: pode manter. */\nbody { background: #091421; padding: 32px; font-family: system-ui; }'},
      solution: {html:'<!-- ALTERE AQUI: novo texto do botão. -->\n<button type="button">Meu botão</button>',css:'/* ALTERE AQUI: propriedades personalizadas. */\nbutton {\n  background: #8b5cf6;\n  padding: 20px 32px;\n  border-radius: 24px;\n  color: white;\n  border: 0;\n  font-size: 18px;\n}\nbody { background: #091421; padding: 32px; font-family: system-ui; }'},
      explanation: 'O HTML fornece o texto. As três propriedades CSS alteram a cor, o espaço interno e o arredondamento, sem precisar escrever uma página do zero.'
    },
    {
      id: 'change-operator', name: 'Complete a função', level: 'Fácil', points: 15,
      language: 'JavaScript', goal: 'Transforme a soma em uma multiplicação: o resultado deve ser 50.',
      steps: ['Encontre a linha let resultado = numero1 + numero2.', 'Troque + por * para multiplicar, ou escolha o objetivo de subtração.', 'Execute para conferir a conta.'],
      edit: 'Um operador indica a conta: + soma, - subtrai e * multiplica.',
      expected: 'Na multiplicação, 10 × 5 = 50. Na subtração, 10 − 5 = 5.',
      hints: ['Mantenha os números 10 e 5; altere somente o símbolo da conta.', 'O asterisco * significa multiplicar; o hífen - significa subtrair.', 'Use numero1 * numero2 para 50 ou numero1 - numero2 para 5.'],
      code: {js:'// Números da conta: mantenha estes valores.\nlet numero1 = 10;\nlet numero2 = 5;\n\n// ALTERE AQUI: troque o operador +.\nlet resultado = numero1 + numero2;\n\nconsole.log(resultado);'},
      solution: {js:'// Números da conta: mantenha estes valores.\nlet numero1 = 10;\nlet numero2 = 5;\n\n// ALTERE AQUI: * faz a multiplicação.\nlet resultado = numero1 * numero2;\n\nconsole.log(resultado);'},
      explanation: 'O operador * multiplica os valores guardados nas variáveis. Usando -, a mesma linha faz uma subtração.',
      capture: '{numero1, numero2, resultado}'
    },
    {
      id: 'fix-welcome', name: 'Corrija o código', level: 'Intermediário', points: 20,
      language: 'JavaScript', goal: 'Corrija o pequeno erro para mostrar a mensagem de boas-vindas.',
      steps: ['Execute para ler a mensagem amigável sobre o erro.', 'Confira a palavra depois de console. na linha marcada.', 'Corrija loog para log e execute novamente.'],
      edit: 'console.log mostra uma mensagem no resultado. A palavra log deve ter apenas um o.',
      expected: 'A mensagem “Bem-vindo ao Stack Lab!” aparecerá sem erros.',
      hints: ['O texto da mensagem está correto. Confira o nome do comando.', 'console.loog não existe. A ferramenta se chama console.log.', 'Remova um o: console.log(mensagem);'],
      code: {js:'// A mensagem de boas-vindas já está pronta.\nlet mensagem = "Bem-vindo ao Stack Lab!";\n\n// ALTERE AQUI: existe uma letra a mais no comando.\nconsole.loog(mensagem);'},
      solution: {js:'// A mensagem de boas-vindas já está pronta.\nlet mensagem = "Bem-vindo ao Stack Lab!";\n\n// ALTERE AQUI: log está escrito corretamente.\nconsole.log(mensagem);'},
      explanation: 'loog era um erro de digitação. console.log é o nome correto da ferramenta que mostra o valor de mensagem.',
      capture: '{mensagem}'
    },
    {
      id: 'style-page', name: 'Personalize uma página', level: 'Iniciante', points: 15,
      language: 'HTML + CSS', goal: 'Personalize título, parágrafo, fundo, tamanho do texto e cantos do botão.',
      steps: ['No HTML, use Minha primeira página e Estou aprendendo a programar.', 'No CSS, use fundo #172554, fonte 20px e cantos 16px nas linhas marcadas.', 'Execute para ver sua página pronta ao lado.'],
      edit: 'h1 é o título; p é um parágrafo; font-size define o tamanho do texto.',
      expected: 'Sua página terá o novo texto, fundo azul, letras maiores e botão arredondado.',
      hints: ['As duas abas têm linhas marcadas com ALTERE AQUI.', 'No HTML, mantenha as tags e troque só o texto dentro de h1 e p.', 'No CSS, use background: #172554; font-size: 20px; e border-radius: 16px;.'],
      code: {html:'<main>\n  <!-- ALTERE AQUI: título e parágrafo. -->\n  <h1>Olá, mundo!</h1>\n  <p>Este é meu primeiro teste.</p>\n  <button type="button">Continuar</button>\n</main>',css:'body {\n  /* ALTERE AQUI: cor do fundo e tamanho da fonte. */\n  background: #091421;\n  font-size: 16px;\n  color: white;\n  font-family: system-ui;\n  padding: 28px;\n}\nbutton {\n  /* ALTERE AQUI: arredondamento do botão. */\n  border-radius: 4px;\n  padding: 12px 20px;\n  background: #67e8f9;\n  color: #091421;\n  border: 0;\n}'},
      solution: {html:'<main>\n  <!-- ALTERE AQUI: textos personalizados. -->\n  <h1>Minha primeira página</h1>\n  <p>Estou aprendendo a programar.</p>\n  <button type="button">Continuar</button>\n</main>',css:'body {\n  /* ALTERE AQUI: novo fundo e tamanho. */\n  background: #172554;\n  font-size: 20px;\n  color: white;\n  font-family: system-ui;\n  padding: 28px;\n}\nbutton {\n  /* ALTERE AQUI: cantos arredondados. */\n  border-radius: 16px;\n  padding: 12px 20px;\n  background: #67e8f9;\n  color: #091421;\n  border: 0;\n}'},
      explanation: 'O conteúdo vem do HTML. No CSS, background muda o fundo, font-size aumenta as letras e border-radius suaviza os cantos do botão.'
    }
  ];

  // Validação educativa específica. Alterar apenas console.log não resolve a atividade.
  lab.checkGame = function (game, result, code, target = 'multiply') {
    const facts = result.facts || {};
    const logs = result.logs || [];
    if (game.id === 'guess-number') return facts.tentativa === 7 && facts.numeroSecreto === 7 && logs.includes('Parabéns! Você acertou!');
    if (game.id === 'change-operator') {
      const source = code.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      const operator = target === 'subtract' ? '-' : '*';
      const expected = target === 'subtract' ? 5 : 50;
      const expression = new RegExp('(?:let|const|var)\\s+resultado\\s*=\\s*numero1\\s*' + (operator === '*' ? '\\*' : '-') + '\\s*numero2\\s*;');
      return facts.numero1 === 10 && facts.numero2 === 5 && facts.resultado === expected && logs.includes(String(expected)) && expression.test(source);
    }
    if (game.id === 'fix-welcome') return facts.mensagem === 'Bem-vindo ao Stack Lab!' && logs.includes(facts.mensagem);
    if (game.id === 'style-button') return facts.text === 'Meu botão' && facts.background === 'rgb(139, 92, 246)' && facts.padding === '20px 32px' && facts.radius === '24px';
    if (game.id === 'style-page') return facts.title === 'Minha primeira página' && facts.paragraph === 'Estou aprendendo a programar.' && facts.background === 'rgb(23, 37, 84)' && facts.font === '20px' && facts.radius === '16px';
    return false;
  };

  lab.cleanGameProgress = function (raw) {
    const clean = {};
    if (!raw || typeof raw !== 'object') return clean;
    for (const game of lab.games) {
      const value = raw[game.id];
      if (value && typeof value === 'object' && Number.isInteger(value.attempts) && value.attempts >= 0 && value.attempts < 100000) {
        clean[game.id] = {solved: value.solved === true, attempts: value.attempts, date: typeof value.date === 'string' ? value.date.slice(0,30) : ''};
      }
    }
    return clean;
  };
  lab.gameScore = progress => lab.games.reduce((score, game) => score + (progress[game.id]?.solved ? game.points : 0), 0);
})(window.StackLab);
