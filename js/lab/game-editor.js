/** Editor leve: textarea acessível sobre código colorido, sem dependências. */
(function (lab) {
  lab.createGameEditor = function (parent, initial) {
    const {element: el, button} = lab;
    let values = {...initial};
    let active = Object.keys(values)[0];
    const tabs = el('div', undefined, 'lab-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Linguagem do minijogo');
    const panel = el('div', undefined, 'game-editor-panel');
    panel.id = 'game-code-panel';
    panel.setAttribute('role', 'tabpanel');
    const help = el('p', 'Linhas com ● e ALTERE AQUI são as partes sugeridas para editar.', 'lab-note');
    help.id = 'game-code-help';
    const viewport = el('div', undefined, 'game-editor');
    const gutter = el('div', undefined, 'game-gutter');
    gutter.setAttribute('aria-hidden', 'true');
    const highlighted = el('pre', undefined, 'game-highlight');
    highlighted.setAttribute('aria-hidden', 'true');
    const input = el('textarea', undefined, 'game-code-input');
    input.id = 'game-code';
    input.spellcheck = false;
    input.wrap = 'off';
    input.autocapitalize = 'off';
    input.maxLength = 8000;
    input.setAttribute('aria-describedby', help.id);
    viewport.append(gutter, highlighted, input);
    panel.append(viewport);
    parent.append(tabs, help, panel);
    const tabButtons = [];

    function colorize(line, target) {
      if (/^\s*(?:\/\/|\/\*|\*|<!--)/.test(line)) {
        target.append(el('span', line || ' ', 'game-token-comment'));
        return;
      }
      const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(let|const|if|else|console|log|true|false)\b|\b(\d+(?:\.\d+)?)\b|(<\/?[a-z][^>]*>)/gi;
      let end = 0;
      for (const match of line.matchAll(tokens)) {
        target.append(document.createTextNode(line.slice(end, match.index)));
        const kind = match[1] ? 'string' : match[2] ? 'keyword' : match[3] ? 'number' : 'tag';
        target.append(el('span', match[0], 'game-token-' + kind));
        end = match.index + match[0].length;
      }
      target.append(document.createTextNode(line.slice(end) || (line.length ? '' : ' ')));
    }

    function paint() {
      highlighted.replaceChildren();
      gutter.replaceChildren();
      let markNext = 0;
      input.value.split('\n').forEach((line, index) => {
        if (line.includes('ALTERE AQUI')) markNext = 3;
        const editable = markNext > 0;
        const number = el('span', (editable ? '● ' : '') + (index + 1));
        if (editable) number.className = 'game-editable-number';
        gutter.append(number);
        const row = el('span', undefined, editable ? 'game-code-line is-editable' : 'game-code-line');
        colorize(line, row);
        highlighted.append(row);
        markNext = Math.max(0, markNext - 1);
      });
      sync();
    }
    function sync() {
      highlighted.style.transform = 'translate(' + (-input.scrollLeft) + 'px,' + (-input.scrollTop) + 'px)';
      gutter.style.transform = 'translateY(' + (-input.scrollTop) + 'px)';
    }
    function select(language, focus = false) {
      values[active] = input.value;
      active = language;
      input.value = values[active];
      input.setAttribute('aria-label', 'Código ' + active.toUpperCase() + ' do minijogo');
      panel.setAttribute('aria-labelledby', 'game-tab-' + active);
      for (const tab of tabButtons) {
        const chosen = tab.dataset.language === active;
        tab.setAttribute('aria-selected', String(chosen));
        tab.tabIndex = chosen ? 0 : -1;
        if (chosen && focus) tab.focus();
      }
      paint();
    }
    Object.keys(values).forEach((language, index, languages) => {
      const tab = button(language.toUpperCase(), () => select(language));
      tab.id = 'game-tab-' + language;
      tab.dataset.language = language;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % languages.length;
        if (event.key === 'ArrowLeft') next = (index + languages.length - 1) % languages.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = languages.length - 1;
        if (next !== undefined) {event.preventDefault(); select(languages[next], true);}
      });
      tabButtons.push(tab);
      tabs.append(tab);
    });
    input.value = values[active];
    input.addEventListener('input', paint);
    input.addEventListener('scroll', sync, {passive:true});
    select(active);
    return {
      getCode() { values[active] = input.value; return {...values}; },
      setCode(next) { values = {...next}; input.value = values[active] || ''; select(active); },
      focus() { input.focus(); }
    };
  };
})(window.StackLab);
