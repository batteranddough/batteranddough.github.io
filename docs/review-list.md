# Things to review before launch

Every place where a default, a guess, or a placeholder was used instead of a
confirmed answer from the bakery. Tick each one off once the sister has
confirmed or replaced it. Keep adding to this list during the build.

## Prices and menu (from the "Menu Draft" supplied 2026-11-04)

The menu lives in one place, `js/menu-data.js`, and both pages read from it:
the menu page builds itself from it, and the home page takes its three
"from ₹" lines (cards, featuring panel, Doughy's chalkboard) from it.
The size table in the draft wins over the single prices at the top of the list
whenever they differ (owner rule: price draft wins).

- [x] **Chocolate Bombolone** box of 6 used Rs 210 / 222 from the size table,
      not Rs 213 / 223 from the top of the list ("added Rs 20 packing").
      **Creme brulee Bombolone** box of 6 used Rs 162 / 168, not Rs 160 / 170.
      Settled by the cards of 2026-11-05: Chocolate Rs 106 / 213 eggless and
      Rs 111 / 223 egg; Creme brulee Rs 81 / 162 eggless and Rs 120 / 238 egg.
- [ ] **Brown butter chocolate chip** box of 8 is Rs 218 / 225 in both the
      size table and the top of the list, although the list says "added Rs 20
      packing". Confirm the box-of-8 price with packing.
- [ ] **Brownie cookies** are priced higher eggless than egg
      (Rs 322 vs 314 for a box of 8; Rs 161 vs 157 for 4). Transcribed as
      written; confirm it is not swapped. Same for **Double chocolate chip**
      (Rs 397 eggless vs 354 egg) and **Combo cookies** (Rs 380 vs 370).
- [ ] **Scoopable cookie tin** is Rs 436 in this draft, Rs 435 in the earlier
      one. Using Rs 436 / 447.
- [ ] **Combo cookies** (two each of the four cookies, eight in the box,
      Rs 380 / 370) and **Blissful Bombolone** (three creme brulee, three
      chocolate, Rs 272 / 316 since the cards of 2026-11-05) replace the
      earlier "Overjoy" combo. Names are
      the draft's; confirm the public names. The Rs 86 inside each combo is
      packaging + shipping; the cards say "includes packaging & delivery".
- [ ] **Dropped because the 2026-11-04 draft did not list them**: Biscoff
      cookies and Biscoff brownie. (Customised fillings and the Brownie slab
      came back on 2026-11-05 as price-on-request items.) Add the Biscoff
      bakes back with prices if they are still sold.
- [ ] **Fudge brownie, cookie pie, cookie tin** have one price each and no
      size; shown as "Each". Confirm per piece, per box or per slab, and the
      quantity.
- [x] **Croissants** appear in four of the supplied photos but no draft or
      card has listed them. Marked "Coming soon" on 2026-11-05: the photos
      stay on the menu page, the builder's invented prices were removed, the
      form does not offer them. To put them on sale, add prices in
      `js/menu-data.js` and drop `soon: true`.
- [ ] **One-line descriptions** under every item ("Nutty brown butter, dark
      chocolate chunks", "Custard filling, burnt-sugar top", and so on) and the
      category blurbs are the builder's guesses at what the bakes are.

## Contact and ordering

- [ ] **Notice period**: the menu page says "Please order a day ahead"; the
      home page and both footers say "baked the morning you order". Builder's
      defaults; pick one wording if they should match.
- [ ] **Delivery area**: "Anywhere in Solapur" as supplied; confirm whether
      there is a delivery charge or a minimum order.
- [ ] **WhatsApp number** +91 89996 50554 as supplied; confirm it is the
      business number she wants public.
- [ ] **Instagram** https://www.instagram.com/batter_._dough/ as supplied.
- [ ] **WhatsApp messages**: since 2026-11-05 every Order button opens the
      order form first and the message is composed from it (see the feedback
      round below). The old one-line texts ("Hi Batter & Dough! I'd like
      <item> (box of N), eggless/with egg.") remain only as the fallback on
      the links for a browser without JavaScript. Builder's wording; confirm
      the tone.

## Copy

- [ ] **Menu card on the home page** ("Doughy will show you the menu." and the
      line under it) and the three fact chips (100% baked at home, 2 ways,
      Solapur delivered citywide): builder's drafts.
- [ ] **Journey copy** (hero lines, "Three to start with. Doughy's
      favourites.", the three featured facts per category): builder's drafts.
- [ ] **Doughy's spoken lines** (typed into a speech bubble by his head; all
      the big on-screen words were replaced by these). Day: "Hi! I'm Doughy. I
      bake everything here. Come, watch." / "Brown butter first. Then the
      chocolate. A lot of the chocolate." / "Cookies, rolls, bombolone. All
      rolled by hand, eggless or with egg." / "Twelve minutes. I won't peek.
      ...I peeked." / "Today's batch, done. Order tonight, it's baked tomorrow
      morning." Night: "Lights down. Three to start with. My favourites." /
      "Bombolone. Fried fresh, filled to the brim." / "Cookies. Crisp edge,
      gooey middle." / "Cinnamon rolls. Still warm when they reach you." /
      "The whole menu is just below. Come." Builder's drafts; the dusk line
      promises next-morning baking, confirm that is true.
- [ ] **Home-page invite** ("Doughy will show you the menu") and **menu-page
      intro** ("The whole menu, both ways", "Doughy says: start with the
      cookies"): builder's drafts.
- [ ] **Page title and share description** (what shows in a WhatsApp link
      preview): builder's draft.

## Visual

- [x] **Doughy's look**: owner chose **C, "Storybook"** (toon shading, cocoa
      outline, arc eyes, open smile) on 2026-11-04. It is now the default. The
      options page has since been deleted; the other looks are still reachable
      by adding ?doughy=A, B or D to the site address (a leftover switch the
      builder can remove).
- [ ] **Recipe-step chip** in the journey (Mix, Roll, Bake 180, Box):
      wording and the 180 degrees are builder's guesses.
- [ ] **Placeholder for items without a photo**: Doughy holding a sign that
      reads "Product shot coming soon. Doughy's on it." Shows for bombolone,
      the three unphotographed cookies, cinnamon rolls, brownie, cookie pie,
      cookie tin and both combos. A shot of each is needed before launch
      (ideally the same balcony/sunset light as the cookies and croissants).
- [ ] **Illustrated bakes in the journey** (the 3D bombolone, cookies and
      rolls): drawn by the builder, not from her menu artwork.
- [ ] **Photos**: seven supplied photos used on the menu page (cookies tray,
      croissant sunset shots with the night shot as an inset). Confirm they can
      be published.
- [ ] **Share image** (Open Graph): builder's composition.

## Technical

- [ ] **Repository visibility** switched to public on 2026-11-04 (needed for
      GitHub Pages).
- [ ] **Custom domain**: https://batterndough.in since 2026-11-05, bought
      at Hostinger (batteranddough.in was already taken). DNS lives in
      hPanel: 4 A + 4 AAAA records to GitHub Pages, `www` CNAME to
      batteranddough.github.io, and the org's verification TXT
      `_github-pages-challenge-batteranddough`. The repo's `CNAME` file holds
      the domain. Renewal is $9.99 + GST at Hostinger in November 2027;
      moving it to a cheaper registrar (Spaceship renews .in at about $6)
      before then is the owner's call.
- [ ] **Egg icons.** The eggless/with-egg switch and the label on every menu
      card are icons, not words: a crossed-out egg in green for eggless, a
      whole egg in red-brown for with egg (the Indian veg/non-veg colour
      convention, builder's call). Each icon carries its text for screen
      readers and a hover title.
- [ ] **Menu page is a separate URL** (`menu.html`); the egg/eggless switch
      on it is client-side only. Categories with real photos are listed first
      (cookies, croissants), and tapping a photo opens it full-screen.
- [ ] **Night product cards** sit at the bottom of the journey. In the
      claude.ai preview frame on some phones the bottom of the page is hidden
      behind the preview's own chrome; on the real site the page owns the whole
      viewport. Re-check on the live URL once Pages is up.

## Launch (build of 2026-11-04)

- [x] **Live URL**: https://batteranddough.github.io (menu at /menu.html),
      live since 2026-11-04; https://batterndough.in since 2026-11-05. Pushing `main` publishes within a minute; there
      is no staging copy.
- [ ] **Real-phone pass** is the owner's: scroll the whole journey both ways
      on an Android in Chrome and an iPhone in Safari, open the menu, tap a
      photo, tap Order. Report anything that stutters or sits wrong.
- [ ] **Page weight** (cold load on a phone, measured on the live site on
      2026-11-04): home 631 KB over 20 requests, of which fonts 349 KB,
      scripts 240 KB (three.js arrives compressed at 169 KB), images 18 KB;
      menu 400 KB over 19 requests, of which fonts 276 KB, photo thumbnails
      99 KB. Fonts are now the biggest item on both pages and the next lever
      if a budget phone feels slow: Fraunces loads five weights and italics.
- [ ] **Short landscape phones** (under 420 px tall): the night bar and the
      product cards sit on the bottom edge so the bakes stay visible. Builder's
      fix, not in the prototype.
- [x] **Phone toolbar strip**: on first load the kitchen stopped short of the
      bottom edge once Chrome hid its toolbar (owner's report, 2026-11-04).
      The stage now fills the viewport with the bar hidden, and the text layers
      keep to the viewport with the bar shown.
- [ ] **Reduced motion**: visitors with "reduce motion" on get a stacked
      still page (one frame of the kitchen, text below, cards as links). No
      speech bubble there, and Doughy does not idle.
- [ ] **When the kitchen cannot run** (no WebGL on old or locked-down phones,
      browsers older than Safari 16.4 or Chrome 89, or the three.js file not
      arriving): the same still page with a poster of the kitchen in place of
      the frame. Nothing pins; the rest of the page works.
- [ ] **404 page**: Doughy pointing, "Nothing's baking here.", links home and
      to the menu. Copy is the builder's.
- [ ] **Share preview** (WhatsApp, Instagram DMs): title "Batter & Dough ·
      Home bakery in Solapur", description and the hello frame as the image.
      Check how it looks the first time the link is shared; previews cache.

## Feedback round (2026-11-05)

Prices now come from the two menu cards supplied on 2026-11-05 ("Our menu"
and "Know more about sizes"); they replace the draft of 2026-11-04 wherever
the two differ. The 2026-11-04 bullets above are ticked where the cards
settled them.

- [x] **Croissants** are "Coming soon" (owner, 2026-11-05): the photos stay,
      the invented prices are gone from `js/menu-data.js`, the category sits
      last on the menu page and the order form does not offer it.
- [x] **Bombolone prices from the cards**: Chocolate Rs 106 / 213 eggless and
      Rs 111 / 223 egg; Creme brulee Rs 81 / 162 eggless and Rs 120 / 238 egg;
      Blissful Bombolone Rs 272 eggless / 316 egg. Cookies and rolls unchanged.
- [ ] **Price on request**: the cards list "Customized fillings" under
      bombolone and "Brownie slab, contact for customisation" with no price.
      Both are on the menu as "Price on request"; their Order button opens the
      form, which lists them without an amount and leaves them out of the
      estimated total. Confirm there is no base price to show.
- [ ] **Size names**: the cards say Small / Medium / Large; the site keeps
      "Box of 4 / 6 / 8" and so on, the cards' own counts. Builder's call.
- [ ] **"Brownies, pie and tin"** stays one section although the card has
      three headings with one or two lines each. Builder's call.
- [ ] **Order form** (opens from every Order button, before WhatsApp): bake,
      box size, eggless / with egg, quantity 1 to 20, "Add another bake";
      "Needed on" (earliest tomorrow, defaults to tomorrow); "Deliver in
      Solapur" (address or area required) or "I'll pick up"; "Your name"
      (required); "Anything else?" (optional). Doughy's line at the top is
      "Tell me what you'd like, and when." The fields and all wording are the
      builder's; say what else the baker needs (a phone number? a time of
      day? an occasion?).
- [ ] **A day's notice** is enforced by the date picker (earliest tomorrow).
      Builder's reading of "order a day ahead"; lower it if same-day orders
      are ever taken.
- [ ] **"We'll confirm the total and any delivery charge on WhatsApp."** sits
      under the estimate, and the message says "Estimated total". Builder's
      wording; it assumes a delivery charge may apply (see Delivery area).
- [ ] **The composed message**: "Hi Batter & Dough! I'd like to order:", one
      bullet per bake (name, size, egg choice, quantity, price), "Needed on:
      Fri, 7 Nov 2026", "Delivery to: ..." or "Pickup from the bakery",
      "Name:", "Notes:" (only if given), "Estimated total: Rs N" ("plus the
      items on request" when a price-on-request bake is in the order).
      Builder's format; nothing is stored anywhere, the form is client-side
      only.
- [ ] **Doughy's opening line** at rest, typed by time about a second after
      the title lands: "Hi! I'm Doughy. Scroll down and watch me bake ↓"
      (replaces "Hi! I'm Doughy. I bake everything here. Come, watch."). The
      italic kicker lost its "scroll" sentence on every width. The still page
      (no WebGL, reduced motion) has no bubble; its kicker is unchanged.
      Builder's wording.
- [x] **Recipe chips are buttons** now: tapping Mix / Roll / Bake / Box takes
      the journey to that station (people were tapping them anyway; owner,
      2026-11-05).
- [ ] **Scroll pace** of the arrow button, the chips and the night cards:
      1.2 s to 4 s depending on the distance, eased, cancelled by any wheel,
      touch or key. The arrow lands at the start of the mixer hold. Builder's
      numbers; say if it still feels fast, or now feels slow.
- [ ] **Night spotlight** (owner, 2026-11-05: the light was on Doughy's face
      and the bakes looked scrambled): one narrow cone per bake aimed at the
      counter; only the featured bake is lit during its close-up, all three
      during "Lights down" and at the very end; the room, the pendants and
      Doughy's own light drop so he is visible but not the subject; the
      close-ups look down from the front-right so the pieces separate; the
      bowl of dough leaves the island as the lights go down. Builder's tuning;
      check on a real phone that Doughy is not a silhouette.
- [x] **The leaning cookie** was a design choice (a cookie propped on its
      edge to show its chips) that read as broken; it now lies flat on the
      plate in front of the stack (owner, 2026-11-05).
- [ ] **Dark mode** (owner's request, 2026-11-05) follows the phone's
      light/dark setting; the sun / moon button in the nav overrides it and
      the choice is remembered on that device. Palette (builder's call): page
      #1F1410, panels #2A1B15, cards #2E1F19, text #F3E7DA, italic accents
      #E8AC8E; the WhatsApp pill inverts to cream on dark; the kitchen keeps
      its daylight (dark mode is the page, not the time of day), so the big
      "Batter & Dough" title and the kicker stay cocoa on the kitchen. The
      404 page and the order form follow the theme. Confirm the look on a
      phone in dark mode.

### Second look (owner's notes of 2026-11-05, evening)

- [x] **Doughy's last line** stopped at "The whole menu is just below. C": its
      typing window ran past the end of the journey. It now finishes before
      the end and stays up as the menu teaser arrives.
- [x] **Cinnamon rolls card** showed a croissant; it now shows a swirl
      (the home-page night card and the menu section header). Builder's pick
      of glyph; a drawn icon would be the next step.
- [x] **Nav words at night**: "Full menu / Contact" and the wordmark go cream
      once the lights go down (they were cocoa on the dark kitchen).
- [x] **Scrollbars**: the order form scrolls without a visible bar; the page
      bar is thin and in the house colours in both themes (Chromium 121+ and
      Firefox; Safari keeps its overlay bar).
- [ ] **Date picker** is now a strip of day chips (Tomorrow, then thirteen
      days) in the house style, with "Later" revealing the browser's own date
      box for anything further out. Builder's call: a two-week strip covers
      most orders; say if it should be longer.
- [ ] **Box size** is a segmented row (Box of 4 / 6 / 8) like the egg choice,
      not a dropdown. **Bake** stays a dropdown, drawn in the site's colours
      where the browser allows it (Chrome, Edge, Brave from early 2025);
      elsewhere the browser's own list in the matching light/dark scheme.
- [x] **Pickup** keeps the address cell and shows "We'll share the pickup
      address and a time on WhatsApp." there, so the name field no longer
      jumps. Builder's wording.
