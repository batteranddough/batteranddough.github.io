// Head metadata, icons, share image, README and the 404 page: node tools/check-pages.js
const fs = require('fs'), path = require('path');
const { resolve } = require('./target');
const { launch, watch, sleep } = require('./frame');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
function assert(cond, msg) { if (!cond) throw new Error('FAILED: ' + msg); }
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) throw new Error('not a JPEG');
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xC3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('JPEG without a frame header');
}

(async () => {
  const SITE = 'https://batteranddough.github.io/';
  const pages = [
    ['index.html', 'Batter &amp; Dough · Home bakery in Solapur', SITE],
    ['menu.html', 'Batter &amp; Dough · Menu', SITE + 'menu.html']
  ];
  for (const [file, title, canonical] of pages) {
    const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert(s.includes('<title>' + title + '</title>'), file + ' title should be ' + title);
    const needed = [
      '<meta name="description" content="',
      '<meta name="theme-color" content="#FFF9F3">',
      '<meta property="og:title" content="',
      '<meta property="og:description" content="',
      '<meta property="og:image" content="' + SITE + 'img/og.jpg">',
      '<meta property="og:url" content="' + canonical + '">',
      '<meta name="twitter:card" content="summary_large_image">',
      '<link rel="icon" href="favicon.png"',
      '<link rel="apple-touch-icon" href="apple-touch-icon.png">'
    ];
    for (const k of needed) assert(s.includes(k), file + ' lacks ' + k);
    assert(!/Prototype/.test(s), file + ' still says Prototype');
  }

  const og = path.join(ROOT, 'img', 'og.jpg');
  assert(fs.existsSync(og), 'img/og.jpg is missing');
  const size = jpegSize(fs.readFileSync(og));
  assert(size.w === 1200 && size.h === 630, 'og.jpg should be 1200x630, is ' + size.w + 'x' + size.h);
  assert(fs.statSync(og).size < 200 * 1024, 'og.jpg should be under 200 KB, is ' + fs.statSync(og).size);
  for (const f of ['favicon.png', 'apple-touch-icon.png', '404.html', 'README.md', '.nojekyll']) assert(fs.existsSync(path.join(ROOT, f)), f + ' is missing');
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert(readme.includes('js/menu-data.js') && readme.includes('tools/serve.js'), 'README should say where prices live and how to preview');

  // the 404 page renders with its heading and both ways out
  const { url, close } = await resolve(path.join(ROOT, '404.html'));
  const browser = await launch(); const page = await browser.newPage(); const errs = []; watch(page, errs, '404');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }); await sleep(500);
  const nf = await page.evaluate(() => ({
    h1: document.querySelector('main h1') && document.querySelector('main h1').textContent.trim(),
    links: Array.from(document.querySelectorAll('main a')).map(a => a.getAttribute('href'))
  }));
  assert(nf.h1 === "Nothing's baking here.", '404 heading should be "Nothing\'s baking here.", got ' + nf.h1);
  assert(nf.links.includes('/') && nf.links.includes('/menu.html'), '404 should link to / and /menu.html, got ' + nf.links.join(', '));
  await page.screenshot({ path: path.join(OUT, 'e-phone-top.png') });
  assert(errs.length === 0, '404 page errors: ' + errs.join(' | '));
  await browser.close(); close();
  console.log('page checks: ok');
})().catch(e => { console.error(e.message); process.exit(1); });
