/* ============================================
   LIGHTBOX — Navigation galerie projet
   ============================================ */
const lightbox = (() => {
  let images = [];
  let currentIndex = 0;

  function init() {
    /* Crée l'overlay */
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Fermer">✕</button>
      <div class="lightbox-counter"></div>
      <button class="lightbox-prev" aria-label="Précédent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <img class="lightbox-img" src="" alt="" />
      <button class="lightbox-next" aria-label="Suivant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(overlay);

    const img       = overlay.querySelector('.lightbox-img');
    const caption   = overlay.querySelector('.lightbox-caption');
    const counter   = overlay.querySelector('.lightbox-counter');
    const btnClose  = overlay.querySelector('.lightbox-close');
    const btnPrev   = overlay.querySelector('.lightbox-prev');
    const btnNext   = overlay.querySelector('.lightbox-next');

    /* Collecte toutes les images de la galerie */
    document.querySelectorAll('.gallery-item img').forEach((el, i) => {
      images.push({ src: el.src, alt: el.alt });
      el.parentElement.addEventListener('click', () => open(i));
    });

    if (images.length === 0) return;

    /* Fonctions */
    function open(index) {
      currentIndex = index;
      update();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function update() {
      const item = images[currentIndex];
      img.src = item.src;
      img.alt = item.alt;
      caption.textContent = item.alt;
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
      btnPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
      btnNext.style.opacity = currentIndex === images.length - 1 ? '0.3' : '1';
    }

    function prev() {
      if (currentIndex > 0) { currentIndex--; update(); }
    }

    function next() {
      if (currentIndex < images.length - 1) { currentIndex++; update(); }
    }

    /* Events */
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    /* Clic en dehors de l'image */
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    /* Clavier */
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => lightbox.init());