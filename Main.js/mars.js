// mars.js — the whole Mars page's behavior, bundled into one module.
// Owns: Mars gallery data + lightbox, the live rotating globe, sol counter,
// mindmap, podcast player, and fact roulette (data kept alongside logic,
// per project decision). Element ids referenced below match the #mars-page
// section of index.html. Two ids were renamed from the original standalone
// Mars page to avoid colliding with #space-page: "lightbox" -> "marsLightbox",
// and the gallery section id "gallery" -> "mars-gallery".

const GALLERY_ITEMS = [
  { src: "media/images/8.avif", tag: "ORBITAL VIEW", title: "Full disk from orbit", text: "Mars seen whole — Valles Marineris cutting across the center, a bright polar cap at the south pole, and the thin blue atmospheric limb visible at the edge." },
  { src: "media/images/9.avif", tag: "PHOBOS & DEIMOS", title: "Mars with both of its moons", text: "The two small, irregularly shaped moons — still debated as captured asteroids or ancient impact debris." },
  { src: "media/images/10.avif", tag: "OLYMPUS MONS", title: "The solar system's tallest volcano", text: "A shield volcano roughly 2.5 times the height of Everest, wide enough to cover the state of Arizona." },
  { src: "media/images/11.avif", tag: "GALE CRATER · CURIOSITY", title: "Curiosity on Mount Sharp", text: "Past its 5,000th sol on Mars, still reading the layered lakebed strata for clues to the planet's wetter past." },
  { src: "media/images/12.avif", tag: "JEZERO CRATER · PERSEVERANCE", title: "Perseverance sampling bedrock", text: "The SHERLOC laser instrument at work — the same instrument that found macromolecular carbon in ancient lake mud." },
  { src: "media/images/13.avif", tag: "CHINA · TIANWEN-3", title: "Tianwen-3 sample collection", text: "China's sample-return lander, targeting a 2028 launch and a 2031 return — a bid to be first home with Martian rock." },
  { src: "media/images/14.avif", tag: "VALLES MARINERIS", title: "A canyon system wider than a continent", text: "Stretching over 4,000 km — long enough to span the continental United States." },
  { src: "media/images/15.avif", tag: "ESA/NASA · ROSALIND FRANKLIN", title: "Rosalind Franklin at Oxia Planum", text: "Set to land in 2028 and drill 2 meters down — deeper than any previous Mars mission — hunting for preserved organics." },
  { src: "media/images/16.avif", tag: "ARCADIA PLANITIA", title: "Early robotic outpost concept", text: "Humanoid robots handling first-wave setup — solar arrays, subsurface ice checks — ahead of any human crew." },
  { src: "media/images/17.avif", tag: "RADIATION MODELING", title: "Crustal magnetic shielding simulation", text: "Localized magnetic fields in the southern hemisphere deflecting high-energy particles, carving out lower-radiation safe zones." },
  { src: "media/images/18.avif", tag: "PHOBOS CLOSE-UP", title: "Phobos over the Martian limb", text: "Heavily cratered and slowly spiraling inward — due to break apart into a ring in roughly 50 million years." },
  { src: "media/images/19.avif", tag: "FUTURE OUTPOST", title: "A settlement at twilight", text: "Buried habitat domes, solar fields, and a MOXIE-style oxygen generator — the in-situ resource loop future crews would depend on." }
];

