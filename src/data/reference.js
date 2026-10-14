// Media taken from the reference captures supplied for this project. Paths are
// relative to the app base so they work on any host.
const base = import.meta.env.BASE_URL;
export const REF = {
  qr: `${base}ref/qr.webp`,
  play: `${base}ref/tile-play.webp`,
  promoBg: `${base}ref/promo-bg.webp`,
  gamerpic: `${base}ref/gamerpic.webp`,
  avatar: `${base}ref/avatar.webp`,
  awards: Array.from({ length: 7 }, (_, i) => `${base}ref/award-${i + 1}.webp`),
  ad: `${base}ref/ad.webp`,
  orbX: `${base}ref/orb-x.webp`,
  orbSystem: `${base}ref/orb-system.webp`,
  intro: `${base}intro.mp4`,
  introWebm: `${base}intro.webm`,
};
