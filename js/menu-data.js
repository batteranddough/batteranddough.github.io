/* Single source of truth for the menu. Prices from the owner's "Menu Draft" of 2026-11-04 (size table wins
   over the top-of-list prices where they differ, per the standing rule). Every item: eggless prices then egg
   prices, one per size. photo: null means "shot coming soon" and shows Doughy instead. */
window.MENU_DATA = {
  whatsapp: '918999650554',
  categories: [
    {
      id: 'bombolone', name: 'Bombolone', short: 'Bombolone', tint: '#F7CFD6', emoji: '🍩',
      blurb: 'Pillowy doughnuts, fried fresh and rolled in sugar, filled to the brim.',
      sizes: ['Box of 3', 'Box of 6'],
      items: [
        { name: 'Chocolate Bombolone', tag: 'Dark chocolate filling', eggless: [105, 210], egg: [111, 222], photo: null },
        { name: 'Crème brûlée Bombolone', tag: 'Custard filling, burnt-sugar top', eggless: [81, 162], egg: [84, 168], photo: null }
      ]
    },
    {
      id: 'cookies', name: 'Cookies', short: 'Cookies', tint: '#FAEBB4', emoji: '🍪',
      blurb: 'Crisp edge, gooey middle. Baked the morning you order.',
      sizes: ['Box of 4', 'Box of 6', 'Box of 8'],
      items: [
        { name: 'Brown butter chocolate chip', tag: 'Nutty brown butter, dark chocolate chunks', eggless: [108, 162, 218], egg: [112, 168, 225], photo: 'photos/cookies-tray.jpg', photo2: 'photos/cookies-plate-2.jpg' },
        { name: 'Toffee chocolate chip', tag: 'Toffee bits folded through', eggless: [122, 183, 244], egg: [125, 187, 250], photo: null },
        { name: 'Brownie cookies', tag: 'Fudgy, crackly top', eggless: [161, 241, 322], egg: [157, 235, 314], photo: null },
        { name: 'Double chocolate chip', tag: 'Cocoa dough, twice the chocolate', eggless: [198, 297, 397], egg: [177, 265, 354], photo: null }
      ]
    },
    {
      id: 'rolls', name: 'Cinnamon rolls', short: 'Rolls', tint: '#CDEBDC', emoji: '🥐',
      blurb: 'Soft, sticky, cream cheese glaze, still warm when they reach you.',
      sizes: ['Box of 4', 'Box of 6', 'Box of 8'],
      items: [
        { name: 'Classic cinnamon roll', tag: 'Cinnamon sugar swirl', eggless: [155, 232, 310], egg: [158, 238, 317], photo: null },
        { name: 'Chocolate cinnamon roll', tag: 'Chocolate swirl, cocoa glaze', eggless: [213, 319, 426], egg: [220, 330, 440], photo: null }
      ]
    },
    {
      id: 'more', name: 'Brownies, pie and tin', short: 'More', tint: '#F3DCC4', emoji: '🍫',
      blurb: 'For the table, or for one person with a spoon.',
      sizes: ['Each'],
      items: [
        { name: 'Fudge brownie', tag: 'Dense, dark, glossy top', eggless: [331], egg: [347], photo: null },
        { name: 'Cookie pie', tag: 'A whole cookie, baked as a pie', eggless: [402], egg: [417], photo: null },
        { name: 'Scoopable cookie tin', tag: 'Cookie dough you eat with a spoon', eggless: [436], egg: [447], photo: null }
      ]
    },
    {
      id: 'croissants', name: 'Croissants', short: 'Croissants', tint: '#FBE7D0', emoji: '🥐',
      blurb: 'Laminated by hand. Best the same day.',
      sizes: ['Box of 4'], review: 'Not on the price draft yet; names and prices are placeholders.',
      items: [
        { name: 'Classic butter croissants', tag: 'Flaky, buttery', eggless: [240], egg: [248], photo: 'photos/croissant-butter-sunset.jpg', photo2: 'photos/croissant-butter-night.jpg' },
        { name: 'Chocolate croissants', tag: 'Dipped in dark chocolate', eggless: [320], egg: [332], photo: 'photos/croissant-choc-sunset.jpg', photo2: 'photos/croissant-choc-night.jpg' }
      ]
    },
    {
      id: 'combos', name: 'Combos', short: 'Combos', tint: '#E9D8F0', emoji: '🎁',
      blurb: 'Packaging and delivery included.',
      sizes: ['Combo'],
      items: [
        { name: 'Combo cookies', tag: 'Two each of all four cookies, eight in the box', eggless: [380], egg: [370], photo: null, note: 'includes packaging & delivery' },
        { name: 'Blissful Bombolone', tag: 'Three crème brûlée, three chocolate', eggless: [272], egg: [281], photo: null, note: 'includes packaging & delivery' }
      ]
    }
  ]
};
window.MENU_DATA.fromPrice = function (cat) { return Math.min.apply(null, cat.items.map(function (i) { return i.eggless[0]; })); };
window.MENU_DATA.waLink = function (text) { return 'https://wa.me/' + window.MENU_DATA.whatsapp + (text ? '?text=' + encodeURIComponent(text) : ''); };
