const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const currentYear = document.querySelector("#current-year");
const chart = document.querySelector(".chart");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (chart) {
  const showChart = () => chart.classList.add("is-visible");

  if ("IntersectionObserver" in window) {
    const chartObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        showChart();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    chartObserver.observe(chart);
  } else {
    showChart();
  }
}

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.appendChild(progressBar);

let progressTicking = false;
const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  progressTicking = false;
};

window.addEventListener("scroll", () => {
  if (!progressTicking) {
    window.requestAnimationFrame(updateScrollProgress);
    progressTicking = true;
  }
}, { passive: true });
updateScrollProgress();

if (!reduceMotion && "IntersectionObserver" in window) {
  document.body.classList.add("motion-ready");
  const revealItems = document.querySelectorAll(
    ".section-heading, .profile-pillar, .bio-block, .skill-cluster, .process-step, .project-card, .technical-services-table, .plan-card, .faq-item, .contact-grid"
  );
  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const setMenuState = (isOpen) => {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    setMenuState(!navLinks.classList.contains("open"));
  });

  menuToggle.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setMenuState(!navLinks.classList.contains("open"));
    }
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    setMenuState(false);
  });
});

const updateActiveLink = () => {
  const scrollPosition = window.scrollY + 180;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const matchingLink = document.querySelector(`.nav-link[href="#${section.id}"]`);

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      navItems.forEach((link) => link.classList.remove("active"));
      matchingLink?.classList.add("active");
    }
  });
};

window.addEventListener("scroll", updateActiveLink, { passive: true });
updateActiveLink();

// Projects carousel controls
(() => {
  const carousel = document.querySelector('#projects-carousel');
  const previous = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  if (!carousel || !previous || !next) return;

  const moveCarousel = (direction) => {
    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: 'smooth' });
  };

  const updateControls = () => {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth - 2;
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= maxScroll;
  };

  previous.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
  carousel.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  updateControls();
})();


// Footer legal links open an internal document window
(() => {
  const toggles = document.querySelectorAll('.footer-legal-toggle');
  const modal = document.querySelector('#legal-modal');
  const modalTitle = document.querySelector('#legal-modal-title');
  const modalContent = document.querySelector('#legal-modal-content');
  if (!toggles.length || !modal || !modalTitle || !modalContent) return;
  let lastTrigger = null;

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('legal-modal-open');
    if (lastTrigger) lastTrigger.focus();
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const source = document.getElementById(toggle.getAttribute('aria-controls'));
      const sourceContent = source?.querySelector('.privacy-policy-content');
      if (!sourceContent) return;
      lastTrigger = toggle;
      modalTitle.textContent = toggle.textContent.trim();
      modalContent.innerHTML = sourceContent.innerHTML;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('legal-modal-open');
      modal.querySelector('.legal-modal-close').focus();
    });
  });

  modal.querySelectorAll('[data-legal-close="true"]').forEach((element) => {
    element.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });
})();

// Skill groups behave as a single accordion
(() => {
  const groups = Array.from(document.querySelectorAll('.skills-groups > .skill-cluster'));
  if (!groups.length) return;
  groups.forEach((group) => {
    group.addEventListener('toggle', () => {
      if (!group.open) return;
      groups.forEach((otherGroup) => {
        if (otherGroup !== group) otherGroup.open = false;
      });
    });
  });
})();


// Services accordion: only one service stays open
(() => {
  const items = Array.from(document.querySelectorAll('.service-accordion-item'));
  if (!items.length) return;

  const closeItem = (item) => {
    const trigger = item.querySelector('.service-accordion-trigger');
    const content = item.querySelector('.service-accordion-content');
    const toggle = item.querySelector('.service-accordion-toggle');
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
    content.style.maxHeight = '0px';
    toggle.textContent = '+';
  };

  const openItem = (item) => {
    const trigger = item.querySelector('.service-accordion-trigger');
    const content = item.querySelector('.service-accordion-content');
    const toggle = item.querySelector('.service-accordion-toggle');
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    content.setAttribute('aria-hidden', 'false');
    content.style.maxHeight = content.scrollHeight + 'px';
    toggle.textContent = '−';
  };

  items.forEach((item) => {
    const trigger = item.querySelector('.service-accordion-trigger');
    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach(closeItem);
      if (willOpen) openItem(item);
    });
  });

  window.addEventListener('resize', () => {
    const openItemElement = items.find(item => item.classList.contains('is-open'));
    if (openItemElement) openItem(openItemElement);
  });
})();

