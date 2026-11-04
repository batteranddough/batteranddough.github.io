# Batter & Dough

The website of Batter & Dough, a home bakery in Solapur. Live at
**https://batteranddough.github.io**.

Two pages: the home page, where Doughy bakes the morning's batch as you
scroll, and the menu, where every bake is listed with eggless and egg prices
and an "Order" button that opens WhatsApp with the item typed in.

Static files only. Pushing to `main` publishes the site (GitHub Pages).

## Changing a price

Every price lives in one file: **`js/menu-data.js`**. Each item has one
eggless price and one egg price per box size, in the same order as the
category's `sizes` list. For example, cookies come in boxes of 4, 6 and 8:

```js
sizes: ['Box of 4', 'Box of 6', 'Box of 8'],
items: [
  { name: 'Brown butter chocolate chip', tag: 'Nutty brown butter, dark chocolate chunks',
    eggless: [108, 162, 218], egg: [112, 168, 225], photo: 'photos/cookies-tray.jpg', photo2: 'photos/cookies-plate-2.jpg' },
```

Change the numbers, save, commit, push. Whole rupees only. Both pages read
from this file, so the "from ₹" lines on the home page follow automatically.

## Adding a product photo

1. Put the JPEG in `photos/` (about 1200 px on the long edge, under 200 KB).
2. On the item in `js/menu-data.js`, set `photo: 'photos/<file>.jpg'` and,
   if there is a second shot, `photo2`.
3. Run `python -I tools/images.py` to make the small card thumbnail
   (`photos/thumbs/<file>.webp`). Commit both.

Items without a photo show Doughy holding a "Product shot coming soon" sign.

## Previewing locally

Open the site through a tiny local server, not by double-clicking
`index.html` (browsers refuse to load the kitchen module from a file):

```
node tools/serve.js
```

then open the printed address. See `tools/README.md` for the screenshot and
check scripts.

## Where things are

| Path | What |
|------|------|
| `index.html`, `css/home.css`, `js/home.js`, `js/kitchen.js` | the home page and the journey |
| `menu.html`, `css/menu.css`, `js/menu.js` | the menu page |
| `css/site.css` | colours, fonts, nav, pills, footer shared by every page |
| `js/menu-data.js` | **prices, names, photos** |
| `photos/` | product photos, thumbnails, Doughy renders |
| `vendor/` | pinned copies of three.js and GSAP |
| `docs/review-list.md` | everything still to confirm with the baker |
| `docs/superpowers/` | the design and the build plan |
