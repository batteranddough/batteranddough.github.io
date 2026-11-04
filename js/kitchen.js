import * as THREE from 'three';

const F = window.BD;
const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const TAU = Math.PI * 2;
const pop = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t === 0 ? 0 : t === 1 ? 1 : 1 + Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)); };
const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));

function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
if (!hasWebGL()) { document.body.classList.add('no-webgl'); throw new Error('WebGL unavailable'); }

const phone = window.innerWidth < 700;
const SHADOW = phone ? 1024 : 2048;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------------- camera choreography: the day (hp) then the night (q), one continuous list ---------------- */
const DAY = F.DAY, Q0 = F.Q0, QL = F.QL;
const DAY_KEYS = [
  { t: 0.00, pos: [3.3, 2.1, 4.6], tgt: [-0.3, 1.0, -0.9] },
  { t: 0.17, pos: [2.9, 2.0, 4.3], tgt: [-0.3, 1.0, -0.9], hold: true },
  { t: 0.26, pos: [-1.0, 1.8, -0.1], tgt: [-2.4, 1.62, -2.6], arc: 0.5 },
  { t: 0.39, pos: [-1.15, 1.78, -0.25], tgt: [-2.4, 1.6, -2.6], hold: true },
  { t: 0.47, pos: [0.55, 2.5, 1.95], tgt: [0.05, 0.95, -0.1], arc: 0.45 },
  { t: 0.59, pos: [0.4, 2.4, 1.8], tgt: [0.05, 0.95, -0.1], hold: true },
  { t: 0.67, pos: [4.2, 1.6, -0.6], tgt: [2.7, 0.3, -2.1], arc: 0.3 },
  { t: 0.84, pos: [4.1, 1.55, -0.7], tgt: [2.7, 0.3, -2.1], hold: true },
  { t: 0.92, pos: [-2.2, 2.35, 4.8], tgt: [0.6, 1.0, -1.3], arc: 0.9 },
  { t: 1.00, pos: [-3.1, 2.6, 5.7], tgt: [0.9, 1.0, -1.6], hold: true }
];
const PROD_X = [-0.85, 0, 0.85];
const WIDE = { pos: [0.2, 2.0, 3.7], tgt: [0, 0.95, -0.2] };
const WIDE2 = { pos: [0.0, 1.95, 3.5], tgt: [0, 0.95, -0.2] };
const CLOSE = PROD_X.map(dx => ({ pos: [dx + 0.3, 1.4, 1.35], tgt: [dx - 0.05, 1.0, 0.0] }));
const CLOSE2 = CLOSE.map(c => ({ pos: [lerp(c.pos[0], c.tgt[0], 0.12), lerp(c.pos[1], c.tgt[1], 0.12), lerp(c.pos[2], c.tgt[2], 0.12)], tgt: c.tgt }));
const WORDS = ['BOMBOLONE', 'COOKIES', 'CINNAMON'];
const ACC = ['#F7CFD6', '#FAEBB4', '#CDEBDC'];
const NIGHT_KEYS = [{ t: 0.08, pos: WIDE.pos, tgt: WIDE.tgt, arc: 0.3 }];
for (let k = 0; k < 3; k++) {
  const b = Q0 + k * QL;
  NIGHT_KEYS.push({ t: b, pos: WIDE2.pos, tgt: WIDE2.tgt, hold: true });
  NIGHT_KEYS.push({ t: b + 0.08, pos: CLOSE[k].pos, tgt: CLOSE[k].tgt, arc: 0.4 });
  NIGHT_KEYS.push({ t: b + 0.22, pos: CLOSE2[k].pos, tgt: CLOSE2[k].tgt, hold: true });
  NIGHT_KEYS.push({ t: Math.min(1, b + 0.26), pos: WIDE.pos, tgt: WIDE.tgt, arc: 0.3 });
}
NIGHT_KEYS[NIGHT_KEYS.length - 1].t = 1.0;
const KEYS = DAY_KEYS.map(k => Object.assign({}, k, { t: k.t * DAY })).concat(NIGHT_KEYS.map(k => Object.assign({}, k, { t: DAY + k.t * (1 - DAY) })));

function seq(keys, t) {
  t = clamp01(t);
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  let s = clamp01((t - a.t) / Math.max(1e-6, b.t - a.t)), lift = 0;
  if (!b.hold) { s = s * s * (3 - 2 * s); lift = Math.sin(s * Math.PI) * (b.arc || 0); }
  return { pos: [lerp(a.pos[0], b.pos[0], s), lerp(a.pos[1], b.pos[1], s) + lift, lerp(a.pos[2], b.pos[2], s)], tgt: [lerp(a.tgt[0], b.tgt[0], s), lerp(a.tgt[1], b.tgt[1], s), lerp(a.tgt[2], b.tgt[2], s)] };
}

/* ---------------- hour-of-day curves (ambience only; nothing on screen tells the time) ---------------- */
function keyI(keys, x) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (x <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; const t = (x - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], t * t * (3 - 2 * t)); }
  return keys[keys.length - 1][1];
}
const K = arr => arr.map(([x, c]) => [x, new THREE.Color(c)]);
function colKey(keys, x, out) {
  if (x <= keys[0][0]) return out.copy(keys[0][1]);
  for (let i = 1; i < keys.length; i++) if (x <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; const t = (x - a[0]) / (b[0] - a[0]); return out.copy(a[1]).lerp(b[1], t * t * (3 - 2 * t)); }
  return out.copy(keys[keys.length - 1][1]);
}
const SUN_I = [[6.2, 0], [6.5, 2.4], [8, 3.4], [12, 3.8], [16, 3.2], [18, 2.2], [19, 0.5], [19.6, 0]];
const SUN_C = K([[6.5, 0xffa35a], [8, 0xffd2a0], [11, 0xfff3e2], [13, 0xffffff], [16, 0xffe6c4], [17.8, 0xff9a4a], [19, 0xff6a3a]]);
const HEM_I = [[6.5, 0.55], [12, 0.9], [17, 0.75], [19, 0.45], [20, 0.4]];
const HEM_C = K([[6.5, 0xffc9a0], [9, 0xcfe0ff], [12, 0xdbe9ff], [16, 0xd8d4e8], [18, 0xffb080], [19.4, 0x6a5a8a]]);
const HEM_G = K([[6.5, 0x8a6a50], [12, 0x9a8a78], [18, 0x8a6048], [19.4, 0x3a2a30]]);
const AMB_I = [[6.5, 0.5], [12, 0.45], [18, 0.5], [19.4, 0.35]];
const AMB_C = K([[6.5, 0xa07050], [12, 0xa09a98], [18, 0xa06a48], [19.4, 0x40385a]]);
const BG_C = K([[6.5, 0xf6dfc8], [12, 0xf7ead8], [17, 0xf2d8bc], [19.4, 0x3a2f4a]]);
const EXPO = [[6.5, 1.0], [12, 0.92], [17, 0.98], [19.4, 1.15]];
const LAMP_I = [[6.5, 0], [17.4, 0], [18.2, 0.5], [19.4, 1]];
const NIGHT_K = [[17.4, 0], [19.4, 1]];
const SKY_TOP = K([[6.5, 0x7a8fcf], [9, 0x5a95e8], [12, 0x4f8ae8], [16, 0x7f9fe0], [18, 0x6a5aa0], [19.4, 0x1c1e4a]]);
const SKY_HOR = K([[6.5, 0xffb070], [9, 0xe8eefc], [12, 0xdde8ff], [16, 0xf6e2c8], [18, 0xff8a50], [19.4, 0x5a3a6a]]);

/* ---------------- canvas textures ---------------- */
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function canvasTex(c, repeat) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t; }
function glowTexture() {
  const c = makeCanvas(256, 256), g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function tileTexture() {
  const c = makeCanvas(256, 256), g = c.getContext('2d');
  g.fillStyle = '#E7B7C0'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 128) {
    const ox = (y / 64) % 2 ? 64 : 0;
    g.fillStyle = '#FBE3E7'; rr(g, x + ox + 3, y + 3, 122, 58, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, x + ox + 12, y + 10, 60, 6, 3); g.fill();
    if (ox) { g.fillStyle = '#FBE3E7'; rr(g, x - 61, y + 3, 122, 58, 6); g.fill(); }
  }
  return canvasTex(c, [22, 3]);
}
function floorTexture() {
  const c = makeCanvas(256, 256), g = c.getContext('2d');
  g.fillStyle = '#EFDCC6'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#E9D3B8'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128);
  g.strokeStyle = 'rgba(120,80,50,.12)'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); g.strokeRect(128, 128, 128, 128); g.strokeRect(128, 0, 128, 128); g.strokeRect(0, 128, 128, 128);
  return canvasTex(c, [15, 15]);
}
function woodTexture() {
  const c = makeCanvas(256, 256), g = c.getContext('2d'); const r = rng(7);
  g.fillStyle = '#D9B48C'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(120,70,30,' + (0.06 + r() * 0.1) + ')'; g.lineWidth = 1 + r() * 2; g.beginPath(); const y = r() * 256; g.moveTo(0, y); g.bezierCurveTo(80, y + (r() - .5) * 20, 180, y + (r() - .5) * 20, 256, y); g.stroke(); }
  return canvasTex(c, [4, 1]);
}
function flourTexture() {
  const c = makeCanvas(256, 256), g = c.getContext('2d'); const r = rng(42);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) { const a = 0.25 + r() * 0.5; g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(214,180,140,' + a * 0.6 + ')'; const s = 1 + r() * 2.2; g.fillRect(r() * 256, r() * 256, s, s); }
  return canvasTex(c, [3, 2]);
}
let _grad;
function toonGradient() { if (_grad) return _grad; const d = new Uint8Array([150, 205, 240, 255]); _grad = new THREE.DataTexture(d, 4, 1, THREE.RedFormat); _grad.minFilter = _grad.magFilter = THREE.NearestFilter; _grad.needsUpdate = true; return _grad; }

