# Batter & Dough website: design

Date: 2026-11-04 (rewritten the same day, after the prototype rounds)
Status: **approved**. The owner approved the scroll prototype, round five e,
on 2026-11-04 ("These are final feedback. After these you can start the
implementation"). The approved prototype is the reference for the build:
artifact https://claude.ai/artifact/7UkqhYh6BZqn2HzfL4squi, version
`1793800789-2038`; local source in `.superpowers/brainstorm/1714-1793776968/content/`
(gitignored): `doughy-kitchen-prototype.html`, `menu.html`, `menu-data.js`, `photos/`.

The first draft of this document (an SVG-only, one-page site with an order
builder) was superseded by the prototype rounds. Where this document and the
approved prototype disagree, the prototype wins.

## 1. Intent

A website for Batter & Dough, a home bakery in Solapur run by the owner's
sister. A customer who hears about the bakery (Instagram, a friend, a WhatsApp
forward) opens one link on their phone, meets Doughy the baker, sees what she
bakes and what it costs, and sends her an order on WhatsApp in under a minute.

The site must feel like her: warm, homemade, a little playful, and it must not
be a generic template. The owner's bar is Stunden: one room, a handful of
camera moves, a character with a voice.

## 2. Goals, non-goals, anti-goals

Goals

- On a phone: journey, menu, WhatsApp. Nothing else in the way.
- The first scroll is the thing people screenshot and share.
- Prices are correct, in whole rupees, eggless and egg both visible.
- Zero running cost: static files on GitHub Pages, no backend, no build step.
- The sister changes a price by editing one file.

Non-goals: payment, carts, accounts, order tracking, CMS, analytics, cookies,
multiple languages, an order builder (dropped in round five: the menu's
per-item "Order" buttons open WhatsApp with the item pre-typed instead).

Anti-goals (a failure even if it works)

- Anything sliding up from the bottom edge during the pinned journey. The
  owner flagged this four times.
- The journey traps the visitor: the menu and the WhatsApp pill must be one
  tap away from the first frame.
- A price she does not charge.
- The menu repeated anywhere. There is exactly one menu, on `menu.html`.
- A WhatsApp button in WhatsApp green. It is a cocoa pill with the glyph.

## 3. Constraints

- Hosting: GitHub Pages from the `main` branch root of the public repository
  `batteranddough/batteranddough.github.io`; public URL
  `https://batteranddough.github.io`.
- Accounts: everything uses the owner's personal GitHub account `AmaanKhan63`,
  never the work account `Amaan2210`. The local remote uses the SSH alias
  `github.com-amaan`; API calls pass the token explicitly:
  `GH_TOKEN="$(gh auth token -u AmaanKhan63)" gh api ...` because the gh
  active account reverts to the work account.
- No build step. Hand-written HTML, CSS and JS. Libraries are vendored at
  pinned versions: three 0.170.0 (`three.module.min.js`, 691,648 bytes) and
  GSAP 3.15.1 with ScrollTrigger (73,357 and 44,683 bytes). Fonts come from
  Google Fonts with `display=swap` and local fallbacks (Georgia, system-ui,
  cursive).
- WebGL is allowed (the owner chose the Three.js prototype over SVG). Two
  fallbacks are required: no WebGL shows a still poster of the kitchen under
  the same text; `prefers-reduced-motion` removes the pin and stacks the
  layers as a static page.
- Mobile first. Verified viewports: phone 390×844 (2x), desktop 1280×800,
  plus a spot check at 740×360 landscape and 820×1180 tablet.
- Real photos appear only outside the 3D scene (menu cards, lightbox). Inside
  the journey everything is modelled.

## 4. Decided by the owner

- Mascot: Doughy, look **C "Storybook"** (MeshToon, soft outline, chef's hat,
  blush cheeks). Doughy bakes; the visitor watches.
- Structure: home page = the pinned journey, then three facts and a "Doughy
  will show you the menu" card, then the footer. The whole menu lives on
  `menu.html`.
- Ordering: WhatsApp click-to-chat only, number +91 89996 50554
  (`wa.me/918999650554`). Menu items open the chat with the item, size and
  egg choice pre-typed.
- Currency: INR, whole rupees, `₹218`. Missing prices show `₹1000` as a
  deliberate placeholder. When the top-of-list prices and the size table in
  her draft disagree, the size table wins ("price draft on priority").
- Combos include a flat ₹86 for packaging and delivery; each combo card says
  "includes packaging & delivery".
- Croissants stay on the menu with the builder's names and prices until she
  confirms them.
- Contact: Instagram https://www.instagram.com/batter_._dough/, Solapur,
  delivery "anywhere in Solapur for now".
- Every big on-screen word is spoken by Doughy in a speech bubble instead of
  being displayed as a title. No caption at the bottom of the screen.
- Egg choice is shown as icons, not words: green crossed egg = eggless, red-
  brown egg = with egg (builder's colours, Indian veg/non-veg convention).
- Menu categories with real photos come first; photos expand on tap with a
  visible ⤢ badge.

## 5. Pages

### `index.html`, the home page

1. **Nav**, fixed over the scene: wordmark with heart, links "Full menu" and
   "Contact" (hidden on phones), cocoa WhatsApp pill ("Order on WhatsApp";
   "WhatsApp" on phones).
2. **The journey**, one pinned section, `end: '+=700%'`, scroll scrubbed with
   a lerp (`s += (p − s) · 0.1`). The first 62% is the day, the rest the
   night showcase. Overlays: the recipe steps chip row (Mix · Roll · Bake ·
   Box, with an oven dial), the kicker (phones: "This is Doughy, our baker.
   Scroll to watch him bake ↓"), the big script headline, a scroll button,
   Doughy's speech bubble, the night "featuring" panel (a slim bar on phones),
   three product cards and a 01 / 03 counter.
3. **Facts and guide**: "100% baked at home · 2 ways eggless or egg · Solapur
   delivered citywide", then the card "Doughy will show you the menu." with
   "See the full menu →".
4. **Footer**: wordmark, one-line blurb, Order (WhatsApp, delivery line),
   Follow (Instagram, back to top), copyright.

### `menu.html`, the one menu

Sticky nav (wordmark, Home, Contact, pill), hero with Doughy ("The whole
menu, both ways." plus "Doughy says: start with the cookies."), a sticky bar
with category chips (scroll-spy) and the egg icon toggle, then every category:
heading, blurb, item cards (photo or Doughy's "Product shot coming soon" sign,
name, tag, size pills with prices, egg icon, Order button). Photographed
categories and items sort first. Photos open a full-screen lightbox (strip of
photo and photo2, swipe, tap anywhere or Escape to close). A fixed cocoa
"Order on WhatsApp" bar sits at the bottom. Page always opens at the top
unless a category hash brought the visitor.

### `404.html`

Doughy's sign ("Nothing's baking here."), links to the kitchen and the menu.

## 6. The journey, as built

Camera keys `{t, pos, tgt, hold | arc}` through `seq()`; a `hold` key drifts
linearly from the previous key, others ease with a sine lift. Portrait
viewports clamp the vertical FOV to 64° and tilt wide shots down. Day
stations by hp: hero and intro (Doughy says hello), Mix (brown butter and
chocolate), Roll (cookies, rolls, bombolone by hand), Bake (twelve minutes,
the peek), Box at dusk (today's batch done; order tonight, baked tomorrow
morning). The dusk hold keeps drifting so the scroll never feels stuck.
Night: lights down, three close-ups (bombolone, cookies, cinnamon rolls),
each with one spoken line and the featuring panel, then the wide final shot
("The whole menu is just below. Come."). Doughy's head is projected each
frame to anchor the bubble; a character light keeps him bright.

Rules: nothing enters from the bottom edge during the pin; the bubble is the
only text that moves with him; the three night product cards sit at the
bottom of the viewport as links, not popups.

## 7. Menu data

`js/menu-data.js` is the single source of truth: `window.MENU_DATA` with
`whatsapp`, `categories[]` (`id, name, short, tint, emoji, blurb, sizes[],
review?, items[]`), each item `{name, tag, eggless[], egg[], photo, photo2?,
note?}` with one price per size, plus `fromPrice(cat)` and `waLink(text)`.
The home page reads "from ₹" values from it; the menu page renders entirely
from it. Prices follow the owner's draft of 2026-11-04 and the size-table
rule; the discrepancies and placeholders are itemised in `docs/review-list.md`.

## 8. Visual language

Cream `#FFF9F3`, paper `#FBF1E6`, blush `#F7CFD6`, mint `#CDEBDC`, butter
`#FAEBB4`, cocoa text, pink accent `#E98A9A`. Fraunces for headings, Nunito
for body, Caveat for the wordmark and Doughy's voice. Pills: cocoa fill with
cream text. Glass panels (blurred cream) for overlays. Grain overlay at 6%.

## 9. Performance and motion

- First load of the home page, including fonts and the vendored libraries,
  stays under 1.2 MB transferred; the menu page under 400 KB. Measured and
  recorded in the review list at launch.
- Photos: JPEG at 1200 px on the long edge for the lightbox (all under
  170 KB), 480×360 WebP thumbnails for the cards, lazy-loaded with explicit
  dimensions. Doughy renders as small WebP.
- Only `transform` and `opacity` animate on DOM elements. The scene renders
  on `requestAnimationFrame` and pauses when the stage is off screen.
- Reduced motion: static stacked page, first frame rendered once.
- No WebGL: poster image, same text, journey still scrolls as a normal page.
- Device pass on a real Android and an iPhone is the owner's, after launch;
  Lighthouse numbers are recorded, not gated, because of the Three.js weight.

## 10. Accessibility

Keyboard-reachable links and buttons with visible focus; the egg toggle
buttons carry `aria-label` and `title`, the card icons carry visually hidden
text; photos have alt text naming the bake; the lightbox is a `dialog` with
Escape to close; the speech bubble is `aria-live="polite"`; headings are real
headings.

## 11. Files and deployment

```
index.html  menu.html  404.html  .nojekyll  README.md
css/site.css        shared tokens, nav, pills, footer, grain
css/home.css        journey overlays, facts, guide, fallbacks
css/menu.css        menu page
js/menu-data.js     the only file to edit for prices
js/home.js          scroll progress, overlays, Doughy's lines (no WebGL needed)
js/kitchen.js       the Three.js kitchen, Doughy and the camera (ES module)
js/menu.js          menu rendering, chips, egg toggle, lightbox
vendor/three/three.module.min.js   vendor/gsap/gsap.min.js  vendor/gsap/ScrollTrigger.min.js
photos/*.jpg  photos/thumbs/*.webp  photos/doughy-*-sm.webp
img/doughy/*.png    Doughy render sources
img/og.jpg  img/kitchen-poster.jpg  favicon.png  apple-touch-icon.png
tools/              screenshot and image scripts (dev only, Node + Edge)
docs/               this design, the plan, the review list
```

Deploy: push `main`; Pages source "Deploy from a branch", `main`, `/ (root)`.
Head metadata: title "Batter & Dough · Home bakery in Solapur", description,
Open Graph title, description and image so WhatsApp previews show Doughy.

## 12. Under review

Everything defaulted by the builder is in `docs/review-list.md`: price
discrepancies, placeholders, croissants, descriptions, the notice period,
Doughy's ten lines, the WhatsApp message wording, the egg icon colours, the
night cards on the claude.ai preview, and the OG image.
