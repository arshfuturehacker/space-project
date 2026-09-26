// app.js — entry point. Imports every feature module and starts them.
// Loaded as <script type="module" src="Main.js/app.js"> from index.html.

import { initFacts } from './facts.js';
import { initISSTracker } from './iss-tracker.js';
import { initSearch } from './search.js';
import { initCountdown } from './countdown.js';
import { initGallery } from './gallery.js';
import { initStarfield, initHeroPlanet } from './starfield.js';
import { initMars, pauseMarsTimers, resumeMarsTimers } from './mars.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  // Space page features — all run once on load, same as before the refactor.
  initFacts();
  initISSTracker();
  initSearch();
  const countdownHandle = initCountdown();
  initGallery();
  initStarfield();
  initHeroPlanet();

  // Mars page features — built once on load too (Mars starts hidden;
  // building its DOM up front keeps the router's show/hide simple).
  initMars();

  // Hand the countdown's and sol counter's timers to the router so whichever
  // page is NOT visible stops ticking in the background.
  initRouter({
    onHideSpace: () => countdownHandle && countdownHandle.pause(),
    onShowSpace: () => countdownHandle && countdownHandle.resume(),
    onHideMars: pauseMarsTimers,
    onShowMars: resumeMarsTimers
  });
});
