# Xbox 360 Metro Dashboard (2011–2013) — Web Recreation

A fan-made, fully interactive recreation of the Xbox 360 "Metro" dashboard, written in
JavaScript with React and Vite. The goal is to feel like sitting in front of the console
in 2012: the channel headers across the top, the green tiles, the white selection
frame, the Guide, the pop-up notifications and the menu sounds.

There are no built-in games. **Your games are web pages you load from your own device**:
a single `.html` file, a `.zip`, or a folder with an `index.html`. Add them from
My Games, the Guide, or by dragging them onto the dashboard. They're saved in your browser
only (nothing is uploaded) and run full screen; press Esc or Home to bring up the
Guide. Apps and the Marketplace are still labelled placeholders.

> Not affiliated with or endorsed by Microsoft. Xbox, Xbox 360 and Xbox LIVE are
> trademarks of Microsoft. The start-up cutscene (`public/intro.*`: intro and loading
> screen), the menu and sign-in sounds (`public/sfx/`), the QR code, spotlight image and
> sign-in orb (`public/ref/`) and the tile/status-bar glyphs (`src/data/icons.js`, traced
> from the captures) come from reference captures and images supplied by the project
> owner and belong to their respective rights holders; everything else is drawn with
> CSS/SVG or synthesized.

## Project layout

```
src/
  App.jsx                 console shell: scaled 1920×1080 stage, global actions, live simulation
  nav/                    input layers, spatial (D-pad) navigation, keyboard + gamepad mapping
  state/                  persisted store (useReducer + localStorage) and transient UI state
  games/                  the player's game library (IndexedDB), importer for .html/.zip/folders
  audio/sound.js          Web Audio sound effects
  data/                   placeholder apps/offers, fictional friends/messages, themes
  components/             tiles, rows, avatar + gamerpic SVGs, placeholder art, dashboard chrome
  pivots/                 the three dashboard channels: home, social, settings
  screens/                every sub-screen (registry.js maps ids → components)
  overlays/               Guide, dialogs, keyboard, toasts, help, boot/power
  styles/                 base tokens, dashboard grid, screens, overlays
```

`public/sw.js` is a service worker that serves each loaded game's files out of IndexedDB,
so multi-file games work as if they were on a web server. Games need the dashboard to be
opened from an https address or localhost.

The UI is laid out at a fixed 1920×1080 and scaled to fit the window (letterboxed on
other aspect ratios), so proportions match a 16:9 TV at any size.

## Credits

- **Lennon Hellman** ([lenodrips-create](https://github.com/lenodrips-create)): project owner.
  Concept and direction, and the reference captures the dashboard is matched against.
- **Gunner Castle**: repository cleanup, the `main` branch, linting and formatting setup.
- **Claude** (Anthropic, via Claude Code): wrote the application code from the owner's
  direction and captures.
