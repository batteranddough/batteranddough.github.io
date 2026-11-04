# Batter & Dough website: design

Date: 2026-11-04
Status: draft for approval

## 1. Intent

A website for Batter & Dough, a home bakery run by the site owner's sister. It
exists so a customer who hears about the bakery (Instagram, a friend, a
WhatsApp forward) can open one link on their phone, see what she bakes and what
it costs, and send her an order on WhatsApp in under a minute.

The site also has to feel like her: warm, homemade, a little playful. The
menu she already designed (cream background, blush pink, mint and butter
yellow blobs, cocoa brown serif headings, watercolour bakes, a hand-drawn heart
logo) is the visual starting point. The site is that menu brought to life.

The chosen direction is **Doughy**: a dough-ball mascot who, as the visitor
scrolls, is rolled, filled, flattened, spiralled and baked into each item on
the menu. The brand is "Batter & Dough", so the mascot is literally the dough.
Doughy also acts as guide: tapping a nav item makes Doughy scamper to that
section.

## 2. Goals, non-goals, anti-goals

Goals

- A customer on a mid-range Android phone can reach the menu, pick items, and
  land in a WhatsApp chat with the order already typed out.
- The first scroll is delightful: the Doughy journey is the thing people
  screenshot and share.
- Prices are correct, in INR, with both eggless and egg prices visible.
- Zero running cost. Static files on GitHub Pages, no backend, no paid service.
- The sister can update prices by editing one small file.

Non-goals

- Online payment, carts that persist, user accounts, order tracking.
- A CMS, blog, or admin panel.
- Analytics or cookies. Nothing to consent to.
- Multiple languages.

Anti-goals (a failure even if it "works")

- The animation stutters or drains battery on a budget phone.
- The journey traps the visitor: they cannot get to the menu or the order
  button quickly.
- The site shows a price she does not actually charge.
- Doughy is just decoration standing beside the food. Doughy must visibly
  become the food.

## 3. Constraints

- Hosting: GitHub Pages, served from the `main` branch root of the repository
  `batteranddough/batteranddough.github.io` (GitHub organization
  `batteranddough`, created by the owner). Public URL:
  `https://batteranddough.github.io`. The repository must be public for Pages
  on the free plan.
- Audience is mostly on phones, some on laptops. Design for a 360×640 viewport
  first, then widen. Everything must work at 320px wide and at 1440px wide.
- No build step. Files are hand-written and pushed. No Node toolchain is
  required to deploy, though a script to resize photos is fine.
- No WebGL. The inspiration pages used Three.js and were built for laptops; this
  site uses SVG, CSS and GSAP instead so it stays light on phones.
- Respect `prefers-reduced-motion`: the journey degrades to a static,
  readable page with no pinned scrolling.
- Local folder on the owner's machine: `D:\Naya Repos\personal\batter-and-dough`.
  The folder name does not need to match the repository name.

## 4. Decided by the owner

- Direction: Doughy (section 1).
- Ordering: WhatsApp click-to-chat. No forms.
- Currency: INR, shown as `₹218` with no decimals. Prices rounded to whole
  rupees.
- Any item with no price in the sister's list shows `₹1000` for both eggless
  and egg, as a deliberate placeholder until she supplies the real one.
- Photos: seven photos supplied in the project folder (three of chocolate-chunk
  cookies at golden hour, two of plain croissant-style pastries, two of
  chocolate-glazed croissant-style pastries). These go in the gallery.

## 5. Site structure

One page, `index.html`, with anchored sections in this order. "Pages" from the
owner's original idea (Menu, Book, Contact) are sections; the nav scrolls to
them and Doughy runs ahead.

1. **Nav bar.** Fixed at the top, compact. Wordmark on the left ("Batter &
   Dough" with the heart), links Menu · Combos · Gallery · Order, and an
   "Order on WhatsApp" pill. On phones the links collapse behind a single
   button; the WhatsApp pill stays visible.
2. **Hero.** Doughy sits in a mixing bowl on a counter. Wordmark large, tagline,
   two buttons: "See the menu" and "Order on WhatsApp". A scroll hint. The
   hero is the first frame of the journey, not a separate section.
3. **The journey.** A pinned scene (section 7). Seven stations, one per menu
   category. Ends with Doughy taking a bow and a "Full menu" button.
4. **Menu.** Eggless/egg switch at the top, then every category and item with
   sizes and prices (section 8). Each row has an add button feeding the order
   builder (section 9).
5. **Combos.** Two cards: Overjoy combo and Blissful Bombolone box. Same add
   button.
6. **Gallery.** The seven photos in a horizontal snap-scroll strip on phones
   and a grid on laptops.
7. **About.** Three or four sentences from the sister about the bakery
   (placeholder copy until supplied). One photo beside it.
8. **Order.** Doughy waving. How ordering works in three short lines: message
   on WhatsApp, how much notice she needs, where she delivers. Big WhatsApp
   button. Instagram link.
9. **Footer.** Wordmark, "Home bakery · [city]", Instagram, WhatsApp, year.

A floating order pill (section 9) appears once anything has been added.

## 6. Doughy

Doughy is drawn as SVG, in code, so every pose is a vector that can be
animated without an illustrator.

- Body: a soft, slightly squashed ball, ivory (`#F7E7CE`) with a warm darker
  edge (`#E8CFA8`), a few flour speckles.
- Face: two cocoa bean eyes, a small closed-mouth smile, blush cheeks in the
  menu's pink.
- A small white paper chef's hat, tilted. It is what makes Doughy read as "the
  baker" and it stays on through every transformation (it pops off and lands
  back on after each one).
