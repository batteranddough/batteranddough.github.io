# Feedback round 2026-11-05 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the owner's seven points of 2026-11-05 to the live site: new prices, croissants coming soon, Doughy says "scroll", slow scroll, a real spotlight, a flat cookie, and an order form that composes the WhatsApp message.

**Architecture:** Data changes in `js/menu-data.js`; menu rendering in `js/menu.js`; home overlay and scroll in `js/home.js`; lights, camera and props in `js/kitchen.js`; a new shared `js/order.js` + `css/order.css` loaded by both pages and triggered by `data-order` on the existing Order links.

**Tech Stack:** as before (static HTML/CSS/JS, three 0.170.0, GSAP 3.15.1; puppeteer-core + Edge headless for checks).

**Spec:** `docs/superpowers/specs/2026-11-05-feedback-round-design.md`

## Global Constraints

- Branch `feedback-2` off `main`; merge to `main` and push only after the whole suite is green and the branch review is done.
- Prices only from the cards of 2026-11-05; the croissant prices are deleted.
- No bottom-edge slide-ins during the pin; the dialog fades in centred.
- Every builder default goes into `docs/review-list.md` (new section "Feedback round 2026-11-05").
- Commits by the local identity with the session's attribution line.

## Review Focus

1. The order form composes a correct message for multi-row orders (size index, egg choice, quantity, totals) and survives `encodeURIComponent` (rupee sign, ampersand, bullets, newlines).
2. The scroll tween must never fight the visitor: wheel/touch/key cancel it; the ScrollTrigger pin keeps working after a tween.
3. Doughy's intro line is typed by time but still fades by scroll; it must not reappear after it has faded.
4. The spotlight change must not darken Doughy to a silhouette on phones (swiftshader screenshots at q 0.26 and 0.47, phone and desktop).
5. Coming-soon and price-on-request items must not break the menu page's per-item Order fallback links or the form's option list.

---

### Task 1: Data: new prices, coming soon, price on request
- [ ] Test: extend `tools/check-menu.js` (croissants last with "Coming soon", no rupee sign in their cards; "Price on request" on Brownie slab and Customised fillings; Chocolate Bombolone 106/213 shown).
- [ ] `js/menu-data.js`: prices; `soon: true` on croissants (prices removed); ask items; header comment names the cards.
- [ ] `js/menu.js` + `css/menu.css`: soon categories last; badge; cards without prices/egg/order; ask items.
- [ ] `menu.html` footer date.

### Task 2: Home: Doughy says scroll, step chips, slow scroll
- [ ] Test: `tools/check-home.js` (h): at rest after 3 s the bubble is visible and reads the scroll line; the kicker has no "Scroll"; (i): clicking the arrow takes more than 1 s to reach its target and lands near hp 0.30; (j): clicking "Bake" lands near hp 0.72.
- [ ] `index.html`: kicker copy; steps as buttons.
- [ ] `js/home.js`: intro line by time; `scrollJourneyTo(p)` tween helper with input cancel; button, cards and steps use it.
- [ ] `css/home.css`: `.steps button` styles, hover.

### Task 3: Kitchen: spotlight, camera, bowl, cookie
- [ ] `js/kitchen.js`: spot geometry and intensities; night ambient/hemi/pendant/fill/charLight levels; CLOSE/CLOSE2 raised; island2 shrinks at night; c2 flat.
- [ ] Screenshots `node tools/shoot.js index.html r6 0.6504,0.7188,0.7986,0.8328,0.9468 desktop,phone`; compare with `base-*`.

### Task 4: Order form
- [ ] Test: `tools/check-menu.js` (5) Order on a cookie after switching to egg opens the dialog prefilled; add a row; set qty 2; stub `window.open`; submit; assert the composed text and the link. `tools/check-home.js` (k): nav pill opens the dialog; Escape closes; no pin-spacer change.
- [ ] `js/order.js`, `css/order.css`; wire `data-order` on both pages; menu item buttons pass `cat:index`.

### Task 5: Docs, review, ship
- [ ] `docs/review-list.md` new section; README note on the form and on `soon`/`ask`.
- [ ] Full suite: check-home, check-menu, check-pages, shoot (no console errors).
- [ ] Branch review by a fresh reviewer; fix; merge; push; live checks; memory.
