// iss-tracker.js — ISS Position Tracker
// Owns: fetching and displaying live ISS telemetry from the external API.

const API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

export function initISSTracker() {
  const els = {
    latitude: document.getElementById('latitude'),
    longitude: document.getElementById('longitude'),
    altitude: document.getElementById('altitude'),
    velocity: document.getElementById('velocity'),
    status: document.getElementById('status'),
    updated: document.getElementById('updated'),
    btn: document.getElementById('refreshBtn')
  };
  if (Object.values(els).some((node) => !node)) return;

  function setStatus(msg, isError) {
    els.status.textContent = msg;
    els.status.classList.toggle('error', Boolean(isError));
  }

  async function fetchISS() {
    els.btn.disabled = true;
    setStatus('Loading latest position…');
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();

      els.latitude.textContent = Number(data.latitude).toFixed(4) + '°';
      els.longitude.textContent = Number(data.longitude).toFixed(4) + '°';
      els.altitude.textContent = Number(data.altitude).toFixed(1);
      els.velocity.textContent = Number(data.velocity).toFixed(0);
      setStatus('Telemetry received.');
      els.updated.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
    } catch (err) {
      setStatus('Could not load ISS data. Check your connection and try again.', true);
      console.error('ISS fetch failed:', err);
    } finally {
      els.btn.disabled = false;
    }
  }

  els.btn.addEventListener('click', fetchISS);
  fetchISS();
}
