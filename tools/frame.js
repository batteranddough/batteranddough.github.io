// Shared helpers for the home-page tools: launch Edge headless, open a page, drive the journey to a progress value.
const puppeteer = require('puppeteer-core');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

function launch(extraArgs) {
  return puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars'].concat(GL_ARGS, extraArgs || []) });
}

// collect page errors, console errors and failed requests into errs
function watch(page, errs, tag) {
  const t = tag ? tag + ' ' : '';
  page.on('pageerror', e => errs.push(t + 'pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(t + 'console.error: ' + m.text().slice(0, 300)); });
  page.on('response', r => { if (r.status() >= 400) errs.push(t + r.status() + ' ' + r.url()); });
}

// the page is "up" when the kitchen drew its first frame, or when a fallback class is on <body>
async function open(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForFunction(() => {
    const c = document.getElementById('kitchen');
    return (c && c.classList.contains('ready')) || document.body.classList.contains('no-webgl') || document.body.classList.contains('static');
  }, { timeout: 30000 });
  await new Promise(r => setTimeout(r, 400));
}

// scroll the pinned journey to progress p (0..1) and freeze the smoothing so the frame is exact
async function gotoProgress(page, p) {
  const st = await page.evaluate(() => {
    if (!window.ScrollTrigger) return null;
    const s = ScrollTrigger.getAll().find(t => (t.vars && t.vars.id === 'journey') || (t.trigger && t.trigger.id === 'journey') || t.pin);
    return s ? { start: s.start, end: s.end } : null;
  });
  if (!st) throw new Error('no journey ScrollTrigger (static or no-WebGL page?)');
  await page.evaluate(y => window.scrollTo(0, y), Math.round(st.start + (st.end - st.start) * p));
  return page.evaluate(async expect => {
    const F = window.BD, t0 = performance.now();
    while (Math.abs(F.p - expect) > 0.003 && performance.now() - t0 < 5000) await new Promise(r => setTimeout(r, 50));
    F.snap = true; F.s = F.p;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
    return F.p;
  }, p);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = { launch, watch, open, gotoProgress, sleep, EDGE };
