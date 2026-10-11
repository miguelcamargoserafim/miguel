/* Utilitários compartilhados. Conteúdo dinâmico é inserido como texto. */
(function (lab) {
  lab.element = function (tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  lab.button = function (text, action, className='lab-button') {
    const button=lab.element('button',text,className);
    button.type='button'; button.addEventListener('click',action); return button;
  };
  lab.field = function (parent, title, node) {
    const label=lab.element('label',undefined,'lab-field');
    label.append(lab.element('span',title),node); parent.append(label); return node;
  };
  lab.status = function (parent) {
    const node=lab.element('p','Pronto para experimentar.','lab-status');
    node.setAttribute('role','status'); parent.append(node);
    return (message,type='info') => {node.textContent=message;node.dataset.state=type;};
  };
  lab.table = function (rows, caption) {
    const wrapper=lab.element('div',undefined,'lab-table-scroll');
    wrapper.tabIndex=0; wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',caption);
    if (!rows.length) {wrapper.append(lab.element('p','Nenhum registro encontrado.'));return wrapper;}
    const table=lab.element('table');table.append(lab.element('caption',caption));
    const head=lab.element('thead'),tr=lab.element('tr');
    const columns=Object.keys(rows[0]);
    columns.forEach(key=>{const th=lab.element('th',key);th.scope='col';tr.append(th);});head.append(tr);table.append(head);
    const body=lab.element('tbody');
    rows.forEach(row=>{const tr=lab.element('tr');columns.forEach(key=>tr.append(lab.element('td',String(row[key]))));body.append(tr);});
    table.append(body);wrapper.append(table);return wrapper;
  };
  lab.readProgress = function () {
    try {return lab.cleanProgress(JSON.parse(localStorage.getItem('stack-lab-progress-v1')||'{}'));} catch {return {};}
  };
  lab.saveProgress = function (progress) {
    try {localStorage.setItem('stack-lab-progress-v1',JSON.stringify(progress));return true;} catch {return false;}
  };
  lab.confirm = function (parent, message, action) {
    const existing=parent.querySelector('.lab-confirm');
    if(existing) {existing.querySelector('button').focus();return;}
    const box=lab.element('div',undefined,'lab-confirm');box.setAttribute('role','group');box.setAttribute('aria-label','Confirmar alteração');
    box.append(lab.element('p',message));
    const previous=document.activeElement;
    box.append(lab.button('Cancelar',()=>{box.remove();previous?.focus();}),lab.button('Confirmar alteração',()=>{box.remove();action();previous?.focus();}));
    parent.append(box);box.querySelector('button').focus();
  };
  lab.copy = async function (value) {
    if (navigator.clipboard?.writeText) {try {await navigator.clipboard.writeText(value);return;} catch {}}
    const previous=document.activeElement;
    const input=lab.element('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();
    const copied=document.execCommand('copy');input.remove();previous?.focus();if(!copied) throw new Error('Selecione o código e copie manualmente: o navegador bloqueou a área de transferência.');
  };
})(window.StackLab);
