// Placeholder apps and marketplace offers. Nothing here refers to a real
// product; they are labelled slots ready to be replaced with real content.

const APP_GLYPHS = ['play', 'note', 'globe', 'chat', 'film', 'photo', 'star', 'cloud', 'bolt'];
const APP_COLORS = ['#c0392b', '#2475b3', '#7d3c98', '#d35400', '#16a085', '#b8860b', '#2c3e50', '#1f8f6b', '#a93f6a'];

export const APPS = Array.from({ length: 9 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    id: `a${n}`,
    kind: 'app',
    title: `App Title ${n}`,
    short: `App ${n}`,
    category: ['Video', 'Music', 'Social', 'Sports', 'Utilities', 'Lifestyle', 'News', 'Fitness', 'Kids'][i],
    publisher: 'Publisher Name',
    glyph: APP_GLYPHS[i],
    color: APP_COLORS[i],
    size: [48, 120, 22, 64, 18, 96, 30, 210, 40][i],
    description: 'This is a placeholder app slot. Replace this text with the real app description when apps are added.',
  };
});

export const APP_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a]));

export const MARKET_CATEGORIES = [
  { id: 'games', label: 'Games', single: 'Game', icon: 'controller' },
  { id: 'arcade', label: 'Arcade', single: 'Arcade', icon: 'joystick' },
  { id: 'demos', label: 'Demos', single: 'Demo', icon: 'disc' },
  { id: 'addons', label: 'Add-ons', single: 'Add-on', icon: 'plus' },
  { id: 'avatar', label: 'Avatar Items', single: 'Avatar Item', icon: 'avatar' },
  { id: 'themes', label: 'Themes & Gamer Pictures', single: 'Theme', icon: 'palette' },
  { id: 'apps', label: 'Apps', single: 'App', icon: 'apps' },
];

const PRICES = ['Free', '80 MSP', '240 MSP', '400 MSP', '800 MSP', '1200 MSP', 'Free', '160 MSP'];
const MOTIFS = ['burst', 'waves', 'rings', 'grid', 'stripes', 'peaks'];

export const OFFERS = [];
MARKET_CATEGORIES.forEach((cat, ci) => {
  for (let i = 0; i < 8; i++) {
    const n = String(i + 1).padStart(2, '0');
    OFFERS.push({
      id: `${cat.id}-${n}`,
      category: cat.id,
      title: `${cat.single} Placeholder ${n}`,
      price: cat.id === 'demos' ? 'Free' : PRICES[(i + ci) % PRICES.length],
      size: `${(((i + 1) * (ci + 3) * 37) % 900) + 40} MB`,
      rating: ((i * 7 + ci * 3) % 5) + 1,
      hue: (ci * 67 + i * 41 + 190) % 360,
      motif: MOTIFS[(i + ci) % MOTIFS.length],
      description:
        'Placeholder marketplace listing. Real offers, prices and artwork can be dropped in here later. ' +
        'Downloads in this demo are simulated and nothing is purchased.',
    });
  }
});

export const OFFER_BY_ID = Object.fromEntries(OFFERS.map((o) => [o.id, o]));
