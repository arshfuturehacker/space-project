// countdown.js — Mission Launch Countdown
// Exposes pause/resume so the router can stop the 1s timer while this
// page's section is hidden (no point ticking a display nobody can see).

const LAUNCH_DATE = new Date('2026-12-25T09:00:00Z');

export function initCountdown() {
  const els = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    status: document.getElementById('countdownStatus'),
    timerDisplay: document.getElementById('timerDisplay'),
    targetDateLabel: document.getElementById('targetDateLabel'),
    rocket: document.getElementById('rocket')
  };
  if (Object.values(els).some((node) => !node)) return { pause() {}, resume() {} };

  function pad(n) { return String(n).padStart(2, '0'); }
  els.targetDateLabel.textContent = 'Scheduled Departure: ' + LAUNCH_DATE.toUTCString();

  let launched = false;
  let intervalId = null;

  function tick() {
    const diff = LAUNCH_DATE.getTime() - Date.now();
    if (diff <= 0) {
      if (!launched) {
        launched = true;
        clearInterval(intervalId);
        intervalId = null;
        els.timerDisplay.innerHTML = '<div class="launch-text">LAUNCH!</div>';
        els.status.textContent = 'Mission clock reached zero.';
        els.rocket.classList.add('launched');
      }
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
    els.status.textContent = 'Standby — countdown in progress…';
  }

  function start() {
    if (intervalId || launched) return;
    tick();
    intervalId = setInterval(tick, 1000);
  }
  function pause() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  start();
  return { pause, resume: start };
}
