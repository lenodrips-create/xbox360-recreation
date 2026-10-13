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

## Project layout

```
src/
  App.jsx                 console shell: scaled 1920×1080 stage, global actions, live simulation
  nav/                    input layers, spatial (D-pad) navigation, keyboard + gamepad mapping
  state/                  persisted store (useReducer + localStorage) and transient UI state
  audio/sound.js          Web Audio sound effects
  data/                   placeholder games/apps/offers, fictional friends/messages, themes
  components/             tiles, rows, avatar + gamerpic SVGs, placeholder art, dashboard chrome
  pivots/                 the three dashboard channels: home, social, settings
  screens/                every sub-screen (registry.js maps ids → components)
  overlays/               Guide, dialogs, keyboard, toasts, help, boot/power
  styles/                 base tokens, dashboard grid, screens, overlays
```

The UI is laid out at a fixed 1920×1080 and scaled to fit the window (letterboxed on
other aspect ratios), so proportions match a 16:9 TV at any size.

## Credits

- **[lenodrips-create](https://github.com/lenodrips-create)**: project owner. Concept and
  direction, and the reference captures the dashboard is matched against.
- **Gunner Castle**: repository cleanup, the `main` branch, linting and formatting setup.
- **Claude** (Anthropic, via Claude Code): wrote the application code from the owner's
  direction and captures.
