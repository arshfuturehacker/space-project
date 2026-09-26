// starfield.js — Space page chrome: star field, scroll-reveal animations,
// nav-highlight-on-scroll, and background parallax.
// This is the revived version of the project's old dead js/main.js — it was
// never wired into index.html before this refactor.

export function initStarfield() {
  const body = document.body;
  const starField = document.getElementById('starField');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const chapterSurfaces = [...document.querySelectorAll('.chapter-surface')];
  const reveals = [...document.querySelectorAll('.reveal')];

  if (starField) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 95; i += 1) {
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--star-size', `${Math.random() * 1.8 + 0.6}px`);
      star.style.setProperty('--star-opacity', `${Math.random() * 0.7 + 0.2}`);
      star.style.setProperty('--star-depth', `${(Math.random() * 2 + 0.5).toFixed(2)}`);
      fragment.appendChild(star);
    }
    starField.appendChild(fragment);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((item) => revealObserver.observe(item));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stage = entry.target.dataset.stage;
      if (stage) body.dataset.atmosphere = stage;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === stage));
    });
  }, { threshold: 0.38, rootMargin: '-10% 0px -45% 0px' });
  chapterSurfaces.forEach((section) => navObserver.observe(section));

  let ticking = false;
  function updateParallax() {
    ticking = false;
    const y = Math.min(window.scrollY * 0.045, 42);
    if (starField) starField.style.transform = `translate3d(0, ${y}px, 0)`;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  updateParallax();
}

// Hero planet — the rotating, draggable "unknown world" on the Space page.
// (This is the revived version of the project's old js/hero-planet.js.)
export function initHeroPlanet() {
  const host = document.getElementById('hero-planet');
  if (!host || !window.DSPlanet || !window.DS_TEXTURES || !window.DS_TEXTURES.exo) return;

  const hint = document.getElementById('planet-hint');
  if (hint && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    hint.textContent = 'Swipe to rotate · Tap to spin';
  }

  window.DSPlanet.create({
    container: host,
    texture: window.DS_TEXTURES.exo,
    label: 'Interactive 3D view of an unknown exoplanet',
    roll: -14, pitch: 6, speed: 4.5,
    light: [-0.55, 0.45, 0.70],
    ambient: 0.07, terminator: [-0.18, 0.88], limb: 0.26,
    atmosphere: { color: [120, 190, 255], strength: 0.78, power: 3.0, haze: 0.34 },
    specular: 0.26, shininess: 120,
    onInteract: function () { if (hint) hint.classList.add('is-hidden'); }
  });
}
