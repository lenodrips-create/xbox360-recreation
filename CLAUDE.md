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
  screens 10, first-launch Welcome 120, Guide 140, keyboard 150, dialog 160, help 300,
  boot/power 400.
- **Screens.** Build the component on `<Screen>` from `components/ui.jsx` (it registers
  the priority-10 layer and B = back), add it to `screens/registry.js`, then open it with
  `ui.push('id', params)`. Menu-style screens can use `MenuScreen` from `screens/common.jsx`.
- **State.** `state/store.jsx` is persisted to localStorage; `state/ui.jsx` is transient
  (screen stack, overlays, toasts, presence). If you change the shape of persisted state,
  bump `version` in `createDefaultState()`: saves with another version are discarded.
- **First launch.** `overlays/Welcome.jsx` asks for a gamertag (required) and a name
  (optional) while `state.onboarded` is false, and Restore Defaults brings it back. Everything
  stays in localStorage: there are no accounts, passwords or admin controls, so keep it that way.
- **Game library.** There are no built-in games. Players load web games (an `.html`
  file, a `.zip`, or a folder) and `src/games/` stores them in IndexedDB: metadata in
  `games`, every file as a Blob in `files` keyed `<id>/<path>`. `useLibrary()` exposes the
  list, the file/folder pickers (call them synchronously from a press, or the browser blocks
  the picker), drag-and-drop, rename and delete.
- **Playing.** The `play` screen loads `play/<id>/<entry>` in an iframe. `public/sw.js`
  answers those requests from IndexedDB and injects a script that namespaces the game's
  localStorage (`x360:game:<id>:`), so a game can't clear the dashboard's save. The player
  layer swallows every button except Guide/Back; Esc or Home inside the game
  opens the Guide, and Xbox Home asks before quitting. Keep the database name, version
  and stores identical in `src/games/db.js` and `public/sw.js`. Games need a secure
  context (https or localhost). When the service worker is missing or doesn't answer the frame
  (no `__x360Served` marker), `src/games/inline.js` builds the game from blob: URLs instead,
  rewriting references and mapping runtime fetch/XHR/src paths. Files are stored as
  `{ type, data }` bytes (older saves: Blobs) because some Safari versions can't store Blobs.
- **Content keys.** Loaded games are `game:<id>` and apps `app:a03`. Use `parseKey` /
  `openContent` from `state/content.js` with the library's `byId`; keys for deleted games
  resolve to nothing, and `actions.forget` removes them from Pins and Recent.
- **Sound.** `sound.play(name)` from `audio/sound.js`. `hover`, `select`, `pivotRight`,
  `pivotLeft`, `notify` and `signin` are recorded samples; every other cue is synthesized.
- **Notifications.** `ui.notify({ title, text, kind })` shows the green-orb pill
  (`XboxNotice` in `overlays/SigninToast.jsx`): `title` and `text` are its two lines, and a
  `friend` toast shows that friend's gamer picture in the orb.

## Conventions

- Match the existing style: functional components, no TypeScript, comments only where
  the reason isn't obvious. Prettier is configured with `printWidth: 150` and single quotes.
- ESLint enables only the classic `rules-of-hooks` and `exhaustive-deps` rules. The React
  Compiler rules are off on purpose (refs are mirrored during render in several places).
- `src/data/icons.js` is generated (glyphs traced from captures). Don't hand-edit it; it is
  excluded from Prettier.
- Apps and Marketplace offers are labelled placeholders (`src/data/catalog.js`). Friends,
  messages and beacons are fictional and aren't tied to any game. Gamerscore is a profile
  field (`profile.gamerscore`); loaded games don't award achievements yet.

## Assets and rights

`public/intro.*`, `public/sfx/`, `public/ref/qr.webp` and `src/data/icons.js` come from
captures of the real console and belong to their rights holders (see the README). Other
art is drawn in CSS/SVG. Don't add more material copied from Microsoft without the owner
asking for it.

## Repository

- Work happens on `main`. `origin` is `lenodrips-create/xbox360-recreation`. Its default
  branch is still `claude/brave-brahmagupta-c5o8cv` until the owner changes it on GitHub.
- `gh-pages` is an orphan branch that holds only the built `dist/` (the deployed site).
