// Behaviour checks for the menu page: node tools/check-menu.js menu.html  (file path or URL)
// 1 opens at the top  2 a category hash lands on that section with its chip active
// 3 an item's Order link carries the item, size and egg choice  4 a photo opens the lightbox
const puppeteer = require('puppeteer-core'); const path = require('path');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const target = process.argv[2] || 'menu.html';
const { resolve } = require('./target');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg) { if (!cond) throw new Error('FAILED: ' + msg); }

(async () => {
  const { url, close } = await resolve(target);
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars'] });
  const page = await browser.newPage(); const errs = [];
  page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); }); page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. opens at the top, even after the browser scrolled on a previous visit
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, 1200)); await sleep(300);
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(500);
  const y0 = await page.evaluate(() => window.scrollY);
  assert(y0 === 0, 'page should open at the top after a reload, scrollY was ' + y0);

  // 2. deep link to a category
  await page.goto(url + '#cookies', { waitUntil: 'networkidle0', timeout: 60000 }); await sleep(600);
  const deep = await page.evaluate(() => ({ y: window.scrollY, chip: (document.querySelector('.chips a.on') || {}).getAttribute && document.querySelector('.chips a.on').getAttribute('href'), top: document.getElementById('cookies').getBoundingClientRect().top }));
  assert(deep.y > 200, 'menu.html#cookies should scroll to the section, scrollY was ' + deep.y);
  assert(deep.chip === '#cookies', 'active chip should be #cookies, was ' + deep.chip);
  assert(deep.top > -20 && deep.top < 260, 'cookies section should sit just under the sticky bar, top was ' + deep.top);

  // 3. order link text after switching to egg
  await page.click('.seg button[data-e="1"]'); await sleep(200);
  const link = await page.evaluate(() => { const it = document.querySelector('#cookies .item'); return { name: it.querySelector('h3').textContent, href: it.querySelector('.act a').getAttribute('href') }; });
  assert(link.href.indexOf('https://wa.me/918999650554?text=') === 0, 'order link should open WhatsApp with text, was ' + link.href);
  const text = decodeURIComponent(link.href.split('text=')[1]);
  assert(text.indexOf(link.name) >= 0, 'order text should name the item: ' + text);
  assert(/box of 4/i.test(text), 'order text should carry the first size: ' + text);
  assert(/with egg/.test(text), 'order text should say with egg after the toggle: ' + text);
  assert(text.indexOf('&') >= 0, 'the ampersand in Batter & Dough should survive encoding: ' + text);

  // 4. lightbox
  await page.click('#cookies .zoomer'); await sleep(400);
  const lb = await page.evaluate(() => { const el = document.getElementById('lb'); return { shown: !el.hidden && getComputedStyle(el).display !== 'none', imgs: el.querySelectorAll('img').length }; });
  assert(lb.shown, 'lightbox should be visible after tapping a photo');
  assert(lb.imgs === 1 || lb.imgs === 2, 'lightbox should hold one or two photos, had ' + lb.imgs);
  await page.keyboard.press('Escape'); await sleep(200);
  assert(await page.evaluate(() => document.getElementById('lb').hidden), 'Escape should close the lightbox');

  assert(errs.length === 0, 'console errors: ' + errs.join(' | '));
  console.log('menu checks: ok');
  await browser.close(); close();
})().catch(async e => { console.error(e.message); process.exit(1); });