/* ---------------- the chalkboard (chalk strokes drawn progressively during the mixer hold) ---------------- */
function makeBoard(redrawList) {
  const cw = 1024, ch = 640; const c = makeCanvas(cw, ch), g = c.getContext('2d'); const tex = canvasTex(c);
  const r = rng(11); const items = [];
  const INK = { w: '#FFF3E0', p: '#F7CFD6', m: '#CDEBDC', y: '#FAEBB4' };
  function path(pts, color, lw) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16)); for (let j = 1; j <= n; j++) { const t = j / n; out.push([lerp(a[0], b[0], t) + (j < n ? (r() - 0.5) * 2 : 0), lerp(a[1], b[1], t) + (j < n ? (r() - 0.5) * 2 : 0)]); } }
    let len = 0; const cum = [0]; for (let i = 1; i < out.length; i++) { len += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); cum.push(len); }
    items.push({ type: 'poly', pts: out, cum, len: Math.max(len, 1), w: Math.max(len, 1), color, lw });
  }
  const text = (s, x, y, size, col) => items.push({ type: 'text', s, x, y, size, color: col, w: s.length * size * 0.42 + 10 });
  text("Today's batch", 70, 110, 78, INK.w);
  path([[72, 136], [620, 130], [900, 138]], INK.p, 7);
  text('Bombolone', 90, 240, 66, INK.w); text('box of 3 · ₹81', 560, 240, 50, INK.y);
  text('Cookies', 90, 340, 66, INK.w); text('box of 4 · ₹108', 560, 340, 50, INK.y);
  text('Cinnamon rolls', 90, 440, 66, INK.w); text('box of 4 · ₹155', 560, 440, 50, INK.y);
  text('eggless or egg, always', 90, 550, 54, INK.m);
  path([[840, 540], [820, 520], [826, 498], [846, 500], [860, 516], [874, 500], [894, 498], [900, 520], [880, 540], [860, 560], [840, 540]], INK.p, 8);
  const total = items.reduce((s, it) => s + it.w, 0);
  function draw(prog) {
    g.fillStyle = '#3B2A22'; g.fillRect(0, 0, cw, ch);
    const gr = g.createLinearGradient(0, 0, cw, ch); gr.addColorStop(0, 'rgba(255,255,255,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
    g.lineCap = 'round'; g.lineJoin = 'round';
    let rem = prog * total;
    for (const it of items) {
      if (rem <= 0) break; const f = Math.min(1, rem / it.w); rem -= it.w;
      if (it.type === 'poly') {
        const d = f * it.len; g.strokeStyle = it.color; g.lineWidth = it.lw; g.beginPath(); g.moveTo(it.pts[0][0], it.pts[0][1]);
        for (let i = 1; i < it.pts.length; i++) { if (it.cum[i] <= d) g.lineTo(it.pts[i][0], it.pts[i][1]); else { const t = (d - it.cum[i - 1]) / Math.max(1e-6, it.cum[i] - it.cum[i - 1]); g.lineTo(lerp(it.pts[i - 1][0], it.pts[i][0], t), lerp(it.pts[i - 1][1], it.pts[i][1], t)); break; } }
        g.stroke();
      } else {
        g.font = '700 ' + it.size + 'px "Caveat", cursive'; g.fillStyle = it.color; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
        const mw = g.measureText(it.s).width;
        g.save(); g.beginPath(); g.rect(it.x - 8, it.y - it.size * 1.1, mw * f + 12, it.size * 1.6); g.clip(); g.fillText(it.s, it.x, it.y); g.restore();
      }
    }
    tex.needsUpdate = true;
  }
  let last = -1, cur = 0;
  const set = p => { cur = p; const q = Math.round(clamp01(p) * 90); if (q !== last) { last = q; draw(q / 90); } };
  redrawList.push(() => { last = -1; set(cur); });
  set(0);
  return { tex, set };
}

/* ---------------- shared materials and small builders ---------------- */
const std = (c, r = 0.85, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const GOLD = 0xD9A456, PALE = 0xF3DFC2, CHOC = 0x3B1F14, DOUGH = 0xF6E4C8, CINN = 0xB25B2C;

function makeCookie(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.092, 0.034, 24), mats.bake); body.position.y = 0.017; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const r = rng(Math.floor(Math.random() * 1e6));
  for (let i = 0; i < 7; i++) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.012, 0.018), mats.chip);
    const a = r() * TAU, d = 0.02 + r() * 0.06; chip.position.set(Math.cos(a) * d, 0.037, Math.sin(a) * d); chip.rotation.y = r() * TAU; chip.castShadow = true; g.add(chip);
  }
  return g;
}
function makeBombolone(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 18), mat); body.scale.set(1, 0.82, 1); body.position.y = 0.078; body.castShadow = true; g.add(body);
  const choc = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), std(CHOC, 0.45)); choc.scale.set(1, 0.6, 1); choc.position.y = 0.158; g.add(choc);
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.05, 8), std(CHOC, 0.45)); drip.position.set(0.012, 0.13, 0.02); g.add(drip);
  return g;
}
class Spiral extends THREE.Curve { getPoint(t, target = new THREE.Vector3()) { const r = 0.012 + t * 0.075, a = t * TAU * 2.6; return target.set(Math.cos(a) * r, 0, Math.sin(a) * r); } }
function makeRoll(bakeMat) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.065, 32), bakeMat); base.position.y = 0.0325; base.castShadow = true; g.add(base);
  const spiral = new THREE.Mesh(new THREE.TubeGeometry(new Spiral(), 90, 0.012, 8, false), std(CINN, 0.7)); spiral.position.y = 0.066; g.add(spiral);
  const ice = std(0xFFFFFF, 0.5);
  const icing = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), ice); icing.scale.set(1, 0.4, 1); icing.position.y = 0.072; g.add(icing);
  for (const [a, h] of [[0.4, 0.04], [2.3, 0.05], [4.1, 0.035]]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, h, 8), ice); d.position.set(Math.cos(a) * 0.095, 0.065 - h / 2, Math.sin(a) * 0.095); g.add(d); }
  const drizzle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.006, 6, 24), ice); drizzle.rotation.x = Math.PI / 2; drizzle.position.y = 0.072; drizzle.scale.set(1, 0.7, 1); g.add(drizzle);
  return g;
}

