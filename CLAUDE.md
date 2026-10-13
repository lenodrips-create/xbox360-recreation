# CLAUDE.md

Fan recreation of the Xbox 360 Metro dashboard. React 19 + Vite 8, plain JavaScript, no
backend, no router, no test suite.

## Commands

- `npm run dev`: dev server on http://localhost:5173
- `npm run check`: lint + format check + production build. Run before every commit.
- `npm run lint` / `npm run format`: ESLint / Prettier on their own

There are no automated tests. After a UI change, open the app and drive it with the
keyboard (arrows, Enter, Esc, Q/E for channels, G for the Guide) as well as the mouse.

## How it fits together

- **Fixed stage.** Everything is laid out at 1920×1080 and scaled in `App.jsx`. CSS sizes
  are capture pixels. Offsets like `HEADER_X` in `Dashboard.jsx` were measured from the
  reference captures, so leave them alone unless you're matching a capture.
- **Navigation is geometric.** Anything selectable is a button with `tabIndex={-1}`,
  `data-nav` and a `data-nav-id`. `src/nav/spatial.js` picks the next element by on-screen
  position, so never wire neighbours by hand. A stable `data-nav-id` lets focus come back
  after re-renders. Related attributes: `data-nav-default` (initial focus),
  `data-scroll="x|y"` (keeps focus in view), `data-adjust` (left/right adjusts the row).
- **Input layers.** `useLayer({ priority, enabled, onBack, onAction, onEdge })` registers
  a modal scope, and only the top enabled layer gets input. Priorities: dashboard 0,
  screens 10, Guide 140, keyboard 150, dialog 160, help 300, boot/power 400.
- **Screens.** Build the component on `<Screen>` from `components/ui.jsx` (it registers
  the priority-10 layer and B = back), add it to `screens/registry.js`, then open it with
  `ui.push('id', params)`. Menu-style screens can use `MenuScreen` from `screens/common.jsx`.
- **State.** `state/store.jsx` is persisted to localStorage; `state/ui.jsx` is transient
  (screen stack, overlays, toasts, presence). If you change the shape of persisted state,
  bump `version` in `createDefaultState()`: saves with another version are discarded.
- **Content keys.** Games and apps are referred to as `game:g01` / `app:a03`. Use
  `parseKey` / `openContent` from `state/content.js`.
- **Sound.** `sound.play(name)` from `audio/sound.js`. `hover` and `select` are recorded
  samples; every other cue is synthesized.

## Conventions

- Match the existing style: functional components, no TypeScript, comments only where
  the reason isn't obvious. Prettier is configured with `printWidth: 150` and single quotes.
- ESLint enables only the classic `rules-of-hooks` and `exhaustive-deps` rules. The React
  Compiler rules are off on purpose (refs are mirrored during render in several places).
- `src/data/icons.js` is generated (glyphs traced from captures). Don't hand-edit it; it is
  excluded from Prettier.
- Games and apps are placeholders. `src/data/games.js` builds them from a fixed seed so
  they stay stable between loads.

## Assets and rights

`public/intro.*`, `public/sfx/`, `public/ref/` and `src/data/icons.js` come from captures
of the real console and belong to their rights holders (see the README). Don't add more
material copied from Microsoft without the owner asking for it.

## Repository

- Work happens on `main`. `origin` is `lenodrips-create/xbox360-recreation`. Its default
  branch is still `claude/brave-brahmagupta-c5o8cv` until the owner changes it on GitHub.
- `gh-pages` is an orphan branch that holds only the built `dist/` (the deployed site).