- Stubby arms that appear only when Doughy needs them (pointing, waving,
  holding a piping bag).
- Idle: a slow breathing squash-and-stretch, an occasional blink.
- Personality: eager, a little clumsy, proud of each bake.

Doughy's look is the builder's first deliverable and is reviewed by the owner
before the journey is built on top of it.

## 7. The journey (pinned scroll scene)

Mechanic, borrowed from the inspiration pages: one continuous scene, pinned
for the length of the journey. Scrolling is the camera. Nothing else
hijacks scroll; native scrolling only.

The scene is a wide SVG bakery kitchen: tiled wall, a shelf of jars, an oven
with a glowing window, a counter in the foreground, a window with a sunset.
As the visitor scrolls, the kitchen pans sideways behind Doughy, who stays
near the centre of the viewport. Shelf and wall move slower than the counter
for depth. At each station the camera pushes in a little (scale up 5 to 8
percent) while the item is made, then pulls back out as it pans to the next
station.

Each station has: Doughy's transformation, a small prop animation, a heading,
one line of copy, a "from ₹X" line, and a "See in menu" link. Text sits in the
lower third on phones and to the side on laptops.

| # | Station | Doughy becomes | Prop beat | Heading (draft copy) |
|---|---------|----------------|-----------|----------------------|
| 0 | Hero / the bowl | rests in a mixing bowl, whisk leaning on it | batter swirl settles into a dough ball | Batter & Dough |
| 1 | Bombolone | rolls into a tight ball, proofs (grows), turns golden, gets filled by a piping bag, a dot of chocolate or a cherry on top | sugar sprinkle falls | Bombolone. Pillowy, filled to the brim. |
| 2 | Cookies | flattens into a disc, cracks open, chocolate chunks rain down and sink in | a cooling rack slides in, two more cookies land beside | Cookies. Crisp edge, gooey middle. |
| 3 | Cinnamon rolls | stretches into a long strip, rolls up into a spiral, glaze drizzles over | a plate slides under | Cinnamon rolls. Soft, sticky, still warm. |
| 4 | Brownies | squares into a slab, a knife cuts it, two pieces stack with crumbs | a few crumbs scatter | Brownies. Dense, fudgy, unapologetic. |
| 5 | Cookie pie | spreads into a fluted tart tin, bakes golden, one slice pulls out | a cake slice lifts it | Cookie pie. A cookie you cut like a cake. |
| 6 | Cookie tin | hops into the pink floral tin as raw dough, a gold scoop lifts a ball | the lid tilts open | Scoopable cookie tin. Bake it yourself, whenever. |
| 7 | Bow | Doughy back to normal, takes a bow, hat lands on head | confetti of chocolate chips | That's the menu. Order anything, or everything. |

Rules for the journey:

- Total pinned scroll length is six to eight viewport heights, so one thumb
  flick never skips a whole station.
- A "Skip to menu" link is visible at the top of the journey from the first
  frame.
- Doughy plus the station text must fit a 360×640 viewport with nothing cut
  off; the kitchen is allowed to be cropped at the sides.
- Transformations are driven by scroll position (scrubbed), so scrolling back
  un-bakes the item. Small prop beats (sprinkle, crumbs) may play on entry
  instead of scrubbing.
- On `prefers-reduced-motion`, the pin is removed and the eight stations
  render as a normal vertical list, each with Doughy in its finished pose.
- Morphing technique is the builder's choice (path morph, layered shapes with
  cross-fades, or a mix), as long as the anti-goal in section 2 holds.

## 8. Menu data

The single source of truth for prices is `js/menu-data.js`. Everything below
is transcribed from the sister's price draft dated 2026-11-04, rounded to
whole rupees, in the form eggless / egg. Pack sizes come from her size table;
where she gave a size table it wins over the single price at the top of her
list.

Bombolone Doughnut

