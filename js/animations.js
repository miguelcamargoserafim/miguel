/**
 * Animações inspiradas na gravação Maicore.
 * Ajuste os valores abaixo para mudar a intensidade dos efeitos.
 * Nenhum efeito depende de bibliotecas ou altera os arquivos das imagens.
 */
(() => {
  const settings = {
    asciiPortrait: true, // false mantém a foto/monograma original sem caracteres.
    asciiColumns: 76,    // Mais colunas = mais detalhes no retrato.
    pointerDistance: 8,  // Deslocamento máximo do retrato, em pixels.
    staggerDelay: 85,    // Intervalo entre a entrada dos projetos, em milissegundos.
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const portrait = document.querySelector('.hero-portrait');
  const readTarget = document.querySelector('.about > div > p');
  let words = [];
  let scrollFrame = 0;

  // Texto iluminado progressivamente pela rolagem, preservando traduções.
  function prepareReading() {
    if (!readTarget) return;
    const text = readTarget.textContent;
    readTarget.replaceChildren();
    words = text.split(/(\s+)/).map(part => {
      const span = document.createElement('span');
      span.textContent = part;
      if (part.trim()) span.className = 'reading-word';
      readTarget.append(span);
      return span;
    }).filter(span => span.className);
    updateScroll();
  }

  function updateScroll() {
    scrollFrame = 0;
    if (!readTarget) return;
    const box = readTarget.getBoundingClientRect();
    const height = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (height * 0.86 - box.top) / (height * 0.42 + box.height * 0.4)));
    words.forEach((word, index) => {
      word.classList.toggle('word-active', reducedMotion.matches || index < Math.ceil(progress * words.length));
    });
  }

  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  document.addEventListener('portfolio:language', prepareReading);

  // Entrada de seções e projetos. Sem JavaScript, o conteúdo continua visível.
  const revealTargets = document.querySelectorAll('.section-heading, .project, .about > div, .contact-invite, .channel');
  let observer;
  function setReveals() {
    observer?.disconnect();
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      revealTargets.forEach(element => element.classList.remove('motion-pending'));
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('motion-pending');
        entry.target.classList.add('motion-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealTargets.forEach(element => {
      if (element.classList.contains('motion-visible')) return;
      if (element.classList.contains('project')) {
        const index = [...element.parentElement.children].indexOf(element);
        element.style.setProperty('--reveal-delay', index * settings.staggerDelay + 'ms');
      }
      element.classList.add('motion-pending');
      observer.observe(element);
    });
  }
  setReveals();

  // Luz e retrato respondem ao cursor somente em dispositivos com mouse.
  if (hero) {
    hero.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      hero.style.setProperty('--pointer-x', x * 100 + '%');
      hero.style.setProperty('--pointer-y', y * 100 + '%');
      hero.style.setProperty('--portrait-x', (x - 0.5) * settings.pointerDistance + 'px');
      hero.style.setProperty('--portrait-y', (y - 0.5) * settings.pointerDistance + 'px');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--portrait-x', '0px');
      hero.style.setProperty('--portrait-y', '0px');
    });
  }

  // Retrato ASCII: a imagem principal pode ser definida em images.js > hero.
  // Quando ainda não há foto, usamos o próprio monograma como origem.
  let currentImage = null;
  let asciiCanvas;
  function drawPortrait() {
    if (!portrait || !settings.asciiPortrait) return;
    const width = Math.round(portrait.clientWidth);
    const height = Math.round(portrait.clientHeight);
    if (!width || !height) return;
    const columns = settings.asciiColumns;
    const cellWidth = width / columns;
    const cellHeight = cellWidth * 1.65;
    const rows = Math.ceil(height / cellHeight);
    const source = document.createElement('canvas');
    source.width = columns;
    source.height = rows;
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.fillStyle = '#100e16';
    context.fillRect(0, 0, columns, rows);
    if (currentImage) {
      const scale = Math.max(width / currentImage.naturalWidth, height / currentImage.naturalHeight);
      const w = currentImage.naturalWidth * scale * columns / width;
      const h = currentImage.naturalHeight * scale * rows / height;
      context.drawImage(currentImage, (columns - w) / 2, (rows - h) / 2, w, h);
    } else {
      context.fillStyle = '#cab6ef';
      context.font = 'bold ' + rows * 0.8 + 'px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('m.', columns * 0.48, rows * 0.48);
    }
    let pixels;
    try {
      pixels = context.getImageData(0, 0, columns, rows).data;
    } catch {
      // Imagens externas sem permissão CORS continuam aparecendo normalmente.
      portrait.classList.remove('ascii-active');
      if (asciiCanvas) asciiCanvas.hidden = true;
      return;
    }
    if (!asciiCanvas) {
      asciiCanvas = document.createElement('canvas');
      asciiCanvas.className = 'ascii-portrait';
      asciiCanvas.setAttribute('aria-hidden', 'true');
      portrait.append(asciiCanvas);
    }
    asciiCanvas.hidden = false;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    asciiCanvas.width = Math.round(width * ratio);
    asciiCanvas.height = Math.round(height * ratio);
    const output = asciiCanvas.getContext('2d');
    if (!output) return;
    output.scale(ratio, ratio);
    output.font = cellHeight * 0.86 + 'px monospace';
    output.textBaseline = 'top';
    const ramp = ' .:;+=xX#@';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const offset = (row * columns + col) * 4;
        const luminance = (pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722) / 255;
        const character = ramp[Math.min(ramp.length - 1, Math.floor(luminance * ramp.length))];
        if (character === ' ') continue;
        output.fillStyle = 'rgba(196,179,239,' + (0.2 + luminance * 0.8) + ')';
        output.fillText(character, col * cellWidth, row * cellHeight);
      }
    }
    portrait.classList.add('ascii-active');
  }
  document.addEventListener('portfolio:image', event => {
    if (event.detail.slot !== 'hero') return;
    currentImage = event.detail.image;
    drawPortrait();
  });
  if (portrait && settings.asciiPortrait) {
    drawPortrait();
    if ('ResizeObserver' in window) new ResizeObserver(drawPortrait).observe(portrait);
    else window.addEventListener('resize', drawPortrait, { passive: true });
  }
  reducedMotion.addEventListener('change', () => {
    setReveals();
    updateScroll();
    if (hero) {
      hero.style.setProperty('--portrait-x', '0px');
      hero.style.setProperty('--portrait-y', '0px');
    }
  });
})();
