const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const currentYear = document.querySelector("#current-year");
const chart = document.querySelector(".chart");

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