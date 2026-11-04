# Things to review before launch

Every place where a default, a guess, or a placeholder was used instead of a
confirmed answer from the bakery. Tick each one off once the sister has
confirmed or replaced it. Keep adding to this list during the build.

## Prices and menu (from the "Menu Draft" supplied 2026-11-04)

The menu now lives in one place, `menu-data.js`, and every page reads from it.
The size table in the draft wins over the single prices at the top of the list
whenever they differ (owner rule: price draft wins).

- [ ] **Chocolate Bombolone** box of 6 uses Rs 210 / 222 from the size table,
      not Rs 213 / 223 from the top of the list ("added Rs 20 packing").
      **Creme brulee Bombolone** box of 6 uses Rs 162 / 168, not Rs 160 / 170.
      Confirm which number the customer should see, and whether the Rs 20
      packing is on top of the box price or already inside it.
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
      chocolate, Rs 272 / 281) replace the earlier "Overjoy" combo. Names are
      the draft's; confirm the public names. The Rs 86 inside each combo is
      packaging + shipping; the cards say "includes packaging & delivery".
- [ ] **Dropped because the new draft does not list them**: Customised filling
      Bombolone, Biscoff cookies, Brownie slab (customised), Biscoff brownie.
      Add back with prices if they are still sold.
- [ ] **Fudge brownie, cookie pie, cookie tin** have one price each and no
      size; shown as "Each". Confirm per piece, per box or per slab, and the
      quantity.
- [ ] **Croissants** are on the menu because they appear in four of the
      supplied photos, but no draft has ever listed them. Names and prices are
      invented: Classic butter croissants, box of 4, Rs 240 / 248; Chocolate
      croissants, box of 4, Rs 320 / 332. The menu page flags the category
      "to confirm". Confirm or remove.
- [ ] **One-line descriptions** under every item ("Nutty brown butter, dark
      chocolate chunks", "Custard filling, burnt-sugar top", and so on) and the
      category blurbs are the builder's guesses at what the bakes are.

## Contact and ordering

- [ ] **Notice period**: "Please order a day ahead" appears on the home page
      and the menu page. Builder's default.
- [ ] **Delivery area**: "Anywhere in Solapur" as supplied; confirm whether
      there is a delivery charge or a minimum order.
- [ ] **WhatsApp number** +91 89996 50554 as supplied; confirm it is the
      business number she wants public.
- [ ] **Instagram** https://www.instagram.com/batter_._dough/ as supplied.
- [ ] **WhatsApp pre-filled messages**: the big buttons send "Hi Batter &
      Dough! I'd like to order..."; each menu item's Order button sends
      "Hi Batter & Dough! I'd like <item> (box of N), eggless/with egg."
      Builder's wording; confirm the tone.

## Copy

- [ ] **About section**: generic placeholder text written by the builder.
      Replace with the sister's own words, and decide whether to use her name.
- [ ] **Tagline under the wordmark**: builder's draft.
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
      by adding ?doughy=A, B or D to the prototype URL.
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
- [ ] **Custom domain**: none for now; site lives at
      https://batteranddough.github.io.
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

- [ ] **Live URL**: https://batteranddough.github.io (menu at /menu.html).
      Pushing `main` publishes; there is no staging copy.
- [ ] **Real-phone pass** is the owner's: scroll the whole journey both ways
      on an Android in Chrome and an iPhone in Safari, open the menu, tap a
      photo, tap Order. Report anything that stutters or sits wrong.
- [ ] **Page weight** (cold load on a phone, measured locally without
      compression, so the live numbers are lower): home 1,275 KB of which
      three.js 675 KB, fonts 349 KB, GSAP 117 KB; menu about 405 KB of which
      fonts 276 KB. GitHub Pages compresses the scripts (three.js arrives at
      roughly a quarter of its size). The fonts are the next lever if a budget
      phone feels slow: Fraunces loads five weights and italics.
- [ ] **Short landscape phones** (under 420 px tall): the night bar and the
      product cards sit on the bottom edge so the bakes stay visible. Builder's
      fix, not in the prototype.
- [ ] **Reduced motion**: visitors with "reduce motion" on get a stacked
      static page (kitchen still, text below, cards as links). No speech
      bubble there.
- [ ] **No WebGL** (old or locked-down phones): a still poster of the kitchen
      with the same text; the rest of the page works.
- [ ] **404 page**: Doughy pointing, "Nothing's baking here.", links home and
      to the menu. Copy is the builder's.
- [ ] **Share preview** (WhatsApp, Instagram DMs): title "Batter & Dough ·
      Home bakery in Solapur", description and the hello frame as the image.
      Check how it looks the first time the link is shared; previews cache.