/* ---------------- Doughy, parameterised (same builder as the options page) ---------------- */
const STYLES = {
  A: { body: 0xF4D9B0, emissive: 0x3a2010, emissiveI: 0.22, eye: 'oval', cheeks: 1.15, mitt: 0xF7CFD6 },
  B: { body: 0xF2D2A2, emissive: 0x3a2010, emissiveI: 0.2, squash: [1.14, 0.92, 1.14], eye: 'round', eyeScale: 1.05, cheeks: 1, apron: 0xF7CFD6, hatBand: 0xE98A9A, mitt: 0xCDEBDC, hatScale: 1.05 },
  C: { body: 0xEFCFA6, emissive: 0xEFCFA6, emissiveI: 0.16, toon: true, outline: true, eye: 'arc', brows: false, mouth: 'open', cheeks: 1.2, mitt: 0xF7CFD6, hatBand: 0xFFFFFF },
  D: { body: 0xEBD3B0, emissive: 0x3a2010, emissiveI: 0.18, rough: 0.95, flour: true, lumpy: true, eye: 'dot', brows: false, mouth: 'tiny', cheeks: 0.9, hatTilt: -0.32, hatScale: 0.95, mitt: 0xFAEBB4 }
};
const STYLE_KEY = (new URLSearchParams(location.search).get('doughy') || 'C').toUpperCase();
function makeDoughy(style) {
  const S = Object.assign({ body: 0xF4D9B0, emissive: 0x3a2010, emissiveI: 0.22, rough: 0.72, squash: [1, 1, 1], eye: 'oval', eyeScale: 1, brows: true, cheeks: 1, cheekColor: 0xF2A7B6, apron: null, hatBand: 0xFFFFFF, hatTilt: -0.16, hatScale: 1, mitt: 0xF7CFD6, toon: false, outline: false, flour: false, mouth: 'smile', lumpy: false }, style || {});
  const mat = (c, r, extra) => S.toon ? new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: toonGradient() }, extra || {})) : new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r == null ? 0.8 : r, metalness: 0 }, extra || {}));
  const g = new THREE.Group();
  const bodyM = mat(S.body, S.rough, { emissive: S.emissive, emissiveIntensity: S.emissiveI });
  if (S.flour) { bodyM.map = flourTexture(); }
  const outlineM = new THREE.MeshBasicMaterial({ color: 0x4a2616, side: THREE.BackSide });
  const bodyG = new THREE.Group(); g.add(bodyG);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 40, 28), bodyM); body.castShadow = true; body.receiveShadow = true; bodyG.add(body);
  if (S.outline) { const o = new THREE.Mesh(body.geometry, outlineM); o.scale.setScalar(1.035); bodyG.add(o); }
  if (S.lumpy) { const r = rng(9); for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07 + r() * 0.05, 18, 14), bodyM); const a = r() * TAU, e = (r() - 0.3) * 1.2; b.position.set(Math.cos(a) * Math.cos(e) * 0.17, Math.sin(e) * 0.17 - 0.03, Math.sin(a) * Math.cos(e) * 0.17); b.castShadow = true; bodyG.add(b); } }
  bodyG.scale.set(S.squash[0], S.squash[1], S.squash[2]);
  if (S.apron) {
    const ap = new THREE.Mesh(new THREE.SphereGeometry(0.228, 32, 20, Math.PI / 2 - 0.85, 1.7, 1.25, 1.45), mat(S.apron, 0.9, { side: THREE.DoubleSide })); bodyG.add(ap);
    const heart = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), mat(0xE98A9A, 0.9)); heart.position.set(0, -0.06, 0.2255); bodyG.add(heart);
  }
  const face = new THREE.Group(); g.add(face);
  const inkM = mat(0x3B1F14, 0.4), whiteM = mat(0xFFFFFF, 0.3), cheekM = mat(S.cheekColor, 0.9);
  for (const sx of [-1, 1]) {
    if (S.eye === 'oval') {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03 * S.eyeScale, 16, 12), inkM); eye.scale.set(1, 1.3, 0.5); eye.position.set(sx * 0.075, 0.03, 0.205); face.add(eye);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(0.009 * S.eyeScale, 8, 8), whiteM); hi.position.set(sx * 0.075 + 0.01, 0.045, 0.223); face.add(hi);
    } else if (S.eye === 'round') {
      const w = new THREE.Mesh(new THREE.SphereGeometry(0.042 * S.eyeScale, 16, 12), whiteM); w.scale.set(1, 1.1, 0.45); w.position.set(sx * 0.078, 0.035, 0.2); face.add(w);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026 * S.eyeScale, 16, 12), inkM); eye.scale.set(1, 1.15, 0.5); eye.position.set(sx * 0.078 + sx * 0.004, 0.03, 0.218); face.add(eye);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(0.009 * S.eyeScale, 8, 8), whiteM); hi.position.set(sx * 0.078 + 0.012, 0.045, 0.232); face.add(hi);
    } else if (S.eye === 'arc') {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.03 * S.eyeScale, 0.009, 8, 16, Math.PI), inkM); arc.position.set(sx * 0.075, 0.03, 0.212); face.add(arc);
    } else {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022 * S.eyeScale, 14, 12), inkM); eye.scale.set(1, 1, 0.5); eye.position.set(sx * 0.07, 0.035, 0.212); face.add(eye);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), whiteM); hi.position.set(sx * 0.07 + 0.007, 0.045, 0.224); face.add(hi);
    }
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.034 * S.cheeks, 14, 10), cheekM); cheek.scale.set(1, 0.72, 0.3); cheek.position.set(sx * 0.135, -0.035, 0.172); face.add(cheek);
    if (S.brows) { const brow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.011, 0.01), inkM); brow.position.set(sx * 0.075, 0.09, 0.198); brow.rotation.z = sx * -0.25; face.add(brow); }
  }
  if (S.mouth === 'smile') { const m = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 20, Math.PI), inkM); m.rotation.z = Math.PI; m.position.set(0, -0.04, 0.2); face.add(m); }
  else if (S.mouth === 'open') { const m = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), inkM); m.scale.set(1, 0.7, 0.35); m.position.set(0, -0.055, 0.207); face.add(m); const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), mat(0xE98A9A, 0.6)); tongue.scale.set(1, 0.6, 0.4); tongue.position.set(0, -0.068, 0.214); face.add(tongue); }
  else { const m = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 14, Math.PI), inkM); m.rotation.z = Math.PI; m.position.set(0, -0.045, 0.205); face.add(m); }
  const hat = new THREE.Group(); g.add(hat);
  const cloth = mat(0xFFFFFF, 1.0), bandM = mat(S.hatBand, 0.9);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.07, 24), bandM); band.position.y = 0.035; band.castShadow = true; hat.add(band);
  for (const [x, y, z, rad] of [[0, 0.1, 0, 0.11], [0.08, 0.1, 0.02, 0.085], [-0.08, 0.1, 0.01, 0.085], [0.0, 0.11, 0.085, 0.08], [0.0, 0.1, -0.085, 0.08]]) { const p = new THREE.Mesh(new THREE.SphereGeometry(rad, 18, 14), cloth); p.position.set(x, y, z); p.castShadow = true; hat.add(p); if (S.outline) { const o = new THREE.Mesh(p.geometry, outlineM); o.scale.setScalar(1.05); p.add(o); } }
  hat.position.set(0, 0.17 * S.squash[1], 0); hat.rotation.z = S.hatTilt; hat.scale.setScalar(S.hatScale);
  const arms = {};
  const mittM = mat(S.mitt, 0.9);
  for (const [name, sx] of [['L', -1], ['R', 1]]) {
    const arm = new THREE.Group(); arm.position.set(sx * 0.185 * S.squash[0], 0.0, 0.07); g.add(arm);
    const geo = new THREE.CylinderGeometry(0.038, 0.034, 0.15, 12); geo.translate(0, -0.075, 0);
    const limb = new THREE.Mesh(geo, bodyM); limb.castShadow = true; arm.add(limb);
    const mitt = new THREE.Mesh(new THREE.SphereGeometry(0.058, 18, 14), mittM); mitt.position.y = -0.165; mitt.scale.set(1, 0.95, 0.8); mitt.castShadow = true; arm.add(mitt);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), mittM); thumb.position.set(sx * -0.045, -0.14, 0.03); arm.add(thumb);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 8, 18), mat(0xFFFFFF, 0.9)); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.118; arm.add(cuff);
    if (S.outline) { const o = new THREE.Mesh(mitt.geometry, outlineM); o.scale.setScalar(1.07); mitt.add(o); }
    arm.rotation.set(0.25, 0, sx * 0.55);
    arms[name] = arm;
  }
  g.userData = { bodyG, body, bodyM, face, hat, arms, S, SQ: new THREE.Vector3(S.squash[0], S.squash[1], S.squash[2]) };
  return g;
}
const POSES = {
  idle: { L: [0.25, -0.55], R: [0.25, 0.55] }, carry: { L: [-1.25, -0.1], R: [-1.25, 0.1] }, reach: { L: [-1.6, -0.08], R: [-1.6, 0.08] },
  roll: { L: [-1.2, -0.25], R: [-1.2, 0.25] }, wave: { L: [0.25, -0.55], R: [-2.4, 0.7] }, present: { L: [-0.9, -0.9], R: [-0.9, 0.9] }, work: { L: [0.0, -1.9], R: [0.25, 0.55] }
};
function setPose(d, name, k) { const P = POSES[name], A = d.userData.arms; for (const s of ['L', 'R']) { A[s].rotation.x += (P[s][0] - A[s].rotation.x) * k; A[s].rotation.z += (P[s][1] - A[s].rotation.z) * k; } }

function makeMixer() {
  const g = new THREE.Group(); const mint = std(0x9FD1B6, 0.5, 0.1);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.26), mint); base.position.y = 0.04; base.castShadow = true; g.add(base);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.14), mint); post.position.set(0.1, 0.22, -0.04); post.castShadow = true; g.add(post);
  const head = new THREE.Group(); head.position.set(0.1, 0.4, -0.04);
  const hm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.16), mint); hm.position.set(-0.12, 0.0, 0.0); hm.castShadow = true; head.add(hm);
  const whisk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8), std(0x8A8A8A, 0.4, 0.6)); whisk.position.set(-0.26, -0.14, 0.02); head.add(whisk);
  g.add(head);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.17, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xE4E7EC, roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide })); bowl.position.set(-0.16, 0.165, 0.02); g.add(bowl);
  const bowlBottom = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), std(0xD0D4DA, 0.5, 0.3)); bowlBottom.rotation.x = -Math.PI / 2; bowlBottom.position.set(-0.16, 0.082, 0.02); g.add(bowlBottom);
  const dough = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), std(DOUGH, 0.8)); dough.scale.set(1.2, 0.5, 1.2); dough.position.set(-0.16, 0.14, 0.02); dough.visible = false; g.add(dough);
  g.userData = { head, whisk, dough };
  return g;
}
function makeJar(h, color, lid) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, h, 16), new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, opacity: 0.92, transparent: true })); body.position.y = h / 2; body.castShadow = true; g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 16), std(lid || 0x5A2E1C, 0.6)); top.position.y = h + 0.015; g.add(top);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), std(0xFFF9F3, 0.9)); label.position.set(0, h * 0.5, 0.061); g.add(label);
  return g;
}
function makePlant() {
  const g = new THREE.Group(); const pr = rng(3);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 16), std(0xE9A3B2, 0.8)); pot.position.y = 0.07; pot.castShadow = true; g.add(pot);
  const leafM = std(0x5F8F6A, 0.9);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.045 + pr() * 0.04, 10, 8), leafM); s.position.set((pr() - 0.5) * 0.16, 0.18 + pr() * 0.14, (pr() - 0.5) * 0.16); s.castShadow = true; g.add(s); }
  return g;
}
function makeStand() {
  const g = new THREE.Group(); const m = std(0xFFF9F3, 0.4);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.02, 24), m); foot.position.y = 0.01; g.add(foot);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 12), m); stem.position.y = 0.08; g.add(stem);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 32), m); plate.position.y = 0.147; plate.castShadow = true; plate.receiveShadow = true; g.add(plate);
  return g;
}
function makeBox(w, h, d, color) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(color, 0.85)); b.position.y = h / 2; b.castShadow = true; b.receiveShadow = true; g.add(b);
  const rib = std(0xFFF9F3, 0.7);
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.004, h + 0.004, 0.03), rib); r1.position.y = h / 2; g.add(r1);
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, h + 0.004, d + 0.004), rib); r2.position.y = h / 2; g.add(r2);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 16), rib); bow.rotation.x = Math.PI / 2; bow.position.y = h + 0.01; g.add(bow);
  return g;
}