const MARS_FACTS = [
    "Curiosity's SAM instrument found 21 carbon-based molecules in one rock sample — including a nitrogen-ring structure that's a chemical precursor to RNA and DNA.",
    "In 2026, Curiosity accidentally cracked open a rock while driving over it and found yellow crystals of pure elemental sulfur — never seen on Mars before.",
    "Curiosity spotted a field of honeycomb-shaped ground cracks in a valley called Valle Grande, stretching as far as its cameras could see.",
    "Perseverance has photographed Earth itself — as a tiny point of light — passing behind the Martian moon Phobos.",
    "Mars has two moons, Phobos and Deimos, and scientists still aren't sure if they're captured asteroids or debris blasted off Mars by an ancient impact.",
    "Phobos is slowly spiraling inward and is expected to break apart into a ring around Mars in roughly 50 million years.",
    "In November 2026, Japan's JAXA launched a mission to land on Phobos, scoop up a sample, and bring it back to Earth by 2031 — a first attempt of its kind.",
    "If Earth were the size of a nickel, Mars would be about the size of a raspberry next to it.",
    "Mars' atmosphere is under 1% as dense as Earth's, made mostly of carbon dioxide, nitrogen, and argon.",
    "A Martian day, called a sol, is only about 37 minutes longer than an Earth day — one of the most Earth-like day lengths in the solar system.",
    "A single year on Mars lasts 687 Earth days, almost twice as long as ours.",
    "Surface temperatures on Mars swing from a mild 70°F (20°C) at the equator to a brutal -225°F (-153°C) at the poles.",
    "Mars lacks a global magnetic field, leaving its surface almost 100 times more exposed to space radiation than Earth's.",
    "An unshielded 3-year Mars mission would expose astronauts to about 1,000 mSv of radiation — well over NASA's 600 mSv career safety limit.",
    "Scientists have modeled localized 'crustal' magnetic fields in Mars' southern hemisphere that could act as natural radiation umbrellas, cutting exposure to around 350 mSv in shielded zones.",
    "Perseverance's SHERLOC instrument found macromolecular carbon preserved in ancient lakebed mud at Jezero Crater — a strong sign ancient Mars had the chemistry for life.",
    "Perseverance also found millimeter-scale 'leopard spot' patterns that, on Earth, are usually produced by ancient microbial metabolism.",
    "Bright white, aluminum-rich clay rocks found by Perseverance suggest millions of years of ancient rain once fell on Mars.",
    "NASA's MOXIE experiment already proved oxygen can be manufactured on Mars directly from its CO2 atmosphere.",
    "China's Tianwen-3 mission aims to launch in 2028 and return 500 grams of Martian rock to Earth by 2031 — potentially beating every other nation home."
  ];

export function initMars() {
  initMarsGallery();
  initMarsGlobe();
  initSolCounter();
  initMindmap();
  initPodcast();
  initRoulette();
}

