/** Tema: mantém a preferência em todas as páginas. */
(() => {
  const button = document.querySelector('#theme-toggle');

  function refreshLabel() {
    const light = document.documentElement.dataset.theme === 'light';
    const label = window.portfolioI18n.translate(light ? 'themeDark' : 'themeLight');
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(light));
    button.title = label;
    document.querySelector('#theme-icon').textContent = light ? '☾' : '☀';
    document.querySelector('meta[name="theme-color"]').content = light ? '#f5f3f9' : '#100819';
  }

  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {}
    refreshLabel();
  });
  document.addEventListener('portfolio:language', refreshLabel);
  refreshLabel();
})();
