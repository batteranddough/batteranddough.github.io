// Behaviour checks for the menu page: node tools/check-menu.js menu.html  (file path or URL)
// 1 opens at the top  2 a category hash lands on that section with its chip active
// 3 an item's Order link carries the item, size and egg choice  4 a photo opens the lightbox
// 5 croissants are coming soon (last, photos, no prices, no Order)  6 prices follow the 2026-11-05 cards; price-on-request items
// 7 an item's Order button opens the order form prefilled; the form composes the WhatsApp message
const puppeteer = require('puppeteer-core'); const path = require('path');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const target = process.argv[2] || 'menu.html';
const { resolve } = require('./target');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg) { if (!cond) throw new Error('FAILED: ' + msg); }

let browser;
(async () => {
  const { url, close } = await resolve(target);
  browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox', '--hide-scrollbars'] });
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

  // 5. croissants are coming soon: last on the page, photos kept, no prices, no egg icon, no Order button
  const soon = await page.evaluate(() => {
    const cats = Array.from(document.querySelectorAll('.cat')).map(c => c.id);
    const sec = document.getElementById('croissants'); if (!sec) return { cats };
    const it = sec.querySelector('.item');
    return { cats, badge: (sec.querySelector('h2 .rev') || {}).textContent, rupee: /₹/.test(sec.textContent), photo: !!it.querySelector('.zoomer img'),
      sizes: it.querySelectorAll('.sz').length, egg: it.querySelectorAll('.egg').length, order: it.querySelectorAll('.act a, .act button').length, line: (it.querySelector('.soon') || {}).textContent,
      chip: (document.querySelector('.chips a[data-id="croissants"]') || {}).textContent };
  });
  assert(soon.cats[soon.cats.length - 1] === 'croissants', 'croissants should be the last category, order was ' + soon.cats.join(','));
  assert(soon.badge === 'Coming soon', 'croissants should carry a "Coming soon" badge, was "' + soon.badge + '"');
  assert(!soon.rupee, 'no price may show in the croissants section');
  assert(soon.photo, 'croissant photos should still show');
  assert(soon.sizes === 0 && soon.egg === 0 && soon.order === 0, 'a coming-soon card should have no size chips, egg icon or Order button, had ' + JSON.stringify(soon));
  assert(/Coming soon/.test(soon.line || ''), 'a coming-soon card should say so in place of its prices, got "' + soon.line + '"');

  // 6. prices from the cards of 2026-11-05, and the two price-on-request lines
  await page.click('.seg button[data-e="0"]'); await sleep(200);
  const data = await page.evaluate(() => {
    const row = name => { const h = Array.from(document.querySelectorAll('.item h3')).find(x => x.textContent === name); if (!h) return null; const it = h.closest('.item'); return { prices: Array.from(it.querySelectorAll('.sz b')).map(b => b.textContent), ask: (it.querySelector('.ask') || {}).textContent, order: it.querySelectorAll('.act a, .act button').length, dataOrder: (it.querySelector('.act [data-order]') || {}).getAttribute && it.querySelector('.act [data-order]').getAttribute('data-order') }; };
    return { choc: row('Chocolate Bombolone'), slab: row('Brownie slab'), fill: row('Customised fillings'), bb: row('Brown butter chocolate chip'), date: document.querySelector('footer .copy').textContent };
  });
  assert(data.choc && data.choc.prices.join('/') === '₹106/₹213', 'Chocolate Bombolone should be 106 / 213 eggless, was ' + JSON.stringify(data.choc));
  assert(data.slab && data.slab.prices.length === 0 && /Price on request/.test(data.slab.ask || '') && data.slab.order === 1, 'Brownie slab should show "Price on request" and an Order button, was ' + JSON.stringify(data.slab));
  assert(data.fill && /Price on request/.test(data.fill.ask || '') && data.fill.order === 1, 'Customised fillings should show "Price on request" and an Order button, was ' + JSON.stringify(data.fill));
  assert(data.bb && data.bb.dataOrder === 'cookies:0', 'an Order button should name its item for the form, was ' + JSON.stringify(data.bb));
  assert(/5 Nov 2026/.test(data.date), 'the menu footer should date the prices 5 Nov 2026, was "' + data.date + '"');

  // 7. the order form: opened from an item after switching to egg, two rows, quantities, date, delivery, name, notes
  await page.click('.seg button[data-e="1"]'); await sleep(200);
  await page.evaluate(() => { window.__opened = []; window.open = function (u) { window.__opened.push(u); return {}; }; });
  await page.click('#cookies .item .act [data-order]'); await sleep(400);
  const od0 = await page.evaluate(() => {
    const od = document.getElementById('order'); if (!od) return null;
    const row = od.querySelector('.row');
    return { shown: !od.hidden && getComputedStyle(od).display !== 'none', rows: od.querySelectorAll('.row').length, bake: row.querySelector('select.bake').value, size: (row.querySelector('.sseg button.on') || { getAttribute: function () { return 'none'; } }).getAttribute('data-i'), sbw: getComputedStyle(od.querySelector('.od-body')).scrollbarWidth, days: od.querySelectorAll('#od-days button[data-d]').length, dayOn: (od.querySelector('#od-days button.on') || { getAttribute: function () { return null; } }).getAttribute('data-d'), dateHidden: document.getElementById('od-date').hidden, picker: getComputedStyle(row.querySelector('select.bake')).appearance, egg: (row.querySelector('.eseg button.on') || {}).getAttribute && row.querySelector('.eseg button.on').getAttribute('data-e'), qty: row.querySelector('input.qty').value,
      croissant: !!od.querySelector('select.bake option[value^="croissants:"]'), ask: !!od.querySelector('select.bake option[value="more:1"]'), dateMin: document.getElementById('od-date').min, dateVal: document.getElementById('od-date').value, focus: document.activeElement && document.activeElement.tagName, overflow: document.body.style.overflow };
  });
  assert(od0 && od0.shown, 'tapping an Order button should open the order form');
  assert(od0.rows === 1 && od0.bake === 'cookies:0' && od0.size === '0' && od0.egg === '1' && od0.qty === '1', 'the form should open with that item, its first size and the page\'s egg choice, got ' + JSON.stringify(od0));
  assert(!od0.croissant, 'coming-soon croissants must not be offered in the form');
  assert(od0.ask, 'price-on-request items should be offered in the form');
  const dayAfter = n => { const d = new Date(); d.setDate(d.getDate() + n); const p = x => (x < 10 ? '0' : '') + x; return { iso: d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()), text: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ', ' + d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear() }; };
  const tomorrow = dayAfter(1);
  assert(od0.dateMin === tomorrow.iso && od0.dateVal === tomorrow.iso, 'the date should default to tomorrow and allow nothing earlier, got min ' + od0.dateMin + ' value ' + od0.dateVal);
  assert(od0.focus === 'SELECT', 'focus should land on the first field, was on ' + od0.focus);
  assert(od0.overflow === 'hidden', 'the page behind the form should not scroll');
  assert(od0.sbw === 'none', 'the form body should scroll without a visible scrollbar, scrollbar-width was ' + od0.sbw);
  assert(od0.days >= 14 && od0.dayOn === tomorrow.iso && od0.dateHidden, 'the date should be a strip of day chips with tomorrow selected and the native input tucked away, got ' + JSON.stringify({ days: od0.days, dayOn: od0.dayOn, dateHidden: od0.dateHidden }));
  assert(od0.picker === 'base-select', 'the bake dropdown should use the styleable picker (appearance: base-select) so it matches the page, was ' + od0.picker);
  await page.click('#order .row .sseg button[data-i="1"]'); await page.click('#order .row .plus'); await sleep(100);
  await page.click('#od-add'); await sleep(200);
  await page.select('#order .row:nth-child(2) select.bake', 'combos:1'); await sleep(100);
  await page.type('#od-name', 'Aisha'); await page.type('#od-addr', 'Sadar Bazar'); await page.type('#od-notes', 'candles please');
  const sum = await page.evaluate(() => ({ rows: document.querySelectorAll('#order .row').length, total: document.getElementById('od-total').textContent, text: window.BD_ORDER.compose() }));
  assert(sum.rows === 2, 'Add another bake should add a second row, rows were ' + sum.rows);
  assert(/652/.test(sum.total), 'the estimated total should be 2 x 168 + 316 = 652 with egg, was "' + sum.total + '"');
  const want = ["Hi Batter & Dough! I'd like to order:", "\u2022 Brown butter chocolate chip \u00b7 box of 6 \u00b7 with egg \u00b7 \u00d72 \u00b7 \u20b9336", "\u2022 Blissful Bombolone \u00b7 combo \u00b7 with egg \u00b7 \u00d71 \u00b7 \u20b9316", 'Needed on: ' + tomorrow.text, 'Delivery to: Sadar Bazar', 'Name: Aisha', 'Notes: candles please', 'Estimated total: \u20b9652'];
  assert(sum.text === want.join('\n'), 'composed message differs:\n' + sum.text + '\n--- wanted ---\n' + want.join('\n'));
  // the day chips write the date, "Later" reveals the native input, pickup swaps the address cell without moving the name field
  const day3 = dayAfter(3);
  await page.click('#od-days button[data-d="' + day3.iso + '"]'); await sleep(100);
  let dt = await page.evaluate(() => ({ v: document.getElementById('od-date').value, on: document.querySelector('#od-days button.on').getAttribute('data-d'), line: window.BD_ORDER.compose().split('\n').find(l => l.indexOf('Needed on') === 0) }));
  assert(dt.v === day3.iso && dt.on === day3.iso && dt.line === 'Needed on: ' + day3.text, 'tapping a day chip should set the date, got ' + JSON.stringify(dt));
  await page.click('#od-later'); await sleep(100);
  dt = await page.evaluate(() => ({ hidden: document.getElementById('od-date').hidden, min: document.getElementById('od-date').min, on: !!document.querySelector('#od-days button[data-d].on') }));
  assert(!dt.hidden && dt.min === tomorrow.iso && !dt.on, '"Later" should reveal the date input (from tomorrow on) and clear the chips, got ' + JSON.stringify(dt));
  await page.click('#od-days button[data-d="' + tomorrow.iso + '"]'); await sleep(100);
  assert(await page.evaluate(() => document.getElementById('od-date').hidden && document.getElementById('od-date').value === document.querySelector('#od-days button.on').getAttribute('data-d')), 'a chip after "Later" should tuck the input away again');
  const nameBox = async () => page.evaluate(() => { const r = document.getElementById('od-name').getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y) }; });
  const before = await nameBox();
  await page.click('.mode button[data-m="pickup"]'); await sleep(150);
  const pk = await page.evaluate(() => ({ addr: document.getElementById('od-addr').offsetParent === null, cell: document.querySelector('.od-addrf').offsetParent !== null, line: window.BD_ORDER.compose().split('\n').find(l => /^(Pickup|Delivery)/.test(l)) }));
  const after = await nameBox();
  assert(pk.addr && pk.cell && pk.line === 'Pickup from the bakery', 'pickup should hide the address box, keep its cell and say so in the message, got ' + JSON.stringify(pk));
  assert(before.x === after.x && before.y === after.y, 'switching to pickup should not move the name field, it went from ' + JSON.stringify(before) + ' to ' + JSON.stringify(after));
  await page.click('.mode button[data-m="deliver"]'); await sleep(150);
  await page.click('#od-send'); await sleep(400);
  const sent = await page.evaluate(() => ({ urls: window.__opened, hidden: document.getElementById('order').hidden, overflow: document.body.style.overflow }));
  assert(sent.urls.length === 1 && sent.urls[0].indexOf('https://wa.me/918999650554?text=') === 0, 'Send should open WhatsApp once, opened ' + JSON.stringify(sent.urls));
  assert(decodeURIComponent(sent.urls[0].split('text=')[1]) === want.join('\n'), 'the WhatsApp link should carry the composed message intact');
  assert(sent.hidden && sent.overflow === '', 'the form should close after sending and give the page its scroll back');
  // a form with no name does not send
  await page.click('#cookies .item .act [data-order]'); await sleep(300);
  await page.evaluate(() => { document.getElementById('od-name').value = ''; });
  await page.click('#od-send'); await sleep(300);
  const blocked = await page.evaluate(() => ({ urls: window.__opened.length, hidden: document.getElementById('order').hidden }));
  assert(blocked.urls === 1 && !blocked.hidden, 'without a name the form should stay open and not send');
  await page.keyboard.press('Escape'); await sleep(200);
  assert(await page.evaluate(() => document.getElementById('order').hidden), 'Escape should close the form');

  assert(errs.length === 0, 'console errors: ' + errs.join(' | '));
  console.log('menu checks: ok');
  await browser.close(); close();
})().catch(async e => { console.error(e.message); if (browser) await browser.close().catch(() => {}); process.exit(1); });
