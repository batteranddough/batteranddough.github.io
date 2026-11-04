# Batter & Dough site build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved prototype (artifact version `1793800789-2038`) into the live site at https://batteranddough.github.io with no visual change.

**Architecture:** The prototype is two self-contained HTML files plus a data file. The build splits them into shared CSS, page CSS, page JS and the Three.js module, swaps CDN scripts for vendored pinned copies, adds head metadata, icons, a 404 and the two fallbacks, then pushes `main` and enables Pages. Every visual task is verified by screenshots at the same scroll positions as the prototype sheets.

**Tech Stack:** Static HTML/CSS/JS, three 0.170.0 (ES module via importmap), GSAP 3.15.1 + ScrollTrigger, Google Fonts. Dev tools: Node 20 + puppeteer-core 23.11.1 driving Edge headless, Python 3 + Pillow for images.

**Spec:** `docs/superpowers/specs/2026-11-04-batter-and-dough-site-design.md`

**Prototype source (read-only reference):** `.superpowers/brainstorm/1714-1793776968/content/` — `doughy-kitchen-prototype.html` (head lines 1–9, `<style>` 10–154, body 156–236, scripts 237–239, DOM script 242–418, importmap 421–423, module 424–1178), `menu.html` (`<style>` 10–125, body 127–168, script 170–223), `menu-data.js`, `photos/`.

## Global Constraints

- GitHub account `AmaanKhan63` only; remote alias `github.com-amaan`; API calls as `GH_TOKEN="$(gh auth token -u AmaanKhan63)" gh api ...`.
- No build step. Vendored libraries at exactly: three.module.min.js 691,648 bytes (three@0.170.0), gsap.min.js 73,357 bytes and ScrollTrigger.min.js 44,683 bytes (gsap@3.15.1).
- Prices live only in `js/menu-data.js`; whole rupees; `₹1000` placeholder rule; size table wins.
- WhatsApp `918999650554`; Instagram `https://www.instagram.com/batter_._dough/`; Solapur; "Delivery anywhere in Solapur".
- WhatsApp pill is cocoa, never `#25D366`. Nothing slides up from the bottom during the pin. One menu.
- The word "Prototype" appears nowhere on the live pages.
- Visual parity with the prototype: screenshots at p = 0, 0.05, 0.33, 0.6, 0.655, 0.72, 0.85, 0.95, 0.995 (phone and desktop) and the menu page (phone and desktop) must match the round-five-e sheets; no console errors or page errors.
- Every builder default goes into `docs/review-list.md`.
- Commits authored by the repo's local identity (AmaanKhan63) with the attribution line from the session.

## Review Focus

1. **No WebGL** (old Android WebView, GL blocked): `body.no-webgl` must show the kitchen poster under the same headline and text, and the page must still scroll to the facts, the menu link and the footer. Test in Task 4 (`tools/check-home.js`, `--disable-3d-apis`).
2. **Reduced motion**: no pin, layers stacked, first frame drawn once, the whole page scrollable. Test in Task 4 (emulated media feature).
3. **Deep links** `menu.html#cookies` (from the night cards and the featuring link) must land on the section with the chip active, not be forced to the top. Test in Task 2 (`tools/check-menu.js`).
4. **Short and wide viewports** (740×360 landscape phone, 820×1180 tablet): bubble, featuring bar and cards must not overlap and nothing is cut off at p = 0.655 and 0.72. Screenshots in Task 4, judged by eye, any fix logged.
5. **Pre-typed WhatsApp text** from an item's Order button must contain the item name, the selected size and "with egg" after toggling egg, URL-encoded (₹ and & survive `decodeURIComponent`). Test in Task 2.

---

### Task 1: Scaffold, vendored libraries, photos, data, tools

**Files:**
- Modify: `.gitignore`
- Create: `.nojekyll`, `vendor/three/three.module.min.js`, `vendor/gsap/gsap.min.js`, `vendor/gsap/ScrollTrigger.min.js`, `js/menu-data.js`, `photos/` (7 JPEGs, `thumbs/` 7 WebP, `doughy-soon-sm.webp`, `doughy-menu-sm.webp`), `img/doughy/doughy-soon.png`, `img/doughy/doughy-menu.png`, `tools/package.json`, `tools/shoot.js`, `tools/view.js`, `tools/images.py`, `tools/README.md`

**Interfaces:**
- Produces: `window.MENU_DATA` (unchanged from the prototype; `categories[]`, `fromPrice(cat)`, `waLink(text)`); `node tools/shoot.js <html-or-url> <prefix> [p,list] [phone,desktop] [tail]` and `node tools/view.js <html-or-url> <prefix> <phone|desktop> <sel,...>` writing PNGs to `tools/out/` (gitignored); `python -I tools/images.py` regenerating thumbs and icons from `photos/*.jpg` and `img/doughy/*.png`.

