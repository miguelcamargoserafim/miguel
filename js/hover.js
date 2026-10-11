/**
 * Efeitos ao passar o mouse. Ajuste as intensidades em settings.
 * Os movimentos são desativados em telas de toque e com movimento reduzido.
 */
(() => {
  const settings = {
    tiltDegrees: 4,      // Inclinação dos projetos, imagens e contatos.
    buttonDistance: 5,   // Atração dos botões pelo cursor, em pixels.
  };
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const enabled = () => pointer.matches && !reduced.matches;
  const surfaces = document.querySelectorAll('.preview-link, .name-scene, .hero-portrait, .live-note, .channel, .stack-experiment');
  const buttons = document.querySelectorAll('.button, .theme-control');
  const records = [];

  function bind(element, magnetic) {
    const state = { frame: 0, box: null, x: 0, y: 0 };
    element.classList.add(magnetic ? 'hover-magnetic' : 'hover-surface');

    function reset() {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.box = null;
      ['--hover-x', '--hover-y', '--tilt-x', '--tilt-y', '--magnet-x', '--magnet-y', '--image-x', '--image-y'].forEach(property => {
        element.style.removeProperty(property);
      });
      element.classList.remove('pointer-active');
    }

    function paint() {
      state.frame = 0;
      if (!enabled() || !state.box) return;
      const x = Math.max(0, Math.min(1, (state.x - state.box.left) / state.box.width));
      const y = Math.max(0, Math.min(1, (state.y - state.box.top) / state.box.height));
      element.style.setProperty('--hover-x', x * 100 + '%');
      element.style.setProperty('--hover-y', y * 100 + '%');
      if (magnetic) {
        element.style.setProperty('--magnet-x', (x - 0.5) * settings.buttonDistance * 2 + 'px');
        element.style.setProperty('--magnet-y', (y - 0.5) * settings.buttonDistance * 2 + 'px');
      } else {
        element.style.setProperty('--tilt-x', (0.5 - y) * settings.tiltDegrees * 2 + 'deg');
        element.style.setProperty('--tilt-y', (x - 0.5) * settings.tiltDegrees * 2 + 'deg');
        element.style.setProperty('--image-x', (x - 0.5) * -10 + 'px');
        element.style.setProperty('--image-y', (y - 0.5) * -10 + 'px');
      }
      element.classList.add('pointer-active');
    }

    element.addEventListener('pointerenter', () => {
      if (enabled()) state.box = element.getBoundingClientRect();
    });
    element.addEventListener('pointermove', event => {
      if (!enabled()) return;
      state.box ||= element.getBoundingClientRect();
      state.x = event.clientX;
      state.y = event.clientY;
      if (!state.frame) state.frame = requestAnimationFrame(paint);
    }, { passive: true });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('pointercancel', reset);
    records.push({ reset });
  }

  surfaces.forEach(element => bind(element, false));
  buttons.forEach(element => bind(element, true));
  const resetAll = () => records.forEach(record => record.reset());
  reduced.addEventListener('change', resetAll);
  pointer.addEventListener('change', resetAll);
  window.addEventListener('blur', resetAll);
  window.addEventListener('scroll', resetAll, { passive: true });
})();
