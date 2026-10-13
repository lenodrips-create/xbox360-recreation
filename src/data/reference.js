// Images cropped from the reference captures supplied for this project
// (public/ref). Paths are relative to the app base so they work on any host.
const base = import.meta.env.BASE_URL;
export const REF = {
  play: `${base}ref/tile-play.webp`,
  spotlight: `${base}ref/tile-spotlight.webp`,
  qr: `${base}ref/qr.webp`,
  gamerpic: `${base}ref/gamerpic.webp`,
  avatar: `${base}ref/avatar.webp`,
  awards: Array.from({ length: 7 }, (_, i) => `${base}ref/award-${i + 1}.webp`),
  intro: `${base}intro.mp4`,
  introWebm: `${base}intro.webm`,
};
