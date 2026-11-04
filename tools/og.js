// The Open Graph share image (WhatsApp link previews): node tools/og.js index.html  ->  img/og.jpg  (1200x630)
// Doughy's hello frame, with the nav, the step chips, the kicker and the scroll button hidden.
const path = require('path'), fs = require('fs');
const { resolve } = require('./target');
const { launch, watch, open, gotoProgress, sleep } = require('./frame');
const target = process.argv[2] || 'index.html';
const out = path.join(__dirname, '..', 'img', 'og.jpg');

(async () => {
  const { url, close } = await resolve(target);
  const browser = await launch(); const page = await browser.newPage(); const errs = []; watch(page, errs);
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await open(page, url);
  await gotoProgress(page, 0.05);
  await page.addStyleTag({ content: '.nav, .scrollbtn, .steps, .kicker, .grain { visibility: hidden !important; }' });
  await sleep(300);
  await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
  console.log(out, fs.statSync(out).size, 'bytes', errs.length ? 'ERRORS: ' + errs.join(' | ') : '');
  await browser.close(); close();
})().catch(e => { console.error(e.message); process.exit(1); });
