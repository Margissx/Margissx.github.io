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