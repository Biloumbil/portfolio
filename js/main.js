/* ============================================
   1. i18n — SYSTÈME DE TRADUCTION
   ============================================ */
const i18n = (() => {
  let currentLang = localStorage.getItem('nd_lang') || 'fr';
  let translations = {};

  /* Charge le fichier JSON de la langue */
  async function load(lang) {
    try {
      const res = await fetch(`/js/lang/${lang}.json`);
      if (!res.ok) throw new Error(`Impossible de charger ${lang}.json`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem('nd_lang', lang);
      apply();
      updateLangButtons();
    } catch (err) {
      console.error('[i18n]', err);
    }
  }

  /* Applique les traductions à tous les éléments data-i18n */
  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[key] !== undefined) {
        /* Gère placeholder pour inputs */
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translations[key];
        } else {
          el.textContent = translations[key];
        }
      }
    });

    /* Attribut lang sur <html> pour accessibilité */
    document.documentElement.lang = currentLang;

    /* Met à jour le titre de page si défini */
    const pageTitle = document.querySelector('[data-i18n-title]');
    if (pageTitle) {
      const key = pageTitle.dataset.i18nTitle;
      if (translations[key]) document.title = translations[key] + ' — Nabil Dickeni';
    }
  }

  /* Met à jour l'état actif des boutons langue */
  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  /* Initialisation */
  async function init() {
    await load(currentLang);

    /* Écoute les clics sur les boutons langue */
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang !== currentLang) {
          load(btn.dataset.lang);
        }
      });
    });
  }

  return { init, load, get: (key) => translations[key] || key };
})();


/* ============================================
   2. NAVBAR — scroll + burger menu
   ============================================ */
const navbar = (() => {
  let isOpen = false;

  function init() {
    const nav    = document.querySelector('.navbar');
    const burger = document.querySelector('.navbar__burger');
    const menu   = document.querySelector('.navbar__nav');

    if (!nav) return;

    /* Effet scroll */
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* état initial */

    /* Burger mobile */
    if (burger && menu) {
      burger.addEventListener('click', () => {
        isOpen = !isOpen;
        menu.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        /* Animation des barres burger */
        const bars = burger.querySelectorAll('span');
        if (isOpen) {
          bars[0].style.transform = 'translateY(7px) rotate(45deg)';
          bars[1].style.opacity   = '0';
          bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
          bars[0].style.transform = '';
          bars[1].style.opacity   = '';
          bars[2].style.transform = '';
        }
      });

      /* Ferme le menu au clic sur un lien */
      menu.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
          if (isOpen) burger.click();
        });
      });

      /* Ferme au clic en dehors */
      document.addEventListener('click', (e) => {
        if (isOpen && !nav.contains(e.target)) burger.click();
      });
    }

    /* Lien actif selon la page courante */
    highlightActive();
  }

  function highlightActive() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isActive =
        href === path ||
        (path === '' && href === 'index.html') ||
        (path.startsWith('project') && href === 'projects.html');
      link.classList.toggle('active', isActive);
    });
  }

  return { init };
})();


/* ============================================
   3. REVEAL — animation au scroll 
   ============================================ */
const reveal = (() => {
  function init() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* one-shot */
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================
   4. TOOLS SCROLL 
   ============================================ */
const toolsScroll = (() => {
  function init() {
    const track = document.querySelector('.tools-track');
    if (!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    // Ajoute un séparateur entre les deux pistes
    const separator = document.createElement('span');
    separator.style.cssText = 'display:inline-block; width: 3rem; flex-shrink:0;';
    track.parentElement.appendChild(separator);
    track.parentElement.appendChild(clone);
  }
  return { init };
})();


/* ============================================
   5. FORMULAIRE CONTACT 
   ============================================ */
const contactForm = (() => {
  function init() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Envoi en cours...</span>';
      btn.disabled = true;

      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const success = form.querySelector('.form-success') || 
                          form.parentElement.querySelector('.form-success');
          form.style.opacity = '0';
          form.style.transition = 'opacity 0.3s';
          setTimeout(() => {
            form.style.display = 'none';
            if (success) success.style.display = 'block';
          }, 300);
        } else {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          alert('Erreur lors de l\'envoi. Réessayez.');
        }
      } catch (err) {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        alert('Erreur réseau. Vérifiez votre connexion.');
      }
    });

    /* Validation champs en temps réel */
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  }

  function validateField(input) {
    const val = input.value.trim();
    if (!val) { showError(input, 'Ce champ est requis'); return false; }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError(input, 'Email invalide'); return false;
    }
    clearError(input);
    return true;
  }

  function showError(input, msg) {
    clearError(input);
    input.style.borderColor = '#e05252';
    const err = document.createElement('span');
    err.className = 'form-error';
    err.style.cssText = 'font-size:0.75rem;color:#e05252;margin-top:4px;display:block';
    err.textContent = msg;
    input.parentElement.appendChild(err);
  }

  function clearError(input) {
    input.style.borderColor = '';
    const err = input.parentElement.querySelector('.form-error');
    if (err) err.remove();
  }

  return { init };
})();


/* ============================================
   6. SMOOTH SCROLL — liens ancres internes
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


/* ============================================
   7. CURSOR ACCENT 
   ============================================ */
const cursor = (() => {
  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return; /* mobile out */

    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: #e8823a;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease, opacity 0.2s ease;
      opacity: 0;
    `;
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
      dot.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
    });

    /* Grossit sur les éléments interactifs */
    document.querySelectorAll('a, button, .card, .project-card, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(3)';
        dot.style.opacity   = '0.4';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        dot.style.opacity   = '1';
      });
    });
  }

  return { init };
})();


/* ============================================
   8. BOOT 
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await i18n.init();   /* Traductions en premier */
  navbar.init();
  reveal.init();
  toolsScroll.init();
  contactForm.init();
  initSmoothScroll();
  cursor.init();

  /* Expose i18n globalement pour usage inline si besoin */
  window.nd = { i18n };
});
