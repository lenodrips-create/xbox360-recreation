// Images cropped from the reference captures supplied for this project
// (public/ref). Paths are relative to the app base so they work on any host.
const base = import.meta.env.BASE_URL;
export const REF = {
  play: `${base}ref/tile-play.png`,
  spotlight: `${base}ref/tile-spotlight.png`,
  qr: `${base}ref/qr.png`,
  gamerpic: `${base}ref/gamerpic.png`,
  avatar: `${base}ref/avatar.png`,
  awards: Array.from({ length: 7 }, (_, i) => `${base}ref/award-${i + 1}.png`),
  intro: `${base}intro.mp4`,
  introWebm: `${base}intro.webm`,
};