- [ ] **Step 1: Ignore local-only files** — append to `.gitignore`: `/WhatsApp Image*.jpeg`, `tools/node_modules/`, `tools/out/`.
- [ ] **Step 2: Download the pinned libraries** with curl from `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js`, `https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js`, `https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js`.
- [ ] **Step 3: Verify sizes** — Run: `wc -c vendor/three/three.module.min.js vendor/gsap/gsap.min.js vendor/gsap/ScrollTrigger.min.js`. Expected: `691648`, `73357`, `44683`. Record the three sha256 sums in `tools/README.md`.
- [ ] **Step 4: Copy data and images** — `menu-data.js` → `js/menu-data.js` unchanged; prototype `photos/*.jpg`, `photos/thumbs/*.webp`, `photos/*-sm.webp` → `photos/`; `photos/doughy-soon.png`, `photos/doughy-menu.png` → `img/doughy/`. Create `.nojekyll` (empty).
- [ ] **Step 5: Verify the data loads** — Run: `node -e "global.window={};require('./js/menu-data.js');const m=window.MENU_DATA;console.log(m.categories.length,m.categories.reduce((n,c)=>n+c.items.length,0),m.whatsapp)"`. Expected: `6 15 918999650554`.
- [ ] **Step 6: Tools** — copy `shoot4.js` → `tools/shoot.js` and `view.js` → `tools/view.js` from the session scratchpad `scratchpad/shots/`, changing the target resolution so an argument starting with `http` is used as-is and anything else is resolved to `file:///`, and writing output to `tools/out/`. `tools/package.json`: `{ "private": true, "dependencies": { "puppeteer-core": "23.11.1" } }`. `tools/images.py`: the thumbnail and icon generator (480×360 centre-cropped WebP q78 for every `photos/*.jpg` into `photos/thumbs/`; `img/doughy/*.png` → `photos/<name>-sm.webp` at 360 px; `favicon.png` 64×64 and `apple-touch-icon.png` 180×180 on cream `#FFF9F3` from `img/doughy/doughy-menu.png`). `tools/README.md`: how to install (`cd tools && npm i`), the Edge path, the three commands, the sha256 sums.
- [ ] **Step 7: Verify tools run** — Run: `cd tools && npm i && python -I images.py && node view.js ../.superpowers/brainstorm/1714-1793776968/content/menu.html t1 phone top`. Expected: `tools/out/t1-phone-top.png` exists; `ls photos/thumbs | wc -l` prints `7`; `favicon.png` and `apple-touch-icon.png` exist at the repo root.
- [ ] **Step 8: Commit** — `git add .gitignore .nojekyll vendor js/menu-data.js photos img tools favicon.png apple-touch-icon.png && git commit -m "Scaffold: vendored three and GSAP, photos, menu data, dev tools"`.

### Task 2: The menu page

**Files:**
- Create: `menu.html`, `css/site.css`, `css/menu.css`, `js/menu.js`, `tools/check-menu.js`

**Interfaces:**
- Consumes: `window.MENU_DATA` from Task 1.
- Produces: `css/site.css` = the rules whose text is identical in both prototype `<style>` blocks (`:root` tokens, `*`, `a`, `button`, `em`, `.grain`, `.wm`, `.wm svg`, `.links`, `.links a`, `.pill`, `.pill.pri`, `.pill.wa`, the footer rules, the `max-width:900px` links rule). Loaded first on every page. `js/menu.js` = the prototype's menu script verbatim.

- [ ] **Step 1: Split** — `menu.html` = prototype head (title `Batter &amp; Dough · Menu`) with `<link rel="stylesheet" href="css/site.css">` and `css/menu.css` replacing the inline style, the body markup verbatim, then `<script src="js/menu-data.js"></script><script src="js/menu.js"></script>`. `css/menu.css` = the remaining menu rules in their original order. Footer `.copy` second span becomes `Prices as of 4 Nov 2026.`
- [ ] **Step 2: Write `tools/check-menu.js`** (puppeteer, phone viewport): opens `menu.html`, asserts `scrollY === 0`; opens `menu.html#cookies`, asserts `scrollY > 200` and the active chip's `href` ends with `#cookies`; clicks the second egg button and reads the first `.item` Order link `href`, asserts it starts with `https://wa.me/918999650554?text=` and `decodeURIComponent` contains the item name, `Box of 4` and `with egg`; clicks the first `.zoomer`, asserts `#lb` is visible with one or two `img`; prints `menu checks: ok` or the failing assertion.
- [ ] **Step 3: Run it** — Run: `node tools/check-menu.js menu.html`. Expected: `menu checks: ok` (if it reports a failure, fix `menu.html` or `js/menu.js`, not the test).
- [ ] **Step 4: Screenshots** — Run: `node tools/view.js menu.html m phone top,#cookies,#croissants,bottom && node tools/view.js menu.html m desktop top`. Expected: five PNGs in `tools/out/`, no console errors, visually identical to the round-five-e menu shots (icons in the toggle, thumbnails, ⤢ badge, cocoa order bar).
- [ ] **Step 5: Commit** — `git add menu.html css js/menu.js tools/check-menu.js && git commit -m "Menu page from the approved prototype"`.

