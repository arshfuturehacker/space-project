// facts.js — Space Fact Generator
// Owns: the fact text data AND the logic that displays it (kept together,
// per project decision, rather than split into a separate data file).

const API_URL = 'http://localhost:3000/api/facts';

const FALLBACK_FACTS = [
  "A day on Venus is longer than its year — it takes 243 Earth days to rotate once, but only 225 to orbit the Sun.",
  "Neutron stars are so dense that a single teaspoon of their material would weigh about a billion tons.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 350 years and is larger than Earth.",
  "Space is completely silent because there's no atmosphere to carry sound waves.",
  "The footprints left by astronauts on the Moon will likely stay there for millions of years since there's no wind or water to erode them.",
  "One million Earths could fit inside the Sun.",
  "Saturn could float in water because it's mostly made of gas and is less dense than water.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, expected to merge in about 4.5 billion years.",
  "A full NASA space suit costs about $12 million, most of which goes into the backpack and control module.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "There is a giant storm on Jupiter called the Great Red Spot that could fit two to three Earths inside it.",
  "Black holes can slow down time in their vicinity due to their immense gravity, an effect called time dilation.",
  "The largest known star, UY Scuti, is so big that it would take a passenger jet around 1,100 years to fly around it once.",
  "Mars has the largest volcano in the solar system, Olympus Mons, which is about three times the height of Mount Everest."
];

export function initFacts() {
  const factBox = document.getElementById('factBox');
  const counter = document.getElementById('counter');
  const button = document.getElementById('factBtn');
  if (!factBox || !counter || !button) return;

  let facts = [];
  let lastIndex = -1;
  let count = 0;

  function showNextFact() {
    if (!facts.length) return;
    let index;
    do {
      index = Math.floor(Math.random() * facts.length);
    } while (index === lastIndex && facts.length > 1);
    lastIndex = index;
    count += 1;

    factBox.classList.add('is-changing');
    window.setTimeout(function () {
      factBox.textContent = facts[index];
      factBox.classList.remove('is-changing');
    }, 170);

    counter.textContent = `Facts seen: ${count}`;
  }

  button.disabled = true;
  factBox.textContent = 'Loading facts…';

  fetch(API_URL)
    .then(function (response) {
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      return response.json();
    })
    .then(function (data) {
      facts = data;
      if (!facts.length) throw new Error('No facts returned');
      factBox.textContent = 'Press the button for a space fact.';
      button.disabled = false;
    })
    .catch(function (err) {
      console.error('Failed to load facts from API:', err);
      facts = FALLBACK_FACTS;
      factBox.textContent = 'Press the button for a space fact. (offline data)';
      button.disabled = false;
    });

  button.addEventListener('click', showNextFact);
}
