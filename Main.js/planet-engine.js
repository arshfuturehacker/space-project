/* Deep Space Observatory — interactive planet
 * ---------------------------------------------------------------------------
 * A tiny software renderer: an equirectangular surface map wrapped on a lit
 * sphere, drawn to a 2D canvas.
 *
 *  - No WebGL, three.js or network needed.
 *  - Textures are embedded as data: URIs, so it also works when index.html is
 *    opened straight from disk (file://), where browsers block canvas/WebGL
 *    reads of ordinary local images.
 *
 * Usage:
 *   DSPlanet.create({ container: el, texture: dataUri, roll: 12, ... })
 *
 * Interaction:  drag = spin (mouse drag up/down also tilts the axis),
 *               click / tap = extra spin,  arrow keys when focused.
 */
(function (global) {
  'use strict';

  var PI = Math.PI, TAU = PI * 2, D2R = PI / 180;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  var DEFAULTS = {
    roll: 0,                 // deg, fixed lean of the spin axis on screen (+ = clockwise)
    pitch: 0,                // deg, starting tilt (+ = north pole toward the viewer)
    pitchLimit: 26,          // deg, how far a drag may tilt the axis
    speed: 5,                // deg/s, gentle auto-rotation
    light: [-0.5, 0.38, 0.78],
    ambient: 0.10,
    terminator: [-0.25, 0.85], // smoothstep range of (normal · light)
    limb: 0.25,              // limb darkening
    atmosphere: { color: [140, 180, 255], strength: 0.5, power: 3.2, haze: 0.25 },
    specular: 0,             // ocean glint strength (0 = off)
    shininess: 40,
    maxRes: 640,             // cap on internal canvas size (px)
    label: 'Interactive planet',
    onInteract: null,
    onFail: null
  };

  function merge(base, over) {
    var o = {}, k;
    for (k in base) o[k] = base[k];
    for (k in over) o[k] = over[k];
    o.atmosphere = {};
    for (k in base.atmosphere) o.atmosphere[k] = base.atmosphere[k];
    if (over.atmosphere) for (k in over.atmosphere) o.atmosphere[k] = over.atmosphere[k];
    return o;
  }

  function create(options) {
    var host = options && options.container;
    if (!host || !options.texture) return null;
    var cfg = merge(DEFAULTS, options);
    var reduced = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------- DOM ---------- */
    var canvas = document.createElement('canvas');
    canvas.className = 'planet-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;' +
      'border-radius:50%;opacity:0;transition:opacity 1.2s ease;pointer-events:none;';
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    host.style.touchAction = 'pan-y';        // vertical swipes still scroll the page
    host.style.userSelect = 'none';
    host.style.webkitUserSelect = 'none';
    host.style.cursor = 'grab';
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', cfg.label + ' \u2014 drag to rotate, or use the arrow keys');
    if (!host.hasAttribute('tabindex')) host.tabIndex = 0;
    host.appendChild(canvas);

    /* ---------- state ---------- */
    var TW = 0, TH = 0, tex = null, ready = false, failed = false;
    var N = 0, R = 0, cssR = 150, count = 0;
    var out, nx, ny, nz, shade, haze, add, spec, alpha;   // tables that depend on size/light
    var ub, r0, r1, wy;                                   // tables that depend on pitch/roll
    var imageData = null, data = null;

    var roll = cfg.roll * D2R;
    var pitch = cfg.pitch * D2R, pitchBuilt = NaN, pitchMax = cfg.pitchLimit * D2R;
    var spin = 0, spinRendered = NaN;   // radians: planet longitude at the disc centre
    var vel = 0;                         // radians / second
    var dirtyA = true, shown = false, interactedOnce = false;
    var running = false, visible = true, raf = 0, last = 0;

    var lightN = (function () {
      var l = cfg.light, m = Math.sqrt(l[0] * l[0] + l[1] * l[1] + l[2] * l[2]) || 1;
      return [l[0] / m, l[1] / m, l[2] / m];
    })();

    /* ---------- tables that depend only on canvas size + lighting ---------- */
    function buildA() {
      var css = host.clientWidth || 300;
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      N = Math.max(64, Math.min(cfg.maxRes, Math.round(css * dpr)));
      canvas.width = N; canvas.height = N;
      R = N / 2; cssR = css / 2;
      imageData = ctx.createImageData(N, N); data = imageData.data;

      var cap = Math.ceil(PI * (R + 2) * (R + 2));
      out = new Int32Array(cap);
      nx = new Float32Array(cap); ny = new Float32Array(cap); nz = new Float32Array(cap);
      shade = new Float32Array(cap); haze = new Float32Array(cap); add = new Float32Array(cap);
      spec = new Float32Array(cap); alpha = new Uint8Array(cap);
      ub = new Float32Array(cap); wy = new Float32Array(cap);
      r0 = new Int32Array(cap); r1 = new Int32Array(cap);

      var Lx = lightN[0], Ly = lightN[1], Lz = lightN[2];
      var hx = Lx, hy = Ly, hz = Lz + 1, hm = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
      hx /= hm; hy /= hm; hz /= hm;
      var amb = cfg.ambient, t0 = cfg.terminator[0], t1 = cfg.terminator[1], atm = cfg.atmosphere;

      var k = 0;
      for (var y = 0; y < N; y++) {
        var dy = -((y + 0.5) - R) / R;
        for (var x = 0; x < N; x++) {
          var dx = ((x + 0.5) - R) / R;
          var d = Math.sqrt(dx * dx + dy * dy);
          var cov = clamp((1 - d) * R + 0.5, 0, 1);          // 1px anti-aliased rim
          if (cov <= 0) continue;
          var dd = d > 0.9995 ? 0.9995 : d;
          var sc = d > 0 ? dd / d : 0;
          var px = dx * sc, py = dy * sc, pz = Math.sqrt(1 - dd * dd);

          var ndl = px * Lx + py * Ly + pz * Lz;
          var lit = smooth(t0, t1, ndl);
          shade[k] = (amb + (1 - amb) * lit) * (1 - cfg.limb * (1 - pz));
          var rim = Math.pow(1 - pz, atm.power);
          add[k] = rim * atm.strength * (0.25 + 0.75 * lit);
          haze[k] = Math.min(0.7, rim * atm.haze * 2);
          spec[k] = cfg.specular > 0
            ? Math.pow(Math.max(0, px * hx + py * hy + pz * hz), cfg.shininess) * lit * cfg.specular : 0;
          alpha[k] = (cov * 255 + 0.5) | 0;
          out[k] = (y * N + x) * 4;
          nx[k] = px; ny[k] = py; nz[k] = pz;
          k++;
        }
      }
      count = k;
      pitchBuilt = NaN;          // force table B rebuild
      spinRendered = NaN;
    }

    /* ---------- tables that depend on axis tilt (pitch / roll) ---------- */
    function buildB() {
      var cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
      var rowBytes = TW * 4;
      for (var k = 0; k < count; k++) {
        var x1 = nx[k] * cr - ny[k] * sr;
        var y1 = nx[k] * sr + ny[k] * cr;
        var y2 = y1 * cp + nz[k] * sp;
        var z2 = -y1 * sp + nz[k] * cp;
        var lat = Math.asin(y2 > 1 ? 1 : y2 < -1 ? -1 : y2);
        var lon = Math.atan2(x1, z2);
        ub[k] = (lon / TAU + 0.5) * TW - 0.5;
        var fy = (0.5 - lat / PI) * TH - 0.5;
        var yy0 = Math.floor(fy), w = fy - yy0;
        if (yy0 < 0) { yy0 = 0; w = 0; } else if (yy0 >= TH - 1) { yy0 = TH - 1; w = 0; }
        r0[k] = yy0 * rowBytes;
        r1[k] = (yy0 + 1 < TH ? yy0 + 1 : yy0) * rowBytes;
        wy[k] = w;
      }
      pitchBuilt = pitch;
      spinRendered = NaN;
    }

    /* ---------- per-frame shading ---------- */
    function render() {
      var T = tex, W = TW;
      var shiftT = (((spin / TAU) % 1) + 1) % 1 * W;
      var col = cfg.atmosphere.color, ar = col[0], ag = col[1], ab = col[2];
      var glossy = cfg.specular > 0;

      for (var k = 0; k < count; k++) {
        var x = ub[k] + shiftT;
        if (x >= W) x -= W; else if (x < 0) x += W;
        var x0 = x | 0, fx = x - x0, gx = 1 - fx;
        var x1 = x0 + 1 === W ? 0 : x0 + 1;
        var a = r0[k], b = r1[k], wv = wy[k];
        var i00 = a + (x0 << 2), i10 = a + (x1 << 2), i01 = b + (x0 << 2), i11 = b + (x1 << 2);

        var tr = T[i00] * gx + T[i10] * fx, br = T[i01] * gx + T[i11] * fx, cr_ = tr + (br - tr) * wv;
        tr = T[i00 + 1] * gx + T[i10 + 1] * fx; br = T[i01 + 1] * gx + T[i11 + 1] * fx; var cg = tr + (br - tr) * wv;
        tr = T[i00 + 2] * gx + T[i10 + 2] * fx; br = T[i01 + 2] * gx + T[i11 + 2] * fx; var cb = tr + (br - tr) * wv;

        var m = shade[k] * (1 - haze[k]), ad = add[k];
        var R_ = cr_ * m + ar * ad, G_ = cg * m + ag * ad, B_ = cb * m + ab * ad;

        if (glossy) {                                     // shiny where the map is blue (ocean), matte for cloud / land
          var gl = (cb - cr_ - 18) / 48; gl = gl < 0 ? 0 : gl > 1 ? 1 : gl;
          var s = spec[k] * gl * 255;
          R_ += s * 0.92; G_ += s; B_ += s;
        }

        var o = out[k];
        data[o] = R_; data[o + 1] = G_; data[o + 2] = B_; data[o + 3] = alpha[k];
      }
      ctx.putImageData(imageData, 0, 0);
      spinRendered = spin;
    }

    /* ---------- animation loop ---------- */
    function frame(now) {
      if (!running) return;
      raf = global.requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;

      if (!dragging) {
        // ease whatever velocity the user gave us back to the gentle idle spin
        var target = reduced ? 0 : -cfg.speed * D2R;
        vel += (target - vel) * (1 - Math.exp(-dt * 1.5));
        if (Math.abs(vel - target) < 1e-4) vel = target;
        spin += vel * dt;
      }
      if (!host.clientWidth) return;
      if (dirtyA) { buildA(); dirtyA = false; }
      if (pitch !== pitchBuilt) buildB();
      if (spin !== spinRendered) render();

      if (!shown) {
        shown = true;
        canvas.style.opacity = '1';
        host.classList.add('is-live');
      }
    }
    function start() {
      if (running || !ready || !visible) return;
      running = true; last = global.performance.now();
      raf = global.requestAnimationFrame(frame);
    }
    function stop() { running = false; global.cancelAnimationFrame(raf); }

    /* ---------- input ---------- */
    var dragging = false, moved = 0, lx = 0, ly = 0, lt = 0, lastMove = 0;

    function interacted() {
      if (interactedOnce) return;
      interactedOnce = true;
      host.classList.add('has-interacted');
      if (typeof cfg.onInteract === 'function') cfg.onInteract();
    }
    function onDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; lt = e.timeStamp; lastMove = 0; vel = 0;
      try { host.setPointerCapture(e.pointerId); } catch (_) {}
      host.style.cursor = 'grabbing';
      interacted();
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      var dt = Math.max(1, e.timeStamp - lt) / 1000;
      moved += Math.abs(dx) + Math.abs(dy);
      var dA = dx / cssR;                               // surface follows the pointer at the centre
      spin -= dA;
      vel = vel * 0.55 + (-dA / dt) * 0.45;
      if (e.pointerType === 'mouse' && dy) pitch = clamp(pitch + (dy / cssR) * 0.6, -pitchMax, pitchMax);
      lx = e.clientX; ly = e.clientY; lt = e.timeStamp; lastMove = e.timeStamp;
    }
    function onUp(e, cancelled) {
      if (!dragging) return;
      dragging = false;
      host.style.cursor = 'grab';
      try { host.releasePointerCapture(e.pointerId); } catch (_) {}
      if (e.timeStamp - lastMove > 90) vel = 0;         // paused before letting go: no fling
      if (!cancelled && moved < 5) vel -= 2.6;          // a plain click gives the planet a spin
      vel = clamp(vel, -14, 14);
    }
    function onKey(e) {
      var key = e.key;
      if (key === 'ArrowLeft') vel += 1.3;
      else if (key === 'ArrowRight') vel -= 1.3;
      else if (key === 'ArrowUp') pitch = clamp(pitch - 4 * D2R, -pitchMax, pitchMax);
      else if (key === 'ArrowDown') pitch = clamp(pitch + 4 * D2R, -pitchMax, pitchMax);
      else return;
      vel = clamp(vel, -14, 14);
      e.preventDefault(); interacted();
    }
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerup', function (e) { onUp(e, false); });
    host.addEventListener('pointercancel', function (e) { onUp(e, true); });
    host.addEventListener('keydown', onKey);

    /* ---------- size / visibility ---------- */
    var ro = null, io = null;
    if ('ResizeObserver' in global) {
      ro = new global.ResizeObserver(function () { dirtyA = true; });
      ro.observe(host);
    } else {
      global.addEventListener('resize', function () { dirtyA = true; });
    }
    if ('IntersectionObserver' in global) {
      io = new global.IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      });
      io.observe(host);
    }

    /* ---------- texture ---------- */
    function fail() {
      failed = true; stop();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (typeof cfg.onFail === 'function') cfg.onFail();
    }
    var img = new Image();
    img.onload = function () {
      try {
        var c = document.createElement('canvas');
        TW = c.width = img.naturalWidth; TH = c.height = img.naturalHeight;
        var cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
        tex = cx.getImageData(0, 0, TW, TH).data;
      } catch (err) { return fail(); }
      ready = true; start();
    };
    img.onerror = fail;
    img.src = cfg.texture;

    /* ---------- public API ---------- */
    return {
      canvas: canvas,
      setView: function (lonDeg, pitchDeg) {           // handy for screenshots / demos
        if (typeof lonDeg === 'number') { spin = lonDeg * D2R; vel = 0; }
        if (typeof pitchDeg === 'number') pitch = clamp(pitchDeg * D2R, -pitchMax, pitchMax);
      },
      destroy: function () {
        stop(); if (ro) ro.disconnect(); if (io) io.disconnect();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
      get failed() { return failed; }
    };
  }

  global.DSPlanet = { create: create };
})(window);
