/** Experiência guiada. Os seis desafios clássicos continuam disponíveis. */
(function (lab) {
  const STORAGE_KEY = 'stack-lab-games-v1';
  lab.mountGuidedGames = function (parent) {
    const {element: el, button, field} = lab;
    let progress = {};
    try {progress = lab.cleanGameProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));} catch {}
    let current = 0, run, generation = 0, target = 'multiply';
    const score = el('p', '', 'lab-score');
    const select = el('select');
    select.id = 'game-select';
    field(parent, 'Escolha um minijogo', select);
    parent.prepend(score);
    const content = el('div');
    parent.append(content);
    const history = el('details');
    history.append(el('summary', 'Atividades concluídas e tentativas'));
    const historyBody = el('div');
    history.append(historyBody);
    parent.append(history);

    function refreshProgress() {
      const max = lab.games.reduce((sum, game) => sum + game.points, 0);
      const solved = lab.games.filter(game => progress[game.id]?.solved).length;
      score.textContent = lab.gameScore(progress) + ' / ' + max + ' pontos · ' + solved + ' / ' + lab.games.length + ' concluídos';
      select.replaceChildren();
      lab.games.forEach((game, index) => {
        const option = el('option', (progress[game.id]?.solved ? '✓ ' : '') + game.name + ' · ' + game.level);
        option.value = index;
        select.append(option);
      });
      select.value = current;
      historyBody.replaceChildren(lab.table(lab.games.map(game => ({atividade:game.name,estado:progress[game.id]?.solved ? 'Concluído ✓' : 'Para explorar',tentativas:progress[game.id]?.attempts || 0})), 'Seu progresso nos minijogos'));
    }

    function record(game, solved) {
      const previous = progress[game.id];
      progress[game.id] = {
        attempts: Math.min((previous?.attempts || 0) + 1, 99999),
        solved: solved || previous?.solved === true,
        date: new Date().toLocaleDateString('pt-BR')
      };
      refreshProgress();
      try {localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true;} catch {return false;}
    }

    function render() {
      generation++;
      run?.cancel();
      run = undefined;
      const game = lab.games[current];
      target = 'multiply';
      content.replaceChildren();
      const tutorial = el('div', undefined, 'game-tutorial');
      const tutorialTitle = el('h4', game.name);
      tutorialTitle.tabIndex = -1;
      tutorial.append(el('p', game.level + ' · ' + game.language, 'lab-kicker'), tutorialTitle);
      tutorial.append(el('h4', 'Objetivo'), el('p', game.goal));
      const steps = el('ol');
      game.steps.forEach(step => steps.append(el('li', step)));
      tutorial.append(el('h4', 'Como jogar'), steps, el('h4', 'O que modificar'), el('p', game.edit), el('h4', 'Resultado esperado'), el('p', game.expected));
      const example = el('details');
      example.append(el('summary', 'Seu código inicial já está pronto'), el('pre', Object.entries(game.code).map(([lang, code]) => lang.toUpperCase() + '\n' + code).join('\n\n'), 'lab-code-block'));
      tutorial.append(example);
      const panels = el('div', undefined, 'game-panels');
      panels.hidden = true;
      const instructions = el('aside', undefined, 'game-instructions');
      instructions.append(el('p', game.level, 'lab-kicker'), el('h4', game.name));
      const goal = el('p', game.goal);
      instructions.append(el('h4', 'Seu objetivo'), goal);
      const instructionSteps = steps.cloneNode(true);
      instructions.append(instructionSteps, el('p', game.edit, 'lab-note'));
      if (game.id === 'change-operator') {
        const objective = el('select');
        objective.id = 'game-objective';
        [['multiply','Multiplicar: resultado 50'],['subtract','Subtrair: resultado 5']].forEach(([value, text]) => {const option = el('option', text); option.value = value; objective.append(option);});
        field(instructions, 'Objetivo da conta', objective);
        objective.addEventListener('change', () => {target = objective.value; goal.textContent = target === 'subtract' ? 'Troque + por - para obter 5.' : game.goal;});
      }
      const hint = el('p', 'Precisa de ajuda? Peça uma dica.', 'lab-status');
      hint.setAttribute('role', 'status');
      let hintIndex = 0;
      instructions.append(button('Dica', () => {hint.textContent = 'Dica ' + (Math.min(hintIndex, game.hints.length - 1) + 1) + ': ' + game.hints[Math.min(hintIndex++, game.hints.length - 1)];}), hint);
      const solution = el('details');
      solution.hidden = true;
      solution.append(el('summary', 'Uma possível solução'), el('p', game.explanation));
      const solutionCode = el('pre', '', 'lab-code-block');
      solution.append(solutionCode);
      instructions.append(button('Ver solução', () => {
        solution.hidden = false;
        solution.open = true;
        const solvedCode = getSolution();
        solutionCode.textContent = Object.entries(solvedCode).map(([lang, code]) => lang.toUpperCase() + '\n' + code).join('\n\n');
      }), solution);

      const editorPanel = el('div', undefined, 'game-editor-area');
      editorPanel.append(el('h4', 'Seu código'));
      const editor = lab.createGameEditor(editorPanel, game.code);
      solution.append(button('Aplicar solução no editor', () => {editor.setCode(getSolution()); status('Solução aplicada. Clique em Executar código para testar.'); editor.focus();}));
      function getSolution() {
        const code = {...game.solution};
        if (game.id === 'change-operator' && target === 'subtract') code.js = code.js.replace('numero1 * numero2', 'numero1 - numero2').replace('* faz a multiplicação.', '- faz a subtração.');
        return code;
      }
      const actions = el('div', undefined, 'lab-actions');
      const resultPanel = el('div', undefined, 'game-result-area');
      resultPanel.append(el('h4', 'Resultado'));
      const preview = el('div', undefined, 'game-preview');
      const consoleOutput = el('pre', 'O resultado aparecerá aqui.', 'lab-response');
      consoleOutput.tabIndex = 0;
      consoleOutput.setAttribute('aria-label', 'Mensagens do código');
      if (game.code.js !== undefined) resultPanel.append(consoleOutput);
      resultPanel.append(preview);
      const status = lab.status(resultPanel);
      const executeButton = button('Executar código', () => execute(true));
      executeButton.classList.add('game-primary');
      executeButton.id = 'game-run';
      const restore = button('Restaurar código original', () => {editor.setCode(game.code); execute(false);});
      restore.id = 'game-restore';
      actions.append(executeButton, restore);
      editorPanel.append(actions);
      resultPanel.append(button('Próximo desafio →', () => {current = (current + 1) % lab.games.length; select.value = current; render(); content.querySelector('h4').focus();}));
      instructions.append(button('Voltar ao laboratório', () => document.querySelector('#lab-close').click()));
      panels.append(instructions, editorPanel, resultPanel);
      const start = button('Começar desafio', () => {tutorial.hidden = true; panels.hidden = false; editor.focus(); execute(false);});
      start.classList.add('game-start', 'game-primary');
      tutorial.append(start);
      content.append(tutorial, panels);

      async function execute(countAttempt) {
        const version = ++generation;
        run?.cancel();
        const code = editor.getCode();
        const selectedTarget = target;
        executeButton.disabled = true;
        status('Executando seu código com segurança…');
        run = lab.runGame(game, code, preview);
        try {
          const result = await run.promise;
          if (version !== generation || result.cancelled) return;
          if (result.error) {
            if (countAttempt) record(game, false);
            consoleOutput.textContent = 'Nenhuma saída: confira a orientação abaixo.';
            status(lab.friendlyGameError(result.error), 'error');
            return;
          }
          consoleOutput.textContent = result.logs.join('\n') || 'Código executado sem mensagens.';
          const correct = lab.checkGame(game, result, code, selectedTarget);
          const saved = !countAttempt || record(game, correct);
          if (correct && countAttempt) status('Parabéns! Você concluiu ' + game.name + '! ' + game.explanation + (saved ? '' : ' O navegador bloqueou o salvamento; progresso mantido nesta sessão.'), 'success');
          else if (correct) status('Esse código alcança o objetivo. Clique em Executar código para registrar sua conclusão.');
          else status((countAttempt ? 'Seu código executou! Ainda falta alcançar o objetivo. Confira as linhas marcadas ou peça uma dica.' : 'Código inicial pronto. Faça uma pequena alteração e execute para conferir.') + (saved ? '' : ' O progresso não pôde ser salvo.'), 'info');
        } catch (error) {
          if (version === generation) status(lab.friendlyGameError(error.message), 'error');
        } finally {
          if (version === generation) executeButton.disabled = false;
        }
      }
    }
    select.addEventListener('change', () => {current = Number(select.value); render();});
    parent.append(button('Reiniciar progresso dos minijogos', () => lab.confirm(parent, 'Apagar apenas o progresso dos minijogos guiados deste navegador?', () => {
      progress = {};
      let saved = true;
      try {localStorage.removeItem(STORAGE_KEY);} catch {saved = false;}
      refreshProgress();
      if (!saved) score.textContent += ' · Não foi possível limpar o armazenamento.';
    })));
    refreshProgress();
    render();
    return () => {generation++; run?.cancel();};
  };

  lab.mountChallenges = function (parent) {
    const {element: el, button} = lab;
    parent.append(el('p', 'Nunca programou? Comece pela prática guiada: o código já vem pronto e você altera uma pequena parte. Os seis desafios anteriores continuam em Desafios clássicos.'));
    const modes = el('div', undefined, 'lab-tabs');
    modes.setAttribute('aria-label', 'Modo dos desafios');
    const body = el('div');
    let cleanup;
    const guided = button('Prática guiada · 5 minijogos', () => show(true));
    const classic = button('Desafios clássicos · 6 atividades', () => show(false));
    modes.append(guided, classic);
    parent.append(modes, body);
    function show(isGuided) {
      cleanup?.();
      body.replaceChildren();
      guided.setAttribute('aria-pressed', String(isGuided));
      classic.setAttribute('aria-pressed', String(!isGuided));
      cleanup = isGuided ? lab.mountGuidedGames(body) : lab.mountClassicChallenges(body);
    }
    show(true);
    return () => cleanup?.();
  };
})(window.StackLab);
