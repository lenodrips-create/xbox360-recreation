# Xbox 360 Metro Dashboard (2011–2013) — Web Recreation

A fan-made, fully interactive recreation of the Xbox 360 "Metro" dashboard, written in
JavaScript with React and Vite. The goal is to feel like sitting in front of the console
in 2012: the channel headers across the top, the green tiles, the white selection
frame, the Guide, the pop-up notifications and the menu sounds.

Games and apps are **placeholders** for now. Every slot is clearly labelled
("Game Title 01", "App Title 03", "Game Placeholder 01"…) and can be swapped for real
content later.

> Not affiliated with or endorsed by Microsoft. Xbox, Xbox 360, Xbox LIVE and Bing are
> trademarks of Microsoft. No original Microsoft artwork, fonts, sounds or screenshots
> are included. Everything is drawn with CSS/SVG or synthesized at runtime.

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
| LB / RB | Q / E, Page Up / Page Down | Click a channel name, scroll wheel, swipe | Previous / next channel |
| Guide button | G or Home | Click your gamerpic | Open the Xbox Guide |
| — | M | Guide → Settings | Mute / unmute dashboard sounds |
| — | F1, H or ? | Settings → help & controls | Help overlay |

A connected Xbox controller works through the browser Gamepad API.
On the on-screen keyboard you can also simply type; Enter submits.

## What's inside

- **Channels:** bing (search), home, social, games, apps, settings — with the
  2011–2013 layout: big hero tile, rotating spotlight, quick tiles, avatar scene.
- **Home:** last played, recent, pins, spotlight, Xbox LIVE Gold, marketplace promos.
- **Social:** your avatar and three friends standing on the dashboard with activity
  bubbles; friends list, friend profiles, compare games, messages (read, reply,
  delete, compose), beacons & activity, party (invite friends, they join), sign in/out.
- **Games:** My Games library (sort, pin), game detail pages, per-game and overall
  achievements, simulated install/delete, a launch screen that unlocks an achievement.
- **Apps:** My Apps, app detail pages, launch placeholders.
- **Marketplace:** categories and offers with simulated downloads.
- **Settings:** profile (gamertag, motto, bio, gamer picture, privacy), avatar editor,
  themes (9 CSS-generated themes, light and dark), system → console settings
  (display brightness/contrast/screen size, audio, language, clock, power, system info),
  storage (hard drive breakdown, delete/reinstall games, clear cache), network test,
  preferences, account, family settings, **Restore Defaults**.
- **Overlays:** the Xbox Guide (Media, Games & Apps, Home, Friends & Party, Settings),
  full-width system dialogs, on-screen keyboard, toast notifications (sign-in,
  achievements, friends online, messages), help, boot animation and "turn off console".
- **Sounds:** synthesized with the Web Audio API (navigation ticks, select, back,
  channel swoosh, notification and achievement chimes). Toggle with **M**.
- **Persistence:** profile, avatar, theme, settings, pins, achievements, messages and
  storage changes are saved to `localStorage`. *Settings → System → Restore Defaults*
  (or *Preferences → Restore Defaults*) resets everything.

## Project layout

```
src/
  App.jsx                 console shell: scaled 1920×1080 stage, global actions, live simulation
  nav/                    input layers, spatial (D-pad) navigation, keyboard + gamepad mapping
  state/                  persisted store (useReducer + localStorage) and transient UI state
  audio/sound.js          Web Audio sound effects
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