### Task 3: The home page

**Files:**
- Create: `index.html`, `css/home.css`, `js/home.js`, `js/kitchen.js`

**Interfaces:**
- Consumes: `css/site.css`, `window.MENU_DATA`, `window.gsap`, `window.ScrollTrigger`.
- Produces: `window.BD` (from `js/home.js`, unchanged shape: `p, s, visible, reduce, narrow, st, activeK, DAY, Q0, QL, snap, split(), segment(), hourAt(), head`), read by `js/kitchen.js`.

- [ ] **Step 1: Split** — `index.html` = prototype head with title `Batter &amp; Dough · Home bakery in Solapur`, stylesheet links to `css/site.css` and `css/home.css`, body markup verbatim (lines 156–236), then `<script src="vendor/gsap/gsap.min.js"></script><script src="vendor/gsap/ScrollTrigger.min.js"></script><script src="js/menu-data.js"></script><script src="js/home.js"></script>`, the importmap `{ "imports": { "three": "./vendor/three/three.module.min.js" } }`, and `<script type="module" src="js/kitchen.js"></script>`. `css/home.css` = the prototype style block minus the shared rules, original order. `js/home.js` = DOM script lines 243–417 verbatim. `js/kitchen.js` = module lines 425–1177 verbatim. Footer `.copy` second span becomes `Solapur, Maharashtra.`
- [ ] **Step 2: Screenshots** — Run: `node tools/shoot.js index.html h 0,0.05,0.33,0.6,0.655,0.72,0.85,0.95,0.995 desktop,phone tail`. Expected: sheets in `tools/out/`, `no console errors`, every frame matches the round-five-e sheets (bubble lines, slim phone featuring bar, cards, drift at 0.6, facts and guide in the tail).
- [ ] **Step 3: Verify no remote script remains** — Run: `grep -n "cdn.jsdelivr\|Prototype" index.html menu.html js/*.js css/*.css`. Expected: no output.
- [ ] **Step 4: Commit** — `git add index.html css/home.css js/home.js js/kitchen.js && git commit -m "Home page: the Doughy kitchen journey from the approved prototype"`.

### Task 4: Fallbacks and odd viewports

**Files:**
- Modify: `css/home.css`
- Create: `img/kitchen-poster.jpg`, `tools/check-home.js`

**Interfaces:**
- Consumes: `body.no-webgl` and `body.static` classes set by the existing scripts.
- Produces: `body.no-webgl .stage { background: url(../img/kitchen-poster.jpg) center/cover }` replacing the gradient; `img/kitchen-poster.jpg` = desktop p=0 frame, 1280×800, JPEG q80, under 180 KB.

- [ ] **Step 1: Poster** — `tools/poster.js`: desktop viewport, `BD.snap` at p=0, hide `.nav, .layer, .scrollbtn, .vignette`, screenshot the canvas to `img/kitchen-poster.jpg`.
- [ ] **Step 2: CSS** — replace the `body.no-webgl .stage` gradient rule with the poster background; keep `body.no-webgl .stage canvas { display:none }`.
- [ ] **Step 3: Write `tools/check-home.js`**: (a) launch with `--disable-3d-apis`, open `index.html`, assert `document.body.classList.contains('no-webgl')`, assert the computed `background-image` of `.stage` contains `kitchen-poster`, scroll to `#bakes` and assert `.guide` is in the viewport, screenshot `out/nogl-phone.png`; (b) normal launch with `page.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}])`, assert `body.static`, assert `document.querySelector('.pin-spacer') === null` and `document.documentElement.scrollHeight > innerHeight * 1.5`, screenshot `out/static-phone.png`; (c) viewports 740×360 and 820×1180 at p = 0.655 and 0.72 via `BD.snap`, screenshots `out/land-*.png`, `out/tab-*.png`; print `home checks: ok`.
- [ ] **Step 4: Run** — `node tools/check-home.js index.html`. Expected: `home checks: ok`; inspect the six screenshots: poster visible with headline; static page readable; no overlap between bubble, featuring bar and cards in landscape and tablet (fix in `css/home.css` with a `max-height:420px` media query if the bar covers the product, and note the fix in the review list).
- [ ] **Step 5: Commit** — `git add css/home.css img/kitchen-poster.jpg tools/check-home.js tools/poster.js && git commit -m "Home: poster fallback without WebGL, reduced-motion and viewport checks"`.