// ---------- Gallery ----------
function initMarsGallery() {
  const items = GALLERY_ITEMS;
  const grid = document.getElementById('mars-gallery-grid');
  if (!grid) return;
  grid.innerHTML = items.map((it, i) => `
    <div class="gal-item" data-idx="${i}">
      <img src="${it.src}" alt="${it.title}" loading="lazy">
      <div class="gal-caption"><span>${it.tag}</span>${it.title}</div>
    </div>`).join('');

  const lightbox = document.getElementById('marsLightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTag = document.getElementById('lb-tag');
  const lbText = document.getElementById('lb-text');
  if (!lightbox || !lbImg) return;
  grid.querySelectorAll('.gal-item').forEach(el => {
    el.addEventListener('click', () => {
      const it = items[+el.dataset.idx];
      lbImg.src = it.src; lbTag.textContent = it.tag; lbText.textContent = it.text;
      lightbox.classList.add('open');
    });
  });
  const lbClose = document.getElementById('mars-lb-close');
  if (lbClose) lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
}

// ---------- Rotating, draggable Mars hero ----------
function initMarsGlobe() {
  const host = document.getElementById('mars-globe');
  if (!host || !window.DSPlanet || !window.DS_TEXTURES || !DS_TEXTURES.mars) return;
  const fig = host.closest('.mars-photo');
  const hint = document.getElementById('mars-hint');
  if (hint && window.matchMedia && matchMedia('(pointer: coarse)').matches) {
    hint.textContent = 'MARS · SWIPE TO ROTATE · TAP TO SPIN';
  }
  DSPlanet.create({
    container: host,
    texture: DS_TEXTURES.mars,
    label: 'Interactive 3D view of Mars',
    roll: 12, pitch: 8, speed: 5.5,
    light: [-0.42, 0.34, 0.84],
    ambient: 0.10, terminator: [-0.30, 0.80], limb: 0.22,
    atmosphere: { color: [150, 186, 255], strength: 0.34, power: 3.6, haze: 0.2 },
    onInteract: () => fig && fig.classList.add('has-interacted')
  });
}

// ---------- Live sol counter ----------
// Exposes pause/resume via the returned handle so the router can stop the
// 30s timer while the Mars section is hidden.
let solIntervalId = null;
function initSolCounter() {
  const el = document.getElementById('sol-counter');
  if (!el) return;
  const solLenMs = 88775244; // 24h39m35s in ms
  const epoch = Date.UTC(2026, 0, 1);
  function tick() {
    const solNum = Math.floor((Date.now() - epoch) / solLenMs) + 4930;
    el.textContent = 'SOL ' + solNum.toLocaleString();
  }
  tick();
  solIntervalId = setInterval(tick, 30000);
}
export function pauseMarsTimers() {
  if (solIntervalId) { clearInterval(solIntervalId); solIntervalId = null; }
}
export function resumeMarsTimers() {
  if (!solIntervalId) initSolCounter();
}

// ---------- Mindmap ----------
function initMindmap() {
  const svg = document.getElementById('mindmap-svg');
  const panel = document.getElementById('mm-panel');
  if (!svg || !panel) return;
  const cx = 450, cy = 230;
  const nodes = [
    { id: 'env', label: 'Environment', angle: -90, r: 46, info: "Half of Earth's size, atmosphere under 1% as thick, temperatures from 70°F down to -225°F, and global dust storms that can blanket the whole planet for weeks." },
    { id: 'bio', label: 'Biosignatures', angle: -18, r: 44, info: 'Perseverance found macromolecular carbon and "leopard spot" reaction patterns in Jezero Crater; Curiosity found 21 organic molecules in Gale Crater, including an RNA/DNA precursor structure.' },
    { id: 'armada', label: 'Robotic Armada', angle: 54, r: 46, info: "Five separate missions — China's Tianwen-3, ESA/NASA's Rosalind Franklin, ISRO's Mangalyaan-2, NASA's ESCAPADE, and JAXA's MMX — are all active between 2026 and 2031." },
    { id: 'shield', label: 'Radiation Shielding', angle: 126, r: 48, info: "A 3-year mission delivers ~1000 mSv of radiation, well past NASA's 600 mSv career limit. But localized \"crustal\" magnetic fields in Mars' southern hemisphere can deflect protons, cutting exposure to ~350 mSv in shielded zones." },
    { id: 'commercial', label: 'Commercial 2030s', angle: 198, r: 44, info: 'SpaceX is prioritizing in-orbit refueling and Artemis lunar landings first. Early uncrewed Starship flights to Mars would carry humanoid robots to check landing sites and subsurface ice before any crew arrives.' },
    { id: 'race', label: 'International Race', angle: 270, r: 44, info: "After NASA's own $11B Sample Return plan was paused, China's Tianwen-3 became the frontrunner to bring back the first Mars samples — targeting a 2031 return, possibly ahead of the US." }
  ];
  let lines = '', nodesHtml = '';
  nodes.forEach(n => {
    const rad = n.angle * Math.PI / 180;
    const dist = 175;
    n.x = cx + dist * Math.cos(rad);
    n.y = cy + dist * Math.sin(rad);
    lines += `<line class="mm-line" x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}"></line>`;
  });
  let html = `<g>${lines}</g>`;
  html += `<circle cx="${cx}" cy="${cy}" r="54" fill="#C1440E"></circle>`;
  html += `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="#0F0906">MARS</text>`;
  nodes.forEach(n => {
    html += `<g class="mm-node" data-id="${n.id}" transform="translate(${n.x},${n.y})">
      <circle r="${n.r}" fill="#241209" stroke="#8A6E56" stroke-width="1"></circle>
      <text text-anchor="middle" dy="5" font-size="13">${wrapLabel(n.label)}</text>
    </g>`;
  });
  svg.innerHTML = html;

  function wrapLabel(label) {
    const words = label.split(' ');
    if (words.length === 1) return `<tspan x="0" dy="0">${label}</tspan>`;
    let mid = Math.ceil(words.length / 2);
    let l1 = words.slice(0, mid).join(' '), l2 = words.slice(mid).join(' ');
    return `<tspan x="0" dy="-6">${l1}</tspan><tspan x="0" dy="16">${l2}</tspan>`;
  }

  svg.querySelectorAll('.mm-node').forEach(g => {
    g.addEventListener('click', () => {
      svg.querySelectorAll('.mm-node').forEach(o => o.classList.remove('active'));
      g.classList.add('active');
      const n = nodes.find(x => x.id === g.dataset.id);
      panel.innerHTML = `<h4>${n.label}</h4><p>${n.info}</p>`;
    });
  });
}

// ---------- Podcast player ----------
function initPodcast() {
  const audio = document.getElementById('podcast-audio');
  const btn = document.getElementById('pod-play');
  const icon = document.getElementById('pod-play-icon');
  const fill = document.getElementById('pod-fill');
  const track = document.getElementById('pod-track');
  const timeLab = document.getElementById('pod-time');
  if (!audio || !btn) return;
  const playPath = 'M8 5v14l11-7L8 5z';
  const pausePath = 'M7 5h4v14H7zM13 5h4v14h-4z';
  function fmt(s) { if (!isFinite(s)) return '0:00'; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return m + ':' + String(sec).padStart(2, '0'); }
  btn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); icon.innerHTML = `<path d="${pausePath}"/>`; }
    else { audio.pause(); icon.innerHTML = `<path d="${playPath}"/>`; }
  });
  audio.addEventListener('timeupdate', () => {
    const pct = (audio.currentTime / audio.duration) * 100 || 0;
    fill.style.width = pct + '%';
    timeLab.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration || 1261);
  });
  audio.addEventListener('ended', () => { icon.innerHTML = `<path d="${playPath}"/>`; });
  track.addEventListener('click', (e) => {
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (isFinite(audio.duration)) audio.currentTime = pct * audio.duration;
  });
}

