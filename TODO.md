# To-do

Draft from a read-through of the code on 2026-10-13, updated after the switch to loaded HTML
games. Effort: **S** about an hour, **M** an afternoon, **L** more. File references point at
where the change would go.

## Decide first

These need a call from Lennon and Gunner before anyone builds them.

- [ ] **Microsoft material in public.** The intro video, the two menu sounds, the QR code in
      `public/ref/` and the traced glyphs in `src/data/icons.js` come from real console
      captures. They're public on GitHub and on the gh-pages site, and the repo has no LICENSE.
      Keep them, swap in original assets, or make the repo private?
- [ ] **Social channel tiles.** Friends, Activity Feed, Avatar Store and Sign In or Out do
      nothing on purpose (`src/pivots/SocialPivot.jsx`), although their screens exist. Keep
      them inactive, or wire them up? The gamertag, avatar and award buttons have screen-reader
      labels that promise actions they don't take either. **S**
- [ ] **The intro.** 8.4 s, can't be skipped, plays on every load unless turned off in
      settings (`src/overlays/Power.jsx`). Keep, allow skipping after the first viewing, or play it
      on first launch only? **S**
- [ ] **Settings that do nothing.** Stored and shown, but read nowhere else: resolution, screen
      format, colour space, audio output, language, locale, power mode, auto update, spotlight
      autoplay, automatic sign-in, all family settings, all privacy settings. Cut them, label
      them as cosmetic, or make some real (letterbox, locale, family ratings)? **S** each to cut.
- [ ] **Default profile text.** Names come from the Welcome prompt, but the motto, bio and
      location still default to the capture owner's ("Respawn. Repeat.", "Couch co-op
      veteran…", "Pacific Northwest") in `src/state/store.jsx`. Start them blank? **S**
- [ ] **Achievements for loaded games.** Gamerscore is now always 0. A small `postMessage` API
      would let a game unlock achievements and show the toast. Worth doing? **M**

## Bugs

- [ ] **Holding a key repeats every action, not just the arrows** (`src/nav/NavProvider.jsx:185`).
      Reproduced: holding Enter on System → Restore Defaults confirms the dialog by itself and
      wipes the profile. The same goes for Delete Game, Sign Out and Turn Off, and holding Esc
      backs out of every screen. Only repeat up/down/left/right, as the gamepad code already
      does. **S**
- [ ] Confirm dialogs don't block the Guide button (`src/overlays/Dialog.jsx:9`). Press G
      during the Turn Off confirm and the Guide opens underneath; it then reappears after the
      console boots back up. **S**
- [ ] Messages: pressing X on the "Create Message" row says "Message deleted" because it reads
      the row as a message with id `new` (`src/screens/SocialScreens.jsx:436`). **S**
- [ ] Friends: pressing X on "Restore Removed Friends" opens Create Message with no recipient
      (`src/screens/SocialScreens.jsx`, Friends `onAction`). **S**
- [ ] Party: "X joined your party" still appears after you leave the party or restore defaults,
      and the invite list uses friends' online status from when it opened
      (`src/screens/SocialScreens.jsx:152`). **S–M**
- [ ] Party: with seven or more members, Leave Party is cut off and focus can't scroll to it;
      the menu is missing `data-scroll="y"` (`src/screens/SocialScreens.jsx:201`). **S**
- [ ] Backing out of a screen mid-download silently cancels it, and Marketplace still shows the
      price (`src/screens/ContentScreens.jsx`, `Offer`). **M**
- [ ] Message replies count as friend alerts, so turning off "Friend Online Alerts" hides them
      (`src/screens/SocialScreens.jsx:568`). **S**
- [ ] Toasts keep cycling and playing sounds behind the power-off and boot screens
      (`src/overlays/Toasts.jsx:29`). **S**
- [ ] Saving waits 250 ms with no save when the tab closes, so a change made just before
      closing is lost. Also save on `pagehide` (`src/state/store.jsx`). **S**
- [ ] Not yet confirmed: gamepad presses may not count as user interaction for autoplay, which
      would leave gamepad-only players stuck on "Press any button"; a save with the right
      version but bad fields would crash on load; two open tabs overwrite each other's saves.

## Loaded games

- [ ] A controller can't open the file picker: browsers only allow it from a real click or key
      press, so adding games needs a keyboard, mouse or drag-and-drop. Say so on the Add a Game
      screen. **S**
