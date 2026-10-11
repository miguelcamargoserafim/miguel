/** Idioma: tradutor compartilhado entre a página principal e contato. */
(() => {
  const dictionary = window.portfolioTranslations;
  let language = 'en';

  try {
    language = localStorage.getItem('portfolio-language') === 'pt-BR' ? 'pt-BR' : 'en';
  } catch {
    // O site continua funcionando quando o armazenamento está bloqueado.
  }

  function translate(key) {
    return dictionary[key]?.[language === 'pt-BR' ? 1 : 0] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      element.alt = translate(element.dataset.i18nAlt);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      element.setAttribute('aria-label', translate(element.dataset.i18nAria));
    });
    document.querySelector('#language').value = language;
    document.dispatchEvent(new CustomEvent('portfolio:language'));
  }

  window.portfolioI18n = { translate, applyLanguage };
  document.querySelector('#language').addEventListener('change', event => {
    language = event.target.value === 'pt-BR' ? 'pt-BR' : 'en';
    try {
      localStorage.setItem('portfolio-language', language);
    } catch {}
    applyLanguage();
  });
})();