### Task 5: Head metadata, icons, share image, 404, README

**Files:**
- Modify: `index.html`, `menu.html`
- Create: `img/og.jpg`, `404.html`, `README.md`, `tools/og.js`

**Interfaces:**
- Produces: `<head>` on both pages with `description`, `theme-color #FFF9F3`, `og:title`, `og:description`, `og:image` (absolute `https://batteranddough.github.io/img/og.jpg`), `og:url`, `twitter:card summary_large_image`, `<link rel="icon" href="favicon.png">`, `<link rel="apple-touch-icon" href="apple-touch-icon.png">`.

- [ ] **Step 1: `tools/og.js`** — 1200×630 viewport, open `index.html`, `BD.snap(0.05)` (Doughy's hello bubble), hide `.nav, .scrollbtn, .steps, .kicker`, wait two frames, screenshot JPEG q82 to `img/og.jpg`. Run it. Expected: file exists, under 200 KB, shows Doughy with "Hi! I'm Doughy" bubble and the headline.
- [ ] **Step 2: Head tags** — index description: `Batter & Dough is a home bakery in Solapur. Watch Doughy bake, then order cookies, cinnamon rolls and bombolone on WhatsApp. Eggless or with egg.` Menu description: `Every bake at Batter & Dough, with eggless and egg prices and box sizes. Order on WhatsApp.` Same OG image on both; `og:url` per page.
- [ ] **Step 3: `404.html`** — uses `css/site.css`, nav from `menu.html`, centred `photos/doughy-soon-sm.webp`, `<h1>Nothing's baking here.</h1>`, links "Back to the kitchen" (`/`) and "See the menu" (`/menu.html`), footer from `menu.html`.
- [ ] **Step 4: `README.md`** — for the sister and the owner: what the site is, the live URL, "to change a price edit `js/menu-data.js`" with a four-line example, "to add a photo: put the JPEG (1200 px long edge) in `photos/`, set `photo`/`photo2` on the item, run `python -I tools/images.py`", and a pointer to `docs/review-list.md`.
- [ ] **Step 5: Verify** — Run: `grep -c "og:image" index.html menu.html && node tools/view.js 404.html e phone top && node -e "const s=require('fs').readFileSync('index.html','utf8');['description','og:title','og:image','apple-touch-icon','favicon.png','theme-color'].forEach(k=>{if(!s.includes(k))throw k});console.log('head ok')"`. Expected: `1` for each page, the 404 screenshot renders, `head ok`.
- [ ] **Step 6: Commit** — `git add index.html menu.html 404.html README.md img/og.jpg tools/og.js && git commit -m "Head metadata, share image, icons, 404 page and README"`.

### Task 6: Review list, push, enable Pages, live check

**Files:**
- Modify: `docs/review-list.md`

- [ ] **Step 1: Review list** — add a "Launch" section: live URL, transferred bytes per page (Step 5), the OG image to approve, the real-phone pass the owner does, and any fix from Task 4.
- [ ] **Step 2: Commit docs** — `git add docs && git commit -m "Docs: approved design, build plan, review list for launch"`.
- [ ] **Step 3: Push** — Run: `git push -u origin main`. Expected: `main -> main` through the `github.com-amaan` alias (`ssh -T git@github.com-amaan` greets `AmaanKhan63` if in doubt).
- [ ] **Step 4: Enable Pages** — Run: `GH_TOKEN="$(gh auth token -u AmaanKhan63)" gh api -X POST repos/batteranddough/batteranddough.github.io/pages -f "source[branch]=main" -f "source[path]=/"`. Expected: JSON with `"html_url": "https://batteranddough.github.io/"`. Then poll `gh api repos/batteranddough/batteranddough.github.io/pages/builds/latest --jq .status` every 20 s until `built` (under 5 min).
- [ ] **Step 5: Live check** — Run: `for p in / /menu.html /404.html /js/menu-data.js /vendor/three/three.module.min.js /img/og.jpg; do curl -s -o /dev/null -w "$p %{http_code} %{size_download}\n" https://batteranddough.github.io$p; done` (a random path must return 404 with Doughy). Then `node tools/shoot.js https://batteranddough.github.io/ live 0.05,0.72 phone` and `node tools/view.js https://batteranddough.github.io/menu.html live phone top`. Expected: 200s, no console errors, frames match. Record the total transferred bytes for `/` and `/menu.html` (sum of response sizes in the shoot run) in the review list; expected under 1.2 MB and 400 KB.
- [ ] **Step 6: Commit and push the measured numbers** — `git add docs/review-list.md && git commit -m "Review list: launch measurements" && git push`.