/* ---------------- the kitchen ---------------- */
function buildKitchen(renderer) {
  const redraw = [];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6dfc8);
  scene.fog = new THREE.FogExp2(0xf6dfc8, 0.028);

  const W = 9, D = 6, H = 3, ZB = -D / 2, ZF = 6, DZ = ZF - ZB, ZC = (ZF + ZB) / 2;
  const glowTex = glowTexture();
  const lampSprites = [];
  const addSprite = (x, y, z, color, op, sx, sy, lamp) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.position.set(x, y, z); sp.scale.set(sx, sy || sx, 1); scene.add(sp);
    if (lamp) lampSprites.push({ sp, base: op });
    return sp;
  };

  // floor, ceiling, walls
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, DZ), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.75 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = ZC; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, DZ), std(0xF6EBDF, 1.0)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, ZC); ceil.material.emissive.setHex(0x3a2418); ceil.material.emissiveIntensity = 0.32; scene.add(ceil);
  const wallMat = std(0xFBF1E6, 0.95);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat); backWall.position.set(0, H / 2, -D / 2); backWall.receiveShadow = true; scene.add(backWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(DZ, H), wallMat); rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(W / 2, H / 2, ZC); rightWall.receiveShadow = true; scene.add(rightWall);
  const ghost = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, H, 0.2), ghost); frontWall.position.set(0, H / 2, ZF + 0.1); frontWall.castShadow = true; scene.add(frontWall);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.1, DZ + 0.6), ghost); roof.position.set(0, H + 0.05, ZC); roof.castShadow = true; scene.add(roof);
  // left wall with a window
  const WZ = -0.6, WW = 2.0, WY0 = 1.05, WY1 = 2.35;
  const seg = (x, y, z, sx, sy, sz, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat || wallMat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  const lx = -W / 2 - 0.1;
  seg(lx, WY0 / 2, ZC, 0.2, WY0, DZ); seg(lx, (WY1 + H) / 2, ZC, 0.2, H - WY1, DZ);
  seg(lx, (WY0 + WY1) / 2, (ZB + (WZ - WW / 2)) / 2, 0.2, WY1 - WY0, (WZ - WW / 2) - ZB);
  seg(lx, (WY0 + WY1) / 2, ((WZ + WW / 2) + ZF) / 2, 0.2, WY1 - WY0, ZF - (WZ + WW / 2));
  const frameMat = std(0xFFFFFF, 0.6);
  seg(lx + 0.06, WY0 + 0.03, WZ, 0.1, 0.06, WW + 0.1, frameMat); seg(lx + 0.06, WY1 - 0.03, WZ, 0.1, 0.06, WW + 0.1, frameMat);
  seg(lx + 0.06, (WY0 + WY1) / 2, WZ, 0.1, WY1 - WY0, 0.06, frameMat); seg(lx + 0.06, (WY0 + WY1) / 2, WZ - WW / 2, 0.1, WY1 - WY0, 0.06, frameMat); seg(lx + 0.06, (WY0 + WY1) / 2, WZ + WW / 2, 0.1, WY1 - WY0, 0.06, frameMat);
  seg(lx + 0.12, WY0 - 0.02, WZ, 0.3, 0.05, WW + 0.3, std(0xE8CFA8, 0.8));
  const skyGeo = new THREE.PlaneGeometry(WW + 1, WY1 - WY0 + 1, 1, 8);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(18 * 3), 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); sky.position.set(-W / 2 - 0.5, (WY0 + WY1) / 2, WZ); sky.rotation.y = Math.PI / 2; scene.add(sky);
  const skC = makeCanvas(256, 128), skG = skC.getContext('2d'); { const r2 = rng(9); let x = 0; while (x < 256) { const bw = 14 + r2() * 26, bh = 20 + r2() * 50; skG.fillStyle = '#ffffff'; skG.fillRect(x, 128 - bh, bw - 2, bh); x += bw; } }
  const skyline = new THREE.Mesh(new THREE.PlaneGeometry(WW + 1, (WY1 - WY0 + 1) * 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skC), transparent: true, fog: false, color: 0x8a7a84 })); skyline.position.set(-W / 2 - 0.45, WY0 + 0.2, WZ); skyline.rotation.y = Math.PI / 2; scene.add(skyline);
  const sunSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); sunSp.scale.set(1.6, 1.6, 1); scene.add(sunSp);

  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.9), new THREE.MeshStandardMaterial({ map: tileTexture(), roughness: 0.35 })); tiles.position.set(0, 0.9 + 0.45, -D / 2 + 0.01); tiles.receiveShadow = true; scene.add(tiles);

  // counters
  const counterTop = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.6 });
  const cabMat = std(0xC99A66, 0.8);
  function counter(x, z, w, d, h) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.04, d - 0.04), cabMat); cab.position.set(x, (h - 0.04) / 2, z); cab.castShadow = true; cab.receiveShadow = true; scene.add(cab);
    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.04, d + 0.04), counterTop); top.position.set(x, h - 0.02, z); top.castShadow = true; top.receiveShadow = true; scene.add(top);
    const doorM = std(0xB88A68, 0.8); const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 0; i < n; i++) { const dw = w / n - 0.06; const door = new THREE.Mesh(new THREE.BoxGeometry(dw, h - 0.2, 0.02), doorM); door.position.set(x - w / 2 + (i + 0.5) * (w / n), (h - 0.2) / 2 + 0.02, z + d / 2 - 0.01); scene.add(door); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), std(0x5A2E1C, 0.5)); knob.position.set(door.position.x + dw / 2 - 0.08, h / 2, z + d / 2 + 0.012); scene.add(knob); }
  }
  const CH = 0.9;
  counter(-1.025, -2.65, 6.95, 0.7, CH);
  counter(4.0, -2.65, 1.0, 0.7, CH);
  counter(0, 0, 2.4, 1.1, CH);

  // the oven: a hollow body so the cavity is really open at the front
  const OX = 2.95, OZ = -2.65;
  const ovenM = std(0x3B2A22, 0.55, 0.2);
  const OB = CH - 0.04;
  const ovenPart = (sx, sy, sz, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), ovenM); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  ovenPart(1.0, OB, 0.06, OX, OB / 2, OZ - 0.30);
  ovenPart(0.1, OB, 0.66, OX - 0.45, OB / 2, OZ); ovenPart(0.1, OB, 0.66, OX + 0.45, OB / 2, OZ);
  ovenPart(1.0, 0.17, 0.66, OX, 0.085, OZ); ovenPart(1.0, OB - 0.67, 0.66, OX, (OB + 0.67) / 2, OZ);
  const ovenTop = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.04, 0.74), std(0x2A1D18, 0.4, 0.5)); ovenTop.position.set(OX, CH - 0.02, OZ); scene.add(ovenTop);
  for (const [dx, c] of [[-0.3, 0xE98A9A], [-0.18, 0xCDEBDC], [-0.06, 0xFAEBB4]]) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), std(c, 0.5)); kn.rotation.x = Math.PI / 2; kn.position.set(OX + dx, CH - 0.1, OZ + 0.34); scene.add(kn); }
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.05), std(0xD9A456, 0.5, 0.5)); plate.position.set(OX + 0.25, CH - 0.1, OZ + 0.335); scene.add(plate);
  const cavInner = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.56), new THREE.MeshStandardMaterial({ color: 0x33221a, roughness: 0.9, side: THREE.BackSide })); cavInner.position.set(OX, 0.42, OZ - 0.02); scene.add(cavInner);
  const ovenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.46), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0, fog: false })); ovenGlow.position.set(OX, 0.42, OZ - 0.29); scene.add(ovenGlow);
  const ovenLight = new THREE.PointLight(0xff8a2a, 0, 1.8, 2); ovenLight.position.set(OX, 0.55, OZ + 0.05); scene.add(ovenLight);
  const rackM = std(0x8a8a8a, 0.4, 0.7);
  for (let i = -3; i <= 3; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.5), rackM); bar.position.set(OX + i * 0.1, 0.295, OZ - 0.02); scene.add(bar); }
  for (const dz of [-0.22, 0.2]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.012, 0.012), rackM); bar.position.set(OX, 0.295, OZ + dz); scene.add(bar); }
  const ovenSp = addSprite(OX, 0.45, OZ + 0.3, 0xff8a2a, 0, 1.4, 1.0);
  const door = new THREE.Group(); door.position.set(OX, 0.17, OZ + 0.33); scene.add(door);
  const doorM = std(0x2A1D18, 0.45, 0.4);
  for (const [w, h, x, y] of [[0.9, 0.1, 0, 0.51], [0.9, 0.1, 0, 0.05], [0.1, 0.56, -0.4, 0.28], [0.1, 0.56, 0.4, 0.28]]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), doorM); bar.position.set(x, y, 0); bar.castShadow = true; door.add(bar); }
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.36), new THREE.MeshPhysicalMaterial({ color: 0x8a6a5a, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.3, side: THREE.DoubleSide })); doorGlass.position.set(0, 0.28, 0); door.add(doorGlass);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.7, 10), std(0xBBBBBB, 0.35, 0.8)); handle.rotation.z = Math.PI / 2; handle.position.set(0, 0.5, 0.06); door.add(handle);
  for (const s of [-1, 1]) { const hb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.06), std(0xBBBBBB, 0.35, 0.8)); hb.position.set(s * 0.33, 0.5, 0.035); door.add(hb); }
  const steam = [addSprite(0, 0, 0, 0xffffff, 0, 0.3, 0.5), addSprite(0, 0, 0, 0xffffff, 0, 0.26, 0.44)];

  // chalkboard, mixer, flour
  const board = makeBoard(redraw);
  const BX = -2.3;
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: board.tex, roughness: 0.9 })); boardMesh.position.set(BX, 2.1, -D / 2 + 0.03); scene.add(boardMesh);
  const bfm = std(0xC9955E, 0.7);
  for (const [w, h, x, y] of [[1.7, 0.06, BX, 2.63], [1.7, 0.06, BX, 1.57], [0.06, 1.1, BX - 0.83, 2.1], [0.06, 1.1, BX + 0.83, 2.1]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), bfm); b.position.set(x, y, -D / 2 + 0.04); b.castShadow = true; scene.add(b); }
  const mixer = makeMixer(); mixer.position.set(-2.95, CH, -2.65); scene.add(mixer);
  const bowlDough = []; { const r = rng(21); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), std(DOUGH, 0.8)); b.position.set(-3.3 + i * 0.16, CH + 0.06, -2.35 + (r() - 0.5) * 0.1); b.scale.setScalar(0.001); b.castShadow = true; scene.add(b); bowlDough.push(b); } }
  const flourBag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.1), std(0xFFF9F3, 0.95)); flourBag.position.set(-3.6, CH + 0.13, -2.7); flourBag.castShadow = true; scene.add(flourBag);
  const bagLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), std(0xE98A9A, 0.9)); bagLabel.position.set(-3.6, CH + 0.14, -2.649); scene.add(bagLabel);
  const flour = []; for (let i = 0; i < 8; i++) flour.push(addSprite(-3.0, CH + 0.3, -2.5, 0xffffff, 0, 0.3, 0.3));

  // shelves, print, a pinned recipe card (decor only; no clock in this kitchen)
  const shelfM = std(0xC9955E, 0.7);
  for (const [x, y] of [[-0.3, 1.75], [-0.3, 2.25]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.26), shelfM); s.position.set(x, y, -D / 2 + 0.13); s.castShadow = true; s.receiveShadow = true; scene.add(s); }
  const jarDefs = [[-0.85, 1.77, 0.18, 0xFAEBB4], [-0.65, 1.77, 0.22, 0xF7CFD6], [-0.42, 1.77, 0.26, 0xFFF9F3, 0xC9955E], [-0.18, 1.77, 0.2, 0xCDEBDC], [0.06, 1.77, 0.17, 0xE8B86D], [-0.8, 2.27, 0.2, 0xB25B2C], [-0.54, 2.27, 0.24, 0xFFF9F3, 0xC9955E], [-0.28, 2.27, 0.19, 0xF7CFD6], [0.0, 2.27, 0.22, 0xFAEBB4]];
  for (const [x, y, h, c, lid] of jarDefs) { const j = makeJar(h, c, lid); j.position.set(x, y, -D / 2 + 0.14); scene.add(j); }
  const frame2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.04), bfm); frame2.position.set(1.5, 2.1, -D / 2 + 0.03); scene.add(frame2);
  const print = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.54), std(0xF7CFD6, 0.9)); print.position.set(1.5, 2.1, -D / 2 + 0.055); scene.add(print);
  const printHeart = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), std(0xE98A9A, 0.9)); printHeart.position.set(1.5, 2.12, -D / 2 + 0.056); scene.add(printHeart);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), std(0xFFF9F3, 0.9)); card.position.set(2.95, 2.15, -D / 2 + 0.03); card.rotation.z = 0.06; scene.add(card);
  for (let i = 0; i < 4; i++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.22 - i * 0.03, 0.014), std(0xB08A74, 0.9)); ln.position.set(2.92 - i * 0.015, 2.21 - i * 0.045, -D / 2 + 0.032); ln.rotation.z = 0.06; scene.add(ln); }
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), std(0xE98A9A, 0.5)); pinHead.position.set(2.95, 2.26, -D / 2 + 0.045); scene.add(pinHead);

  // string lights, pendants (either side of the room, out of every shot's path)
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xFFE9A8 }); const bulbBase = new THREE.Color(0xFFE9A8);
  const wirePts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; wirePts.push(new THREE.Vector3(-W / 2 + t * W, H - 0.25 - Math.abs(Math.sin(t * Math.PI * 4)) * 0.16, -D / 2 + 0.06)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts), new THREE.LineBasicMaterial({ color: 0x5A2E1C })));
  for (let i = 0; i < 13; i++) { const t = (i + 0.5) / 13; const y = H - 0.25 - Math.abs(Math.sin(t * Math.PI * 4)) * 0.16 - 0.06; const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), bulbMat); b.position.set(-W / 2 + t * W, y, -D / 2 + 0.08); scene.add(b); addSprite(b.position.x, y, b.position.z + 0.04, 0xFFD27A, 0.45, 0.5, 0.5, true); }
  const pendantLights = [];
  for (const x of [-2.9, 2.9]) {
    const PZ = -1.3;
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.0, 6), std(0x3B1F14, 0.8)); cord.position.set(x, H - 0.5, PZ); scene.add(cord);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xE98A9A, roughness: 0.6, side: THREE.DoubleSide })); shade.position.set(x, H - 1.05, PZ); shade.castShadow = true; scene.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), bulbMat); bulb.position.set(x, H - 1.12, PZ); scene.add(bulb);
    addSprite(x, H - 1.14, PZ, 0xFFD27A, 0.5, 0.9, 0.9, true);
    const pl = new THREE.PointLight(0xFFD2A0, 0, 4.5, 2); pl.position.set(x, H - 1.15, PZ); scene.add(pl); pendantLights.push(pl);
  }
  const plant = makePlant(); plant.position.set(-3.9, CH, -2.5); scene.add(plant);
  const plant2 = makePlant(); plant2.position.set(4.2, CH, -2.75); scene.add(plant2);

  // the tray, the dough sheet, the rolling pin, a bowl and a spoon on the island
  const bakeMat = std(PALE, 0.85), chipMat = std(CHOC, 0.5);
  const TW = 0.7, TD = 0.48;
  const tray = new THREE.Group(); scene.add(tray);
  const trayMat = std(0x9A9A9A, 0.35, 0.7);
  const trayMesh = new THREE.Mesh(new THREE.BoxGeometry(TW, 0.02, TD), trayMat); trayMesh.position.y = 0.01; trayMesh.castShadow = true; trayMesh.receiveShadow = true; tray.add(trayMesh);
  for (const s of [-1, 1]) { const lipX = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, TD), trayMat); lipX.position.set(s * (TW / 2 - 0.01), 0.0175, 0); tray.add(lipX); const lipZ = new THREE.Mesh(new THREE.BoxGeometry(TW, 0.035, 0.02), trayMat); lipZ.position.set(0, 0.0175, s * (TD / 2 - 0.01)); tray.add(lipZ); }
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.06, TD - 0.06), std(0xF6EBDD, 0.95)); paper.rotation.x = -Math.PI / 2; paper.position.y = 0.021; paper.receiveShadow = true; tray.add(paper);
  const sheet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), std(DOUGH, 0.8)); sheet.scale.set(1.3, 0.3, 1); sheet.position.set(0, 0.02, 0); sheet.castShadow = true; tray.add(sheet);
  const cookies = [];
  const COOKIE_SPOTS = [[-0.24, -0.13], [-0.24, 0.13], [0.0, -0.15], [0.0, 0.13], [0.24, -0.13], [0.24, 0.13]];
  for (let i = 0; i < 6; i++) { const c = makeCookie({ bake: bakeMat, chip: chipMat }); c.position.set(COOKIE_SPOTS[i][0], 0.022, COOKIE_SPOTS[i][1]); c.rotation.y = i * 1.3; c.scale.setScalar(0.001); tray.add(c); cookies.push(c); }
  const pin = new THREE.Group(); scene.add(pin);
  const pinBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 18), std(0xE3AC5C, 0.6)); pinBody.rotation.z = Math.PI / 2; pinBody.castShadow = true; pin.add(pinBody);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 10), std(0x8A5A3A, 0.6)); h.rotation.z = Math.PI / 2; h.position.x = s * 0.31; pin.add(h); }
  pin.visible = false;
  const island2 = new THREE.Group(); island2.position.set(-0.95, CH, 0.3); scene.add(island2);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.11, 0.12, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xE98A9A, roughness: 0.6, side: THREE.DoubleSide })); bowl.position.y = 0.06; bowl.castShadow = true; island2.add(bowl);
  const bowlB = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), std(0xE98A9A, 0.6)); bowlB.rotation.x = -Math.PI / 2; bowlB.position.y = 0.002; island2.add(bowlB);
  for (const [bx, bz, br] of [[-0.03, 0.02, 0.055], [0.05, -0.03, 0.045], [0.02, 0.06, 0.04]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(br, 14, 10), std(DOUGH, 0.8)); b.position.set(bx, 0.03 + br * 0.6, bz); island2.add(b); }

  // the day's other bakes and the boxes, which appear on the back counter at dusk
  const finished = new THREE.Group(); scene.add(finished);
  const stand = makeStand(); stand.position.set(0.2, CH, -2.55); finished.add(stand);
  const bomboMat = std(GOLD, 0.7);
  for (let i = 0; i < 3; i++) { const b = makeBombolone(bomboMat); const a = i * TAU / 3; b.position.set(0.2 + Math.cos(a) * 0.1, CH + 0.155, -2.55 + Math.sin(a) * 0.1); finished.add(b); }
  const boardMesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.32), std(0xC9955E, 0.7)); boardMesh2.position.set(-0.6, CH + 0.0125, -2.55); boardMesh2.castShadow = true; boardMesh2.receiveShadow = true; finished.add(boardMesh2);
  for (let i = 0; i < 2; i++) { const r = makeRoll(bomboMat); r.position.set(-0.72 + i * 0.24, CH + 0.025, -2.55); finished.add(r); }
  const bx1 = makeBox(0.26, 0.11, 0.2, 0xF7CFD6); bx1.position.set(-1.45, CH, -2.6); bx1.rotation.y = 0.2; finished.add(bx1);
  const bx2 = makeBox(0.22, 0.1, 0.22, 0xCDEBDC); bx2.position.set(-1.2, CH, -2.75); bx2.rotation.y = -0.3; finished.add(bx2);
  finished.scale.setScalar(0.0001);

  // the night's showcase on the island: three hero bakes, scaled in when the lights go down
  const showcase = new THREE.Group(); scene.add(showcase);
  const cookieStack = new THREE.Group(); cookieStack.position.set(PROD_X[1], CH, 0.0); showcase.add(cookieStack);
  const plate2 = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.015, 32), std(0xFFF9F3, 0.4)); plate2.position.y = 0.008; plate2.receiveShadow = true; cookieStack.add(plate2);
  const gm = std(GOLD, 0.75), cm = std(CHOC, 0.5);
  for (let i = 0; i < 3; i++) { const c = makeCookie({ bake: gm, chip: cm }); c.position.set(0, 0.016 + i * 0.032, 0); c.rotation.y = i * 0.7; c.scale.setScalar(1.3); cookieStack.add(c); }
  const c2 = makeCookie({ bake: gm, chip: cm }); c2.position.set(0.17, 0.016, 0.1); c2.rotation.set(0.2, 0.4, 1.2); c2.scale.setScalar(1.3); cookieStack.add(c2);
  const st2 = makeStand(); st2.position.set(PROD_X[0], CH, 0); showcase.add(st2);
  for (let i = 0; i < 3; i++) { const b = makeBombolone(std(GOLD, 0.7)); const a = i * TAU / 3 + 0.5; b.position.set(PROD_X[0] + Math.cos(a) * 0.1, CH + 0.155, Math.sin(a) * 0.1); b.scale.setScalar(1.15); showcase.add(b); }
  const bd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.34), std(0xC9955E, 0.7)); bd.position.set(PROD_X[2], CH + 0.0125, 0); bd.castShadow = true; bd.receiveShadow = true; showcase.add(bd);
  for (let i = 0; i < 2; i++) { const r = makeRoll(std(GOLD, 0.7)); r.position.set(PROD_X[2] - 0.12 + i * 0.24, CH + 0.025, 0); r.scale.setScalar(1.15); showcase.add(r); }
  showcase.scale.setScalar(0.0001);

  // Doughy
  const doughy = makeDoughy(STYLES[STYLE_KEY] || STYLES.A); scene.add(doughy);
  doughy.position.set(0.05, CH + 0.22, 0.45);

  // lights
  const ambient = new THREE.AmbientLight(0xa07050, 0.5); scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0xffc9a0, 0x8a6a50, 0.6); scene.add(hemi);
  const charLight = new THREE.PointLight(0xfff1dc, 1.5, 2.6, 2); scene.add(charLight); const _cd = new THREE.Vector3(), _hv = new THREE.Vector3();
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true; sun.shadow.mapSize.set(SHADOW, SHADOW); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  const sc = sun.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 40; sc.updateProjectionMatrix();
  sun.target.position.set(0, 0.8, -0.5); scene.add(sun, sun.target);
  const sunDir = new THREE.Vector3(-0.9, 0.3, 0.2);
  const fill = new THREE.PointLight(0xffe6d0, 3, 7, 2); fill.position.set(1.5, 1.9, 2.4); scene.add(fill);
  const prodSpots = [];
  PROD_X.forEach((dx, k) => {
    const col = new THREE.Color(ACC[k]).lerp(new THREE.Color(0xffffff), 0.35);
    const sp = new THREE.SpotLight(col, 0, 6, 0.5, 0.7, 1.4); sp.position.set(dx, 2.6, 0.9); sp.target.position.set(dx, 0.9, 0.0); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.visible = false; scene.add(sp, sp.target);
    const pt = new THREE.PointLight(col, 0, 2.5, 2); pt.position.set(dx, 1.4, 0.6); pt.visible = false; scene.add(pt);
    prodSpots.push({ sp, pt });
  });

  // the giant letters, laid out in camera space every frame so the whole word always fits
  const letters = [];
  function textPlane(drawFn, matOpts) {
    const c = makeCanvas(256, 256); const tex = canvasTex(c);
    const dr = () => { const g = c.getContext('2d'); g.clearRect(0, 0, 256, 256); drawFn(g); tex.needsUpdate = true; };
    dr(); redraw.push(dr);
    return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial(Object.assign({ map: tex, transparent: true }, matOpts || {})));
  }
  for (let k = 0; k < 3; k++) {
    const arr = [];
    for (const ch2 of WORDS[k]) {
      const m = textPlane(g => { g.font = '900 190px "Fraunces", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(ch2, 128, 138); }, { opacity: 0, depthWrite: false, depthTest: false, color: new THREE.Color(ACC[k]), fog: false });
      m.visible = false; m.renderOrder = 10; scene.add(m); arr.push(m);
    }
    letters.push(arr);
  }
  const _r = new THREE.Vector3(), _c = new THREE.Vector3(), _right = new THREE.Vector3();
  function layoutLetters(cam, k) {
    const aspect = cam.aspect, wide = aspect >= 1;
    const dist = 3.0, halfH = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), halfW = halfH * aspect, FW = 2 * halfW;
    _right.setFromMatrixColumn(cam.matrixWorld, 0).normalize(); _r.setFromMatrixColumn(cam.matrixWorld, 1).normalize();
    _c.setFromMatrixColumn(cam.matrixWorld, 2).normalize().multiplyScalar(-dist).add(cam.position).addScaledVector(_right, (wide ? 0.2 : 0.0) * halfW).addScaledVector(_r, (wide ? 0.62 : 0.66) * halfH);
    const arr = letters[k], n = arr.length; const spacing = Math.min(0.5, (wide ? 0.6 : 0.8) * FW / n), size = Math.min(0.5, spacing * 0.92);
    arr.forEach((m, j) => { m.position.copy(_c).addScaledVector(_right, (j - (n - 1) / 2) * spacing); m.scale.setScalar(size); m.quaternion.copy(cam.quaternion); });
  }

  /* ---- time of day, plus the night mix for the showcase ---- */
  const sunCol = new THREE.Color(), skT = new THREE.Color(), skH = new THREE.Color(), tmpC = new THREE.Color();
  const NIGHT_BG = new THREE.Color(0x2a2238), NIGHT_AMB = new THREE.Color(0x40385a), SKYLINE_DAY = new THREE.Color(0x8a7a84), SKYLINE_NIGHT = new THREE.Color(0x1a1628);
  const skyCol = skyGeo.attributes.color;
  let lastHour = -1, lastNight = -1;
  function setLight(h, nightMix) {
    if (Math.abs(h - lastHour) < 0.0005 && Math.abs(nightMix - lastNight) < 0.001) return; lastHour = h; lastNight = nightMix;
    const a = 0.12 + (Math.PI - 0.24) * clamp01((h - 6) / 14);
    sunDir.set(-Math.cos(a), Math.sin(a) * 0.9 + 0.12, 0.35).normalize();
    const sunI = keyI(SUN_I, h); colKey(SUN_C, h, sunCol);
    sun.position.copy(sunDir).multiplyScalar(18).add(sun.target.position); sun.intensity = sunI * (1 - nightMix); sun.color.copy(sunCol);
    ambient.intensity = lerp(keyI(AMB_I, h), 0.25, nightMix); colKey(AMB_C, h, ambient.color); ambient.color.lerp(NIGHT_AMB, nightMix);
    hemi.intensity = lerp(keyI(HEM_I, h), 0.25, nightMix); colKey(HEM_C, h, hemi.color); colKey(HEM_G, h, hemi.groundColor);
    colKey(BG_C, h, scene.background); scene.background.lerp(NIGHT_BG, nightMix); scene.fog.color.copy(scene.background); scene.fog.density = lerp(0.028, 0.05, nightMix);
    const lampK = lerp(keyI(LAMP_I, h), 0.35, nightMix), nightK = Math.max(keyI(NIGHT_K, h), nightMix);
    bulbMat.color.copy(bulbBase).multiplyScalar(0.3 + 0.9 * lampK);
    lampSprites.forEach(s => { s.sp.material.opacity = s.base * lampK; });
    pendantLights.forEach(l => { l.intensity = 5 * lampK; });
    fill.intensity = 3 * (1 - 0.5 * nightK);
    colKey(SKY_TOP, h, skT); colKey(SKY_HOR, h, skH);
    for (let r = 0; r <= 8; r++) { tmpC.copy(skT).lerp(skH, Math.pow(r / 8, 1.4)); for (let c2 = 0; c2 < 2; c2++) skyCol.setXYZ(r * 2 + c2, tmpC.r, tmpC.g, tmpC.b); }
    skyCol.needsUpdate = true;
    skyline.material.color.copy(SKYLINE_DAY).lerp(SKYLINE_NIGHT, nightK);
    const vis = (sunI > 0.05 ? 1 : 0) * smooth(0, 1.2, sunI) * clamp01(-sunDir.x * 2.5) * (1 - nightMix);
    sunSp.position.set(-W / 2 - 0.42, lerp(1.1, 2.4, clamp01((sunDir.y - 0.1) / 0.7)), WZ + 0.3); sunSp.material.color.copy(sunCol); sunSp.material.opacity = 0.9 * vis;
    renderer.toneMappingExposure = lerp(keyI(EXPO, h), 1.05, nightMix);
    prodSpots.forEach(s => { s.sp.visible = s.pt.visible = nightMix > 0.001; });
  }
  setLight(6.5, 0);

  /* ---- the story: Doughy bakes the morning's batch, then shows it off ---- */
  const dU = doughy.userData;
  const V = new THREE.Vector3(), FWD = new THREE.Vector3(), YAXIS = new THREE.Vector3(0, 1, 0);
  const SPOT_HOME = [0.05, CH, 0.45], SPOT_MIX = [-2.55, CH, -2.35], SPOT_ROLL = [0.05, CH, -0.33], SPOT_OVEN = [2.5, 0.0, -1.4], SPOT_REST = [1.15, CH, -2.6];
  const NIGHT_X = [-0.3, 0.62, 0.25];
  const TRAY_HOME = [0.05, CH, 0.12], OVEN_IN = [OX, 0.305, OZ - 0.02], TRAY_REST = [1.7, CH, -2.6];
  const l3 = (a, b, u, lift) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * (lift || 0), lerp(a[2], b[2], u)];
  const GOLD_C = new THREE.Color(GOLD);
  let facing = 0;
  const face = (target, k) => { facing += wrapAngle(target - facing) * k; doughy.rotation.y = facing; };
  const heldTray = out => { FWD.set(0, 0, 1).applyAxisAngle(YAXIS, doughy.rotation.y); out[0] = doughy.position.x + FWD.x * 0.48; out[1] = doughy.position.y - 0.1; out[2] = doughy.position.z + FWD.z * 0.48; return out; };
  const held = [0, 0, 0];
  const OVEN_YAW = 2.0;
  function story(p, t, cam) {
    const { hp, q } = F.split(p);
    const nightMix = smooth(0.0, 0.09, q);
    setLight(F.hourAt(hp), nightMix);
    const kf = F.snap ? 1 : 0.18, poseK = F.snap ? 1 : 0.15;

    // --- where Doughy stands, where he faces, what his arms do ---
    let spot, pose = 'idle', hopK = 0, faceTarget = null;
    const camYaw = () => { V.copy(cam.position).sub(doughy.position); return Math.atan2(V.x, V.z); };
    if (q > 0) {
      const sg = F.segment(q);
      const to = [NIGHT_X[sg.k], CH, -0.5];
      if (q < Q0) { const u = smooth(0.02, 0.09, q); spot = l3(SPOT_REST, to, u, 0.5); hopK = u; }
      else if (sg.k > 0 && sg.u < 0.22) { const from = [NIGHT_X[sg.k - 1], CH, -0.5]; const u = smooth(0.0, 0.22, sg.u); spot = l3(from, to, u, 0.35); hopK = u; }
      else spot = to;
      faceTarget = camYaw();
      pose = (q >= Q0 && sg.u > 0.3 && sg.u < 0.78) ? 'present' : 'idle';
    } else if (hp < 0.19) { spot = SPOT_HOME; faceTarget = camYaw(); pose = (hp > 0.03 && hp < 0.11) ? 'wave' : 'idle'; }
    else if (hp < 0.28) { const u = smooth(0.19, 0.28, hp); spot = l3(SPOT_HOME, SPOT_MIX, u, 0.45); hopK = u; faceTarget = camYaw(); }
    else if (hp < 0.40) { spot = SPOT_MIX; faceTarget = camYaw() - 0.35; pose = hp > 0.29 && hp < 0.44 ? 'work' : 'idle'; }
    else if (hp < 0.47) { const u = smooth(0.40, 0.47, hp); spot = l3(SPOT_MIX, SPOT_ROLL, u, 0.45); hopK = u; faceTarget = camYaw(); }
    else if (hp < 0.60) { spot = SPOT_ROLL; faceTarget = 0; pose = (hp > 0.48 && hp < 0.575) ? 'roll' : 'idle'; }
    else if (hp < 0.615) { spot = SPOT_ROLL; faceTarget = 0; pose = 'carry'; }
    else if (hp < 0.68) { const u = smooth(0.615, 0.68, hp); spot = l3(SPOT_ROLL, SPOT_OVEN, u, 0.5); hopK = u; faceTarget = camYaw(); pose = 'carry'; }
    else if (hp < 0.86) {
      spot = SPOT_OVEN;
      if (hp < 0.72) { faceTarget = OVEN_YAW; pose = 'carry'; }
      else if (hp < 0.755) { faceTarget = OVEN_YAW; pose = 'reach'; }
      else if (hp < 0.80) { faceTarget = camYaw(); pose = 'idle'; }
      else { faceTarget = OVEN_YAW; pose = hp < 0.835 ? 'reach' : 'carry'; }
    }
    else if (hp < 0.91) { const u = smooth(0.86, 0.91, hp); spot = l3(SPOT_OVEN, SPOT_REST, u, 0.75); hopK = u; faceTarget = camYaw(); pose = 'carry'; }
    else { spot = SPOT_REST; faceTarget = camYaw(); pose = hp < 0.93 ? 'carry' : 'idle'; }
    doughy.position.set(spot[0], spot[1] + 0.22, spot[2]);
    const hb = hopK > 0 ? Math.sin(hopK * Math.PI) : 0;
    dU.bodyG.scale.set(1 - 0.08 * hb, 1 + 0.12 * hb, 1 - 0.08 * hb).multiply(dU.SQ);
    if (faceTarget != null) face(faceTarget, kf);
    setPose(doughy, pose, poseK);

    // --- the tray: on the island, in his mitts, in the oven, on the back counter ---
    let tp;
    heldTray(held);
    if (hp < 0.60) tp = TRAY_HOME;
    else if (hp < 0.615) tp = l3(TRAY_HOME, held, smooth(0.60, 0.615, hp), 0);
    else if (hp < 0.72) tp = held;
    else if (hp < 0.755) tp = l3(held, OVEN_IN, smooth(0.72, 0.755, hp), 0.15);
    else if (hp < 0.82) tp = OVEN_IN;
    else if (hp < 0.85) tp = l3(OVEN_IN, held, smooth(0.82, 0.85, hp), 0.15);
    else if (hp < 0.91) tp = held;
    else if (hp < 0.93) tp = l3(held, TRAY_REST, smooth(0.91, 0.93, hp), 0.05);
    else tp = TRAY_REST;
    tray.position.set(tp[0], tp[1], tp[2]);
    { const ty = doughy.rotation.y, near = Math.round(ty / Math.PI) * Math.PI; const inK = smooth(0.72, 0.755, hp) * (1 - smooth(0.82, 0.85, hp)); const restK = smooth(0.91, 0.93, hp);
      tray.rotation.y = hp < 0.60 ? 0 : lerp(lerp(ty, near, inK), 0, restK); }
    const open1 = smooth(0.69, 0.72, hp) * (1 - smooth(0.755, 0.775, hp));
    const open2 = smooth(0.80, 0.82, hp) * (1 - smooth(0.85, 0.87, hp));
    door.rotation.x = Math.max(open1, open2) * 1.45;

    // --- mixing: the mixer runs, flour puffs, dough balls appear, the chalkboard fills in ---
    const mix = smooth(0.29, 0.32, hp) * (1 - smooth(0.42, 0.45, hp));
    mixer.userData.head.rotation.z = Math.sin(t * 18) * 0.03 * mix;
    mixer.userData.whisk.rotation.y = t * 25 * mix;
    mixer.userData.dough.visible = hp > 0.32; mixer.userData.dough.scale.set(1.2, 0.5, 1.2).multiplyScalar(Math.max(0.001, smooth(0.32, 0.37, hp)));
    bowlDough.forEach((b, i) => { b.scale.setScalar(Math.max(0.001, pop(0.35 + i * 0.03, 0.41 + i * 0.03, hp))); });
    flour.forEach((f, i) => { const k = smooth(0.30 + i * 0.006, 0.35 + i * 0.006, hp); const fade = 1 - smooth(0.35, 0.41, hp); f.material.opacity = k * fade * 0.7; f.scale.setScalar(0.1 + k * 0.5); f.position.set(-3.0 + Math.cos(i * 2.4) * k * 0.45, CH + 0.1 + k * 0.5, -2.5 + Math.sin(i * 2.4) * k * 0.3); });
    board.set(smooth(0.25, 0.44, hp));

    // --- rolling: the pin in his mitts goes back and forth, the sheet flattens, cookies pop ---
    const roll = smooth(0.485, 0.57, hp);
    pin.visible = roll > 0 && roll < 1;
    if (pin.visible) { const osc = Math.sin(roll * Math.PI * 3); pin.position.set(doughy.position.x, CH + 0.02 + 0.09 * lerp(0.3, 0.08, roll) + 0.045, doughy.position.z + 0.32 + osc * 0.14); pin.rotation.x = roll * 18; }
    const flat = lerp(0.3, 0.07, roll), shrink = 1 - smooth(0.565, 0.60, hp);
    sheet.scale.set(1.3 * lerp(1, 1.3, roll) * shrink, flat * shrink, lerp(1, 1.25, roll) * shrink); sheet.visible = shrink > 0.01;
    cookies.forEach((c, i) => { c.scale.setScalar(Math.max(0.001, pop(0.555 + i * 0.008, 0.60 + i * 0.008, hp))); });

    // --- baking: colour, glow, steam; then the day's other bakes and the boxes ---
    const bake = smooth(0.78, 0.815, hp);
    bakeMat.color.set(PALE).lerp(GOLD_C, bake);
    const glow = smooth(0.765, 0.79, hp) * (1 - smooth(0.82, 0.85, hp));
    ovenGlow.material.opacity = 0.9 * glow; ovenLight.intensity = 3.5 * glow; ovenSp.material.opacity = 0.7 * glow;
    steam.forEach((s, i) => { const k = smooth(0.85, 0.88, hp) * (1 - smooth(0.97, 1.0, hp)); const ph = (t * 0.3 + i * 0.5) % 1; s.position.set(tp[0] - 0.15 + i * 0.25, tp[1] + 0.15 + ph * 0.5, tp[2] + 0.1); s.material.opacity = 0.35 * k * Math.sin(ph * Math.PI); });
    finished.scale.setScalar(Math.max(0.0001, pop(0.91, 0.97, hp)));

    // --- the night: showcase pops in, spotlights pick each bake, letters in camera space ---
    showcase.scale.setScalar(Math.max(0.0001, pop(0.03, 0.09, q)));
    const sg = F.segment(q);
    for (let i = 0; i < 3; i++) {
      const on = (q >= Q0 && i === sg.k) ? smooth(0.3, 0.42, sg.u) * (1 - smooth(0.7, 0.78, sg.u)) : 0;
      prodSpots[i].sp.intensity = nightMix * (10 + 16 * on); prodSpots[i].pt.intensity = nightMix * (1 + 2.5 * on);
    }

    // idle life
    doughy.position.y += Math.sin(t * 2.2) * 0.006;
    _hv.set(doughy.position.x + 0.12, doughy.position.y + 0.3, doughy.position.z).project(cam); const _el = renderer.domElement;
    window.BD.head = { x: (_hv.x + 1) / 2 * _el.clientWidth, y: (1 - _hv.y) / 2 * _el.clientHeight, on: _hv.z < 1 };
    _cd.subVectors(cam.position, doughy.position).normalize(); charLight.position.copy(doughy.position).addScaledVector(_cd, 0.85); charLight.position.y += 0.3; charLight.intensity = 1.5 * (1 - 0.55 * nightMix);
    const bl = (t % 3.6) < 0.12 ? 1 - Math.abs((t % 3.6) - 0.06) / 0.06 : 0;
    if (dU.S.eye !== 'arc') dU.face.scale.y = 1 - 0.08 * bl;
    dU.hat.rotation.z = dU.S.hatTilt + Math.sin(t * 2.2) * 0.015;
  }

  return { scene, story, doughy, redrawText: () => redraw.forEach(f => f()) };
}

