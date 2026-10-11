/** Orientação inicial e pedido revisável pelo WhatsApp; nenhum envio automático. */
(function (lab) {
  lab.mountSupport = function (parent) {
    const {element: el, button, field} = lab;
    parent.append(el('p', 'Encontre orientações iniciais para problemas comuns ou prepare um pedido de ajuda. As causas abaixo são possibilidades, não um diagnóstico definitivo.'));
    const layout = el('div', undefined, 'support-layout');
    const library = el('section', undefined, 'support-library');
    const formSection = el('section', undefined, 'support-request');
    library.setAttribute('aria-label', 'Biblioteca de problemas');
    formSection.setAttribute('aria-label', 'Solicitar suporte');
    library.append(el('h4', 'O que está acontecendo?'));
    const category = el('select');
    category.id = 'support-library-category';
    lab.supportProblems.forEach(problem => {const option = el('option', problem.name); option.value = problem.id; category.append(option);});
    field(library, 'Selecione um problema', category);
    const problemContent = el('div');
    library.append(problemContent);
    const useProblem = button('Pedir ajuda para este problema ↓', () => {
      issue.value = category.value;
      invalidate();
      formSection.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
      issue.focus();
    });
    library.append(useProblem);
    function renderProblem() {
      const problem = lab.supportProblems.find(problem => problem.id === category.value);
      problemContent.replaceChildren(el('h4', 'Sintomas comuns'), el('p', problem.symptoms), el('h4', 'Possíveis causas'));
      const causes = el('ul');
      problem.causes.forEach(cause => causes.append(el('li', cause)));
      const steps = el('ol');
      problem.steps.forEach(step => steps.append(el('li', step)));
      problemContent.append(causes, el('h4', 'O que você pode verificar primeiro'), steps, el('p', problem.help, 'lab-status'));
      if (problem.source) {
        const source = el('a', 'Consultar orientação oficial da Microsoft ↗', 'lab-link');
        source.href = problem.source; source.target = '_blank'; source.rel = 'noopener noreferrer';
        problemContent.append(source);
      }
    }
    category.addEventListener('change', renderProblem);
    renderProblem();

    formSection.append(el('h4', 'Não conseguiu resolver? Fale com um técnico!'));
    formSection.append(el('p', 'Preencha o relato, revise a mensagem e abra o WhatsApp de Miguel: +55 (24) 99976-5334. O envio será feito por você na conversa.'));
    const form = el('form');
    form.id = 'support-form';
    form.autocomplete = 'off';
    function selectField(title, entries, id) {
      const select = el('select'); select.id = id; select.name = id; select.required = true;
      const placeholder = el('option', 'Selecione…'); placeholder.value = ''; select.append(placeholder);
      entries.forEach(([value, name]) => {const option = el('option', name); option.value = value; select.append(option);});
      field(form, title + ' *', select);
      return select;
    }
    const issue = selectField('Problema apresentado', lab.supportProblems.map(problem => [problem.id,problem.name]), 'support-problem');
    const level = selectField('Nível de dificuldade', Object.entries(lab.supportLevels), 'support-level');
    const duration = selectField('Há quanto tempo o problema acontece?', Object.entries(lab.supportDurations), 'support-duration');
    const otherPeriod = el('input'); otherPeriod.id = 'support-other-period'; otherPeriod.maxLength = 100;
    field(form, 'Informe o período *', otherPeriod); otherPeriod.parentElement.hidden = true;
    const description = el('textarea'); description.id = 'support-description'; description.rows = 5; description.required = true; description.maxLength = 1500;
    field(form, 'Descrição do problema *', description);
    const device = selectField('Equipamento', Object.entries(lab.supportDevices), 'support-device');
    const otherDevice = el('input'); otherDevice.id = 'support-other-device'; otherDevice.maxLength = 100;
    field(form, 'Qual dispositivo? *', otherDevice); otherDevice.parentElement.hidden = true;
    const tried = el('textarea'); tried.id = 'support-tried'; tried.rows = 3; tried.maxLength = 800;
    field(form, 'O que já tentou fazer? (opcional)', tried);
    form.append(el('p', '* Campos obrigatórios. Não inclua senhas, códigos de acesso ou dados pessoais desnecessários. Este formulário não salva seu relato no navegador.', 'lab-note'));
    const prepare = el('button', 'Revisar mensagem', 'lab-button'); prepare.type = 'submit'; form.append(prepare);
    formSection.append(form);
    const status = lab.status(formSection);
    const review = el('div', undefined, 'support-review'); review.hidden = true;
    const preview = el('pre', '', 'lab-response'); preview.tabIndex = 0; preview.setAttribute('aria-label', 'Mensagem que será aberta no WhatsApp');
    const whatsapp = el('a', 'Solicitar ajuda pelo WhatsApp ↗', 'lab-button support-whatsapp');
    whatsapp.id = 'support-whatsapp'; whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer';
    review.append(el('h4', 'Confira sua mensagem'), preview, whatsapp, button('Copiar mensagem', async () => {
      try {await lab.copy(preview.textContent); status('Mensagem copiada. Você pode colá-la na conversa.', 'success');}
      catch (error) {status(error.message, 'error');}
    }));
    formSection.append(review);
    function invalidate() {review.hidden = true; whatsapp.removeAttribute('href');}
    function toggleOther(select, input) {
      const show = select.value === 'other'; input.parentElement.hidden = !show; input.required = show;
      if (!show) input.value = '';
      invalidate();
    }
    duration.addEventListener('change', () => toggleOther(duration, otherPeriod));
    device.addEventListener('change', () => toggleOther(device, otherDevice));
    form.addEventListener('input', invalidate);
    form.addEventListener('change', invalidate);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      try {
        const message = lab.supportMessage({problem:issue.value,level:level.value,duration:duration.value,otherPeriod:otherPeriod.value,description:description.value,device:device.value,otherDevice:otherDevice.value,tried:tried.value});
        preview.textContent = message;
        whatsapp.href = 'https://wa.me/5524999765334?text=' + encodeURIComponent(message);
        review.hidden = false;
        status('Mensagem pronta para revisão. Nada foi enviado. Abra o WhatsApp quando estiver de acordo.', 'success');
        preview.focus();
      } catch (error) {invalidate(); status(error.message, 'error');}
    });
    layout.append(library, formSection); parent.append(layout);
    const practice = el('details'); practice.className = 'support-practice';
    practice.append(el('summary', 'Praticar diagnóstico: quatro cenários interativos'));
    const scenarios = el('div'); practice.append(scenarios); parent.append(practice);
    lab.mountSupportScenarios(scenarios);
  };
})(window.StackLab);
