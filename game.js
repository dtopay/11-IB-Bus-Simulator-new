'use strict';
/* =====================================================================
   SCHOOL BUS RACE — Anka Bilim Grand Prix
   ===================================================================== */
const $ = (id) => document.getElementById(id);

// ---------- small utilities ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const wrapA = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const lerpA = (a, b, t) => a + wrapA(b - a) * t;
const k1 = (rate, dt) => 1 - Math.exp(-rate * dt);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rnd = mulberry32(20260924);
const rr = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const fmt = (t) => { if (t == null || !isFinite(t)) return '—'; const m = Math.floor(t / 60); const s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); };
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(pointer: coarse)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('sbr.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sbr.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
const FONT_D = 'Saira, "Arial Narrow", "Segoe UI", sans-serif';
const FONT_H = '"Permanent Marker", "Segoe Print", "Comic Sans MS", cursive';
const FONT_U = '"Titillium Web", "Segoe UI", sans-serif';

// ---------- the six competitors (from the School Bus Race brief) ----------
const BUSES = [
  { id: 'transit', num: 1, brand: 'Ford', model: 'Transit', tag: 'Reliable. Always ahead.',
    desc: 'Widely used as a school bus because it is reliable, spacious and common on Turkish roads.',
    body: 0xf1f3f6, stripe: '#1d5fd6', stripe2: '#0b2f6b', hud: '#3b82ff', dark: false,
    stats: { speed: 7, accel: 7, handling: 8, weight: 6 },
    dim: { L: 6.6, W: 2.1, H: 2.72 }, prof: { hood: 0.85, hoodH: 1.2, ws: 0.95, noseR: 0.26 }, badge: 'ford' },
  { id: 'sprinter', num: 2, brand: 'Mercedes-Benz', model: 'Sprinter', tag: 'Comfort meets performance.',
    desc: 'Known for its durability, comfort and high performance.',
    body: 0x1d2025, stripe: '#00d2be', stripe2: '#aeb6bf', hud: '#00d2be', dark: true,
    stats: { speed: 9, accel: 7, handling: 6, weight: 6 },
    dim: { L: 7.0, W: 2.1, H: 2.86 }, prof: { hood: 1.05, hoodH: 1.14, ws: 1.05, noseR: 0.3 }, badge: 'mercedes' },
  { id: 'crafter', num: 3, brand: 'Volkswagen', model: 'Crafter', tag: 'Space for greater things.',
    desc: 'A popular choice for school transport with its large capacity and modern design.',
    body: 0xf4f6f8, stripe: '#1f4fd1', stripe2: '#79aaff', hud: '#6b9bff', dark: false,
    stats: { speed: 8, accel: 6, handling: 7, weight: 7 },
    dim: { L: 6.9, W: 2.12, H: 2.8 }, prof: { hood: 0.95, hoodH: 1.16, ws: 1.0, noseR: 0.2 }, badge: 'vw' },
  { id: 'master', num: 4, brand: 'Renault', model: 'Master', tag: 'Practical. Powerful.',
    desc: 'Frequently used due to its practicality and spacious interior.',
    body: 0x1a1b1d, stripe: '#ffc629', stripe2: '#ff8a00', hud: '#ffc629', dark: true,
    stats: { speed: 7, accel: 9, handling: 6, weight: 6 },
    dim: { L: 6.5, W: 2.1, H: 2.76 }, prof: { hood: 0.8, hoodH: 1.22, ws: 0.85, noseR: 0.22 }, badge: 'renault' },
  { id: 'ducato', num: 5, brand: 'Fiat', model: 'Ducato', tag: 'Built for people.',
    desc: 'A common choice for school services, known for its functionality and wide use.',
    body: 0xf7f7f7, stripe: '#d8141c', stripe2: '#7d0a0f', hud: '#ff4040', dark: false,
    stats: { speed: 6, accel: 8, handling: 9, weight: 5 },
    dim: { L: 6.4, W: 2.08, H: 2.7 }, prof: { hood: 0.82, hoodH: 1.16, ws: 0.95, noseR: 0.34 }, badge: 'fiat' },
  { id: 'sultan', num: 6, brand: 'Otokar', model: 'Sultan', tag: 'Türkiye’nin gücü.',
    desc: 'The Turkish-built midibus — the biggest bus on the grid. Heavy, stable and hard to push around.',
    body: 0xf5f5f8, stripe: '#7a2fd0', stripe2: '#c9a2ff', hud: '#b27cff', dark: false,
    stats: { speed: 8, accel: 5, handling: 5, weight: 10 },
    dim: { L: 8.0, W: 2.3, H: 3.05 }, prof: { hood: 0.18, hoodH: 1.05, ws: 0.34, noseR: 0.12 }, badge: 'otokar', midi: true },
];
function deriveStats(def) {
  const s = def.stats;
  return {
    vmax: 41 + s.speed * 1.45,       // m/s
    accel: 7.5 + s.accel * 0.75,     // m/s^2 at low speed
    brake: 27,
    steer: 1.25 + s.handling * 0.075, // rad/s
    grip: 5.5 + s.handling * 0.55,
    mass: 1 + s.weight * 0.22,
  };
}

// ---------- circuit ----------
const HW = 10, KERB = 1.4, WALL = 15.5;
// pit lane on the left of the run back to the start, right after the car park
const PIT = { s0: 1978, s1: 2108, taper: 30, gap: 38, w: 12, v: 22, time: 2.6, box: 9 };
PIT.fast = -(WALL + 4); PIT.boxLat = -(WALL + 9); PIT.crewLat = -(WALL + 11.2);
PIT.boxS = (k) => PIT.s0 + PIT.gap + PIT.box / 2 + k * PIT.box;
const DIV_IN = WALL + 0.25, DIV_OUT = WALL + 0.95;
const smooth01 = (a) => a * a * (3 - 2 * a);
function pitOuter(s) {
  if (s < PIT.s0 || s > PIT.s1) return -WALL;
  return -(WALL + PIT.w * smooth01(clamp(Math.min((s - PIT.s0) / PIT.taper, (PIT.s1 - s) / PIT.taper), 0, 1)));
}
const hasDivider = (s) => s > PIT.s0 + PIT.gap && s < PIT.s1 - PIT.gap;
const inPitZone = (s, d) => s > PIT.s0 && s < PIT.s1 && d < -(HW - 0.5);
// lateral limits for a bus centre line at track distance s (the pit divider splits the left side in two)
function latLimits(s, d, out) {
  let lo = -WALL, hi = WALL;
  if (s >= PIT.s0 && s <= PIT.s1) {
    if (hasDivider(s)) { if (d > -(DIV_IN + DIV_OUT) / 2) lo = -DIV_IN; else { hi = -DIV_OUT; lo = pitOuter(s); } }
    else lo = pitOuter(s);
  }
  out.lo = lo; out.hi = hi; return out;
}
const CTRL = [
  [0, 0], [150, 0], [290, 0], [370, 25], [405, 100], [380, 180], [300, 215],
  [225, 195], [165, 235], [150, 315], [195, 385], [170, 455], [95, 470], [25, 430],
  [-55, 445], [-135, 418], [-215, 442], [-295, 405], [-330, 310], [-300, 220], [-335, 130], [-300, 45], [-160, 0]
];
function catmull(p0, p1, p2, p3, t) {
  const d = (p, q) => Math.pow(Math.hypot(q[0] - p[0], q[1] - p[1]), 0.5) || 1e-4;
  const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
  const tt = t1 + (t2 - t1) * t;
  const L = (A, B, ta, tb) => [A[0] * (tb - tt) / (tb - ta) + B[0] * (tt - ta) / (tb - ta), A[1] * (tb - tt) / (tb - ta) + B[1] * (tt - ta) / (tb - ta)];
  const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
  const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
  return L(B1, B2, t1, t2);
}
function buildTrack() {
  const n = CTRL.length, dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = CTRL[(i - 1 + n) % n], p1 = CTRL[i], p2 = CTRL[(i + 1) % n], p3 = CTRL[(i + 2) % n];
    for (let j = 0; j < 60; j++) dense.push(catmull(p0, p1, p2, p3, j / 60));
  }
  const m = dense.length, cum = new Float64Array(m + 1);
  for (let i = 0; i < m; i++) { const a = dense[i], b = dense[(i + 1) % m]; cum[i + 1] = cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const L = cum[m], N = Math.round(L / 2), ds = L / N;
  const px = new Float32Array(N), pz = new Float32Array(N), tx = new Float32Array(N), tz = new Float32Array(N);
  const ang = new Float32Array(N), curv = new Float32Array(N);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const s = i * ds;
    while (k < m - 1 && cum[k + 1] < s) k++;
    const t = (s - cum[k]) / (cum[k + 1] - cum[k]);
    const a = dense[k], b = dense[(k + 1) % m];
    px[i] = a[0] + (b[0] - a[0]) * t; pz[i] = a[1] + (b[1] - a[1]) * t;
  }
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N, b = (i + 1) % N;
    const dx = px[b] - px[a], dz = pz[b] - pz[a], l = Math.hypot(dx, dz);
    tx[i] = dx / l; tz[i] = dz / l; ang[i] = Math.atan2(tx[i], tz[i]);
  }
  const raw = new Float32Array(N);
  for (let i = 0; i < N; i++) raw[i] = wrapA(ang[(i + 2) % N] - ang[(i - 2 + N) % N]) / (4 * ds);
  for (let i = 0; i < N; i++) { let s = 0; for (let o = -4; o <= 4; o++) s += raw[(i + o + N) % N]; curv[i] = s / 9; }

  const T = { N, ds, L, px, pz, tx, tz, ang, curv };
  T.wrapS = (s) => ((s % L) + L) % L;
  T.idx = (s) => Math.floor(T.wrapS(s) / ds) % N;
  T.curvAt = (s) => curv[T.idx(s)];
  T.pointAt = (s, lat, o) => {
    s = T.wrapS(s);
    const f = s / ds, i = Math.floor(f) % N, j = (i + 1) % N, t = f - Math.floor(f);
    let ux = tx[i] + (tx[j] - tx[i]) * t, uz = tz[i] + (tz[j] - tz[i]) * t; const l = Math.hypot(ux, uz) || 1; ux /= l; uz /= l;
    o.x = px[i] + (px[j] - px[i]) * t - uz * lat; o.z = pz[i] + (pz[j] - pz[i]) * t + ux * lat;
    o.tx = ux; o.tz = uz; o.yaw = Math.atan2(ux, uz);
    return o;
  };
  T.nearest = (x, z, hint) => {
    let c = hint;
    for (let pass = 0; pass < 12; pass++) {
      let bo = 0, bd = Infinity;
      for (let o = -16; o <= 16; o++) { const i = (c + o + N) % N, dx = px[i] - x, dz = pz[i] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; bo = o; } }
      c = (c + bo + N) % N;
      if (bo > -16 && bo < 16) break;
    }
    return c;
  };
  T.globalNearest = (x, z) => { let bi = 0, bd = Infinity; for (let i = 0; i < N; i++) { const dx = px[i] - x, dz = pz[i] - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = i; } } return bi; };
  T.project = (x, z, hint, o) => {
    const i = T.nearest(x, z, hint), ip = (i + 1) % N, im = (i - 1 + N) % N;
    let a = i, b = ip;
    let t = ((x - px[i]) * (px[ip] - px[i]) + (z - pz[i]) * (pz[ip] - pz[i])) / (ds * ds);
    if (t < 0) { a = im; b = i; t = ((x - px[im]) * (px[i] - px[im]) + (z - pz[im]) * (pz[i] - pz[im])) / (ds * ds); }
    t = clamp(t, 0, 1);
    const cx = px[a] + (px[b] - px[a]) * t, cz = pz[a] + (pz[b] - pz[a]) * t;
    let ux = tx[a] + (tx[b] - tx[a]) * t, uz = tz[a] + (tz[b] - tz[a]) * t; const l = Math.hypot(ux, uz) || 1; ux /= l; uz /= l;
    o.idx = i; o.s = T.wrapS((a + t) * ds); o.d = (x - cx) * (-uz) + (z - cz) * ux; o.tx = ux; o.tz = uz;
    return o;
  };
  // distance from a point to the centre line (coarse; used for placing scenery)
  T.clearance = (x, z) => { let bd = Infinity; for (let i = 0; i < N; i += 2) { const dx = px[i] - x, dz = pz[i] - z, d = dx * dx + dz * dz; if (d < bd) bd = d; } return Math.sqrt(bd); };
  return T;
}

// ---------- canvas textures ----------
let MAXANISO = 4;
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, rep) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = MAXANISO; return t; }
function noiseFill(g, w, h, amp) { const im = g.getImageData(0, 0, w, h), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * amp; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0); }
function fitText(g, t, x, y, maxW) { const w = g.measureText(t).width; if (w > maxW) { g.save(); g.translate(x, y); g.scale(maxW / w, 1); g.fillText(t, 0, 0); g.restore(); } else g.fillText(t, x, y); }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
function starPath(g, cx, cy, R, r, a0) { g.beginPath(); for (let i = 0; i < 10; i++) { const rad = i % 2 ? r : R, a = a0 + i * Math.PI / 5; g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.closePath(); }

function texAsphalt(parking) {
  const c = cv(512, 512), g = c.getContext('2d');
  g.fillStyle = parking ? '#56595e' : '#43464b'; g.fillRect(0, 0, 512, 512);
  noiseFill(g, 512, 512, 30);
  const gr = g.createLinearGradient(0, 0, 512, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.32, 'rgba(0,0,0,.08)'); gr.addColorStop(0.5, 'rgba(0,0,0,.13)'); gr.addColorStop(0.68, 'rgba(0,0,0,.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 24; k++) {
    const x = rr(40, 472), y = rr(0, 512), rx = rr(8, 40), ry = rr(20, 90), a = rr(0.02, 0.05);
    g.fillStyle = rnd() < 0.6 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.7})`;
    for (const oy of [-512, 0, 512]) { g.beginPath(); g.ellipse(x, y + oy, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  }
  if (parking) {
    // faded parking bays along both edges: the circuit runs down the aisle of a big car park
    g.fillStyle = 'rgba(245,245,245,.72)';
    const bay = 512 / 6;
    for (let i = 0; i < 6; i++) { const y = i * bay; g.fillRect(0, y, 120, 5); g.fillRect(392, y, 120, 5); }
    g.fillRect(118, 0, 5, 512); g.fillRect(389, 0, 5, 512);
    g.fillStyle = 'rgba(255,198,41,.8)';
    g.fillRect(250, 60, 12, 110); g.fillRect(250, 316, 12, 110);
  }
  g.fillStyle = '#ececec'; g.fillRect(6, 0, 8, 512); g.fillRect(498, 0, 8, 512);
  return tex(c, true);
}
function texKerb() { const c = cv(32, 64), g = c.getContext('2d'); g.fillStyle = '#d8201c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#f3f3f3'; g.fillRect(0, 32, 32, 32); return tex(c, true); }
function texPave() {
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#9a9ca0'; g.fillRect(0, 0, 256, 256); noiseFill(g, 256, 256, 18);
  g.strokeStyle = 'rgba(50,50,50,.35)'; g.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  return tex(c, true);
}
function texGrass() {
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#5b8a3a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `hsla(${rr(78, 108)},${rr(30, 55)}%,${rr(22, 42)}%,.55)`; g.fillRect(rr(0, 256), rr(0, 256), rr(1, 3), rr(2, 6)); }
  return tex(c, true);
}
function texLot() {
  const c = cv(512, 512), g = c.getContext('2d');
  g.fillStyle = '#5a5d62'; g.fillRect(0, 0, 512, 512); noiseFill(g, 512, 512, 24);
  g.fillStyle = 'rgba(240,240,240,.75)';
  for (let x = 0; x <= 512; x += 64) { g.fillRect(x - 2, 0, 4, 128); g.fillRect(x - 2, 384, 4, 128); }
  g.fillRect(0, 0, 512, 4); g.fillRect(0, 126, 512, 3); g.fillRect(0, 383, 512, 3);
  return tex(c, true);
}
function texAds() {
  const c = cv(4096, 128), g = c.getContext('2d');
  const P = [
    { bg: '#e10600', fg: '#ffffff', t: 'SCHOOL BUS RACE', s: 86 },
    { bg: '#f2f2f2', fg: '#101418', t: 'ANKA BİLİM GRAND PRIX', s: 74 },
    { bg: '#ffc629', fg: '#111111', t: 'FUELED BY STUDENTS', s: 80 },
    { bg: '#12161f', fg: '#ffc629', t: 'OKUL SERVİSİ · ANKARA 2026', s: 64 },
  ];
  P.forEach((p, i) => {
    g.fillStyle = p.bg; g.fillRect(i * 1024, 0, 1024, 128);
    g.fillStyle = p.fg; g.font = `italic 900 ${p.s}px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, p.t, i * 1024 + 512, 68, 940);
  });
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, 4096, 6); g.fillRect(0, 122, 4096, 6);
  return tex(c, true);
}
function texFacade(wall, trim) {
  const c = cv(512, 512), g = c.getContext('2d');
  g.fillStyle = wall; g.fillRect(0, 0, 512, 512); noiseFill(g, 512, 512, 10);
  for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
    const x = q * 128, y = r * 128, lit = rnd() < 0.12;
    g.fillStyle = trim; g.fillRect(x, y + 118, 128, 8);
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x + 26, y + 26, 76, 72);
    const gl = g.createLinearGradient(0, y + 30, 0, y + 94);
    gl.addColorStop(0, lit ? '#efdca8' : '#8ea5b8'); gl.addColorStop(1, lit ? '#b89d62' : '#2c3a48');
    g.fillStyle = gl; g.fillRect(x + 30, y + 30, 68, 64);
    g.fillStyle = trim; g.fillRect(x + 62, y + 30, 4, 64);
    if (rnd() < 0.35) { g.fillStyle = pick(['rgba(240,230,210,.85)', 'rgba(200,80,60,.6)', 'rgba(250,250,250,.75)']); g.fillRect(x + 30, y + 30, 68, rr(10, 40)); }
    if (rnd() < 0.3) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 16, y + 88, 96, 20); g.fillStyle = trim; g.fillRect(x + 16, y + 86, 96, 5); }
  }
  return tex(c, true);
}
function texChecker(nx, ny) {
  const c = cv(nx * 16, ny * 16), g = c.getContext('2d');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#f5f5f5'; g.fillRect(i * 16, j * 16, 16, 16); }
  const t = tex(c, false); t.magFilter = THREE.NearestFilter; return t;
}
function texBlob() {
  const c = cv(128, 128), g = c.getContext('2d');
  g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 16; g.shadowOffsetX = 1000;
  g.fillStyle = '#000'; rrect(g, 20 - 1000, 20, 88, 88, 18); g.fill();
  return tex(c, false);
}
function texFlag() {
  const c = cv(300, 200), g = c.getContext('2d'), G = 200;
  g.fillStyle = '#E30A17'; g.fillRect(0, 0, 300, 200);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(0.5 * G, 100, 0.25 * G, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E30A17'; g.beginPath(); g.arc(0.5625 * G, 100, 0.2 * G, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; starPath(g, 0.95 * G, 100, 0.125 * G, 0.125 * G * 0.382, Math.PI); g.fill();
  return tex(c, false);
}
function texLabel(w, h, draw) { const c = cv(w, h), g = c.getContext('2d'); draw(g, w, h); return tex(c, false); }
function texBanner(text, bg, fg) {
  return texLabel(1024, 192, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.font = `64px ${FONT_H}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(w / 2, h / 2 + 4); g.rotate(-0.025); fitText(g, text, 0, 0, w - 70); g.restore();
  });
}

// ---------- the nine drivers: every number and text comes from characters.js ----------
const DRIVERS = CHARACTERS.map((c) => Object.assign({ photo: PHOTOS[c.id] || '' }, c));
// texts for the driver screen, built from the numbers in the settings file
function drvText(d) {
  const t = (part) => (typeof part.desc === 'function' ? part.desc(part, d) : part.desc || '');
  const a = d.ability;
  const cost = a.cost === 'all' ? 'all your students' : a.cost === 'meter' ? a.minMeter + '%+ sweet meter' : a.cost + ' students';
  return {
    p1: { name: d.passive1.name, desc: t(d.passive1) },
    p2: { name: d.passive2.name, desc: t(d.passive2) },
    ab: { name: a.name, cost, desc: t(a) },
  };
}
// Ali has no photo yet: draw a cartoon portrait (a donut with a big grin)
function makeAvatar(d) {
  const c = cv(256, 256), g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 256); bg.addColorStop(0, '#b98cff'); bg.addColorStop(1, '#5b2aa8');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${rr(0.05, 0.14).toFixed(2)})`; g.beginPath(); g.arc(rr(0, 256), rr(0, 256), rr(3, 10), 0, 7); g.fill(); }
  g.fillStyle = '#e6a55a'; g.beginPath(); g.arc(128, 118, 84, 0, 7); g.fill();
  g.fillStyle = '#ff7ab6'; g.beginPath();
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 74 + Math.sin(i * 2.3) * 7; g.lineTo(128 + Math.cos(a) * r, 118 + Math.sin(a) * r); }
  g.fill();
  const spr = ['#ffffff', '#ffe14a', '#5ef1ff', '#7dff6a', '#ff5a5a'];
  for (let i = 0; i < 30; i++) { const a = rr(0, 6.28), r = rr(34, 66); g.save(); g.translate(128 + Math.cos(a) * r, 118 + Math.sin(a) * r); g.rotate(rr(0, 3)); g.fillStyle = pick(spr); g.fillRect(-6, -2, 12, 4); g.restore(); }
  g.fillStyle = '#5b2aa8'; g.beginPath(); g.arc(128, 118, 24, 0, 7); g.fill();
  g.fillStyle = '#1b1030'; for (const x of [98, 158]) { g.beginPath(); g.ellipse(x, 96, 9, 12, 0, 0, 7); g.fill(); }
  g.fillStyle = '#ffffff'; for (const x of [101, 161]) { g.beginPath(); g.arc(x, 92, 3.5, 0, 7); g.fill(); }
  g.strokeStyle = '#1b1030'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(128, 150, 28, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.fillStyle = '#ffffff'; g.font = `italic 900 46px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 8; g.strokeStyle = 'rgba(40,10,80,.8)'; g.strokeText(d.name.toUpperCase(), 128, 226); g.fillText(d.name.toUpperCase(), 128, 226);
  return c.toDataURL('image/png');
}
function ensurePhotos() { DRIVERS.forEach((d) => { if (!d.photo) d.photo = makeAvatar(d); }); }
const PHYSICS_TERMS = ['E = mc²', 'F = m·a', 'Δv / Δt', 'p = m·v', 'λ = h / p', 'π = 3.14159', '∫ f(x) dx', '√2', 'Σ F = 0', '∞', 'g = 9.81 m/s²', 'W = F·d', 'sin²θ + cos²θ = 1', 'v = s / t', 'Eₖ = ½mv²', 'a² + b² = c²', 'ħ', 'PV = nRT', 'τ = r × F', 'f = 1 / T', 'c = 3·10⁸ m/s', 'dx/dt', 'e^{iπ} + 1 = 0', '∇·E = ρ/ε₀'];
const ri = (a, b) => Math.floor(rr(a, b + 1));
const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

// =====================================================================
//  WORLD: renderer, scene, circuit surfaces
// =====================================================================
const col = (hex) => new THREE.Color(hex).convertSRGBToLinear();
let renderer, scene, camera, sun, hemi, skyMesh, TRACK;
const W = { stops: [], lights: [], crowdTime: { value: 0 }, flag: null, flagBase: null, cloudGroup: null, gantryBulbs: [], reserved: [] };

function initRenderer() {
  const canvas = $('gl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  MAXANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(62, 1, 0.3, 3200);
  scene.add(camera);
}

// ---- geometry helpers ----
function stripGeo(T, d0, d1, y0, y1, o) {
  o = o || {};
  const N = T.N, ds = T.ds, i0 = o.i0 || 0, cnt = o.cnt || N;
  const reps = Math.max(1, Math.round(T.L / (o.vLen || 10))), vs = reps / T.L;
  const nv = cnt + 1, pos = new Float32Array(nv * 6), uv = new Float32Array(nv * 4);
  const u0 = o.u0 == null ? 0 : o.u0, u1 = o.u1 == null ? 1 : o.u1;
  for (let k = 0; k < nv; k++) {
    const i = (i0 + k) % N, rx = -T.tz[i], rz = T.tx[i];
    const e0 = typeof d0 === 'function' ? d0(i * ds) : d0, e1 = typeof d1 === 'function' ? d1(i * ds) : d1;
    pos[k * 6] = T.px[i] + rx * e0; pos[k * 6 + 1] = y0; pos[k * 6 + 2] = T.pz[i] + rz * e0;
    pos[k * 6 + 3] = T.px[i] + rx * e1; pos[k * 6 + 4] = y1; pos[k * 6 + 5] = T.pz[i] + rz * e1;
    const v = (i0 + k) * ds * vs * (o.flipV ? -1 : 1);
    if (o.swap) { uv[k * 4] = v; uv[k * 4 + 1] = u0; uv[k * 4 + 2] = v; uv[k * 4 + 3] = u1; }
    else { uv[k * 4] = u0; uv[k * 4 + 1] = v; uv[k * 4 + 2] = u1; uv[k * 4 + 3] = v; }
  }
  const idx = [];
  for (let k = 0; k < cnt; k++) { const a = k * 2, b = a + 1, c = a + 2, d = a + 3; if (o.flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
// merge [geometry, hexColor] pairs (already positioned) into one vertex-coloured geometry
function mergeColored(parts) {
  let total = 0; const list = parts.map(([g, c]) => { const ng = g.index ? g.toNonIndexed() : g; total += ng.attributes.position.count; return [ng, c]; });
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), clr = new Float32Array(total * 3), uv = new Float32Array(total * 2);
  let o = 0;
  for (const [g, c] of list) {
    const n = g.attributes.position.count, cc = col(c);
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    for (let i = 0; i < n; i++) { clr[(o + i) * 3] = cc.r; clr[(o + i) * 3 + 1] = cc.g; clr[(o + i) * 3 + 2] = cc.b; }
    o += n;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(clr, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
function boxAt(w, h, d, x, y, z, ry, rx, rz) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry);
  g.translate(x, y, z); return g;
}
function cylAt(rt, rb, h, seg, x, y, z, rx, rz) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg);
  if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz);
  g.translate(x, y, z); return g;
}
const VCMAT = () => new THREE.MeshLambertMaterial({ vertexColors: true });
// place an object along the circuit: s (m), lateral offset, yaw offset
function placeOnTrack(obj, s, lat, y, yawOff) {
  const p = TRACK.pointAt(s, lat, {});
  obj.position.set(p.x, y || 0, p.z); obj.rotation.y = p.yaw + (yawOff || 0);
  return p;
}
// flat decal lying on the road, readable by drivers heading forward
function roadDecal(w, h, map, s, lat, y, opts) {
  const g = new THREE.PlaneGeometry(w, h); g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshLambertMaterial(Object.assign({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }, opts || {}));
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true;
  placeOnTrack(mesh, s, lat, y, Math.PI);
  mesh.renderOrder = 2;
  scene.add(mesh); return mesh;
}
function reserve(x, z, r) { W.reserved.push({ x, z, r }); }
function isReserved(x, z, r) { for (const q of W.reserved) { const dx = q.x - x, dz = q.z - z; if (dx * dx + dz * dz < (q.r + r) * (q.r + r)) return true; } return false; }

// ---- sky, fog, lights ----
function buildSky() {
  const top = col(0x3f7fd0), hor = col(0xbcd3e6), bot = col(0xb4c9dc);
  const sunDir = new THREE.Vector3(-0.45, 0.62, -0.64).normalize();
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTop: { value: top }, uHor: { value: hor }, uBot: { value: bot }, uSun: { value: sunDir } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: [
      'uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uBot; uniform vec3 uSun; varying vec3 vDir;',
      'void main(){ vec3 d = normalize(vDir); float h = d.y;',
      ' vec3 c = mix(uHor, uTop, pow(smoothstep(0.0, 0.65, h), 0.75));',
      ' c = mix(uBot, c, smoothstep(-0.08, 0.02, h));',
      ' float s = max(dot(d, uSun), 0.0);',
      ' c += vec3(1.0,0.93,0.78) * (pow(s, 900.0) * 7.0 + pow(s, 14.0) * 0.22);',
      ' gl_FragColor = vec4(c, 1.0);',
      ' #include <tonemapping_fragment>',
      ' #include <encodings_fragment>',
      '}'].join('\n'),
    side: THREE.BackSide, depthWrite: false, fog: false
  });
  skyMesh = new THREE.Mesh(new THREE.SphereGeometry(2800, 32, 16), mat);
  skyMesh.renderOrder = -10; skyMesh.frustumCulled = false;
  scene.add(skyMesh);
  scene.fog = new THREE.Fog(hor.clone(), 260, 2300);
  scene.background = hor.clone();
  hemi = new THREE.HemisphereLight(col(0xcfe2ff), col(0x6b6150), 0.78);
  scene.add(hemi);
  sun = new THREE.DirectionalLight(col(0xfff0d8), 1.75);
  sun.userData.dir = sunDir.clone();
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -SHADOW_HALF; sc.right = SHADOW_HALF; sc.top = SHADOW_HALF; sc.bottom = -SHADOW_HALF; sc.near = 120; sc.far = 480;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.035;
  const L = sunDir; SHADOW_AX.set(0, 1, 0).cross(L).normalize(); SHADOW_AY.copy(L).cross(SHADOW_AX).normalize();
  scene.add(sun); scene.add(sun.target);
}
// keep the shadow box centred ahead of the camera and snapped to shadow-map texels (no shimmering)
const SHADOW_HALF = 100, SHADOW_AX = new THREE.Vector3(), SHADOW_AY = new THREE.Vector3(), SHADOW_F = new THREE.Vector3();
function aimSun(fx, fz) {
  const d = sun.userData.dir, texel = (SHADOW_HALF * 2) / sun.shadow.mapSize.x;
  SHADOW_F.set(fx, 0, fz);
  const u = Math.round(SHADOW_F.dot(SHADOW_AX) / texel) * texel, v = Math.round(SHADOW_F.dot(SHADOW_AY) / texel) * texel, w = SHADOW_F.dot(d);
  SHADOW_F.copy(SHADOW_AX).multiplyScalar(u).addScaledVector(SHADOW_AY, v).addScaledVector(d, w);
  sun.target.position.copy(SHADOW_F);
  sun.position.copy(SHADOW_F).addScaledVector(d, 300);
}

// ---- circuit surfaces ----
function buildCircuit() {
  const T = TRACK, N = T.N;
  // parking-lot section = the west side of the circuit
  let p0 = -1, p1 = -1;
  for (let i = 0; i < N; i++) if (T.px[i] < -268) { if (p0 < 0) p0 = i; p1 = i; }
  W.park = { i0: p0, i1: p1, s0: p0 * T.ds, s1: p1 * T.ds };

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(5200, 5200), new THREE.MeshLambertMaterial({ map: texGrass(), color: col(0xe6f0da) }));
  ground.material.map.repeat.set(520, 520);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  // the big car park the west section runs through
  let minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9;
  for (let i = p0; i <= p1; i++) { minx = Math.min(minx, T.px[i]); maxx = Math.max(maxx, T.px[i]); minz = Math.min(minz, T.pz[i]); maxz = Math.max(maxz, T.pz[i]); }
  const lot = { x0: minx - 70, x1: maxx + 75, z0: minz - 10, z1: maxz + 10 };
  W.lot = lot;
  const lotTex = texLot(); lotTex.repeat.set((lot.x1 - lot.x0) / 20, (lot.z1 - lot.z0) / 20);
  const lotMesh = new THREE.Mesh(new THREE.PlaneGeometry(lot.x1 - lot.x0, lot.z1 - lot.z0), new THREE.MeshLambertMaterial({ map: lotTex, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  lotMesh.rotation.x = -Math.PI / 2; lotMesh.position.set((lot.x0 + lot.x1) / 2, 0.01, (lot.z0 + lot.z1) / 2); lotMesh.receiveShadow = true;
  scene.add(lotMesh);

  // runoff / sidewalks
  const pave = new THREE.MeshLambertMaterial({ map: texPave(), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  for (const side of [1, -1]) {
    const g = side > 0 ? stripGeo(T, HW - 0.2, WALL + 0.7, 0.015, 0.015, { vLen: 5.6 }) : stripGeo(T, -WALL - 0.7, -HW + 0.2, 0.015, 0.015, { vLen: 5.6 });
    const m = new THREE.Mesh(g, pave); m.receiveShadow = true; scene.add(m);
  }
  // road: main asphalt + parking-lot asphalt
  const roadMat = new THREE.MeshStandardMaterial({ map: texAsphalt(false), roughness: 0.92, metalness: 0, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const parkMat = new THREE.MeshStandardMaterial({ map: texAsphalt(true), roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const r1 = new THREE.Mesh(stripGeo(T, -HW, HW, 0.03, 0.03, { i0: p1, cnt: N - (p1 - p0), vLen: 16 }), roadMat);
  const r2 = new THREE.Mesh(stripGeo(T, -HW, HW, 0.03, 0.03, { i0: p0, cnt: p1 - p0, vLen: 15 }), parkMat);
  r1.receiveShadow = r2.receiveShadow = true; scene.add(r1, r2);

  // kerbs on corners
  const kerbMat = new THREE.MeshLambertMaterial({ map: texKerb(), polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 });
  let inC = false, st = 0;
  const kerbRuns = [];
  for (let i = 0; i <= N; i++) {
    const c = Math.abs(T.curv[i % N]) > 1 / 150;
    if (c && !inC) { inC = true; st = i; } else if (!c && inC) { inC = false; kerbRuns.push([st - 8, i + 8]); }
  }
  // merge runs that touch, so no two kerb strips ever overlap (overlaps flicker)
  const runs = [];
  for (const r of kerbRuns) { const last = runs[runs.length - 1]; if (last && r[0] <= last[1] + 2) last[1] = Math.max(last[1], r[1]); else runs.push([r[0], r[1]]); }
  if (runs.length > 1 && runs[runs.length - 1][1] >= runs[0][0] + N - 2) { runs[0][0] = runs[runs.length - 1][0] - N; runs.pop(); }
  W.kerbRuns = runs;
  for (const [a, b] of runs) {
    const i0 = (a + N) % N, cnt = b - a;
    for (const side of [1, -1]) {
      const g = side > 0 ? stripGeo(T, HW - 0.3, HW + KERB, 0.045, 0.045, { i0, cnt, vLen: 3.2 }) : stripGeo(T, -HW - KERB, -HW + 0.3, 0.045, 0.045, { i0, cnt, vLen: 3.2 });
      const m = new THREE.Mesh(g, kerbMat); m.receiveShadow = true; scene.add(m);
    }
  }

  // concrete walls with sponsor boards (not in the car park section)
  const ads = texAds();
  const adMat = new THREE.MeshLambertMaterial({ map: ads });
  const topMat = new THREE.MeshLambertMaterial({ color: col(0xb9bcc0) });
  const outMat = new THREE.MeshLambertMaterial({ color: col(0x8e9296) });
  const wi0 = (p1 + 6) % N, wcnt = N - (p1 - p0) - 12, WH = 1.15;
  // the left wall is replaced by the pit lane between PIT.s0 and PIT.s1
  const pa = Math.floor(PIT.s0 / T.ds) - wi0, pb = Math.ceil(PIT.s1 / T.ds) - wi0;
  const wallRanges = (side) => {
    if (side > 0 || pb <= 0 || pa >= wcnt) return [[wi0, wcnt]];
    const r = [];
    if (pa > 0) r.push([wi0, pa]);
    if (pb < wcnt) r.push([(wi0 + pb) % N, wcnt - pb]);
    return r;
  };
  for (const side of [1, -1]) for (const [ri0, rcnt] of wallRanges(side)) {
    const d = side * WALL, d2 = side * (WALL + 0.55);
    const inner = stripGeo(T, d, d, 0, WH, { i0: ri0, cnt: rcnt, vLen: 32, swap: true, flip: side < 0, flipV: side > 0 });
    const top = side > 0 ? stripGeo(T, d, d2, WH, WH, { i0: ri0, cnt: rcnt }) : stripGeo(T, d2, d, WH, WH, { i0: ri0, cnt: rcnt });
    const outer = stripGeo(T, d2, d2, 0, WH, { i0: ri0, cnt: rcnt, flip: side > 0 });
    const mi = new THREE.Mesh(inner, adMat), mt = new THREE.Mesh(top, topMat), mo = new THREE.Mesh(outer, outMat);
    mi.castShadow = mt.castShadow = true; mi.receiveShadow = true;
    scene.add(mi, mt, mo);
  }
  // plastic water barriers + cones through the car park
  const bGeo = mergeColored([[boxAt(0.55, 0.85, 1.9, 0, 0.425, 0), 0xffffff], [boxAt(0.7, 0.12, 2.0, 0, 0.06, 0), 0xffffff]]);
  const barrierCount = Math.floor((p1 - p0 + 12) * T.ds / 2.0) * 2;
  const barriers = new THREE.InstancedMesh(bGeo, VCMAT(), barrierCount);
  const dummy = new THREE.Object3D(), tmp = {};
  let bi = 0;
  for (let s = (p0 - 6) * T.ds; s < (p1 + 6) * T.ds && bi < barrierCount - 1; s += 2.0) {
    for (const side of [1, -1]) {
      T.pointAt(s, side * (WALL + 0.25), tmp);
      dummy.position.set(tmp.x, 0, tmp.z); dummy.rotation.set(0, tmp.yaw, 0); dummy.updateMatrix();
      barriers.setMatrixAt(bi, dummy.matrix);
      barriers.setColorAt(bi, col((Math.round(s / 2) % 2) ? 0xe32119 : 0xf2f2f2));
      bi++;
    }
  }
  barriers.count = bi; barriers.castShadow = true;
  scene.add(barriers);

  // start / finish line, grid boxes, painted lettering
  roadDecal(20, 1.6, texChecker(25, 2), 0, 0, 0.06);
  const gridTex = (n) => texLabel(256, 128, (g) => {
    g.strokeStyle = '#f4f4f4'; g.lineWidth = 10; g.beginPath(); g.moveTo(14, 120); g.lineTo(14, 14); g.lineTo(242, 14); g.lineTo(242, 120); g.stroke();
    g.fillStyle = 'rgba(244,244,244,.85)'; g.font = `italic 900 70px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 74);
  });
  W.grid = [];
  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 2), c = i % 2;
    const s = T.L - 7 - row * 17 - c * 8.5, lat = c ? 4.6 : -4.6;
    W.grid.push({ s, lat });
    roadDecal(3.4, 1.7, gridTex(i + 1), s, lat, 0.06);
  }
  const paint = texLabel(1024, 256, (g, w, h) => {
    g.fillStyle = 'rgba(245,245,245,.78)'; g.font = `italic 900 170px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'ANKA BİLİM', w / 2, h / 2 + 8, w - 40);
  });
  roadDecal(15, 3.8, paint, 34, 0, 0.06);
  const paint2 = texLabel(1024, 256, (g, w, h) => {
    g.fillStyle = 'rgba(225,6,0,.8)'; g.font = `italic 900 170px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'SCHOOL BUS RACE', w / 2, h / 2 + 8, w - 40);
  });
  roadDecal(17, 3.2, paint2, 140, 0, 0.06);
}

// ---- start/finish gantry with the five start lights ----
function buildGantry() {
  const grp = new THREE.Group();
  placeOnTrack(grp, 0, 0, 0);
  const steel = 0x2b2f36;
  // pillars sit just inside the walls and everything overhead is above camera height
  const frame = mergeColored([
    [boxAt(0.7, 11.2, 0.7, 14.85, 5.6, 0), steel], [boxAt(0.7, 11.2, 0.7, -14.85, 5.6, 0), steel],
    [boxAt(30.4, 0.35, 0.5, 0, 10.9, 0), steel], [boxAt(30.4, 0.35, 0.5, 0, 8.55, 0), steel],
    [boxAt(1.2, 0.4, 1.2, 14.85, 0.2, 0), 0x5b6068], [boxAt(1.2, 0.4, 1.2, -14.85, 0.2, 0), 0x5b6068],
  ]);
  const fm = new THREE.Mesh(frame, VCMAT()); fm.castShadow = true; grp.add(fm);
  const front = texLabel(2048, 200, (g, w, h) => {
    g.fillStyle = '#0d1016'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e10600'; g.beginPath(); g.moveTo(40, 150); g.lineTo(110, 50); g.lineTo(330, 50); g.lineTo(260, 150); g.fill();
    g.beginPath(); g.moveTo(w - 330, 150); g.lineTo(w - 260, 50); g.lineTo(w - 40, 50); g.lineTo(w - 110, 150); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `italic 900 104px ${FONT_D}`; fitText(g, 'SCHOOL BUS RACE', w / 2, 82, 1200);
    g.fillStyle = '#b8c0cc'; g.font = `800 40px ${FONT_D}`; fitText(g, 'A N K A   B İ L İ M   G R A N D   P R I X', w / 2, 158, 1200);
  });
  const back = texLabel(2048, 200, (g, w, h) => {
    for (let i = 0; i < 64; i++) for (let j = 0; j < 6; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#f4f4f4'; g.fillRect(i * 32, j * 33.4, 32, 34); }
    g.fillStyle = '#0d1016'; g.fillRect(260, 16, w - 520, h - 32);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `italic 900 96px ${FONT_D}`; fitText(g, 'FINISH · ANKA BİLİM SCHOOL', w / 2, h / 2 + 4, w - 600);
  });
  const panelMats = [0, 0, 0, 0, 0, 0].map(() => new THREE.MeshLambertMaterial({ color: col(0x0d1016) }));
  panelMats[5] = new THREE.MeshBasicMaterial({ map: front, toneMapped: false });
  panelMats[4] = new THREE.MeshBasicMaterial({ map: back, toneMapped: false });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(24, 2.35, 0.4), panelMats);
  panel.position.set(0, 9.7, 0); panel.castShadow = true; grp.add(panel);
  // light housings
  const housing = mergeColored([0, 1, 2, 3, 4].map((i) => [boxAt(0.8, 1.7, 0.45, (i - 2) * 1.15, 7.65, -0.1), 0x0a0a0b]));
  grp.add(new THREE.Mesh(housing, VCMAT()));
  const bulbGeo = new THREE.CircleGeometry(0.26, 18); bulbGeo.rotateY(Math.PI);
  for (let i = 0; i < 5; i++) {
    const m = new THREE.MeshBasicMaterial({ color: col(0x2a0707), toneMapped: false });
    for (const y of [8.1, 7.25]) { const b = new THREE.Mesh(bulbGeo, m); b.position.set((i - 2) * 1.15, y, -0.34); grp.add(b); }
    W.gantryBulbs.push(m);
  }
  scene.add(grp);
}
function setGantryLights(n, green) {
  W.gantryBulbs.forEach((m, i) => m.color.copy(green ? col(0x19e05a) : (i < n ? col(0xff2010) : col(0x2a0707))));
}

// =====================================================================
//  WORLD: Anka Bilim School, grandstands, city, bus stops, horizon
// =====================================================================
function facingTrack(p, side) { // yaw so that local +z points from this side toward the circuit
  const ax = -side * (-p.tz), az = -side * p.tx;
  return Math.atan2(ax, az);
}
function buildSchool() {
  const s = 64, side = -1;
  const p = TRACK.pointAt(s, side * (WALL + 25), {});
  const grp = new THREE.Group();
  grp.position.set(p.x, 0, p.z); grp.rotation.y = facingTrack(p, side);
  const Wd = 66, Hh = 15, Dd = 16;
  const front = texLabel(2112, 480, (g, w, h) => {
    g.fillStyle = '#efe8d8'; g.fillRect(0, 0, w, h); noiseFill(g, w, h, 8);
    const floorH = h / 4;
    for (let f = 0; f < 4; f++) {
      const y = f * floorH;
      g.fillStyle = '#1f4e9c'; g.fillRect(0, y + floorH - 10, w, 10);
      for (let x = 30; x < w - 60; x += 104) {
        if (f === 3 && x > w / 2 - 230 && x < w / 2 + 170) continue;
        g.fillStyle = '#26323f'; g.fillRect(x, y + 22, 78, floorH - 50);
        const gr = g.createLinearGradient(0, y + 22, 0, y + floorH - 28); gr.addColorStop(0, '#9fb8cc'); gr.addColorStop(1, '#34475a');
        g.fillStyle = gr; g.fillRect(x + 4, y + 26, 70, floorH - 58);
        g.fillStyle = '#26323f'; g.fillRect(x + 37, y + 26, 4, floorH - 58);
      }
    }
    // entrance
    g.fillStyle = '#1b2530'; g.fillRect(w / 2 - 220, h - floorH + 8, 440, floorH - 8);
    const gr = g.createLinearGradient(0, h - floorH, 0, h); gr.addColorStop(0, '#a9c3d6'); gr.addColorStop(1, '#3d5468');
    g.fillStyle = gr; for (let i = 0; i < 4; i++) g.fillRect(w / 2 - 212 + i * 106, h - floorH + 16, 98, floorH - 16);
  });
  const side1 = texFacade('#efe8d8', '#1f4e9c'); side1.repeat.set(Dd / 12.8, Hh / 12);
  const mats = [
    new THREE.MeshLambertMaterial({ map: side1 }), new THREE.MeshLambertMaterial({ map: side1 }),
    new THREE.MeshLambertMaterial({ color: col(0x7b7f86) }), new THREE.MeshLambertMaterial({ color: col(0x555555) }),
    new THREE.MeshLambertMaterial({ map: front }), new THREE.MeshLambertMaterial({ map: side1 })
  ];
  const block = new THREE.Mesh(new THREE.BoxGeometry(Wd, Hh, Dd), mats);
  block.position.set(0, Hh / 2, 0); block.castShadow = true; block.receiveShadow = true; grp.add(block);
  // entrance canopy + sign
  const canopy = mergeColored([
    [boxAt(18, 0.5, 5, 0, 4.4, Dd / 2 + 2.5), 0x1f4e9c], [boxAt(0.4, 4.2, 0.4, -8.5, 2.1, Dd / 2 + 4.6), 0xdfe3e8], [boxAt(0.4, 4.2, 0.4, 8.5, 2.1, Dd / 2 + 4.6), 0xdfe3e8],
    [boxAt(34, 3.4, 0.5, 0, Hh + 1.2, Dd / 2 - 0.6), 0x14203a],
    [boxAt(Wd + 30, 0.08, 16, 0, 0.03, Dd / 2 + 8), 0xb4b0a6],
    [boxAt(Wd + 30, 1.4, 0.15, 0, 0.7, Dd / 2 + 15.8), 0x2f5d3a],
  ]);
  const cm = new THREE.Mesh(canopy, VCMAT()); cm.castShadow = true; cm.receiveShadow = true; grp.add(cm);
  const signTex = texLabel(2048, 200, (g, w, h) => {
    g.fillStyle = '#14203a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = `italic 900 128px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'ANKA BİLİM SCHOOL', w / 2, h / 2 + 6, w - 120);
    g.fillStyle = '#e10600'; g.fillRect(40, h - 26, w - 80, 8);
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(33, 3.2), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
  sign.position.set(0, Hh + 1.2, Dd / 2 - 0.3); grp.add(sign);
  // flag pole with the Turkish flag
  const pole = new THREE.Mesh(cylAt(0.09, 0.13, 15, 8, -24, 7.5, Dd / 2 + 14), new THREE.MeshLambertMaterial({ color: col(0xdadde2) }));
  pole.castShadow = true; grp.add(pole);
  const fg = new THREE.PlaneGeometry(4.2, 2.8, 18, 8); fg.translate(2.1, 0, 0);
  const flag = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ map: texFlag(), side: THREE.DoubleSide }));
  flag.position.set(-24, 13.4, Dd / 2 + 14); flag.rotation.y = -0.4; grp.add(flag);
  W.flag = flag; W.flagBase = Float32Array.from(fg.attributes.position.array);
  scene.add(grp);
  grp.updateMatrixWorld(true);
  const c = new THREE.Vector3(0, 0, 4).applyMatrix4(grp.matrixWorld);
  reserve(c.x, c.z, 46);
}

// ---- grandstands with an animated crowd ----
const CROWD = { body: [], head: [] };
function buildStand(s0, s1, side, banners) {
  if (s1 < s0) s1 += TRACK.L;
  const len = s1 - s0, p = TRACK.pointAt((s0 + s1) / 2, side * (WALL + 3.0), {});
  const grp = new THREE.Group();
  grp.position.set(p.x, 0, p.z); grp.rotation.y = facingTrack(p, side) + Math.PI; // local +z points away from track
  const rows = 7, parts = [];
  const seat = side > 0 ? 0xc81e1e : 0x1d4fb8;
  parts.push([boxAt(len, 1.0, 0.35, 0, 0.5, 0.1), 0x2b3038]);
  for (let r = 0; r < rows; r++) {
    parts.push([boxAt(len, 0.5 + r * 0.5 + 0.8, 1.0, 0, (0.5 + r * 0.5 + 0.8) / 2, 0.8 + r * 1.0), 0x9ea3aa]);
    parts.push([boxAt(len - 0.4, 0.22, 0.42, 0, 0.8 + r * 0.5 + 0.61, 0.62 + r * 1.0), seat]);
  }
  const backZ = 0.8 + rows * 1.0;
  parts.push([boxAt(len, 8.2, 0.3, 0, 4.1, backZ), 0x3a3f47]);
  parts.push([boxAt(len + 1, 0.3, backZ + 1.6, 0, 8.3, backZ / 2 - 0.2), 0xe9ecef]);
  parts.push([boxAt(len + 1, 0.5, 0.3, 0, 8.1, -0.9), 0xe10600]);
  for (let x = -len / 2 + 2; x <= len / 2 - 1; x += 12) parts.push([boxAt(0.35, 8.2, 0.35, x, 4.1, backZ - 0.4), 0x3a3f47]);
  const m = new THREE.Mesh(mergeColored(parts), VCMAT()); m.castShadow = true; m.receiveShadow = true; grp.add(m);
  // banners hung on the fascia, facing the circuit
  banners.forEach((b, i) => {
    const bw = Math.min(11, len / banners.length - 1.5);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(bw, bw * 0.19), new THREE.MeshLambertMaterial({ map: texBanner(b[0], b[1], b[2]) }));
    pl.rotation.y = Math.PI;
    pl.position.set(-len / 2 + (i + 0.5) * (len / banners.length), 1.35, -0.12);
    grp.add(pl);
  });
  scene.add(grp); grp.updateMatrixWorld(true);
  const v = new THREE.Vector3();
  for (let r = 0; r < rows; r++) for (let x = -len / 2 + 0.6; x < len / 2 - 0.5; x += 0.78) {
    if (rnd() < 0.14) continue;
    v.set(x + rr(-0.12, 0.12), 0.8 + r * 0.5 + 0.5, 0.75 + r * 1.0 + rr(-0.05, 0.05)).applyMatrix4(grp.matrixWorld);
    CROWD.body.push([v.x, v.y, v.z, grp.rotation.y]);
  }
  for (let t = 0; t <= 1; t += 0.1) { const q = TRACK.pointAt(s0 + (s1 - s0) * t, side * (WALL + 7), {}); reserve(q.x, q.z, 9); }
}
function finishCrowd() {
  const n = CROWD.body.length;
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.72, 0.34); bodyGeo.translate(0, 0.36, 0);
  const headGeo = new THREE.BoxGeometry(0.27, 0.28, 0.27); headGeo.translate(0, 0.88, 0);
  const patch = (mat) => {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = W.crowdTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n  float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.61;\n  float jump = step(0.55, fract(ph * 7.13));\n  transformed.y += max(0.0, sin(uTime * 7.0 + ph * 5.0)) * 0.28 * jump;');
    };
    return mat;
  };
  const bodies = new THREE.InstancedMesh(bodyGeo, patch(new THREE.MeshLambertMaterial()), n);
  const heads = new THREE.InstancedMesh(headGeo, patch(new THREE.MeshLambertMaterial()), n);
  const d = new THREE.Object3D();
  const shirts = [0xe10600, 0xffc629, 0x1d5fd6, 0xffffff, 0x00d2be, 0x7a2fd0, 0x222222, 0xff7a00, 0x2fa84f, 0xf2f2f2, 0xd8141c];
  const skins = [0xf1c9a5, 0xd9a47c, 0xb57f55, 0x8d5a3b, 0xf5d7bd];
  CROWD.body.forEach(([x, y, z, ry], i) => {
    d.position.set(x, y, z); d.rotation.set(0, ry, 0); d.updateMatrix();
    bodies.setMatrixAt(i, d.matrix); heads.setMatrixAt(i, d.matrix);
    bodies.setColorAt(i, col(pick(shirts))); heads.setColorAt(i, col(pick(skins)));
  });
  scene.add(bodies, heads);
}
function buildStands() {
  const L = TRACK.L;
  buildStand(L - 118, L - 12, -1, [['BUSES MAKE A BETTER TOMORROW ♥', '#ffffff', '#101418'], ['STUDENTS TODAY, CHAMPIONS TOMORROW', '#ffc629', '#111111'], ['SAME VEHICLES, BIGGER DREAMS ♥', '#ffffff', '#c3120c']]);
  buildStand(118, 262, -1, [['LET THE BEST BUS WIN!', '#e10600', '#ffffff'], ['FUELED BY STUDENTS', '#ffffff', '#101418'], ['DIFFERENT ROUTES. SAME FUTURE.', '#ffc629', '#111111']]);
  buildStand(L - 120, 40, 1, [['MORE THAN A RIDE — A COMMUNITY', '#ffffff', '#101418'], ['SAME ROADS. DIFFERENT LEGENDS.', '#101418', '#ffc629'], ['GO SULTAN GO!', '#7a2fd0', '#ffffff'], ['SPRINTER #2 ♥', '#00d2be', '#101418']]);
  buildStand(92, 250, 1, [['ANKARA LOVES SCHOOL BUSES', '#ffffff', '#c3120c'], ['DUCATO FAN CLUB', '#d8141c', '#ffffff'], ['OKUL SERVİSİ POWER!', '#ffc629', '#111111']]);
  finishCrowd();
}

// ---- bus stops: drive through the yellow box to pick up students (fills Student Power) ----
function kidGeometry(shirt, pants, skin, hair, bag) {
  return mergeColored([
    [boxAt(0.13, 0.55, 0.16, -0.08, 0.275, 0), pants], [boxAt(0.13, 0.55, 0.16, 0.08, 0.275, 0), pants],
    [boxAt(0.42, 0.5, 0.25, 0, 0.8, 0), shirt], [boxAt(0.1, 0.42, 0.12, -0.27, 0.82, 0), shirt], [boxAt(0.1, 0.42, 0.12, 0.27, 0.82, 0), shirt],
    [boxAt(0.27, 0.27, 0.25, 0, 1.2, 0), skin], [boxAt(0.3, 0.1, 0.28, 0, 1.36, -0.01), hair],
    [boxAt(0.34, 0.4, 0.16, 0, 0.84, -0.2), bag],
  ]);
}
function buildStops() {
  const L = TRACK.L;
  const defs = [[300, -1], [598, 1], [990, -1], [1480, 1], [1590, -1], [2010, 1]];
  const padTex = texLabel(512, 256, (g, w, h) => {
    g.fillStyle = 'rgba(255,198,41,.22)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffc629'; g.lineWidth = 14; g.setLineDash([36, 22]); g.strokeRect(10, 10, w - 20, h - 20); g.setLineDash([]);
    g.fillStyle = '#ffc629'; g.font = `italic 900 64px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'OKUL SERVİSİ', w / 2, h / 2 - 34, w - 70);
    g.font = `800 44px ${FONT_D}`; fitText(g, 'STOP', w / 2, h / 2 + 40, w - 70);
  });
  const signTex = texLabel(256, 256, (g) => {
    g.fillStyle = '#ffc629'; g.beginPath(); g.arc(128, 128, 122, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(128, 128, 108, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffc629'; g.font = `italic 900 64px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('OKUL', 128, 100); g.font = `800 40px ${FONT_D}`; g.fillText('SERVİSİ', 128, 158);
  });
  const markTex = texLabel(256, 256, (g) => {
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffc629'; g.lineWidth = 12; g.stroke();
    g.fillStyle = '#ffc629';
    for (const [x, sc] of [[92, 1], [164, 0.85]]) { g.beginPath(); g.arc(x, 88 + (1 - sc) * 30, 22 * sc, 0, Math.PI * 2); g.fill(); rrect(g, x - 26 * sc, 116 + (1 - sc) * 26, 52 * sc, 70 * sc, 12 * sc); g.fill(); }
    g.font = `italic 900 40px ${FONT_D}`; g.textAlign = 'center'; g.fillText('+ POWER', 128, 222);
  });
  const shirts = [0xf4f6f8, 0x1f3b73, 0xf4f6f8, 0x8a1c2b, 0xf4f6f8];
  const bags = [0xe10600, 0xffc629, 0x1d5fd6, 0x2fa84f, 0xff7a00, 0xd23fa8];
  const skins = [0xf1c9a5, 0xd9a47c, 0xb57f55, 0xf5d7bd];
  const hairs = [0x2a1a10, 0x4a2c16, 0x111111, 0x7a4a22];
  for (const [s, side] of defs) {
    const lat = side * (HW - 2.6);
    roadDecal(4.4, 9, padTex, s, lat, 0.065, { opacity: 0.95 });
    const grp = new THREE.Group();
    const p = placeOnTrack(grp, s, side * (WALL + 2.7), 0);
    const ax = -side * 1.9; // local x pointing away from the circuit
    const shelter = mergeColored([
      [boxAt(4.2, 0.6, 11, 0, 0.3, 0), 0xb9bcc1],
      [boxAt(0.12, 2.6, 0.12, ax * 0.1 - side * 0.0, 1.9, -3.2), 0x30343a], [boxAt(0.12, 2.6, 0.12, ax * 0.1, 1.9, 3.2), 0x30343a],
      [boxAt(0.1, 2.3, 6.6, ax * 0.55, 1.8, 0), 0x9fb4c6],
      [boxAt(2.3, 0.14, 7.2, ax * 0.3, 3.25, 0), 0xffc629],
      [boxAt(0.5, 0.45, 5, ax * 0.45, 0.85, 0), 0x6b4a2e],
      [cylAt(0.06, 0.06, 3.4, 6, -ax * 0.75, 2.3, -4.6), 0x30343a],
    ]);
    const sm = new THREE.Mesh(shelter, VCMAT()); sm.castShadow = true; sm.receiveShadow = true; grp.add(sm);
    const sign = new THREE.Mesh(new THREE.CircleGeometry(0.62, 24), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    sign.position.set(-ax * 0.75, 3.9, -4.6); sign.rotation.y = Math.PI; grp.add(sign);
    const kids = [];
    for (let k = 0; k < 5; k++) {
      const geo = kidGeometry(pick(shirts), pick([0x1f2a44, 0x2b2f3a, 0x3a3f4b]), pick(skins), pick(hairs), pick(bags));
      const kid = new THREE.Mesh(geo, VCMAT());
      const sc = rr(0.9, 1.08);
      kid.scale.setScalar(sc);
      kid.position.set(-ax * 0.45 + rr(-0.3, 0.3), 0.6, -3.6 + k * 1.6 + rr(-0.3, 0.3));
      kid.rotation.y = side * Math.PI / 2 + rr(-0.4, 0.4);
      kid.castShadow = true;
      kid.userData.home = kid.position.clone(); kid.userData.sc = sc;
      grp.add(kid); kids.push(kid);
    }
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: markTex, depthWrite: false, fog: false }));
    marker.scale.set(3.4, 3.4, 1); marker.position.set(-ax * 1.6, 6.5, 0); marker.renderOrder = 5; grp.add(marker);
    scene.add(grp);
    W.stops.push({ s, side, lat, kids, marker, grp, got: new Map(), anim: -1, backAt: 0 });
    reserve(grp.position.x, grp.position.z, 12);
  }
}

// ---- city blocks, trees and street lights ----
function Builder() { this.p = []; this.n = []; this.u = []; }
Builder.prototype.quad = function (a, b, c, d, n, t) {
  const V = [[a, t[0]], [b, t[1]], [c, t[2]], [a, t[0]], [c, t[2]], [d, t[3]]];
  for (const [v, uv] of V) { this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.u.push(uv[0], uv[1]); }
};
Builder.prototype.geo = function () {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
  return g;
};
function addBuilding(wb, rb, cx, cz, w, d, h, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const loc = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const C = loc.map(([x, z]) => [cx + x * c + z * s, cz - x * s + z * c]);
  const order = [0, 3, 2, 1, 0];
  let uo = Math.floor(rnd() * 4) * 0.25;
  for (let k = 0; k < 4; k++) {
    const A = C[order[k]], B = C[order[k + 1]];
    const ex = B[0] - A[0], ez = B[1] - A[1], len = Math.hypot(ex, ez);
    const n = [-ez / len, 0, ex / len];
    const u1 = uo + len / 12.8, v1 = h / 12;
    wb.quad([A[0], 0, A[1]], [B[0], 0, B[1]], [B[0], h, B[1]], [A[0], h, A[1]], n, [[uo, 0], [u1, 0], [u1, v1], [uo, v1]]);
    uo = u1;
  }
  const r = [0, 3, 2, 1].map((i) => [C[i][0], h, C[i][1]]);
  rb.quad(r[0], r[1], r[2], r[3], [0, 1, 0], [[0, 0], [0, 1], [1, 1], [1, 0]]);
}
function buildCity() {
  const T = TRACK, pals = [['#e9dcc0', '#8b7355'], ['#f1ede4', '#9aa0a6'], ['#d9c2a3', '#7a5c45'], ['#c9d3d8', '#5d6d78'], ['#efc9a8', '#8a5a3c']];
  const B = pals.map(() => new Builder()), roof = new Builder();
  const placed = [];
  const tmp = {};
  const lot = W.lot;
  const inLot = (x, z, m) => x > lot.x0 - m && x < lot.x1 + m && z > lot.z0 - m && z < lot.z1 + m;
  const tryPlace = (x, z, w, d, h, yaw) => {
    const rad = Math.hypot(w, d) / 2;
    if (T.clearance(x, z) < WALL + 7 + rad * 0.6) return false;
    if (isReserved(x, z, rad) || inLot(x, z, rad)) return false;
    for (const q of placed) { const dx = q[0] - x, dz = q[1] - z; if (dx * dx + dz * dz < (q[2] + rad + 3) ** 2) return false; }
    placed.push([x, z, rad]);
    addBuilding(pick(B), roof, x, z, w, d, h, yaw);
    return true;
  };
  for (let s = 0; s < T.L; s += rr(20, 30)) {
    for (const side of [1, -1]) {
      for (const ring of [0, 1]) {
        if (rnd() < 0.18) continue;
        const w = rr(14, 30), d = rr(12, 22), h = rnd() < 0.15 ? rr(36, 52) : rr(11, 30);
        T.pointAt(s, side * (WALL + 12 + d / 2 + ring * rr(30, 44)), tmp);
        tryPlace(tmp.x, tmp.z, w, d, h, tmp.yaw);
      }
    }
  }
  pals.forEach((pl, i) => {
    const t = texFacade(pl[0], pl[1]);
    const m = new THREE.Mesh(B[i].geo(), new THREE.MeshLambertMaterial({ map: t }));
    m.castShadow = true; m.receiveShadow = true; scene.add(m);
  });
  const rm = new THREE.Mesh(roof.geo(), new THREE.MeshLambertMaterial({ color: col(0x6f7378) }));
  rm.receiveShadow = true; scene.add(rm);
  W.buildings = placed;

  // trees
  const spots = [];
  const okTree = (x, z) => {
    if (T.clearance(x, z) < WALL + 2.8) return false;
    if (isReserved(x, z, 2) || inLot(x, z, 2)) return false;
    for (const q of placed) { const dx = q[0] - x, dz = q[1] - z; if (dx * dx + dz * dz < (q[2] + 2.5) ** 2) return false; }
    return true;
  };
  for (let s = 0; s < T.L; s += rr(9, 16)) for (const side of [1, -1]) {
    if (rnd() < 0.35) continue;
    T.pointAt(s, side * (WALL + rr(4, 8)), tmp);
    if (okTree(tmp.x, tmp.z)) spots.push([tmp.x, tmp.z, rr(0.8, 1.25)]);
  }
  for (let i = 0; i < 520; i++) {
    const x = rr(-600, 700), z = rr(-300, 780);
    if (okTree(x, z)) spots.push([x, z, rr(0.8, 1.4)]);
  }
  const trunkG = new THREE.CylinderGeometry(0.16, 0.24, 2.4, 6); trunkG.translate(0, 1.2, 0);
  const crownG = new THREE.IcosahedronGeometry(1.9, 0); crownG.translate(0, 3.6, 0);
  const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshLambertMaterial({ color: col(0x6b4a2e) }), spots.length);
  const crowns = new THREE.InstancedMesh(crownG, new THREE.MeshPhongMaterial({ flatShading: true, shininess: 0, specular: 0x000000 }), spots.length);
  const d = new THREE.Object3D();
  const greens = [0x4f8a36, 0x3f7a2e, 0x5f9a3e, 0x6ea648, 0x3b6e2a];
  spots.forEach(([x, z, sc], i) => {
    d.position.set(x, 0, z); d.rotation.set(0, rnd() * 6.28, 0); d.scale.set(sc, sc * rr(0.9, 1.25), sc); d.updateMatrix();
    trunks.setMatrixAt(i, d.matrix); crowns.setMatrixAt(i, d.matrix); crowns.setColorAt(i, col(pick(greens)));
  });
  trunks.castShadow = crowns.castShadow = true;
  scene.add(trunks, crowns);

  // street lights along the circuit
  const lampG = mergeColored([
    [cylAt(0.09, 0.14, 9, 6, 0, 4.5, 0), 0x5d636b], [boxAt(2.6, 0.12, 0.12, 1.25, 8.9, 0), 0x5d636b], [boxAt(0.9, 0.16, 0.45, 2.55, 8.85, 0), 0xe9eef2],
  ]);
  const lampSpots = [];
  for (let s = 18; s < T.L; s += 38) for (const side of [1, -1]) {
    if (s < 30 || s > T.L - 30) continue;
    const q = T.pointAt(s + (side > 0 ? 19 : 0), side * (WALL + 1.4), {});
    if (isReserved(q.x, q.z, 1)) continue;
    lampSpots.push([q.x, q.z, side > 0 ? q.yaw : q.yaw + Math.PI]);
  }
  const lamps = new THREE.InstancedMesh(lampG, VCMAT(), lampSpots.length);
  lampSpots.forEach(([x, z, yaw], i) => { d.position.set(x, 0, z); d.rotation.set(0, yaw, 0); d.scale.set(1, 1, 1); d.updateMatrix(); lamps.setMatrixAt(i, d.matrix); });
  lamps.castShadow = true; scene.add(lamps);

  // parked cars in the lot
  const carG = mergeColored([[boxAt(1.8, 0.8, 4.3, 0, 0.6, 0), 0xffffff], [boxAt(1.6, 0.6, 2.2, 0, 1.25, -0.2), 0xffffff], [boxAt(1.62, 0.45, 2.0, 0, 1.25, -0.2), 0x222a33]]);
  const carSpots = [];
  for (let x = lot.x0 + 6; x < lot.x1 - 4; x += 2.5) for (let z = lot.z0 + 4; z < lot.z1; z += 20) {
    for (const off of [2.5, 17.5]) {
      const zz = z + off - 2.5; if (zz > lot.z1 - 3) continue;
      if (T.clearance(x, zz) < WALL + 3.5 || rnd() < 0.45) continue;
      carSpots.push([x, zz]);
    }
  }
  const cars = new THREE.InstancedMesh(carG, new THREE.MeshLambertMaterial({ vertexColors: true }), Math.max(1, carSpots.length));
  const carCols = [0xd9dde2, 0x1d2025, 0xa31919, 0x2a5aa8, 0x8c9096, 0xf4f4f4, 0x6d4b2d];
  carSpots.forEach(([x, z], i) => { d.position.set(x, 0, z); d.rotation.set(0, (rnd() < 0.5 ? 0 : Math.PI), 0); d.updateMatrix(); cars.setMatrixAt(i, d.matrix); cars.setColorAt(i, col(pick(carCols))); });
  cars.count = carSpots.length; cars.castShadow = true; scene.add(cars);
  // car park sign
  const lotSign = texLabel(1024, 256, (g, w, h) => {
    g.fillStyle = '#1d5fd6'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(24, 24, 200, 208);
    g.fillStyle = '#1d5fd6'; g.font = `900 190px ${FONT_U}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', 124, 136);
    g.fillStyle = '#fff'; g.font = `italic 900 70px ${FONT_D}`; g.textAlign = 'left'; fitText(g, 'CAR PARK STAGE', 260, 96, 720);
    g.font = `800 44px ${FONT_D}`; g.fillStyle = '#ffc629'; fitText(g, 'SCHOOL BUS RACE · SECTOR 3', 262, 176, 720);
  });
  const ps = new THREE.Group();
  const pp = placeOnTrack(ps, W.park.s0 + 20, WALL + 8.5, 0);
  ps.rotation.y = pp.yaw + Math.PI;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshLambertMaterial({ map: lotSign }));
  board.position.y = 5.2; ps.add(board);
  ps.add(new THREE.Mesh(mergeColored([[cylAt(0.15, 0.15, 5, 6, -4.5, 2.5, 0.1), 0x5d636b], [cylAt(0.15, 0.15, 5, 6, 4.5, 2.5, 0.1), 0x5d636b]]), VCMAT()));
  scene.add(ps);
}

// ---- distant Ankara hills, skyline and clouds ----
function buildHorizon() {
  const cx = 35, cz = 233, parts = [];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + rr(-0.05, 0.05), r = rr(1500, 2100), h = rr(90, 230), rad = rr(260, 460);
    const g = new THREE.ConeGeometry(rad, h, 7); g.translate(cx + Math.cos(a) * r, h / 2 - 4, cz + Math.sin(a) * r);
    parts.push([g, pick([0x8b8f78, 0x7f866c, 0x9a8f78, 0x8a8a7c])]);
  }
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, r = rr(820, 1250), h = rr(18, 80), w = rr(20, 50);
    parts.push([boxAt(w, h, rr(20, 45), cx + Math.cos(a) * r, h / 2, cz + Math.sin(a) * r, rnd() * 3), pick([0xb7c0c9, 0xa6afb9, 0xc8c3b8, 0x9ea9b4])]);
  }
  const m = new THREE.Mesh(mergeColored(parts), new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 0, specular: 0x000000 }));
  scene.add(m);
  const cloud = texLabel(256, 128, (g) => {
    for (let i = 0; i < 16; i++) { const x = rr(50, 206), y = rr(52, 84), r = rr(20, 44); const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  });
  W.cloudGroup = new THREE.Group();
  for (let i = 0; i < 22; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloud, depthWrite: false, fog: false, opacity: rr(0.6, 0.95) }));
    const a = rnd() * Math.PI * 2, r = rr(300, 1700), sc = rr(220, 460);
    sp.position.set(cx + Math.cos(a) * r, rr(320, 560), cz + Math.sin(a) * r); sp.scale.set(sc, sc * 0.45, 1);
    W.cloudGroup.add(sp);
  }
  scene.add(W.cloudGroup);
}
function buildWorld() {
  TRACK = buildTrack();
  buildSky();
  buildCircuit();
  buildGantry();
  buildSchool();
  buildStands();
  buildStops();
  buildPit();
  buildCity();
  buildHorizon();
}

// =====================================================================
//  PIT LANE: surfaces, walls, garages, boxes and crews (left side, after the car park)
// =====================================================================
const PITV = { crews: [] };
function crewGeo(color) {
  return mergeColored([
    [boxAt(0.17, 0.85, 0.2, -0.1, 0.425, 0), 0x22262c], [boxAt(0.17, 0.85, 0.2, 0.1, 0.425, 0), 0x22262c],
    [boxAt(0.52, 0.66, 0.3, 0, 1.18, 0), color], [boxAt(0.12, 0.6, 0.14, -0.33, 1.2, 0), color], [boxAt(0.12, 0.6, 0.14, 0.33, 1.2, 0), color],
    [boxAt(0.28, 0.3, 0.28, 0, 1.67, 0), 0xe0b08a], [boxAt(0.32, 0.12, 0.34, 0, 1.86, 0.02), color],
  ]);
}
function buildPit() {
  const T = TRACK, i0 = Math.floor(PIT.s0 / T.ds), cnt = Math.ceil(PIT.s1 / T.ds) - i0;
  // lane surface from the road edge out to the outer pit wall
  const laneMat = new THREE.MeshStandardMaterial({ map: texAsphalt(false), roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const lane = new THREE.Mesh(stripGeo(T, (s) => pitOuter(s) - 0.4, -HW + 0.2, 0.028, 0.028, { i0, cnt, vLen: 16 }), laneMat);
  lane.receiveShadow = true; scene.add(lane);
  // outer wall that follows the widening
  const WH = 1.15;
  const pitTex = texLabel(2048, 128, (g, w, h) => {
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#f2f2f2' : '#1b2230'; g.fillRect(i * 512, 0, 512, h);
      g.fillStyle = i % 2 ? '#e10600' : '#ffc629'; g.font = `italic 900 76px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      fitText(g, i % 2 ? 'PIT LANE' : 'TYRES · BOX', i * 512 + 256, 68, 470);
    }
  });
  pitTex.wrapS = pitTex.wrapT = THREE.RepeatWrapping;
  const outerOff = (s) => pitOuter(s) - 0.55;
  const wallIn = new THREE.Mesh(stripGeo(T, pitOuter, pitOuter, 0, WH, { i0, cnt, vLen: 16, swap: true, flip: true }), new THREE.MeshLambertMaterial({ map: pitTex }));
  const wallTop = new THREE.Mesh(stripGeo(T, outerOff, pitOuter, WH, WH, { i0, cnt }), new THREE.MeshLambertMaterial({ color: col(0xb9bcc0) }));
  const wallOut = new THREE.Mesh(stripGeo(T, outerOff, outerOff, 0, WH, { i0, cnt }), new THREE.MeshLambertMaterial({ color: col(0x8e9296) }));
  wallIn.castShadow = wallTop.castShadow = true; wallIn.receiveShadow = true;
  scene.add(wallIn, wallTop, wallOut);
  // red and white divider between the circuit and the pit lane
  const da = Math.ceil((PIT.s0 + PIT.gap) / T.ds), dcnt = Math.floor((PIT.s1 - PIT.gap) / T.ds) - da, DH = 0.95;
  const divMat = new THREE.MeshLambertMaterial({ map: texKerb() });
  const dIn = new THREE.Mesh(stripGeo(T, -DIV_IN, -DIV_IN, 0, DH, { i0: da, cnt: dcnt, vLen: 3.2, swap: true, flip: true }), divMat);
  const dOut = new THREE.Mesh(stripGeo(T, -DIV_OUT, -DIV_OUT, 0, DH, { i0: da, cnt: dcnt, vLen: 3.2, swap: true }), divMat);
  const dTop = new THREE.Mesh(stripGeo(T, -DIV_OUT, -DIV_IN, DH, DH, { i0: da, cnt: dcnt }), new THREE.MeshLambertMaterial({ color: col(0xf2f2f2) }));
  dIn.castShadow = dOut.castShadow = true; scene.add(dIn, dOut, dTop);
  for (const s of [PIT.s0 + PIT.gap, PIT.s1 - PIT.gap]) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, DH + 0.1, 0.5), new THREE.MeshLambertMaterial({ color: col(0xffc629) }));
    placeOnTrack(cap, s, -(DIV_IN + DIV_OUT) / 2, (DH + 0.1) / 2); scene.add(cap);
  }
  // boxes painted on the lane
  for (let k = 0; k < 6; k++) {
    const d = BUSES[k];
    const bt = texLabel(256, 512, (g, w, h) => {
      g.fillStyle = 'rgba(255,198,41,.16)'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#ffc629'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = d.hud; g.fillRect(8, h - 70, w - 16, 20);
      g.fillStyle = '#f2f2f2'; g.font = `italic 900 170px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d.num), w / 2, h / 2 - 20);
      g.font = `800 48px ${FONT_D}`; g.fillText('BOX', w / 2, h / 2 + 100);
    });
    roadDecal(4.4, 8, bt, PIT.boxS(k), PIT.boxLat, 0.07);
  }
  const lim = texLabel(512, 256, (g, w, h) => {
    g.strokeStyle = '#f4f4f4'; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, h / 2, 110, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#f4f4f4'; g.font = `900 120px ${FONT_U}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('80', w / 2, h / 2 + 6);
  });
  roadDecal(5, 2.5, lim, PIT.s0 + PIT.gap - 6, PIT.fast, 0.07);
  const arrow = texLabel(512, 256, (g, w, h) => {
    g.fillStyle = 'rgba(245,245,245,.85)'; g.font = `italic 900 120px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PIT', w / 2 + 60, h / 2 + 6);
    g.beginPath(); g.moveTo(40, h / 2); g.lineTo(150, h / 2 - 70); g.lineTo(150, h / 2 + 70); g.closePath(); g.fill();
  });
  roadDecal(7, 3.5, arrow, PIT.s0 - 45, -5.5, 0.07);
  // entry sign
  const sg = new THREE.Group(); const sp = placeOnTrack(sg, PIT.s0 - 80, -(WALL + 2.4), 0); sg.rotation.y = sp.yaw + Math.PI;
  const signTex = texLabel(512, 160, (g, w, h) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffc629';
    g.beginPath(); g.moveTo(30, h / 2); g.lineTo(130, 22); g.lineTo(130, h - 22); g.closePath(); g.fill();
    g.font = `italic 900 96px ${FONT_D}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('PIT LANE', 160, h / 2 + 4);
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false })); board.position.y = 4.4; sg.add(board);
  sg.add(new THREE.Mesh(mergeColored([[cylAt(0.12, 0.12, 4.4, 6, -2.8, 2.2, 0.08), 0x5d636b], [cylAt(0.12, 0.12, 4.4, 6, 2.8, 2.2, 0.08), 0x5d636b]]), VCMAT()));
  scene.add(sg);
  // garages facing the boxes
  const sMid = (PIT.boxS(0) + PIT.boxS(5)) / 2, len = PIT.box * 6, dep = 13, hgt = 7.5;
  const gp = TRACK.pointAt(sMid, -(WALL + PIT.w + 0.55 + dep / 2 + 0.6), {});
  const grp = new THREE.Group(); grp.position.set(gp.x, 0, gp.z); grp.rotation.y = facingTrack(gp, -1);
  const gTex = texLabel(2304, 320, (g, w, h) => {
    g.fillStyle = '#d9dde2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#12161f'; g.fillRect(0, 0, w, 70);
    g.fillStyle = '#ffffff'; g.font = `italic 900 54px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PIT LANE · SCHOOL BUS RACE · ANKA BİLİM GP', w / 2, 38);
    const bw = w / 6;
    for (let k = 0; k < 6; k++) {
      const x = k * bw;
      g.fillStyle = BUSES[k].hud; g.fillRect(x + 14, 84, bw - 28, 40);
      g.fillStyle = '#111'; g.font = `italic 900 34px ${FONT_D}`; g.fillText(BUSES[k].num + ' · ' + BUSES[k].model.toUpperCase(), x + bw / 2, 106);
      const gr = g.createLinearGradient(0, 130, 0, h); gr.addColorStop(0, '#2a2f37'); gr.addColorStop(1, '#0d1014');
      g.fillStyle = gr; g.fillRect(x + 22, 134, bw - 44, h - 134);
    }
  });
  const grey = new THREE.MeshLambertMaterial({ color: col(0xc9ced4) });
  const gm = new THREE.Mesh(new THREE.BoxGeometry(len, hgt, dep), [grey, grey, new THREE.MeshLambertMaterial({ color: col(0x6f7378) }), grey, new THREE.MeshLambertMaterial({ map: gTex }), grey]);
  gm.position.y = hgt / 2; gm.castShadow = true; gm.receiveShadow = true; grp.add(gm);
  scene.add(grp);
  // a crew of four at every box
  for (let k = 0; k < 6; k++) {
    const list = [], geo = crewGeo(parseInt(BUSES[k].hud.slice(1), 16));
    for (let j = 0; j < 4; j++) {
      const m = new THREE.Mesh(geo, VCMAT()); m.castShadow = true;
      const q = TRACK.pointAt(PIT.boxS(k) + (j - 1.5) * 1.9, PIT.crewLat, {});
      m.position.set(q.x, 0, q.z); m.rotation.y = facingTrack(q, -1);
      scene.add(m); list.push({ m, home: m.position.clone(), yaw: m.rotation.y });
    }
    PITV.crews.push(list);
  }
  for (let t = 0; t <= 1.0001; t += 0.1) { const q = TRACK.pointAt(PIT.s0 + (PIT.s1 - PIT.s0) * t, -(WALL + 16), {}); reserve(q.x, q.z, 17); }
}
// crews run to the wheels while their bus is stopped for new tyres
const CREW_V = new THREE.Vector3();
function updatePitCrews(dt, time) {
  for (let k = 0; k < PITV.crews.length; k++) {
    const b = RACE.buses.find((x) => x.def.num === k + 1);
    const busy = !!b && b.pitT > 0;
    PITV.crews[k].forEach((c, j) => {
      if (busy) {
        const w = b.m.wheels[j], sy = Math.sin(b.yaw), cy = Math.cos(b.yaw), out = w.pivot.position.x > 0 ? 0.9 : -0.9;
        const lx = w.pivot.position.x + out, lz = w.pivot.position.z;
        CREW_V.set(b.x + lx * cy + lz * sy, 0, b.z - lx * sy + lz * cy);
        c.m.rotation.y = b.yaw + (out > 0 ? -Math.PI / 2 : Math.PI / 2);
        c.m.scale.set(1, 0.72 + Math.sin(time * 18 + j) * 0.04, 1);
      } else { CREW_V.copy(c.home); c.m.rotation.y = c.yaw; c.m.scale.set(1, 1, 1); }
      c.m.position.lerp(CREW_V, Math.min(1, dt * (busy ? 9 : 3)));
    });
  }
}

// =====================================================================
//  BUS MODELS — extruded van silhouettes with painted liveries
// =====================================================================
function busProfile(def) {
  const { L, W, H } = def.dim, p = def.prof, gc = 0.36, bh = H - gc;
  const P = { L, W, H, gc, bh, hoodV: p.hoodH - gc, hoodL: p.hood, wsL: p.ws, rf: def.midi ? 0.22 : 0.34, rr: 0.22, nose: p.noseR };
  P.uWsBase = L - P.hoodL; P.uWsTop = L - P.hoodL - P.wsL;
  P.A = [P.uWsTop + P.rf * 0.55, bh - P.rf * 0.7];          // windscreen top
  P.B = [P.uWsBase, P.hoodV + 0.04];                         // windscreen base
  P.winB = P.hoodV + (def.midi ? 0.02 : 0.12);               // side window bottom
  P.winT = bh - (def.midi ? 0.22 : 0.3);                     // side window top
  P.wheelR = def.midi ? 0.45 : 0.37;
  P.axF = def.midi ? L - 1.9 : L - 0.98;                     // axle positions along u
  P.axR = def.midi ? 1.95 : 1.3;
  return P;
}
function busShape(P) {
  const s = new THREE.Shape();
  s.moveTo(0.06, 0);
  s.lineTo(0, 0.22);
  s.lineTo(0, P.bh - P.rr);
  s.quadraticCurveTo(0, P.bh, P.rr, P.bh);
  s.lineTo(P.uWsTop - P.rf, P.bh);
  s.quadraticCurveTo(P.uWsTop + 0.05, P.bh, P.A[0], P.A[1]);
  s.lineTo(P.B[0], P.B[1]);
  s.quadraticCurveTo(P.uWsBase + P.hoodL * 0.5, P.hoodV, P.L - P.nose, P.hoodV - 0.08);
  s.quadraticCurveTo(P.L, P.hoodV - 0.12, P.L, P.hoodV - 0.1 - P.nose);
  s.lineTo(P.L, 0.2);
  s.quadraticCurveTo(P.L, 0, P.L - 0.15, 0);
  s.lineTo(0.06, 0);
  return s;
}
// u position of the windscreen line at height v
function wsU(P, v) { const t = (v - P.B[1]) / (P.A[1] - P.B[1]); return P.B[0] + (P.A[0] - P.B[0]) * t; }

function texLivery(def, P) {
  const c = cv(1024, 512), g = c.getContext('2d');
  g.setTransform(1024 / P.L, 0, 0, -512 / P.bh, 0, 512);
  const body = '#' + new THREE.Color(def.body).getHexString();
  g.fillStyle = body; g.fillRect(-1, -1, P.L + 2, P.bh + 2);
  const sh = g.createLinearGradient(0, 0, 0, P.bh);
  sh.addColorStop(0, 'rgba(0,0,0,.18)'); sh.addColorStop(0.25, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(255,255,255,.06)'); sh.addColorStop(1, 'rgba(0,0,0,.06)');
  g.fillStyle = sh; g.fillRect(0, 0, P.L, P.bh);
  const L = P.L, wb = P.winB;
  // livery sweep
  g.fillStyle = def.stripe2;
  g.beginPath(); g.moveTo(0, 0.12); g.lineTo(0, 0.52); g.lineTo(L * 0.5, 0.52); g.bezierCurveTo(L * 0.64, 0.52, L * 0.7, wb - 0.08, L * 0.8, wb - 0.08); g.lineTo(L * 0.9, wb - 0.08); g.bezierCurveTo(L * 0.78, 0.3, L * 0.7, 0.12, L * 0.55, 0.12); g.closePath(); g.fill();
  g.fillStyle = def.stripe;
  g.beginPath(); g.moveTo(0, 0.12); g.lineTo(0, 0.4); g.lineTo(L * 0.52, 0.4); g.bezierCurveTo(L * 0.66, 0.4, L * 0.72, wb - 0.2, L * 0.84, wb - 0.2); g.lineTo(L * 0.93, wb - 0.2); g.bezierCurveTo(L * 0.82, 0.2, L * 0.72, 0.12, L * 0.56, 0.12); g.closePath(); g.fill();
  for (let i = 0; i < 3; i++) { const x = 0.25 + i * 0.32; g.beginPath(); g.moveTo(x, 0.62); g.lineTo(x + 0.16, 0.62); g.lineTo(x + 0.46, wb - 0.1); g.lineTo(x + 0.3, wb - 0.1); g.closePath(); g.fill(); }
  // window band
  const front = wsU(P, (wb + P.winT) / 2);
  g.fillStyle = '#0c0f13';
  g.beginPath(); g.moveTo(0.2, wb - 0.06); g.lineTo(0.2, P.winT + 0.06); g.lineTo(wsU(P, P.winT + 0.06) - 0.06, P.winT + 0.06); g.lineTo(wsU(P, wb - 0.06) - 0.06, wb - 0.06); g.closePath(); g.fill();
  const glass = g.createLinearGradient(0, wb, 0, P.winT);
  glass.addColorStop(0, '#0d141b'); glass.addColorStop(0.55, '#243546'); glass.addColorStop(1, '#6b8196');
  const doorU = front - (def.midi ? 1.35 : 1.05);
  const panes = [];
  const n = Math.max(2, Math.round((doorU - 0.4) / (def.midi ? 1.05 : 1.2)));
  const pw = (doorU - 0.32 - 0.1) / n;
  for (let i = 0; i < n; i++) panes.push([0.32 + i * pw, pw - 0.1]);
  g.fillStyle = glass;
  for (const [x, w] of panes) { rrect(g, x, wb, w, P.winT - wb, 0.08); g.fill(); }
  g.beginPath(); g.moveTo(doorU, wb); g.lineTo(doorU, P.winT); g.lineTo(wsU(P, P.winT) - 0.12, P.winT); g.lineTo(wsU(P, wb) - 0.12, wb); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.16)';
  for (const [x, w] of panes) { g.beginPath(); g.moveTo(x + w * 0.2, P.winT - 0.02); g.lineTo(x + w * 0.45, P.winT - 0.02); g.lineTo(x + w * 0.2, wb + 0.25); g.lineTo(x + w * 0.02, wb + 0.25); g.closePath(); g.fill(); }
  // chequered belt band under the windows (OKUL TAŞITI marking)
  const b0 = wb - 0.24, b1 = wb - 0.07, cu0 = 0.3, cu1 = Math.min(doorU - 0.2, L * 0.62);
  g.fillStyle = '#ffc629'; g.fillRect(cu0, b0, cu1 - cu0, b1 - b0);
  g.fillStyle = '#111';
  const sq = (b1 - b0) / 2;
  for (let x = cu0, k = 0; x < cu1 - 0.01; x += sq, k++) { if (x > cu0 + 0.55 && x < cu1 - 0.6) continue; g.fillRect(x, k % 2 ? b0 : b0 + sq, sq, sq); }
  // door seams
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 0.018;
  g.beginPath(); g.moveTo(doorU - 0.02, 0.12); g.lineTo(doorU - 0.02, wb - 0.04); g.stroke();
  const sd = doorU - (def.midi ? 1.1 : 1.25);
  g.beginPath(); g.moveTo(sd, 0.12); g.lineTo(sd, P.winT + 0.1); g.stroke();
  g.beginPath(); g.moveTo(sd + (def.midi ? 1.0 : 1.15), 0.12); g.lineTo(sd + (def.midi ? 1.0 : 1.15), P.winT + 0.1); g.stroke();
  // sill + wheel arches
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, -0.1, L, 0.16);
  g.fillStyle = '#121416';
  for (const u of [P.axF, P.axR]) { g.beginPath(); g.arc(u, P.wheelR - P.gc, P.wheelR + 0.1, 0, Math.PI); g.fill(); }
  return tex(c, false);
}
function texRoundel(def) {
  return texLabel(256, 256, (g) => {
    g.fillStyle = def.stripe; g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111'; g.font = `italic 900 150px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(def.num), 124, 138);
  });
}
function texOkulPlate() {
  return texLabel(512, 96, (g, w, h) => {
    g.fillStyle = '#ffc629'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#111'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#111'; g.font = `900 64px ${FONT_U}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'OKUL TAŞITI', w / 2, h / 2 + 4, w - 40);
  });
}
function texLED() {
  return texLabel(512, 96, (g, w, h) => {
    g.fillStyle = '#070707'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffc629'; g.font = `800 60px ${FONT_U}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, 'OKUL SERVİSİ', w / 2, h / 2 + 3, w - 30);
  });
}
function texPlate(def) {
  return texLabel(256, 56, (g, w, h) => {
    g.fillStyle = '#f7f7f7'; g.fillRect(0, 0, w, h); g.fillStyle = '#123c9c'; g.fillRect(0, 0, 30, h);
    g.fillStyle = '#fff'; g.font = `700 18px ${FONT_U}`; g.textAlign = 'center'; g.fillText('TR', 15, 44);
    g.fillStyle = '#111'; g.font = `700 40px ${FONT_U}`; g.textBaseline = 'middle'; fitText(g, '06 SBR 0' + def.num, 143, 31, 214);
  });
}
function texBadge(kind) {
  return texLabel(128, 128, (g) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const disc = (f) => { g.fillStyle = f; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill(); };
    if (kind === 'ford') { g.fillStyle = '#123c9c'; g.beginPath(); g.ellipse(64, 64, 62, 34, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#dfe6f2'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#fff'; g.font = `italic 700 40px Georgia, serif`; g.fillText('Ford', 64, 66); }
    else if (kind === 'mercedes') { disc('#c7ccd3'); g.fillStyle = '#20242a'; g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#e6e9ee'; g.lineWidth = 7; g.beginPath(); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; g.moveTo(64, 64); g.lineTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); } g.stroke(); }
    else if (kind === 'vw') { disc('#dfe6f2'); g.fillStyle = '#123c9c'; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = `900 52px ${FONT_U}`; g.fillText('VW', 64, 68); }
    else if (kind === 'renault') { g.strokeStyle = '#e6e9ee'; g.lineWidth = 12; g.beginPath(); g.moveTo(64, 6); g.lineTo(100, 64); g.lineTo(64, 122); g.lineTo(28, 64); g.closePath(); g.stroke(); }
    else if (kind === 'fiat') { disc('#c7ccd3'); g.fillStyle = '#b3121a'; rrect(g, 16, 16, 96, 96, 22); g.fill(); g.fillStyle = '#fff'; g.font = `900 38px ${FONT_U}`; g.fillText('FIAT', 64, 67); }
    else { g.fillStyle = '#123c9c'; g.beginPath(); g.ellipse(64, 64, 62, 30, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = `italic 900 28px ${FONT_D}`; g.fillText('OTOKAR', 64, 66); }
  });
}
function texRear(def) {
  return texLabel(512, 232, (g, w, h) => {
    g.fillStyle = def.stripe; g.beginPath(); g.arc(108, 116, 100, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(108, 116, 84, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111'; g.font = `italic 900 124px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(def.num), 104, 126);
    g.fillStyle = '#ffc629'; g.fillRect(226, 16, 276, 76); g.strokeStyle = '#111'; g.lineWidth = 7; g.strokeRect(230, 20, 268, 68);
    g.fillStyle = '#111'; g.font = `900 50px ${FONT_U}`; fitText(g, 'OKUL TAŞITI', 364, 58, 250);
    g.fillStyle = def.dark ? '#e9edf2' : '#1b1f25'; g.font = `italic 900 56px ${FONT_D}`; g.textAlign = 'left'; fitText(g, def.model.toUpperCase(), 228, 150, 272);
    g.font = `800 28px ${FONT_D}`; g.fillStyle = def.stripe; fitText(g, def.brand.toUpperCase(), 230, 200, 260);
  });
}
function texRearGlass() {
  return texLabel(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5e7489'); gr.addColorStop(0.5, '#1d2a37'); gr.addColorStop(1, '#0c1117');
    g.fillStyle = gr; rrect(g, 8, 8, 114, 112, 12); g.fill(); rrect(g, 134, 8, 114, 112, 12); g.fill();
  });
}
function texHub() {
  return texLabel(128, 128, (g) => {
    g.fillStyle = '#c9ced6'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a3f46'; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.beginPath(); g.arc(64 + Math.cos(a) * 36, 64 + Math.sin(a) * 36, 12, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#8b929c'; g.beginPath(); g.arc(64, 64, 14, 0, Math.PI * 2); g.fill();
  });
}
const BUSX = {};
function busShared() {
  if (BUSX.ready) return BUSX;
  BUSX.tire = new THREE.CylinderGeometry(1, 1, 1, 22); BUSX.tire.rotateZ(Math.PI / 2);
  BUSX.tireMat = new THREE.MeshStandardMaterial({ color: col(0x161616), roughness: 0.92 });
  BUSX.hub = new THREE.CircleGeometry(0.66, 20);
  BUSX.hubMat = new THREE.MeshStandardMaterial({ map: texHub(), roughness: 0.4, metalness: 0.5 });
  BUSX.glass = new THREE.MeshStandardMaterial({ color: col(0x10171f), roughness: 0.08, metalness: 0.55 });
  BUSX.dark = new THREE.MeshStandardMaterial({ color: col(0x202327), roughness: 0.6 });
  BUSX.blob = texBlob();
  BUSX.okul = texOkulPlate(); BUSX.led = texLED(); BUSX.rearGlass = texRearGlass();
  BUSX.flame = new THREE.ConeGeometry(0.16, 1.1, 10, 1, true); BUSX.flame.rotateX(-Math.PI / 2); BUSX.flame.translate(0, 0, -0.55);
  BUSX.ready = true;
  return BUSX;
}
function decal(map, w, h, opts) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial(Object.assign({ map, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }, opts || {})));
}
function buildBusModel(def) {
  const X = busShared(), P = busProfile(def), bev = 0.07;
  const glassMat = X.glass.clone(), tireMat = X.tireMat.clone(), hubMat = X.hubMat.clone();
  const grp = new THREE.Group(), body = new THREE.Group();
  grp.add(body);
  const geo = new THREE.ExtrudeGeometry(busShape(P), { depth: P.W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 8, steps: 1 });
  geo.rotateY(-Math.PI / 2); geo.translate((P.W - 2 * bev) / 2, P.gc, -P.L / 2);
  const livery = texLivery(def, P); livery.repeat.set(1 / P.L, 1 / P.bh);
  const paint = new THREE.MeshStandardMaterial({ color: col(def.body), roughness: 0.38, metalness: 0.15 });
  const shell = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ map: livery, roughness: 0.38, metalness: 0.15 }), paint]);
  shell.castShadow = true; body.add(shell);
  const zf = P.L / 2, zr = -P.L / 2;
  // windscreen
  const dx = P.B[0] - P.A[0], dy = P.B[1] - P.A[1], dl = Math.hypot(dx, dy), nu = -dy / dl, nv = dx / dl;
  // windscreen: dark cab, the driver's face, tinted glass in front (t: 0 = base of the screen, 1 = top)
  const wsAt = (off, t, xo, w, h, mat) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    const u = P.B[0] + (P.A[0] - P.B[0]) * t + nu * off, v = P.B[1] + (P.A[1] - P.B[1]) * t + nv * off;
    m.position.set(xo, P.gc + v, u - P.L / 2); m.rotation.x = -Math.atan2(nv, nu); body.add(m); return m;
  };
  wsAt(bev + 0.012, 0.5, 0, P.W - 0.22, dl - 0.08, new THREE.MeshBasicMaterial({ color: col(0x0b0e13) }));
  const face = wsAt(bev + 0.03, def.midi ? 0.34 : 0.42, P.W / 2 - 0.62, 0.62, 0.68, new THREE.MeshBasicMaterial({ color: col(0xdddddd) }));
  glassMat.transparent = true; glassMat.opacity = 0.4;
  const ws = wsAt(bev + 0.05, 0.5, 0, P.W - 0.22, dl - 0.08, glassMat);
  const led = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.5, P.W - 0.5), 0.26), new THREE.MeshBasicMaterial({ map: X.led, toneMapped: false }));
  const upd = dl / 2 - 0.24;
  led.position.set(0, ws.position.y + nv * 0.03 - upd * dy / dl, ws.position.z + nu * 0.03 - upd * dx / dl);
  led.rotation.x = ws.rotation.x; body.add(led);
  // front details
  const hoodTop = P.gc + P.hoodV;
  const lightY = def.midi ? P.gc + 0.62 : hoodTop - 0.24;
  const partsDark = [
    [boxAt(P.W - 0.8, 0.36, 0.08, 0, lightY - 0.34, zf + bev), 0x15171a],
    [boxAt(P.W + 0.06, 0.3, 0.22, 0, P.gc + 0.1, zf + 0.02), 0x2a2d31],
    [boxAt(P.W + 0.06, 0.3, 0.22, 0, P.gc + 0.1, zr - 0.02), 0x2a2d31],
    [boxAt(0.08, 0.32, 0.22, P.W / 2 + 0.22, hoodTop + 0.35, P.uWsBase - P.L / 2 - 0.15), 0x15171a],
    [boxAt(0.08, 0.32, 0.22, -P.W / 2 - 0.22, hoodTop + 0.35, P.uWsBase - P.L / 2 - 0.15), 0x15171a],
    [boxAt(0.26, 0.04, 0.04, P.W / 2 + 0.1, hoodTop + 0.3, P.uWsBase - P.L / 2 - 0.15), 0x15171a],
    [boxAt(0.26, 0.04, 0.04, -P.W / 2 - 0.1, hoodTop + 0.3, P.uWsBase - P.L / 2 - 0.15), 0x15171a],
    [boxAt(def.midi ? 1.6 : 1.1, 0.2, def.midi ? 2.2 : 1.4, 0, P.H + 0.06, def.midi ? -1.2 : -0.6), def.dark ? 0x2b2f35 : 0xd7dbe0],
  ];
  const dm = new THREE.Mesh(mergeColored(partsDark), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }));
  dm.castShadow = true; body.add(dm);
  const headMat = new THREE.MeshBasicMaterial({ color: col(0xfff4d6), toneMapped: false });
  for (const sx of [1, -1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.2, 0.06), headMat);
    hl.position.set(sx * (P.W / 2 - 0.36), lightY, zf + bev + 0.01); body.add(hl);
  }
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ map: texBadge(def.badge), transparent: true }));
  badge.position.set(0, lightY - 0.3, zf + bev + 0.05); body.add(badge);
  const plateTex = texPlate(def);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.115), new THREE.MeshBasicMaterial({ map: plateTex }));
  pf.position.set(0, P.gc + 0.1, zf + 0.14); body.add(pf);
  const pr = pf.clone(); pr.position.set(0, P.gc + 0.1, zr - 0.14); pr.rotation.y = Math.PI; body.add(pr);
  // rear
  const rg = new THREE.Mesh(new THREE.PlaneGeometry(P.W - 0.3, P.winT - P.winB), new THREE.MeshStandardMaterial({ map: X.rearGlass, transparent: true, roughness: 0.1, metalness: 0.4 }));
  rg.position.set(0, P.gc + (P.winT + P.winB) / 2, zr - bev - 0.012); rg.rotation.y = Math.PI; body.add(rg);
  const hD = P.winB - 0.33, wD = Math.min(P.W - 0.36, hD * 512 / 232);
  const rd = decal(texRear(def), wD, wD * 232 / 512);
  rd.position.set(0, P.gc + 0.27 + hD / 2, zr - bev - 0.012); rd.rotation.y = Math.PI; body.add(rd);
  const tailMat = new THREE.MeshBasicMaterial({ color: col(0x7a0a0a), toneMapped: false });
  for (const sx of [1, -1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.06), tailMat);
    tl.position.set(sx * (P.W / 2 - 0.1), P.gc + 0.7, zr - bev - 0.01); body.add(tl);
  }
  // side decals
  const rtex = texRoundel(def);
  for (const sx of [1, -1]) {
    const rn = decal(rtex, 0.78, 0.78);
    rn.position.set(sx * (P.W / 2 + 0.012), P.gc + P.winB * 0.5, (P.axF + P.axR) / 2 + 0.2 - P.L / 2);
    rn.rotation.y = sx * Math.PI / 2; body.add(rn);
    const ok = decal(X.okul, 1.35, 0.25);
    ok.position.set(sx * (P.W / 2 + 0.012), P.gc + P.winB - 0.155, (0.3 + Math.min(wsU(P, (P.winB + P.winT) / 2) - (def.midi ? 1.35 : 1.05) - 0.2, P.L * 0.62)) / 2 - P.L / 2);
    ok.rotation.y = sx * Math.PI / 2; body.add(ok);
  }
  // wheels
  const wheels = [];
  for (const [u, front] of [[P.axF, true], [P.axR, false]]) for (const sx of [1, -1]) {
    const pivot = new THREE.Group(); pivot.position.set(sx * (P.W / 2 - 0.2), P.wheelR, u - P.L / 2);
    const spin = new THREE.Group(); pivot.add(spin);
    const tire = new THREE.Mesh(X.tire, tireMat); tire.scale.set(0.27, P.wheelR, P.wheelR); tire.castShadow = true; spin.add(tire);
    const hub = new THREE.Mesh(X.hub, hubMat); hub.scale.setScalar(P.wheelR); hub.position.x = sx * 0.14; hub.rotation.y = sx * Math.PI / 2; spin.add(hub);
    grp.add(pivot); wheels.push({ pivot, spin, front });
  }
  // contact shadow
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(P.W + 1.1, P.L + 1.1), new THREE.MeshBasicMaterial({ map: X.blob, transparent: true, depthWrite: false, opacity: 0.85 }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.075; blob.renderOrder = 3; grp.add(blob);
  // boost flames
  const flameMat = new THREE.MeshBasicMaterial({ color: col(0xffb14a), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const flames = [];
  for (const sx of [0.45, -0.45]) { const f = new THREE.Mesh(X.flame, flameMat); f.position.set(sx, P.gc + 0.12, zr - 0.1); f.visible = false; f.renderOrder = 5; body.add(f); flames.push(f); }
  const set = new Set();
  grp.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => set.add(mt)); });
  const mats = Array.from(set).filter((mt) => mt !== flameMat).map((mt) => ({ mt, t: mt.transparent, o: mt.opacity, dw: mt.depthWrite }));
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ depthWrite: false, transparent: true }));
  tag.scale.set(4.6, 1.15, 1); tag.position.set(0, P.H + 1.6, 0); tag.renderOrder = 6; tag.visible = false; grp.add(tag);
  return { grp, body, wheels, tailMat, flames, P, mats, alpha: 1, face, tag, blob, shell };
}

// =====================================================================
//  DRIVING MODEL, COLLISIONS, AI
// =====================================================================
const DIFF = [
  { skill: 0.84, vmul: 0.92, up: 0.06, down: 0.03, name: 'Easy' },
  { skill: 0.95, vmul: 0.99, up: 0.07, down: 0.012, name: 'Normal' },
  { skill: 1.04, vmul: 1.04, up: 0.08, down: 0, name: 'Hard' },
];
class Bus {
  constructor(def, isPlayer) {
    this.def = def; this.st = deriveStats(def); this.isPlayer = isPlayer;
    this.m = buildBusModel(def); scene.add(this.m.grp);
    this.halfL = def.dim.L / 2 + 0.06; this.halfW = def.dim.W / 2 + 0.03;
    this.q = { idx: 0, s: 0, d: 0, tx: 0, tz: 1 };
    this.ctrl = { thr: 0, brk: 0, steer: 0, hb: false, boost: false };
    this.ai = { lane: 0, bias: 0, biasT: 0, skill: 1, stuck: 0, rev: 0, boostT: 0, greed: 0.6 };
    this.vmul = 1; this.abilMul = 1; this.tempBonus = 0; this.stunT = 0; this.holdT = 0; this.throwT = 0; this.flyY = 0;
    this.place(0, 0);
  }
  place(s, lat) {
    const p = TRACK.pointAt(s, lat, {});
    this.x = p.x; this.z = p.z; this.yaw = p.yaw; this.vx = 0; this.vz = 0;
    this.yawRate = 0; this.steerVis = 0; this.slip = 0; this.pitch = 0; this.roll = 0; this.fwd = 0;
    this.hint = TRACK.globalNearest(p.x, p.z);
    TRACK.project(this.x, this.z, this.hint, this.q); this.hint = this.q.idx;
    this.prevS = this.q.s; this.off = false; this.boosting = false; this.braking = false;
    this.syncModel(0);
  }
  resetRace() {
    this.lap = 0; this.progress = 0; this.finished = false; this.finishTime = 0; this.lapStart = 0; this.lapTimes = [];
    this.best = Infinity; this.students = 0; this.cp = -1; this.gap = 0; this.wrongT = 0; this.impactCD = 0;
    this.ai.stuck = 0; this.ai.rev = 0; this.ai.lane = this.q.d; this.ai.biasT = 0;
    resetAbil(this);
    resetTyres(this);
    this.updateProgress();
  }
  get speed() { return Math.hypot(this.vx, this.vz); }
  step(dt, c) {
    if (this.pitT > 0 || this.holdT > 0) { this.vx = 0; this.vz = 0; this.fwd = 0; this.yawRate = 0; this.slip = 0; this.boosting = false; this.braking = true; return; }
    if (this.stunT > 0) c = stunCtrl(this);
    const st = this.st, sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const vf = this.vx * sy + this.vz * cy;
    this.fwd = vf;
    // ability speed changes scale the top speed (and help the bus reach it); Ataberk ignores the off-road penalty
    const offPen = this.off && !this.dirtProof;
    let vmax = Math.max(5, st.vmax * this.vmul * this.abilMul * (offPen ? 0.62 : 1)), acc = st.accel * Math.max(1, this.abilMul);
    this.boosting = this.tempBonus >= 0.06;
    const tg = tireGrip(this);
    if (this.blown) vmax *= 0.55;
    if (this.pitLim) vmax = Math.min(vmax, PIT.v);
    let a = 0;
    if (c.thr > 0) {
      if (vf > -0.5) { const x = Math.max(0, vf) / vmax; a += x < 1 ? acc * c.thr * (1 - x * x) : -(x - 1) * vmax * 0.8; }
      else a += st.brake * c.thr;
    } else if (!(c.brk > 0)) {
      a -= Math.sign(vf) * (1.3 + Math.abs(vf) * 0.028);
    }
    this.braking = false;
    if (c.brk > 0) {
      if (vf > 0.5) { a -= st.brake * c.brk; this.braking = true; }
      else if (!(c.thr > 0)) { a -= 7 * c.brk; if (vf < -11) a = Math.max(a, 0); }
    }
    if (offPen) a -= vf * 0.9;
    if (c.hb) a -= Math.sign(vf) * 5;
    const nvf = vf + a * dt;
    if (!(c.thr > 0) && !(c.brk > 0) && Math.sign(nvf) !== Math.sign(vf)) { this.vx -= sy * vf; this.vz -= cy * vf; }
    else { this.vx += sy * a * dt; this.vz += cy * a * dt; }
    // tyre grip: velocity direction relaxes toward the heading (drift when grip is low)
    const spd = Math.hypot(this.vx, this.vz);
    if (spd > 0.05) {
      const fdot = this.vx * sy + this.vz * cy;
      const tgt = fdot >= 0 ? this.yaw : this.yaw + Math.PI;
      const beta = wrapA(Math.atan2(this.vx, this.vz) - tgt);
      // rain: less grip for everyone but Sarp, and the tail steps out whenever the bus turns
      const wet = RAIN.t > 0 && !this.aura;
      const grip = st.grip * (c.hb ? 0.16 : 1) * (this.off ? 0.7 : 1) * tg * (wet ? (1 - RAIN.loss) * (Math.abs(c.steer) > 0.25 ? 0.55 : 1) : 1);
      const nb = beta * Math.exp(-grip * dt);
      const ns = spd * (1 - Math.min(0.5, Math.abs(beta) * (c.hb ? 0.5 : 0.3) * dt));
      const na = tgt + nb;
      this.vx = Math.sin(na) * ns; this.vz = Math.cos(na) * ns;
      this.slip = fdot >= 0 ? beta : 0;
    } else this.slip = 0;
    // steering
    const av = Math.abs(vf);
    const sf = Math.min(1, av / 5) * (1 - 0.5 * Math.min(1, av / st.vmax));
    let yr = clamp(c.steer + (this.blown ? this.pull : 0), -1, 1) * st.steer * sf * (c.hb ? 1.35 : 1) * (0.72 + 0.28 * tg) * (RAIN.t > 0 && !this.aura ? 1.12 : 1);
    if (vf < 0) yr = -yr;
    this.yawRate = yr;
    this.tire = Math.max(0, this.tire - dt * TYRE_WEAR * (0.003 * av + 0.016 * Math.abs(yr * vf) + 0.03 * Math.abs(this.slip) * av + 0.008 * (c.brk > 0 ? c.brk : 0) * Math.max(0, vf) + (this.off ? 0.02 * av : 0) + (this.scraping ? 1.5 : 0)));
    this.yaw = wrapA(this.yaw - yr * dt);
    if (this.throwT > 0) throwStep(this, dt);
    this.x += this.vx * dt; this.z += this.vz * dt;
    if (!(isFinite(this.x) && isFinite(this.z) && isFinite(this.vx) && isFinite(this.vz) && isFinite(this.yaw))) { respawnBus(this); return; }
    this.constrain(dt);
  }
  constrain(dt) {
    const q = TRACK.project(this.x, this.z, this.hint, this.q); this.hint = q.idx;
    const tyaw = Math.atan2(q.tx, q.tz), rel = wrapA(this.yaw - tyaw);
    const ext = Math.abs(Math.sin(rel)) * this.halfL + Math.abs(Math.cos(rel)) * this.halfW;
    latLimits(q.s, q.d, LIM);
    const hiL = LIM.hi - 0.05 - ext, loL = LIM.lo + 0.05 + ext;
    this.off = Math.abs(q.d) > HW + KERB * 0.8 && !inPitZone(q.s, q.d);
    this.scraping = false;
    const sd = q.d > hiL ? 1 : (q.d < loL ? -1 : 0);
    if (sd) {
      const lim = sd > 0 ? hiL : loL, pen = Math.abs(q.d - lim), nx = -q.tz * sd, nz = q.tx * sd;
      this.x -= nx * pen; this.z -= nz * pen; q.d = lim;
      const vn = this.vx * nx + this.vz * nz;
      if (vn > 0) {
        this.vx -= nx * vn * 1.3; this.vz -= nz * vn * 1.3;
        const loss = 1 - Math.min(0.45, vn * 0.035);
        this.vx *= loss; this.vz *= loss;
        if (vn > 2) this.onImpact(vn);
      }
      if (this.throwBy && (this.throwT > 0 || RACE.t - this.throwEnd < 0.35)) throwLanded(this);
      const along = this.vx * q.tx + this.vz * q.tz;
      this.yaw = lerpA(this.yaw, along >= 0 ? tyaw : tyaw + Math.PI, 1 - Math.exp(-(1.6 + Math.max(0, vn) * 0.5) * dt));
      this.vx *= 1 - 0.8 * dt; this.vz *= 1 - 0.8 * dt;
      this.scraping = true;
    }
  }
  onImpact(v) {
    if (RACE.state === 'race') onWallImpact(this);
    if (this.impactCD > 0) return;
    this.impactCD = 0.25;
    if (this.isPlayer) { SFX.impact(Math.min(1, v / 14)); camShake(Math.min(1, v / 12)); }
  }
  updateProgress() {
    const L = TRACK.L, s = this.q.s;
    if (this.prevS > L * 0.75 && s < L * 0.25) this.crossLine(1);
    else if (this.prevS < L * 0.25 && s > L * 0.75) this.lap--;
    this.prevS = s;
    this.progress = this.lap * L + s;
  }
  syncModel(dt) {
    const m = this.m, P = m.P;
    const fy = this.flyY || 0;
    m.grp.position.set(this.x, fy, this.z); m.grp.rotation.y = this.yaw;
    m.blob.position.y = 0.075 - fy; m.blob.material.opacity = 0.85 * (1 - Math.min(0.75, fy / 6));
    const av = this.fwd;
    this.steerVis = lerp(this.steerVis, this.ctrl.steer, Math.min(1, dt * 10));
    const tRoll = -(clamp(this.yawRate * av * 0.0028, -0.07, 0.07) + clamp(this.slip * 0.05, -0.04, 0.04));
    const bf = this.blownFx;
    this.roll = lerp(this.roll, tRoll + (this.stunT > 0 || this.holdT > 0 ? Math.sin(RACE.t * (this.holdT > 0 ? 30 : 13)) * 0.07 : 0) + (bf ? bf.roll : 0), Math.min(1, dt * 6));
    const tPitch = this.braking ? 0.025 : (this.ctrl.thr > 0 && av < this.st.vmax * 0.7 ? -0.018 : 0);
    this.pitch = lerp(this.pitch, tPitch + (bf ? bf.pitch : 0), Math.min(1, dt * 5));
    m.body.rotation.set(this.pitch, 0, this.roll);
    for (const w of m.wheels) { w.spin.rotation.x += (av / P.wheelR) * dt; if (w.front) w.pivot.rotation.y = -this.steerVis * 0.42; }
    m.tailMat.color.copy(this.braking ? TAIL_ON : TAIL_OFF);
    const fl = this.boosting;
    for (const f of m.flames) { f.visible = fl; if (fl) f.scale.set(1, 1, 0.7 + Math.random() * 0.6); }
  }
}
const TAIL_ON = new THREE.Color(), TAIL_OFF = new THREE.Color();
// ghost a bus that sits between the camera and the player (or on top of the camera)
function setBusAlpha(b, a) {
  const m = b.m;
  if (Math.abs(m.alpha - a) < 0.004) return;
  m.alpha = a;
  const on = a < 0.999;
  for (const e of m.mats) { e.mt.transparent = on ? true : e.t; e.mt.opacity = e.o * a; e.mt.depthWrite = on ? false : e.dw; }
}

// capsule vs capsule contact between two buses
const CP = { ax: 0, az: 0, bx: 0, bz: 0 };
function segSeg(p1x, p1z, q1x, q1z, p2x, p2z, q2x, q2z) {
  const d1x = q1x - p1x, d1z = q1z - p1z, d2x = q2x - p2x, d2z = q2z - p2z, rx = p1x - p2x, rz = p1z - p2z;
  const a = d1x * d1x + d1z * d1z, e = d2x * d2x + d2z * d2z, f = d2x * rx + d2z * rz, c = d1x * rx + d1z * rz, b = d1x * d2x + d1z * d2z, den = a * e - b * b;
  let s = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0;
  let t = (b * s + f) / e;
  if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
  CP.ax = p1x + d1x * s; CP.az = p1z + d1z * s; CP.bx = p2x + d2x * t; CP.bz = p2z + d2z * t;
}
function collideBuses(A, B) {
  if (A.remote && B.remote) return;
  const dx0 = A.x - B.x, dz0 = A.z - B.z, reach = A.halfL + B.halfL + 0.5;
  if (dx0 * dx0 + dz0 * dz0 > reach * reach) return;
  const ha = A.halfL - A.halfW, hb = B.halfL - B.halfW;
  const asx = Math.sin(A.yaw) * ha, asz = Math.cos(A.yaw) * ha, bsx = Math.sin(B.yaw) * hb, bsz = Math.cos(B.yaw) * hb;
  segSeg(A.x - asx, A.z - asz, A.x + asx, A.z + asz, B.x - bsx, B.z - bsz, B.x + bsx, B.z + bsz);
  let nx = CP.ax - CP.bx, nz = CP.az - CP.bz, dist = Math.hypot(nx, nz);
  const rs = A.halfW + B.halfW;
  if (dist >= rs) return;
  if (dist < 1e-4) { nx = dx0; nz = dz0; dist = Math.hypot(nx, nz) || 1; if (dist < 1e-4) { nx = 1; nz = 0; dist = 1; } }
  nx /= dist; nz /= dist;
  // a new touch (not a long scrape) is a crash for the drivers' passives
  const fresh = touchPair(A, B), sa = A.speed, sb = B.speed;
  const fa = A.vx * Math.sin(A.yaw) + A.vz * Math.cos(A.yaw), fb = B.vx * Math.sin(B.yaw) + B.vz * Math.cos(B.yaw);
  const pen = rs - Math.min(dist, rs), ma = A.st.mass, mb = B.st.mass, tot = ma + mb;
  // online, a bus driven on another device is pushed over there: here only our own bus moves
  const wa = B.remote ? 1 : mb / tot, wb = A.remote ? 1 : ma / tot;
  if (!A.remote) { A.x += nx * pen * wa; A.z += nz * pen * wa; }
  if (!B.remote) { B.x -= nx * pen * wb; B.z -= nz * pen * wb; }
  const vn = (A.vx - B.vx) * nx + (A.vz - B.vz) * nz;
  if (vn < 0) {
    const j = -(1.25) * vn / (1 / ma + 1 / mb);
    const rax = CP.ax - A.x, raz = CP.az - A.z, rbx = CP.bx - B.x, rbz = CP.bz - B.z;
    if (!A.remote) { A.vx += j / ma * nx; A.vz += j / ma * nz; A.yaw -= clamp((rax * nz - raz * nx) * j * 0.004 / ma, -0.05, 0.05); }
    if (!B.remote) { B.vx -= j / mb * nx; B.vz -= j / mb * nz; B.yaw += clamp((rbx * nz - rbz * nx) * j * 0.004 / mb, -0.05, 0.05); }
    const hit = -vn;
    if (hit > 2.5 && (A.isPlayer || B.isPlayer)) { SFX.impact(Math.min(1, hit / 12)); camShake(Math.min(0.8, hit / 14)); if (Math.random() < 0.35) SFX.honkShort(); }
  }
  if (fresh && RACE.state === 'race') onCrash(A, B, fa, fb, sa, sb);
}

// ---- AI drivers ----
const TMP = {};
function cornerSpeed(st, k) { return 0.85 * st.steer / (Math.abs(k) + 0.425 * st.steer / st.vmax); }
function aiDrive(b, dt, all) {
  const c = b.ctrl, ai = b.ai, st = b.st, T = TRACK;
  const s = b.q.s, v = Math.max(0, b.fwd);
  // lane choice: inside of upcoming corners + personal wander + overtaking
  ai.biasT -= dt;
  if (ai.biasT <= 0) { ai.bias = rr(-4.5, 4.5); ai.biasT = rr(2.5, 6); }
  const kA = T.curvAt(s + 22 + v * 0.7);
  let lane = clamp(-kA * 330, -6.5, 6.5) + ai.bias * 0.55;
  {
    for (const stp of W.stops) {
      if (stp.got.get(b) === b.lap) continue;
      const ahead = T.wrapS(stp.s - s);
      if (ahead > 12 && ahead < 120) {
        // students pay for abilities, so bots go for most stops (decided once per stop and lap)
        const dec = ai.stopDec || (ai.stopDec = {}), k = stp.s;
        if (!dec[k] || dec[k].lap !== b.lap) dec[k] = { lap: b.lap, go: rnd() < ai.greed };
        if (dec[k].go) { lane = stp.lat; break; }
      }
    }
  }
  for (const o of all) {
    if (o === b) continue;
    const ahead = T.wrapS(o.q.s - s);
    if (ahead > 0 && ahead < 26 && Math.abs(o.q.d - lane) < 3.4) {
      const left = o.q.d - 3.8, right = o.q.d + 3.8;
      lane = (Math.abs(left - lane) < Math.abs(right - lane) && left > -HW + 2) || right > HW - 2 ? left : right;
    }
  }
  lane = clamp(aiLaneWish(b, s, lane), -HW + 2.3, HW - 2.3);
  const pl = aiPitPlan(b, s);
  if (pl) lane = pl.lane;
  ai.lane = lerp(ai.lane, lane, Math.min(1, dt * (pl ? 2.4 : 1.6)));
  // steer toward a look-ahead point
  const look = 9 + v * 0.42;
  T.pointAt(s + look, ai.lane, TMP);
  const dx = TMP.x - b.x, dz = TMP.z - b.z, sy = Math.sin(b.yaw), cy = Math.cos(b.yaw);
  const ang = Math.atan2(dx * -cy + dz * sy, dx * sy + dz * cy);
  let steer = clamp(ang * 2.5, -1, 1);
  // speed target from the curvature ahead
  const skill = ai.skill * (0.7 + 0.3 * tireGrip(b));
  let target = st.vmax * 1.3;
  for (let k = 4; k <= 150; k += 5) {
    const kk = Math.abs(T.curvAt(s + k));
    if (kk < 0.003) continue;
    const vA = cornerSpeed(st, kk) * skill;
    target = Math.min(target, Math.sqrt(vA * vA + 2 * 17 * k));
  }
  target = Math.min(target, cornerSpeed(st, T.curvAt(s)) * skill + 1.5);
  if (pl) target = Math.min(target, pl.cap);
  let thr = v < target - 0.5 ? 1 : (v < target + 1.5 ? 0.35 : 0);
  let brk = v > target + 2 ? clamp((v - target) / 6, 0.25, 1) : 0;
  // recovery if stuck against a wall or pointing the wrong way
  const along = b.vx * b.q.tx + b.vz * b.q.tz;
  const heading = wrapA(b.yaw - Math.atan2(b.q.tx, b.q.tz));
  if (RACE.t > 4 && b.stunT <= 0 && b.holdT <= 0 && !ai.pit && b.pitT <= 0 && (b.speed < 2.5 || Math.abs(heading) > 2.2)) ai.stuck += dt; else ai.stuck = Math.max(0, ai.stuck - dt * 2);
  if (ai.stuck > 1.2 && ai.rev <= 0) { ai.rev = 1.1; }
  if (ai.rev > 0) { ai.rev -= dt; thr = 0; brk = 1; steer = -Math.sign(heading || 1); }
  if (ai.stuck > 4.5) { respawnBus(b); ai.stuck = 0; ai.rev = 0; }
  aiAbility(b, dt);
  // Ela never brakes while she sings: she lifts off instead
  if (b.ab.key === 'song' && brk > 0) { brk = 0; thr = 0; }
  if (b.ai.bait) thr = Math.min(thr, 0.15);
  c.thr = thr; c.brk = brk; c.steer = steer; c.hb = false; c.boost = false;
  // inside Volkan's field a bot's controls are reversed until it adapts
  if (b.fieldInv && b.fieldT < CH.volkan.ability.botDelay) { c.steer = -c.steer; c.thr = brk; c.brk = thr; }
  void along;
}
function respawnBus(b) {
  const s = isFinite(b.q.s) ? b.q.s : 0;
  const lat = isFinite(b.q.d) ? clamp(b.q.d, -HW + 3, HW - 3) : 0;
  const lap = b.lap, prev = b.prevS;
  b.place(s, lat);
  b.lap = lap; b.prevS = prev; b.updateProgress();
}

// =====================================================================
//  DRIVERS IN THE 3D WORLD: faces, name tags and shared effect pools
// =====================================================================
const FACE_IMG = {}, FACE_TEX = {}, TAG_TEX = {};
function loadFaces() {
  return Promise.all(DRIVERS.map((d) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { FACE_IMG[d.id] = im; res(); };
    im.onerror = () => res();
    im.src = d.photo;
  })));
}
function faceTex(id) {
  if (!FACE_TEX[id]) {
    const c = cv(256, 256), g = c.getContext('2d');
    if (FACE_IMG[id]) g.drawImage(FACE_IMG[id], 0, 0, 256, 256); else { g.fillStyle = '#8a8f98'; g.fillRect(0, 0, 256, 256); }
    FACE_TEX[id] = tex(c, false);
  }
  return FACE_TEX[id];
}
function tagTex(d) {
  if (TAG_TEX[d.id]) return TAG_TEX[d.id];
  TAG_TEX[d.id] = texLabel(512, 128, (g, w, h) => {
    g.fillStyle = 'rgba(10,12,16,.84)'; rrect(g, 6, 14, w - 12, h - 28, 36); g.fill();
    g.save(); g.beginPath(); g.arc(70, 64, 48, 0, Math.PI * 2); g.clip();
    if (FACE_IMG[d.id]) g.drawImage(FACE_IMG[d.id], 22, 16, 96, 96); else { g.fillStyle = d.color; g.fillRect(22, 16, 96, 96); }
    g.restore();
    g.strokeStyle = d.color; g.lineWidth = 7; g.beginPath(); g.arc(70, 64, 48, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff'; g.font = `italic 900 46px ${FONT_D}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    fitText(g, d.nick, 134, 62, 356);
  });
  return TAG_TEX[d.id];
}
function setDriver(b, d) {
  b.driver = d;
  const f = b.m.face.material; f.map = faceTex(d.id); f.needsUpdate = true;
  const t = b.m.tag.material; t.map = tagTex(d); t.needsUpdate = true;
}
function addMats(b, list) { list.forEach((mt) => b.m.mats.push({ mt, t: mt.transparent, o: mt.opacity, dw: mt.depthWrite })); b.m.alpha = -1; }
function camVol(b) { const dx = camera.position.x - b.x, dz = camera.position.z - b.z; return clamp(1 - Math.hypot(dx, dz) / 160, 0, 1); }
const STUN_C = { thr: 0, brk: 0.35, steer: 0, hb: false, boost: false };
function stunCtrl(b) { STUN_C.steer = Math.sin(RACE.t * 11 + b.def.num) * 0.7; return STUN_C; }

// ---------- effect pools: coins, physics terms, stun stars, shock rings ----------
const SFXQ = { coins: [], terms: [], stars: [], rings: [], ci: 0, ri: 0 };
function initSuperFX() {
  const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.07, 18); coinGeo.rotateX(Math.PI / 2);
  const coinMat = new THREE.MeshStandardMaterial({ color: col(0xffc93c), metalness: 0.7, roughness: 0.3, emissive: col(0x6b4a00) });
  for (let i = 0; i < 48; i++) {
    const c = new THREE.Mesh(coinGeo, coinMat); c.visible = false; c.userData = { v: new THREE.Vector3(), life: 0, spin: 0 }; scene.add(c); SFXQ.coins.push(c);
  }
  const colors = ['#ffe14a', '#5ef1ff', '#ff5ecb', '#7dff6a', '#ffffff', '#ff9d3c'];
  for (let i = 0; i < 12; i++) {
    const term = PHYSICS_TERMS[i * 2 % PHYSICS_TERMS.length], color = colors[i % colors.length];
    const t = texLabel(512, 128, (g, w, h) => {
      let fs = 64; g.font = `italic 900 ${fs}px ${FONT_D}`;
      while (g.measureText(term).width > 480 && fs > 22) { fs -= 4; g.font = `italic 900 ${fs}px ${FONT_D}`; }
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(term, w / 2, h / 2); g.fillStyle = color; g.fillText(term, w / 2, h / 2);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(6, 1.5, 1); s.visible = false; s.renderOrder = 6; scene.add(s); SFXQ.terms.push(s);
  }
  const starTex = texLabel(64, 64, (g) => { g.fillStyle = '#ffe14a'; starPath(g, 32, 32, 29, 12, -Math.PI / 2); g.fill(); g.strokeStyle = '#9a6400'; g.lineWidth = 3; g.stroke(); });
  for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, depthWrite: false, transparent: true })); s.scale.set(0.9, 0.9, 1); s.visible = false; s.renderOrder = 6; scene.add(s); SFXQ.stars.push(s); }
  const ringGeo = new THREE.RingGeometry(0.86, 1, 64); ringGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: col(0xff7ab6), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    r.visible = false; r.renderOrder = 5; r.userData = { t: 0, size: 42 }; scene.add(r); SFXQ.rings.push(r);
  }
}
function ringFX(x, z, delay, color, size) {
  const r = SFXQ.rings[SFXQ.ri]; SFXQ.ri = (SFXQ.ri + 1) % SFXQ.rings.length;
  r.position.set(x, 0.6, z); r.userData.t = -delay; r.userData.size = size || 42; r.scale.setScalar(1); r.visible = true;
  r.material.color.copy(col(color == null ? 0xff7ab6 : color));
}
function rearPoint(b) { const P = b.m.P, bx = Math.sin(b.yaw), bz = Math.cos(b.yaw); return [b.x - bx * (P.L / 2 + 0.4), b.z - bz * (P.L / 2 + 0.4), bx, bz]; }
function emitCoin(b) {
  const m = SFXQ.coins[SFXQ.ci]; SFXQ.ci = (SFXQ.ci + 1) % SFXQ.coins.length;
  const [x, z, bx, bz] = rearPoint(b);
  m.position.set(x + rr(-0.8, 0.8), 1.4 + (b.flyY || 0) + rr(0, 1.2), z + rr(-0.8, 0.8));
  m.userData.v.set(-bx * rr(3, 9) + rr(-4, 4), rr(4, 10), -bz * rr(3, 9) + rr(-4, 4)); m.userData.life = 2.2; m.userData.spin = rr(6, 14); m.visible = true;
}
function coinBurst(x, y, z, n) {
  for (let i = 0; i < n; i++) {
    const m = SFXQ.coins[SFXQ.ci]; SFXQ.ci = (SFXQ.ci + 1) % SFXQ.coins.length;
    m.position.set(x + rr(-0.6, 0.6), y, z + rr(-0.6, 0.6)); m.userData.v.set(rr(-6, 6), rr(5, 11), rr(-6, 6)); m.userData.life = 1.8; m.userData.spin = rr(6, 14); m.visible = true;
  }
}
// a rainbow ribbon that trails behind a bus
function makeRainbow() {
  const N = 48, bands = 7;
  const pos = new Float32Array(bands * N * 6), clr = new Float32Array(bands * N * 6), idx = [];
  const cols = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2'].map((c) => col(c));
  for (let k = 0; k < bands; k++) for (let i = 0; i < N; i++) {
    const base = (k * N + i) * 2;
    for (const j of [0, 1]) clr.set([cols[k].r, cols[k].g, cols[k].b], (base + j) * 3);
    if (i < N - 1) idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(clr, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false, toneMapped: false }));
  m.frustumCulled = false; m.visible = false; m.renderOrder = 4; scene.add(m);
  return { mesh: m, pts: [], N, bands };
}
function updateRainbow(r, b, on) {
  if (on) { const [x, z] = rearPoint(b); r.pts.unshift([x, z, b.flyY || 0, b.yaw]); if (r.pts.length > r.N) r.pts.pop(); }
  else if (r.pts.length) { r.pts.pop(); r.pts.pop(); }
  r.mesh.visible = r.pts.length > 1;
  if (!r.mesh.visible) return;
  const pos = r.mesh.geometry.attributes.position.array, N = r.N;
  const bw = 0.42, half = r.bands * bw / 2;
  for (let k = 0; k < r.bands; k++) for (let i = 0; i < N; i++) {
    const p = r.pts[Math.min(i, r.pts.length - 1)], rx = -Math.cos(p[3]), rz = Math.sin(p[3]), o = (k * N + i) * 6;
    const a = -half + k * bw, c = a + bw;
    const ya = 0.4 + p[2] + 0.9 * Math.cos((a / half) * Math.PI / 2), yc = 0.4 + p[2] + 0.9 * Math.cos((c / half) * Math.PI / 2);
    pos[o] = p[0] + rx * a; pos[o + 1] = ya; pos[o + 2] = p[1] + rz * a;
    pos[o + 3] = p[0] + rx * c; pos[o + 4] = yc; pos[o + 5] = p[1] + rz * c;
  }
  r.mesh.geometry.attributes.position.needsUpdate = true;
}

// ---------- floating comic words above a bus ("BONK!", "+10%") ----------
const POP = { list: [], i: 0, tex: {} };
function popTexFor(text, color) {
  const k = text + '|' + color;
  if (POP.tex[k]) return POP.tex[k];
  POP.tex[k] = texLabel(512, 128, (g, w, h) => {
    let fs = 76; g.font = `italic 900 ${fs}px ${FONT_D}`;
    while (g.measureText(text).width > 470 && fs > 28) { fs -= 4; g.font = `italic 900 ${fs}px ${FONT_D}`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 13; g.strokeStyle = 'rgba(0,0,0,.88)'; g.strokeText(text, w / 2, h / 2 + 4);
    g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
  });
  return POP.tex[k];
}
function initPop() {
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
    s.visible = false; s.renderOrder = 8; s.userData = { life: 0, max: 1, k: 1 }; scene.add(s); POP.list.push(s);
  }
}
function popAt(x, y, z, text, color, k) {
  const s = POP.list[POP.i]; POP.i = (POP.i + 1) % POP.list.length;
  s.material.map = popTexFor(text, color || '#ffe14a'); s.material.needsUpdate = true; s.material.opacity = 1;
  s.position.set(x, y, z); s.userData.life = 1.35; s.userData.max = 1.35; s.userData.k = k || 1; s.visible = true;
}
function popText(b, text, color, k) {
  if (camVol(b) <= 0) return;
  popAt(b.x, b.def.dim.H + 2.5 + (b.flyY || 0), b.z, text, color, k);
}
function updatePop(dt) {
  for (const s of POP.list) {
    if (!s.visible) continue;
    const u = s.userData; u.life -= dt; if (u.life <= 0) { s.visible = false; continue; }
    const age = u.max - u.life, grow = Math.min(1, age * 7);
    s.position.y += dt * 1.6;
    s.scale.set(5.4 * u.k * (0.6 + 0.4 * grow), 1.35 * u.k * (0.6 + 0.4 * grow), 1);
    s.material.opacity = Math.min(1, u.life * 2.2);
  }
}

// ---------- small flying icons: cinnamon rolls, candy, music notes, hearts, clovers ----------
const ICONS = { list: [], i: 0, tex: {} };
function iconTex(kind) {
  if (ICONS.tex[kind]) return ICONS.tex[kind];
  ICONS.tex[kind] = texLabel(128, 128, (g) => {
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (kind === 'roll') {
      g.fillStyle = '#c8823e'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill();
      g.strokeStyle = '#7a4417'; g.lineWidth = 9; g.beginPath();
      for (let a = 0; a < Math.PI * 7; a += 0.2) { const r = 4 + a * 2.1; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 7; g.beginPath(); g.moveTo(26, 44); g.quadraticCurveTo(64, 70, 104, 40); g.stroke();
      g.beginPath(); g.moveTo(30, 84); g.quadraticCurveTo(66, 98, 100, 80); g.stroke();
    } else if (kind === 'candy') {
      g.fillStyle = '#ff5a9a'; g.beginPath(); g.moveTo(8, 40); g.lineTo(34, 64); g.lineTo(8, 88); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(120, 40); g.lineTo(94, 64); g.lineTo(120, 88); g.closePath(); g.fill();
      g.fillStyle = '#ffe14a'; g.beginPath(); g.arc(64, 64, 32, 0, 7); g.fill();
      g.strokeStyle = '#ff5a9a'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 18, 0.5, 4.2); g.stroke();
    } else if (kind === 'note') {
      g.fillStyle = '#ff9ad5'; g.strokeStyle = '#3a0a2a'; g.lineWidth = 6;
      g.beginPath(); g.ellipse(44, 94, 22, 16, -0.4, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(96, 80, 22, 16, -0.4, 0, 7); g.fill(); g.stroke();
      g.fillRect(58, 20, 9, 74); g.fillRect(110, 8, 9, 72); g.fillRect(58, 14, 61, 14);
    } else if (kind === 'heart') {
      g.fillStyle = '#ff4f94'; heartPath(g, 64, 66, 88); g.fill(); g.lineWidth = 5; g.strokeStyle = '#ffffff'; g.stroke();
    } else if (kind === 'clover') {
      g.fillStyle = '#2fbf5a'; for (const [x, y] of [[64, 36], [36, 62], [92, 62]]) { g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); }
      g.strokeStyle = '#1e7a3a'; g.lineWidth = 9; g.beginPath(); g.moveTo(64, 64); g.quadraticCurveTo(70, 96, 58, 120); g.stroke();
    } else if (kind === 'teeth') {
      g.fillStyle = '#ffffff'; g.strokeStyle = '#333'; g.lineWidth = 4;
      for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(10 + i * 22, 30); g.lineTo(32 + i * 22, 30); g.lineTo(21 + i * 22, 62); g.closePath(); g.fill(); g.stroke(); }
      for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(10 + i * 22, 98); g.lineTo(32 + i * 22, 98); g.lineTo(21 + i * 22, 66); g.closePath(); g.fill(); g.stroke(); }
    } else if (kind === 'fire') {
      const gr = g.createRadialGradient(64, 80, 4, 64, 70, 60); gr.addColorStop(0, 'rgba(255,240,160,1)'); gr.addColorStop(0.45, 'rgba(255,110,20,.9)'); gr.addColorStop(1, 'rgba(200,20,0,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(64, 6); g.quadraticCurveTo(116, 70, 96, 110); g.quadraticCurveTo(64, 128, 32, 110); g.quadraticCurveTo(12, 70, 64, 6); g.fill();
    } else if (kind === 'dumbbell') {
      g.fillStyle = '#2b2f36'; g.fillRect(30, 56, 68, 16);
      g.fillStyle = '#e10600'; g.fillRect(8, 30, 22, 68); g.fillRect(98, 30, 22, 68);
      g.fillStyle = '#ffffff'; g.font = `italic 900 26px ${FONT_D}`; g.textAlign = 'center'; g.fillText('KG', 64, 50);
    }
  });
  return ICONS.tex[kind];
}
function initIcons() {
  for (let i = 0; i < 48; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
    s.visible = false; s.renderOrder = 7; s.userData = { v: new THREE.Vector3(), life: 0, max: 1, sc: 1, g: 0, tgt: null }; scene.add(s); ICONS.list.push(s);
  }
}
// grav > 0 falls, < 0 floats up; tgt makes the icon fly into a bus (used when Ali eats)
function iconAt(kind, x, y, z, vx, vy, vz, life, sc, grav, tgt) {
  const s = ICONS.list[ICONS.i]; ICONS.i = (ICONS.i + 1) % ICONS.list.length;
  s.material.map = iconTex(kind); s.material.needsUpdate = true; s.material.opacity = 1;
  const u = s.userData; u.v.set(vx, vy, vz); u.life = life; u.max = life; u.sc = sc; u.g = grav || 0; u.tgt = tgt || null;
  s.position.set(x, y, z); s.scale.setScalar(sc); s.visible = true;
}
function updateIcons(dt) {
  for (const s of ICONS.list) {
    if (!s.visible) continue;
    const u = s.userData; u.life -= dt; if (u.life <= 0) { s.visible = false; continue; }
    if (u.tgt) {
      const k = 1 - u.life / u.max, t = u.tgt;
      s.position.x = lerp(s.position.x, t.x, Math.min(1, dt * (3 + k * 10))); s.position.z = lerp(s.position.z, t.z, Math.min(1, dt * (3 + k * 10)));
      s.position.y = lerp(s.position.y, 2 + Math.sin(k * Math.PI) * 3, Math.min(1, dt * 6));
      s.scale.setScalar(u.sc * (1 - k * 0.7));
      continue;
    }
    u.v.y -= u.g * dt; s.position.addScaledVector(u.v, dt);
    const k = u.life / u.max; s.material.opacity = Math.min(1, k * 2); s.scale.setScalar(u.sc * (0.7 + 0.3 * k));
  }
}
function heartPath(g, cx, cy, k) {
  const P = (x, y) => [cx + x * k, cy - y * k];
  g.beginPath(); g.moveTo(...P(0, -0.5));
  g.bezierCurveTo(...P(-0.55, -0.1), ...P(-0.7, 0.35), ...P(-0.35, 0.55));
  g.bezierCurveTo(...P(-0.15, 0.65), ...P(0, 0.5), ...P(0, 0.35));
  g.bezierCurveTo(...P(0, 0.5), ...P(0.15, 0.65), ...P(0.35, 0.55));
  g.bezierCurveTo(...P(0.7, 0.35), ...P(0.55, -0.1), ...P(0, -0.5));
  g.closePath();
}
function distPtSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}
// distance from a point to a bus's centre segment (its collision capsule is this plus halfW)
function busDist(o, x, z) {
  const ha = o.halfL - o.halfW, sx = Math.sin(o.yaw) * ha, sz = Math.cos(o.yaw) * ha;
  return distPtSeg(x, z, o.x - sx, o.z - sz, o.x + sx, o.z + sz);
}

// =====================================================================
//  TYRES: wear, blowouts, pit stops (players and AI follow the same rules)
// =====================================================================
const TYRE_WEAR = 1.0;           // scales all wear; a set lasts roughly 4-5 laps of racing
const LIM = { lo: 0, hi: 0 }, TMPW = { x: 0, z: 0 };
function tireGrip(b) { return b.blown ? 0.4 : 0.62 + 0.38 * Math.pow(Math.max(0, b.tire) / 100, 0.6); }
function tyreScale(b, k) { b.m.wheels.forEach((w, i) => { const t = w.spin.children[0], r = b.m.P.wheelR * (i === k ? 0.78 : 1); t.scale.set(0.27, r, r); }); }
function resetTyres(b) {
  b.tire = 100; b.blown = false; b.blownW = -1; b.pull = 0; b.blownFx = null;
  b.pitT = 0; b.pitMax = PIT.time; b.pitDone = false; b.pitLim = false; b.pitStops = 0; b.warned = 0;
  if (b.m) tyreScale(b, -1);
}
function wheelWorld(b, wi, out) {
  const w = b.m.wheels[wi], sy = Math.sin(b.yaw), cy = Math.cos(b.yaw), lx = w.pivot.position.x, lz = w.pivot.position.z;
  out.x = b.x + lx * cy + lz * sy; out.z = b.z - lx * sy + lz * cy; return out;
}
function blowout(b) {
  if (b.blown) return;
  const wi = Math.floor(Math.random() * 4), w = b.m.wheels[wi], left = w.pivot.position.x > 0;
  b.blown = true; b.tire = 0; b.blownW = wi; b.pull = left ? -0.22 : 0.22;
  b.blownFx = { roll: left ? -0.045 : 0.045, pitch: w.front ? 0.03 : -0.03 };
  tyreScale(b, wi);
  SFX.bang(camVol(b));
  wheelWorld(b, wi, TMPW);
  for (let i = 0; i < 7; i++) puff(TMPW.x + rr(-0.6, 0.6), 0.5, TMPW.z + rr(-0.6, 0.6), DUST, 0.6, 2.6, 0.9, 1.2);
  if (b.isPlayer) { showMsg('Blowout!', 'Box, box! Pit lane on the left after the car park', 'warn', 2.6); camShake(1); }
}
function tyreStep(b, dt) {
  // worn-out tyres can burst; at 0 % they always do
  if (!b.blown && b.pitT <= 0 && b.tire < 12 && RACE.state === 'race' && b.speed > 5) {
    if (b.tire <= 0 || Math.random() < (12 - b.tire) / 12 * 0.3 * dt) blowout(b);
  }
  const s = b.q.s, d = b.q.d, inLane = s > PIT.s0 && s < PIT.s1 && d < -(WALL - 0.5);
  b.pitLim = inLane && s > PIT.s0 + 6 && s < PIT.s1 - 6;
  if (b.pitT > 0) {
    b.pitT -= dt;
    if (b.pitT <= 0) {
      b.pitT = 0; b.tire = 100; b.blown = false; b.blownW = -1; b.pull = 0; b.blownFx = null; b.warned = 0; b.pitStops++;
      tyreScale(b, -1);
      if (b.isPlayer) { showMsg('Fresh tyres', 'Go go go!', 'go', 1.4); SFX.go(); }
    }
    return;
  }
  const box = PIT.boxS(b.def.num - 1);
  // stop in (or right beside) your box; a bump in the pit lane shouldn't cost the whole stop
  if (inLane && !b.pitDone && b.speed < 2.2 && Math.abs(s - box) < 8 && d < -(WALL + 3)) {
    // Ali's bite makes the next pit stop longer
    b.pitT = PIT.time + b.pitPen; b.pitMax = b.pitT; b.penPaid += b.pitPen; b.pitDone = true;
    if (b.isPlayer) { SFX.wrench(); if (b.pitPen) toast('Pit penalty: +' + b.pitPen + ' s'); }
    b.pitPen = 0;
  }
  if (!inLane) b.pitDone = false;
  if (b.isPlayer && !b.finished && RACE.state === 'race') {
    if (b.tire < 35 && b.warned < 1) { b.warned = 1; toast('Tyres worn: pit soon (left side, after the car park)'); }
    if (b.tire < 15 && b.warned < 2) { b.warned = 2; showMsg('Tyres critical', 'Box this lap!', 'warn', 2.2); }
  }
}
// AI pit strategy: returns a lane and speed cap while the bus is heading for its box, otherwise null
function aiPitPlan(b, s) {
  const ai = b.ai, rel = s - PIT.s0, span = PIT.s1 - PIT.s0;
  if (!ai.pit) {
    const lastLap = b.lap >= RACE.laps;
    const need = b.blown || (!lastLap && b.tire < ai.pitAt);
    if (RACE.state === 'race' && !b.finished && need && rel < -60 && rel > -470) ai.pit = true;
    else return null;
  }
  if (rel > span + 5 || rel < -480 || b.finished) { ai.pit = false; return null; }
  if (rel < -90) return { lane: -6, cap: 99 };
  if (rel < -14) return { lane: -8.8, cap: Math.sqrt(24 * 24 + 2 * 12 * Math.max(0, -rel - 14)) };
  if (rel < span - PIT.gap) {
    const box = PIT.boxS(b.def.num - 1);
    if (!b.pitDone) {
      if (s > box + 6) return { lane: PIT.fast, cap: PIT.v - 1 };   // missed the box: drive on and try again next lap
      if (s > box - 16) return { lane: PIT.boxLat, cap: Math.min(PIT.v - 1, Math.sqrt(2 * 7 * Math.max(0, box - s - 0.8))) };
      return { lane: PIT.fast, cap: PIT.v - 1 };
    }
    return { lane: PIT.fast, cap: s < box + 8 ? 9 : PIT.v - 1 };
  }
  return { lane: -7, cap: PIT.v - 1 + (rel - (span - PIT.gap)) * 0.6 };
}

// =====================================================================
//  DRIVER ABILITIES: students, two passives and one ability per driver.
//  Every number comes from RULES and CHARACTERS in characters.js.
// =====================================================================
const CH = {};
CHARACTERS.forEach((c) => { CH[c.id] = c; });
const BUSLEN = RULES.busLength;
const drvId = (b) => (b && b.driver ? b.driver.id : '');
const RAIN = { t: 0, max: 0, loss: 0, owner: null, bowT: 0 };
const ITEMS = [], DROPS = [];
let USE_ID = 0;
// signed distance along the track from b to o (positive = o is ahead)
function relS(o, b) { const L = TRACK.L; return ((o.q.s - b.q.s + L * 1.5) % L) - L / 2; }

// ---------- per-bus state ----------
function setHitbox(b, k) {
  b.hitScale = k;
  b.halfL = (b.def.dim.L / 2 + 0.06) * k; b.halfW = (b.def.dim.W / 2 + 0.03) * k;
}
function resetAbil(b) {
  const id = drvId(b);
  b.bank = 0; b.meter = 0; b.effects = []; b.permBonus = 0; b.dynBonus = 0; b.dynSlow = 0;
  b.baseMul = id === 'sarp' ? 1 + CH.sarp.passive2.baseSpeed : 1;
  b.abilMul = b.baseMul; b.abilBonus = 0; b.abilSlow = 0; b.tempBonus = 0;
  b.rivalStunT = 0; b.selfStunT = 0; b.stunT = 0; b.stunGuardT = 0;
  b.holdT = 0; b.throwT = 0; b.throwSide = 0; b.throwBy = null; b.throwEnd = -9; b.flyY = 0;
  b.fieldInv = false; b.fieldT = 0;
  b.contact = new Map();
  b.aura = id === 'sarp'; b.dirtProof = id === 'ataberk';
  b.pitPen = 0; b.penPaid = 0; b.finishPen = 0; b.abUses = 0;
  b.ab = { key: '', t: 0, max: 0, hits: new Set() };
  b.pv = {
    foodT: 0, foodNext: CH.egemen.passive1.every * rr(0.4, 0.7),
    dessertT: 0, dessertNext: CH.ali.passive2.every * rr(0.4, 0.7),
    gym: 0, gymLap: {}, gymPend: 0,
    wrong: 0, quiz: null, quizT: 0, quizNext: CH.doruk.passive1.every * rr(0.45, 0.7),
    drift: { t: 0, bad: false, calm: 0 },
    lead: false, trailT: 0, trail: false, catch: 0, sarpUses: 0, songHist: [],
  };
  b.ai.abDelay = rr(1, 3); b.ai.goal = pick([25, 50, 50, 100]); b.ai.rageWait = 0; b.ai.songWait = 0;
  setHitbox(b, 1);
  if (b.m) resetAbilFX(b);
}
// everything that lives in the world rather than on one bus
function clearAbilWorld() {
  RAIN.t = 0; RAIN.max = 0; RAIN.owner = null; RAIN.bowT = 0;
  while (ITEMS.length) freeItem(ITEMS.pop());
  while (DROPS.length) DROPS.pop().mesh.visible = false;
  RACE.check = null; RACE.extChecks = []; hideGates(); hideLep(); closeCheckUI(); quizUI(null);
  if (AFX.bow) AFX.bow.visible = false;
}

// ---------- stuns and timed speed effects ----------
// a stun from a rival respects Sarp's aura and the stun guard; stuns a driver gives itself always apply
function stunBus(t, dur, src) {
  if (!t || t.finished) return false;
  if (t.remote) {   // online: the device that drives it decides (guard, aura), we guess for the pop-up
    if (NET.racing) netEvent(t, 'stun', { dur, src: busIdx(src) });
    return !(t.aura || t.stunGuardT > 0 || t.pitT > 0 || t.holdT > 0);
  }
  if (src && src !== t) {
    if (t.aura || t.stunGuardT > 0 || t.pitT > 0 || t.holdT > 0) return false;
    t.rivalStunT = Math.max(t.rivalStunT, dur);
    if (t.ab.key === 'song') cutSong(t, '', true);
  } else t.selfStunT = Math.max(t.selfStunT, dur);
  t.stunT = Math.max(t.rivalStunT, t.selfStunT);
  if (t.isPlayer) camShake(0.35);
  return true;
}
// the same key refreshes instead of stacking; nothing a rival gives (good or bad) touches Sarp
function addEffect(t, key, kind, amt, time, label, src) {
  if (!t || t.finished) return false;
  if (t.remote) {
    if (NET.racing) netEvent(t, 'eff', { key, kind, amt, time, label, src: busIdx(src) });
    return !(src && src !== t && t.aura);
  }
  if (src && src !== t && t.aura) return false;
  let e = t.effects.find((x) => x.key === key);
  if (!e) { e = { key }; t.effects.push(e); }
  e.kind = kind; e.amt = amt; e.t = time; e.max = time; e.label = label;
  return true;
}
function computeMul(b) {
  let bonus = b.permBonus + b.dynBonus, slow = b.dynSlow, temp = b.ab.key === 'song' ? b.ab.bonus : 0;
  for (const e of b.effects) { if (e.kind === 'bonus') { bonus += e.amt; temp += e.amt; } else slow += e.amt; }
  b.abilBonus = Math.min(RULES.maxBonus, bonus); b.abilSlow = Math.min(RULES.maxSlow, slow);
  b.abilMul = b.baseMul + b.abilBonus - b.abilSlow;
  b.tempBonus = Math.min(RULES.maxBonus, temp);   // short boosts show exhaust flames
}

// ---------- using an ability ----------
const needStudents = (b, n) => { const k = n - b.bank; return 'Need ' + k + ' more student' + (k === 1 ? '' : 's'); };
function abilityBlock(b) {
  const id = drvId(b);
  if (!id || !ABIL[id]) return 'No ability';
  if (b.finished) return 'Finished';
  if (b.holdT > 0 || b.throwT > 0) return 'Busy';
  if (b.stunT > 0) return 'Stunned';
  if (b.pitT > 0 || b.pitLim) return 'Not in the pit lane';
  return ABIL[id].block(b);
}
function useAbility(b) {
  if (abilityBlock(b)) return false;
  ABIL[drvId(b)].use(b); b.abUses++;
  return true;
}
function startAb(b, key, time) { b.ab = { key, t: time, max: time, hits: new Set(), id: ++USE_ID }; return b.ab; }
function endAb(b, done) {
  const old = b.ab; if (!old.key) return;
  b.ab = { key: '', t: 0, max: 0, hits: new Set() };
  const fin = ABEND[old.key]; if (fin) fin(b, old, done);
}
function announce(b, text) {
  const d = b.driver;
  if (b.isPlayer) superBanner(text || d.ability.name, d);
  else popText(b, (text || d.ability.name).toUpperCase(), d.color);
}
const TRANSFORM_NAMES = { cat: 'Dex the cat', thermos: 'Giant thermos', coffee: 'Coffee cup' };

const ABIL = {
  volkan: {
    block: (b) => (b.ab.key === 'field' ? 'Field is on' : b.bank < CH.volkan.ability.cost ? needStudents(b, CH.volkan.ability.cost) : ''),
    use(b) {
      const a = CH.volkan.ability; b.bank -= a.cost;
      startAb(b, 'field', a.time).inside = new Map();
      ringFX(b.x, b.z, 0, 0xff7a1a, a.radius * BUSLEN); SFX.field(camVol(b)); announce(b);
    },
  },
  egemen: {
    block: (b) => (b.ab.key === 'ball' ? 'Ball in the air' : b.bank < CH.egemen.ability.cost ? needStudents(b, CH.egemen.ability.cost) : ''),
    use(b) {
      const a = CH.egemen.ability, sy = Math.sin(b.yaw), cy = Math.cos(b.yaw);
      b.bank -= a.cost;
      startAb(b, 'ball', 0).ball = {
        x: b.x + sy * (b.halfL + 0.7), z: b.z + cy * (b.halfL + 0.7), vx: b.vx + sy * a.ballSpeed, vz: b.vz + cy * a.ballSpeed,
        life: a.range * BUSLEN / a.ballSpeed + 0.1, age: 0, hint: b.hint, q: { idx: 0, s: 0, d: 0, tx: 0, tz: 1 },
      };
      SFX.kick(camVol(b)); announce(b);
    },
  },
  irem: {
    block: (b) => (b.ab.key ? 'Still transformed' : b.bank < CH.irem.ability.cost ? needStudents(b, CH.irem.ability.cost) : ''),
    use(b) {
      const a = CH.irem.ability; b.bank -= a.cost;
      const r = rnd(), c1 = a.cat.chance, c2 = c1 + a.thermos.chance, c3 = c2 + a.coffee.chance;
      const kind = r < c1 ? 'cat' : r < c2 ? 'thermos' : r < c3 ? 'coffee' : 'plant';
      poofAt(b);
      if (kind === 'plant') {
        stunBus(b, a.plant.selfStun, null); b.fx.plantT = 1.2;
        SFX.sadHorn(camVol(b)); announce(b, 'Plant...');
        if (b.isPlayer) toast('A plant. Nothing happens. Stunned for ' + a.plant.selfStun + ' s');
        return;
      }
      const ab = startAb(b, kind, a.time);
      if (kind === 'cat') { addEffect(b, 'dex', 'bonus', a.cat.bonus, a.time, 'Dex the cat'); setHitbox(b, a.cat.hitbox); SFX.meow(camVol(b)); }
      if (kind === 'thermos') SFX.clonk(camVol(b));
      if (kind === 'coffee') { ab.dropT = 0.2; ab.drops = new Set(); SFX.slurp(camVol(b)); }
      announce(b, TRANSFORM_NAMES[kind]);
    },
  },
  ataberk: {
    block: (b) => (RAIN.t > 0 ? 'It is already raining' : b.bank < CH.ataberk.ability.cost ? needStudents(b, CH.ataberk.ability.cost) : ''),
    use(b) {
      const a = CH.ataberk.ability; b.bank -= a.cost;
      startAb(b, 'rain', a.time);
      RAIN.t = a.time; RAIN.max = a.time; RAIN.loss = a.gripLoss; RAIN.owner = b;
      if (NET.racing) netEvent(null, 'rain', { src: busIdx(b), time: a.time, loss: a.gripLoss });
      SFX.thunder(); announce(b);
      const p = RACE.player;
      if (p && p !== b) toast(p.aura ? 'Rain! Your happy aura keeps you dry' : 'Rain! −' + pct(a.gripLoss) + ' grip for ' + a.time + ' s');
    },
  },
  doruk: {
    block: (b) => {
      const need = CH.doruk.passive2.unlockWrong;
      if (b.ab.key === 'rage') return 'Raging';
      return b.pv.wrong < need ? 'Needs ' + need + ' wrong gates in a row (' + b.pv.wrong + '/' + need + ')' : '';
    },
    use(b) {
      const a = CH.doruk.ability, spent = b.bank; b.bank = 0; b.pv.wrong = 0;
      let tier = a.tiers[0]; for (const t of a.tiers) if (spent >= t.min) tier = t;
      const ab = startAb(b, 'rage', a.time); ab.tier = tier; ab.spent = spent;
      SFX.rage(camVol(b)); announce(b, 'RAGE · ' + spent + ' students');
      if (b.isPlayer) toast('Hit rivals: −' + pct(tier.slow) + ' for ' + tier.time + ' s');
    },
  },
  sarp: {
    block: (b) => { const a = CH.sarp.ability; return b.pv.sarpUses >= a.maxUses ? 'Used ' + a.maxUses + '/' + a.maxUses : b.bank < a.cost ? needStudents(b, a.cost) : ''; },
    use(b) {
      const a = CH.sarp.ability; b.bank -= a.cost; b.pv.sarpUses++; b.permBonus += a.bonus;
      ringFX(b.x, b.z, 0, 0xffc629, 16); SFX.powerUp(camVol(b)); announce(b, 'Aura +' + pct(a.bonus));
      if (b.isPlayer) toast('+' + pct(a.bonus) + ' top speed for the rest of the race (' + b.pv.sarpUses + '/' + a.maxUses + ')');
    },
  },
  ela: {
    block: (b) => (b.ab.key === 'song' ? 'Singing' : b.bank < CH.ela.ability.cost ? needStudents(b, CH.ela.ability.cost) : ''),
    use(b) {
      const a = CH.ela.ability; b.bank -= a.cost;
      startAb(b, 'song', a.time).bonus = 0; b.pv.songHist.length = 0;
      SFX.startSong(camVol(b), a.time); announce(b);
      if (b.isPlayer) toast('Don\'t brake, don\'t crash!');
    },
  },
  ali: {
    block: (b) => {
      const a = CH.ali.ability;
      if (b.ab.key) return b.ab.key === 'seek' ? 'Hunting' : b.ab.key === 'bite' ? 'Biting' : 'Check running';
      return b.meter < a.minMeter ? 'Needs ' + a.minMeter + '% sweet meter' : '';
    },
    use(b) {
      const a = CH.ali.ability, m = b.meter; b.meter = 0;
      if (m >= a.full.from) { startAb(b, 'seek', a.full.seekTime); SFX.growl(camVol(b)); announce(b, 'HUNGRY!'); if (b.isPlayer) toast('Crash into a rival within ' + a.full.seekTime + ' s to bite it'); }
      else if (m >= a.mid.from) startCheck(b);
      else { addEffect(b, 'sugar', 'bonus', a.low.bonus, a.low.time, 'Sugar rush'); SFX.powerUp(camVol(b)); announce(b, 'Sugar rush +' + pct(a.low.bonus)); }
      b.ai.goal = pick([25, 50, 50, 100]);
    },
  },
  ada: {
    block: (b) => (b.ab.key === 'lep' ? 'The leprechaun is busy' : b.bank < CH.ada.ability.cost ? needStudents(b, CH.ada.ability.cost) : !lepTarget(b) ? 'No rival close ahead' : ''),
    use(b) {
      const a = CH.ada.ability, tg = lepTarget(b); if (!tg) return;
      b.bank -= a.cost;
      startAb(b, 'lep', a.throwTime + 0.7).target = tg.bus;
      const o = tg.bus;
      if (o.remote) netEvent(o, 'throw', { src: busIdx(b), side: tg.side });
      else { o.throwT = a.throwTime; o.throwSide = tg.side; o.throwBy = b; if (o.ab.key === 'song') cutSong(o, '', true); }
      showLep(o, tg.side); SFX.lep(Math.max(camVol(b), camVol(o))); announce(b);
      if (o.isPlayer) showMsg('', 'A leprechaun grabbed you!', 'warn', 1.4);
    },
  },
};
// the rival Ada's leprechaun can throw: close ahead, next to a wall, never Sarp
function lepTarget(b) {
  const a = CH.ada.ability;
  let best = null, bd = Infinity;
  for (const o of RACE.buses) {
    if (o === b || o.aura || o.finished || o.pitT > 0 || o.pitLim || o.holdT > 0 || o.throwT > 0) continue;
    const ds = relS(o, b);
    if (ds <= 0 || ds - b.halfL - o.halfL > a.range * BUSLEN) continue;
    if (Math.abs(o.q.d - b.q.d) > 9 || inPitZone(o.q.s, o.q.d)) continue;
    let side = o.q.d >= 0 ? 1 : -1;
    if (side < 0 && o.q.s > PIT.s0 - 12 && o.q.s < PIT.s1 + 12) side = 1;   // the pit entry is not a wall
    if (ds < bd) { bd = ds; best = { bus: o, side }; }
  }
  return best;
}

// ---------- what an ability does while it runs ----------
const ABSTEP = {
  ball(b, dt) {
    const B = b.ab.ball, a = CH.egemen.ability;
    B.x += B.vx * dt; B.z += B.vz * dt; B.life -= dt; B.age += dt;
    TRACK.project(B.x, B.z, B.hint, B.q); B.hint = B.q.idx;
    if (Math.abs(B.q.d) > WALL - 0.4) { endAb(b, false); return; }
    for (const o of RACE.buses) {
      if (o === b || o.finished) continue;
      if (busDist(o, B.x, B.z) < o.halfW + 0.45) {
        const ok = stunBus(o, a.stun, b);
        popText(o, ok ? 'BONK!' : 'IMMUNE', ok ? '#ffe14a' : '#9fe8ff'); SFX.bonk(camVol(o));
        if (o.isPlayer && ok) toast('Hit by Egemen\'s football: stunned!');
        endAb(b, true); return;
      }
    }
    if (B.life <= 0) endAb(b, false);
  },
  coffee(b, dt) {
    const a = CH.irem.ability.coffee;
    b.ab.dropT -= dt;
    if (b.ab.dropT <= 0) { b.ab.dropT += a.dropEvery; dropCoffee(b); }
  },
  song(b) {
    const a = CH.ela.ability, el = b.ab.max - b.ab.t;
    b.ab.bonus = el >= a.time - 1 ? a.finalBonus : a.perSecond * Math.floor(el);
    const h = b.pv.songHist, now = RACE.t, v = b.speed;   // real speed, so a slide in a corner doesn't count as a drop
    h.push([now, v]); while (h.length && now - h[0][0] > a.dropWindow) h.shift();
    let mx = 0; for (const e of h) mx = Math.max(mx, e[1]);
    if (b.ctrl.brk > 0.05) cutSong(b, 'Braked!');
    else if (mx > 8 && v < mx * (1 - a.speedDrop)) cutSong(b, 'Lost speed!');
  },
};
const ABEND = {
  ball(b, ab, hit) { ballPoof(ab.ball, hit); },
  cat(b) { setHitbox(b, 1); poofAt(b); },
  thermos(b) { poofAt(b); },
  coffee(b) { poofAt(b); },
  rain(b) {
    const a = CH.ataberk.ability;
    RAIN.t = 0; RAIN.bowT = 7; showBow(); SFX.rainbow();
    addEffect(b, 'rainbow', 'bonus', a.rainbowBonus, a.rainbowTime, 'Rainbow');
    popText(b, 'RAINBOW +' + pct(a.rainbowBonus), '#ffe14a');
  },
  song(b, ab, done) {
    SFX.stopSong();
    if (done) { popText(b, 'ENCORE!', '#ffe14a'); if (b.isPlayer) toast('Song complete, no stun!'); }
  },
  check(b, ab) {
    const n = botChecks(b, ab.bots);
    if (RACE.check && !RACE.check.done && RACE.check.by === b) resolveCheck(false);
    if (b.isPlayer) toast(n + ' of ' + ab.bots.length + ' bots here failed the check' + (NET.racing ? ' (players answer on their own screens)' : ''));
  },
  seek(b, ab, done) { if (done) { popText(b, 'NO SNACK…', '#c9b8ff'); if (b.isPlayer) toast('Nobody to bite: the meter is gone'); } },
  bite(b) {
    const a = CH.ali.ability.full;
    addEffect(b, 'biteBonus', 'bonus', a.bonus, a.bonusTime, 'Sweet bite'); popText(b, 'YUM! +' + pct(a.bonus), '#ffe14a');
  },
  lep() { hideLep(); },
};

// ---------- crashes between buses and into walls ----------
// true when this touch starts a new crash (a continuous scrape counts once)
function touchPair(A, B) {
  const t = RACE.t, last = A.contact.get(B);
  A.contact.set(B, t); B.contact.set(A, t);
  return last === undefined || t - last > RULES.contactGap;
}
function restoreFwd(b, f0) {
  const sy = Math.sin(b.yaw), cy = Math.cos(b.yaw), f1 = b.vx * sy + b.vz * cy;
  if (f0 > f1) { b.vx += sy * (f0 - f1); b.vz += cy * (f0 - f1); }
}
// each device runs the crash passives of the buses it drives
function onCrash(A, B, fa, fb, sa, sb) { if (!A.remote) crashFor(A, B, fa, sb); if (!B.remote) crashFor(B, A, fb, sa); }
function crashFor(b, o, f0, oSpeed) {
  const id = drvId(b);
  if (id === 'volkan') {
    const p = CH.volkan.passive2;
    if (oSpeed > p.minOtherSpeed) { restoreFwd(b, f0); addEffect(b, 'crash', 'bonus', p.bonus, p.time, p.name); popText(b, 'CRASH +' + pct(p.bonus), '#ffb14a'); }
  } else if (id === 'ela') {
    const p = CH.ela.passive1;
    if (addEffect(o, 'cinnamon', 'bonus', p.bonus, p.time, 'Cinnamon roll', b)) cinnamonFX(b, o);
    b.pv.drift.bad = true;
    if (b.ab.key === 'song') cutSong(b, 'Crash!');
  } else if (id === 'doruk' && b.ab.key === 'rage' && !b.ab.hits.has(o)) {
    b.ab.hits.add(o); const t = b.ab.tier;
    if (addEffect(o, 'burn', 'slow', t.slow, t.time, 'Burn', b)) { popText(o, 'BURN −' + pct(t.slow), '#ff6a2a'); SFX.burn(camVol(o)); }
    else popText(o, 'IMMUNE', '#9fe8ff');
  } else if (id === 'irem' && b.ab.key === 'thermos' && !b.ab.hits.has(o)) {
    b.ab.hits.add(o);
    const ok = stunBus(o, CH.irem.ability.thermos.stun, b);
    popText(o, ok ? 'CLONK!' : 'IMMUNE', ok ? '#ffe14a' : '#9fe8ff'); SFX.clonk(camVol(o));
  } else if (id === 'ali' && b.ab.key === 'seek' && canBite(o)) bite(b, o);
}
function onWallImpact(b) {
  if (b.ab.key === 'song') cutSong(b, 'Crash!');
  if (drvId(b) === 'ela') b.pv.drift.bad = true;
}
// Ada's leprechaun: the target slides sideways into the wall (no teleporting)
function throwStep(b, dt) {
  const a = CH.ada.ability;
  b.throwT -= dt;
  const k = clamp(1 - b.throwT / a.throwTime, 0, 1);
  b.flyY = Math.sin(Math.PI * k) * 2.3;
  const nx = -b.q.tz * b.throwSide, nz = b.q.tx * b.throwSide;
  const dist = Math.max(0, WALL - 0.3 - b.halfW - b.q.d * b.throwSide);
  const want = clamp(dist / Math.max(0.12, b.throwT), 12, 36), vl = b.vx * nx + b.vz * nz;
  b.vx += nx * (want - vl); b.vz += nz * (want - vl);
  b.yaw = wrapA(b.yaw - b.throwSide * dt * 1.4);
  if (b.throwT <= 0) { b.throwT = 0; b.flyY = 0; b.throwEnd = RACE.t; }
}
function throwLanded(b) {
  const by = b.throwBy; b.throwBy = null; b.throwT = 0; b.flyY = 0;
  const ok = stunBus(b, CH.ada.ability.stun, by);
  popText(b, ok ? 'WHAM!' : 'IMMUNE', ok ? '#ffe14a' : '#9fe8ff');
  if (b.isPlayer) camShake(1);
}

// ---------- passives ----------
const PASSIVE = {
  egemen(b, dt, st, pos, live) {
    const p = CH.egemen.passive1, pv = b.pv;
    if (!live || b.finished || b.lap < 1) return;
    pv.foodT += dt;
    if (pv.foodT >= pv.foodNext) { pv.foodT = 0; pv.foodNext = p.every * rr(0.85, 1.15); if (itemCount(b) < p.maxItems) spawnItem(b, rnd() < p.glutenChance ? 'gluten' : 'free'); }
  },
  ali(b, dt, st, pos, live) {
    const p = CH.ali.passive2, pv = b.pv;
    if (!live || b.finished || b.lap < 1) return;
    pv.dessertT += dt;
    if (pv.dessertT >= pv.dessertNext) { pv.dessertT = 0; pv.dessertNext = p.every * rr(0.85, 1.15); if (itemCount(b) < 1) spawnItem(b, 'donut'); }
  },
  irem(b, dt, st, pos) {
    const p = CH.irem.passive2;
    b.pv.catch = b.finished ? 0 : Math.min(p.max, p.perDriver * pos);
    b.dynBonus += b.pv.catch;
  },
  ataberk(b, dt, st, pos, live) {
    const p = CH.ataberk.passive1, pv = b.pv;
    if (pv.gymPend > 0 && b.selfStunT <= 0) {
      b.permBonus += p.bonus * pv.gymPend; pv.gymPend = 0;
      popText(b, 'STRONGER +' + pct(p.bonus), '#7dff6a');
      if (b.isPlayer) toast('Gym done: +' + pct(p.bonus) + ' top speed until the finish (' + pv.gym + '/' + p.maxVisits + ')');
    }
    if (!live || b.finished || pv.gym >= p.maxVisits || b.lap < 1) return;
    const L = TRACK.L;
    for (const g of W.gyms) {
      if (pv.gymLap[g.i] === b.lap) continue;
      const ds = Math.abs(((b.q.s - g.s + L * 1.5) % L) - L / 2);
      if (ds < 3 + b.halfL * 0.6 && Math.abs(b.q.d - g.lat) < 2.2 + b.halfW) {
        pv.gymLap[g.i] = b.lap; pv.gym++; pv.gymPend++;
        stunBus(b, p.selfStun, null);
        popText(b, 'GYM TIME!', '#ffe14a'); SFX.clang(camVol(b)); gymFX(g, b);
        if (b.isPlayer) showMsg('GYM!', 'Lifting for ' + p.selfStun + ' s', 'warn', p.selfStun);
        break;
      }
    }
  },
  doruk(b, dt, st, pos, live) { quizStep(b, dt, live); },
  ela(b, dt) { driftStep(b, dt); },
  ada(b, dt, st, pos) {
    const p1 = CH.ada.passive1, p2 = CH.ada.passive2, pv = b.pv, second = st[1];
    // clear-leader penalty: two thresholds so it doesn't flicker on and off
    const gap = second && !second.finished ? second.gap : 0;
    if (!pv.lead && pos === 0 && !b.finished && gap > p1.onGap) pv.lead = true;
    else if (pv.lead && (pos !== 0 || b.finished || gap < p1.offGap)) pv.lead = false;
    if (pv.lead) b.dynSlow += p1.slow;
    // trail bonus: 1–3 bus lengths behind the driver right ahead, in about the same lane
    const ah = pos > 0 ? st[pos - 1] : null;
    let ok = false;
    if (ah && !ah.finished && !b.finished) {
      const ds = ah.progress - b.progress;
      ok = ds >= p2.minLengths * BUSLEN && ds <= p2.maxLengths * BUSLEN && Math.abs(ah.q.d - b.q.d) < p2.lane;
    }
    pv.trailT = ok ? pv.trailT + dt : 0;
    pv.trail = pv.trailT >= p2.hold;
    if (pv.trail) b.dynBonus += p2.bonus;
  },
};
// Ela: a clean drift of at least a second pays out when it ends
function driftStep(b, dt) {
  const p = CH.ela.passive2, dr = b.pv.drift;
  const sliding = b.speed > 10 && b.fwd > 0 && Math.abs(b.slip) > 0.14 && b.stunT <= 0 && b.holdT <= 0 && !b.finished;
  if (sliding) { dr.t += dt; dr.calm = 0; if (Math.abs(b.slip) > 1.25 || b.scraping) dr.bad = true; return; }
  if (dr.t <= 0) return;
  dr.calm += dt;
  if (dr.calm < 0.2 && b.speed >= 8) return;
  if (dr.t >= p.minDrift && !dr.bad) {
    const amt = Math.min(p.max, p.perSecond * Math.floor(dr.t));
    addEffect(b, 'drift', 'bonus', amt, p.time, 'Drift reward'); popText(b, 'DRIFT +' + pct(amt), '#5ef1ff');
    if (b.isPlayer) SFX.chime(1);
  }
  dr.t = 0; dr.bad = false; dr.calm = 0;
}

// ---------- Doruk: math question, then two answer gates ----------
function quizStep(b, dt, live) {
  const p = CH.doruk.passive1, pv = b.pv, q = pv.quiz;
  if (!live || b.finished) { if (q) endQuiz(b); return; }
  if (!q) {
    if (b.lap < 1) return;
    pv.quizT += dt;
    if (pv.quizT >= pv.quizNext && !b.pitLim && !(b.pitT > 0) && b.q.d > -(WALL - 1)) { pv.quizT = 0; pv.quizNext = p.every * rr(0.9, 1.1); newQuiz(b); }
    return;
  }
  q.t += dt;
  if (q.phase === 'ask' && q.t >= p.gateDelay) placeGates(b, q);
  if (q.phase !== 'gates') return;
  if (b.pitLim || b.q.d < -(WALL + 1)) { endQuiz(b); return; }
  const rel = relS({ q: { s: b.q.s } }, { q: { s: q.s } });
  if (q.prev < 0 && rel >= 0 && rel < 40) { answerGate(b, q, b.q.d < 0 ? -1 : 1); return; }
  q.prev = rel;
  if (q.t > p.gateDelay + 15) endQuiz(b);
}
function newQuiz(b) {
  const op = pick(['+', '−', '×']);
  let a, c, ans, wrong;
  if (op === '+') { a = ri(12, 49); c = ri(6, 39); ans = a + c; wrong = ans + pick([-10, -2, -1, 1, 2, 10]); }
  else if (op === '−') { a = ri(24, 70); c = ri(5, a - 10); ans = a - c; wrong = ans + pick([-10, -2, -1, 1, 2, 10]); }
  else { a = ri(3, 9); c = ri(3, 9); ans = a * c; wrong = pick([a * (c + 1), a * (c - 1), ans + 2, ans - 2]); }
  if (wrong === ans || wrong < 0) wrong = ans + 3;
  const side = rnd() < 0.5 ? -1 : 1;   // where the right answer will be: −1 = left gate, 1 = right gate
  b.pv.quiz = { phase: 'ask', t: 0, text: a + ' ' + op + ' ' + c + ' = ?', ans, wrong, side, botSide: rnd() < CH.doruk.passive1.botCorrect ? side : -side, s: 0, prev: 0 };
  if (b.isPlayer) { quizUI(b.pv.quiz); SFX.tone(880, 0.12, 'triangle', 0.1); }
}
function placeGates(b, q) {
  const L = TRACK.L;
  let s = TRACK.wrapS(b.q.s + clamp(Math.max(0, b.fwd) * 2.8, 80, 170));
  if (s < 25 || s > L - 25) s = 30;
  q.s = s; q.phase = 'gates'; q.prev = relS({ q: { s: b.q.s } }, { q: { s } });
  showGates(b, q);
  if (b.isPlayer) quizUI(q);
}
function answerGate(b, q, side) {
  const p = CH.doruk.passive2, ok = side === q.side;
  if (ok) { addEffect(b, 'gateOk', 'bonus', p.bonus, p.bonusTime, 'Right answer'); b.pv.wrong = 0; popText(b, 'CORRECT!', '#7dff6a'); SFX.ding(camVol(b)); }
  else { addEffect(b, 'gateBad', 'slow', p.slow, p.slowTime, 'Wrong answer'); b.pv.wrong++; popText(b, 'WRONG!', '#ff6b5e'); SFX.buzz(camVol(b)); }
  gateResult(side, ok);
  if (b.isPlayer) toast(ok ? 'Correct! +' + pct(p.bonus) + ' for ' + p.bonusTime + ' s' : 'Wrong! ' + q.ans + ' was right · ' + (b.pv.wrong >= p.unlockWrong ? 'RAGE unlocked!' : 'wrong in a row ' + b.pv.wrong + '/' + p.unlockWrong));
  endQuiz(b, true);
}
function endQuiz(b, answered) { b.pv.quiz = null; hideGates(answered ? 1.4 : 0); if (b.isPlayer) quizUI(null); }

// ---------- Egemen's snacks and Ali's donuts ----------
function itemCount(b) { let n = 0; for (const it of ITEMS) if (it.owner === b) n++; return n; }
function spawnItem(b, kind) {
  const s = TRACK.wrapS(b.q.s + rr(110, 210)), lat = rr(-HW + 2.4, HW - 2.4);
  TRACK.pointAt(s, lat, TMP);
  const it = { kind, owner: b, s, d: lat, x: TMP.x, z: TMP.z, age: 0, mesh: takeItemMesh(kind) };
  it.mesh.position.set(TMP.x, 0, TMP.z); it.mesh.visible = true;
  ITEMS.push(it);
}
function itemsStep(dt) {
  for (let i = ITEMS.length - 1; i >= 0; i--) {
    const it = ITEMS[i], b = it.owner;
    it.age += dt;
    if (b.finished || RACE.state !== 'race') { freeItem(it); ITEMS.splice(i, 1); continue; }
    const rel = relS(b, { q: { s: it.s } });
    if (Math.abs(rel) < b.halfL + 1.3 && Math.abs(it.d - b.q.d) < b.halfW + 1.3) { collectItem(b, it); freeItem(it); ITEMS.splice(i, 1); }
    else if (rel > 60) { freeItem(it); ITEMS.splice(i, 1); }
  }
}
function collectItem(b, it) {
  if (it.kind === 'gluten') {
    const p = CH.egemen.passive1;
    addEffect(b, 'gluten', 'slow', p.slow, p.time, 'Gluten'); popText(b, 'GLUTEN!', '#ff6b5e');
    if (b.isPlayer) glutenAlarm(); else SFX.buzz(camVol(b));
  } else if (it.kind === 'free') {
    const p = CH.egemen.passive2;
    addEffect(b, 'glutenFree', 'bonus', p.bonus, p.time, 'Gluten-free'); popText(b, 'GLUTEN-FREE +' + pct(p.bonus), '#7dff6a'); SFX.chime(camVol(b));
  } else {
    const p = CH.ali.passive2;
    b.meter = Math.min(100, b.meter + p.perDessert); popText(b, 'DONUT +' + p.perDessert + '%', '#ff9ad5'); SFX.chime(camVol(b));
  }
}
// students from a bus stop: Ali eats them for his sweet meter, everyone else banks them
function pickupStudents(b, n, stop) {
  b.students += n;
  if (drvId(b) === 'ali') { b.meter = Math.min(100, b.meter + n * CH.ali.passive1.perStudent); eatFX(b, stop); }
  else b.bank += n;
}

// ---------- İrem's coffee drops ----------
function dropCoffee(b) {
  const a = CH.irem.ability.coffee, [x, z] = rearPoint(b);
  const d = { x, z, life: a.dropLife, owner: b, hits: b.ab.drops, mesh: takeDropMesh() };
  d.mesh.position.set(x, 0.075, z); d.mesh.rotation.y = rr(0, 6.28); d.mesh.scale.setScalar(0.3); d.mesh.visible = true;
  DROPS.push(d);
  if (NET.racing) netEvent(null, 'drop', { src: busIdx(b), x: r2(x), z: r2(z), use: b.ab.id });
}
function dropsStep(dt) {
  const a = CH.irem.ability.coffee;
  for (let i = DROPS.length - 1; i >= 0; i--) {
    const d = DROPS[i]; d.life -= dt;
    if (d.life <= 0) { d.mesh.visible = false; DROPS.splice(i, 1); continue; }
    for (const o of RACE.buses) {
      if (o === d.owner || d.hits.has(o) || o.finished || o.remote) continue;
      if (busDist(o, d.x, d.z) < o.halfW + 1.1) {
        d.hits.add(o);
        if (addEffect(o, 'coffee', 'slow', a.slow, a.slowTime, 'Coffee', d.owner)) { popText(o, 'COFFEE −' + pct(a.slow), '#e0b48a'); if (o.isPlayer) SFX.splash(); }
        else popText(o, 'IMMUNE', '#9fe8ff');
      }
    }
  }
}

// ---------- Ali's sweet crisis ----------
function startCheck(b) {
  const a = CH.ali.ability.mid, ab = startAb(b, 'check', a.checkTime);
  ab.bots = [];
  for (const o of RACE.buses) {
    if (o === b || o.finished || o.aura || o.remote) continue;
    if (o.isPlayer) openCheck(b); else ab.bots.push({ bus: o, pass: rnd() < a.botPass });
  }
  if (NET.racing) netEvent(null, 'check', { src: busIdx(b) });   // players on other devices get their own check
  SFX.checkStart(); announce(b, 'Sweet crisis!');
}
function openCheck(by) {
  const z0 = rr(0.34, 0.6);
  RACE.check = { t: 0, max: CH.ali.ability.mid.checkTime, z0, z1: z0 + 0.26, done: false, hideT: 0, by };
  openCheckUI(RACE.check);
}
function pressCheck() {
  const c = RACE.check; if (!c || c.done) return false;
  const k = c.t / c.max; resolveCheck(k >= c.z0 && k <= c.z1); return true;
}
function resolveCheck(ok) {
  const c = RACE.check, p = RACE.player; if (!c || c.done) return;
  const a = CH.ali.ability.mid;
  c.done = true; c.hideT = 0.7; c.ok = ok;
  if (ok) { SFX.ding(1); toast('Dodged the sugar crash!'); }
  else { if (p && addEffect(p, 'sugarCheck', 'slow', a.slow, a.slowTime, 'Sweet crisis', c.by)) toast('Sugar crash: −' + pct(a.slow) + ' for ' + a.slowTime + ' s'); SFX.buzz(1); }
  checkResultUI(ok);
}
// bots that failed a reaction check are slowed when it ends
function botChecks(by, bots) {
  const a = CH.ali.ability.mid; let n = 0;
  for (const r of bots) {
    if (r.pass) { popText(r.bus, 'DODGED', '#7dff6a'); continue; }
    if (addEffect(r.bus, 'sugarCheck', 'slow', a.slow, a.slowTime, 'Sweet crisis', by)) { n++; popText(r.bus, 'SUGAR CRASH', '#ff7ab6'); }
  }
  return n;
}
function checkTick(dt) {
  const X = RACE.extChecks || [];
  for (let i = X.length - 1; i >= 0; i--) { const e = X[i]; e.t += dt; if (e.t >= e.max) { botChecks(e.by, e.bots); X.splice(i, 1); } }
  const c = RACE.check; if (!c) return;
  c.t += dt;
  if (!c.done && c.t >= c.max) resolveCheck(false);
  if (c.done) { c.hideT -= dt; if (c.hideT <= 0) { RACE.check = null; closeCheckUI(); } }
}
function canBite(o) { return !o.aura && !o.finished && !(o.pitT > 0) && !o.pitLim && !(o.holdT > 0) && !(o.stunGuardT > 0); }
function bite(b, o) {
  const a = CH.ali.ability.full;
  startAb(b, 'bite', a.biteTime).victim = o;
  b.holdT = a.biteTime; b.vx = b.vz = 0;
  if (o.remote) netEvent(o, 'bite', { src: busIdx(b), dur: a.biteTime, pen: a.pitPenalty });
  else { if (o.ab.key === 'song') cutSong(o, '', true); o.holdT = a.biteTime; o.vx = o.vz = 0; o.pitPen = Math.max(o.pitPen, a.pitPenalty); }
  chompFX(b, o); SFX.chomp(Math.max(camVol(b), camVol(o)));
  if (o.isPlayer) showMsg('CHOMP!', 'Ali bit you: +' + a.pitPenalty + ' s at your next pit stop', 'warn', 2.2);
  if (b.isPlayer) toast('CHOMP! ' + o.driver.nick + ' waits +' + a.pitPenalty + ' s at the next pit stop');
}
function cutSong(b, why, noStun) {
  if (b.ab.key !== 'song') return;
  const a = CH.ela.ability;
  endAb(b, false);
  if (!noStun) stunBus(b, a.failStun, null);
  popText(b, (why || 'Song over').toUpperCase(), '#ff7ab6'); SFX.scratch(camVol(b));
  if (b.isPlayer) showMsg('', (why || 'The song stopped') + (noStun ? '' : ' · stunned for ' + a.failStun + ' s'), 'warn', 1.6);
}

// ---------- once per physics step, after the buses moved ----------
// Volkan's field: every device checks the buses it drives (the field's owner may be on another device)
function fieldCheck(dt) {
  const R = CH.volkan.ability.radius * BUSLEN;
  for (const t of RACE.buses) {
    if (t.remote) continue;
    const F = RACE.buses.find((b) => b !== t && b.ab.key === 'field');
    if (!F) { t.fieldInv = false; t.fieldUse = ''; continue; }
    const use = busIdx(F) + ':' + F.ab.id;
    if (t.fieldUse !== use) { t.fieldUse = use; t.fieldState = ''; }
    if (t.fieldState === 'done') { t.fieldInv = false; continue; }
    const inside = !t.finished && !t.aura && Math.hypot(t.x - F.x, t.z - F.z) < R;
    if (inside && t.fieldState !== 'in') { t.fieldState = 'in'; t.fieldInv = true; t.fieldT = 0; if (t.isPlayer) reversedWarning(); SFX.field(camVol(t) * 0.6); }
    else if (inside) t.fieldT += dt;
    else if (t.fieldState === 'in') { t.fieldState = 'done'; t.fieldInv = false; }
  }
}
function abilStep(dt) {
  const all = RACE.buses, st = standings(), live = RACE.state === 'race';
  if (RAIN.t > 0) {
    RAIN.t = Math.max(0, RAIN.t - dt);
    if (RAIN.t === 0 && RAIN.owner && RAIN.owner.remote) { RAIN.bowT = 7; showBow(); SFX.rainbow(); }   // the owner's device adds the bonus
  }
  fieldCheck(dt);
  for (const b of all) {
    if (b.remote) continue;
    if (b.rivalStunT > 0) { b.rivalStunT -= dt; if (b.rivalStunT <= 0) { b.rivalStunT = 0; b.stunGuardT = RULES.stunGuard; } }
    else if (b.stunGuardT > 0) b.stunGuardT = Math.max(0, b.stunGuardT - dt);
    if (b.selfStunT > 0) b.selfStunT = Math.max(0, b.selfStunT - dt);
    b.stunT = Math.max(b.rivalStunT, b.selfStunT);
    if (b.holdT > 0) b.holdT = Math.max(0, b.holdT - dt);
    for (let i = b.effects.length - 1; i >= 0; i--) { const e = b.effects[i]; e.t -= dt; if (e.t <= 0) b.effects.splice(i, 1); }
    if (b.ab.key) {
      const step = ABSTEP[b.ab.key]; if (step) step(b, dt);
      if (b.ab.key && b.ab.max > 0) { b.ab.t -= dt; if (b.ab.t <= 0) { b.ab.t = 0; endAb(b, true); } }
    }
    b.dynBonus = 0; b.dynSlow = 0;
    const id = drvId(b);
    if (id && PASSIVE[id]) PASSIVE[id](b, dt, st, st.indexOf(b), live);
    if (b.ab.key === 'song') b.dynBonus += b.ab.bonus;
    computeMul(b);
  }
  itemsStep(dt); dropsStep(dt); checkTick(dt);
}

// ---------- bots use their abilities for real ----------
function rivalAhead(b, maxDs, lane, filter) {
  for (const o of RACE.buses) {
    if (o === b || o.finished || (filter && !filter(o))) continue;
    const ds = relS(o, b);
    if (ds > 0 && ds < maxDs && Math.abs(o.q.d - b.q.d) < lane) return o;
  }
  return null;
}
// the next stretch is fast enough to sing through without braking
function aiSongSafe(b) {
  const v = Math.max(0, b.fwd);
  if (v < 24) return false;
  for (let k = 10; k < 250; k += 10) { const kk = Math.abs(TRACK.curvAt(b.q.s + k)); if (kk > 0.003 && cornerSpeed(b.st, kk) * b.ai.skill < v * 1.1) return false; }
  return true;
}
const AIWANT = {
  volkan: (b) => { const a = CH.volkan.ability, R = a.radius * BUSLEN + (b.bank >= a.cost * 3 ? 25 : 3); return RACE.buses.some((o) => o !== b && !o.finished && !o.aura && Math.hypot(o.x - b.x, o.z - b.z) < R); },
  egemen: (b) => !!rivalAhead(b, b.halfL + CH.egemen.ability.range * BUSLEN + 3, b.bank >= 30 ? 3.6 : 2.2),
  irem: () => true,
  ataberk: () => true,
  doruk: (b) => {
    // use it before the next gate: a right answer would lock it again
    const T = CH.doruk.ability.tiers, top = T[T.length - 1].min, mid = T[Math.max(0, T.length - 2)].min;
    const soon = !!b.pv.quiz && b.pv.quiz.phase === 'gates';
    const ready = soon || b.bank >= top || b.ai.rageWait > 12 || (b.bank >= mid && b.ai.rageWait > 5);
    return ready && (soon || b.ai.rageWait > 20 || !!rivalAhead(b, 45, 7, (o) => !o.aura));
  },
  sarp: () => true,
  ela: (b) => !rivalAhead(b, 32, 4) && (aiSongSafe(b) || b.ai.songWait > 22),
  // a full meter waits for a rival right ahead in the same lane, so the hunt can end in a bite
  ali: (b) => b.meter >= b.ai.goal && (b.ai.goal < CH.ali.ability.full.from || b.ai.fullWait > 45 || !!rivalAhead(b, b.ai.fullWait > 20 ? 26 : 16, b.ai.fullWait > 20 ? 5 : 3.5, canBite)),
  ada: () => true,
};
function aiAbility(b, dt) {
  const ai = b.ai, id = drvId(b);
  if (RACE.state !== 'race' || b.finished || ai.pit || !id) return;
  if (id === 'doruk' && b.pv.wrong >= CH.doruk.passive2.unlockWrong) ai.rageWait += dt;
  if (id === 'ela' && b.bank >= CH.ela.ability.cost) ai.songWait += dt;
  if (id === 'ali') {
    ai.fullWait = b.meter >= 100 ? (ai.fullWait || 0) + dt : 0;
    // a leader with nobody to chase settles for the reaction check before the meter fills up
    if (ai.goal >= CH.ali.ability.full.from && b.meter >= CH.ali.ability.mid.from && b.meter < 100 && standings()[0] === b && !rivalAhead(b, 150, 30, canBite)) ai.goal = CH.ali.ability.mid.from;
  }
  ai.abDelay -= dt; if (ai.abDelay > 0) return;
  if (abilityBlock(b) || !AIWANT[id](b)) return;
  if (useAbility(b)) { ai.abDelay = rr(0.8, 2.4); ai.rageWait = 0; ai.songWait = 0; }
}
// where a bot wants to drive because of its own passives and ability
function aiLaneWish(b, s, lane) {
  const id = drvId(b);
  const q = b.pv.quiz;
  if (id === 'doruk' && q && q.phase === 'gates') { const ds = TRACK.wrapS(q.s - s); if (ds < 190) return q.botSide * 5; }
  b.ai.bait = false;
  if ((id === 'ali' && b.ab.key === 'seek') || (id === 'doruk' && b.ab.key === 'rage')) {
    const ok = id === 'ali' ? canBite : (x) => !x.aura && !b.ab.hits.has(x);
    const o = rivalAhead(b, 70, 30, ok);
    if (o) return o.q.d;
    // nobody ahead: sit in the lane of a rival right behind and lift, so it runs into us
    const back = RACE.buses.find((x) => x !== b && !x.finished && ok(x) && relS(x, b) < 0 && relS(x, b) > -20);
    if (back) { b.ai.bait = true; return back.q.d; }
  }
  for (const it of ITEMS) {
    if (it.owner !== b) continue;
    const ds = TRACK.wrapS(it.s - s);
    if (ds > 160) continue;
    if (it.kind === 'gluten') { if (ds < 80 && Math.abs(lane - it.d) < 3.4) lane = it.d + (it.d > 0 ? -4.4 : 4.4); }
    else return it.d;
  }
  if (id === 'ataberk' && b.pv.gym < CH.ataberk.passive1.maxVisits && b.lap < RACE.laps) {
    for (const g of W.gyms) { if (b.pv.gymLap[g.i] === b.lap) continue; const ds = TRACK.wrapS(g.s - s); if (ds > 8 && ds < 150) return g.lat; }
  }
  return lane;
}

// ---------- HUD helpers ----------
function abilityInfo(b) {
  const id = drvId(b), a = CH[id].ability, why = abilityBlock(b);
  const key = TOUCH ? 'Tap ABILITY' : 'Press SHIFT';
  const o = { name: a.name, cost: '', big: String(b.bank), unit: b.bank === 1 ? 'student' : 'students', frac: 0, state: 'wait', hint: why };
  if (id === 'ali') { o.big = Math.round(b.meter) + '%'; o.unit = 'sweet meter'; o.frac = b.meter / 100; o.cost = a.minMeter + '%+'; }
  else if (id === 'doruk') { o.cost = 'ALL'; o.frac = Math.min(1, b.pv.wrong / CH.doruk.passive2.unlockWrong); }
  else { o.cost = String(a.cost); o.frac = Math.min(1, b.bank / a.cost); }
  if (id === 'sarp') o.name += ' ' + b.pv.sarpUses + '/' + a.maxUses;
  if (b.ab.key && b.ab.max > 0) {
    o.state = 'on'; o.frac = b.ab.t / b.ab.max;
    o.hint = (TRANSFORM_NAMES[b.ab.key] || { seek: 'Hunting', bite: 'Biting', check: 'Reaction check', lep: 'Leprechaun', rain: 'Raining', song: 'Singing +' + pct(b.ab.bonus || 0), field: 'Field on', rage: 'Raging' }[b.ab.key] || a.name) + ' · ' + b.ab.t.toFixed(1) + ' s';
  } else if (b.ab.key === 'ball') { o.state = 'on'; o.hint = 'Ball in the air'; }
  else if (!why) {
    o.state = 'ready';
    if (id === 'ali') o.hint = key + ': ' + (b.meter >= a.full.from ? 'hunt a rival' : b.meter >= a.mid.from ? 'reaction check for all' : '+' + pct(a.low.bonus) + ' speed');
    else if (id === 'doruk') o.hint = key + ': rage with ' + b.bank + ' students';
    else o.hint = key + ': ' + a.name;
  }
  return o;
}
function effectList(b) {
  const L = [], id = drvId(b), pv = b.pv;
  const sgn = (x) => (x >= 0 ? '+' : '−') + pct(x);
  if (b.holdT > 0) L.push(['stun', id === 'ali' && b.ab.key === 'bite' ? 'Biting' : 'Bitten!', b.holdT]);
  else if (b.stunT > 0) L.push(['stun', 'Stunned', b.stunT]);
  if (b.fieldInv) L.push(['bad', 'Reversed controls', null]);
  if (RAIN.t > 0 && !b.aura) L.push(['bad', 'Rain −' + pct(RAIN.loss) + ' grip', RAIN.t]);
  for (const e of b.effects) L.push([e.kind === 'bonus' ? 'good' : 'bad', sgn(e.kind === 'bonus' ? e.amt : -e.amt) + ' ' + e.label, e.t]);
  if (b.ab.key === 'song') L.push(['good', '+' + pct(b.ab.bonus) + ' Song', b.ab.t]);
  if (id === 'irem' && pv.catch > 0) L.push(['good', '+' + pct(pv.catch) + ' Catch-up', null]);
  if (id === 'ada' && pv.lead) L.push(['bad', '−' + pct(CH.ada.passive1.slow) + ' Clear leader', null]);
  if (id === 'ada' && pv.trail) L.push(['good', '+' + pct(CH.ada.passive2.bonus) + ' Trail', null]);
  if (b.permBonus > 0) L.push(['good', '+' + pct(b.permBonus) + (id === 'sarp' ? ' Permanent' : ' Gym'), null]);
  if (b.stunGuardT > 0) L.push(['info', 'Stun guard', b.stunGuardT]);
  if (b.pitPen > 0) L.push(['bad', 'Pit penalty +' + b.pitPen + ' s', null]);
  if (id === 'doruk' && pv.wrong > 0) L.push(['info', 'Wrong in a row ' + pv.wrong + '/' + CH.doruk.passive2.unlockWrong, null]);
  return L;
}

// =====================================================================
//  ABILITY VISUALS: snacks, football, gym spots, answer gates, the
//  marginal field, İrem's transformations, rain, rainbow, leprechaun
// =====================================================================
const AFX = { items: { gluten: [], free: [], donut: [] }, drops: [], dropTex: null, ball: null, gates: null, field: null, lep: null, rain: null, bow: null, mouthTex: null, labels: {} };
const V3 = new THREE.Vector3();

function initAbilFX() {
  initPop(); initIcons();
  // Egemen's football
  const bt = texLabel(256, 128, (g, w, h) => {
    g.fillStyle = '#f7f7f7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16181c';
    for (const [x, y, r] of [[32, 64, 15], [96, 64, 15], [160, 64, 15], [224, 64, 15], [0, 20, 11], [64, 20, 11], [128, 20, 11], [192, 20, 11], [256, 20, 11], [0, 108, 11], [64, 108, 11], [128, 108, 11], [192, 108, 11], [256, 108, 11]]) {
      g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill();
    }
    g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
  });
  AFX.ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 14), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.45 }));
  AFX.ball.castShadow = true; AFX.ball.visible = false; scene.add(AFX.ball);
  // İrem's coffee drops
  AFX.dropTex = texLabel(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 6, 64, 64, 60); gr.addColorStop(0, 'rgba(92,52,24,.95)'); gr.addColorStop(0.75, 'rgba(120,72,36,.85)'); gr.addColorStop(1, 'rgba(120,72,36,0)');
    g.fillStyle = gr; g.beginPath();
    for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 2, r = 46 + Math.sin(i * 2.7) * 9; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    g.fill();
    g.fillStyle = 'rgba(255,240,220,.35)'; g.beginPath(); g.ellipse(50, 48, 12, 6, -0.5, 0, 7); g.fill();
  });
  const dropGeo = new THREE.CircleGeometry(1.6, 24); dropGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(dropGeo, new THREE.MeshBasicMaterial({ map: AFX.dropTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 }));
    m.visible = false; m.renderOrder = 3; scene.add(m); AFX.drops.push(m);
  }
  AFX.mouthTex = texLabel(256, 160, (g) => {
    g.fillStyle = '#3a0b18'; g.beginPath(); g.ellipse(128, 84, 116, 66, 0, 0, 7); g.fill();
    g.fillStyle = '#ff7aa8'; g.beginPath(); g.ellipse(128, 120, 64, 26, 0, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.strokeStyle = '#999'; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const x = 30 + i * 28; g.beginPath(); g.moveTo(x, 26); g.lineTo(x + 26, 26); g.lineTo(x + 13, 62); g.closePath(); g.fill(); g.stroke(); }
    for (let i = 0; i < 6; i++) { const x = 44 + i * 28; g.beginPath(); g.moveTo(x, 146); g.lineTo(x + 26, 146); g.lineTo(x + 13, 112); g.closePath(); g.fill(); g.stroke(); }
    g.lineWidth = 10; g.strokeStyle = '#a66cff'; g.beginPath(); g.ellipse(128, 84, 118, 68, 0, 0, 7); g.stroke();
  });
  initGates(); initField(); initRain(); initBow(); initLep();
}

// ---------- snacks and donuts ----------
function itemLabel(kind) {
  if (AFX.labels[kind]) return AFX.labels[kind];
  const txt = kind === 'gluten' ? 'GLUTEN' : kind === 'free' ? 'GLUTEN-FREE' : 'DONUT +' + CH.ali.passive2.perDessert + '%';
  const bg = kind === 'gluten' ? '#d8201c' : kind === 'free' ? '#1f9a45' : '#a66cff';
  AFX.labels[kind] = texLabel(512, 128, (g, w, h) => {
    g.fillStyle = bg; rrect(g, 8, 18, w - 16, h - 36, 30); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#ffffff'; g.font = `italic 900 60px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, txt, w / 2, h / 2 + 3, w - 60);
  });
  return AFX.labels[kind];
}
function makeItemMesh(kind) {
  const grp = new THREE.Group(), body = new THREE.Group(); grp.add(body);
  let parts;
  if (kind === 'gluten') {
    parts = [[boxAt(1.4, 0.62, 2.6, 0, 0.31, 0), 0xc47f35], [boxAt(1.28, 0.22, 2.44, 0, 0.72, 0), 0xe3ab5c],
      [boxAt(1.3, 0.06, 0.16, 0, 0.84, -0.8), 0xf6d796], [boxAt(1.3, 0.06, 0.16, 0, 0.84, 0), 0xf6d796], [boxAt(1.3, 0.06, 0.16, 0, 0.84, 0.8), 0xf6d796]];
    const m = new THREE.Mesh(mergeColored(parts), VCMAT()); m.scale.setScalar(1.25); m.position.y = 0.6; m.castShadow = true; body.add(m);
  } else if (kind === 'free') {
    const ap = new THREE.SphereGeometry(0.85, 18, 14); ap.scale(1, 0.92, 1); ap.translate(0, 1.4, 0);
    parts = [[ap, 0x7cc242], [cylAt(0.06, 0.08, 0.55, 6, 0, 2.4, 0, 0, 0.2), 0x6b4a2e], [boxAt(0.5, 0.06, 0.28, 0.25, 2.35, 0, 0, 0, -0.5), 0x2f8a2f]];
    const m = new THREE.Mesh(mergeColored(parts), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 60 })); m.castShadow = true; body.add(m);
  } else {
    const dough = new THREE.TorusGeometry(0.72, 0.34, 12, 28); dough.translate(0, 1.45, 0);
    const icing = new THREE.TorusGeometry(0.72, 0.3, 10, 28); icing.scale(1.03, 1.03, 0.75); icing.translate(0, 1.45, 0.12);
    parts = [[dough, 0xd9954a], [icing, 0xff7ab6]];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.2, r = 0.72 + (i % 3 - 1) * 0.12; parts.push([boxAt(0.16, 0.05, 0.05, Math.cos(a) * r, 1.45 + Math.sin(a) * r, 0.42, 0, 0, a * 1.7), pick([0xffffff, 0xffe14a, 0x5ef1ff, 0x7dff6a])]); }
    const m = new THREE.Mesh(mergeColored(parts), new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 40 })); m.castShadow = true; body.add(m);
  }
  const ringG = new THREE.RingGeometry(1.5, 1.85, 40); ringG.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: col(kind === 'gluten' ? 0xff3b30 : kind === 'free' ? 0x34ff6a : 0xc59bff), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.position.y = 0.08; ring.renderOrder = 3; grp.add(ring);
  const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: itemLabel(kind), transparent: true, depthWrite: false }));
  lab.scale.set(3.6, 0.9, 1); lab.position.y = 3.3; lab.renderOrder = 6; grp.add(lab);
  grp.visible = false; grp.userData = { used: false, body, kind }; scene.add(grp);
  return grp;
}
function takeItemMesh(kind) {
  const pool = AFX.items[kind];
  let m = pool.find((x) => !x.userData.used);
  if (!m) { m = makeItemMesh(kind); pool.push(m); }
  m.userData.used = true; return m;
}
function freeItem(it) { it.mesh.visible = false; it.mesh.userData.used = false; }
function takeDropMesh() { let m = AFX.drops.find((x) => !x.visible); if (!m) m = AFX.drops[0]; return m; }

// ---------- Ataberk's gym spots (world objects, shown when he races) ----------
function buildGyms() {
  W.gyms = [];
  const padTex = texLabel(256, 512, (g, w, h) => {
    g.fillStyle = 'rgba(47,191,90,.2)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2fbf5a'; g.lineWidth = 14; g.setLineDash([30, 18]); g.strokeRect(10, 10, w - 20, h - 20); g.setLineDash([]);
    g.fillStyle = '#2fbf5a'; g.fillRect(70, 150, 116, 22); g.fillRect(36, 112, 36, 98); g.fillRect(184, 112, 36, 98);
    g.font = `italic 900 104px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GYM', w / 2, 320);
    g.font = `800 30px ${FONT_D}`; fitText(g, 'TOSUNKOVALAYAN', w / 2, 410, w - 40);
  });
  const barG = mergeColored([
    [cylAt(0.09, 0.09, 3.4, 8, 0, 0, 0, 0, Math.PI / 2), 0xb9bcc1],
    [cylAt(0.55, 0.55, 0.26, 18, 1.25, 0, 0, 0, Math.PI / 2), 0x16181c], [cylAt(0.45, 0.45, 0.22, 18, 1.5, 0, 0, 0, Math.PI / 2), 0xe10600],
    [cylAt(0.55, 0.55, 0.26, 18, -1.25, 0, 0, 0, Math.PI / 2), 0x16181c], [cylAt(0.45, 0.45, 0.22, 18, -1.5, 0, 0, 0, Math.PI / 2), 0xe10600],
  ]);
  [[455, 1], [1175, -1], [1790, 1]].forEach(([s, side], i) => {
    const lat = side * 6.6;
    const decal = roadDecal(4.6, 8.6, padTex, s, lat, 0.066, { opacity: 0.95 });
    const grp = new THREE.Group(); TRACK.pointAt(s, lat, TMP); grp.position.set(TMP.x, 0, TMP.z);
    const db = new THREE.Mesh(barG, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 50 })); db.position.y = 4.2; db.castShadow = true; grp.add(db);
    scene.add(grp);
    decal.visible = false; grp.visible = false;
    W.gyms.push({ i, s, lat, decal, grp, db });
  });
}
function showGyms(on) { for (const g of W.gyms) { g.decal.visible = on; g.grp.visible = on; } }
function gymFX(g, b) { for (let i = 0; i < 6; i++) iconAt('dumbbell', b.x + rr(-1.5, 1.5), 3 + rr(0, 1.5), b.z + rr(-1.5, 1.5), rr(-2, 2), rr(3, 6), rr(-2, 2), 1.1, 1.1, 9); }

// ---------- Doruk's answer gates ----------
function initGates() {
  const grp = new THREE.Group();
  const steel = new THREE.MeshLambertMaterial({ color: col(0x2b2f36) });
  for (const x of [HW + 1.0, -(HW + 1.0)]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.7, 0.5), steel); p.position.set(x, 3.85, 0); p.castShadow = true; grp.add(p); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * HW + 2.5, 0.45, 0.45), steel); beam.position.y = 7.55; beam.castShadow = true; grp.add(beam);
  const qc = cv(1024, 192), qTex = tex(qc, false);
  const qBoard = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 1.78), new THREE.MeshBasicMaterial({ map: qTex, toneMapped: false, side: THREE.DoubleSide }));
  qBoard.position.set(0, 8.8, 0); qBoard.rotation.y = Math.PI; grp.add(qBoard);
  const boards = [];
  for (const side of [-1, 1]) {   // −1 = the drivers' left gate; local +x is the left side of the road
    const c = cv(512, 256), t = tex(c, false);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3.8), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, side: THREE.DoubleSide }));
    m.position.set(-side * HW / 2, 5.4, 0); m.rotation.y = Math.PI; grp.add(m);
    const hg = new THREE.PlaneGeometry(HW - 0.5, 7); hg.rotateX(-Math.PI / 2);
    const half = new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: col(side < 0 ? 0x2d7bff : 0xff8a1a), transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -7, polygonOffsetUnits: -7 }));
    half.position.set(-side * HW / 2, 0.07, 0); half.renderOrder = 3; grp.add(half);
    boards.push({ side, c, t, half });
  }
  grp.visible = false; scene.add(grp);
  AFX.gates = { grp, qc, qTex, boards, hideT: -1, k: 0 };
}
function drawGateBoard(bd, value, state) {
  const g = bd.c.getContext('2d'), w = 512, h = 256;
  const base = bd.side < 0 ? '#1d5fd6' : '#ff7a00';
  g.fillStyle = state === 'ok' ? '#1fa84f' : state === 'bad' ? '#c3120c' : base; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 34px ${FONT_D}`; g.fillText(bd.side < 0 ? '◀ LEFT' : 'RIGHT ▶', w / 2, 44);
  g.font = `italic 900 138px ${FONT_D}`; fitText(g, String(value), w / 2, 150, w - 60);
  bd.t.needsUpdate = true;
}
function showGates(b, q) {
  const G = AFX.gates, g = G.qc.getContext('2d'), w = 1024, h = 192;
  g.fillStyle = '#0d1016'; g.fillRect(0, 0, w, h); g.fillStyle = b.driver.color; g.fillRect(0, h - 14, w, 14);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 34px ${FONT_D}`; g.fillText(b.driver.nick.toUpperCase() + ' · PICK A GATE', w / 2, 36);
  g.font = `italic 900 100px ${FONT_D}`; fitText(g, q.text, w / 2, 114, w - 80);
  G.qTex.needsUpdate = true;
  G.vals = {}; G.vals[q.side] = q.ans; G.vals[-q.side] = q.wrong; G.q = q;
  for (const bd of G.boards) drawGateBoard(bd, G.vals[bd.side], '');
  placeOnTrack(G.grp, q.s, 0, 0);
  G.grp.visible = true; G.hideT = -1; G.k = 0;
}
function gateResult(side, ok) {
  const G = AFX.gates, q = G.q; if (!q) return;
  for (const bd of G.boards) drawGateBoard(bd, G.vals[bd.side], bd.side === q.side ? 'ok' : bd.side === side ? 'bad' : '');
}
function hideGates(delay) { const G = AFX.gates; if (!G) return; if (delay) G.hideT = delay; else { G.grp.visible = false; G.hideT = -1; } }

// ---------- Volkan's marginal field ----------
function initField() {
  const R = CH.volkan.ability.radius * BUSLEN, grp = new THREE.Group();
  const ringG = new THREE.RingGeometry(R - 0.5, R, 80); ringG.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: col(0xff7a1a), transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.position.y = 0.1; ring.renderOrder = 4;
  const discTex = texLabel(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2);
    for (let k = 0; k < 8; k++) {
      g.save(); g.rotate(k * Math.PI / 4);
      g.strokeStyle = k % 2 ? 'rgba(255,122,26,.9)' : 'rgba(166,108,255,.9)'; g.lineWidth = 16; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, 170, -0.3, 0.3); g.stroke();
      g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(170 * Math.cos(0.3) - 8, 170 * Math.sin(0.3) + 30); g.lineTo(170 * Math.cos(0.3) + 26, 170 * Math.sin(0.3) - 8); g.lineTo(170 * Math.cos(0.3) - 34, 170 * Math.sin(0.3) - 16); g.fill();
      g.restore();
    }
    g.font = `italic 900 70px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('⇄', 0, 0);
  });
  const discG = new THREE.CircleGeometry(R, 64); discG.rotateX(-Math.PI / 2);
  const disc = new THREE.Mesh(discG, new THREE.MeshBasicMaterial({ map: discTex, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -9, polygonOffsetUnits: -9 }));
  disc.position.y = 0.09; disc.renderOrder = 3;
  const wallTex = texLabel(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,122,26,.8)'); gr.addColorStop(1, 'rgba(166,108,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 4.5, 72, 1, true), new THREE.MeshBasicMaterial({ map: wallTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
  wall.position.y = 2.25; wall.renderOrder = 4;
  grp.add(ring, disc, wall); grp.visible = false; scene.add(grp);
  AFX.field = { grp, disc, wall, ring, k: 0 };
}

// ---------- rain + a rainbow afterwards ----------
function initRain() {
  const N = 1500, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = rr(-45, 45), y = rr(-8, 32), z = rr(-45, 45); pos.set([x, y, z, x + 0.25, y - 1.5, z], i * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col(0xbfd4e6), transparent: true, opacity: 0, depthWrite: false, fog: false }));
  lines.frustumCulled = false; lines.visible = false; lines.renderOrder = 7; scene.add(lines);
  AFX.rain = { lines, N, on: 0, cx: 0, cz: 0, base: null };
}
function initBow() {
  const seg = 72, bands = 7, R = 300, bw = 9;
  const cols = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2'].map((c) => col(c));
  const pos = [], clr = [], idx = [];
  for (let k = 0; k < bands; k++) {
    const r0 = R - k * bw, r1 = r0 - bw;
    for (let i = 0; i <= seg; i++) {
      const a = Math.PI * i / seg, c = Math.cos(a), s = Math.sin(a);
      pos.push(c * r0, s * r0, 0, c * r1, s * r1, 0);
      clr.push(cols[k].r, cols[k].g, cols[k].b, cols[k].r, cols[k].g, cols[k].b);
      if (i < seg) { const o = (k * (seg + 1) + i) * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(clr, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }));
  m.visible = false; m.renderOrder = -5; scene.add(m);
  AFX.bow = m;
}
function showBow() {
  camera.getWorldDirection(V3); const l = Math.hypot(V3.x, V3.z) || 1;
  const bx = camera.position.x + V3.x / l * 900, bz = camera.position.z + V3.z / l * 900;
  AFX.bow.position.set(bx, -60, bz); AFX.bow.lookAt(camera.position.x, -60, camera.position.z);
  AFX.bow.visible = true;
}
const SKY0 = {};
function rainLook(k) {
  const u = skyMesh.material.uniforms;
  if (!SKY0.top) { SKY0.top = u.uTop.value.clone(); SKY0.hor = u.uHor.value.clone(); SKY0.fog = scene.fog.color.clone(); SKY0.sun = sun.intensity; SKY0.hemi = hemi.intensity; SKY0.grey = col(0x6f7a86); SKY0.greyH = col(0x9aa4ae); }
  u.uTop.value.copy(SKY0.top).lerp(SKY0.grey, k * 0.75); u.uHor.value.copy(SKY0.hor).lerp(SKY0.greyH, k * 0.75);
  scene.fog.color.copy(SKY0.fog).lerp(SKY0.greyH, k * 0.75); scene.background.copy(scene.fog.color);
  sun.intensity = lerp(SKY0.sun, SKY0.sun * 0.4, k); hemi.intensity = lerp(SKY0.hemi, SKY0.hemi * 0.72, k);
}
function updateRain(dt) {
  const R = AFX.rain, want = RAIN.t > 0 ? 1 : 0;
  const prev = R.on;
  R.on = clamp(R.on + (want - R.on) * Math.min(1, dt * 1.6), 0, 1);
  if (want === 0 && R.on < 0.01) R.on = 0;
  if (R.on !== prev || R.on > 0) rainLook(R.on);
  SFX.rainLevel(R.on);
  R.lines.visible = R.on > 0.01;
  if (R.lines.visible) {
    R.lines.material.opacity = 0.5 * R.on;
    const p = R.lines.geometry.attributes.position.array, cx = camera.position.x, cy = camera.position.y, cz = camera.position.z, fall = 34 * dt;
    for (let i = 0; i < R.N; i++) {
      const o = i * 6;
      let x = p[o], y = p[o + 1] - fall, z = p[o + 2];
      if (y < cy - 8) y += 40; else if (y > cy + 32) y -= 40;
      if (x < cx - 45) x += 90; else if (x > cx + 45) x -= 90;
      if (z < cz - 45) z += 90; else if (z > cz + 45) z -= 90;
      p[o] = x; p[o + 1] = y; p[o + 2] = z; p[o + 3] = x + 0.25; p[o + 4] = y - 1.5; p[o + 5] = z;
    }
    R.lines.geometry.attributes.position.needsUpdate = true;
  }
  if (RAIN.bowT > 0) {
    RAIN.bowT -= dt;
    AFX.bow.material.opacity = 0.62 * clamp((7 - RAIN.bowT) / 1.2, 0, 1) * clamp(RAIN.bowT / 1.5, 0, 1);
    if (RAIN.bowT <= 0) AFX.bow.visible = false;
  }
}

// ---------- Ada's leprechaun ----------
function initLep() {
  const grp = new THREE.Group(), body = new THREE.Group(); grp.add(body);
  const M = (c) => new THREE.MeshLambertMaterial({ color: col(c) });
  const green = M(0x1f9a45), dgreen = M(0x136b2f), skin = M(0xf1c9a5), ginger = M(0xd9661e), gold = M(0xffc629), black = M(0x16181c);
  const add = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (parent || body).add(m); return m; };
  add(new THREE.CylinderGeometry(0.5, 0.72, 1.4, 14), green, 0, 1.25, 0);
  add(new THREE.CylinderGeometry(0.67, 0.67, 0.2, 14), black, 0, 1.02, 0);
  add(new THREE.BoxGeometry(0.34, 0.26, 0.1), gold, 0, 1.02, 0.66);
  for (const x of [0.26, -0.26]) { add(new THREE.CylinderGeometry(0.16, 0.16, 0.66, 8), dgreen, x, 0.33, 0); add(new THREE.BoxGeometry(0.3, 0.18, 0.56), black, x, 0.06, 0.1); }
  add(new THREE.SphereGeometry(0.44, 16, 12), skin, 0, 2.28, 0);
  const beard = add(new THREE.ConeGeometry(0.46, 0.95, 14), ginger, 0, 1.86, 0.14); beard.rotation.x = Math.PI;
  for (const x of [0.15, -0.15]) add(new THREE.SphereGeometry(0.06, 8, 6), black, x, 2.38, 0.39);
  add(new THREE.SphereGeometry(0.1, 8, 6), M(0xe8927c), 0, 2.26, 0.43);
  add(new THREE.CylinderGeometry(0.74, 0.74, 0.07, 22), green, 0, 2.62, 0);
  add(new THREE.CylinderGeometry(0.38, 0.45, 0.85, 18), green, 0, 3.08, 0);
  add(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 18), black, 0, 2.76, 0);
  add(new THREE.BoxGeometry(0.24, 0.2, 0.06), gold, 0, 2.76, 0.46);
  const arms = [];
  for (const sx of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.58, 1.8, 0); body.add(sh);
    add(new THREE.CylinderGeometry(0.13, 0.13, 0.85, 8), green, 0, 0.42, 0, sh);
    add(new THREE.SphereGeometry(0.15, 8, 6), skin, 0, 0.88, 0, sh);
    sh.rotation.z = -sx * 0.5; arms.push(sh);
  }
  body.scale.setScalar(1.3); grp.visible = false;
  AFX.lep = { grp, body, arms, t: 0, on: false, bus: null, side: 1, puffed: false };
}
function showLep(o, side) {
  const L = AFX.lep, P = o.m.P;
  if (L.grp.parent) L.grp.parent.remove(L.grp);
  o.m.grp.add(L.grp);
  L.grp.position.set(side * (P.W / 2 - 0.4), P.H + 0.05, 0.3); L.grp.rotation.y = -side * Math.PI / 2;
  L.t = 0; L.on = true; L.bus = o; L.side = side; L.puffed = false; L.grp.visible = true; L.body.position.y = 0;
  for (let i = 0; i < 4; i++) { const p = o.m.grp.position; iconAt(i % 2 ? 'heart' : 'clover', p.x + rr(-1, 1), P.H + 2.5, p.z + rr(-1, 1), rr(-2, 2), rr(2, 4), rr(-2, 2), 1.2, 1, -1); }
}
function hideLep() { const L = AFX.lep; if (!L) return; L.on = false; L.grp.visible = false; if (L.grp.parent) L.grp.parent.remove(L.grp); L.bus = null; }
function updateLep(dt, time) {
  const L = AFX.lep; if (!L || !L.on) return;
  L.t += dt;
  const t = L.t, pop = Math.min(1, t / 0.15);
  L.body.scale.setScalar(1.3 * (0.2 + 0.8 * pop));
  L.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (t < 0.55 ? 2.5 + Math.sin(time * 30) * 0.2 : 0.6); });
  L.body.rotation.x = t < 0.55 ? 0.35 : 0;
  if (t > 0.55) L.body.position.y = (t - 0.55) * 9 - (t - 0.55) * (t - 0.55) * 6;
  if (t > 0.8 && !L.puffed && L.bus) {
    L.puffed = true; const b = L.bus, y = b.def.dim.H + 3;
    coinBurst(b.x, y, b.z, 10);
    for (let i = 0; i < 6; i++) iconAt(i % 2 ? 'heart' : 'clover', b.x + rr(-1, 1), y, b.z + rr(-1, 1), rr(-3, 3), rr(2, 5), rr(-3, 3), 1.2, 1.1, -1);
    for (let i = 0; i < 5; i++) puff(b.x + rr(-1, 1), y, b.z + rr(-1, 1), SMOKE, 1.2, 4, 0.8, 1.5);
    L.grp.visible = false;
  }
}

// ---------- İrem's transformations ----------
function makeTransform(b) {
  const P = b.m.P, root = new THREE.Group(); b.m.grp.add(root);
  const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: col(c) }, o || {}));
  // a wheeled platform the thermos, cup and plant ride on
  const plat = new THREE.Mesh(new THREE.BoxGeometry(P.W - 0.1, 0.36, P.L - 0.5), M(0x2a2d31)); plat.position.y = P.gc + 0.22; plat.castShadow = true;
  const platG = new THREE.Group(); platG.add(plat); root.add(platG);
  const y0 = P.gc + 0.4;
  // giant thermos
  const th = new THREE.Group();
  const cup = M(0x8fc9ae), lid = M(0xe6efe9), dark = M(0x3d5a4c);
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.02, 4.4, 26), cup); tb.position.y = 2.2; th.add(tb);
  const tl = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.24, 0.55, 26), lid); tl.position.y = 4.65; th.add(tl);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 8), M(0xff7ab6)); st.position.set(0.4, 5.4, 0); st.rotation.z = -0.25; th.add(st);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.2, 10, 20, Math.PI), dark); hd.position.set(-1.2, 2.6, 0); hd.rotation.z = Math.PI / 2; th.add(hd);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.14, 1.12, 0.35, 26), dark); band.position.y = 1.2; th.add(band);
  th.position.y = y0; th.traverse((o) => { if (o.isMesh) o.castShadow = true; }); root.add(th);
  // coffee cup
  const cc = new THREE.Group();
  const cw = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 0.98, 3.9, 26), M(0xfafafa)); cw.position.y = 1.95; cc.add(cw);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.13, 1.1, 26), M(0x8a5a36)); sl.position.y = 2.1; cc.add(sl);
  const cl = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.42, 0.32, 26), M(0x1b1b1d)); cl.position.y = 4.0; cc.add(cl);
  const cd = new THREE.Mesh(new THREE.SphereGeometry(1.15, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x1b1b1d)); cd.scale.y = 0.35; cd.position.y = 4.15; cc.add(cd);
  cc.position.y = y0; cc.traverse((o) => { if (o.isMesh) o.castShadow = true; }); root.add(cc);
  // plant
  const pl = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.72, 1.3, 18), M(0xc0643a)); pot.position.y = 0.65; pl.add(pot);
  for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 6), M(i % 2 ? 0x2f9a45 : 0x4fbf5a)); const a = i / 7 * Math.PI * 2; lf.position.set(Math.cos(a) * 0.4, 2.3, Math.sin(a) * 0.4); lf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); pl.add(lf); }
  pl.position.y = y0; pl.scale.setScalar(1.3); pl.traverse((o) => { if (o.isMesh) o.castShadow = true; }); root.add(pl);
  // Dex the cat
  const cat = makeCat(b); root.add(cat.grp);
  const all = [th, cc, pl, cat.grp, platG]; all.forEach((o) => { o.visible = false; });
  const mats = []; root.traverse((o) => { if (o.isMesh) mats.push(o.material); });
  addMats(b, Array.from(new Set(mats)));
  return { root, plat: platG, thermos: th, cup: cc, plant: pl, cat };
}
function makeCat(b) {
  const P = b.m.P, grp = new THREE.Group(), k = (P.L / 6.8) * 0.82;
  const furTex = texLabel(256, 128, (g, w, h) => { g.fillStyle = '#e39a4c'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8682a'; for (let x = 0; x < w; x += 26) g.fillRect(x, 0, 11, h); });
  const fur = new THREE.MeshLambertMaterial({ map: furTex }), pale = new THREE.MeshLambertMaterial({ color: col(0xf6e3c8) }), pink = new THREE.MeshLambertMaterial({ color: col(0xff9aa8) });
  const sph = new THREE.SphereGeometry(1, 18, 14);
  const add = (geo, mat, x, y, z, sx, sy, sz, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); m.castShadow = true; (parent || grp).add(m); return m; };
  add(sph, fur, 0, 2.25, -0.3, 1.1, 1.0, 2.35);
  add(sph, pale, 0, 2.0, 1.4, 0.8, 0.85, 0.9);
  const head = new THREE.Group(); head.position.set(0, 3.55, 2.35); grp.add(head);
  add(sph, fur, 0, 0, 0, 1.05, 0.92, 0.9, head);
  const faceTexC = texLabel(256, 256, (g) => {
    g.fillStyle = '#f6e3c8'; g.beginPath(); g.ellipse(128, 150, 92, 72, 0, 0, 7); g.fill();
    g.fillStyle = '#2fbf5a'; for (const x of [78, 178]) { g.beginPath(); g.ellipse(x, 104, 30, 34, 0, 0, 7); g.fill(); }
    g.fillStyle = '#111'; for (const x of [78, 178]) { g.beginPath(); g.ellipse(x, 106, 9, 26, 0, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; for (const x of [70, 170]) { g.beginPath(); g.arc(x, 92, 6, 0, 7); g.fill(); }
    g.fillStyle = '#ff7a9a'; g.beginPath(); g.moveTo(112, 146); g.lineTo(144, 146); g.lineTo(128, 164); g.closePath(); g.fill();
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(128, 164); g.quadraticCurveTo(116, 188, 100, 178); g.moveTo(128, 164); g.quadraticCurveTo(140, 188, 156, 178); g.stroke();
    g.lineWidth = 3; for (const s of [-1, 1]) for (const dy of [-10, 4, 18]) { g.beginPath(); g.moveTo(128 + s * 40, 160 + dy * 0.3); g.lineTo(128 + s * 118, 150 + dy); g.stroke(); }
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ map: faceTexC, transparent: true })); face.position.set(0, -0.05, 0.86); head.add(face);
  for (const sx of [1, -1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.85, 4), fur); ear.position.set(sx * 0.62, 0.82, -0.05); ear.rotation.z = -sx * 0.3; ear.castShadow = true; head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 4), pink); inner.position.set(sx * 0.6, 0.78, 0.12); inner.rotation.z = -sx * 0.3; head.add(inner);
  }
  const legs = [], legGeo = new THREE.CylinderGeometry(0.26, 0.2, 2.1, 8);
  for (const [lx, lz] of [[0.62, 1.35], [-0.62, 1.35], [0.62, -1.7], [-0.62, -1.7]]) {
    const hip = new THREE.Group(); hip.position.set(lx, 2.05, lz);
    const leg = new THREE.Mesh(legGeo, fur); leg.position.y = -1.05; leg.castShadow = true; hip.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), pale); paw.position.set(0, -2.05, 0.12); paw.scale.set(1, 0.6, 1.3); hip.add(paw);
    grp.add(hip); legs.push(hip);
  }
  const tail = new THREE.Group(); tail.position.set(0, 2.7, -2.5); grp.add(tail);
  const tseg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 2.2, 8), fur); tseg.position.y = 1.0; tseg.castShadow = true; tail.add(tseg);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), pale); tip.position.y = 2.1; tail.add(tip);
  tail.rotation.x = -1.15;
  grp.scale.setScalar(k);
  return { grp, legs, tail, head };
}
function resetAbilFX(b) {
  const fx = b.fx || (b.fx = {});
  fx.plantT = 0; fx.noteT = 0; fx.flameT = 0; fx.coinT = 0; fx.rage = false;
  if (fx.tf) { ['thermos', 'cup', 'plant', 'plat'].forEach((k) => { fx.tf[k].visible = false; }); fx.tf.cat.grp.visible = false; }
  if (fx.rainbow) { fx.rainbow.pts.length = 0; fx.rainbow.mesh.visible = false; }
  if (fx.mouth) fx.mouth.visible = false;
  setRageGlow(b, false);
  b.m.body.visible = true; b.m.wheels.forEach((w) => { w.pivot.visible = true; });
}
function setRageGlow(b, on, k) {
  const mats = b.m.shell.material;
  for (const m of mats) { if (on) m.emissive.setRGB(0.55 * k, 0.05 * k, 0.0); else m.emissive.setRGB(0, 0, 0); }
}
function poofAt(b) { for (let i = 0; i < 8; i++) puff(b.x + rr(-2, 2), 1.2 + rr(0, 2), b.z + rr(-3, 3), SMOKE, 1.4, 5, 0.7, 1.2); }
function ballPoof(B, hit) {
  if (!B) return;
  for (let i = 0; i < (hit ? 3 : 5); i++) puff(B.x + rr(-0.5, 0.5), 0.9, B.z + rr(-0.5, 0.5), SMOKE, 0.6, 2.2, 0.5, 1);
}
function cinnamonFX(b, o) {
  const dx = o.x - b.x, dz = o.z - b.z;
  for (let i = 0; i < 3; i++) iconAt('roll', b.x, b.def.dim.H + 1, b.z, dx * 1.2 + rr(-1, 1), rr(5, 7), dz * 1.2 + rr(-1, 1), 1.1, 1.2, 12);
  popText(o, 'CINNAMON ROLL +' + pct(CH.ela.passive1.bonus), '#ffcf9a');
}
function chompFX(b, o) {
  popText(o, 'CHOMP!', '#ffffff', 1.25);
  for (let i = 0; i < 3; i++) iconAt('teeth', o.x + rr(-1, 1), o.def.dim.H + 1.2, o.z + rr(-1, 1), rr(-1, 1), rr(1, 3), rr(-1, 1), 1.4, 1.6, 2);
  if (b.isPlayer || o.isPlayer) camShake(0.9);
}
function eatFX(b, stop) {
  if (camVol(b) <= 0) return;
  popText(b, 'NOM NOM! +' + stop.kids.length * CH.ali.passive1.perStudent + '%', '#c59bff');
  SFX.nom(camVol(b));
  for (let i = 0; i < 6; i++) { stop.kids[i % stop.kids.length].getWorldPosition(V3); iconAt('candy', V3.x, V3.y + 1, V3.z, 0, 0, 0, 0.9 + i * 0.06, 1, 0, b); }
}
// fade the Doruk gates, move the field, animate everything that belongs to an ability
function updateAbilFX(dt, time) {
  updatePop(dt); updateIcons(dt); updateRain(dt); updateLep(dt, time);
  // snacks bob and spin
  for (const it of ITEMS) { const u = it.mesh.userData; u.body.rotation.y += dt * 1.6; u.body.position.y = Math.sin(time * 3 + it.s) * 0.25; }
  for (const d of DROPS) { d.mesh.scale.setScalar(Math.min(1, d.mesh.scale.x + dt * 5)); d.mesh.material.opacity = Math.min(1, d.life / 1.2); }
  // gates
  const G = AFX.gates;
  if (G.grp.visible) {
    G.k = Math.min(1, G.k + dt * 3); G.grp.scale.set(1, 0.3 + 0.7 * G.k, 1);
    if (G.hideT >= 0) { G.hideT -= dt; if (G.hideT <= 0) { G.grp.visible = false; G.hideT = -1; } }
  }
  // gyms: only Ataberk uses them, and only until he has done all his visits
  const at = RACE.buses.find((x) => drvId(x) === 'ataberk');
  const gymOn = !!at && (RACE.state === 'intro' || RACE.state === 'countdown' || RACE.state === 'race') && at.pv.gym < CH.ataberk.passive1.maxVisits && !at.finished;
  if (W.gyms[0] && W.gyms[0].grp.visible !== gymOn) showGyms(gymOn);
  if (gymOn) for (const g of W.gyms) { g.db.rotation.y += dt * 1.2; g.db.position.y = 4.2 + Math.sin(time * 2 + g.i) * 0.3; }
  // Volkan's field follows him
  const F = AFX.field, vk = RACE.buses.find((x) => x.ab.key === 'field');
  F.k = lerp(F.k, vk ? 1 : 0, Math.min(1, dt * 8));
  F.grp.visible = F.k > 0.02;
  if (vk) F.grp.position.set(vk.x, 0, vk.z);
  if (F.grp.visible) { F.disc.rotation.y -= dt * 1.4; F.wall.rotation.y += dt * 0.8; F.grp.scale.set(F.k, 1, F.k); F.ring.material.opacity = 0.6 + Math.sin(time * 12) * 0.3; }
  // football
  const eg = RACE.buses.find((x) => x.ab.key === 'ball');
  AFX.ball.visible = !!eg;
  // the ball flies in a high arc so the chase camera sees it over the roof
  if (eg) { const B = eg.ab.ball, k = clamp(B.age / (B.life + B.age), 0, 1); AFX.ball.position.set(B.x, 1.2 + Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.62) * 3.4, B.z); AFX.ball.rotation.x += dt * 22; AFX.ball.rotation.y += dt * 7; }
  for (const b of RACE.buses) busFX(b, dt, time);
}
function busFX(b, dt, time) {
  const fx = b.fx || (b.fx = {}), key = b.ab.key;
  // İrem's transformations replace the body of the bus
  const kind = key === 'cat' || key === 'thermos' || key === 'coffee' ? key : fx.plantT > 0 ? 'plant' : '';
  if (fx.plantT > 0) fx.plantT -= dt;
  if (kind && !fx.tf) fx.tf = makeTransform(b);
  if (fx.tf) {
    const T = fx.tf;
    T.thermos.visible = kind === 'thermos'; T.cup.visible = kind === 'coffee'; T.plant.visible = kind === 'plant'; T.cat.grp.visible = kind === 'cat';
    T.plat.visible = !!kind && kind !== 'cat';
    b.m.body.visible = !kind; b.m.wheels.forEach((w) => { w.pivot.visible = kind !== 'cat'; });
    if (kind === 'cat') {
      const ph = time * 16;
      T.cat.legs.forEach((l, i) => { l.rotation.x = Math.sin(ph + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.5) * 0.7; });
      T.cat.grp.position.y = Math.abs(Math.sin(ph)) * 0.3; T.cat.tail.rotation.z = Math.sin(time * 9) * 0.5; T.cat.head.rotation.x = Math.sin(ph) * 0.06;
    }
    if (kind === 'thermos') T.thermos.rotation.z = Math.sin(time * 14) * 0.05;
    if (kind === 'coffee') { T.cup.rotation.z = Math.sin(time * 10) * 0.04; fx.steamT = (fx.steamT || 0) - dt; if (fx.steamT <= 0) { fx.steamT = 0.12; puff(b.x + rr(-0.5, 0.5), b.def.dim.H + 2.4, b.z + rr(-0.5, 0.5), SMOKE, 0.5, 2, 0.8, 2); } }
    if (kind === 'plant') T.plant.scale.setScalar(1.3 * Math.min(1, (1.2 - fx.plantT) * 6));
  }
  // Doruk's rage: red glow, flames, physics terms
  const rage = key === 'rage';
  if (rage) { setRageGlow(b, true, 0.65 + Math.sin(time * 14) * 0.35); fx.rage = true; fx.flameT = (fx.flameT || 0) - dt; if (fx.flameT <= 0) { fx.flameT = 0.05; iconAt('fire', b.x + rr(-1.2, 1.2), 1 + rr(0, b.def.dim.H), b.z + rr(-2, 2), rr(-1, 1), rr(2, 4), rr(-1, 1), 0.45, rr(0.7, 1.25), -2); } }
  else if (fx.rage) { setRageGlow(b, false); fx.rage = false; }
  // Ela sings
  if (key === 'song') { fx.noteT = (fx.noteT || 0) - dt; if (fx.noteT <= 0) { fx.noteT = 0.08; iconAt('note', b.x + rr(-2, 2), b.def.dim.H + rr(0.4, 1.4), b.z + rr(-3, 3), rr(-2.5, 2.5), rr(1.5, 3.5), rr(-2.5, 2.5), 1.4, rr(0.9, 1.5), -0.5); } }
  // Ataberk's rainbow run after the rain
  const bow = b.effects && b.effects.some((e) => e.key === 'rainbow');
  if (bow && !fx.rainbow) fx.rainbow = makeRainbow();
  if (fx.rainbow) updateRainbow(fx.rainbow, b, bow);
  if (bow) { fx.coinT = (fx.coinT || 0) - dt; if (fx.coinT <= 0) { fx.coinT = 0.06; emitCoin(b); if (b.isPlayer && Math.random() < 0.3) SFX.coin(); } }
  // Ali's hungry mouth
  const hungry = key === 'seek' || key === 'bite';
  if (hungry && !fx.mouth) {
    fx.mouth = new THREE.Sprite(new THREE.SpriteMaterial({ map: AFX.mouthTex, transparent: true, depthWrite: false }));
    fx.mouth.position.set(0, b.m.P.H + 1.3, b.m.P.L / 2 - 0.6); fx.mouth.renderOrder = 6; b.m.grp.add(fx.mouth);
  }
  if (fx.mouth) { fx.mouth.visible = hungry; if (hungry) { const c = key === 'bite' ? Math.abs(Math.sin(time * 18)) : 0.6 + Math.sin(time * 8) * 0.25; fx.mouth.scale.set(3.2, 2 * (0.35 + 0.65 * c), 1); } }
}
// stars over stunned buses, and name tags over rivals
function updateStunStars(time) {
  const racing = RACE.state === 'intro' || RACE.state === 'countdown' || RACE.state === 'race' || RACE.state === 'finish' || RACE.state === 'results';
  let starI = 0, termI = 0;
  for (const b of RACE.buses) {
    if (b.stunT > 0 || b.holdT > 0) {
      for (let j = 0; j < 3 && starI < SFXQ.stars.length; j++, starI++) {
        const s = SFXQ.stars[starI], a = time * 5 + j * 2.094;
        s.visible = true; s.position.set(b.x + Math.cos(a) * 1.4, b.def.dim.H + 1.1 + (b.flyY || 0), b.z + Math.sin(a) * 1.4);
      }
    }
    if (b.ab.key === 'rage') {
      for (let j = 0; j < 6 && termI < SFXQ.terms.length; j++, termI++) {
        const sp = SFXQ.terms[termI], a = time * 2.2 + j * Math.PI / 3, r = 6 + Math.sin(time * 4 + j) * 1.4;
        sp.visible = true; sp.position.set(b.x + Math.cos(a) * r, 2.6 + Math.sin(time * 3 + j) * 1.2, b.z + Math.sin(a) * r);
      }
    }
    const cd = Math.hypot(camera.position.x - b.x, camera.position.z - b.z), ta = clamp((cd - 9) / 10, 0, 1);
    b.m.tag.visible = !!b.driver && !(b.isPlayer && racing) && ta > 0.02; b.m.tag.material.opacity = ta;
  }
  for (let j = starI; j < SFXQ.stars.length; j++) SFXQ.stars[j].visible = false;
  for (let j = termI; j < SFXQ.terms.length; j++) SFXQ.terms[j].visible = false;
}
function updateCoinsRings(dt) {
  for (const m of SFXQ.coins) {
    if (!m.visible) continue;
    const u = m.userData; u.life -= dt; if (u.life <= 0) { m.visible = false; continue; }
    u.v.y -= 18 * dt; m.position.addScaledVector(u.v, dt);
    if (m.position.y < 0.3) { m.position.y = 0.3; u.v.y *= -0.45; u.v.x *= 0.7; u.v.z *= 0.7; }
    m.rotation.y += u.spin * dt;
  }
  for (const r of SFXQ.rings) {
    if (!r.visible) continue;
    const u = r.userData; u.t += dt;
    if (u.t < 0) { r.material.opacity = 0; continue; }
    const k = u.t / 0.75; if (k >= 1) { r.visible = false; continue; }
    r.scale.setScalar(1 + k * u.size); r.material.opacity = 0.9 * (1 - k);
  }
}

// =====================================================================
//  SCREEN EFFECTS for the player: stun, gluten alarm, reversed controls,
//  Ali's reaction check, Doruk's question card, Sarp's brainrot windows
// =====================================================================
const PFX = { filter: '', revT: 0, brainT: 0 };
function superBanner(text, d) {
  const el = H.sb;
  el.style.setProperty('--dc', d.color);
  el.innerHTML = '<b></b><span></span>'; el.children[0].textContent = text + '!'; el.children[1].textContent = d.nick;
  el.className = 'superbanner'; void el.offsetWidth; el.className = 'superbanner show';
}
function glutenAlarm() { RACE.alarmT = 1.5; H.alarm.hidden = false; SFX.siren(1.5); camShake(0.5); }
function reversedWarning() { PFX.revT = 1.6; H.revWarn.classList.remove('flash'); void H.revWarn.offsetWidth; H.revWarn.classList.add('flash'); SFX.buzz(0.6); }
function openCheckUI(c) {
  H.chkZone.style.left = (c.z0 * 100).toFixed(1) + '%'; H.chkZone.style.width = ((c.z1 - c.z0) * 100).toFixed(1) + '%';
  H.chkMark.style.left = '0%'; H.checkCard.className = ''; H.checkCard.hidden = false;
  H.chkMsg.textContent = TOUCH ? 'Tap ABILITY when the marker is in the green' : 'Press SHIFT when the marker is in the green';
}
function checkResultUI(ok) { H.checkCard.className = ok ? 'ok' : 'bad'; H.chkMsg.textContent = ok ? 'Dodged it!' : 'Sugar crash!'; }
function closeCheckUI() { if (H.checkCard) H.checkCard.hidden = true; }
function quizUI(q) {
  if (!H.quizCard) return;
  if (!q) { H.quizCard.hidden = true; return; }
  H.quizCard.hidden = false; H.qzText.textContent = q.text;
  const left = q.side < 0 ? q.ans : q.wrong, right = q.side > 0 ? q.ans : q.wrong;
  H.qzL.textContent = '◀ ' + left; H.qzR.textContent = right + ' ▶';
  H.quizCard.classList.toggle('gates', q.phase === 'gates');
}
const BRAINROT = [
  ['🗿', '+1000 AURA'], ['💀', 'BRO IS COOKED'], ['🦈👟', 'shark in sneakers'], ['🐊✈️', 'crocodile jet'], ['🥁🪵', 'tung tung tung'],
  ['🚌🗿', 'SIGMA BUS'], ['🤫🧏', 'mewing mode'], ['📉', '−500 AURA'], ['🍝🎤', 'spaghetti opera'], ['🐸☕', 'frog with a latte'],
  ['🧠🔥', 'brain.exe stopped'], ['🐟🎩', 'fish in a top hat'], ['🍌📞', 'banana phone'], ['🦆⚡', 'duck of doom'],
];
// the windows go in the empty strip at the left or right edge, between the HUD blocks, never over the road
function brainrotSpot(winH) {
  const box = (el) => (el && el.offsetParent !== null ? el.getBoundingClientRect() : null);
  const tl = box(document.querySelector('.hud-tl')), mm = box(H.minimap), tw = box(H.tower), dash = box(document.querySelector('.dash'));
  const gaps = [
    { right: false, a: (tl ? tl.bottom : 16) + 8, b: (mm ? mm.top : innerHeight - 16) - 8 },
    { right: true, a: (tw ? tw.bottom : 16) + 8, b: (dash ? dash.top : innerHeight - 16) - 8 },
  ];
  if (innerWidth < 640) gaps.forEach((g) => { g.b = Math.min(g.b, g.a + winH + 90); });   // phones: just under the HUD, far from the bus
  const fit = gaps.filter((g) => g.b - g.a >= winH);
  const g = fit.length ? pick(fit) : gaps.sort((x, y) => (y.b - y.a) - (x.b - x.a))[0];
  return { right: g.right, top: Math.max(g.a, Math.min(g.b - winH, rr(g.a, g.b - winH))) };
}
function showBrainrot() {
  const [emo, cap] = pick(BRAINROT), el = document.createElement('div');
  const narrow = innerWidth < 640, spot = brainrotSpot(narrow ? 92 : 112);
  el.className = 'brwin';
  el.style.cssText = (spot.right ? 'right:' : 'left:') + (narrow ? 8 : rr(16, 40).toFixed(0)) + 'px;top:' + spot.top.toFixed(0) + 'px;--tilt:' + rr(-6, 6).toFixed(1) + 'deg';
  el.innerHTML = '<div class="brbar"><span></span><i>×</i></div><b></b><small></small>';
  el.querySelector('span').textContent = pick(['brainrot.exe', 'aura.exe', 'sigma.exe', 'ohio.exe', 'rizz.exe']);
  el.querySelector('b').textContent = emo; el.querySelector('small').textContent = cap;
  H.brainrot.appendChild(el); SFX.glitch(); SFX.glitch();
  setTimeout(() => el.remove(), CH.sarp.passive1.show * 1000);
}
function brainrotEvery(b) { const p = CH.sarp.passive1; return Math.max(p.minEvery, p.every - p.minusPerUse * b.pv.sarpUses); }
function updatePlayerFX(dt) {
  const p = RACE.player, gl = $('gl'), live = RACE.state === 'race' || RACE.state === 'finish';
  const stun = !!p && live && (p.stunT > 0 || p.holdT > 0);
  const f = stun && !REDUCED ? `blur(${(1.4 + Math.sin(clock * 18)).toFixed(1)}px)` : '';
  if (f !== PFX.filter) { gl.style.filter = f; PFX.filter = f; }
  if (H.stun.hidden === stun) H.stun.hidden = !stun;
  if (stun) H.stun.textContent = p.holdT > 0 ? (drvId(p) === 'ali' ? 'CHOMP!' : 'BITTEN!') : 'STUNNED!';
  if (RACE.alarmT > 0) { RACE.alarmT -= dt; if (RACE.alarmT <= 0) H.alarm.hidden = true; }
  const rev = !!p && live && p.fieldInv;
  if (H.revWarn.hidden === rev) H.revWarn.hidden = !rev;
  if (RACE.check) { const c = RACE.check; H.chkMark.style.left = (clamp(c.t / c.max, 0, 1) * 100).toFixed(1) + '%'; }
  const q = p && p.pv && p.pv.quiz;
  if (q && !H.quizCard.hidden) {
    H.quizCard.classList.toggle('gates', q.phase === 'gates');
    H.qzHint.textContent = q.phase === 'ask' ? 'Gates in ' + Math.max(1, Math.ceil(CH.doruk.passive1.gateDelay - q.t)) + '…' : 'Drive through the gate with the right answer';
  }
  if (p && drvId(p) === 'sarp' && RACE.state === 'race' && !p.finished && !RACE.paused) {
    PFX.brainT += dt;
    if (PFX.brainT >= brainrotEvery(p)) { PFX.brainT = 0; showBrainrot(); }
  }
  if (p && p.ab.key === 'rage' && live) { PFX.termT = (PFX.termT || 0) - dt; if (PFX.termT <= 0) { PFX.termT = 0.22; spawnTerm(); } }
  H.hud.classList.toggle('wet', RAIN.t > 0 && !!p && !p.aura);
}
function clearPlayerFX() {
  const gl = $('gl'); gl.style.transform = ''; gl.style.filter = ''; PFX.filter = ''; PFX.brainT = 0;
  H.stun.hidden = true; H.alarm.hidden = true; RACE.alarmT = 0; H.terms.textContent = ''; H.revWarn.hidden = true; H.brainrot.textContent = '';
  H.hud.classList.remove('wet'); closeCheckUI(); quizUI(null);
}
function spawnTerm() {
  const el = document.createElement('span');
  el.textContent = pick(PHYSICS_TERMS);
  el.style.cssText = `left:${pick([rr(4, 26), rr(74, 96)]).toFixed(1)}%;top:${rr(12, 80).toFixed(1)}%;font-size:${rr(18, 38).toFixed(0)}px;color:${pick(['#ff6a2a', '#ffe14a', '#ff3b30', '#ffffff'])};--dx:${rr(-80, 80).toFixed(0)}px;--dy:${rr(-80, 80).toFixed(0)}px;--r0:${rr(-30, 30).toFixed(0)}deg;--r1:${rr(-60, 60).toFixed(0)}deg`;
  H.terms.appendChild(el);
  setTimeout(() => el.remove(), 1350);
}
function tryPlayerAbility() {
  const p = RACE.player;
  if (!p || RACE.state !== 'race' || RACE.paused || p.finished) return;
  if (RACE.check && !RACE.check.done) { pressCheck(); return; }
  if (useAbility(p)) return;
  toast(abilityBlock(p)); SFX.denied();
}

// =====================================================================
//  ONLINE RACES: a room with a 4-letter code.
//  Devices connect straight to each other (PeerJS / WebRTC). Where a
//  network blocks that (many school Wi-Fis do), the game falls back to a
//  free public relay over secure WebSockets on port 443, the same port
//  as normal websites. Everybody drives their own bus on their own device
//  and shares where it is; the host also drives the bots and passes every
//  message on. Abilities that hit another bus are sent to the device that
//  drives that bus, which applies them (Sarp's aura and the stun guard are
//  checked where they belong).
// =====================================================================
const NET_VERSION = 'sbr-online-2';
const NET = { on: false, host: false, racing: false, peer: null, conn: null, links: new Map(), code: '', my: '', players: [], laps: 6, diff: 1,
  sendT: 0, relayT: 0, beatT: 0, lastHost: 0, dropHits: new Map(), joining: false, attempt: 0, route: '', direct: false };
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const roomPeerId = (code) => 'sbr-anka-gp-' + code.toLowerCase();
const busIdx = (b) => (b ? b.def.num - 1 : -1);
const fin = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
const r2 = (v) => Math.round(v * 100) / 100;
const randId = (n) => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

// ---------- the backup relay: MQTT over secure WebSockets (free public brokers, no accounts) ----------
// the first one uses port 443; the host listens on all of them, a player uses the first that works
const RELAY_BROKERS = [
  { host: 'public.cloud.shiftr.io', port: 443, path: '/', user: 'public', pass: 'public' },
  { host: 'broker.hivemq.com', port: 8884, path: '/mqtt' },
];
const RELAY = { lib: null, conns: [] };
const relayBase = (code) => 'sbr-anka-gp/v2/' + code.toLowerCase() + '/';
function loadRelayLib() {
  if (window.Paho) return Promise.resolve();
  if (!RELAY.lib) {
    RELAY.lib = new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js';
      sc.onload = () => res(); sc.onerror = () => { RELAY.lib = null; rej(new Error('relay library')); };
      document.head.appendChild(sc);
    });
  }
  return RELAY.lib;
}
// connect to one broker; resolves with the connection, or null if it can't be reached in 6 s
function relayConnect(broker, will, onMsg, onLost) {
  return new Promise((res) => {
    let c, settled = false;
    try { c = new Paho.Client(broker.host, broker.port, broker.path, 'sbr' + randId(14)); } catch (e) { res(null); return; }
    const conn = { broker, client: c, ok: false };
    const give = (v) => { if (settled) return; settled = true; clearTimeout(timer); res(v); };
    const timer = setTimeout(() => { give(null); try { c.disconnect(); } catch (e) { /* not connected */ } }, 6000);
    c.onMessageArrived = (msg) => { let m; try { m = JSON.parse(msg.payloadString); } catch (e) { return; } if (m && typeof m === 'object') onMsg(m, conn); };
    c.onConnectionLost = () => { const was = conn.ok; conn.ok = false; if (was) onLost(conn); };
    const opts = { useSSL: true, timeout: 5, keepAliveInterval: 15, cleanSession: true,
      onSuccess: () => { if (settled) { try { c.disconnect(); } catch (e) { /* late */ } return; } conn.ok = true; give(conn); },
      onFailure: () => give(null) };
    if (broker.user) { opts.userName = broker.user; opts.password = broker.pass; }
    if (will) { const w = new Paho.Message(JSON.stringify(will.msg)); w.destinationName = will.topic; w.qos = 0; opts.willMessage = w; }
    try { c.connect(opts); } catch (e) { give(null); }
  });
}
function relayPub(conn, topic, m) {
  if (!conn || !conn.ok) return;
  try { const msg = new Paho.Message(JSON.stringify(m)); msg.destinationName = topic; msg.qos = 0; conn.client.send(msg); } catch (e) { /* dropped */ }
}
function relaySub(conn, topic) { try { conn.client.subscribe(topic, { qos: 0 }); } catch (e) { /* not connected */ } }
function relayCloseAll() {
  for (const c of RELAY.conns) { c.ok = false; try { c.client.disconnect(); } catch (e) { /* already closed */ } }
  RELAY.conns = [];
}
const hasRelayLinks = () => { for (const c of NET.links.values()) if (c.relay && c.open) return true; return false; };

// ---------- connecting ----------
function netReady() { return typeof window.Peer === 'function'; }
function netCreate() {
  netClose();
  const code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  const attempt = ++NET.attempt;
  NET.host = true; NET.code = code; NET.my = roomPeerId(code);
  onlineStatus('Creating a room…');
  const openRoom = () => {
    if (NET.attempt !== attempt || NET.on) return;
    NET.on = true;
    NET.players = [{ pid: NET.my, drv: RACE.drvIdx, bus: RACE.busIdx, host: true }];
    onlineStatus(''); renderLobby();
  };
  // 1) direct connections
  if (netReady()) {
    const peer = new Peer(NET.my, { debug: 0 });
    NET.peer = peer;
    peer.on('open', () => { if (NET.peer !== peer) return; NET.direct = true; openRoom(); renderLobby(); });
    peer.on('connection', hostAccept);
    peer.on('disconnected', () => { if (NET.peer === peer && !peer.destroyed) try { peer.reconnect(); } catch (e) { /* links that are already open keep working */ } });
    peer.on('error', (err) => {
      if (NET.peer !== peer) return;
      if (err.type === 'unavailable-id' && !NET.on) { netCreate(); return; }   // that code is in use: pick another
      if (err.type === 'peer-unavailable') return;
      NET.direct = false; renderLobby();
    });
  }
  // 2) the backup relay, so friends on strict networks can join too
  hostRelayStart(code, attempt).then((ok) => {
    if (NET.attempt !== attempt) return;
    if (ok) openRoom();
    else if (!NET.on) setTimeout(() => { if (NET.attempt === attempt && !NET.on) { onlineStatus('Could not open a room from this network. Check the internet connection, or try mobile data or a phone hotspot.', true); netClose(); renderLobby(); } }, 4000);
    renderLobby();
  });
}
async function hostRelayStart(code, attempt) {
  try { await loadRelayLib(); } catch (e) { return false; }
  if (NET.attempt !== attempt) return false;
  const base = relayBase(code), will = { topic: base + 'all', msg: { k: 'hostgone' } };
  const conns = (await Promise.all(RELAY_BROKERS.map((b) => relayConnect(b, will, onHostRelayMsg, onHostRelayLost)))).filter(Boolean);
  if (NET.attempt !== attempt) { conns.forEach((c) => { try { c.client.disconnect(); } catch (e) { /* closing */ } }); return false; }
  conns.forEach((c) => relaySub(c, base + 'host'));
  RELAY.conns = conns;
  return conns.length > 0;
}
function onHostRelayMsg(m, conn) {
  if (!NET.host || typeof m.from !== 'string' || m.from.length > 64) return;
  const pid = m.from;
  let link = NET.links.get(pid);
  if (!link || !link.relay) {
    if (m.k !== 'hello' || link) return;
    link = { relay: true, pid, conn, open: true, seen: 0, send: (x) => relayPub(conn, relayBase(NET.code) + 'c/' + pid, x), close: () => { link.open = false; } };
  }
  link.seen = performance.now();
  if (m.k === 'bye') { if (NET.links.get(pid) === link) hostDrop(pid); return; }
  if (m.k === 'ping') return;
  hostData(pid, link, m);
}
function onHostRelayLost() { renderLobby(); }
function netJoin(raw) {
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 4) { onlineStatus('Type the 4-letter room code first.', true); return; }
  netClose();
  const attempt = ++NET.attempt;
  NET.host = false; NET.code = code; NET.joining = true;
  onlineStatus('Looking for room ' + code + '…');
  let relayTried = false;
  const tryRelay = () => { if (relayTried || NET.attempt !== attempt || NET.on) return; relayTried = true; clientRelayJoin(code, attempt); };
  if (!netReady()) { tryRelay(); return; }
  const peer = new Peer({ debug: 0 });
  NET.peer = peer;
  const slow = setTimeout(tryRelay, 9000);   // no direct connection after 9 s: the network probably blocks it
  peer.on('open', (id) => {
    if (NET.peer !== peer) return;
    NET.my = id;
    const conn = peer.connect(roomPeerId(code), { reliable: true, serialization: 'json' });
    conn.on('open', () => {
      if (relayTried || NET.attempt !== attempt) { try { conn.close(); } catch (e) { /* not needed any more */ } return; }
      clearTimeout(slow);
      NET.conn = conn; NET.on = true; NET.joining = false; NET.route = 'direct';
      conn.send({ k: 'hello', v: NET_VERSION, drv: RACE.drvIdx, bus: RACE.busIdx });
      onlineStatus('Connected. Joining the lobby…');
    });
    conn.on('data', (m) => { if (NET.conn === conn) clientData(m); });
    conn.on('close', () => { if (NET.conn === conn) netLost('The host closed the room.'); });
    conn.on('error', () => { if (NET.conn === conn) netLost('The connection to the host broke.'); });
  });
  peer.on('error', (err) => {
    if (NET.peer !== peer || NET.on) return;
    clearTimeout(slow);
    tryRelay();   // the room may be reachable through the relay (or the host may be on a strict network)
  });
}
async function clientRelayJoin(code, attempt) {
  onlineStatus('No direct connection. Trying the backup connection…');
  if (NET.peer) { try { NET.peer.destroy(); } catch (e) { /* gone */ } NET.peer = null; }
  try { await loadRelayLib(); } catch (e) { if (NET.attempt === attempt) onlineStatus('Could not load the backup connection. Check the internet connection.', true); return; }
  if (NET.attempt !== attempt) return;
  if (!NET.my) NET.my = 'r-' + randId(12);
  const my = NET.my, base = relayBase(code);
  let conn = null;
  for (const b of RELAY_BROKERS) {
    conn = await relayConnect(b, { topic: base + 'host', msg: { k: 'bye', from: my } }, onClientRelayMsg, () => { if (NET.route === 'relay' && NET.on) netLost('The connection to the room broke.'); });
    if (NET.attempt !== attempt) { if (conn) try { conn.client.disconnect(); } catch (e) { /* closing */ } return; }
    if (conn) break;
  }
  if (!conn) { onlineStatus('This network blocks online play. Use mobile data or a phone hotspot.', true); netClose(); renderLobby(); return; }
  RELAY.conns = [conn];
  relaySub(conn, base + 'all'); relaySub(conn, base + 'c/' + my);
  NET.route = 'relay'; NET.lastHost = performance.now();
  NET.conn = { relay: true, open: true, send: (m) => relayPub(conn, base + 'host', Object.assign({ from: my }, m)), close() { this.open = false; } };
  NET.conn.send({ k: 'hello', v: NET_VERSION, drv: RACE.drvIdx, bus: RACE.busIdx });
  setTimeout(() => { if (NET.attempt === attempt && !NET.on) { onlineStatus('There is no room with the code ' + code + '. Check the code with your friend.', true); netClose(); renderLobby(); } }, 8000);
}
function onClientRelayMsg(m) {
  if (NET.host || m.xf === NET.my) return;   // xf: "not for this player" (their own message coming back)
  NET.lastHost = performance.now();
  if (m.k === 'hostgone') { if (NET.on) netLost('The host closed the room.'); return; }
  if (!NET.on) {
    if (m.k === 'deny') { clientData(m); return; }
    if (m.k !== 'lobby' || !Array.isArray(m.players) || !m.players.some((p) => p.pid === NET.my)) return;
    NET.on = true; NET.joining = false;
    onlineStatus('Connected through the backup connection.');
  }
  clientData(m);
}
function netErrorText(err) {
  const t = err && err.type;
  if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return 'Could not reach the connection server. Check the internet connection and try again.';
  if (t === 'browser-incompatible') return 'This browser cannot play online. Try Chrome, Edge, Firefox or Safari.';
  return 'Connection problem (' + (t || 'unknown') + '). Try again.';
}
// close everything and forget the room (the game itself keeps running)
function netClose() {
  NET.attempt++;
  const peer = NET.peer, conn = NET.conn;
  NET.peer = null; NET.conn = null;
  if (conn && conn.relay) { try { conn.send({ k: 'bye' }); } catch (e) { /* offline */ } }
  if (NET.host && RELAY.conns.length) for (const rc of RELAY.conns) relayPub(rc, relayBase(NET.code) + 'all', { k: 'hostgone' });
  for (const c of NET.links.values()) try { c.close(); } catch (e) { /* already closed */ }
  NET.links.clear();
  if (conn && !conn.relay) try { conn.close(); } catch (e) { /* already closed */ }
  if (peer) try { peer.destroy(); } catch (e) { /* already gone */ }
  relayCloseAll();
  NET.on = false; NET.host = false; NET.racing = false; NET.players = []; NET.code = ''; NET.my = ''; NET.joining = false; NET.route = ''; NET.direct = false; NET.dropHits.clear();
  RACE.buses.forEach((b) => { b.remote = false; b.owner = null; b.human = false; b.net = null; });
}
function netLost(msg) {
  const wasRacing = NET.racing;
  netClose();
  if (wasRacing || RACE.state === 'online' || RACE.state === 'results' || RACE.state === 'race' || RACE.state === 'finish') {
    RACE.paused = false;
    fadeTo(() => { leaveRace(); setLineup(); RACE.player = null; setState('online'); showScreen('scrOnline'); renderLobby(); onlineStatus(msg, true); });
  } else onlineStatus(msg, true);
}
function netLeave() { netClose(); RACE.paused = false; goTitle(); }

// ---------- the host ----------
function hostAccept(conn) {
  conn.on('open', () => { if (!NET.links.has(conn.peer)) NET.links.set(conn.peer, conn); });
  conn.on('data', (m) => { const cur = NET.links.get(conn.peer); if (cur && cur !== conn) return; hostData(conn.peer, conn, m); });
  const drop = () => { if (NET.links.get(conn.peer) === conn) hostDrop(conn.peer); };
  conn.on('close', drop);
  conn.on('error', drop);
}
const lobbyPlayer = (pid) => NET.players.find((p) => p.pid === pid);
const takenBy = (field, v, pid) => NET.players.some((p) => p.pid !== pid && p[field] === v);
function firstFree(field, want, pid) {
  const n = field === 'drv' ? DRIVERS.length : BUSES.length;
  if (want >= 0 && want < n && !takenBy(field, want, pid)) return want;
  for (let i = 0; i < n; i++) if (!takenBy(field, i, pid)) return i;
  return 0;
}
function hostData(pid, link, m) {
  if (!m || typeof m !== 'object') return;
  if (m.k === 'hello') {
    const deny = (why) => { link.send({ k: 'deny', why }); setTimeout(() => { try { link.close(); } catch (e) { /* gone */ } }, 400); };
    if (m.v !== NET_VERSION) return deny('Your game is a different version. Reload the page (Ctrl+F5) and join again.');
    if (NET.racing) return deny('This room is racing right now. Join again when the race is over.');
    if (!lobbyPlayer(pid) && NET.players.length >= BUSES.length) return deny('The room is full: 6 players already.');
    if (!lobbyPlayer(pid)) NET.players.push({ pid, drv: firstFree('drv', fin(m.drv, 0), pid), bus: firstFree('bus', fin(m.bus, 0), pid), host: false });
    NET.links.set(pid, link);
    broadcastLobby(); SFX.tone(880, 0.1, 'triangle', 0.08);
    return;
  }
  if (NET.links.get(pid) !== link) return;
  if (m.k === 'pick') { const p = lobbyPlayer(pid); if (!p || NET.racing) return; applyPick(p, m); return; }
  if (m.k === 'st') { applyState(m.s); for (const [id, c] of NET.links) if (id !== pid && c.open && !c.relay) c.send(m); return; }   // relay players get it in the next state bundle
  if (m.k === 'ev') { routeEvent(m, pid); return; }
}
function applyPick(p, m) {
  const d = fin(m.drv, -1), b = fin(m.bus, -1);
  if (d >= 0 && d < DRIVERS.length && !takenBy('drv', d, p.pid)) p.drv = d;
  if (b >= 0 && b < BUSES.length && !takenBy('bus', b, p.pid)) p.bus = b;
  broadcastLobby();
}
function hostDrop(pid) {
  if (!NET.links.has(pid) && !lobbyPlayer(pid)) return;
  NET.links.delete(pid);
  NET.players = NET.players.filter((p) => p.pid !== pid);
  // a player who drops out of a race hands their bus to a bot
  for (const b of RACE.buses) if (b.owner === pid) { b.owner = NET.my; b.remote = false; b.human = false; b.isPlayer = false; botTakeOver(b); toast(b.driver.nick + ' left: a bot takes over'); }
  broadcastLobby();
}
function botTakeOver(b) {
  const D = DIFF[RACE.diff];
  TRACK.project(b.x, b.z, b.hint, b.q); b.hint = b.q.idx; b.prevS = b.q.s;
  b.ai.base = 1; b.vmul = D.vmul; b.ai.skill = D.skill; b.ai.greed = 0.8; b.ai.stopDec = {}; b.ai.pitAt = 40; b.ai.pit = false; b.ai.lane = b.q.d; b.ai.abDelay = 2;
  b.net = null;
}
function lobbyMsg() { return { k: 'lobby', players: NET.players, laps: NET.laps, diff: NET.diff, racing: NET.racing }; }
// everybody except `except`: direct links one by one, relay players with one message on the room channel
function sendAll(m, except) {
  let relay = false;
  for (const [id, c] of NET.links) { if (id === except || !c.open) continue; if (c.relay) relay = true; else c.send(m); }
  if (relay) { const mm = except ? Object.assign({ xf: except }, m) : m, t = relayBase(NET.code) + 'all'; for (const rc of RELAY.conns) relayPub(rc, t, mm); }
}
function broadcastLobby() { sendAll(lobbyMsg()); renderLobby(); }
function netSend(m) {
  if (NET.host) sendAll(m);
  else if (NET.conn && NET.conn.open) NET.conn.send(m);
}
// the grid: players keep the buses they picked, bots take the rest with the drivers nobody picked
function hostStart() {
  if (!NET.host || NET.racing) return;
  const free = shuffle(DRIVERS.map((d, i) => i).filter((i) => !NET.players.some((p) => p.drv === i)));
  const entries = BUSES.map((b, bi) => {
    const h = NET.players.find((p) => p.bus === bi);
    return { bus: bi, drv: h ? h.drv : free.pop(), owner: h ? h.pid : NET.my, human: !!h };
  });
  const m = { k: 'start', laps: NET.laps, diff: NET.diff, entries, order: shuffle(entries.map((e, i) => i)), goAt: +(4.4 + rr(0.5, 1.3)).toFixed(2) };
  NET.racing = true;
  netSend(m); netStartRace(m);
}

// ---------- a player ----------
function clientData(m) {
  if (!m || typeof m !== 'object') return;
  if (m.k === 'lobby') {
    NET.players = Array.isArray(m.players) ? m.players : []; NET.laps = m.laps; NET.diff = m.diff;
    if (NET.racing && !m.racing) backToLobby(); else renderLobby();
    if (RACE.state === 'online') onlineStatus('');
    return;
  }
  if (m.k === 'deny') { onlineStatus(m.why, true); netClose(); renderLobby(); return; }
  if (m.k === 'start') { netStartRace(m); return; }
  if (m.k === 'ST') { if (Array.isArray(m.list)) for (const s of m.list) applyState(s); return; }
  if (m.k === 'st') { applyState(m.s); return; }
  if (m.k === 'ev') { handleEvent(m); return; }
}
function sendPick(drv, bus) {
  if (!NET.on) return;
  if (NET.host) { const p = lobbyPlayer(NET.my); if (p) applyPick(p, { drv, bus }); }
  else netSend({ k: 'pick', drv, bus });
}

// ---------- starting and ending a race ----------
function netStartRace(m) {
  SFX.init();
  if (!m || !Array.isArray(m.entries) || !m.entries.some((e) => e.human && e.owner === NET.my)) { onlineStatus('The race started before you joined. You are in for the next one.', true); return; }
  NET.racing = true; RACE.paused = false;
  RACE.laps = [3, 6, 10].includes(m.laps) ? m.laps : 6; RACE.diff = clamp(fin(m.diff, 1), 0, 2) | 0;
  fadeTo(() => {
    const D = DIFF[RACE.diff];
    RACE.buses.forEach((b) => { b.remote = false; b.owner = null; b.human = false; b.isPlayer = false; b.net = null; });
    m.entries.forEach((e) => {
      const b = RACE.buses[e.bus]; if (!b) return;
      setDriver(b, DRIVERS[clamp(e.drv | 0, 0, DRIVERS.length - 1)]);
      b.owner = e.owner; b.human = !!e.human; b.remote = e.owner !== NET.my; b.isPlayer = !!e.human && e.owner === NET.my;
    });
    const p = RACE.buses.find((b) => b.isPlayer);
    RACE.player = p; RACE.drvIdx = DRIVERS.indexOf(p.driver); RACE.busIdx = busIdx(p);
    m.order.forEach((ei, slot) => {
      const e = m.entries[ei], b = RACE.buses[e.bus], g = W.grid[slot];
      b.place(g.s - b.halfL - 0.4, g.lat);
      b.resetRace();
      b.ai.base = b.human ? 1 : rr(0.975, 1.0);
      b.vmul = b.human ? 1 : D.vmul * b.ai.base;
      b.ai.skill = D.skill * rr(0.96, 1.02); b.ai.greed = rr(0.6, 0.95); b.ai.stopDec = {}; b.ai.pitAt = rr(38, 46); b.ai.pit = false;
      b.cp = Math.floor(b.progress / 20);
    });
    RACE.netGoAt = fin(m.goAt, 5);
    finishRaceSetup(p, p.driver);
    const humans = RACE.buses.filter((b) => b.human).length;
    H.introHand.textContent = p.driver.nick + ' drives the No. ' + p.def.num + ' ' + p.def.model + '. ' + humans + (humans === 1 ? ' player' : ' players') + ' online, ' + (6 - humans) + ' bots. Go!';
  });
}
// results screen → everybody back to the lobby (the host decides)
function hostBackToLobby() {
  if (!NET.host) return;
  NET.racing = false;
  broadcastLobby();
  backToLobby();
}
function backToLobby() {
  NET.racing = false; RACE.paused = false;
  fadeTo(() => {
    leaveRace();
    RACE.buses.forEach((b) => { b.remote = false; b.owner = null; b.human = false; b.net = null; });
    setLineup(); RACE.player = null; setState('online'); showScreen('scrOnline'); renderLobby();
  });
}

// ---------- 20 times a second: share where the buses are ----------
function busState(b) {
  const ab = b.ab || {};
  const fl = (b.braking ? 1 : 0) | (b.boosting ? 2 : 0) | (b.stunT > 0 ? 4 : 0) | (b.holdT > 0 ? 8 : 0) | (b.stunGuardT > 0 ? 16 : 0) | (b.pitT > 0 ? 32 : 0) |
    (b.pitLim ? 64 : 0) | (b.blown ? 128 : 0) | (b.effects && b.effects.some((e) => e.key === 'rainbow') ? 256 : 0) | (b.fx && b.fx.plantT > 0 ? 512 : 0) | (b.finished ? 1024 : 0);
  const s = {
    i: busIdx(b), x: r2(b.x), z: r2(b.z), y: +b.yaw.toFixed(3), vx: r2(b.vx), vz: r2(b.vz), f: r2(b.fwd), st: r2(b.ctrl.steer), sl: r2(b.slip), fy: r2(b.flyY || 0),
    lp: b.lap, pr: r2(b.progress), ft: +(b.finishTime || 0).toFixed(3), fp: b.finishPen || 0, bst: isFinite(b.best) ? +b.best.toFixed(3) : 0,
    fl, tr: Math.round(b.tire), bw: b.blownW, ps: b.pitStops || 0, stu: b.students || 0,
    ab: ab.key || '', ai: ab.id || 0, at: r2(ab.t || 0), am: r2(ab.max || 0),
  };
  if (ab.key === 'ball' && ab.ball) s.ball = [r2(ab.ball.x), r2(ab.ball.z), r2(ab.ball.age), r2(ab.ball.life)];
  if (ab.key === 'rage' && ab.tier) s.tier = ab.tier.min;
  return s;
}
function netTick(dt) {
  if (!NET.on) return;
  const now = performance.now();
  NET.sendT += dt; NET.relayT += dt; NET.beatT += dt;
  if (NET.host) {
    if (NET.racing && NET.sendT >= 0.05) {   // direct links: 20 times a second, only the buses driven here
      NET.sendT = 0;
      const m = { k: 'ST', list: RACE.buses.filter((b) => !b.remote).map(busState) };
      for (const c of NET.links.values()) if (c.open && !c.relay) c.send(m);
    }
    if (hasRelayLinks()) {
      if (NET.racing && NET.relayT >= 0.1) {   // relay players: 10 times a second, every bus in one message
        NET.relayT = 0;
        const m = { k: 'ST', list: RACE.buses.map((b) => (b.remote ? b.net : busState(b))).filter(Boolean) }, t = relayBase(NET.code) + 'all';
        for (const rc of RELAY.conns) relayPub(rc, t, m);
      }
      if (NET.beatT >= 3) {   // the lobby doubles as a heartbeat; quiet relay players have left
        NET.beatT = 0;
        if (!NET.racing) { const t = relayBase(NET.code) + 'all', m = lobbyMsg(); for (const rc of RELAY.conns) relayPub(rc, t, m); }
        for (const [id, c] of NET.links) if (c.relay && now - c.seen > 12000) hostDrop(id);
      }
    }
    return;
  }
  const every = NET.route === 'relay' ? 0.1 : 0.05;
  if (NET.racing && NET.sendT >= every) { NET.sendT = 0; if (RACE.player && NET.conn && NET.conn.open) NET.conn.send({ k: 'st', s: busState(RACE.player) }); }
  if (NET.route === 'relay') {
    if (!NET.racing && NET.beatT >= 3) { NET.beatT = 0; if (NET.conn && NET.conn.open) NET.conn.send({ k: 'ping' }); }
    if (now - NET.lastHost > 12000) netLost('Lost the connection to the room.');
  }
}
function applyState(s) {
  if (!s || typeof s !== 'object') return;
  const b = RACE.buses[s.i | 0];
  if (!b || !b.remote || !NET.racing) return;
  if (!isFinite(s.x) || !isFinite(s.z) || !isFinite(s.y)) return;
  const first = !b.net;
  b.net = s; b.netAt = performance.now();
  if (first) { b.x = s.x; b.z = s.z; b.yaw = s.y; b.hint = TRACK.globalNearest(b.x, b.z); }
}
// a bus driven on another device: glide toward where it was plus how it was moving
function remoteStep(b, dt) {
  const n = b.net; if (!n) return;
  const age = Math.min(0.3, (performance.now() - b.netAt) / 1000);
  const tx = n.x + fin(n.vx, 0) * age, tz = n.z + fin(n.vz, 0) * age;
  const ex = tx - b.x, ez = tz - b.z;
  if (ex * ex + ez * ez > 20 * 20) { b.x = tx; b.z = tz; b.yaw = n.y; b.hint = TRACK.globalNearest(b.x, b.z); }
  else { const k = 1 - Math.exp(-14 * dt); b.x += ex * k; b.z += ez * k; b.yaw = lerpA(b.yaw, n.y, k); }
  b.vx = fin(n.vx, 0); b.vz = fin(n.vz, 0); b.fwd = fin(n.f, 0); b.ctrl.steer = fin(n.st, 0); b.slip = fin(n.sl, 0); b.flyY = fin(n.fy, 0); b.yawRate = 0;
  TRACK.project(b.x, b.z, b.hint, b.q); b.hint = b.q.idx; b.prevS = b.q.s;
  b.lap = n.lp | 0; b.progress = fin(n.pr, b.progress);
  const f = n.fl | 0;
  b.braking = !!(f & 1); b.boosting = !!(f & 2);
  b.stunT = f & 4 ? 0.5 : 0; b.holdT = f & 8 ? 0.5 : 0; b.stunGuardT = f & 16 ? 1 : 0; b.pitT = f & 32 ? 1 : 0; b.pitLim = !!(f & 64);
  const blown = !!(f & 128);
  if (blown !== b.blown) { b.blown = blown; b.blownW = n.bw | 0; tyreScale(b, blown ? b.blownW : -1); }
  b.tire = fin(n.tr, 100);
  b.fx = b.fx || {}; b.fx.plantT = f & 512 ? 0.5 : 0;
  b.effects = f & 256 ? [{ key: 'rainbow', kind: 'bonus', amt: 0, t: 1, max: 1, label: '' }] : [];
  if (!b.finished && (f & 1024)) { b.finished = true; b.finishTime = fin(n.ft, RACE.t); RACE.order.push(b); }
  b.finishPen = n.fp || 0; b.best = n.bst > 0 ? n.bst : Infinity; b.pitStops = n.ps | 0; b.students = n.stu | 0;
  // the ability that bus is using, for visuals and for effects that are checked here (the marginal field)
  const key = typeof n.ab === 'string' ? n.ab : '';
  if (b.ab.key !== key || b.ab.id !== n.ai) b.ab = { key, t: 0, max: 0, id: n.ai, hits: new Set() };
  b.ab.t = fin(n.at, 0); b.ab.max = fin(n.am, 0);
  if (key === 'ball' && Array.isArray(n.ball)) b.ab.ball = { x: n.ball[0], z: n.ball[1], age: n.ball[2], life: n.ball[3] };
  if (key === 'rage') { const T = CH.doruk.ability.tiers; b.ab.tier = T.find((t) => t.min === n.tier) || T[0]; }
}

// ---------- abilities that hit a bus driven somewhere else ----------
function netEvent(t, op, data) {
  const m = Object.assign({ k: 'ev', to: t ? busIdx(t) : -1, op }, data);
  if (NET.host) routeEvent(m, NET.my); else if (NET.conn && NET.conn.open) NET.conn.send(m);
}
function routeEvent(m, from) {
  if (m.to < 0) {   // for everybody
    sendAll(m, from);
    if (from !== NET.my) handleEvent(m);
    return;
  }
  const b = RACE.buses[m.to | 0]; if (!b) return;
  if (b.owner === NET.my) handleEvent(m);
  else { const c = NET.links.get(b.owner); if (c && c.open) c.send(m); }
}
function handleEvent(m) {
  if (!NET.racing || !m) return;
  const src = m.src >= 0 ? RACE.buses[m.src | 0] : null, t = m.to >= 0 ? RACE.buses[m.to | 0] : null;
  const nick = src && src.driver ? src.driver.nick : 'A rival';
  if (m.op === 'stun' && t && !t.remote) {
    const ok = stunBus(t, fin(m.dur, 1), src);
    popText(t, ok ? 'STUNNED' : 'IMMUNE', ok ? '#ffe14a' : '#9fe8ff');
    if (t.isPlayer && ok) toast('Stunned by ' + nick + '!');
  } else if (m.op === 'eff' && t && !t.remote) {
    const kind = m.kind === 'bonus' ? 'bonus' : 'slow', amt = clamp(fin(m.amt, 0), 0, 1), time = clamp(fin(m.time, 1), 0, 20);
    if (addEffect(t, String(m.key || 'net'), kind, amt, time, String(m.label || ''), src)) {
      popText(t, (kind === 'bonus' ? '+' : '−') + pct(amt) + ' ' + String(m.label || '').toUpperCase(), kind === 'bonus' ? '#7dff6a' : '#ff8c7a');
      if (t.isPlayer) toast((kind === 'bonus' ? 'Gift from ' : 'Hit by ') + nick + ': ' + (kind === 'bonus' ? '+' : '−') + pct(amt) + ' for ' + time + ' s');
    } else popText(t, 'IMMUNE', '#9fe8ff');
  } else if (m.op === 'bite' && t && !t.remote && src) {
    if (!canBite(t)) return;
    if (t.ab.key === 'song') cutSong(t, '', true);
    t.holdT = clamp(fin(m.dur, 1.5), 0, 5); t.vx = t.vz = 0; t.pitPen = Math.max(t.pitPen, clamp(fin(m.pen, 2), 0, 10));
    chompFX(src, t); SFX.chomp(camVol(t));
    if (t.isPlayer) showMsg('CHOMP!', nick + ' bit you: +' + t.pitPen + ' s at your next pit stop', 'warn', 2.2);
  } else if (m.op === 'throw' && t && !t.remote && src) {
    if (t.aura || t.finished || t.pitT > 0 || t.pitLim || t.holdT > 0 || t.throwT > 0) return;
    if (t.ab.key === 'song') cutSong(t, '', true);
    t.throwT = CH.ada.ability.throwTime; t.throwSide = m.side < 0 ? -1 : 1; t.throwBy = src;
    showLep(t, t.throwSide); SFX.lep(camVol(t));
    if (t.isPlayer) showMsg('', 'A leprechaun grabbed you!', 'warn', 1.4);
  } else if (m.op === 'rain' && src) {
    RAIN.t = clamp(fin(m.time, 6), 0, 30); RAIN.max = RAIN.t; RAIN.loss = clamp(fin(m.loss, 0.2), 0, 0.9); RAIN.owner = src; SFX.thunder();
    const p = RACE.player;
    if (p) toast(p.aura ? 'Rain! Your happy aura keeps you dry' : 'Rain from ' + nick + '! −' + pct(RAIN.loss) + ' grip');
  } else if (m.op === 'drop' && src) {
    const key = (m.src | 0) + ':' + (m.use | 0);
    if (!NET.dropHits.has(key)) NET.dropHits.set(key, new Set());
    const d = { x: fin(m.x, 0), z: fin(m.z, 0), life: CH.irem.ability.coffee.dropLife, owner: src, hits: NET.dropHits.get(key), mesh: takeDropMesh() };
    d.mesh.position.set(d.x, 0.075, d.z); d.mesh.rotation.y = rr(0, 6.28); d.mesh.scale.setScalar(0.3); d.mesh.visible = true;
    DROPS.push(d);
  } else if (m.op === 'check' && src) checkFromRemote(src);
}
// Ali's reaction check reached this device: the player here gets the check, bots here roll the dice
function checkFromRemote(by) {
  const a = CH.ali.ability.mid, bots = [];
  for (const o of RACE.buses) {
    if (o === by || o.remote || o.finished || o.aura) continue;
    if (o.isPlayer) openCheck(by); else bots.push({ bus: o, pass: rnd() < a.botPass });
  }
  if (bots.length) RACE.extChecks.push({ t: 0, max: a.checkTime, by, bots });
}

// the human in front, for the bots' rubber band
function leadHuman() { let best = null; for (const b of RACE.buses) if (b.human && !b.finished && (!best || b.progress > best.progress)) best = b; return best; }

// ---------- the online screen ----------
function onlineStatus(text, bad) { const el = $('onStatus'); if (!el) return; el.textContent = text || ''; el.classList.toggle('bad', !!bad); }
function goOnline() {
  SFX.init(); RACE.paused = false;
  const go = () => { leaveRace(); setLineup(); RACE.player = null; setState('online'); showScreen('scrOnline'); renderLobby(); };
  if (RACE.state === 'title' || RACE.state === 'about') go(); else fadeTo(go);
}
function renderLobby() {
  const inRoom = NET.on;
  $('onMenu').hidden = inRoom; $('onLobby').hidden = !inRoom;
  $('onCodeTab').hidden = !inRoom || !NET.code; $('onCode').textContent = NET.code; $('onCodeBig').textContent = NET.code;
  $('btnOnStart').hidden = !(inRoom && NET.host);
  $('btnOnLeave').textContent = inRoom ? 'Leave room' : 'Back';
  if (!inRoom) return;
  const me = lobbyPlayer(NET.my);
  $('onPlayers').innerHTML = '';
  NET.players.forEach((p, i) => {
    const d = DRIVERS[p.drv] || DRIVERS[0], bus = BUSES[p.bus] || BUSES[0];
    const li = document.createElement('li'); li.style.setProperty('--dc', d.color);
    li.innerHTML = '<img alt=""><span><b></b><small></small></span><em></em>';
    li.querySelector('img').src = d.photo; li.querySelector('b').textContent = d.nick;
    li.querySelector('small').textContent = 'No. ' + bus.num + ' ' + bus.brand + ' ' + bus.model;
    li.querySelector('em').textContent = (p.host ? 'host' : 'player ' + (i + 1)) + (p.pid === NET.my ? ' · you' : '');
    if (p.pid === NET.my) li.classList.add('me');
    $('onPlayers').appendChild(li);
  });
  const bots = BUSES.length - NET.players.length;
  $('onBots').textContent = bots ? bots + (bots === 1 ? ' bus is' : ' buses are') + ' driven by bots.' : 'Every bus has a player.';
  // pick a driver and a bus: the ones your friends took are greyed out
  $('onDrv').innerHTML = '';
  DRIVERS.forEach((d, i) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'on-drv'; btn.style.setProperty('--dc', d.color);
    const taken = takenBy('drv', i, NET.my);
    btn.disabled = taken; btn.setAttribute('aria-pressed', String(!!me && me.drv === i)); btn.title = d.nick + (taken ? ' (taken)' : '');
    btn.innerHTML = '<img alt="">'; btn.firstChild.src = d.photo; btn.firstChild.alt = d.nick;
    btn.addEventListener('click', () => { RACE.drvIdx = i; store.set('drv', i); sendPick(i, null); SFX.tone(700, 0.06, 'square', 0.05); });
    $('onDrv').appendChild(btn);
  });
  $('onBus').innerHTML = '';
  BUSES.forEach((b, i) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'on-bus'; btn.style.setProperty('--sw', b.hud);
    const taken = takenBy('bus', i, NET.my);
    btn.disabled = taken; btn.setAttribute('aria-pressed', String(!!me && me.bus === i)); btn.title = b.brand + ' ' + b.model + (taken ? ' (taken)' : '');
    btn.innerHTML = '<b></b><span></span>'; btn.children[0].textContent = b.num; btn.children[1].textContent = b.model;
    btn.addEventListener('click', () => { RACE.busIdx = i; store.set('bus', i); sendPick(null, i); SFX.tone(700, 0.06, 'square', 0.05); });
    $('onBus').appendChild(btn);
  });
  let route;
  const relayOk = RELAY.conns.some((c) => c.ok);
  if (NET.host) route = NET.direct ? (relayOk ? 'Friends can join directly or through the backup connection.' : 'Friends can join directly.') : 'Direct connections are blocked on this network, so friends join through the backup connection.';
  else route = NET.route === 'relay' ? 'Connected through the backup connection (a little slower).' : 'Connected directly to the host.';
  const relayed = [...NET.links.values()].filter((c) => c.relay && c.open).length;
  if (NET.host && relayed) route += ' ' + relayed + (relayed === 1 ? ' friend uses' : ' friends use') + ' the backup connection.';
  $('onRoute').textContent = route;
  if (me) { const d = DRIVERS[me.drv], t = drvText(d); $('onDrvInfo').textContent = d.nick + ' · ' + t.ab.name + ' (' + t.ab.cost + ') · ' + t.p1.name + ', ' + t.p2.name; }
  $('onHostOpts').hidden = !NET.host;
  $('onWait').hidden = NET.host;
  document.querySelectorAll('#onLaps button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === NET.laps)));
  document.querySelectorAll('#onDiff button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === NET.diff)));
  $('onWait').textContent = 'Waiting for the host to start: ' + NET.laps + ' laps · ' + DIFF[NET.diff].name + ' bots';
}
function wireOnline() {
  $('btnOnline').addEventListener('click', goOnline);
  $('btnCreate').addEventListener('click', netCreate);
  $('btnJoin').addEventListener('click', () => netJoin($('onCodeIn').value));
  $('onCodeIn').addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') netJoin($('onCodeIn').value); });
  $('onCodeIn').addEventListener('input', (e) => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (v !== e.target.value) e.target.value = v; });
  $('btnOnStart').addEventListener('click', hostStart);
  $('btnOnLeave').addEventListener('click', () => { if (NET.on) { netClose(); renderLobby(); onlineStatus('You left the room.'); } else { setState('title'); showScreen('scrTitle'); } });
  $('btnCopyCode').addEventListener('click', () => { try { navigator.clipboard.writeText(NET.code); toastMenu('Code copied'); } catch (e) { /* no clipboard */ } });
  document.querySelectorAll('#onLaps button').forEach((b) => b.addEventListener('click', () => { NET.laps = +b.dataset.v; broadcastLobby(); }));
  document.querySelectorAll('#onDiff button').forEach((b) => b.addEventListener('click', () => { NET.diff = +b.dataset.v; broadcastLobby(); }));
}
function toastMenu(t) { onlineStatus(t); }

// =====================================================================
//  SOUND (Web Audio, all synthesized)
// =====================================================================
const SFX = {
  ctx: null, muted: !!store.get('muted', false),
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    let c;
    try { c = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    this.ctx = c;
    this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.6; this.master.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = nb;
    // engine
    this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 500; this.lp.Q.value = 3;
    this.eg = c.createGain(); this.eg.gain.value = 0;
    this.o1 = c.createOscillator(); this.o1.type = 'sawtooth';
    this.o2 = c.createOscillator(); this.o2.type = 'square';
    this.o3 = c.createOscillator(); this.o3.type = 'sine';
    const g2 = c.createGain(); g2.gain.value = 0.5; const g3 = c.createGain(); g3.gain.value = 0.9;
    this.o1.connect(this.lp); this.o2.connect(g2); g2.connect(this.lp); this.o3.connect(g3); g3.connect(this.eg);
    this.lp.connect(this.eg); this.eg.connect(this.master);
    [this.o1, this.o2, this.o3].forEach((o) => { o.frequency.value = 50; o.start(); });
    // road + tyre noise
    this.road = this.loopNoise('bandpass', 700, 0.8); this.skid = this.loopNoise('bandpass', 2400, 4);
    this.crowd = this.loopNoise('bandpass', 1100, 0.7);
    // horn
    this.hg = c.createGain(); this.hg.gain.value = 0;
    const hf = c.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1900;
    for (const f of [349, 440]) { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(hf); o.start(); }
    hf.connect(this.hg); this.hg.connect(this.master);
  },
  loopNoise(type, freq, q) {
    const c = this.ctx, src = c.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(this.master); src.start();
    return { g, f };
  },
  setMuted(m) { this.muted = m; store.set('muted', m); if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.05); },
  engine(rpm, load, boost, on, speed, skid, crowd) {
    if (!this.ctx || !isFinite(rpm + load + speed + skid + crowd)) return;
    const t = this.ctx.currentTime, f = 36 + rpm * 100 + (boost ? 14 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.04); this.o2.frequency.setTargetAtTime(f * 0.5, t, 0.04); this.o3.frequency.setTargetAtTime(f * 0.5, t, 0.04);
    this.lp.frequency.setTargetAtTime(260 + rpm * 1000 + load * 700 + (boost ? 900 : 0), t, 0.06);
    this.eg.gain.setTargetAtTime(on ? 0.05 + load * 0.05 + rpm * 0.04 : 0, t, 0.08);
    this.road.g.gain.setTargetAtTime(on ? Math.min(0.09, speed * 0.0018) : 0, t, 0.1);
    this.skid.g.gain.setTargetAtTime(on ? skid * 0.07 : 0, t, 0.05);
    this.crowd.g.gain.setTargetAtTime(crowd * 0.05, t, 0.3);
  },
  tone(freq, dur, type, vol, when, slide) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  },
  burst(dur, freq, vol, type, when) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + (when || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type || 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  },
  impact(k) { this.burst(0.25 + k * 0.2, 500 + k * 500, 0.25 + k * 0.35); this.tone(70, 0.25, 'sine', 0.3 * k + 0.1, 0, 40); },
  pickup() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.16, i * 0.06)); },
  light() { this.tone(560, 0.22, 'square', 0.1); },
  go() { this.tone(1120, 0.6, 'square', 0.12); },
  whoosh() { if (!this.ctx) return; this.burst(0.5, 1400, 0.18, 'bandpass'); },
  horn(on) { if (this.hg) this.hg.gain.setTargetAtTime(on ? 0.1 : 0, this.ctx.currentTime, 0.02); },
  honkShort() { if (!this.hg) return; const t = this.ctx.currentTime; this.hg.gain.setTargetAtTime(0.05, t, 0.01); this.hg.gain.setTargetAtTime(0, t + 0.22, 0.02); },
  cheer() {
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) this.burst(1.6, 900 + i * 250, 0.09, 'bandpass', i * 0.25);
    for (let i = 0; i < 5; i++) this.tone(1500 + Math.random() * 900, 0.35, 'sine', 0.05, 0.3 + i * 0.3, 2400 + Math.random() * 600);
  },
  fanfare() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i === 3 ? 0.7 : 0.2, 'square', 0.08, i * 0.16)); },
  siren(dur) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'square'; f.type = 'lowpass'; f.frequency.value = 2400;
    for (let k = 0; k < dur / 0.32; k++) o.frequency.setValueAtTime(k % 2 ? 1020 : 760, t + k * 0.32);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.05); g.gain.setValueAtTime(0.09, t + dur - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  },
  wobble(type, f0, f1, f2, dur, bp, q, lfoF, lfoD, vol) {
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
    o.type = type; f.type = 'bandpass'; f.frequency.value = bp; f.Q.value = q;
    l.frequency.value = lfoF; lg.gain.value = lfoD; l.connect(lg); lg.connect(o.frequency);
    o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + dur * 0.25); o.frequency.linearRampToValueAtTime(f2, t + dur * 0.95);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.1); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.master); o.start(t); l.start(t); o.stop(t + dur + 0.05); l.stop(t + dur + 0.05);
  },
  howl() { if (this.ctx) this.wobble('sawtooth', 360, 640, 430, 1.55, 950, 2.5, 6, 16, 0.18); },
  scream(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 820, 1350, 1150, 1.2, 1700, 1.2, 11, 40, 0.22 * v); this.burst(1.0, 2200, 0.12 * v, 'bandpass'); },
  slurp(v) {
    if (!this.ctx || v <= 0.02) return;
    const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
    s.buffer = this.noise; f.type = 'bandpass'; f.Q.value = 6; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.8);
    g.gain.value = 0.12 * v; l.frequency.value = 18; lg.gain.value = 0.12 * v; l.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); l.start(t); s.stop(t + 0.85); l.stop(t + 0.85);
  },
  powerUp(v) { if (!this.ctx || v <= 0.02) return; this.tone(300, 0.45, 'sine', 0.18 * v, 0, 1400); [660, 880, 1320].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.1 * v, 0.1 + i * 0.07)); },
  denied() { this.tone(170, 0.16, 'square', 0.08); },
  bang(v) { if (!this.ctx || v <= 0.02) return; this.burst(0.45, 1500, 0.55 * v); this.tone(55, 0.35, 'sine', 0.4 * v, 0, 30); },
  wrench() { if (!this.ctx) return; for (let i = 0; i < 4; i++) { this.tone(880, 0.28, 'sawtooth', 0.05, i * 0.55, 1300); this.burst(0.28, 3000, 0.05, 'bandpass', i * 0.55); } },
  bark(v) { if (!this.ctx || v <= 0.02) return; [0, 0.22].forEach((d) => this.tone(430, 0.12, 'square', 0.14 * v, d, 240)); },
  flap() { this.burst(0.18, 380, 0.12, 'lowpass'); },
  coin() { this.tone(1900 + Math.random() * 700, 0.08, 'triangle', 0.05); },
  glitch() { this.tone(180 + Math.random() * 2000, 0.05, 'square', 0.04); },
  // ---- ability sounds (all synthesized) ----
  field(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 180, 520, 140, 0.9, 700, 3, 9, 40, 0.13 * v); this.wobble('square', 520, 180, 400, 0.9, 1200, 4, 7, 30, 0.05 * v); },
  kick(v) { if (!this.ctx || v <= 0.02) return; this.burst(0.07, 2200, 0.35 * v); this.tone(150, 0.14, 'sine', 0.35 * v, 0, 70); },
  bonk(v) { if (!this.ctx || v <= 0.02) return; this.tone(620, 0.16, 'square', 0.12 * v, 0, 240); this.tone(90, 0.2, 'sine', 0.25 * v); },
  meow(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 620, 980, 520, 0.6, 1500, 4, 6, 24, 0.12 * v); },
  clonk(v) { if (!this.ctx || v <= 0.02) return; this.tone(240, 0.3, 'triangle', 0.24 * v, 0, 170); this.burst(0.1, 1200, 0.18 * v); },
  sadHorn(v) { if (!this.ctx || v <= 0.02) return; [392, 370, 349].forEach((f, i) => this.tone(f, 0.32, 'sawtooth', 0.08 * v, i * 0.3)); this.tone(330, 0.9, 'sawtooth', 0.08 * v, 0.9, 290); },
  thunder() { if (!this.ctx) return; this.burst(2.2, 160, 0.55, 'lowpass'); this.burst(0.5, 900, 0.3, 'lowpass', 0.06); this.burst(1.2, 300, 0.3, 'lowpass', 0.4); },
  rainbow() { if (!this.ctx) return; [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.09, i * 0.08)); },
  ding(v) { const k = v == null ? 1 : v; if (!this.ctx || k <= 0.02) return; this.tone(1318, 0.25, 'sine', 0.2 * k); this.tone(1760, 0.35, 'sine', 0.14 * k, 0.09); },
  buzz(v) { const k = v == null ? 1 : v; if (!this.ctx || k <= 0.02) return; this.tone(150, 0.32, 'square', 0.1 * k); this.tone(142, 0.32, 'sawtooth', 0.06 * k); },
  rage(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 90, 150, 70, 1.3, 420, 2, 12, 20, 0.26 * v); this.burst(1.0, 700, 0.2 * v, 'lowpass'); },
  burn(v) { if (!this.ctx || v <= 0.02) return; this.burst(0.5, 2600, 0.14 * v, 'highpass'); },
  chime(v) { const k = v == null ? 1 : v; if (!this.ctx || k <= 0.02) return; [1175, 1568, 2093].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.1 * k, i * 0.05)); },
  scratch(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 900, 240, 600, 0.35, 1800, 1, 30, 400, 0.12 * v); },
  growl(v) { if (!this.ctx || v <= 0.02) return; this.wobble('sawtooth', 120, 95, 70, 0.9, 520, 2, 16, 26, 0.24 * v); },
  chomp(v) { if (!this.ctx || v <= 0.02) return; for (const d of [0, 0.18]) { this.burst(0.1, 1400, 0.35 * v, 'bandpass', d); this.tone(95, 0.16, 'sine', 0.35 * v, d, 60); } },
  nom(v) { if (!this.ctx || v <= 0.02) return; for (const d of [0, 0.15, 0.3]) this.tone(260, 0.09, 'square', 0.08 * v, d, 170); },
  checkStart() { if (!this.ctx) return; [988, 988, 1480].forEach((f, i) => this.tone(f, 0.08, 'square', 0.08, i * 0.12)); },
  lep(v) { if (!this.ctx || v <= 0.02) return; const t = this.ctx.currentTime; [81, 83, 86, 88, 86, 83, 81].forEach((m, i) => this.whistle(m, t + i * 0.09)); this.burst(0.5, 1400, 0.18 * v, 'bandpass', 0.5); },
  clang(v) { if (!this.ctx || v <= 0.02) return; this.tone(1850, 0.5, 'triangle', 0.1 * v); this.tone(2470, 0.4, 'triangle', 0.07 * v, 0.02); this.tone(110, 0.2, 'sine', 0.2 * v); },
  splash() { this.burst(0.3, 900, 0.2, 'bandpass'); },
  rainLevel(k) { if (!this.ctx) return; if (!this.rainN) this.rainN = this.loopNoise('highpass', 2600, 0.4); if (Math.abs(k - (this.rainK || 0)) > 0.01) { this.rainK = k; this.rainN.g.gain.setTargetAtTime(k * 0.08, this.ctx.currentTime, 0.2); } },
  // Ela's song: an original, cheerful tune sung by a simple 'ah' voice (formant filters + vibrato)
  voice(m, t, dur, v, out) {
    const c = this.ctx, f = 440 * Math.pow(2, (m - 69) / 12), o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; l.frequency.value = 5.6; lg.gain.value = f * 0.013; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1 * v, t + 0.06); g.gain.setValueAtTime(0.085 * v, t + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [ff, q, a] of [[760, 7, 1], [1180, 8, 0.6], [2600, 9, 0.25]]) { const bp = c.createBiquadFilter(), bg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; bg.gain.value = a; o.connect(bp); bp.connect(bg); bg.connect(g); }
    g.connect(out); o.start(t); l.start(t); o.stop(t + dur + 0.05); l.stop(t + dur + 0.05);
  },
  startSong(v, dur) {
    if (!this.ctx) return;
    this.stopSong();
    if (v <= 0.05) return;
    const c = this.ctx, out = c.createGain(); out.gain.value = 1; out.connect(this.master); this.songG = out;
    const tune = [[76, 0.5], [77, 0.5], [79, 1], [72, 0.5], [74, 0.5], [76, 1], [79, 0.5], [76, 0.5], [74, 1], [72, 0.5], [74, 0.5], [76, 0.5], [77, 0.5], [79, 1.5], [0, 0.5], [81, 0.5], [79, 0.5], [77, 0.5], [76, 0.5], [74, 1], [72, 2]];
    const beats = tune.reduce((a, n) => a + n[1], 0), bt = dur / beats, t0 = c.currentTime + 0.05;
    let t = t0;
    for (const [m, d] of tune) { if (m) this.voice(m, t, d * bt * 0.95, v, out); t += d * bt; }
    const chords = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]];
    chords.forEach((ch, i) => ch.forEach((m) => {
      const o = c.createOscillator(), g = c.createGain(), ts = t0 + i * dur / 4;
      o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0.0001, ts); g.gain.linearRampToValueAtTime(0.03 * v, ts + 0.2); g.gain.setValueAtTime(0.03 * v, ts + dur / 4 - 0.2); g.gain.linearRampToValueAtTime(0.0001, ts + dur / 4);
      o.connect(g); g.connect(out); o.start(ts); o.stop(ts + dur / 4 + 0.05);
    }));
  },
  stopSong() {
    const g = this.songG; if (!g) return;
    this.songG = null; g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
    setTimeout(() => { try { g.disconnect(); } catch (e) { /* already gone */ } }, 400);
  },
  whistle(m, t) {
    const c = this.ctx, f = 440 * Math.pow(2, (m - 69) / 12), o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain(), l = c.createOscillator(), lg = c.createGain();
    o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = 0.25;
    l.frequency.value = 5.5; lg.gain.value = f * 0.006; l.connect(lg); lg.connect(o.frequency);
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.015); g.gain.setValueAtTime(0.04, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    g.connect(this.master); o.start(t); o2.start(t); l.start(t); o.stop(t + 0.2); o2.stop(t + 0.2); l.stop(t + 0.2);
  },
};
// =====================================================================
//  INPUT (keyboard, touch, gamepad)
// =====================================================================
const IN = { up: false, down: false, left: false, right: false, hb: false, boost: false, horn: false, steer: 0, gpSteer: 0, gpThr: 0, gpBrk: 0, gp: false };
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'hb', ShiftLeft: 'boost', ShiftRight: 'boost', KeyN: 'boost', KeyH: 'horn'
};
addEventListener('keydown', (e) => {
  const a = KEYMAP[e.code];
  if (a) { IN[a] = true; if (RACE.state === 'intro' || RACE.state === 'countdown' || RACE.state === 'race' || RACE.state === 'finish') e.preventDefault(); }
  if (e.repeat) return;
  onKeyPress(e);
});
addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) IN[a] = false; });
addEventListener('blur', () => { for (const k of ['up', 'down', 'left', 'right', 'hb', 'boost', 'horn']) IN[k] = false; });
function bindTouch(id, key, onDown) {
  const el = $(id);
  const on = (e) => { e.preventDefault(); IN[key] = true; el.classList.add('held'); try { el.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } SFX.init(); if (onDown) onDown(); };
  const off = (e) => { e.preventDefault(); IN[key] = false; el.classList.remove('held'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
function pollGamepad() {
  let pads = [];
  try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return; }
  const p = pads && Array.from(pads).find((x) => x && x.connected);
  if (!p) { IN.gp = false; return; }
  const ax = p.axes[0] || 0, bt = (i) => (p.buttons[i] ? p.buttons[i].value || (p.buttons[i].pressed ? 1 : 0) : 0);
  IN.gpSteer = Math.abs(ax) > 0.12 ? ax : 0; IN.gpThr = bt(7); IN.gpBrk = bt(6);
  IN.gp = IN.gpThr > 0.05 || IN.gpBrk > 0.05 || IN.gpSteer !== 0 || bt(0) > 0 || bt(2) > 0;
  IN.gpBoost = bt(0) > 0.5; IN.gpHb = bt(2) > 0.5;
  if (IN.gpBoost && !IN.gpSup) tryPlayerAbility();
  IN.gpSup = IN.gpBoost;
  const start = bt(9) > 0.5;
  if (start && !IN.gpStart && (RACE.state === 'race' || RACE.state === 'countdown')) togglePause();
  IN.gpStart = start;
}
function playerControls(b, dt) {
  const c = b.ctrl;
  if (RACE.paused) { c.thr = 0; c.brk = 0.4; c.steer = 0; c.hb = false; c.boost = false; IN.steer = 0; return; }
  // Volkan's controls are always reversed and his field reverses everyone else's; never twice, so never back to normal
  const rev = drvId(b) === 'volkan' || b.fieldInv, inv = rev ? -1 : 1;
  const tgt = ((IN.right ? 1 : 0) - (IN.left ? 1 : 0)) * inv;
  if (IN.gpSteer) IN.steer = IN.gpSteer * inv;
  else {
    const rate = tgt === 0 ? 7 : (Math.sign(tgt) !== Math.sign(IN.steer) && IN.steer !== 0 ? 10 : 4.2);
    IN.steer += clamp(tgt - IN.steer, -rate * dt, rate * dt);
  }
  c.steer = IN.steer;
  const gas = Math.max(IN.up ? 1 : 0, IN.gpThr || 0), brake = Math.max(IN.down ? 1 : 0, IN.gpBrk || 0);
  c.thr = rev ? brake : gas; c.brk = rev ? gas : brake;
  c.hb = IN.hb || !!IN.gpHb;
  c.boost = IN.boost || !!IN.gpBoost;
}

// =====================================================================
//  CAMERA
// =====================================================================
const CAM = { mode: store.get('cam', 0) | 0, pos: new THREE.Vector3(0, 8, -20), look: new THREE.Vector3(), yaw: 0, shake: 0, fov: 62, t: 0 };
const CAM_NAMES = ['chase', 'far', 'bumper'];
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
function camShake(a) { if (!REDUCED) CAM.shake = Math.max(CAM.shake, a); }
function chasePose(b, outPos, outLook, mode) {
  const P = b.m.P, fx = Math.sin(CAM.yaw), fz = Math.cos(CAM.yaw);
  if (mode === 2) {
    const bx = Math.sin(b.yaw), bz = Math.cos(b.yaw);
    outPos.set(b.x + bx * (P.L / 2 - 0.2), P.gc + P.hoodV + 0.45 + (b.flyY || 0), b.z + bz * (P.L / 2 - 0.2));
    outLook.set(b.x + bx * 40, 1.2, b.z + bz * 40);
    return;
  }
  // Irem's camera sits lower and right behind the back of her bus, looking over the roof
  if (b.isPlayer && drvId(b) === 'irem') {
    const p = CH.irem.passive1, far = mode === 1 ? 1 : 0;
    const back = P.L / 2 + p.back + far * 3, up = P.H + p.height + far * 0.6;
    outPos.set(b.x - fx * back, up + (b.flyY || 0), b.z - fz * back);
    outLook.set(b.x + fx * 20, 1.7 + (b.flyY || 0) * 0.85, b.z + fz * 20);
    return;
  }
  const back = mode === 1 ? 14 + P.L * 0.55 : 8.2 + P.L * 0.45, up = mode === 1 ? 5.0 + P.H * 0.3 : 2.6 + P.H * 0.6;
  outPos.set(b.x - fx * back, up + (b.flyY || 0), b.z - fz * back);
  outLook.set(b.x + fx * 6, 1.7 + (b.flyY || 0) * 0.85, b.z + fz * 6);
}
function applyCam(dt, pos, look, rate) {
  if (rate >= 1) CAM.pos.copy(pos); else CAM.pos.lerp(pos, rate);
  CAM.look.lerp(look, rate >= 1 ? 1 : Math.min(1, rate * 1.4));
  camera.position.copy(CAM.pos);
  if (CAM.shake > 0.001) {
    camera.position.x += (Math.random() - 0.5) * CAM.shake * 0.7; camera.position.y += (Math.random() - 0.5) * CAM.shake * 0.5;
    CAM.shake *= Math.exp(-6 * dt);
  }
  camera.lookAt(CAM.look);
}
function setFov(f) { if (Math.abs(camera.fov - f) > 0.05) { camera.fov = f; camera.updateProjectionMatrix(); } }
const CAMQ = {};
// keep a chase camera inside the walls so it never ends up in trees, lamp posts or buildings
function clampToCircuit(v) {
  const q = TRACK.project(v.x, v.z, CAM.hint || 0, CAMQ); CAM.hint = q.idx;
  const lim = WALL - 1.2;
  if (Math.abs(q.d) > lim) { const ex = Math.abs(q.d) - lim, sd = Math.sign(q.d); v.x -= -q.tz * sd * ex; v.z -= q.tx * sd * ex; }
}
// fade rival buses that block the view of the player's bus, and lift the camera over a bus right behind
function cameraOcclusion(dt, active) {
  const p = RACE.player, cx = camera.position.x, cz = camera.position.z, cy = camera.position.y;
  let lift = 0;
  for (const b of RACE.buses) {
    let target = 1;
    if (active && b === p && drvId(p) === 'irem' && CAM.mode !== 2 && (p.ab.key === 'cat' || p.ab.key === 'thermos' || p.ab.key === 'coffee' || (p.fx && p.fx.plantT > 0))) target = 0.38;
    if (active && p && b !== p) {
      const dx = cx - b.x, dz = cz - b.z, c = Math.cos(b.yaw), s = Math.sin(b.yaw);
      const lx = dx * c - dz * s, lz = dx * s + dz * c;
      const hd = Math.hypot(Math.max(0, Math.abs(lx) - b.def.dim.W / 2), Math.max(0, Math.abs(lz) - b.def.dim.L / 2));
      if (hd < 3.5) target = Math.min(target, 0.16 + 0.84 * (hd / 3.5));
      lift = Math.max(lift, clamp((5 - hd) / 5, 0, 1));
      const sx = p.x - cx, sz = p.z - cz, sl = sx * sx + sz * sz || 1;
      const t = clamp(((b.x - cx) * sx + (b.z - cz) * sz) / sl, 0, 1);
      const ox = cx + sx * t - b.x, oz = cz + sz * t - b.z, lineY = cy + (1.4 - cy) * t;
      if (t > 0.02 && t < 0.92 && Math.hypot(ox, oz) < b.def.dim.W / 2 + 1.4 && lineY < b.def.dim.H + 0.5) target = Math.min(target, 0.28);
    }
    b.fadeA = lerp(b.fadeA == null ? 1 : b.fadeA, target, Math.min(1, dt * 10));
    setBusAlpha(b, b.fadeA > 0.985 ? 1 : b.fadeA);
  }
  CAM.lift = lerp(CAM.lift || 0, lift * 1.8, Math.min(1, dt * 4));
}

// =====================================================================
//  PARTICLES (tyre smoke, dust)
// =====================================================================
const FX = { pool: [], i: 0 };
function initFX() {
  const t = texLabel(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  for (let i = 0; i < 70; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 }));
    s.visible = false; s.renderOrder = 5; s.userData = { life: 0, max: 1, vx: 0, vy: 0, vz: 0, s0: 1, s1: 3 };
    scene.add(s); FX.pool.push(s);
  }
}
function puff(x, y, z, color, s0, s1, life, vy) {
  const s = FX.pool[FX.i]; FX.i = (FX.i + 1) % FX.pool.length;
  const u = s.userData; u.life = 0; u.max = life; u.s0 = s0; u.s1 = s1; u.vx = (Math.random() - 0.5) * 1.2; u.vz = (Math.random() - 0.5) * 1.2; u.vy = vy;
  s.position.set(x, y, z); s.material.color.copy(color); s.visible = true;
}
const SMOKE = new THREE.Color(), DUST = new THREE.Color();
function updateFX(dt) {
  for (const s of FX.pool) {
    if (!s.visible) continue;
    const u = s.userData; u.life += dt;
    if (u.life >= u.max) { s.visible = false; continue; }
    const k = u.life / u.max, sc = lerp(u.s0, u.s1, k);
    s.scale.set(sc, sc, 1); s.material.opacity = 0.45 * (1 - k);
    s.position.x += u.vx * dt; s.position.y += u.vy * dt; s.position.z += u.vz * dt;
  }
}
const SPK = { pool: [], i: 0 };
function initSparks() {
  const t = texLabel(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.4, 'rgba(255,170,40,.9)'); gr.addColorStop(1, 'rgba(255,120,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  for (let i = 0; i < 60; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
    s.visible = false; s.scale.set(0.32, 0.32, 1); s.renderOrder = 5; s.userData = { v: new THREE.Vector3(), life: 0 }; scene.add(s); SPK.pool.push(s);
  }
}
function spark(x, z, bx, bz) {
  const s = SPK.pool[SPK.i]; SPK.i = (SPK.i + 1) % SPK.pool.length;
  s.position.set(x, 0.25, z); s.userData.v.set(-bx * rr(4, 10) + rr(-3, 3), rr(1.5, 4.5), -bz * rr(4, 10) + rr(-3, 3)); s.userData.life = rr(0.2, 0.4); s.visible = true;
}
function updateSparks(dt) {
  for (const s of SPK.pool) { if (!s.visible) continue; const u = s.userData; u.life -= dt; if (u.life <= 0) { s.visible = false; continue; } u.v.y -= 20 * dt; s.position.addScaledVector(u.v, dt); }
}
function emitFor(b, dt) {
  const spd = b.speed;
  if (b.blown && spd > 4) { wheelWorld(b, b.blownW, TMPW); const bx = Math.sin(b.yaw), bz = Math.cos(b.yaw); spark(TMPW.x, TMPW.z, bx, bz); if (Math.random() < 0.6) spark(TMPW.x, TMPW.z, bx, bz); }
  const drift = Math.abs(b.slip) > 0.16 && spd > 8;
  const dust = b.off && spd > 6;
  if (!drift && !dust) return;
  b.fxT = (b.fxT || 0) - dt;
  if (b.fxT > 0) return;
  b.fxT = 0.045;
  const P = b.m.P, bx = Math.sin(b.yaw), bz = Math.cos(b.yaw), rx = -bz, rz = bx;
  const back = P.axR - P.L / 2;
  for (const sx of [1, -1]) {
    const x = b.x + bx * back + rx * sx * (P.W / 2 - 0.2), z = b.z + bz * back + rz * sx * (P.W / 2 - 0.2);
    puff(x, 0.4, z, dust ? DUST : SMOKE, 0.8, dust ? 4 : 3.2, dust ? 1.1 : 0.9, 0.8);
  }
}

// =====================================================================
//  RACE FLOW, HUD, MENUS, MAIN LOOP
// =====================================================================
const RACE = {
  state: 'boot', t: 0, laps: store.get('laps', 6), diff: store.get('diff', 1), busIdx: store.get('bus', 0), drvIdx: store.get('drv', 0),
  buses: [], player: null, firstPass: [], order: [], stateT: 0, lightsOn: 0, goAt: 0, paused: false,
  resetCD: 0, stuckT: 0, hintT: 0, quality: store.get('quality', TOUCH ? 'medium' : 'high'), perf: { t: 0, n: 0, sum: 0, done: false }
};
if (![3, 6, 10].includes(RACE.laps)) RACE.laps = 6;
if (!(RACE.diff >= 0 && RACE.diff <= 2)) RACE.diff = 1;
if (!(RACE.busIdx >= 0 && RACE.busIdx < BUSES.length)) RACE.busIdx = 0;
if (!(RACE.drvIdx >= 0 && RACE.drvIdx < DRIVERS.length)) RACE.drvIdx = 0;

// ---------- HUD ----------
const H = {};
function initHUD() {
  ['hud', 'hPos', 'hPosOf', 'hLap', 'hTime', 'hLast', 'hBest', 'tLap', 'tLeft', 'hSpeed', 'hMod', 'abilBox', 'hAbName', 'hAbCost', 'hBank', 'hBankLbl', 'hAbFill', 'hAbHint', 'hEffs', 'hDriver', 'hDrvImg', 'hDrvNick', 'hDrvPassive', 'alarm', 'stun', 'sb', 'terms', 'revWarn', 'checkCard', 'chkZone', 'chkMark', 'chkMsg', 'quizCard', 'qzText', 'qzL', 'qzR', 'qzHint', 'brainrot', 'tyreBox', 'hTyre', 'hTyrePct', 'pitLim', 'pitLimTxt', 'pitBox', 'hPitBar', 'lights', 'intro', 'introTop', 'introTitle', 'introHand', 'msg', 'toast', 'wrong', 'hint', 'speedfx', 'touch', 'minimap', 'tower'].forEach((id) => { H[id] = $(id); });
  H.rows = [];
  for (let i = 0; i < 6; i++) {
    const r = document.createElement('div'); r.className = 'trow';
    r.innerHTML = '<b></b><i></i><span class="n"></span><span class="g"></span>';
    H.tower.appendChild(r); H.rows.push({ el: r, p: r.children[0], c: r.children[1], n: r.children[2], g: r.children[3] });
  }
  H.lightEls = Array.from(H.lights.children);
  const mm = H.minimap, dpr = Math.min(2, window.devicePixelRatio || 1);
  mm.width = 190 * dpr; mm.height = 190 * dpr; H.mmScale = dpr;
  const T = TRACK;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (let i = 0; i < T.N; i++) { x0 = Math.min(x0, T.px[i]); x1 = Math.max(x1, T.px[i]); z0 = Math.min(z0, T.pz[i]); z1 = Math.max(z1, T.pz[i]); }
  const sc = 150 / Math.max(x1 - x0, z1 - z0);
  H.mm = { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, sc };
  H.mmPath = new Path2D();
  for (let i = 0; i <= T.N; i += 3) { const k = i % T.N, p = mmPt(T.px[k], T.pz[k]); if (i === 0) H.mmPath.moveTo(p[0], p[1]); else H.mmPath.lineTo(p[0], p[1]); }
  H.mmPath.closePath();
  H.mmPit = new Path2D();
  for (let s = PIT.s0; s <= PIT.s1; s += 5) { const q = TRACK.pointAt(s, Math.min(-HW, pitOuter(s) + 6), {}), p = mmPt(q.x, q.z); if (s === PIT.s0) H.mmPit.moveTo(p[0], p[1]); else H.mmPit.lineTo(p[0], p[1]); }
}
function mmPt(x, z) { return [95 + (x - H.mm.cx) * H.mm.sc, 95 + (z - H.mm.cz) * H.mm.sc]; }
function drawMinimap() {
  const g = H.minimap.getContext('2d'), d = H.mmScale;
  g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, 190, 190);
  g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 9; g.stroke(H.mmPath);
  g.strokeStyle = '#e8ecf2'; g.lineWidth = 4; g.stroke(H.mmPath);
  g.strokeStyle = '#ffb000'; g.lineWidth = 2.5; g.stroke(H.mmPit);
  const sp = mmPt(TRACK.px[0], TRACK.pz[0]); g.fillStyle = '#e10600'; g.fillRect(sp[0] - 2, sp[1] - 6, 4, 12);
  for (const s of W.stops) { if (RACE.player && s.got.get(RACE.player) === RACE.player.lap) continue; const p = TRACK.pointAt(s.s, 0, TMP); const q = mmPt(p.x, p.z); g.fillStyle = '#ffc629'; g.beginPath(); g.arc(q[0], q[1], 3, 0, 7); g.fill(); }
  for (const b of RACE.buses) {
    if (b === RACE.player) continue;
    const q = mmPt(b.x, b.z);
    if (b.human) { g.fillStyle = '#fff'; g.beginPath(); g.arc(q[0], q[1], 5.5, 0, 7); g.fill(); }   // friends online
    g.fillStyle = b.def.hud; g.beginPath(); g.arc(q[0], q[1], 4, 0, 7); g.fill();
  }
  const pl = RACE.player; if (pl) { const q = mmPt(pl.x, pl.z); g.fillStyle = '#fff'; g.beginPath(); g.arc(q[0], q[1], 6.5, 0, 7); g.fill(); g.fillStyle = pl.def.hud; g.beginPath(); g.arc(q[0], q[1], 4.5, 0, 7); g.fill(); }
}
function standings() {
  return RACE.buses.slice().sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1; if (b.finished) return 1;
    return b.progress - a.progress;
  });
}
let msgTimer = 0;
function showMsg(big, small, cls, dur) {
  H.msg.className = 'msg'; void H.msg.offsetWidth;
  H.msg.innerHTML = (big ? '<b>' + big + '</b>' : '') + (small ? '<span>' + small + '</span>' : '');
  H.msg.className = 'msg show ' + (cls || ''); msgTimer = dur || 1.6;
}
function toast(t) { H.toast.textContent = t; H.toast.className = 'toast'; void H.toast.offsetWidth; H.toast.className = 'toast show'; }
let hudT = 0;
function updateHUD(dt) {
  const p = RACE.player; if (!p) return;
  const kmh = Math.round(Math.max(0, p.fwd) * 3.6);
  H.hSpeed.textContent = kmh;
  // ability panel: students (or Ali's sweet meter), whether the ability can be used, how long it still runs
  const info = abilityInfo(p);
  H.hAbName.textContent = info.name; H.hAbCost.textContent = info.cost;
  H.hBank.textContent = info.big; H.hBankLbl.textContent = info.unit;
  H.hAbFill.style.width = Math.round(clamp(info.frac, 0, 1) * 100) + '%';
  if (H.abilBox.dataset.s !== info.state) { H.abilBox.dataset.s = info.state; H.abilBox.className = 'abil ' + info.state; }
  H.hAbHint.textContent = info.hint;
  const net = p.abilMul - 1;
  H.hMod.textContent = Math.abs(net) > 0.0005 ? (net > 0 ? '+' : '−') + pct(net) : '';
  H.hMod.className = net > 0 ? 'up' : net < 0 ? 'down' : '';
  H.speedfx.classList.toggle('on', p.boosting);
  const tp = Math.max(0, Math.round(p.tire));
  H.hTyre.style.width = (p.blown ? 100 : tp) + '%';
  H.tyreBox.className = 'tyres' + (p.blown ? ' blown' : tp < 25 ? ' low' : tp < 50 ? ' mid' : '');
  H.hTyrePct.textContent = p.blown ? 'FLAT' : tp + '%';
  const limOn = p.pitLim && p.pitT <= 0 && RACE.state === 'race';
  if (H.pitLim.hidden === limOn) H.pitLim.hidden = !limOn;
  if (limOn) H.pitLimTxt.textContent = p.pitDone ? '80 km/h' : 'stop in box ' + p.def.num;
  if (p.pitT > 0) { H.pitBox.hidden = false; H.hPitBar.style.width = Math.round((1 - p.pitT / (p.pitMax || PIT.time)) * 100) + '%'; } else if (!H.pitBox.hidden) H.pitBox.hidden = true;
  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) H.msg.innerHTML = ''; }
  hudT -= dt; if (hudT > 0) return; hudT = 0.1;
  const st = standings(), pos = st.indexOf(p) + 1, lapShown = clamp(Math.max(1, p.lap), 1, RACE.laps);
  H.hPos.textContent = pos; H.hPosOf.textContent = '/' + st.length;
  H.hLap.textContent = lapShown + '/' + RACE.laps; H.tLap.textContent = lapShown + '/' + RACE.laps;
  H.hTime.textContent = fmt(RACE.state === 'race' ? RACE.t : (p.finished ? p.finishTime : 0));
  H.hLast.textContent = p.lapTimes.length ? fmt(p.lapTimes[p.lapTimes.length - 1]) : '—';
  H.hBest.textContent = isFinite(p.best) ? fmt(p.best) : '—';
  // temporary effects with the time they have left
  const efs = effectList(p).slice(0, 7).map(([k, t, time]) => '<span class="eff ' + k + '">' + t + (time != null ? ' <em>' + time.toFixed(1) + ' s</em>' : '') + '</span>').join('');
  if (efs !== H.effHtml) { H.effHtml = efs; H.hEffs.innerHTML = efs; }
  const leader = st[0];
  st.forEach((b, i) => {
    const r = H.rows[i];
    r.p.textContent = i + 1; r.c.style.background = b.def.hud; r.n.textContent = b.driver ? b.driver.nick : b.def.model;
    let g = '';
    if (b.finished) g = i === 0 ? 'FINISH' : '+' + (b.finishTime - leader.finishTime).toFixed(3);
    else if (b.pitT > 0 || b.pitLim) g = 'PIT';
    else if (i === 0) g = 'LEADER';
    else if (leader.progress - b.progress > TRACK.L) g = '+1 LAP';
    else g = '+' + Math.max(0, b.gap).toFixed(3);
    r.g.textContent = g;
    r.el.classList.toggle('me', b === p); r.el.classList.toggle('fin', b.finished); r.el.classList.toggle('hum', !!b.human && b !== p);
  });
  H.tLeft.textContent = RACE.state === 'race' ? (p.lap >= RACE.laps ? 'FINAL LAP' : '') : '';
  drawMinimap();
}

// ---------- race setup ----------
function lineupS(i) { return 18; }
function setLineup() {
  RACE.buses.forEach((b, i) => { b.menuS = lineupS(i); b.menuLat = (i - 2.5) * 3.15; b.place(b.menuS, b.menuLat); b.ctrl.thr = 0; b.ctrl.steer = 0; b.boosting = false; resetAbil(b); resetTyres(b); });
  assignLineupDrivers();
}
function startRace() {
  SFX.init();
  if (NET.on) return;   // online races start from the lobby
  fadeTo(() => {
    const p = RACE.buses[RACE.busIdx];
    RACE.player = p;
    RACE.buses.forEach((b) => { b.isPlayer = b === p; b.human = b === p; b.remote = false; b.owner = null; b.net = null; });
    const chosen = DRIVERS[RACE.drvIdx], pool = shuffle(DRIVERS.filter((d) => d !== chosen));
    let pi = 0;
    RACE.buses.forEach((b) => setDriver(b, b === p ? chosen : pool[pi++]));
    const others = RACE.buses.filter((b) => b !== p);
    for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
    const order = others.concat([p]);
    const D = DIFF[RACE.diff];
    order.forEach((b, i) => {
      const g = W.grid[i];
      b.place(g.s - b.halfL - 0.4, g.lat);
      b.resetRace();
      b.ai.base = b.isPlayer ? 1 : rr(0.975, 1.0);
      b.vmul = b.isPlayer ? 1 : D.vmul * b.ai.base;
      b.ai.skill = D.skill * rr(0.96, 1.02); b.ai.greed = rr(0.6, 0.95); b.ai.stopDec = {}; b.ai.pitAt = rr(38, 46); b.ai.pit = false;
      b.cp = Math.floor(b.progress / 20);
    });
    finishRaceSetup(p, chosen);
    H.introHand.textContent = chosen.nick + ' drives the No. ' + p.def.num + ' ' + p.def.model + ' from the back of the grid. Go!';
  });
}
// shared by single races and online races, once every bus is on the grid
function finishRaceSetup(p, chosen) {
  RACE.firstPass = []; RACE.order = []; RACE.t = 0; RACE.resetCD = 0; RACE.stuckT = 0; RACE.extChecks = [];
  for (const s of W.stops) { s.got.clear(); s.anim = -1; s.backAt = 0; s.kids.forEach((k) => { k.visible = true; k.position.copy(k.userData.home); k.scale.setScalar(k.userData.sc); }); }
  CAM.yaw = p.yaw; CAM.hint = TRACK.globalNearest(p.x, p.z); CAM.lift = 0; CAM.ox = null;
  RACE.perf = { t: 0, n: 0, sum: 0, done: false };
  H.introTop.textContent = (NET.racing ? 'Online · ' : 'Round 1 · ') + 'Ankara · ' + RACE.laps + (RACE.laps === 1 ? ' lap' : ' laps') + ' · ' + (TRACK.L / 1000).toFixed(2) + ' km';
  H.introTitle.textContent = 'Anka Bilim Grand Prix';
  H.hDrvImg.src = chosen.photo; H.hDriver.style.setProperty('--dc', chosen.color); H.hDrvNick.textContent = chosen.nick;
  H.hDrvPassive.textContent = chosen.passive1.name + ' · ' + chosen.passive2.name;
  H.effHtml = ''; H.hEffs.innerHTML = '';
  clearAbilWorld(); clearPlayerFX(); SFX.stopSong();
  showScreen(null);
  setState('intro');
}
function setState(s) {
  RACE.state = s; RACE.stateT = 0;
  const racing = s === 'intro' || s === 'countdown' || s === 'race' || s === 'finish';
  H.hud.hidden = !racing;
  H.touch.hidden = !(racing && TOUCH);
  H.intro.hidden = s !== 'intro';
  H.lights.hidden = s !== 'countdown';
  H.hint.hidden = !(s === 'intro' || s === 'countdown');
  if (s === 'countdown') { RACE.lightsOn = 0; RACE.goAt = NET.racing && RACE.netGoAt ? RACE.netGoAt : 4.4 + rr(0.5, 1.3); H.lights.classList.remove('go'); H.lightEls.forEach((l) => l.classList.remove('on')); setGantryLights(0, false); }
  if (s !== 'race') H.wrong.hidden = true;
}
function tickCountdown(dt) {
  const t = RACE.stateT;
  const want = t < RACE.goAt ? Math.min(5, Math.floor((t - 0.4) / 0.8) + 1) : 0;
  if (t < RACE.goAt && want > RACE.lightsOn && want >= 1) {
    RACE.lightsOn = want; H.lightEls.forEach((l, i) => l.classList.toggle('on', i < want)); setGantryLights(want, false); SFX.light();
  }
  if (t >= RACE.goAt) {
    H.lights.classList.add('go'); H.lightEls.forEach((l) => l.classList.remove('on'));
    setGantryLights(5, true); SFX.go(); showMsg('GO!', 'Lights out', 'go', 1.2);
    setState('race'); H.lights.hidden = false; RACE.lightsOffAt = 1.4;
    H.hint.hidden = false; RACE.hintT = 6;
  }
}
Bus.prototype.crossLine = function () {
  this.lap++;
  if (this.lap >= 2) {
    const lt = RACE.t - this.lapStart; this.lapTimes.push(lt);
    const isBest = lt < this.best; this.best = Math.min(this.best, lt);
    if (this.isPlayer && !this.finished) {
      const key = 'best.' + this.def.id, pb = store.get(key, null);
      if (pb == null || lt < pb) store.set(key, lt);
      if (this.lap <= RACE.laps) toast((isBest && this.lapTimes.length > 1 ? 'Best lap ' : 'Lap ') + fmt(lt));
    }
  }
  this.lapStart = RACE.t;
  if (this.lap > RACE.laps && !this.finished) {
    // a pit penalty from Ali that was never served is added at the line
    this.finished = true; this.finishPen = this.pitPen; this.pitPen = 0; this.finishTime = RACE.t + this.finishPen; RACE.order.push(this);
    if (this.isPlayer) playerFinished();
  } else if (this.isPlayer && !this.finished) {
    if (this.lap === RACE.laps && RACE.laps > 1) showMsg('Final lap', 'Anka Bilim School is waiting', 'warn', 2);
    else if (this.lap > 1) showMsg('Lap ' + this.lap, 'of ' + RACE.laps, '', 1.4);
  }
};
function playerFinished() {
  const p = RACE.player, pos = standings().indexOf(p) + 1;
  setState('finish');
  SFX.cheer(); SFX.fanfare();
  showMsg(pos === 1 ? 'Winner!' : 'P' + pos, 'Finished at Anka Bilim School', pos === 1 ? 'go' : '', 3.2);
  p.vmul = 0.7;
}
function pickups() {
  const L = TRACK.L;
  for (const st of W.stops) {
    for (const b of RACE.buses) {
      if (b.remote || b.finished || b.lap < 1 || st.got.get(b) === b.lap) continue;   // after the finish line nobody collects any more
      const ds = Math.abs(((b.q.s - st.s + L * 1.5) % L) - L / 2);
      if (ds < 4.5 + b.halfL * 0.6 && Math.abs(b.q.d - st.lat) < 2.2 + b.halfW) {
        st.got.set(b, b.lap);
        pickupStudents(b, st.kids.length, st);
        if (b.isPlayer) {
          st.anim = 0; SFX.pickup();
          if (drvId(b) === 'ali') toast('Nom nom! Sweet meter ' + Math.round(b.meter) + '%');
          else toast('+' + st.kids.length + ' students · ' + b.bank + ' in total');
        }
      }
    }
  }
}
function animateStops(dt, time) {
  const p = RACE.player, racing = RACE.state === 'race' || RACE.state === 'finish';
  for (const st of W.stops) {
    st.marker.visible = RACE.state !== 'title' && RACE.state !== 'driver' && !(racing && p && st.got.get(p) === p.lap);
    st.marker.position.y = 6.5 + Math.sin(time * 3 + st.s) * 0.35;
    if (st.anim >= 0) {
      st.anim += dt;
      const k = Math.min(1, st.anim / 0.9);
      st.kids.forEach((kid, i) => {
        const kk = clamp(k * 1.3 - i * 0.06, 0, 1);
        kid.position.x = kid.userData.home.x + st.side * kk * 3.2;
        kid.position.y = kid.userData.home.y + Math.sin(kk * Math.PI) * 1.6;
        kid.scale.setScalar(kid.userData.sc * (1 - kk));
        kid.visible = kk < 1;
      });
      if (k >= 1) { st.anim = -1; st.backAt = RACE.t + 2.5; }
    } else if (st.backAt && RACE.t > st.backAt) {
      st.backAt = 0;
      st.kids.forEach((kid) => { kid.visible = true; kid.position.copy(kid.userData.home); kid.scale.setScalar(kid.userData.sc); });
    }
  }
}
function raceStep(dt) {
  RACE.t += dt;
  const all = RACE.buses;
  for (const b of all) {
    if (b.remote) { remoteStep(b, dt); continue; }   // online: driven on another device
    if (b.isPlayer && !b.finished) playerControls(b, dt); else aiDrive(b, dt, all);
    b.impactCD = Math.max(0, b.impactCD - dt);
    b.step(dt, b.ctrl);
  }
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) collideBuses(all[i], all[j]);
  for (const b of all) {
    if (!b.remote) {
      TRACK.project(b.x, b.z, b.hint, b.q); b.hint = b.q.idx;
      b.updateProgress();
      tyreStep(b, dt);
    }
    const cp = Math.floor(b.progress / 20);
    while (b.cp < cp) { b.cp++; const f = RACE.firstPass[b.cp]; if (f === undefined) { RACE.firstPass[b.cp] = RACE.t; b.gap = 0; } else b.gap = RACE.t - f; }
  }
  // gentle rubber band so rivals stay in the fight
  const p = RACE.player, D = DIFF[RACE.diff], ref = NET.racing ? leadHuman() : (p && !p.finished ? p : null);
  if (ref) for (const b of all) {
    if (b === ref || b.finished || b.remote || b.human) continue;
    const behind = clamp((ref.progress - b.progress) / 300, -1, 1);
    b.vmul = D.vmul * (1 + behind * (behind > 0 ? D.up : D.down)) * (b.ai.base || 1);
  }
  pickups();
  abilStep(dt);
  // player helpers: wrong way + stuck
  if (p && RACE.state === 'race') {
    const along = p.vx * p.q.tx + p.vz * p.q.tz;
    p.wrongT = along < -3 ? p.wrongT + dt : Math.max(0, p.wrongT - dt * 2);
    RACE.stuckT = p.speed < 1.2 && p.pitT <= 0 && !p.pitLim ? RACE.stuckT + dt : 0;
    RACE.resetCD = Math.max(0, RACE.resetCD - dt);
  }
}
function resetPlayer() {
  const p = RACE.player;
  if (!p || RACE.state !== 'race' || RACE.resetCD > 0) return;
  RACE.resetCD = 1.5; respawnBus(p); CAM.yaw = p.yaw; showMsg('', 'Back on track', '', 1.2);
}

// ---------- screens ----------
const SCREENS = ['scrTitle', 'scrAbout', 'scrDriver', 'scrSelect', 'scrPause', 'scrResults', 'scrOnline'];
function showScreen(id) { SCREENS.forEach((s) => { $(s).hidden = s !== id; }); const el = id && $(id).querySelector('.btn.primary, .arrow'); if (el && !TOUCH) setTimeout(() => el.focus({ preventScroll: true }), 30); }
function fadeTo(fn) { const f = $('fade'); f.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => f.classList.remove('on'), 60); }, 360); }
function goTitle() {
  if (NET.on) netClose();
  RACE.paused = false;
  fadeTo(() => { leaveRace(); setLineup(); RACE.player = null; setGantryLights(0, false); setState('title'); showScreen('scrTitle'); });
}
function goSelect() {
  SFX.init(); RACE.paused = false;
  const wasMenu = RACE.state === 'title' || RACE.state === 'about' || RACE.state === 'driver';
  const go = () => { leaveRace(); if (!wasMenu) setLineup(); setState('select'); showScreen('scrSelect'); renderSelect(); };
  if (wasMenu) go(); else fadeTo(go);
}
function assignLineupDrivers() {
  const chosen = DRIVERS[RACE.drvIdx], others = DRIVERS.filter((d) => d !== chosen);
  let k = 0;
  RACE.buses.forEach((b, i) => setDriver(b, i === RACE.busIdx ? chosen : others[k++]));
}
function leaveRace() {
  SFX.stopSong(); clearPlayerFX();
  RACE.buses.forEach((b) => resetAbil(b));
  clearAbilWorld();
}
function goDriver() {
  SFX.init(); RACE.paused = false;
  const wasMenu = RACE.state === 'title' || RACE.state === 'about' || RACE.state === 'select';
  const go = () => { leaveRace(); if (!wasMenu) setLineup(); setState('driver'); showScreen('scrDriver'); renderDriver(); };
  if (wasMenu) go(); else fadeTo(go);
}
function renderDriver() {
  const d = DRIVERS[RACE.drvIdx];
  document.querySelectorAll('#drvGrid .drv').forEach((el, i) => el.setAttribute('aria-pressed', String(i === RACE.drvIdx)));
  $('drvDetail').style.setProperty('--dc', d.color);
  $('dImg').src = d.photo; $('dImg').alt = d.name; $('dName').textContent = d.name; $('dNick').textContent = d.nick;
  const t = drvText(d);
  $('dAbName').textContent = t.ab.name; $('dAbCost').textContent = t.ab.cost; $('dAbDesc').textContent = t.ab.desc;
  $('dP1Name').textContent = t.p1.name; $('dP1Desc').textContent = t.p1.desc;
  $('dP2Name').textContent = t.p2.name; $('dP2Desc').textContent = t.p2.desc;
  const w = $('dWarn'); w.hidden = !d.warning; w.textContent = d.warning || '';
}
// let long camel-case nicknames wrap between their words ("Tosun|Kovalayan")
function nickNodes(el, nick) {
  el.textContent = '';
  let part = '';
  for (let i = 0; i < nick.length; i++) {
    const c = nick[i], prev = nick[i - 1] || '';
    if (part && c !== c.toLowerCase() && prev === prev.toLowerCase() && prev !== prev.toUpperCase()) { el.appendChild(document.createTextNode(part)); el.appendChild(document.createElement('wbr')); part = ''; }
    part += c;
  }
  el.appendChild(document.createTextNode(part));
}
function pickDriver(i) {
  RACE.drvIdx = (i + DRIVERS.length) % DRIVERS.length; store.set('drv', RACE.drvIdx);
  renderDriver(); assignLineupDrivers(); SFX.tone(700, 0.06, 'square', 0.05);
  const el = $('drv' + RACE.drvIdx); if (el && !TOUCH) el.focus({ preventScroll: true });
}
function renderSelect() {
  const d = BUSES[RACE.busIdx];
  const sel = $('scrSelect');
  sel.style.setProperty('--sw', d.hud);
  assignLineupDrivers();
  const dr = DRIVERS[RACE.drvIdx], sd = $('sDrv');
  sd.style.setProperty('--dc', dr.color);
  sd.innerHTML = '<img alt=""><span>Driver <b></b> &middot; ability: <span></span></span>';
  sd.querySelector('img').src = dr.photo; sd.querySelector('b').textContent = dr.nick; sd.querySelector('span span').textContent = dr.ability.name + ' (' + drvText(dr).ab.cost + ')';
  $('sNum').textContent = d.num; $('sCount').textContent = (RACE.busIdx + 1) + ' of ' + BUSES.length;
  $('sBrand').textContent = d.brand; $('sModel').textContent = d.model; $('sTag').textContent = d.tag; $('sDesc').textContent = d.desc;
  const labels = [['Top speed', 'speed'], ['Acceleration', 'accel'], ['Handling', 'handling'], ['Weight', 'weight']];
  $('sStats').innerHTML = labels.map(([l, k]) => '<div class="stat"><span>' + l + '</span><div class="bar">' + Array.from({ length: 10 }, (_, i) => '<i' + (i < d.stats[k] ? ' class="on"' : '') + '></i>').join('') + '</div><output>' + d.stats[k] + '</output></div>').join('');
  $('sDots').innerHTML = BUSES.map((b, i) => '<i' + (i === RACE.busIdx ? ' class="on"' : '') + '></i>').join('');
  const pb = store.get('best.' + d.id, null);
  $('sPB').textContent = pb != null ? 'Your best lap in the ' + d.model + ': ' + fmt(pb) : 'No lap set in the ' + d.model + ' yet.';
  document.querySelectorAll('#optLaps button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === RACE.laps)));
  document.querySelectorAll('#optDiff button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === RACE.diff)));
}
function pickBus(delta) { RACE.busIdx = (RACE.busIdx + delta + BUSES.length) % BUSES.length; store.set('bus', RACE.busIdx); renderSelect(); SFX.tone(700, 0.06, 'square', 0.05); }
function togglePause(force) {
  if (!(RACE.state === 'intro' || RACE.state === 'countdown' || RACE.state === 'race' || RACE.state === 'finish')) return;
  RACE.paused = force != null ? force : !RACE.paused;
  if (RACE.paused) { showScreen('scrPause'); SFX.engine(0, 0, false, false, 0, 0, 0); SFX.horn(false); SFX.stopSong(); SFX.rainLevel(0); refreshPauseLabels(); $('btnRestart').hidden = NET.racing; $('btnQuit').textContent = NET.on ? 'Leave room' : 'Quit to menu'; }
  else showScreen(null);
}
function refreshPauseLabels() {
  $('btnSound').textContent = 'Sound: ' + (SFX.muted ? 'off' : 'on');
  $('btnCam').textContent = 'Camera: ' + CAM_NAMES[CAM.mode];
  $('btnQual').textContent = 'Graphics: ' + RACE.quality;
}
function showResults() {
  setState('results');
  SFX.stopSong(); clearPlayerFX();
  H.hud.hidden = true; H.touch.hidden = true;
  showScreen('scrResults');
  // online: the host takes everybody back to the lobby, players wait for the host
  const mp = NET.on;
  $('btnAgain').hidden = mp && !NET.host; $('btnAgain').textContent = mp ? 'Back to lobby' : 'Race again';
  $('btnChange').hidden = mp; $('btnMenu').textContent = mp ? 'Leave room' : 'Main menu';
  $('rWait').hidden = !(mp && !NET.host);
  renderResults();
}
function renderResults() {
  const p = RACE.player, st = standings(), pos = st.indexOf(p) + 1;
  $('rTitle').textContent = pos === 1 ? 'You won the Anka Bilim GP!' : pos <= 3 ? 'On the podium' : 'Chequered flag';
  const big = $('rBig'); big.textContent = 'P' + pos; big.classList.toggle('win', pos === 1);
  $('rLaps').textContent = RACE.laps + (RACE.laps === 1 ? ' lap' : ' laps') + ' · ' + DIFF[RACE.diff].name;
  $('rTime').textContent = fmt(p.finishTime); $('rBest').textContent = fmt(isFinite(p.best) ? p.best : null); $('rStud').textContent = p.students;
  const lead = st[0];
  $('rBody').innerHTML = st.map((b, i) => {
    let t;
    if (b.finished) t = (i === 0 || !lead.finished ? fmt(b.finishTime) : fmt(b.finishTime) + ' <small style="color:var(--ink-3)">+' + (b.finishTime - lead.finishTime).toFixed(3) + '</small>') + (b.finishPen ? ' <small style="color:#ff8c7a">incl. ' + b.finishPen + ' s penalty</small>' : '');
    else t = '<span class="run">Running · lap ' + clamp(b.lap, 1, RACE.laps) + '/' + RACE.laps + '</span>';
    return '<tr class="' + (b === p ? 'me' : '') + '"><td class="p">' + (i + 1) + '</td><td><span class="nm"><i style="background:' + b.def.hud + '"></i><span>' + (b.driver ? b.driver.nick + ' \u00b7 ' : '') + b.def.brand + ' ' + b.def.model + ' <small>No. ' + b.def.num + (b === p ? ' · you' : '') + '</small></span></span></td><td>' + t + '</td><td>' + (isFinite(b.best) ? fmt(b.best) : '—') + '</td><td>' + (b.pitStops || 0) + '</td><td>' + b.students + '</td></tr>';
  }).join('');
}

// ---------- keyboard shortcuts ----------
function onKeyPress(e) {
  const s = RACE.state, code = e.code;
  const ae = document.activeElement;
  if ((code === 'Enter' || code === 'Space') && ae && ae.tagName === 'BUTTON' && !ae.closest('#touch')) return;
  if ((code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyN') && s === 'race') { tryPlayerAbility(); return; }
  if (s === 'driver') {
    if (code === 'ArrowLeft' || code === 'KeyA' || code === 'ArrowUp') pickDriver(RACE.drvIdx - 1);
    else if (code === 'ArrowRight' || code === 'KeyD' || code === 'ArrowDown') pickDriver(RACE.drvIdx + 1);
    else if (code === 'Enter') goSelect();
    else if (code === 'Escape') { setState('title'); showScreen('scrTitle'); }
    return;
  }
  if (code === 'KeyM') { SFX.init(); SFX.setMuted(!SFX.muted); if (RACE.paused) refreshPauseLabels(); return; }
  if (RACE.paused) { if (code === 'Escape' || code === 'KeyP') togglePause(false); return; }
  if (s === 'title') { if (code === 'Enter') { if (!$('btnStart').disabled) goDriver(); } return; }
  if (s === 'about') { if (code === 'Escape' || code === 'Enter') { setState('title'); showScreen('scrTitle'); } return; }
  if (s === 'select') {
    if (code === 'ArrowLeft' || code === 'KeyA') pickBus(-1);
    else if (code === 'ArrowRight' || code === 'KeyD') pickBus(1);
    else if (code === 'Enter') startRace();
    else if (code === 'Escape') goDriver();
    return;
  }
  if (s === 'online') { if (code === 'Escape') $('btnOnLeave').click(); return; }
  if (s === 'intro' && !NET.racing && (code === 'Enter' || code === 'Space')) { setState('countdown'); return; }
  if (code === 'Escape' || code === 'KeyP') { togglePause(); return; }
  if (code === 'KeyC') { CAM.ox = null; CAM.mode = (CAM.mode + 1) % 3; store.set('cam', CAM.mode); if (RACE.player) CAM.yaw = RACE.player.yaw; toast('Camera: ' + CAM_NAMES[CAM.mode]); return; }
  if (code === 'KeyR') { resetPlayer(); return; }
  if (s === 'results' && code === 'Enter') startRace();
}

// ---------- graphics quality ----------
function applyQuality(q) {
  RACE.quality = q; store.set('quality', q);
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(Math.min(dpr, q === 'high' ? 1.75 : q === 'medium' ? 1.25 : 1));
  const want = q !== 'low', size = q === 'high' ? 2048 : 1024;
  if (renderer.shadowMap.enabled !== want) { renderer.shadowMap.enabled = want; scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.needsUpdate = true; }); }); }
  sun.castShadow = want;
  if (sun.shadow.mapSize.x !== size) { sun.shadow.mapSize.set(size, size); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  resize();
}
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}

// ---------- main loop ----------
const FIXED = 1 / 120;
let acc = 0, last = 0, clock = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
  if (RACE.paused && !NET.racing) { renderer.render(scene, camera); return; }   // an online race keeps going under the menu
  clock += dt; RACE.stateT += dt;
  try { tick(dt); } catch (err) { if (!RACE.errLogged) { RACE.errLogged = true; console.error(err); } }
  renderer.render(scene, camera);
}
function tick(dt) {
  const s = RACE.state;
  if (s !== 'title' && s !== 'about') pollGamepad();
  if (s === 'race' || s === 'finish' || s === 'results') {
    acc += dt; let n = 0;
    while (acc >= FIXED && n < 14) { raceStep(FIXED); acc -= FIXED; n++; }
    if (n >= 14) acc = 0;
  } else acc = 0;
  netTick(dt);
  if (s === 'countdown') tickCountdown(dt);
  if (s === 'intro' && RACE.stateT > 3.6) setState('countdown');
  if (s === 'finish' && RACE.stateT > 3.8) showResults();
  if (s === 'results') { RACE.resT = (RACE.resT || 0) - dt; if (RACE.resT <= 0) { RACE.resT = 0.5; renderResults(); } }
  if (RACE.lightsOffAt > 0) { RACE.lightsOffAt -= dt; if (RACE.lightsOffAt <= 0) { H.lights.hidden = true; setGantryLights(0, false); } }
  if (RACE.hintT > 0) { RACE.hintT -= dt; if (RACE.hintT <= 0) H.hint.hidden = true; }
  updateVisuals(dt);
  updateCamera(dt);
  if (s === 'intro' || s === 'countdown' || s === 'race' || s === 'finish') updateHUD(dt);
  updateAudio();
  perfWatch(dt);
}
function updateVisuals(dt) {
  const s = RACE.state;
  if (s === 'title' || s === 'about' || s === 'select' || s === 'driver' || s === 'online') {
    RACE.buses.forEach((b, i) => {
      const target = s === 'select' && i === RACE.busIdx ? 25 : 18;
      const prev = b.menuS;
      b.menuS = lerp(b.menuS, target, Math.min(1, dt * 3));
      const p = TRACK.pointAt(b.menuS, b.menuLat, TMP);
      b.x = p.x; b.z = p.z; b.yaw = p.yaw; b.fwd = (b.menuS - prev) / Math.max(dt, 1e-3);
      b.braking = s === 'select' && Math.abs(b.menuS - target) < 0.4 && i === RACE.busIdx;
    });
  }
  for (const b of RACE.buses) { b.syncModel(dt); if (s === 'race' || s === 'finish' || s === 'results') emitFor(b, dt); }
  updateFX(dt);
  updateAbilFX(dt, clock);
  updateStunStars(clock);
  updateCoinsRings(dt);
  updatePitCrews(dt, clock);
  updateSparks(dt);
  updatePlayerFX(dt);
  W.crowdTime.value = clock;
  animateStops(dt, clock);
  if (W.flag) {
    const pos = W.flag.geometry.attributes.position, base = W.flagBase;
    for (let i = 0; i < pos.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; pos.setZ(i, Math.sin(x * 1.5 - clock * 5 + y * 0.3) * 0.22 * (x / 4.2) + Math.sin(x * 3.1 - clock * 7) * 0.05 * (x / 4.2)); }
    pos.needsUpdate = true; W.flag.geometry.computeVertexNormals();
  }
  if (W.cloudGroup) W.cloudGroup.position.x = Math.sin(clock * 0.01) * 40;
  const p = RACE.player;
  if (p && RACE.state !== 'results') {
    const wrong = RACE.state === 'race' && p.wrongT > 1;
    if (H.wrong.hidden === wrong) H.wrong.hidden = !wrong;
    if (RACE.state === 'race' && RACE.stuckT > 4 && !RACE.stuckHinted) { RACE.stuckHinted = true; toast(TOUCH ? (drvId(p) === 'volkan' ? 'Stuck? Reverse with GAS' : 'Stuck? Reverse with BRAKE') : 'Stuck? Press R to get back on track'); }
    if (RACE.stuckT === 0) RACE.stuckHinted = false;
  }
}
function updateCamera(dt) {
  const s = RACE.state;
  CAM.t += dt;
  if (s === 'title' || s === 'about' || s === 'driver' || s === 'online') {
    const t = CAM.t;
    TRACK.pointAt(44 + Math.sin(t * 0.13) * 5, Math.sin(t * 0.09) * 7, TMP);
    V1.set(TMP.x, 3.3 + Math.sin(t * 0.21) * 0.6, TMP.z);
    TRACK.pointAt(17, 0, TMP); V2.set(TMP.x, 1.9, TMP.z);
    applyCam(dt, V1, V2, k1(2.5, dt)); setFov(56);
  } else if (s === 'select') {
    const b = RACE.buses[RACE.busIdx], tall = camera.aspect < 0.85;
    TRACK.pointAt(b.menuS + (tall ? 13 : 8.5), b.menuLat + (tall ? 6.5 : 5.2), TMP); V1.set(TMP.x, tall ? 5.2 : 2.4, TMP.z);
    TRACK.pointAt(b.menuS - 0.5, b.menuLat - (tall ? 0 : 1.2), TMP); V2.set(TMP.x, tall ? -3.6 : -0.4, TMP.z);
    applyCam(dt, V1, V2, k1(3.2, dt)); setFov(50);
  } else if (s === 'intro') {
    const p = RACE.player, t = RACE.stateT;
    const g = W.grid[2];
    TRACK.pointAt(g.s - 10, 0, TMP);
    const cx = TMP.x, cz = TMP.z, a = TMP.yaw + 2.4 - t * 0.45;
    V1.set(cx + Math.sin(a) * (40 - t * 4), 24 - t * 4, cz + Math.cos(a) * (40 - t * 4));
    V2.set(cx, 1.5, cz);
    CAM.yaw = p.yaw;
    const cp = new THREE.Vector3(), cl = new THREE.Vector3(); chasePose(p, cp, cl, CAM.mode === 2 ? 0 : CAM.mode);
    CAM.ox = null;
    const k = clamp((t - 1.5) / 2.0, 0, 1), e = k * k * (3 - 2 * k);
    V1.lerp(cp, e); V2.lerp(cl, e);
    applyCam(dt, V1, V2, 1); setFov(62);
  } else if (RACE.player) {
    const p = RACE.player;
    let mode = CAM.mode;
    const portrait = clamp((1 - camera.aspect) / 0.5, 0, 1) * 16;
    cameraOcclusion(dt, mode !== 2 || s !== 'race');
    if (s === 'finish' || s === 'results') {
      const a = p.yaw + 2.4 + RACE.stateT * 0.25;
      V1.set(p.x + Math.sin(a) * 13, 4.2 + CAM.lift, p.z + Math.cos(a) * 13); V2.set(p.x, 1.6, p.z);
      clampToCircuit(V1);
      applyCam(dt, V1, V2, k1(3, dt)); setFov(58 + portrait);
    } else {
      CAM.yaw = lerpA(CAM.yaw, p.yaw, k1(mode === 2 ? 30 : 4.5, dt));
      chasePose(p, V1, V2, mode);
      if (mode !== 2) {
        if (mode === 0) V1.y += CAM.lift;
        const pull = 1 + clamp((p.fwd - p.st.vmax) / p.st.vmax, 0, 2) * 0.22, ox = (V1.x - p.x) * pull, oz = (V1.z - p.z) * pull, r = k1(9, dt);
        if (CAM.ox == null) { CAM.ox = ox; CAM.oy = V1.y; CAM.oz = oz; }
        CAM.ox = lerp(CAM.ox, ox, r); CAM.oy = lerp(CAM.oy, V1.y, r); CAM.oz = lerp(CAM.oz, oz, r);
        V1.set(p.x + CAM.ox, CAM.oy, p.z + CAM.oz);
        clampToCircuit(V1);
      }
      applyCam(dt, V1, V2, 1);
      const sr = clamp(p.fwd / p.st.vmax, 0, 1.3);
      CAM.fov = lerp(CAM.fov, 62 + sr * 9 + (p.boosting ? 8 : 0), k1(3, dt)); setFov(CAM.fov + portrait);
    }
  }
  if (!(s === 'race' || s === 'finish' || s === 'results')) cameraOcclusion(dt, false);
  skyMesh.position.copy(camera.position);
  camera.getWorldDirection(V2); const hl = Math.hypot(V2.x, V2.z) || 1;
  aimSun(camera.position.x + V2.x / hl * 55, camera.position.z + V2.z / hl * 55);
}
function updateAudio() {
  if (!SFX.ctx) return;
  const p = RACE.player, s = RACE.state;
  const on = !!p && (s === 'intro' || s === 'countdown' || s === 'race' || s === 'finish');
  if (!on) { SFX.engine(0, 0, false, false, 0, 0, 0); SFX.horn(false); return; }
  let rpm, load;
  if (s === 'race' || s === 'finish') {
    const v = Math.max(0, p.fwd), gears = [0, 12, 21, 30, 39, 48, 70];
    let gi = 0; while (gi < gears.length - 2 && v > gears[gi + 1]) gi++;
    rpm = clamp(0.22 + 0.78 * (v - gears[gi]) / (gears[gi + 1] - gears[gi]), 0, 1);
    load = p.ctrl.thr;
  } else { rpm = IN.up || IN.gpThr > 0.1 ? 0.55 + Math.random() * 0.1 : 0.12; load = IN.up ? 1 : 0; }
  const nearStart = Math.min(TRACK.wrapS(p.q.s), TRACK.L - TRACK.wrapS(p.q.s)) < 260 ? 1 : 0.25;
  SFX.engine(rpm, load, p.boosting, true, p.speed, clamp((Math.abs(p.slip) - 0.12) * 3, 0, 1) * (p.speed > 8 ? 1 : 0), nearStart);
  SFX.horn(IN.horn && s !== 'results');
  if ((s === 'race' || s === 'finish') && p.blown && p.speed > 3 && clock > (RACE.thumpAt || 0)) { SFX.tone(70, 0.06, 'square', 0.07); RACE.thumpAt = clock + Math.max(0.07, 2.2 / p.speed); }
  if (p.boosting && !p.wasBoosting) SFX.whoosh();
  p.wasBoosting = p.boosting;
}
function perfWatch(dt) {
  const pf = RACE.perf;
  if (RACE.state !== 'race' || pf.done) return;
  pf.t += dt; pf.sum += dt; pf.n++;
  if (pf.t > 4) {
    const avg = pf.sum / pf.n;
    if (avg > 0.034 && RACE.quality !== 'low') { applyQuality(RACE.quality === 'high' ? 'medium' : 'low'); toast('Graphics lowered for a smoother race'); pf.t = 0; pf.sum = 0; pf.n = 0; }
    else pf.done = true;
  }
}

// ---------- boot ----------
function wireUI() {
  $('btnStart').addEventListener('click', goDriver);
  $('btnAbout').addEventListener('click', () => { setState('about'); showScreen('scrAbout'); });
  $('btnAboutBack').addEventListener('click', () => { setState('title'); showScreen('scrTitle'); });
  $('sPrev').addEventListener('click', () => pickBus(-1));
  $('sNext').addEventListener('click', () => pickBus(1));
  $('btnRace').addEventListener('click', startRace);
  $('btnSelBack').addEventListener('click', goDriver);
  document.querySelectorAll('#optLaps button').forEach((b) => b.addEventListener('click', () => { RACE.laps = +b.dataset.v; store.set('laps', RACE.laps); renderSelect(); }));
  document.querySelectorAll('#optDiff button').forEach((b) => b.addEventListener('click', () => { RACE.diff = +b.dataset.v; store.set('diff', RACE.diff); renderSelect(); }));
  $('pauseBtn').addEventListener('click', () => togglePause(true));
  $('btnResume').addEventListener('click', () => togglePause(false));
  $('btnRestart').addEventListener('click', () => { RACE.paused = false; startRace(); });
  $('btnQuit').addEventListener('click', goTitle);
  $('btnSound').addEventListener('click', () => { SFX.init(); SFX.setMuted(!SFX.muted); refreshPauseLabels(); });
  $('btnCam').addEventListener('click', () => { CAM.ox = null; CAM.mode = (CAM.mode + 1) % 3; store.set('cam', CAM.mode); refreshPauseLabels(); });
  $('btnQual').addEventListener('click', () => { const q = ['high', 'medium', 'low']; applyQuality(q[(q.indexOf(RACE.quality) + 1) % 3]); RACE.perf.done = true; refreshPauseLabels(); });
  $('btnAgain').addEventListener('click', () => { if (NET.on) hostBackToLobby(); else startRace(); });
  $('btnChange').addEventListener('click', goDriver);
  const grid = $('drvGrid');
  DRIVERS.forEach((d, i) => {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'drv'; el.id = 'drv' + i; el.style.setProperty('--dc', d.color); el.setAttribute('aria-pressed', 'false');
    el.innerHTML = '<img alt=""><b></b><span></span>'; el.children[0].src = d.photo; el.children[0].alt = d.name; nickNodes(el.children[1], d.nick); el.children[2].textContent = d.name;
    el.addEventListener('click', () => pickDriver(i)); grid.appendChild(el);
  });
  $('btnDrvNext').addEventListener('click', goSelect);
  $('btnDrvBack').addEventListener('click', () => { setState('title'); showScreen('scrTitle'); });
  $('aboutDrivers').innerHTML = DRIVERS.map((d, i) => '<li><b>' + (i + 1) + '</b><span>' + d.nick + ' <em>\u2014 ' + d.name + ' \u00b7 ' + d.passive1.name + ', ' + d.passive2.name + ' \u00b7 ability: ' + d.ability.name + '</em></span></li>').join('');
  $('btnMenu').addEventListener('click', goTitle);
  ['tL', 'tR', 'tGas', 'tBrake', 'tBoost', 'tDrift'].forEach((id, i) => bindTouch(id, ['left', 'right', 'up', 'down', 'boost', 'hb'][i], id === 'tBoost' ? tryPlayerAbility : null));
  $('checkCard').addEventListener('pointerdown', (e) => { e.preventDefault(); pressCheck(); });
  $('gl').addEventListener('pointerdown', () => { SFX.init(); if (RACE.state === 'intro' && !NET.racing) setState('countdown'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !NET.racing && (RACE.state === 'race' || RACE.state === 'countdown')) togglePause(true); });
  wireOnline();
  addEventListener('resize', resize);
  $('aboutList').innerHTML = BUSES.map((b) => '<li><b>' + b.num + '</b><span>' + b.brand + ' ' + b.model + ' <em>— ' + b.tag + '</em></span></li>').join('');
  if (TOUCH) { document.body.classList.add('touch'); $('titleFoot').innerHTML = 'Pick one of nine drivers and one of six school buses. Pick up students at the yellow bus stops (5 per stop) and spend them on your driver\'s ability: tap ABILITY. Race online to race your friends, each on their own phone.'; }
}
async function boot(saved) {
  if (saved && typeof saved === 'object') {
    if (saved.busIdx >= 0 && saved.busIdx < BUSES.length) RACE.busIdx = saved.busIdx;
    if ([3, 6, 10].includes(saved.laps)) RACE.laps = saved.laps;
    if (saved.diff >= 0 && saved.diff <= 2) RACE.diff = saved.diff;
    if (saved.drvIdx >= 0 && saved.drvIdx < DRIVERS.length) RACE.drvIdx = saved.drvIdx;
  }
  const note = $('loadNote');
  if (!window.THREE) { note.textContent = 'The 3D engine could not load. Check your internet connection and reload the page.'; note.classList.add('err'); $('btnStart').textContent = 'Unavailable'; return; }
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([
        Promise.all([document.fonts.load('italic 900 40px Saira'), document.fonts.load('800 40px Saira'), document.fonts.load('40px "Permanent Marker"'), document.fonts.load('700 40px "Titillium Web"')]),
        new Promise((r) => setTimeout(r, 2500))
      ]);
    }
  } catch (e) { /* fonts optional */ }
  try {
    initRenderer();
    TAIL_ON.copy(col(0xff2a1a)); TAIL_OFF.copy(col(0x6a0909)); SMOKE.copy(col(0xe9e9e9)); DUST.copy(col(0xb49a74));
    buildWorld(); buildGyms();
    initFX(); initSparks();
    ensurePhotos();
    await loadFaces();
    initSuperFX(); initAbilFX();
    RACE.buses = BUSES.map((d) => new Bus(d, false));
    RACE.buses.forEach((b) => { b.resetRace(); });
    initHUD(); wireUI();
    setLineup();
    applyQuality(RACE.quality);
    setState('title'); showScreen('scrTitle');
    const bs = $('btnStart'); bs.disabled = false; bs.textContent = 'Start engines';
    note.hidden = true;
    requestAnimationFrame(frame);
  } catch (err) {
    console.error(err);
    note.textContent = 'Something went wrong while building the circuit: ' + (err && err.message ? err.message : err); note.classList.add('err');
  }
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ busIdx: RACE.busIdx, drvIdx: RACE.drvIdx, laps: RACE.laps, diff: RACE.diff })); } catch (e) { /* optional */ }
}
(function start() {
  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.ready === 'function') hot.ready((d) => boot(d || {}));
  else boot((hot && hot.data) || {});
})();
