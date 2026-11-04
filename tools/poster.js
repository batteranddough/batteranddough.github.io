// The kitchen poster for browsers without WebGL: node tools/poster.js index.html  ->  img/kitchen-poster.jpg
const path = require('path');
const { resolve } = require('./target');
const { launch, watch, open, gotoProgress, sleep } = require('./frame');
const target = process.argv[2] || 'index.html';
const out = path.join(__dirname, '..', 'img', 'kitchen-poster.jpg');

(async () => {
  const { url, close } = await resolve(target);
  const browser = await launch(); const page = await browser.newPage(); const errs = []; watch(page, errs);
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await open(page, url);
  await gotoProgress(page, 0);
  await page.addStyleTag({ content: '.nav, .layer, .scrollbtn, .vignette, .grain { visibility: hidden !important; }' });
  await sleep(300);
  await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
  console.log(out, require('fs').statSync(out).size, 'bytes', errs.length ? 'ERRORS: ' + errs.join(' | ') : '');
  await browser.close(); close();
})().catch(e => { console.error(e.message); process.exit(1); });
