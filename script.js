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


// Footer legal links and contact form open an internal document window
(() => {
  const toggles = document.querySelectorAll('.footer-legal-toggle');
  const contactTrigger = document.querySelector('.contact-form-trigger');
  const contactTemplate = document.querySelector('#contact-form-template');
  const modal = document.querySelector('#legal-modal');
  const modalTitle = document.querySelector('#legal-modal-title');
  const modalContent = document.querySelector('#legal-modal-content');
  const modalClose = modal?.querySelector('.legal-modal-close');
  if ((!toggles.length && !contactTrigger) || !modal || !modalTitle || !modalContent || !modalClose) return;
  let lastTrigger = null;
  let captchaLoad = null;
  let captchaWidgetId = null;

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('legal-modal-open');
    modalContent.innerHTML = '';
    contactTrigger?.setAttribute('aria-expanded', 'false');
    modalClose.setAttribute('aria-label', 'Cerrar documento legal');
    if (lastTrigger) lastTrigger.focus();
  };

  const loadCaptcha = () => {
    if (window.grecaptcha) return new Promise((resolve) => window.grecaptcha.ready(resolve));
    if (captchaLoad) return captchaLoad;
    captchaLoad = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-contact-recaptcha]');
      if (existing) {
        existing.addEventListener('load', () => window.grecaptcha.ready(resolve), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.contactRecaptcha = 'true';
      script.addEventListener('load', () => window.grecaptcha.ready(resolve), { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
    return captchaLoad;
  };

  const setupFormCaptcha = async () => {
    const form = modalContent.querySelector('form');
    const captcha = modalContent.querySelector('.g-recaptcha');
    const status = modalContent.querySelector('.contact-captcha-status');
    if (!form || !captcha) return;
    let captchaReady = false;
    form.addEventListener('submit', (event) => {
      const response = captchaReady && captchaWidgetId !== null ? window.grecaptcha.getResponse(captchaWidgetId) : '';
      if (!response) {
        event.preventDefault();
        if (status) status.textContent = 'Completa la verificación reCAPTCHA antes de enviar el formulario.';
      }
    });
    try {
      await loadCaptcha();
      if (!captcha.isConnected) return;
      captchaWidgetId = window.grecaptcha.render(captcha, {
        sitekey: captcha.dataset.sitekey,
        callback: () => { if (status) status.textContent = ''; },
        'expired-callback': () => { if (status) status.textContent = 'La verificación expiró. Complétala nuevamente.'; },
        'error-callback': () => { if (status) status.textContent = 'No fue posible cargar reCAPTCHA. Intenta nuevamente.'; }
      });
      captchaReady = true;
    } catch (error) {
      if (status) status.textContent = 'No fue posible cargar reCAPTCHA. Revisa tu conexión e intenta nuevamente.';
    }
  };

  const openLegalModal = (trigger, title, content, isContact = false) => {
    lastTrigger = trigger;
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('legal-modal-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (isContact) modalClose.setAttribute('aria-label', 'Cerrar formulario de contacto');
    modalClose.focus();
    if (modalContent.querySelector('.g-recaptcha')) setupFormCaptcha();
  };

  toggles.forEach((toggle) => toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const source = document.getElementById(toggle.getAttribute('aria-controls'));
    const sourceContent = source?.querySelector('.privacy-policy-content');
    if (sourceContent) openLegalModal(toggle, toggle.textContent.trim(), sourceContent.innerHTML);
  }));

  contactTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    if (contactTemplate) openLegalModal(contactTrigger, 'Contáctame', contactTemplate.innerHTML, true);
  });

  modal.querySelectorAll('[data-legal-close="true"]').forEach((element) => element.addEventListener('click', closeModal));
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
  const widget = launcher.closest('.a11y-widget');
  const hideAtEnd = panel.querySelector('#a11y-hide-at-end');
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
  const updateEndVisibility = (isAtEnd) => {
    if (!widget || !hideAtEnd) return;
    const shouldHide = isAtEnd && hideAtEnd.checked;
    if (shouldHide) closePanel();
    widget.classList.toggle('is-hidden-at-end', shouldHide);
  };
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
    if (action === 'reset') { body.classList.remove('a11y-grayscale','a11y-high-contrast','a11y-negative','a11y-light-background','a11y-underline-links','a11y-readable-font'); textLevel = 0; clearTextSize(); buttons.forEach((item) => { item.classList.remove('is-active'); item.setAttribute('aria-pressed', 'false'); }); if (hideAtEnd) hideAtEnd.checked = true; const combo = document.querySelector('.goog-te-combo'); if (combo) { combo.value = 'es'; combo.dispatchEvent(new Event('change')); } }
  }));
  const endSections = [document.querySelector('#contacto'), document.querySelector('.site-footer')].filter(Boolean);
  if (endSections.length && 'IntersectionObserver' in window) {
    const endVisibility = new Map(endSections.map((section) => [section, false]));
    const endObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => endVisibility.set(entry.target, entry.isIntersecting));
      updateEndVisibility(Array.from(endVisibility.values()).some(Boolean));
    }, { threshold: 0.01 });
    endSections.forEach((section) => endObserver.observe(section));
    hideAtEnd?.addEventListener('change', () => updateEndVisibility(Array.from(endVisibility.values()).some(Boolean)));
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && panel.classList.contains('is-open')) { closePanel(); launcher.focus(); } });
})();
