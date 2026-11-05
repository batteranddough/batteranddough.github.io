/* Single source of truth for the menu. Prices from the owner's two menu cards of 2026-11-05 ("Our menu" and
   "Know more about sizes"; the size card wins where the two differ, per the standing rule). Every item: eggless
   prices then egg prices, one per size. photo: null means "shot coming soon" and shows Doughy instead.
   ask: true means the card lists the item without a price ("price on request"); soon: true on a category means
   it is not for sale yet: photos show, prices and Order buttons do not, and the order form leaves it out. */
window.MENU_DATA = {
  whatsapp: '918999650554',
  categories: [
    {
      id: 'bombolone', name: 'Bombolone', short: 'Bombolone', tint: '#F7CFD6', emoji: '🍩',
      blurb: 'Pillowy doughnuts, fried fresh and rolled in sugar, filled to the brim.',
      sizes: ['Box of 3', 'Box of 6'],
      items: [
        { name: 'Chocolate Bombolone', tag: 'Dark chocolate filling', eggless: [106, 213], egg: [111, 223], photo: null },
        { name: 'Crème brûlée Bombolone', tag: 'Custard filling, burnt-sugar top', eggless: [81, 162], egg: [120, 238], photo: null },
        { name: 'Customised fillings', tag: 'Tell us what you fancy', ask: true, photo: null }
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
      id: 'rolls', name: 'Cinnamon rolls', short: 'Rolls', tint: '#CDEBDC', emoji: '🍥',
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
        { name: 'Brownie slab', tag: 'A whole slab, customised for your table', ask: true, photo: null },
        { name: 'Cookie pie', tag: 'A whole cookie, baked as a pie', eggless: [402], egg: [417], photo: null },
        { name: 'Scoopable cookie tin', tag: 'Cookie dough you eat with a spoon', eggless: [436], egg: [447], photo: null }
      ]
    },
    {
      id: 'croissants', name: 'Croissants', short: 'Croissants', tint: '#FBE7D0', emoji: '🥐',
      blurb: 'Laminated by hand. Not on the menu just yet.',
      sizes: ['Box of 4'], soon: true,
      items: [
        { name: 'Classic butter croissants', tag: 'Flaky, buttery', photo: 'photos/croissant-butter-sunset.jpg', photo2: 'photos/croissant-butter-night.jpg' },
        { name: 'Chocolate croissants', tag: 'Dipped in dark chocolate', photo: 'photos/croissant-choc-sunset.jpg', photo2: 'photos/croissant-choc-night.jpg' }
      ]
    },
    {
      id: 'combos', name: 'Combos', short: 'Combos', tint: '#E9D8F0', emoji: '🎁',
      blurb: 'Packaging and delivery included.',
      sizes: ['Combo'],
      items: [
        { name: 'Combo cookies', tag: 'Two each of all four cookies, eight in the box', eggless: [380], egg: [370], photo: null, note: 'includes packaging & delivery' },
        { name: 'Blissful Bombolone', tag: 'Three crème brûlée, three chocolate', eggless: [272], egg: [316], photo: null, note: 'includes packaging & delivery' }
      ]
    }
  ]
};
window.MENU_DATA.priced = function (it) { return !!(it.eggless && it.egg); };
window.MENU_DATA.fromPrice = function (cat) { return Math.min.apply(null, cat.items.filter(window.MENU_DATA.priced).map(function (i) { return i.eggless[0]; })); };
window.MENU_DATA.waLink = function (text) { return 'https://wa.me/' + window.MENU_DATA.whatsapp + (text ? '?text=' + encodeURIComponent(text) : ''); };
