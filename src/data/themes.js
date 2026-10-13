// Dashboard themes. Every background is generated with CSS gradients
// (no copyrighted theme artwork). `mode` controls text contrast.

export const THEMES = [
  {
    id: 'default',
    name: 'Xbox 360 Default',
    mode: 'gray',
    // Sampled from the 2013-2015 dashboard: dark charcoal at the top fading to
    // light grey below the tiles, then slightly darker at the bottom edge.
    base:
      'linear-gradient(180deg, #444444 0%, #4f4f4f 11%, #5e5e5e 22%, #747474 33%, #919191 44%, #adadad 56%, ' +
      '#c0c0c0 67%, #c5c5c5 72%, #c0c0c0 78%, #aaaaaa 89%, #9b9b9b 100%)',
    ribbons: null,
  },
  {
    id: 'carbon',
    name: 'Carbon',
    mode: 'dark',
    base:
      'radial-gradient(120% 80% at 50% -15%, #4a4a4a 0%, rgba(74,74,74,0) 60%),' + 'linear-gradient(180deg, #2b2b2b 0%, #1d1d1d 60%, #121212 100%)',
    ribbons: 'rgba(255,255,255,0.10)',
    ribbonOpacity: 1,
  },
  {
    id: 'spring',
    name: 'Spring Green',
    mode: 'light',
    base:
      'radial-gradient(110% 70% at 30% -10%, #ffffff 0%, rgba(255,255,255,0) 60%),' +
      'radial-gradient(70% 60% at 100% 110%, rgba(126,196,74,.55) 0%, rgba(126,196,74,0) 70%),' +
      'linear-gradient(180deg, #eef5e6 0%, #d9e9c9 60%, #c3dcac 100%)',
    ribbons: 'rgba(255,255,255,0.8)',
    ribbonOpacity: 0.9,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    mode: 'dark',
    base:
      'radial-gradient(80% 60% at 20% 15%, rgba(86,210,120,.45) 0%, rgba(86,210,120,0) 70%),' +
      'radial-gradient(70% 50% at 80% 30%, rgba(40,160,190,.40) 0%, rgba(40,160,190,0) 70%),' +
      'linear-gradient(180deg, #071a1a 0%, #0b2a24 50%, #04110f 100%)',
    ribbons: 'rgba(140,255,190,0.12)',
    ribbonOpacity: 1,
    drift: true,
  },
  {
    id: 'nebula',
    name: 'Nebula',
    mode: 'dark',
    base:
      'radial-gradient(1.5px 1.5px at 12% 22%, #fff 50%, transparent 51%),' +
      'radial-gradient(1px 1px at 72% 12%, #fff 50%, transparent 51%),' +
      'radial-gradient(1.5px 1.5px at 42% 78%, #fff 50%, transparent 51%),' +
      'radial-gradient(1px 1px at 88% 64%, #fff 50%, transparent 51%),' +
      'radial-gradient(1px 1px at 28% 52%, #fff 50%, transparent 51%),' +
      'radial-gradient(60% 50% at 70% 40%, rgba(160,70,220,.55) 0%, rgba(160,70,220,0) 70%),' +
      'radial-gradient(50% 45% at 25% 70%, rgba(40,90,220,.5) 0%, rgba(40,90,220,0) 70%),' +
      'linear-gradient(180deg, #0d0a1f 0%, #150f33 55%, #07051a 100%)',
    ribbons: 'rgba(200,170,255,0.10)',
    ribbonOpacity: 1,
    drift: true,
  },
  {
    id: 'sunset',
    name: 'Sunset Boulevard',
    mode: 'dark',
    base:
      'radial-gradient(70% 55% at 50% 105%, rgba(255,190,90,.85) 0%, rgba(255,190,90,0) 70%),' +
      'linear-gradient(180deg, #2a1440 0%, #7a2a55 45%, #d4584a 80%, #f39a4c 100%)',
    ribbons: 'rgba(255,220,180,0.14)',
    ribbonOpacity: 1,
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    mode: 'dark',
    base:
      'radial-gradient(90% 60% at 50% -20%, rgba(120,200,255,.55) 0%, rgba(120,200,255,0) 65%),' +
      'linear-gradient(180deg, #0e4d7a 0%, #0a3557 50%, #04182b 100%)',
    ribbons: 'rgba(160,220,255,0.14)',
    ribbonOpacity: 1,
    drift: true,
  },
  {
    id: 'grid',
    name: 'Midnight Grid',
    mode: 'dark',
    base:
      'linear-gradient(rgba(80,200,255,.10) 2px, transparent 2px) 0 0 / 80px 80px,' +
      'linear-gradient(90deg, rgba(80,200,255,.10) 2px, transparent 2px) 0 0 / 80px 80px,' +
      'radial-gradient(80% 60% at 50% 100%, rgba(40,120,200,.45) 0%, rgba(40,120,200,0) 70%),' +
      'linear-gradient(180deg, #050a14 0%, #0a1426 100%)',
    ribbons: 'rgba(80,200,255,0.10)',
    ribbonOpacity: 1,
  },
  {
    id: 'pearl',
    name: 'Pearl',
    mode: 'light',
    base:
      'radial-gradient(80% 60% at 80% 0%, rgba(255,220,240,.9) 0%, rgba(255,220,240,0) 70%),' +
      'radial-gradient(80% 60% at 0% 100%, rgba(200,225,255,.9) 0%, rgba(200,225,255,0) 70%),' +
      'linear-gradient(180deg, #f6f4f7 0%, #e7e4ea 100%)',
    ribbons: 'rgba(255,255,255,0.85)',
    ribbonOpacity: 0.9,
  },
];

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t]));