- [ ] Games keep running, with sound, while the Guide or another screen is over them. Pause by
      muting or hiding the frame, as the console did. **S–M**
- [ ] Games run on the dashboard's own origin (needed so multi-file games load), so a game
      could read the dashboard's data or other games' files. Fine for your own files; serve
      games from a separate origin before encouraging people to share them. **M–L**
- [ ] No backup: clearing the browser's site data deletes every game. Add export/import of the
      library, or at least warn in Storage. **M**
- [ ] Covers are generated from the title. Let a game supply its own (its favicon, an
      `og:image`, or a picked image). **S–M**

## Dead ends and fake features

- [ ] Search can't be reached. Only the Search screen itself opens it
      (`src/screens/ContentScreens.jsx:331`). Add an entry point, such as a Guide row or the Y
      button on Home. Inside Search, "New Search" drops the old results before the keyboard
      opens, so cancelling loses them. **S**
- [ ] Marketplace purchases don't spend points, and bought themes, avatar items and games never
      show up anywhere (`src/screens/ContentScreens.jsx`). **M**
- [ ] Account → Download History opens the Games marketplace, not a list of downloads
      (`src/screens/SettingsScreens.jsx:962`). **S**
- [ ] Guide: Video, Music and Picture libraries are empty placeholders; Open Tray and Party
      Chat only show a toast; Recent Players is just the first six friends by id
      (`src/screens/SocialScreens.jsx:85`); the battery meter never changes. **S–M**
- [ ] System → Initial Setup only replays the intro. It could also bring back the Welcome
      prompt, like the console's first-run setup. **S**
- [ ] The balance on the Settings channel is always "You have $0.00"
      (`src/components/Chrome.jsx`). **S**

## Content

- [ ] Apps and Marketplace are still filler: 9 apps and 56 offers with the same placeholder
      text (`src/data/catalog.js`). Replace them, or remove them now that games are the
      player's own. **S** to remove, **L** to fill.

## Performance

- [ ] No timeout while the intro buffers: on a slow connection the screen stays black until
      the video can play, because the safety timer only starts after `play()` succeeds
      (`src/overlays/Power.jsx`). A smaller mobile encode would also help. **M**
- [ ] The menu sounds are uncompressed WAV (164 KB together) and load at start-up. Opus or AAC
      would be about 10 KB. **S**

## Phones, touch and accessibility

- [ ] Phones: in landscape everything scales down to roughly a third (26 px text renders near
      9 px); in portrait there's only a "rotate your device" hint. No fullscreen option or web
      app manifest. **M–L**
- [ ] Touch: swiping works only on the dashboard, with no swipe-back on screens; tapping an
      option or slider row can only step forward (`src/components/ui.jsx`). **M**
- [ ] Single-key shortcuts (G, M, H, Q, E, X, Y, Backspace) can't be turned off, which
      clashes with screen-reader keys (WCAG 2.1.4) (`src/nav/input.js`). **S**
- [ ] The OS "reduce motion" preference doesn't turn on the app's Reduce Motion setting or skip
      the intro. **S**
- [ ] Screen readers: toasts may not be announced because the live region is created with its
      text (`src/overlays/Toasts.jsx`); toggle, option and slider rows don't expose their state
      (`src/components/ui.jsx`). **S**
- [ ] The fixed, scaled stage means browser zoom can't enlarge text (WCAG 1.4.4). Probably
      accept as a design limit, but say so somewhere. **M** to change.

## Project

- [ ] **Lennon:** make `main` the default branch on GitHub (Settings → General), then delete
      `claude/brave-brahmagupta-c5o8cv`.
- [ ] Deploy from CI. `gh-pages` is one hand-built commit and is now well behind `main`. A
      GitHub Actions Pages workflow would rebuild on every push to `main`. Lennon has to switch
      the Pages source to Actions. **S**
- [ ] Run `npm run check` in CI on pushes and pull requests. **S**
- [ ] Tests: start with Vitest on the reducer, the importer's start-page and folder rules, and
      `findNext` in `src/nav/spatial.js`, which are pure functions. **M**
- [ ] README has no run instructions (Lennon cut them on purpose; they're in `CLAUDE.md`).
      Decide whether a short "Run it" section goes back. **S**
- [ ] Pick one era. The README says 2011–2013; some comments say 2013–2015. **S**
- [ ] Add a LICENSE once the Microsoft-material question above is settled. **S**