// ---------- Fact Roulette ----------
function initRoulette() {
  const facts = MARS_FACTS;
  let deck = [];
  let revealed = 0;
  const deckEl = document.getElementById('deck');
  const progressEl = document.getElementById('roulette-progress');
  const spinBtn = document.getElementById('spin-btn');
  if (!deckEl || !spinBtn) return;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function resetDeck() { deck = shuffle(facts); revealed = 0; updateProgress(); renderEmpty(); }
  function updateProgress() { progressEl.innerHTML = 'Facts logged: <b>' + revealed + '</b> / ' + facts.length; }
  function renderEmpty() {
    deckEl.innerHTML = '<div class="fact-card"><p class="deck-empty-state">Tap "Spin for a fact" to begin.</p></div>';
  }
  function renderCard(text, idx) {
    deckEl.innerHTML = `<div class="fact-card" style="transform:rotateY(90deg); opacity:0;">
        <span class="fact-idx">FACT ${idx} / ${facts.length}</span>
        <p>${text}</p>
      </div>`;
    const card = deckEl.querySelector('.fact-card');
    requestAnimationFrame(() => {
      card.style.transform = 'rotateY(0deg)';
      card.style.opacity = '1';
    });
  }
  spinBtn.addEventListener('click', () => {
    if (deck.length === 0) {
      if (revealed >= facts.length) { resetDeck(); }
      renderEmpty();
      return;
    }
    const fact = deck.pop();
    revealed++;
    renderCard(fact, revealed);
    updateProgress();
    if (deck.length === 0) {
      spinBtn.textContent = 'All facts revealed — spin to reshuffle';
    } else {
      spinBtn.textContent = 'Spin for a fact';
    }
  });
  resetDeck();
}
