// search.js — Space Object & Mission Search
// Owns: the search archive data AND the search logic (kept together).

const DATABASE = [
    { name: "Mercury", category: "Planet", info: [
      "The smallest planet in the solar system and the closest to the Sun.",
      "It has virtually no atmosphere, so temperatures swing wildly between about 430°C in daylight and -180°C at night."
    ]},
    { name: "Venus", category: "Planet", info: [
      "The second planet from the Sun, similar in size to Earth but with a thick, toxic atmosphere of carbon dioxide.",
      "It is the hottest planet in the solar system, with surface temperatures around 465°C due to a runaway greenhouse effect."
    ]},
    { name: "Earth", category: "Planet", info: [
      "The third planet from the Sun and the only known place in the universe confirmed to host life.",
      "About 71% of its surface is covered in water, and it has one natural satellite, the Moon."
    ]},
    { name: "Mars", category: "Planet", info: [
      "The fourth planet from the Sun, known as the 'Red Planet' due to iron oxide on its surface.",
      "Home to Olympus Mons, the largest volcano in the solar system, and has two small moons: Phobos and Deimos."
    ]},
    { name: "Jupiter", category: "Planet", info: [
      "The largest planet in the solar system, a gas giant more than twice as massive as all other planets combined.",
      "Famous for the Great Red Spot, a giant storm that has raged for centuries, and has at least 95 known moons."
    ]},
    { name: "Saturn", category: "Planet", info: [
      "The sixth planet from the Sun, best known for its spectacular ring system made mostly of ice and rock.",
      "It is the least dense planet in the solar system and would theoretically float in water."
    ]},
    { name: "Uranus", category: "Planet", info: [
      "An ice giant that rotates on its side, with an axial tilt of about 98 degrees.",
      "It has a pale blue-green color due to methane in its atmosphere and is orbited by 27 known moons."
    ]},
    { name: "Neptune", category: "Planet", info: [
      "The farthest known planet from the Sun and the windiest, with storms reaching over 2,000 km/h.",
      "It was the first planet located through mathematical prediction rather than direct observation."
    ]},
    { name: "Moon", category: "Moon", info: [
      "Earth's only natural satellite and the fifth-largest moon in the solar system.",
      "Its gravity drives ocean tides on Earth, and its surface is covered in craters, plains, and dust called regolith."
    ]},
    { name: "Europa", category: "Moon", info: [
      "One of Jupiter's largest moons, covered in a thick shell of ice.",
      "Scientists believe a liquid water ocean lies beneath its surface, making it a key target in the search for extraterrestrial life."
    ]},
    { name: "Ganymede", category: "Moon", info: [
      "The largest moon in the solar system, bigger than the planet Mercury.",
      "It is the only moon known to generate its own magnetic field."
    ]},
    { name: "Callisto", category: "Moon", info: [
      "One of Jupiter's four largest moons, with a surface heavily covered in impact craters.",
      "It is thought to have a subsurface ocean and is one of the most heavily cratered objects in the solar system."
    ]},
    { name: "Io", category: "Moon", info: [
      "The most volcanically active body in the solar system, with hundreds of erupting volcanoes.",
      "Its intense volcanic activity is caused by tidal heating from Jupiter's powerful gravity."
    ]},
    { name: "Titan", category: "Moon", info: [
      "Saturn's largest moon and the second-largest moon in the solar system.",
      "The only moon known to have a dense atmosphere, along with lakes and rivers of liquid methane and ethane."
    ]},
    { name: "Enceladus", category: "Moon", info: [
      "A small, icy moon of Saturn with a subsurface ocean of liquid water.",
      "It shoots plumes of water vapor and ice into space from cracks near its south pole, detected by the Cassini spacecraft."
    ]},
    { name: "Triton", category: "Moon", info: [
      "Neptune's largest moon, notable for orbiting in the opposite direction of the planet's rotation.",
      "It is one of the coldest objects in the solar system and has active geysers of nitrogen gas."
    ]},
    { name: "Phobos", category: "Moon", info: [
      "The larger and closer of Mars' two small moons.",
      "It orbits so close to Mars that it is slowly spiraling inward and may eventually break apart or crash into the planet."
    ]},
    { name: "Deimos", category: "Moon", info: [
      "The smaller and more distant of Mars' two moons.",
      "It is thought to be a captured asteroid, with an irregular, potato-like shape."
    ]},
    { name: "Charon", category: "Moon", info: [
      "The largest moon of the dwarf planet Pluto, about half Pluto's diameter.",
      "Pluto and Charon are so similar in size that they orbit a shared center of gravity located outside Pluto itself."
    ]},
    { name: "Voyager 1", category: "Spacecraft", info: [
      "A NASA space probe launched in 1977 to study the outer planets.",
      "It is now the most distant human-made object from Earth and the first to enter interstellar space, in 2012."
    ]},
    { name: "Voyager 2", category: "Spacecraft", info: [
      "Launched in 1977 alongside Voyager 1, it is the only spacecraft to have visited all four outer planets: Jupiter, Saturn, Uranus, and Neptune.",
      "It entered interstellar space in 2018, becoming the second human-made object to do so."
    ]},
    { name: "Cassini", category: "Spacecraft", info: [
      "A NASA/ESA/ASI spacecraft that studied Saturn and its moons from 2004 to 2017.",
      "It discovered geysers on Enceladus and ended its mission with a deliberate dive into Saturn's atmosphere."
    ]},
    { name: "Juno", category: "Spacecraft", info: [
      "A NASA probe that has been orbiting Jupiter since 2016 to study its composition and magnetic field.",
      "It is the first solar-powered spacecraft to operate at such a great distance from the Sun."
    ]},
    { name: "New Horizons", category: "Spacecraft", info: [
      "A NASA spacecraft launched in 2006 that performed the first-ever flyby of Pluto in 2015.",
      "It later flew past the Kuiper Belt object Arrokoth in 2019, the most distant object ever explored up close."
    ]},
    { name: "Parker Solar Probe", category: "Spacecraft", info: [
      "A NASA mission launched in 2018 to study the Sun's outer corona up close.",
      "It is the fastest human-made object ever built, and has flown closer to the Sun than any spacecraft in history."
    ]},
    { name: "James Webb Space Telescope", category: "Spacecraft", info: [
      "Launched in December 2021, it is the largest and most powerful space telescope ever built.",
      "It observes primarily in infrared light, allowing it to study the earliest galaxies and peer through dust clouds where stars form."
    ]},
    { name: "Hubble Space Telescope", category: "Spacecraft", info: [
      "Launched in 1990, it orbits Earth and captures high-resolution images of deep space.",
      "It has operated for over three decades and has contributed to major discoveries about the age and expansion of the universe."
    ]},
    { name: "Galileo", category: "Spacecraft", info: [
      "A NASA spacecraft that orbited Jupiter and studied its moons from 1995 to 2003.",
      "It dropped a probe into Jupiter's atmosphere and provided detailed data on Europa, Io, Ganymede, and Callisto."
    ]},
    { name: "Magellan", category: "Spacecraft", info: [
      "A NASA spacecraft that mapped the surface of Venus using radar from 1990 to 1994.",
      "It produced the most detailed maps of Venus's surface at the time, revealing volcanic plains and mountains hidden beneath thick clouds."
    ]},
    { name: "Apollo 11", category: "Space Mission", info: [
      "The NASA mission that achieved the first crewed Moon landing on July 20, 1969.",
      "Astronauts Neil Armstrong and Buzz Aldrin walked on the lunar surface while Michael Collins orbited above in the command module."
    ]},
    { name: "Apollo 8", category: "Space Mission", info: [
      "The first crewed spacecraft to leave Earth's orbit and travel to the Moon, in December 1968.",
      "Its crew became the first humans to see the far side of the Moon and to witness Earthrise firsthand."
    ]},
    { name: "Artemis I", category: "Space Mission", info: [
      "An uncrewed NASA mission launched in 2022 to test the Orion spacecraft and Space Launch System rocket.",
      "It flew around the Moon and back as a precursor to future crewed Artemis missions."
    ]},
    { name: "Artemis II", category: "Space Mission", info: [
      "A planned NASA mission that will carry astronauts on a flight around the Moon without landing.",
      "It is intended as the first crewed test of the Orion spacecraft, paving the way for a crewed lunar landing under the Artemis program."
    ]},
    { name: "Chandrayaan-1", category: "Space Mission", info: [
      "India's first lunar probe, launched by ISRO in 2008.",
      "It helped confirm the presence of water molecules on the Moon's surface."
    ]},
    { name: "Chandrayaan-2", category: "Space Mission", info: [
      "India's second lunar mission, launched in 2019, consisting of an orbiter, lander, and rover.",
      "Its lander, Vikram, crashed during descent, though the orbiter continued to operate successfully."
    ]},
    { name: "Chandrayaan-3", category: "Space Mission", info: [
      "India's third lunar mission, which successfully landed near the Moon's south pole in August 2023.",
      "It made India the fourth country to achieve a soft Moon landing and the first to land near the lunar south pole."
    ]},
    { name: "Mangalyaan", category: "Space Mission", info: [
      "Also known as the Mars Orbiter Mission, launched by ISRO in 2013.",
      "It made India the first Asian nation to reach Mars orbit and did so on its very first attempt."
    ]},
    { name: "Aditya-L1", category: "Space Mission", info: [
      "India's first dedicated mission to study the Sun, launched by ISRO in 2023.",
      "It orbits the Sun-Earth Lagrange point L1, allowing continuous observation of the Sun's corona and solar activity."
    ]},
    { name: "Mars Pathfinder", category: "Space Mission", info: [
      "A NASA mission that landed on Mars in 1997, delivering the small rover Sojourner.",
      "It was the first mission to successfully deploy a wheeled rover on another planet."
    ]},
    { name: "Mars Reconnaissance Orbiter", category: "Spacecraft", info: [
      "A NASA spacecraft that has been orbiting Mars since 2006, studying its climate and surface.",
      "It carries powerful cameras that have captured extremely detailed images of the Martian surface and helps relay data from Mars rovers to Earth."
    ]},
    { name: "Curiosity", category: "Mars Rover", info: [
      "A car-sized NASA rover that has been exploring Mars' Gale Crater since landing in 2012.",
      "Its mission is to study Mars' climate and geology and assess whether the area ever supported microbial life."
    ]},
    { name: "Perseverance", category: "Mars Rover", info: [
      "A NASA rover that landed on Mars in 2021 to search for signs of ancient microbial life.",
      "It is collecting rock and soil samples for a future mission to return them to Earth, and carried the Ingenuity helicopter."
    ]},
    { name: "Spirit", category: "Mars Rover", info: [
      "A NASA rover that landed on Mars in 2004 as part of the Mars Exploration Rover mission.",
      "It operated for over six years, far beyond its planned 90-day mission, before becoming stuck in soft soil."
    ]},
    { name: "Opportunity", category: "Mars Rover", info: [
      "Spirit's twin rover, which landed on Mars in 2004 and operated for nearly 15 years.",
      "It traveled more than 45 kilometers on the Martian surface, far exceeding its original 90-day mission goal."
    ]},
    { name: "Rosetta", category: "Spacecraft", info: [
      "An ESA spacecraft that orbited comet 67P/Churyumov-Gerasimenko starting in 2014.",
      "It deployed the Philae lander, which achieved the first-ever soft landing on a comet's surface."
    ]},
    { name: "OSIRIS-REx", category: "Spacecraft", info: [
      "A NASA spacecraft that collected a sample from the asteroid Bennu.",
      "It returned the sample capsule to Earth in 2023, delivering the largest asteroid sample ever brought back."
    ]},
    { name: "Hayabusa", category: "Spacecraft", info: [
      "A Japanese spacecraft (JAXA) that returned samples from the asteroid Itokawa in 2010.",
      "It was the first mission to successfully bring back samples from an asteroid's surface."
    ]},
    { name: "BepiColombo", category: "Space Mission", info: [
      "A joint ESA/JAXA mission launched in 2018 to study Mercury.",
      "It uses two orbiters to examine Mercury's surface, interior, and magnetic field, arriving in orbit in the late 2020s."
    ]},
    { name: "Kepler", category: "Space Telescope", info: [
      "A NASA space telescope launched in 2009 to search for Earth-like exoplanets.",
      "It discovered thousands of confirmed exoplanets by detecting tiny dips in starlight as planets passed in front of their stars."
    ]},
    { name: "SOHO", category: "Spacecraft", info: [
      "The Solar and Heliospheric Observatory, a joint NASA/ESA mission launched in 1995 to study the Sun.",
      "It has operated for decades and discovered thousands of comets in addition to monitoring solar activity."
    ]}
  ];


export function initSearch() {
  const database = DATABASE;
  const form = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const resultBox = document.getElementById('result');
  if (!form || !searchInput || !resultBox) return;

  function normalize(str) { return str.trim().toLowerCase(); }
  function renderPlaceholder() { resultBox.innerHTML = '<div class="placeholder">Type a name above and press Search.</div>'; }
  function renderNotFound() { resultBox.innerHTML = '<div class="not-found">No result found. Try an exact name from the archive.</div>'; }

  function renderResult(item) {
    const listItems = item.info.map((line) => `<li>${line}</li>`).join('');
    const categoryTag = item.category ? `<div class="category-tag">${item.category}</div>` : '';
    resultBox.innerHTML = `<h2>${item.name}</h2>${categoryTag}<ul>${listItems}</ul>`;
  }

  function performSearch() {
    const query = normalize(searchInput.value);
    if (!query) { renderPlaceholder(); return; }
    const match = database.find((item) => normalize(item.name) === query);
    if (match) renderResult(match); else renderNotFound();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    performSearch();
  });
}