/* ---------------- the one stage ---------------- */
const canvas = document.getElementById('kitchen');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const cam = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 60);
const kitchen = buildKitchen(renderer);
let portrait = 1;
function fovFor(aspect) { return THREE.MathUtils.clamp(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(27)) / aspect) * 180 / Math.PI, 40, aspect < 0.8 ? 64 : 78); }
function resize() {
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = fovFor(w / h); cam.updateProjectionMatrix();
  portrait = w / h < 1 ? 1.08 : 1;
}
resize();
window.addEventListener('resize', resize);
const _pos = new THREE.Vector3(), _tgt = new THREE.Vector3();
function applyCam(shot, px, py, back) {
  _tgt.set(shot.tgt[0], shot.tgt[1], shot.tgt[2]);
  _pos.set(shot.pos[0], shot.pos[1], shot.pos[2]).sub(_tgt).multiplyScalar(back).add(_tgt);
  if (back > 1) { const d = _pos.distanceTo(_tgt), tilt = THREE.MathUtils.clamp((d - 1.6) / 2.4, 0, 1); _tgt.y -= 0.26 * tilt; _pos.y -= 0.12 * tilt; }
  _pos.x += px; _pos.y += py;
  cam.position.copy(_pos); cam.lookAt(_tgt); cam.updateMatrixWorld();
}
// the camera keeps Doughy in frame while he hops between stations
const TRACK = [[0.18, 0.20, 0.25, 0.27], [0.40, 0.42, 0.455, 0.47], [0.60, 0.62, 0.655, 0.67], [0.85, 0.87, 0.89, 0.905]];
function trackK(hp) { let k = 0; for (const [a, b, c, d] of TRACK) k = Math.max(k, smooth(a, b, hp) * (1 - smooth(c, d, hp))); return k; }

