/* Light or dark. The page follows the system until the visitor taps the toggle in the nav; the choice is kept in
   localStorage for this device and applied here, before first paint, so there is no flash. Loaded in <head>. */
(function () {
  var root = document.documentElement, KEY = 'theme', mq = window.matchMedia('(prefers-color-scheme: dark)');
  function saved() { try { var t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } }
  var s = saved(); if (s) root.setAttribute('data-theme', s);
  function current() { return root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light'); }
  function paint() {
    var dark = current() === 'dark', b = document.getElementById('theme'), m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', (getComputedStyle(root).getPropertyValue('--cream') || '#FFF9F3').trim());
    if (b) { var l = dark ? 'Switch to light mode' : 'Switch to dark mode'; b.setAttribute('aria-label', l); b.title = l; }
  }
  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) { /* private mode: the choice lasts for this page only */ } root.setAttribute('data-theme', t); paint(); }
  document.addEventListener('DOMContentLoaded', function () {
    paint();
    var b = document.getElementById('theme');
    if (b) b.addEventListener('click', function () { set(current() === 'dark' ? 'light' : 'dark'); });
    if (mq.addEventListener) mq.addEventListener('change', paint);
  });
})();
