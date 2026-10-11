/** Execução isolada: JavaScript em Worker dentro de iframe opaco; HTML/CSS em prévia com CSP. */
(function (lab) {
  lab.friendlyGameError = function (message) {
    if (/loog/.test(message)) return 'Quase lá! O comando console.loog não existe. Confira a palavra log na linha marcada.';
    if (/SyntaxError|Unexpected|Invalid|expected/i.test(message)) return 'Há um pequeno erro de escrita. Confira aspas, parênteses e os símbolos da linha que você alterou.';
    if (/not defined/i.test(message)) return 'Um nome não foi reconhecido. Confira se você manteve os nomes das variáveis do exemplo.';
    if (/tempo|timeout/i.test(message)) return 'A execução demorou demais e foi interrompida. Restaure o exemplo e faça uma alteração pequena.';
    return 'Não foi possível executar esta versão. Revise a alteração ou use Restaurar código original. Detalhe: ' + String(message).slice(0,180);
  };

  lab.runGame = function (game, code, host) {
    let frame, timer, finished = false, settle;
    const token = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
    const promise = new Promise(resolve => { settle = resolve; });
    function finish(result) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      if (code.js !== undefined) frame?.remove();
      settle(result);
    }
    function receive(event) {
      if (event.source !== frame?.contentWindow || event.data?.gameRun !== token) return;
      const message = event.data;
      if (message.error) finish({error: String(message.error).slice(0,500)});
      else if (message.facts && typeof message.facts === 'object' && Array.isArray(message.logs)) {
        finish({facts: message.facts, logs: message.logs.slice(0,30).map(value => String(value).slice(0,500))});
      }
    }
    window.addEventListener('message', receive);
    frame = document.createElement('iframe');
    frame.title = 'Resultado isolado do minijogo';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    timer = setTimeout(() => { frame.remove(); finish({error: 'Tempo de execução excedido.'}); }, 2200);
    if (code.js !== undefined) {
      frame.hidden = true;
      // O Worker permite interromper laços sem bloquear a interface do portfólio.
      const workerSource = 'self.onmessage = event => { const logs = []; const output = (...args) => { if (logs.length < 30) logs.push(args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" ").slice(0,500)); }; try { const execute = new Function("console", event.data.code + "\\n;return " + event.data.capture + ";"); const facts = execute({log:output,warn:output,error:output}); self.postMessage({facts,logs}); } catch(error) { self.postMessage({error:error.name + ": " + error.message}); } };';
      const bootstrap = 'const worker = new Worker(URL.createObjectURL(new Blob([' + JSON.stringify(workerSource) + '],{type:"text/javascript"})));worker.onmessage = event => { parent.postMessage({...event.data,gameRun:' + JSON.stringify(token) + '},"*");worker.terminate(); };worker.onerror = event => parent.postMessage({gameRun:' + JSON.stringify(token) + ',error:event.message},"*");worker.postMessage(' + JSON.stringify({code:code.js, capture:game.capture}) + ');';
      const escaped = bootstrap.replace(/<\/script/gi, '<\\/script');
      frame.srcdoc = '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' \'unsafe-eval\'; worker-src blob:; connect-src \'none\'; base-uri \'none\'; form-action \'none\'"><script>' + escaped + '<\/script>';
    } else {
      const capture = game.id === 'style-button'
        ? 'const b=document.querySelector("button"); const s=b?getComputedStyle(b):null; const facts={text:b?.textContent.trim(),background:s?.backgroundColor,padding:s?.padding,radius:s?.borderRadius};'
        : 'const b=document.querySelector("button"); const s=getComputedStyle(document.body); const facts={title:document.querySelector("h1")?.textContent.trim(),paragraph:document.querySelector("p")?.textContent.trim(),background:s.backgroundColor,font:s.fontSize,radius:b?getComputedStyle(b).borderRadius:""};';
      const verify = capture + 'parent.postMessage({gameRun:' + JSON.stringify(token) + ',facts,logs:[]},"*");';
      frame.srcdoc = lab.previewDocument({html:code.html, css:code.css, js:verify}, token);
    }
    host.replaceChildren(frame);
    return {promise, cancel: () => { frame.remove(); finish({cancelled:true}); }};
  };
})(window.StackLab);
