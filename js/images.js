/** Carregamento das imagens definidas manualmente em images.js. */
(() => {
  Object.entries(window.portfolioImages || {}).forEach(([slot, source]) => {
    const image = document.querySelector('[data-image-display="' + slot + '"]');
    const fallback = document.querySelector('[data-image-fallback="' + slot + '"]');
    if (!image || !fallback || typeof source !== 'string' || !source.trim()) return;

    image.addEventListener('load', () => {
      image.hidden = false;
      fallback.hidden = true;
      document.dispatchEvent(new CustomEvent('portfolio:image', { detail: { slot, image } }));
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      fallback.hidden = false;
    });
    image.src = source.trim();
  });
})();