| Item | Size | Eggless | Egg |
|------|------|---------|-----|
| Chocolate Bombolone | Box of 3 | 105 | 111 |
| Chocolate Bombolone | Box of 6 | 210 | 222 |
| Cream Brulee Bombolone | Box of 3 | 81 | 84 |
| Cream Brulee Bombolone | Box of 6 | 162 | 168 |
| Customised filling Bombolone | per box | 1000 | 1000 |

Cookies

| Item | Size | Eggless | Egg |
|------|------|---------|-----|
| Double chocolate chip cookies | Box of 4 | 108 | 112 |
| Double chocolate chip cookies | Box of 6 | 162 | 168 |
| Double chocolate chip cookies | Box of 8 | 218 | 225 |
| Toffee chocolate chip cookies | Box of 4 | 122 | 125 |
| Toffee chocolate chip cookies | Box of 6 | 183 | 187 |
| Toffee chocolate chip cookies | Box of 8 | 244 | 250 |
| Brownie cookies | Box of 4 | 161 | 157 |
| Brownie cookies | Box of 6 | 241 | 235 |
| Brownie cookies | Box of 8 | 322 | 314 |
| Biscoff cookies | per box | 1000 | 1000 |

Cinnamon Rolls

| Item | Eggless | Egg |
|------|---------|-----|
| Classic cinnamon roll | 310 | 317 |
| Chocolate cinnamon roll | 426 | 440 |

Brownie

| Item | Eggless | Egg |
|------|---------|-----|
| Chocolate fudge brownie | 331 | 347 |
| Brownie slab (customised) | 1000 | 1000 |
| Biscoff brownie | 1000 | 1000 |

Cookie Pie

| Item | Eggless | Egg |
|------|---------|-----|
| Cookie pie | 402 | 417 |

Scoopable Cookie Tin

| Item | Eggless | Egg |
|------|---------|-----|
| Scoopable cookie tin | 435 | 447 |

Combos

| Combo | Contents | Eggless | Egg |
|-------|----------|---------|-----|
| Overjoy combo | 2 double chocolate chip, 2 toffee chocolate chip, 2 brownie cookies | 280 | 282 |
| Blissful Bombolone | 3 chocolate, 3 cream brulee | 272 | 281 |

Known discrepancies in the source, flagged to the owner, resolved as follows
until told otherwise:

- Chocolate Bombolone box of 6 is 210/222 in the size table and 213/223 at
  the top of her list. Cream Brulee box of 6 is 162/168 versus 160/170. The
  size table is used.
- Brownie cookies are priced higher eggless than egg (322 vs 314) in both
  places in her draft. Transcribed as written.
- The printed menu shows the Overjoy combo with 2 Biscoff cookies as well
  (8 cookies). The price draft computes it for 6 cookies without Biscoff.
  The 6-cookie version is used because that is what the price was computed
  for.
- Customised items carry the ₹1000 placeholder and a "Customised" tag so
  the number reads as a starting point. The row's add button still works.
- Her notes about packing charges and per-unit costs are internal and are not
  shown.

Display rules:

- Switch at the top of the menu: **Eggless** (default) / **Egg**. Flips every
  price on the page, including journey "from ₹" lines and combo cards.
- Items with sizes show the sizes as pills; the price shown is for the
  selected size. Default size is the smallest.
- "from ₹X" in the journey is the lowest eggless price in that category.

## 9. Order builder and WhatsApp hand-off

A static site cannot take orders, but it can write the message.

- Every menu row and combo card has an add button and a count.
- Once anything is added, a floating pill at the bottom of the screen reads
  for example "3 items · ₹612 · Order on WhatsApp".
- Tapping it opens `https://wa.me/<number>?text=<encoded message>` in a new
  tab. The message:

```
Hi Batter & Dough! I'd like to order:
• Double chocolate chip cookies, box of 6 × 1 (eggless) – ₹162
• Chocolate Bombolone, box of 3 × 2 (eggless) – ₹210
• Overjoy combo × 1 (eggless) – ₹280
Total: ₹652

Name:
Needed by (date):
Delivery address or pickup:
```

- The eggless/egg switch applies to the whole order; a customer who wants a
  mix edits the message in WhatsApp.
- The pill has a "clear" action. Counts are kept only in memory; a reload
  starts fresh.
- The "Order on WhatsApp" buttons elsewhere open the chat with a short
  greeting and no items, for custom requests.
- Phone number, Instagram handle, city, delivery note and notice period live in
  `js/site-config.js`. Until supplied they are placeholders and the WhatsApp
  links are visibly marked "number pending" in a dev banner that is removed
  for launch.

## 10. Visual language

Taken from the sister's menu so the site and the printed menu match.

