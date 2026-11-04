// Headless screenshots of the pinned journey at chosen progress values; target is a file path or an http(s) URL.
// usage: node shoot.js <html-or-url> <prefix> [p list|-] [views: phone,desktop] [tail]
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const target = process.argv[2];
const url = /^https?:/.test(target) ? target : 'file:///' + path.resolve(target).split(path.sep).join('/');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const prefix = process.argv[3] || 'r4';
const DAY = 0.62;
const hp = h => +(h * DAY).toFixed(4), q = x => +(DAY + x * (1 - DAY)).toFixed(4);
const DEFAULT = [hp(0), hp(0.12), hp(0.23), hp(0.33), hp(0.44), hp(0.53), hp(0.64), hp(0.70), hp(0.78), hp(0.88), hp(0.96), q(0.04), q(0.08), q(0.16), q(0.26), q(0.47), q(0.56), q(0.86), q(1)];
const list = process.argv[4] && process.argv[4] !== '-' ? process.argv[4].split(',').map(Number) : DEFAULT;
const which = process.argv[5] ? process.argv[5].split(',') : ['phone', 'desktop'];
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const views = [
  { name: 'phone', w: 390, h: 844, dpr: 2, mobile: true, scale: .5, cols: 5 },
  { name: 'desktop', w: 1280, h: 800, dpr: 1, mobile: false, scale: .4, cols: 3 }
].filter(v => which.includes(v.name));

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
  const errors = [];
  for (const v of views) {
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(v.name + ' console.' + m.type() + ': ' + m.text().slice(0, 300)); });
    page.on('pageerror', e => errors.push(v.name + ' pageerror: ' + e.message));
    await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: v.dpr, isMobile: v.mobile, hasTouch: v.mobile });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    await new Promise(r => setTimeout(r, 2500));
    const info = await page.evaluate(() => ({
      fonts: document.fonts.status, noWebgl: document.body.classList.contains('no-webgl'),
      ready: Array.from(document.querySelectorAll('canvas')).map(c => c.classList.contains('ready')),
      sts: (window.ScrollTrigger ? ScrollTrigger.getAll() : []).map(s => ({ id: s.trigger.id, start: s.start, end: s.end })),
      docH: document.documentElement.scrollHeight
    }));
    console.log(v.name, JSON.stringify(info));
    const st = info.sts.find(s => s.id === 'journey');
    const shots = [];
    const actual = [];
    for (const p of list) {
      const y = Math.round(st.start + (st.end - st.start) * p);
      await page.evaluate(y => window.scrollTo(0, y), y);
      const got = await page.evaluate(async (expect) => {
        const F = window.BD; const t0 = performance.now();
        while (Math.abs(F.p - expect) > 0.003 && performance.now() - t0 < 5000) await new Promise(r => setTimeout(r, 50));
        F.snap = true; F.s = F.p;
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
        return { p: F.p, ms: Math.round(performance.now() - t0) };
      }, p);
      const label = 'p' + p.toFixed(3);
      const out = path.join(OUT, prefix + '-' + v.name + '-' + label + '.png');
      await page.screenshot({ path: out });
      shots.push({ out, label });
      actual.push(label + '->' + got.p.toFixed(3) + '(' + got.ms + 'ms)');
    }
    console.log(v.name, 'actual progress:', actual.join(' '));
    if (process.argv[6] === 'tail') {
      await page.evaluate(() => { window.BD.snap = false; });
      for (const [lab, sel] of [['bakes', '#bakes'], ['end', 'footer']]) {
        await page.evaluate(s => { document.querySelector(s).scrollIntoView(); }, sel);
        await new Promise(r => setTimeout(r, 900));
        const out = path.join(OUT, prefix + '-' + v.name + '-' + lab + '.png'); await page.screenshot({ path: out }); shots.push({ out, label: lab });
      }
    }
    const per = v.cols * 2;
    for (let s0 = 0; s0 < shots.length; s0 += per) {
      const part = shots.slice(s0, s0 + per);
      const sheet = await browser.newPage();
      const cellW = Math.round(v.w * v.scale), cellH = Math.round(v.h * v.scale);
      const cols = Math.min(v.cols, part.length), rows = Math.ceil(part.length / cols);
      await sheet.setViewport({ width: cellW * cols + (cols + 1) * 6, height: (cellH + 22) * rows + 6, deviceScaleFactor: 1 });
      const html = '<body style="margin:0;background:#222;font:12px sans-serif;color:#fff"><div style="display:grid;grid-template-columns:repeat(' + cols + ',' + cellW + 'px);gap:6px;padding:6px">' +
        part.map(s => '<div><div style="height:16px">' + s.label + '</div><img src="data:image/png;base64,' + fs.readFileSync(s.out).toString('base64') + '" style="width:' + cellW + 'px;height:' + cellH + 'px;display:block"></div>').join('') + '</div></body>';
      await sheet.setContent(html, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 400));
      const sheetOut = path.join(OUT, prefix + '-' + v.name + '-sheet' + (s0 / per) + '.png');
      await sheet.screenshot({ path: sheetOut });
      console.log('sheet', sheetOut);
      await sheet.close();
    }
    await page.close();
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS/WARNINGS:\n' + errors.join('\n') : 'no console errors');
})().catch(e => { console.error('FAILED', e); process.exit(1); });
