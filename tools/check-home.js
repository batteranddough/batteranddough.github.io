// Home page fallbacks and odd viewports: node tools/check-home.js index.html  (file path or URL)
// (a) no WebGL: the poster shows under the same text and the page still reaches the menu card
// (b) prefers-reduced-motion: no pin, stacked layers, whole page scrollable
// (c) 740x360 landscape phone and 820x1180 tablet frames at p = 0.655 and 0.72, for a look by eye
const path = require('path'), fs = require('fs');
const { resolve } = require('./target');
const { launch, watch, open, gotoProgress, sleep } = require('./frame');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const target = process.argv[2] || 'index.html';
function assert(cond, msg) { if (!cond) throw new Error('FAILED: ' + msg); }
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

(async () => {
  const { url, close } = await resolve(target);

  // (a) no WebGL
  {
    const browser = await launch(['--disable-3d-apis']); const page = await browser.newPage(); const errs = [];
    watch(page, errs, 'nogl'); await page.setViewport(PHONE);
    await open(page, url);
    const a = await page.evaluate(() => ({
      nogl: document.body.classList.contains('no-webgl'),
      bg: getComputedStyle(document.querySelector('.stage')).backgroundImage,
      canvas: getComputedStyle(document.getElementById('kitchen')).display,
      headline: getComputedStyle(document.getElementById('headline')).opacity
    }));
    assert(a.nogl, 'body should carry no-webgl when WebGL is unavailable');
    assert(a.canvas === 'none', 'the canvas should be hidden without WebGL, display was ' + a.canvas);
    assert(/kitchen-poster/.test(a.bg), 'the stage should show the kitchen poster without WebGL, background was ' + a.bg);
    await page.screenshot({ path: path.join(OUT, 'nogl-phone-top.png') });
    await page.evaluate(() => document.getElementById('bakes').scrollIntoView()); await sleep(600);
    const guide = await page.evaluate(() => { const r = document.querySelector('.guide').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
    assert(guide, 'the menu card should be reachable by scrolling without WebGL');
    await page.screenshot({ path: path.join(OUT, 'nogl-phone-bakes.png') });
    const unexpected = errs.filter(e => !/WebGL unavailable/.test(e));
    assert(unexpected.length === 0, 'unexpected errors without WebGL: ' + unexpected.join(' | '));
    await browser.close();
  }

  // (b) reduced motion
  {
    const browser = await launch(); const page = await browser.newPage(); const errs = [];
    watch(page, errs, 'static'); await page.setViewport(PHONE);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await open(page, url);
    const b = await page.evaluate(() => ({
      static: document.body.classList.contains('static'),
      spacer: document.querySelector('.pin-spacer') !== null,
      tall: document.documentElement.scrollHeight > innerHeight * 1.5,
      ready: document.getElementById('kitchen').classList.contains('ready'),
      bubble: getComputedStyle(document.getElementById('say')).display
    }));
    assert(b.bubble === 'none', 'the empty speech bubble should be hidden on the static page, display was ' + b.bubble);
    assert(b.static, 'body should carry static under prefers-reduced-motion');
    assert(!b.spacer, 'there should be no ScrollTrigger pin under reduced motion');
    assert(b.tall, 'the static page should be taller than the viewport');
    assert(b.ready, 'the kitchen should still draw its first frame under reduced motion');
    await page.screenshot({ path: path.join(OUT, 'static-phone.png'), fullPage: true });
    assert(errs.length === 0, 'errors under reduced motion: ' + errs.join(' | '));
    await browser.close();
  }

  // (c) odd viewports
  {
    const browser = await launch();
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
    await browser.close();
  }

  close();
  console.log('home checks: ok');
})().catch(e => { console.error(e.message); process.exit(1); });
