# Feedback round of 2026-11-05: design

Date: 2026-11-05. Status: **built under the owner's standing instruction** to
start without waiting for plan approval (2026-11-04: "don't wait for my
approval on plan just get started once the plan lands"). Every call the
builder made is marked *builder's call* here and logged in
`docs/review-list.md` for the owner to overturn.

Source: the owner's message of 2026-11-05 with seven points and the two new
menu cards ("Our menu", "Know more about sizes").

## 1. Intent

The site is live and the owner has shared it. People who received the link
did not know to scroll, the arrow button rushes past Doughy, the night
close-ups light Doughy's face rather than the bake, one cookie looks broken,
the menu card has new prices, croissants are not for sale yet, and orders
should arrive on WhatsApp as a filled-in form rather than a bare "Hi".

## 2. The seven points, as decided

### 2.1 Croissants: coming soon

Owner: "Mark the croissant as coming soon. With prices hidden. Images should
be visible."

- `js/menu-data.js`: the croissants category carries `soon: true`. Its
  invented prices are deleted, not hidden, so nothing can leak.
- Menu page: the category sorts **last** (builder's call: photo-first sorting
  is for things you can order), its header badge reads "Coming soon", each
  card keeps its photos and tap-to-zoom, and in place of the size chips, the
  egg icon and the Order button there is one line: "Coming soon".
- Order form: croissants are not offered.

### 2.2 The new menu cards

The two cards of 2026-11-05 replace the "Menu Draft" of 2026-11-04 as the
source of prices. Differences applied:

| Item | Was | Now |
|------|-----|-----|
| Chocolate Bombolone, box of 3 / 6 | 105 / 210 eggless, 111 / 222 egg | 106 / 213 eggless, 111 / 223 egg |
| Crème brûlée Bombolone, egg | 84 / 168 | 120 / 238 |
| Blissful Bombolone, egg | 281 | 316 |

Everything else on the cards matches what the site already shows. Two lines
on the cards have no price and are added as "price on request" items
(`ask: true`, no price arrays): **Customised fillings** under Bombolone and
**Brownie slab** ("contact for customisation") under brownies. Their cards
show "Price on request" where the size chips go; their Order button opens the
form, which lists them without an amount.

The card's size names (Small/Medium/Large) are not shown; the site keeps
"Box of 4" and so on, which are the card's own counts (builder's call). The
grouping "Brownies, pie and tin" stays one section (builder's call; the card
has three headings with one or two lines each). The menu footer date becomes
5 Nov 2026.

### 2.3 Doughy says "scroll"

Owner: the scroll message on every screen should be said by Doughy; people
pressed the Mix / Roll / Bake / Box chips to see if that was how it worked.

- At rest, before any scroll, Doughy's bubble types by **time** (not by
  scroll): "Hi! I'm Doughy. Scroll down and watch me bake ↓", starting about
  a second after the headline lands and fully typed about 1.6 s later. It
  then holds and fades exactly where the old first line did (hp 0.125).
  The old line ("Hi! I'm Doughy. I bake everything here. Come, watch.") goes.
- The italic kicker loses its scroll sentence on every width, since Doughy
  now says it: desktop "A home bakery in Solapur. This is Doughy, our
  baker."; phone "This is Doughy, our baker."; still page unchanged.
- The four recipe chips become **buttons**: tapping Mix, Roll, Bake or Box
  scrolls the journey to that station at the slow pace of 2.4 (builder's
  call, because visitors already tap them).
- The still page (no WebGL, reduced motion) has no bubble; its kicker stays.

### 2.4 The arrow button scrolls too fast

The button, the night cards and the new step chips all scroll through one
helper: a GSAP tween of the window's scroll position, `power2.inOut`, lasting
1.2 s to 4 s depending on distance (about 1.1 s per viewport plus 0.9 s), so
the visitor watches Doughy hop to the mixer instead of arriving there. Any
wheel, touch or key input during the tween cancels it. The arrow button's
target is the start of the mixer hold (hp 0.30).

### 2.5 A real spotlight on the featured bake

Owner: the light sits on Doughy's face and the items look scrambled; only the
item being displayed should be lit.

- Each of the three product spotlights becomes a narrow cone (half-angle
  about 14 degrees, soft edge) hung above and slightly in front of its bake
  and aimed at the counter top, so it draws a pool of light around the bake
  and misses Doughy, who stands behind the island.
