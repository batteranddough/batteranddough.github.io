// Home page fallbacks, data wiring and odd viewports: node tools/check-home.js index.html  (file path or URL)
// (a) no WebGL: still page with the kitchen poster, same text, menu card reachable
// (b) prefers-reduced-motion: no pin, stacked layers, one frame drawn, Doughy holds still
// (c) 740x360 landscape phone and 820x1180 tablet frames at p = 0.655 and 0.72, for a look by eye
// (d) the "from ₹" lines (cards, featuring panel, chalkboard) follow js/menu-data.js
// (e) rotating a tablet across the 900 px breakpoint mid-journey keeps the cards on screen
// (f) the kitchen module cannot load (three.js fetch fails, or no import-map support): still page
// Every case runs; failures are listed at the end and the exit code is 1 if any failed.
const path = require('path'), fs = require('fs');
const { resolve } = require('./target');
const { launch, watch, open, gotoProgress, sleep } = require('./frame');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const target = process.argv[2] || 'index.html';
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const failures = [];
async function step(name, fn) {
  let browser;
  try { browser = await launch(fn.args); await fn(browser); console.log('ok   ' + name); }
  catch (e) { failures.push(name + ': ' + e.message); console.log('FAIL ' + name + ': ' + e.message); }
  finally { if (browser) await browser.close(); }
}