// Credentials categories: keep only one panel open
(()=>{const panels=[...document.querySelectorAll('.credentials-accordion-item')];panels.forEach(panel=>panel.addEventListener('toggle',()=>{const symbol=panel.querySelector('.credentials-toggle');if(symbol)symbol.textContent=panel.open?'−':'+';if(panel.open)panels.forEach(other=>{if(other!==panel)other.open=false})}))})();


// Accessibility tools
(() => {
  const launcher = document.querySelector('#a11y-launcher');
  const panel = document.querySelector('#a11y-panel');
  if (!launcher || !panel) return;
  const body = document.body;
  const buttons = Array.from(panel.querySelectorAll('[data-a11y-action]'));
  let textLevel = 0;
  let translationReady = false;
  const scaleValues = [1, 1.1, 1.2, 1.3];
  const skip = new Set(['SCRIPT', 'STYLE', 'SVG', 'PATH']);
  const updateButtonState = (action, active) => {
    const button = panel.querySelector('[data-a11y-action="' + action + '"]');
    if (button) { button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); }
  };
  const resizeText = () => {
    const factor = scaleValues[textLevel];
    document.querySelectorAll('body *').forEach((element) => {
      if (skip.has(element.tagName) || element.closest('.a11y-widget')) return;
      if (!element.textContent.trim()) return;
      if (!element.dataset.a11yBaseSize) element.dataset.a11yBaseSize = getComputedStyle(element).fontSize;
      const base = parseFloat(element.dataset.a11yBaseSize);
      if (Number.isFinite(base)) element.style.fontSize = (base * factor) + 'px';
    });
    updateButtonState('increase', textLevel > 0);
    updateButtonState('decrease', textLevel < 0);
  };
  const resizeDown = () => {
    const factor = [1, .92, .84, .76][Math.abs(textLevel)];
    document.querySelectorAll('body *').forEach((element) => {
      if (skip.has(element.tagName) || element.closest('.a11y-widget')) return;
      if (!element.textContent.trim()) return;
      if (!element.dataset.a11yBaseSize) element.dataset.a11yBaseSize = getComputedStyle(element).fontSize;
      const base = parseFloat(element.dataset.a11yBaseSize);
      if (Number.isFinite(base)) element.style.fontSize = (base * factor) + 'px';
    });
    updateButtonState('increase', textLevel > 0); updateButtonState('decrease', textLevel < 0);
  };
  const setTextLevel = (next) => { textLevel = Math.max(-3, Math.min(3, next)); textLevel >= 0 ? resizeText() : resizeDown(); };
  const clearTextSize = () => document.querySelectorAll('[data-a11y-base-size]').forEach((element) => { element.style.removeProperty('font-size'); delete element.dataset.a11yBaseSize; });
  const openPanel = () => { panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false'); launcher.setAttribute('aria-expanded', 'true'); };
  const closePanel = () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); launcher.setAttribute('aria-expanded', 'false'); };
  const chooseEnglish = () => { const combo = document.querySelector('.goog-te-combo'); if (combo) { combo.value = 'en'; combo.dispatchEvent(new Event('change')); translationReady = true; } };
  const loadTranslation = () => {
    if (window.google?.translate?.TranslateElement) { chooseEnglish(); return; }
    window.googleTranslateElementInit = () => { new google.translate.TranslateElement({ pageLanguage: 'es', includedLanguages: 'es,en', autoDisplay: false }, 'google_translate_element'); setTimeout(chooseEnglish, 700); };
    if (!document.querySelector('script[data-a11y-translate]')) { const script = document.createElement('script'); script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'; script.async = true; script.dataset.a11yTranslate = 'true'; document.head.appendChild(script); }
  };
  launcher.addEventListener('click', () => panel.classList.contains('is-open') ? closePanel() : openPanel());
  panel.querySelector('[data-a11y-close]').addEventListener('click', closePanel);
  buttons.forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.a11yAction;
    if (action === 'increase') setTextLevel(Math.min(3, Math.max(0, textLevel) + 1));
    if (action === 'decrease') setTextLevel(Math.max(-3, Math.min(0, textLevel) - 1));
    if (action === 'translate') loadTranslation();
    if (action === 'grayscale') { body.classList.toggle('a11y-grayscale'); updateButtonState(action, body.classList.contains('a11y-grayscale')); }
    if (action === 'contrast') { body.classList.toggle('a11y-high-contrast'); updateButtonState(action, body.classList.contains('a11y-high-contrast')); }
    if (action === 'negative') { body.classList.toggle('a11y-negative'); updateButtonState(action, body.classList.contains('a11y-negative')); }
    if (action === 'light') { body.classList.toggle('a11y-light-background'); updateButtonState(action, body.classList.contains('a11y-light-background')); }
    if (action === 'underline') { body.classList.toggle('a11y-underline-links'); updateButtonState(action, body.classList.contains('a11y-underline-links')); }
    if (action === 'font') { body.classList.toggle('a11y-readable-font'); updateButtonState(action, body.classList.contains('a11y-readable-font')); }
    if (action === 'reset') { body.classList.remove('a11y-grayscale','a11y-high-contrast','a11y-negative','a11y-light-background','a11y-underline-links','a11y-readable-font'); textLevel = 0; clearTextSize(); buttons.forEach((item) => { item.classList.remove('is-active'); item.setAttribute('aria-pressed', 'false'); }); const combo = document.querySelector('.goog-te-combo'); if (combo) { combo.value = 'es'; combo.dispatchEvent(new Event('change')); } }
  }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && panel.classList.contains('is-open')) { closePanel(); launcher.focus(); } });
})();


