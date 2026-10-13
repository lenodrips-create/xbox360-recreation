# Xbox 360 Metro Dashboard (2011–2013) — Web Recreation

A fan-made, fully interactive recreation of the Xbox 360 "Metro" dashboard, written in
JavaScript with React and Vite. The goal is to feel like sitting in front of the console
in 2012: the channel headers across the top, the green tiles, the white selection
frame, the Guide, the pop-up notifications and the menu sounds.

Games and apps are **placeholders** for now. Every slot is clearly labelled
("Game Title 01", "App Title 03", "Game Placeholder 01"…) and can be swapped for real
content later.

> Not affiliated with or endorsed by Microsoft. Xbox, Xbox 360 and Xbox LIVE are
> trademarks of Microsoft. The intro video (`public/intro.*`), the menu sounds
> (`public/sfx/`), the images in `public/ref/` (Play tile, spotlight, promo
> background, QR code, avatar, avatar awards, gamer picture) and the tile/status-bar
> glyphs (`src/data/icons.js`, traced from the captures) come from reference
> captures supplied by the project owner and belong to their respective rights
> holders; everything else is drawn with CSS/SVG or synthesized.

## Run it

Requires Node.js 20.19+ (or 22+).

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # outputs dist/
npm run preview    # serves dist/ on http://localhost:4173
```

`dist/` uses relative paths, so it can be dropped onto any static host.

## Controls

| Controller | Keyboard | Mouse / touch | Action |
| --- | --- | --- | --- |
| D-pad / left stick | Arrow keys | Hover | Move the selection |
| A | Enter or Space | Click / tap | Select |
| B | Esc or Backspace | Right-click, or the **B Back** hint | Back |
| X / Y | X / Y | Click the on-screen hint | Context actions (pin, delete, sort…) |
| LB / RB | Q / E, Page Up / Page Down | Click a channel name or the peeking edge, scroll wheel, swipe | Previous / next channel |
| Guide button | G or Home | Click your gamerpic | Open the Xbox Guide |
| — | M | Guide → Settings | Mute / unmute dashboard sounds |
| — | F1, H or ? | Settings → help & controls | Help overlay |

A connected Xbox controller works through the browser Gamepad API.
On the on-screen keyboard you can also simply type; Enter submits.

## What's inside

- **Channels:** home, social and settings, matched to captures of the final
  (2013–2015) dashboard: grey gradient, one sliding strip with the neighbouring
  channel peeking in at the edges, solid white tile glyphs, the enlarge-and-brighten
  selection, and the top-right status bar (friends online, messages, gamerscore,
  gamer picture; account balance on settings).
- **Home:** Play (last game), My Pins, a two-tile spotlight ad, Recent, My Games,
  My Apps, Profile, Account.
- **Social:** Friends, Activity Feed, Avatar Store, Sign In or Out, your gamertag,
  gamerscore, avatar awards and avatar. Every item can be selected (it zooms and
  plays the hover sound) but none of them opens another screen. Friends, messages
  and party are reached through the Guide: friends list, profiles, compare games,
  messages (read, reply, delete, compose), party (invite friends, they join).
- **Settings:** System, Profile, Preferences, Kinect, Account, Privacy, Family, Turn Off.
- **Games:** My Games library (sort, pin), game detail pages, per-game and overall
  achievements, simulated install/delete, a launch screen that unlocks an achievement.
- **Apps:** My Apps, app detail pages, launch placeholders.
- **Marketplace:** categories and offers with simulated downloads.
- **Settings:** profile (gamertag, motto, bio, gamer picture, privacy), avatar editor,
  themes (9 CSS-generated themes, light and dark), system → console settings
  (display brightness/contrast/screen size, audio, language, clock, power, system info),
  storage (hard drive breakdown, delete/reinstall games, clear cache), network test,
  preferences, account, family settings, **Restore Defaults**.
- **Intro:** the console start-up video (upscaled to 1080p with Real-ESRGAN) plays full
  screen, always with sound, on load and when turning the console back on. It can't be
  skipped. Browsers don't allow sound before the first click or key press, so if the
  browser blocks it the console waits on a "press any button" screen and the intro starts,
  with sound, on that press.
- **Overlays:** the Xbox Guide (Media, Games & Apps, Home, Friends & Party, Settings),
  full-width system dialogs, on-screen keyboard, toast notifications (sign-in,
  achievements, friends online, messages), help, boot animation and "turn off console".
- **Sounds:** moving the selection (keys, pad or mouse hover) and selecting play the
  recorded console sounds in `public/sfx/`; back, channel swoosh, notification and
  achievement chimes are synthesized with the Web Audio API. Toggle with **M**.
- **Persistence:** profile, avatar, theme, settings, pins, achievements, messages and
  storage changes are saved to `localStorage`. *Settings → System → Restore Defaults*
  (or *Preferences → Restore Defaults*) resets everything.

## Project layout

```
src/
  App.jsx                 console shell: scaled 1920×1080 stage, global actions, live simulation
  nav/                    input layers, spatial (D-pad) navigation, keyboard + gamepad mapping
  state/                  persisted store (useReducer + localStorage) and transient UI state
  audio/sound.js          Web Audio sound effects (recorded samples + synthesized cues)
  data/                   placeholder games/apps/offers, fictional friends/messages, themes
  components/             tiles, rows, avatar + gamerpic SVGs, placeholder art, dashboard chrome
  pivots/                 the six dashboard channels
  screens/                every sub-screen (registry.js maps ids → components)
  overlays/               Guide, dialogs, keyboard, toasts, help, boot/power
  styles/                 base tokens, dashboard grid, screens, overlays
```

The UI is laid out at a fixed 1920×1080 and scaled to fit the window (letterboxed on
other aspect ratios), so proportions match a 16:9 TV at any size.

### Adding real games or apps later

Edit `src/data/games.js` and `src/data/catalog.js`. Each entry has a title, metadata,
description and art parameters; achievements are generated per game and can be replaced
with a hand-written list.

## Notes

- Everything is offline and simulated: there are no network requests to any Xbox or
  Microsoft service.
- Gamertags, friends, messages and offers are fictional.
- Text uses Segoe UI where available (Windows) and falls back to the bundled Open Sans,
  a close humanist match.
