// Dark mode: node tools/check-theme.js  (optional base URL, default: the repo served locally)
// 1 every page follows the system scheme until told otherwise (dark system -> dark page, no data-theme on <html>)
// 2 the nav toggle switches to light, the choice survives a reload, and the theme-color meta follows
// 3 with a light system the toggle switches to dark and remembers it
// 4 on the home page the kitchen still draws in dark mode and the glass panels go dark; the order form card is dark
// Screenshots of every page in dark mode land in tools/out/dark-*.png.
const fs = require('fs'), path = require('path');
const { resolve } = require('./target');
const { launch, watch, open, sleep } = require('./frame');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
function assert(cond, msg) { if (!cond) throw new Error('FAILED: ' + msg); }
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
// relative luminance of an rgb() string, 0 dark .. 1 light
const lum = s => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s || ''); if (!m) return -1; return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255; };
let browser;

(async () => {
  const base = process.argv[2];
  const srv = base ? { url: base.replace(/\/$/, '') + '/', close() {} } : await resolve('index.html');
  const root = srv.url.replace(/index\.html$/, '');
  browser = await launch();
  const state = page => page.evaluate(() => ({
    attr: document.documentElement.getAttribute('data-theme'),
    bg: getComputedStyle(document.body).backgroundColor,
    ink: getComputedStyle(document.body).color,
    meta: (document.querySelector('meta[name="theme-color"]') || {}).content,
    toggle: !!document.getElementById('theme'),
    label: (document.getElementById('theme') || {}).getAttribute && document.getElementById('theme').getAttribute('aria-label'),
    stored: (function () { try { return localStorage.getItem('theme'); } catch (e) { return 'n/a'; } })()
  }));

  for (const file of ['index.html', 'menu.html', '404.html']) {
    const page = await browser.newPage(); const errs = []; watch(page, errs, file); await page.setViewport(PHONE);
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.goto(root + file, { waitUntil: 'networkidle0', timeout: 90000 }); await sleep(600);
    await page.evaluate(() => { try { localStorage.removeItem('theme'); } catch (e) {} });
    await page.reload({ waitUntil: 'networkidle0' }); await sleep(600);
    // 1. follows the system
    let s = await state(page);
    assert(s.toggle, file + ': the nav should carry the theme toggle (#theme)');
    assert(!s.attr, file + ': following the system, <html> should carry no data-theme, had ' + s.attr);
    assert(lum(s.bg) < 0.25, file + ': with a dark system the page should be dark, body background was ' + s.bg);
    assert(lum(s.ink) > 0.6, file + ': dark page text should be light, was ' + s.ink);
    assert(/Switch to light/i.test(s.label || ''), file + ': in dark mode the toggle should offer light mode, label was ' + s.label);
    assert(s.meta && s.meta.toLowerCase() !== '#fff9f3', file + ': theme-color should follow the dark palette, was ' + s.meta);
    await page.screenshot({ path: path.join(OUT, 'dark-' + file.replace('.html', '') + '-phone.png') });
    // 2. the toggle switches to light and the choice survives a reload
    await page.click('#theme'); await sleep(300);
    s = await state(page);
    assert(s.attr === 'light' && lum(s.bg) > 0.9 && s.stored === 'light', file + ': the toggle should switch to light and remember it, got ' + JSON.stringify(s));
    assert(/Switch to dark/i.test(s.label || ''), file + ': in light mode the toggle should offer dark mode, label was ' + s.label);
    assert(s.meta && s.meta.toLowerCase() === '#fff9f3', file + ': theme-color should return to cream in light mode, was ' + s.meta);
    await page.reload({ waitUntil: 'networkidle0' }); await sleep(600);
    s = await state(page);
    assert(s.attr === 'light' && lum(s.bg) > 0.9, file + ': the light choice should survive a reload, got ' + JSON.stringify(s));
    // 3. light system, toggle to dark
    await page.evaluate(() => { try { localStorage.removeItem('theme'); } catch (e) {} });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.reload({ waitUntil: 'networkidle0' }); await sleep(600);
    s = await state(page);
    assert(!s.attr && lum(s.bg) > 0.9, file + ': with a light system and no choice the page should be light, got ' + JSON.stringify(s));
    await page.click('#theme'); await sleep(300);
    s = await state(page);
    assert(s.attr === 'dark' && lum(s.bg) < 0.25 && s.stored === 'dark', file + ': the toggle should switch to dark and remember it, got ' + JSON.stringify(s));
    assert(errs.length === 0, file + ' errors: ' + errs.join(' | '));
    await page.close();
  }

  // 4. the home page in dark mode: the kitchen draws, the overlay glass is dark, the headline stays cocoa on the daylight kitchen
  {
    const page = await browser.newPage(); const errs = []; watch(page, errs, 'home-dark');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.evaluate(() => { try { localStorage.removeItem('theme'); } catch (e) {} }).catch(() => {});
    await open(page, root + 'index.html'); await sleep(1500);
    const h = await page.evaluate(() => ({
      ready: document.getElementById('kitchen').classList.contains('ready'),
      steps: getComputedStyle(document.getElementById('steps')).backgroundColor,
      headline: getComputedStyle(document.getElementById('headline')).color,
      card: getComputedStyle(document.querySelector('.pcard')).backgroundColor,
      say: getComputedStyle(document.getElementById('say')).backgroundColor
    }));
    assert(h.ready, 'the kitchen should draw in dark mode');
    assert(lum(h.steps) < 0.35, 'the recipe chips glass should be dark in dark mode, was ' + h.steps);
    assert(lum(h.card) < 0.35 && lum(h.say) < 0.35, 'the night cards and the bubble should be dark in dark mode, were ' + h.card + ' / ' + h.say);
    assert(lum(h.headline) < 0.4, 'the headline stays cocoa over the daylight kitchen, was ' + h.headline);
    await page.screenshot({ path: path.join(OUT, 'dark-home-desktop.png') });
    await page.click('.nav .pill.wa'); await sleep(400);
    const od = await page.evaluate(() => ({ bg: getComputedStyle(document.querySelector('.od-card')).backgroundColor, input: getComputedStyle(document.getElementById('od-name')).backgroundColor }));
    assert(lum(od.bg) < 0.25 && lum(od.input) < 0.35, 'the order form should be dark in dark mode, card ' + od.bg + ' input ' + od.input);
    await page.screenshot({ path: path.join(OUT, 'dark-order-desktop.png') });
    assert(errs.length === 0, 'home dark errors: ' + errs.join(' | '));
    await page.close();
  }
  await browser.close(); srv.close();
  console.log('theme checks: ok');
})().catch(async e => { console.error(e.message); if (browser) await browser.close().catch(() => {}); process.exit(1); });