// Accessibility reader
(() => {
  const reader = document.querySelector('[data-a11y-action="reader"]');
  if (!reader || !('speechSynthesis' in window)) return;
  let speaking = false;
  let selectedTarget = null;
  const setReaderState = (active) => { speaking = active; reader.classList.toggle('is-active', active); reader.setAttribute('aria-pressed', String(active)); reader.querySelector('span').textContent = active ? 'Detener lectura' : 'Leer página'; reader.querySelector('i').className = active ? 'bi bi-stop-circle' : 'bi bi-volume-up'; };
  const rememberSelection = (event) => {
    const element = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!element || element.closest('.a11y-widget')) return;
    const controlledId = element.closest('[aria-controls]')?.getAttribute('aria-controls');
    const controlled = controlledId ? document.getElementById(controlledId) : null;
    const link = element.closest('a[href^="#"]');
    const linked = link ? document.querySelector(link.getAttribute('href')) : null;
    const detail = element.closest('details');
    const card = element.closest('.service-accordion-item, .credentials-accordion-item, .skill-cluster, .project-card, .service-card, .process-step, .profile-pillar, .availability-block');
    const section = element.closest('section');
    selectedTarget = controlled || linked || detail || card || section || null;
  };
  const stopReading = () => { window.speechSynthesis.cancel(); setReaderState(false); };
  const readSelection = () => {
    if (speaking) { stopReading(); return; }
    if (!selectedTarget) {
      reader.querySelector('span').textContent = 'Selecciona una sección';
      window.setTimeout(() => { if (!speaking) reader.querySelector('span').textContent = 'Leer página'; }, 1800);
      return;
    }
    const text = selectedTarget.innerText.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang === 'en' ? 'en-US' : 'es-HN';
    utterance.rate = 0.95;
    utterance.onend = () => setReaderState(false);
    utterance.onerror = () => setReaderState(false);
    setReaderState(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  document.addEventListener('click', rememberSelection, true);
  reader.addEventListener('click', readSelection);
  document.querySelector('[data-a11y-action="reset"]')?.addEventListener('click', stopReading);
  window.addEventListener('beforeunload', stopReading);
})();