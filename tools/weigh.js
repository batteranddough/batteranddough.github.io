// Bytes a first visit transfers: node tools/weigh.js <html-or-url> [phone|desktop]
// Sums every response body (HTML, CSS, JS, fonts, images, including Google Fonts) for a cold load.
const { resolve } = require('./target');
const { launch } = require('./frame');
const target = process.argv[2] || 'index.html', view = process.argv[3] || 'phone';

(async () => {
  const { url, close } = await resolve(target);
  const browser = await launch(); const page = await browser.newPage();
  await page.setViewport(view === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 800, deviceScaleFactor: 1 });
  const rows = [];
  page.on('response', async r => {
    try {
      const h = r.headers(); let n = h['content-length'] ? +h['content-length'] : 0;
      if (!n) { try { n = (await r.buffer()).length; } catch (e) { n = 0; } }
      rows.push({ url: r.url(), status: r.status(), bytes: n, type: (h['content-type'] || '').split(';')[0] });
    } catch (e) { /* ignore */ }
  });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await new Promise(r => setTimeout(r, 1500));
  const total = rows.reduce((s, r) => s + r.bytes, 0);
  const by = {};
  for (const r of rows) { const k = /font/.test(r.type) || /fonts\.gstatic/.test(r.url) ? 'fonts' : /javascript/.test(r.type) ? 'js' : /css/.test(r.type) ? 'css' : /image/.test(r.type) ? 'images' : 'html+other'; by[k] = (by[k] || 0) + r.bytes; }
  console.log(target, view, 'requests', rows.length, 'total', (total / 1024).toFixed(0) + ' KB');
  for (const k of Object.keys(by)) console.log('  ' + k.padEnd(10), (by[k] / 1024).toFixed(0) + ' KB');
  rows.sort((a, b) => b.bytes - a.bytes).slice(0, 6).forEach(r => console.log('  ' + (r.bytes / 1024).toFixed(0).padStart(5) + ' KB  ' + r.url.replace(/^https?:\/\/[^/]+\//, '/').slice(0, 90)));
  await browser.close(); close();
})().catch(e => { console.error(e.message); process.exit(1); });