(async () => {
  const { url, close } = await resolve(target);

  const noWebGL = async (browser) => {
    const page = await browser.newPage(); const errs = []; watch(page, errs, 'nogl'); await page.setViewport(PHONE);
    await open(page, url);
    const a = await page.evaluate(() => ({
      nogl: document.body.classList.contains('no-webgl'),
      stat: document.body.classList.contains('static'),
      spacer: document.querySelector('.pin-spacer') !== null,
      bg: getComputedStyle(document.querySelector('.stage'), '::before').backgroundImage,
      canvas: getComputedStyle(document.getElementById('kitchen')).display,
      still: (function (el) { return el ? getComputedStyle(el).display : 'missing'; })(document.querySelector('.kicker .still')),
      short: getComputedStyle(document.querySelector('.kicker .short')).display
    }));
    assert(a.nogl, 'body should carry no-webgl when WebGL is unavailable');
    assert(a.canvas === 'none', 'the canvas should be hidden without WebGL, display was ' + a.canvas);
    assert(a.stat && !a.spacer, 'without WebGL the journey should not pin: it is a still page, got static=' + a.stat + ' pin-spacer=' + a.spacer);
    assert(/kitchen-poster/.test(a.bg), 'the stage should show the kitchen poster block without WebGL, ::before background was ' + a.bg);
    assert(a.still !== 'none' && a.short === 'none', 'the still page should not promise "scroll to watch him bake", kicker still=' + a.still + ' short=' + a.short);
    await page.screenshot({ path: path.join(OUT, 'nogl-phone-top.png') });
    await page.evaluate(() => document.getElementById('bakes').scrollIntoView()); await sleep(600);
    const guide = await page.evaluate(() => { const r = document.querySelector('.guide').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
    assert(guide, 'the menu card should be reachable by scrolling without WebGL');
    await page.screenshot({ path: path.join(OUT, 'nogl-phone-bakes.png') });
    const unexpected = errs.filter(e => !/WebGL unavailable/.test(e));
    assert(unexpected.length === 0, 'unexpected errors without WebGL: ' + unexpected.join(' | '));
  };
  noWebGL.args = ['--disable-3d-apis'];
  await step('(a) no WebGL', noWebGL);

  await step('(b) reduced motion', async (browser) => {
    const page = await browser.newPage(); const errs = []; watch(page, errs, 'static'); await page.setViewport(PHONE);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await open(page, url);
    const b = await page.evaluate(() => ({
      static: document.body.classList.contains('static'),
      spacer: document.querySelector('.pin-spacer') !== null,
      tall: document.documentElement.scrollHeight > innerHeight * 1.5,
      ready: document.getElementById('kitchen').classList.contains('ready'),
      bubble: getComputedStyle(document.getElementById('say')).display
    }));
    assert(b.static, 'body should carry static under prefers-reduced-motion');
    assert(!b.spacer, 'there should be no ScrollTrigger pin under reduced motion');
    assert(b.tall, 'the static page should be taller than the viewport');
    assert(b.ready, 'the kitchen should still draw its first frame under reduced motion');
    assert(b.bubble === 'none', 'the empty speech bubble should be hidden on the static page, display was ' + b.bubble);
    const y1 = await page.evaluate(() => window.BD.head && window.BD.head.y); await sleep(600);
    const y2 = await page.evaluate(() => window.BD.head && window.BD.head.y);
    assert(typeof y1 === 'number' && y1 === y2, 'under reduced motion Doughy should hold still (one frame, no idle bob), head y went ' + y1 + ' -> ' + y2);
    await page.screenshot({ path: path.join(OUT, 'static-phone.png'), fullPage: true });
    assert(errs.length === 0, 'errors under reduced motion: ' + errs.join(' | '));
  });

  await step('(c) landscape phone and tablet frames', async (browser) => {
    for (const [name, vp] of [['land', { width: 740, height: 360, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['tab', { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
      const page = await browser.newPage(); const errs = []; watch(page, errs, name);
      await page.setViewport(vp); await open(page, url);
      for (const p of [0.655, 0.72]) {
        await gotoProgress(page, p);
        await page.screenshot({ path: path.join(OUT, name + '-p' + p + '.png') });
      }
      if (name === 'land') {
        const bar = await page.evaluate(() => { const r = document.getElementById('featuring').getBoundingClientRect(); return { bottom: r.bottom, h: innerHeight }; });
        assert(bar.bottom > bar.h - 40, 'on a short viewport the featuring bar should hug the bottom edge, its bottom was ' + Math.round(bar.bottom) + ' of ' + bar.h);
      }
      assert(errs.length === 0, name + ' errors: ' + errs.join(' | '));
      await page.close();
    }
  });

  await step('(d) prices follow js/menu-data.js', async (browser) => {
    const page = await browser.newPage(); const errs = []; watch(page, errs, 'data');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    const data = fs.readFileSync(path.join(__dirname, '..', 'js', 'menu-data.js'), 'utf8');
    assert(data.includes('eggless: [108, 162, 218]'), 'this check expects the brown butter cookie at 108/162/218 in js/menu-data.js');
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (/\/js\/menu-data\.js$/.test(req.url())) req.respond({ status: 200, contentType: 'text/javascript', body: data.replace('eggless: [108, 162, 218]', 'eggless: [101, 162, 218]') });
      else req.continue();
    });
    await open(page, url);
    const card = await page.evaluate(() => document.querySelector('.pcard[data-k="1"] div span').textContent);
    assert(card === 'from ₹101 · box of 4', 'the cookies card should follow menu-data.js, was "' + card + '"');
    await gotoProgress(page, 0.85);
    const feat = await page.evaluate(() => ({ price: document.getElementById('f-price').textContent, unit: document.getElementById('f-unit').textContent, board: window.BD.from && window.BD.from[1] && window.BD.from[1].line }));
    assert(feat.price === 'from ₹101', 'the featuring price should follow menu-data.js, was "' + feat.price + '"');
    assert(feat.unit === '· box of 4 · eggless', 'the featuring unit should follow menu-data.js, was "' + feat.unit + '"');
    assert(feat.board === 'box of 4 · ₹101', 'the chalkboard line should follow menu-data.js, was "' + feat.board + '"');
    await page.screenshot({ path: path.join(OUT, 'data-desktop-p0.85.png') });
    assert(errs.length === 0, 'data case errors: ' + errs.join(' | '));
  });

  await step('(e) rotation across 900 px', async (browser) => {
    const page = await browser.newPage(); const errs = []; watch(page, errs, 'rotate');
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await open(page, url); await gotoProgress(page, 0.655);
    await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await sleep(800);
    await gotoProgress(page, 0.655); await sleep(300);
    const r = await page.evaluate(() => { const b = document.getElementById('cards').getBoundingClientRect(); return { left: b.left, right: b.right, w: innerWidth, narrow: document.body.classList.contains('narrow') }; });
    assert(r.left >= 0 && r.right <= r.w + 1, 'after rotating to landscape the cards should stay inside the viewport, were ' + Math.round(r.left) + '..' + Math.round(r.right) + ' of ' + r.w);
    assert(!r.narrow, 'body.narrow should be dropped once the viewport is 1180 px wide');
    await page.screenshot({ path: path.join(OUT, 'rotate-land.png') });
    assert(errs.length === 0, 'rotate case errors: ' + errs.join(' | '));
  });

  await step('(f) kitchen module cannot load', async (browser) => {
    let page = await browser.newPage(); let errs = []; watch(page, errs, 'nothree'); await page.setViewport(PHONE);
    await page.setRequestInterception(true);
    page.on('request', req => { if (/three\.module\.min\.js$/.test(req.url())) req.abort(); else req.continue(); });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 }); await sleep(1200);
    let f = await page.evaluate(() => ({ nogl: document.body.classList.contains('no-webgl'), stat: document.body.classList.contains('static'), spacer: document.querySelector('.pin-spacer') !== null }));
    assert(f.nogl && f.stat && !f.spacer, 'when the three.js bundle fails to load the page should become the still page, got ' + JSON.stringify(f));
    await page.screenshot({ path: path.join(OUT, 'nothree-phone.png') });
    await page.close();
    page = await browser.newPage(); errs = []; watch(page, errs, 'nomap'); await page.setViewport(PHONE);
    await page.evaluateOnNewDocument(() => { HTMLScriptElement.supports = () => false; });
    await open(page, url); await sleep(600);
    f = await page.evaluate(() => ({ nogl: document.body.classList.contains('no-webgl'), stat: document.body.classList.contains('static'), spacer: document.querySelector('.pin-spacer') !== null, ready: document.getElementById('kitchen').classList.contains('ready') }));
    assert(f.nogl && f.stat && !f.spacer && !f.ready, 'without import-map support the page should become the still page and the kitchen must not start, got ' + JSON.stringify(f));
  });

  close();
  if (failures.length) { console.log('home checks: ' + failures.length + ' failed'); process.exit(1); }
  console.log('home checks: ok');
})().catch(e => { console.error(e.message); process.exit(1); });
