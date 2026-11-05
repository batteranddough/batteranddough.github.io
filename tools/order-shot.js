// Screenshots of the order form: node tools/order-shot.js menu.html <prefix> (file path or URL)
// Opens the form from the first cookies card on a phone and on a desktop, adds a row, and shoots both.
const puppeteer = require('puppeteer-core'); const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const { resolve } = require('./target');
const target = process.argv[2] || 'menu.html', prefix = process.argv[3] || 'order';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const { url, close } = await resolve(target);
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars'] });
  for (const [name, vp] of [['phone', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['desktop', { width: 1280, height: 800, deviceScaleFactor: 1 }]]) {
    const page = await browser.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.setViewport(vp); await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }); await sleep(400);
    await page.click('#cookies .item .act [data-order]'); await sleep(400);
    await page.click('#od-add'); await sleep(200);
    await page.select('#order .row:nth-child(2) select.bake', 'combos:1');
    await page.type('#od-name', 'Aisha'); await page.type('#od-addr', 'Sadar Bazar'); await sleep(200);
    await page.screenshot({ path: path.join(OUT, prefix + '-' + name + '.png') });
    console.log(path.join(OUT, prefix + '-' + name + '.png'), errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors');
    await page.close();
  }
  await browser.close(); close();
})().catch(e => { console.error(e.message); process.exit(1); });
