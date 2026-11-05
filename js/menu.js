(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('pageshow', function (e) { if (e.persisted && !location.hash) window.scrollTo(0, 0); });
  var MD = window.MENU_DATA, egg = 0;
  var EGG = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z\" fill=\"currentColor\" opacity=\".18\"/><path d=\"M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><circle cx=\"12\" cy=\"13.6\" r=\"2.6\" fill=\"currentColor\"/></svg>", NOEGG = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z\" fill=\"currentColor\" opacity=\".18\"/><path d=\"M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M5 19.5 19 4.5\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/></svg>";
  function thumb(p) { return p.replace(/^photos\//, 'photos/thumbs/').replace(/\.jpg$/, '.webp'); }
  var chips = document.getElementById('chips'), main = document.getElementById('menu');
  function hasPhoto(c) { return c.items.some(function (i) { return !!i.photo; }) ? 1 : 0; }
  // categories with real photos first; anything not for sale yet (soon) goes last whatever its photos
  var CATS = MD.categories.slice().sort(function (a, b) { return ((a.soon ? 1 : 0) - (b.soon ? 1 : 0)) || (hasPhoto(b) - hasPhoto(a)); });
  chips.innerHTML = CATS.map(function (c) { return '<a href="#' + c.id + '" data-id="' + c.id + '">' + c.short + '</a>'; }).join('');
  function price(it, i) { return (egg ? it.egg : it.eggless)[i]; }
  function media(c, it) {
    if (!it.photo) return '<img class="soon" src="photos/doughy-soon-sm.webp" width="312" height="360" alt="Product shot coming soon" loading="lazy" decoding="async">';
    var ph = [it.photo].concat(it.photo2 ? [it.photo2] : []);
    return '<button type="button" class="zoomer" data-photos="' + ph.join('|') + '" data-name="' + it.name + '" aria-label="View photos of ' + it.name + '">' +
      '<img src="' + thumb(it.photo) + '" width="480" height="360" alt="' + it.name + '" loading="lazy" decoding="async">' + (it.photo2 ? '<span class="inset"><img src="' + thumb(it.photo2) + '" width="480" height="360" alt="" loading="lazy" decoding="async"></span>' : '') +
      '<span class="zoom" aria-hidden="true">&#x2922;<em>' + ph.length + ' photo' + (ph.length > 1 ? 's' : '') + '</em></span></button>';
  }
  function render() {
    main.innerHTML = CATS.map(function (c) {
      var badge = c.soon ? '<span class="rev" title="Not taking orders for these yet">Coming soon</span>' : c.review ? '<span class="rev" title="' + c.review + '">to confirm</span>' : '';
      return '<section class="cat' + (c.id === 'combos' ? ' combos' : '') + (c.soon ? ' soon' : '') + '" id="' + c.id + '" style="--tint:' + c.tint + '"><header><h2><i>' + c.emoji + '</i>' + c.name + badge + '</h2><p>' + c.blurb + '</p></header><div class="grid">' +
        c.items.map(function (it, i) { return { it: it, i: i }; }).sort(function (a, b) { return (b.it.photo ? 1 : 0) - (a.it.photo ? 1 : 0); }).map(function (x) {
          var it = x.it, head = '<article class="item"><div class="media">' + media(c, it) + '</div><div class="body"><h3>' + it.name + '</h3><p class="tag">' + it.tag + '</p>';
          if (c.soon) return head + '<p class="soon">Coming soon</p></div></article>';
          var priced = MD.priced(it);
          var sizes = priced ? c.sizes.map(function (sz, i) { return '<span class="sz"><small>' + sz + '</small><b>₹' + price(it, i) + '</b></span>'; }).join('') : '<span class="ask">Price on request</span>';
          var msg = "Hi Batter & Dough! I'd like " + it.name + (priced && c.sizes.length > 1 ? ' (' + c.sizes[0].toLowerCase() + ')' : '') + ', ' + (egg ? 'with egg' : 'eggless') + (priced ? '.' : '. What would it cost?');
          return head + '<div class="sizes">' + sizes + '</div>' + (it.note ? '<p class="note">' + it.note + '</p>' : '') + '<div class="act"><span class="egg' + (egg ? ' with' : '') + '" title="' + (egg ? 'With egg' : 'Eggless') + '">' + (egg ? EGG : NOEGG) + '<i class="vh">' + (egg ? 'with egg' : 'eggless') + '</i></span><a class="pill ghost wa" href="' + MD.waLink(msg) + '" target="_blank" rel="noopener" data-order="' + c.id + ':' + x.i + '">Order</a></div></div></article>';
        }).join('') + '</div></section>';
    }).join('');
  }
  render();
  Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (b) { b.addEventListener('click', function () { egg = +b.getAttribute('data-e'); Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (x) { x.classList.toggle('on', x === b); }); render(); }); });
  // scroll-spy for the chips
  var links = chips.querySelectorAll('a');
  function spy() {
    var y = window.scrollY + 140, cur = CATS[0].id;
    CATS.forEach(function (c) { var el = document.getElementById(c.id); if (el && el.offsetTop <= y) cur = c.id; });
    Array.prototype.forEach.call(links, function (a) { var on = a.getAttribute('data-id') === cur; a.classList.toggle('on', on); if (on && a.scrollIntoView && window.innerWidth < 900) { /* keep the active chip visible */ var r = a.getBoundingClientRect(), p = chips.getBoundingClientRect(); if (r.left < p.left || r.right > p.right) chips.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); } });
  }
  // lightbox
  var lb = document.getElementById('lb'), lbs = document.getElementById('lbs'), lbc = document.getElementById('lbc');
  function openLb(btn) {
    var ph = btn.getAttribute('data-photos').split('|'), name = btn.getAttribute('data-name');
    lbs.innerHTML = ph.map(function (p) { return '<img src="' + p + '" alt="' + name + '" decoding="async">'; }).join('');
    lbc.innerHTML = name + '<small>' + (ph.length > 1 ? 'swipe for the next photo &middot; ' : '') + 'tap anywhere to close</small>';
    lb.hidden = false; document.body.style.overflow = 'hidden'; lbs.scrollLeft = 0;
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  main.addEventListener('click', function (e) { var b = e.target.closest ? e.target.closest('.zoomer') : null; if (b) { e.preventDefault(); openLb(b); } });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  window.addEventListener('scroll', spy, { passive: true }); spy();
})();
