// router.js — switches between the Space section and the Mars section of
// this single-page index.html. Necessary because the two pages were merged
// into one document; without this there would be no way to move between them.

export function initRouter({ onShowSpace, onHideSpace, onShowMars, onHideMars } = {}) {
  const spacePage = document.getElementById('space-page');
  const marsPage = document.getElementById('mars-page');
  if (!spacePage || !marsPage) return;

  function showPage(name) {
    const showingMars = name === 'mars';
    spacePage.hidden = showingMars;
    marsPage.hidden = !showingMars;
    document.body.dataset.activePage = name;

    if (showingMars) {
      if (onHideSpace) onHideSpace();
      if (onShowMars) onShowMars();
    } else {
      if (onHideMars) onHideMars();
      if (onShowSpace) onShowSpace();
    }
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-page-link]');
    if (!link) return;
    event.preventDefault();
    const target = link.getAttribute('data-page-link');
    location.hash = target === 'mars' ? '#mars' : '#top';
    showPage(target);
  });

  window.addEventListener('hashchange', () => {
    showPage(location.hash === '#mars' ? 'mars' : 'space');
  });

  // Initial page from the URL hash (e.g. a bookmarked #mars link).
  showPage(location.hash === '#mars' ? 'mars' : 'space');
}