- Lighting at night drops further: ambient and hemisphere light to 0.1,
  pendants to 15 %, the front fill to 20 %, Doughy's own key light to a third.
  Doughy stays readable (his toon material has a little self-light) but is
  clearly not the subject.
- Only the featured bake is lit: during "Lights down. Three to start with."
  all three pools are on; from the first close-up onward the featured one is
  bright and the other two are off bar a trace, the pool switching with the
  camera.
- The close-up camera rises from about 16 to about 33 degrees above the
  counter and frames the bake from the front-right, so the three bombolone
  separate, the pool of light is visible, and Doughy's face sits in the upper
  corner rather than filling half the frame.
- The pink bowl of dough balls on the island shrinks away as the lights go
  down (it was blocking the bombolone close-up).

### 2.6 The leaning cookie

It was a design choice (a cookie propped against the stack to show its
chips) that reads as a broken, spilled cookie. It now lies flat on the plate
in front of the stack.

### 2.7 Ordering through a form

Owner: the final order sends a WhatsApp message, but first a form asks for
quantity, order date, more than one item, "and other required things".

What opens: every Order button (nav pill, home quick menu, menu page bottom
bar, each menu item's Order) opens the same dialog, centred, fading in (never
sliding up from the bottom). The links keep their WhatsApp `href` so a page
without JavaScript still opens a chat.

The dialog, top to bottom:

1. Doughy's small portrait and his line, in his handwriting: "Tell me what
   you'd like, and when." A close button.
2. **Bakes**: one or more rows. Each row: the bake (a select grouped by
   category; coming-soon items absent), the box size (a select; hidden when
   the category has one size), eggless / with egg (the same two icons as the
   menu), quantity (a minus / plus stepper, 1 to 20), and remove. "Add
   another bake" adds a row. Opened from a menu item, the first row is that
   item, its first size and the page's current egg choice.
3. **Needed on**: a date, earliest tomorrow (the bakery asks for a day's
   notice), defaulting to tomorrow.
4. **Delivery in Solapur / I'll pick up**: a two-way switch. Delivery asks
   for an address or area (required).
5. **Your name** (required) and **Anything else?** (optional: custom
   filling, a message on the box, allergies).
6. A running summary: each row's price (eggless or egg, that size, times
   quantity), "Estimated total ₹N", and the small print "We'll confirm the
   total and any delivery charge on WhatsApp." Price-on-request items show
   "on request" and are left out of the total.
7. **Send on WhatsApp**: validates, composes the message below, opens
   `wa.me` in a new tab (same tab if the pop-up is blocked), closes the
   dialog.

The message (plain lines; bullet points):

```
Hi Batter & Dough! I'd like to order:
• Brown butter chocolate chip · box of 6 · eggless · ×2 · ₹324
• Blissful Bombolone · combo · with egg · ×1 · ₹316
Needed on: Fri, 7 Nov 2026
Delivery to: Sadar Bazar, Solapur
Name: Aisha
Notes: candles please
Estimated total: ₹640
```

Nothing is stored anywhere; the form is client-side only. Keyboard: Escape
closes, focus lands on the first field on open, the backdrop closes on tap.
Behind the dialog the page's scroll is locked, as for the photo lightbox.

## 3. Goals, non-goals, anti-goals (this round)

Goals: a first-time visitor knows to scroll within two seconds; an order
arrives with everything the baker needs to say yes; the night close-ups look
like a product shot under a lamp.

Non-goals: payment, stock, slots, saving orders, any backend.

Anti-goals: anything sliding in from the bottom edge during the pin; the
form hiding the WhatsApp number; a price that is not on the card of
2026-11-05; the croissant prices surviving anywhere.

## 4. Constraints (unchanged)

Static files, no build; vendored three and GSAP; GitHub Pages from `main`;
account `AmaanKhan63`; prices only in `js/menu-data.js`; cocoa WhatsApp pill;
every default logged in `docs/review-list.md`.

## 5. Left to the builder

Exact light intensities, cone angles and camera numbers (tuned by
screenshot); the dialog's markup and styling within the site's tokens; test
coverage in `tools/check-home.js` and `tools/check-menu.js`.