Promise.race([
  Promise.all([document.fonts.load('700 60px "Caveat"'), document.fonts.load('900 190px "Fraunces"')]),
  new Promise(r => setTimeout(r, 2500))
]).then(() => kitchen.redrawText()).catch(() => {});

const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener('pointermove', e => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });

let last = performance.now(), slowFrames = 0, degraded = false, ready = false;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = now / 1000;
  if (!degraded && t > 3) { slowFrames = dt > 0.04 ? slowFrames + 1 : Math.max(0, slowFrames - 1); if (slowFrames > 45) { degraded = true; renderer.setPixelRatio(1); renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.needsUpdate = true; resize(); } }
  pointer.sx += (pointer.x - pointer.sx) * 0.06; pointer.sy += (pointer.y - pointer.sy) * 0.06;
  const par = F.reduce ? 0 : 1;
  if (F.visible) {
    const p = F.reduce ? 0 : F.s;
    const { hp, q } = F.split(p);
    const shot = F.dbgCam || seq(KEYS, p);
    const k = q > 0 ? 0 : trackK(hp) * 0.75;
    if (k > 0) { const d = kitchen.doughy.position; shot.tgt = [lerp(shot.tgt[0], d.x, k), lerp(shot.tgt[1], d.y + 0.05, k), lerp(shot.tgt[2], d.z, k)]; }
    if (q > 0 && portrait > 1) { shot.tgt = [shot.tgt[0] + 0.2, shot.tgt[1], shot.tgt[2]]; shot.pos = [shot.pos[0] + 0.08, shot.pos[1], shot.pos[2]]; } // portrait: keep Doughy in the night close-ups
    applyCam(shot, pointer.sx * 0.15 * par, -pointer.sy * 0.1 * par, portrait);
    kitchen.story(p, t, cam);
    renderer.render(kitchen.scene, cam);
    if (!ready) { ready = true; canvas.classList.add('ready'); }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
