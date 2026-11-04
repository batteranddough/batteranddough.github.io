# Dev tools

Nothing here is needed to deploy the site. These scripts check the pages and
regenerate derived images on the owner's machine.

## Setup

- Node 20 and Microsoft Edge (the scripts drive Edge headless from
  `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`; change the
  `EDGE` constant if yours lives elsewhere).
- `cd tools && npm i` installs puppeteer-core 23.11.1.
- Python 3 with Pillow (`pip install pillow`) for `images.py`.

Output PNGs go to `tools/out/` (gitignored).

## Commands

| What | Command |
|------|---------|
| Journey frames at chosen scroll positions (0..1), phone and desktop, contact sheets | `node tools/shoot.js index.html h 0,0.05,0.33,0.6,0.655,0.72,0.85,0.95,0.995 desktop,phone tail` |
| Same against the live site | `node tools/shoot.js https://batteranddough.github.io/ live 0.05,0.72 phone` |
| Static page viewport shots at anchors | `node tools/view.js menu.html m phone top,#cookies,#croissants,bottom` |
| Menu behaviour checks (scroll-to-top, deep link, WhatsApp text, lightbox) | `node tools/check-menu.js menu.html` |
| Home fallbacks and odd viewports (no WebGL, reduced motion, landscape, tablet) | `node tools/check-home.js index.html` |
| Kitchen poster for the no-WebGL fallback | `node tools/poster.js index.html` |
| Open Graph share image | `node tools/og.js index.html` |
| Thumbnails, small Doughy renders and icons | `python -I tools/images.py` |

`shoot.js` drives the journey through `window.BD.snap(p)` so a frame is
rendered at an exact progress value without scrolling.

## Vendored libraries

Pinned copies in `vendor/`, downloaded from jsDelivr on 2026-11-04. SHA-256:

| File | Bytes | SHA-256 |
|------|-------|---------|
| `vendor/three/three.module.min.js` (three@0.170.0) | 691648 | `08fd7545d13d2c7fb65ab691530a802dafefd638596501854f267d0fb13c39e7` |
| `vendor/gsap/gsap.min.js` (gsap@3.15.1) | 73357 | `3d1bea374ab1b703cc5c4105358eec63c4465efdc573931dc116e34a0a190c1b` |
| `vendor/gsap/ScrollTrigger.min.js` (gsap@3.15.1) | 44683 | `b5bb360661f478f0ff6ffa11500d8ce5e2b6aaf6f7288237cdca3aac9548035a` |