- Background cream `#FFF9F3`. Blobs in blush `#F7CFD6`, mint `#CDEBDC`,
  butter `#FAEBB4`, placed like the menu's corner blobs, softly animated.
- Text cocoa `#5A2E1C`. Accent pink `#E98A9A` for ribbons and the active
  state of the egg switch. Chocolate `#3B1F14` for Doughy's eyes and for
  chocolate in illustrations.
- Headings: Fraunces (soft serif, close to the menu's "OUR MENU"). Body:
  Nunito. Wordmark: Caveat with the small heart, echoing the hand-drawn logo
  on the menu. Google Fonts, loaded with `display=swap`, two weights each at
  most.
- Category labels sit on a pastel highlight bar, as on the menu (pink for
  Bombolone, mint for Cookies, pink for Cinnamon Rolls, yellow for Brownie,
  and so on).
- Buttons: pill-shaped, cocoa fill with cream text for primary, cream with a
  cocoa outline for secondary. The WhatsApp button uses WhatsApp green
  `#25D366` with the logo.
- Photos are shown with rounded corners and a thin cream border, never
  stretched. Illustrated items in the journey use the same watercolour-ish
  palette as the menu drawings.
- Contrast: all text meets WCAG AA against its background.

## 11. Motion and performance rules

- Library: GSAP 3.15 with ScrollTrigger and MorphSVG. All GSAP plugins have
  been free since 3.13. Vendored into `vendor/gsap/` so the site does not
  depend on a CDN.
- No layout thrash: animate only `transform` and `opacity` on DOM elements;
  SVG attribute morphs only inside Doughy's own small SVG.
- Viewport units use `svh`/`dvh` so the pinned scene does not jump when the
  mobile address bar shows or hides.
- First load budget: under 600 KB transferred including fonts, GSAP and the
  hero. Photos are converted to WebP, resized to 1200px on the long edge,
  under 200 KB each, lazy-loaded below the fold.
- Target: Lighthouse mobile Performance 85 or better, Accessibility 95 or
  better, on a throttled run.
- Test on a real Android phone in Chrome and on an iPhone in Safari before
  launch, scrolling the whole journey both ways.

## 12. Accessibility

- Every button and link reachable by keyboard; visible focus rings in cocoa.
- The egg switch is a real `role="switch"` with its state announced.
- Prices are text, never images. Each photo has alt text naming the bake.
- Doughy's SVG has an `aria-label`; station headings are real headings so a
  screen reader can read the menu categories off the journey.
- `prefers-reduced-motion` handled as in section 7.

## 13. Files and deployment

Suggested layout; the builder may adjust within the no-build-step constraint.

```
index.html
404.html
.nojekyll
css/site.css
js/site-config.js     phone, Instagram, city, notice period
js/menu-data.js       the only file to edit for prices
js/main.js            nav, switch, order builder, WhatsApp link
js/journey.js         Doughy and the pinned scene
img/doughy/           Doughy's SVG parts
img/scene/            kitchen SVG layers and item illustrations
img/photos/           WebP photos, resized
img/og.png            share image
favicon.svg           Doughy's face
vendor/gsap/          gsap.min.js, ScrollTrigger.min.js, MorphSVGPlugin.min.js
docs/superpowers/     this design and the plan
```

Deploy: push to `main`. GitHub Pages settings: source "Deploy from a branch",
branch `main`, folder `/ (root)`. Every push is a deploy. A `README.md`
explains to the sister how to change a price (edit `js/menu-data.js`, commit,
done).

Head metadata: title "Batter & Dough · Home bakery", a one-line description,
Open Graph image and title so WhatsApp link previews show Doughy and a bake.

## 14. Content still to be supplied by the owner

Placeholders are used until these arrive; none of them changes the build.

- WhatsApp number with country code.
- Instagram handle.
- City and delivery area, and how much notice an order needs.
- Three or four sentences for the About section, and whether to use the
  sister's name.
- What the croissant-style pastries in the photos are (they are not on the
  menu). If they are a product, their name and price.
- Real prices for the four ₹1000 placeholder items.

## 15. Left to the builder

- Exact Doughy proportions and the morphing technique, subject to owner
  review of the first Doughy render.
- How the kitchen scene is split into layers and how much parallax each gets.
- Whether station text animates in per character, per line, or as a block.
- The phone nav pattern (drawer versus bottom sheet) as long as the WhatsApp
  pill stays visible.
- Gallery interaction on laptops (grid versus lightbox).
- The photo resize script and whether it lives in the repo.

## 16. Process notes

- The first deliverable is Doughy alone on a page, with idle animation and one
  transformation (cookie), shown to the owner before the rest is built.
- Second deliverable is the menu and order builder, because that is the part
  the bakery cannot launch without.
- Third is the full journey. Fourth is gallery, about, order, polish and the
  mobile device pass.
