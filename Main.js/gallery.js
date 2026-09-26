// gallery.js — Space Image Archive
// Owns: the gallery image metadata (paths into media/images/) AND the
// lightbox logic (kept together).

const IMAGES = [
  { src: "media/images/1.avif", alt: "The Milky Way galaxy's core rising over a starry night sky", caption: "The Milky Way's glowing core, streaked with dust lanes, arcs across a dark night sky." },
  { src: "media/images/2.avif", alt: "Milky Way over desert rock hoodoos at night", caption: "The Milky Way rises behind eroded desert hoodoos, its bright core visible above the horizon." },
  { src: "media/images/3.avif", alt: "Apollo 11 astronaut standing on the Moon's surface", caption: "An Apollo 11 astronaut on the lunar surface, visor reflecting the lunar module and photographer." },
  { src: "media/images/4.avif", alt: "The Orion Nebula glowing in pink and purple", caption: "The Orion Nebula, a vivid stellar nursery where new stars are born amid glowing gas and dust." },
  { src: "media/images/5.avif", alt: "A spiral galaxy resembling Andromeda surrounded by stars", caption: "A grand spiral galaxy, its dusty arms and bright core resembling our neighbor, Andromeda." },
  { src: "media/images/6.avif", alt: "Artist's rendering of a black hole with a glowing accretion disk", caption: "An artist's rendering of a black hole, its intense gravity warping light from the disk around it." }
];


export function initGallery() {
  const images = IMAGES;
  const gallery = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  if (!gallery || !lightbox || !lbImage || !images.length) return;

  let currentIndex = 0;
  let lastFocused = null;

  function buildGallery() {
    images.forEach((img, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'thumb';
      thumb.setAttribute('aria-label', 'Open image: ' + img.alt);
      thumb.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy"><span class="caption">${img.alt}</span><span class="thumb-arrow" aria-hidden="true">↗</span>`;
      thumb.addEventListener('click', () => openLightbox(i, thumb));
      gallery.appendChild(thumb);
    });
  }

  function updateLightbox() {
    const img = images[currentIndex];
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    lbCaption.textContent = img.caption || img.alt;
    lbCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function openLightbox(index, source) {
    lastFocused = source || document.activeElement;
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function showPrev() { currentIndex = (currentIndex - 1 + images.length) % images.length; updateLightbox(); }
  function showNext() { currentIndex = (currentIndex + 1) % images.length; updateLightbox(); }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);
  lbImage.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showPrev();
    if (event.key === 'ArrowRight') showNext();
  });

  buildGallery();
}
