/* The order form. Every Order button (data-order) opens one dialog: bakes with size, egg choice and quantity, the day it is
   needed, delivery or pickup, a name and notes. "Send on WhatsApp" composes the message and opens the chat; nothing is stored.
   The buttons keep their wa.me href, so without JavaScript they still open a chat. Reads js/menu-data.js. */
(function () {
  var MD = window.MENU_DATA; if (!MD) return;
  var EGG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z" fill="currentColor" opacity=".18"/><path d="M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="13.6" r="2.6" fill="currentColor"/></svg>';
  var NOEGG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z" fill="currentColor" opacity=".18"/><path d="M12 2.8c-3.4 0-6.6 5-6.6 10a6.6 6.6 0 0 0 13.2 0c0-5-3.2-10-6.6-10z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 19.5 19 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var fmt = function (d) { return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var tomorrow = function () { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + 1); return d; };
  var cats = MD.categories.filter(function (c) { return !c.soon; }), byId = {};
  cats.forEach(function (c) { byId[c.id] = c; });
  var find = function (key) { var p = (key || '').split(':'), c = byId[p[0]]; return c && c.items[+p[1]] ? { c: c, it: c.items[+p[1]], i: +p[1] } : null; };
  var first = function () { for (var a = 0; a < cats.length; a++) for (var b = 0; b < cats[a].items.length; b++) if (MD.priced(cats[a].items[b])) return cats[a].id + ':' + b; return cats[0].id + ':0'; };

  // ---------- the dialog ----------
  var od = document.createElement('div');
  od.id = 'order'; od.className = 'od'; od.hidden = true;
  od.setAttribute('role', 'dialog'); od.setAttribute('aria-modal', 'true'); od.setAttribute('aria-labelledby', 'od-title');
  od.innerHTML =
    '<div class="od-back"></div>' +
    '<form class="od-card" id="od-form" novalidate>' +
      '<header class="od-head"><img src="photos/doughy-menu-sm.webp" width="64" height="59" alt=""><div><p class="od-who">Doughy</p><h2 id="od-title">Tell me what you\'d like, and when.</h2></div><button type="button" class="od-x" id="od-close" aria-label="Close">&#x2715;</button></header>' +
      '<div class="od-body">' +
        '<div class="od-rows"><p class="od-lab">Bakes</p><div id="od-rows"></div><button type="button" class="od-add" id="od-add">+ Add another bake</button></div>' +
        '<div class="od-grid">' +
          '<div class="od-f od-wide od-datef"><span id="od-date-lab">Needed on</span><div class="od-days" id="od-days" role="group" aria-labelledby="od-date-lab"></div><input type="date" id="od-date" required hidden aria-label="Another day"><small>We bake to order, so a day ahead please.</small></div>' +
          '<div class="od-f"><span>Delivery or pickup</span><div class="mode" role="group" aria-label="Delivery or pickup"><button type="button" data-m="deliver" class="on">Deliver in Solapur</button><button type="button" data-m="pickup">I\'ll pick up</button></div></div>' +
          '<label class="od-f od-addrf"><span class="dl">Delivery address or area</span><span class="pk">Pickup</span><input type="text" id="od-addr" placeholder="Area, a landmark, or the full address" autocomplete="street-address"><span class="od-pick">We\'ll share the pickup address and a time on WhatsApp.</span></label>' +
          '<label class="od-f"><span>Your name</span><input type="text" id="od-name" required autocomplete="name"></label>' +
          '<label class="od-f"><span>Anything else? <em>optional</em></span><textarea id="od-notes" rows="2" placeholder="A custom filling, a message on the box, allergies"></textarea></label>' +
        '</div>' +
        '<div class="od-sum"><ul id="od-lines"></ul><p class="od-tot"><span>Estimated total</span><b id="od-total"></b></p><small>We\'ll confirm the total and any delivery charge on WhatsApp.</small></div>' +
        '<p class="od-err" id="od-err" role="alert" hidden></p>' +
      '</div>' +
      '<div class="od-foot"><button type="submit" class="pill wa" id="od-send">Send on WhatsApp</button></div>' +
    '</form>';
  document.body.appendChild(od);
  var $ = function (id) { return document.getElementById(id); };
  var rowsEl = $('od-rows'), daysEl = $('od-days'), dateEl = $('od-date'), addrEl = $('od-addr'), nameEl = $('od-name'), notesEl = $('od-notes'), linesEl = $('od-lines'), totalEl = $('od-total'), errEl = $('od-err');
  var mode = 'deliver', opener = null;

  // ---------- rows ----------
  function bakeOptions(sel) {
    return cats.map(function (c) {
      return '<optgroup label="' + esc(c.name) + '">' + c.items.map(function (it, i) { var v = c.id + ':' + i; return '<option value="' + v + '"' + (v === sel ? ' selected' : '') + '>' + esc(it.name) + (it.ask ? ' (price on request)' : '') + '</option>'; }).join('') + '</optgroup>';
    }).join('');
  }
  function sizeButtons(c, sel) { return c.sizes.map(function (s, i) { return '<button type="button" data-i="' + i + '"' + (i === sel ? ' class="on"' : '') + '>' + esc(s) + '</button>'; }).join(''); }
  function addRow(key, egg, size, qty) {
    var f = find(key) || find(first()), row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<select class="bake" aria-label="Bake">' + bakeOptions(f.c.id + ':' + f.i) + '</select>' +
      '<button type="button" class="remove" aria-label="Remove this bake" title="Remove">&#x2715;</button>' +
      '<div class="row-opts">' +
        '<div class="sseg" role="group" aria-label="Box size"' + (f.c.sizes.length > 1 ? '' : ' hidden') + '>' + sizeButtons(f.c, size || 0) + '</div>' +
        '<div class="eseg" role="group" aria-label="Egg preference"><button type="button" data-e="0"' + (egg ? '' : ' class="on"') + ' aria-label="Eggless" title="Eggless">' + NOEGG + '</button><button type="button" data-e="1"' + (egg ? ' class="on"' : '') + ' aria-label="With egg" title="With egg">' + EGG + '</button></div>' +
        '<div class="qtyw"><button type="button" class="minus" aria-label="One fewer">&minus;</button><input class="qty" type="number" inputmode="numeric" min="1" max="20" value="' + (qty || 1) + '" aria-label="Quantity"><button type="button" class="plus" aria-label="One more">+</button></div>' +
      '</div>';
    rowsEl.appendChild(row); syncRemove(); update();
    return row;
  }
  function syncRemove() { var n = rowsEl.children.length; Array.prototype.forEach.call(rowsEl.querySelectorAll('.remove'), function (b) { b.hidden = n < 2; }); }
  function readRow(row) {
    var on = row.querySelector('.sseg button.on'), f = find(row.querySelector('select.bake').value), size = on ? +on.getAttribute('data-i') || 0 : 0;
    var egg = row.querySelector('.eseg button.on').getAttribute('data-e') === '1', qty = Math.min(20, Math.max(1, Math.round(+row.querySelector('input.qty').value) || 1));
    var priced = MD.priced(f.it), amount = priced ? (egg ? f.it.egg : f.it.eggless)[size] * qty : null;
    return { c: f.c, it: f.it, size: size, egg: egg, qty: qty, amount: amount, line: f.it.name + ' · ' + f.c.sizes[size].toLowerCase() + ' · ' + (egg ? 'with egg' : 'eggless') + ' · ×' + qty + ' · ' + (priced ? '₹' + amount : 'price on request') };
  }
  function rows() { return Array.prototype.map.call(rowsEl.children, readRow); }
  rowsEl.addEventListener('change', function (e) {
    var row = e.target.closest('.row'); if (!row) return;
    if (e.target.classList.contains('bake')) { var f = find(e.target.value), sz = row.querySelector('.sseg'); sz.innerHTML = sizeButtons(f.c, 0); sz.hidden = f.c.sizes.length < 2; }
    update();
  });
  rowsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'), row = b && b.closest('.row'); if (!b || !row) return;
    if (b.classList.contains('remove')) { if (rowsEl.children.length > 1) row.remove(); syncRemove(); }
    else if (b.hasAttribute('data-e')) Array.prototype.forEach.call(row.querySelectorAll('.eseg button'), function (x) { x.classList.toggle('on', x === b); });
    else if (b.hasAttribute('data-i')) Array.prototype.forEach.call(row.querySelectorAll('.sseg button'), function (x) { x.classList.toggle('on', x === b); });
    else if (b.classList.contains('plus') || b.classList.contains('minus')) { var q = row.querySelector('input.qty'); q.value = Math.min(20, Math.max(1, (+q.value || 1) + (b.classList.contains('plus') ? 1 : -1))); }
    update();
  });
  $('od-add').addEventListener('click', function () { var last = rows()[rows().length - 1]; var r = addRow(first(), last ? last.egg : pageEgg(), 0, 1); r.querySelector('select.bake').focus(); });

  // ---------- the rest of the form ----------
  Array.prototype.forEach.call(od.querySelectorAll('.mode button'), function (b) {
    b.addEventListener('click', function () { mode = b.getAttribute('data-m'); Array.prototype.forEach.call(od.querySelectorAll('.mode button'), function (x) { x.classList.toggle('on', x === b); }); od.classList.toggle('pickup', mode === 'pickup'); update(); });
  });
  function pageEgg() { var on = document.querySelector('.seg button.on'); return on ? on.getAttribute('data-e') === '1' : false; }
  function total(rs) { var t = 0, ask = false; rs.forEach(function (r) { if (r.amount == null) ask = true; else t += r.amount; }); return { t: t, ask: ask }; }
  function update() {
    var rs = rows(), tt = total(rs);
    linesEl.innerHTML = rs.map(function (r) { return '<li>' + esc(r.line) + '</li>'; }).join('');
    totalEl.textContent = (rs.length && rs.every(function (r) { return r.amount == null; })) ? 'on request' : '₹' + tt.t + (tt.ask ? ' + items on request' : '');
    errEl.hidden = true;
  }
  // the day strip: tomorrow and the thirteen days after it; "Later" reveals the native input for anything beyond
  function buildDays() {
    var t = tomorrow(), html = '';
    for (var i = 0; i < 14; i++) {
      var d = new Date(t); d.setDate(t.getDate() + i);
      html += '<button type="button" data-d="' + iso(d) + '"' + (i === 0 ? ' class="on"' : '') + '><b>' + (i === 0 ? 'Tomorrow' : DAYS[d.getDay()]) + '</b>' + d.getDate() + ' ' + MONTHS[d.getMonth()] + '</button>';
    }
    daysEl.innerHTML = html + '<button type="button" id="od-later"><b>Later</b>Pick a day</button>';
  }
  function markDay(v) { Array.prototype.forEach.call(daysEl.querySelectorAll('button[data-d]'), function (b) { b.classList.toggle('on', b.getAttribute('data-d') === v); }); }
  daysEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'od-later') { markDay(null); dateEl.value = ''; dateEl.hidden = false; dateEl.focus(); }
    else { markDay(b.getAttribute('data-d')); dateEl.value = b.getAttribute('data-d'); dateEl.hidden = true; }
    update();
  });
  dateEl.addEventListener('change', function () { markDay(dateEl.value); update(); });
  function dateValue() { var p = dateEl.value.split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2], 12) : null; }
  function compose() {
    var rs = rows(), tt = total(rs), d = dateValue(), out = ["Hi Batter & Dough! I'd like to order:"];
    rs.forEach(function (r) { out.push('• ' + r.line); });
    out.push('Needed on: ' + (d ? fmt(d) : ''));
    out.push(mode === 'pickup' ? 'Pickup from the bakery' : 'Delivery to: ' + addrEl.value.trim());
    out.push('Name: ' + nameEl.value.trim());
    if (notesEl.value.trim()) out.push('Notes: ' + notesEl.value.trim());
    out.push('Estimated total: ' + (rs.every(function (r) { return r.amount == null; }) ? 'on request' : '₹' + tt.t + (tt.ask ? ' plus the items on request' : '')));
    return out.join('\n');
  }
  function fail(msg, el) { errEl.textContent = msg; errEl.hidden = false; if (el) { el.focus(); el.classList.add('bad'); setTimeout(function () { el.classList.remove('bad'); }, 1600); } }
  $('od-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = dateValue();
    if (!d || dateEl.value < dateEl.min) return fail('Pick a day from tomorrow on, please.', dateEl);
    if (mode === 'deliver' && !addrEl.value.trim()) return fail('Where should it go? An area or address helps.', addrEl);
    if (!nameEl.value.trim()) return fail('Tell us your name, so we know who is ordering.', nameEl);
    var link = MD.waLink(compose()), w = window.open(link, '_blank');
    if (w) { try { w.opener = null; } catch (err) { /* cross-origin */ } } else location.href = link;
    close();
  });

  // ---------- open and close ----------
  function open(prefill) {
    rowsEl.innerHTML = '';
    var p = prefill || {}, egg = p.egg != null ? !!p.egg : pageEgg();
    addRow(p.key || first(), egg, 0, 1);
    var t = tomorrow(); buildDays(); dateEl.min = iso(t); dateEl.value = iso(t); dateEl.hidden = true;
    od.hidden = false; document.body.style.overflow = 'hidden';
    update();
    rowsEl.querySelector('select.bake').focus();
  }
  function close() {
    if (od.hidden) return;
    od.hidden = true; document.body.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }
  $('od-close').addEventListener('click', close);
  od.querySelector('.od-back').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !od.hidden) close(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-order]') : null; if (!t) return;
    e.preventDefault(); opener = t;
    var key = t.getAttribute('data-order');
    open(key ? { key: key } : null);
  });
  window.BD_ORDER = { open: open, close: close, compose: compose };
})();
