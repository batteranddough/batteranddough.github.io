// Resolve a tool target. An http(s) URL is used as-is. A file path is served from the repo root over a
// throwaway local HTTP server, because ES modules (js/kitchen.js) cannot load from file:// URLs.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon', txt: 'text/plain', woff2: 'font/woff2' };

function handler(req, res) {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const nf = path.join(ROOT, '404.html');
    if (fs.existsSync(nf)) { res.writeHead(404, { 'content-type': TYPES.html }); fs.createReadStream(nf).pipe(res); return; }
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f).slice(1).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}

function serve(port) { return new Promise(resolve => { const srv = http.createServer(handler); srv.listen(port || 0, '127.0.0.1', () => resolve(srv)); }); }

async function resolve(target) {
  if (/^https?:/.test(target)) return { url: target, close() {} };
  const srv = await serve();
  const rel = path.relative(ROOT, path.resolve(target)).split(path.sep).join('/');
  return { url: 'http://127.0.0.1:' + srv.address().port + '/' + rel, close() { srv.close(); } };
}

module.exports = { resolve, serve, ROOT };
