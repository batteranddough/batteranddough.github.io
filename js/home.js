(function () {
  var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // the page decides here, before the pin exists, whether the kitchen can run at all (WebGL and import maps);
  // when it cannot, the journey is a still page: no pin, the kitchen poster, the same text
  function hasWebGL() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  var canRun = hasWebGL() && !!(window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('importmap'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !canRun;
  var narrow = window.innerWidth < 900;
  var body = document.body;
  if (!canRun) body.classList.add('no-webgl');
  if (reduce) body.classList.add('static');
  function setNarrow() { narrow = window.innerWidth < 900; if (F) F.narrow = narrow; body.classList.toggle('narrow', narrow); }
  setNarrow(); window.addEventListener('resize', setNarrow);

  // the day is the first 62% of the scroll, the night showcase the rest
  var DAY = 0.62, Q0 = 0.12, QL = 0.3;
  var F = window.BD = {
    p: 0, s: 0, visible: true, reduce: reduce, narrow: narrow, st: null, activeK: 0, DAY: DAY, Q0: Q0, QL: QL, snap: false,
    split: function (p) { return { hp: clamp01(p / DAY), q: clamp01((p - DAY) / (1 - DAY)) }; },
    hourAt: function (hp) {
      var K = [[0, 6.5], [0.17, 7.1], [0.26, 9.3], [0.39, 10.4], [0.47, 12.6], [0.59, 13.6], [0.67, 16.2], [0.84, 17.8], [0.92, 18.6], [1, 19.4]];
      if (hp <= 0) return 6.5;
      for (var i = 1; i < K.length; i++) if (hp <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (hp - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
      return 19.4;
    }
  };
  F.segment = function (q) { var k = q < Q0 ? 0 : Math.min(2, Math.floor((q - Q0) / QL)); return { k: k, u: clamp01((q - (Q0 + k * QL)) / QL) }; };

  // ---------- headline split ----------
  var headline = document.getElementById('headline');
  var chars = [];
  Array.prototype.forEach.call(headline.querySelectorAll('.line'), function (line) {
    var nodes = Array.prototype.slice.call(line.childNodes); line.textContent = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        var text = n.textContent;
        for (var i = 0; i < text.length; i++) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = text[i] === ' ' ? ' ' : text[i]; line.appendChild(s); chars.push(s); }
      } else { n.classList.add('ch'); line.appendChild(n); chars.push(n); }
    });
  });
  var introDone = reduce, introTw = null;

  var l1extras = document.getElementById('l1extras');
  var kicker = document.getElementById('kicker');
  var scrollbtn = document.getElementById('scrollbtn');
  var say = document.getElementById('say'), sayText = document.getElementById('saytext'), sayLast = '';
  var stepsEl = document.getElementById('steps'), stepEls = stepsEl.querySelectorAll('button'), dialEl = stepsEl.querySelector('.dial');
  var t0 = performance.now();
  var lastStep = -2;
  function updateSteps(hp, q) {
    var step = hp < 0.19 ? -1 : hp < 0.47 ? 0 : hp < 0.60 ? 1 : hp < 0.87 ? 2 : 3;
    if (step !== lastStep) {
      lastStep = step;
      Array.prototype.forEach.call(stepEls, function (el, i) { el.classList.toggle('on', i === step); el.classList.toggle('done', i < step); el.classList.toggle('baking', i === 2 && step === 2); });
    }
    if (step === 2) dialEl.style.setProperty('--k', smooth(0.745, 0.835, hp).toFixed(3));
    var stepsO = 1 - smooth(0.0, 0.04, q);
    stepsEl.style.opacity = stepsO; stepsEl.style.pointerEvents = stepsO > 0.5 ? 'auto' : 'none';
  }

  function updateDayOverlay(hp, q) {
    var N = chars.length, i, th, o, s;
    if (!introDone && introTw && hp > 0.06) introTw.progress(1);
    if (introDone) {
      for (i = 0; i < N; i++) {
        th = 0.11 + ((N - 1 - i) / (N - 1)) * 0.08;
        o = 1 - smooth(th - 0.012, th + 0.012, hp);
        s = chars[i].style; s.opacity = o; s.transform = 'translateY(' + ((1 - o) * 16) + 'px)'; s.filter = o < 0.999 ? 'blur(' + ((1 - o) * 5) + 'px)' : 'none';
      }
    }
    updateSteps(hp, q);
    l1extras.style.opacity = 1 - smooth(0.16, 0.24, hp);
    kicker.style.opacity = 1 - smooth(0.08, 0.16, hp);
    scrollbtn.style.opacity = 1 - smooth(0.03, 0.09, hp);
    scrollbtn.style.pointerEvents = hp > 0.09 ? 'none' : 'auto';

    var x;
    if (hp < 0.24) x = 110; else if (hp < 0.30) x = lerp(110, 6, smooth(0.24, 0.30, hp)); else if (hp < 0.39) x = lerp(6, -3, (hp - 0.30) / 0.09); else x = lerp(-3, -130, smooth(0.39, 0.46, hp));


  }

  // the kitchen module could not load (its bundle failed to fetch): fall back to the still page
  F.fail = function () {
    if (body.classList.contains('no-webgl')) return;
    body.classList.add('no-webgl', 'static'); reduce = true; F.reduce = true;
    if (F.st) { F.st.kill(true); F.st = null; }
    nav.classList.add('solid');
  };

  // ---------- Doughy's lines: typed into a bubble by his head while he holds at each station ----------
  // day lines run on hp; night lines run on q, or on u inside one showcase segment (k)
  // the first line is the invitation to scroll: it types by itself about a second after the headline lands
  // (intro: true), so a visitor who has not touched the page yet is told what to do; it fades by scroll like the rest
  var SAYS = [
    { a: 0.0, b: 0.125, intro: true, t: "Hi! I'm Doughy. Scroll down and watch me bake ↓" },
    { a: 0.29, b: 0.40, t: "Brown butter first. Then the chocolate. A lot of the chocolate." },
    { a: 0.49, b: 0.585, t: "Cookies, rolls, bombolone. All rolled by hand, eggless or with egg." },
    { a: 0.76, b: 0.815, t: "Twelve minutes. I won't peek. ...I peeked." },
    { a: 0.915, b: 0.985, t: "Today's batch, done. Order tonight, it's baked tomorrow morning." }
  ];
  var NIGHT_SAYS = [
    { q: true, a: 0.015, b: 0.115, t: "Lights down. Three to start with. My favourites." },
    { k: 0, a: 0.30, b: 0.80, fade: 0.04, type: 0.16, t: "Bombolone. Fried fresh, filled to the brim." },
    { k: 1, a: 0.30, b: 0.80, fade: 0.04, type: 0.16, t: "Cookies. Crisp edge, gooey middle." },
    { k: 2, a: 0.30, b: 0.80, fade: 0.04, type: 0.16, t: "Cinnamon rolls. Still warm when they reach you." },
    { k: 2, a: 0.87, b: 1.0, fade: 0.03, type: 0.08, t: "The whole menu is just below. Come." }
  ];
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function updateSay(hp, q) {
    var h = F.head, line = null, v = hp, i;
    if (q <= 0) { for (i = 0; i < SAYS.length; i++) if (hp >= SAYS[i].a && hp <= SAYS[i].b) { line = SAYS[i]; break; } }
    else {
      var sg = F.segment(q);
      for (i = 0; i < NIGHT_SAYS.length; i++) { var L = NIGHT_SAYS[i], x = L.q ? q : (q >= Q0 && sg.k === L.k ? sg.u : -1); if (x >= L.a && x <= L.b) { line = L; v = x; break; } }
    }
    if (!line || !h || !h.on) { say.style.opacity = 0; return; }
    var a = line.a, b = line.b, fd = line.fade || 0.012, tl = line.type || Math.min(0.045, (b - a) * 0.55);
    if (line.intro) v = Math.max(v, a + (fd + tl) * clamp01((performance.now() - t0 - 1000) / 1600));
    var k = smooth(a, a + fd, v) * (1 - smooth(b - fd * 1.5, b, v));
    var n = Math.round(line.t.length * smooth(a, a + tl, v)), txt = line.t.slice(0, n);
    if (txt !== sayLast) { sayText.innerHTML = esc(txt) + (n < line.t.length ? '<i class="cur"></i>' : ''); sayLast = txt; }
    var w = window.innerWidth, hh = window.innerHeight, bw = say.offsetWidth, bh = say.offsetHeight;
    var x = Math.min(Math.max(h.x + 12, 12), w - bw - 12), y = Math.min(Math.max(h.y - 14, bh + (narrow ? 118 : 90)), hh - 24);
    say.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y - bh) + 'px)';
    say.style.opacity = k;
  }

  // ---------- the night overlay ----------
  var PRODUCTS = [
    { name: 'Chocolate Bombolone', tag: 'Pillowy, filled to the brim', price: '', unit: '', feats: ['Fried fresh, rolled in sugar', 'Chocolate or crème brûlée filling', 'Boxes of 3 and 6'] },
    { name: 'Cookies', tag: 'Crisp edge, gooey middle', price: '', unit: '', feats: ['Double chocolate chip, toffee, brownie', 'Boxes of 4, 6 and 8', 'Baked the morning you order'] },
    { name: 'Cinnamon rolls', tag: 'Soft, sticky, still warm', price: '', unit: '', feats: ['Classic or chocolate', 'Cream cheese glaze', 'Boxes of 4, 6 and 8'] }
  ];
  // the "from ₹" lines come from js/menu-data.js, the one place prices live (cards, featuring panel, and the chalkboard in the kitchen)
  var MD = window.MENU_DATA;
  F.from = ['bombolone', 'cookies', 'rolls'].map(function (id) {
    var c = MD.categories.filter(function (c) { return c.id === id; })[0], size = c.sizes[0].toLowerCase(), price = MD.fromPrice(c);
    return { price: 'from ₹' + price, unit: '· ' + size + ' · eggless', line: size + ' · ₹' + price };
  });
  PRODUCTS.forEach(function (P, k) { P.price = F.from[k].price; P.unit = F.from[k].unit; });
  var cardsEl = document.getElementById('cards'), featEl = document.getElementById('featuring'), counterEl = document.getElementById('counter');
  var cardEls = cardsEl.querySelectorAll('.pcard');
  Array.prototype.forEach.call(cardEls, function (c, k) { c.querySelector(':scope > div > span').textContent = F.from[k].price + ' ' + F.from[k].unit.replace(/ · eggless$/, ''); });
  function setActiveProduct(k) {
    F.activeK = k; var P = PRODUCTS[k];
    Array.prototype.forEach.call(cardEls, function (c, i) { c.classList.toggle('active', i === k); });
    document.getElementById('f-name').textContent = P.name; document.getElementById('f-tag').textContent = P.tag;
    document.getElementById('f-price').textContent = P.price; document.getElementById('f-unit').textContent = P.unit;
    document.getElementById('f-list').innerHTML = P.feats.map(function (f) { return '<li>' + f + '</li>'; }).join('');
    document.getElementById('f-link').href = 'menu.html#' + ['bombolone', 'cookies', 'rolls'][k];
    counterEl.textContent = '0' + (k + 1) + ' / 03';
  }
  setActiveProduct(0);
  function updateNightOverlay(q) {
    var sg = F.segment(q), k = sg.k, u = sg.u;
    if (k !== F.activeK) setActiveProduct(k);
    var on = smooth(0.03, 0.09, q);
    var featO = q < Q0 ? 0 : smooth(0.3, 0.4, u) * (1 - smooth(0.7, 0.78, u));
    var cardsO = q < Q0 ? smooth(0.06, 0.11, q) : Math.max(1 - smooth(0.05, 0.25, u), smooth(0.8, 0.92, u));
    cardsEl.style.opacity = cardsO; cardsEl.style.transform = (narrow ? '' : 'translateX(-50%) ') + 'translateY(' + ((1 - cardsO) * 30) + 'px)';
    cardsEl.style.pointerEvents = cardsO > 0.5 ? 'auto' : 'none';
    featEl.style.opacity = featO; featEl.style.transform = narrow ? 'translateY(' + ((1 - featO) * 20) + 'px)' : 'translateY(calc(-50% + ' + ((1 - featO) * 20) + 'px))';
    counterEl.style.opacity = featO;
  }
  // ---------- taking the visitor somewhere: a slow tween of the scroll position, so Doughy is seen getting there ----------
  // about 1.1 s per viewport of distance plus 0.9 s, within 1.2 s to 4 s; any wheel, touch or key input hands the scroll back
  var scrollTw = null;
  function stopScroll() { if (scrollTw) { scrollTw.kill(); scrollTw = null; } }
  function scrollJourneyTo(p) {
    var st = F.st; if (!st) return;
    var to = Math.round(st.start + (st.end - st.start) * p);
    if (!window.gsap) { window.scrollTo({ top: to, behavior: 'smooth' }); return; }
    stopScroll();
    var o = { y: window.scrollY }, dur = Math.min(4, Math.max(1.2, 0.9 + 1.1 * Math.abs(to - o.y) / window.innerHeight));
    scrollTw = gsap.to(o, { y: to, duration: dur, ease: 'power2.inOut', onUpdate: function () { window.scrollTo(0, o.y); }, onComplete: function () { scrollTw = null; } });
  }
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, stopScroll, { passive: true }); });
  F.scrolling = function () { return !!scrollTw; };
  var STATION_HP = [0.30, 0.50, 0.77, 0.94]; // mix, roll, bake, box: inside each hold, where Doughy is at work
  function scrollToProduct(k) { scrollJourneyTo(DAY + (Q0 + k * QL + 0.45 * QL) * (1 - DAY)); }
  Array.prototype.forEach.call(cardEls, function (c) { c.addEventListener('click', function (e) { if (F.st) { e.preventDefault(); scrollToProduct(+c.getAttribute('data-k')); } }); });
  Array.prototype.forEach.call(stepEls, function (b) { b.addEventListener('click', function () { scrollJourneyTo(STATION_HP[+b.getAttribute('data-s')] * DAY); }); });
  document.getElementById('scrollbtn').addEventListener('click', function () { scrollJourneyTo(STATION_HP[0] * DAY); });

  // ---------- the single pin ----------
  var nav = document.getElementById('nav');
  var sec = document.getElementById('journey');
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    F.st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=700%', pin: true, anticipatePin: 1, onUpdate: function (self) { F.p = self.progress; } });
    ScrollTrigger.create({ trigger: document.getElementById('bakes'), start: 'top 70%', onEnter: function () { nav.classList.add('solid'); }, onLeaveBack: function () { nav.classList.remove('solid'); } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else { nav.classList.add('solid'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { F.visible = e.isIntersecting; }); }, { threshold: 0 });
    io.observe(sec);
  }

  // ---------- overlay loop (smoothed progress gives the scrubbed inertia) ----------
  function loop() {
    F.s += (F.p - F.s) * 0.1; if (Math.abs(F.p - F.s) < 0.0003 || F.snap) F.s = F.p;
    if (!reduce && F.visible) { var sp = F.split(F.s); updateDayOverlay(sp.hp, sp.q); updateNightOverlay(sp.q); updateSay(sp.hp, sp.q); }
    requestAnimationFrame(loop);
  }
  if (!reduce) { updateDayOverlay(0, 0); updateNightOverlay(0); }
  requestAnimationFrame(loop);

  // ---------- entrance ----------
  if (window.gsap && !reduce) {
    introTw = gsap.from(chars, { opacity: 0, y: 30, filter: 'blur(8px)', duration: 0.8, stagger: 0.04, ease: 'power3.out', delay: 0.35, onComplete: function () { gsap.set(chars, { clearProps: 'all' }); introDone = true; } });
    gsap.from('.ritem', { x: 36, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.7, clearProps: 'all' });
  }

})();
