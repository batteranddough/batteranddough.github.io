// viewport screenshots of a static page at given anchors (file path or URL): node view.js <html-or-url> <prefix> <phone|desktop> <sel1,sel2,...>
const puppeteer = require('puppeteer-core'); const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { resolve } = require('./target');
const target = process.argv[2], prefix = process.argv[3], view = process.argv[4], sels = process.argv[5].split(',');
const V = view === 'phone' ? { w: 390, h: 844, dpr: 2, mobile: true } : { w: 1280, h: 800, dpr: 1, mobile: false };
(async () => {
  const { url, close } = await resolve(target);
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars'] });
  const page = await browser.newPage(); const errs = [];
  page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); }); page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.setViewport({ width: V.w, height: V.h, deviceScaleFactor: V.dpr, isMobile: V.mobile, hasTouch: V.mobile });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 800));
  for (const sel of sels) {
    if (sel === 'top') await page.evaluate(() => window.scrollTo(0, 0));
    else if (sel === 'bottom') await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    else await page.evaluate(s => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 110); }, sel);
    await new Promise(r => setTimeout(r, 900));
    const out = path.join(OUT, prefix + '-' + view + '-' + sel.replace(/[^a-z0-9]/gi, '') + '.png');
    await page.screenshot({ path: out }); console.log(out);
  }
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no console errors');
  await browser.close(); close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
