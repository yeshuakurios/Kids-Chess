# AGENTS.md — Visual, Animation & Sound Pass

## Context

This is a chess-teaching PWA for a 7-year-old, built with Vite + TypeScript +
Chessground (board rendering) + chess.js, no UI framework. It's live at
**https://kids-chess-blb.pages.dev** (Cloudflare Pages, auto-deploys from
`main` via `.github/workflows/deploy.yml`).

The gameplay/pedagogy/progression logic is done and working: a skill-tree
home screen (XP, streak, gems, rank) and a full "Piece Academy" lesson for
**all six pieces** (Rook, Bishop, Knight, Queen, Pawn, King — intro → movement
demo → free exploration → coin-capture drill → timed capture race →
summary, one shared engine driven by each piece's real movement rules).
A drawn mascot icon (a cute rook, `public/icon-512.png` etc.) already exists
for the app icon itself — the per-piece in-lesson mascots are still plain
Unicode glyphs and are what this file scopes.

See `docs/design-plan.md` for the full curriculum/gamification/humor design
this app is working toward — this file (`AGENTS.md`) only scopes the visual/
animation/sound polish pass on what's already built. The functional MVP for
Stage 1 (Piece Academy) is solid; what's missing is **polish**: this file
scopes that pass.

## The ask

Make the app feel like a well-produced kids' game (closer to Duolingo /
a Nintendo-ish kids' title) rather than a functional prototype:

1. **Character art** for each piece's mascot (currently plain Unicode chess
   glyphs: ♜ ♝ ♞ ♛ ♟ ♚). Each piece already has a written personality in
   `src/pieces.ts` (tagline, idle line, confused lines, victory lines) —
   the art should match that personality, not just be "a rook."
2. **Animations** beyond the current bare-bones CSS keyframes (`src/style.css`
   has `bounce`/`shake`/`coin-pop` — functional but minimal): confetti,
   screen transitions, XP-bar fill, skill-tree node unlock shimmer, idle
   fidgets, a proper victory sequence on the summary screen.
3. **Sound effects**: move, capture, illegal-move, check/correct, wrong
   answer, level-up, gem/XP gain, streak-save, button taps. None exist yet.

## Style direction (confirmed with the user)

**Cute cartoon / Duolingo-ish**: soft rounded shapes, bright flat colors,
big expressive eyes, approachable and a little silly. Not painterly/
storybook, not hyper-minimal geometric. Think "friendly mobile game mascot,"
not "chess club logo."

## Budget constraint

**No paid image-generation API calls.** The user does not want to spend
money on this. Options that fit:
- Hand-built SVG/CSS illustrations (fully free, versionable, easy to animate
  since they're just DOM/SVG elements — this is probably the best fit for
  "cute cartoon" + needing these to animate well)
- A free/open asset library if one fits the style and license allows
  redistribution in an open-source-adjacent hobby project (check: this repo
  uses Chessground, which is GPL-3.0, so the repo's source is already kept
  open per `CLAUDE.md`'s "GPL" rule — don't introduce assets under a
  conflicting license)
- If an image-generation tool is available to you and free/already paid for
  in your own context (e.g. you have your own Codex/ChatGPT image access
  outside this budget-constrained session), that's fine — the constraint is
  specifically about *this project* incurring new API spend, not a ban on
  generated art in general.

## Where things live

- `src/pieces.ts` — piece personalities/metadata for all 6 pieces, including
  `symbol` (currently a Unicode glyph per piece — swap for real art here),
  `moveCaption` (demo-step narration), `demoStart`/`demoSequence` (the
  auto-played demo moves), and the character voice lines (tagline, idle,
  confused, victory).
- `src/screens/lesson-piece.ts` — the single generic lesson engine used by
  all 6 pieces (parameterized by `pieceId`; looks up `src/pieces.ts` and
  `src/pieceboard.ts`). Has a `#mascot` element (currently renders
  `PIECE.symbol` as text) and calls `bounceMascot()` / `sadMascot()` at
  specific moments — those are the animation hook points. This replaced the
  old Rook-only `lesson-rook.ts`, which no longer exists.
- `src/screens/home.ts` — skill-tree screen; each node shows
  `piece.symbol` too.
- `src/pieceboard.ts` — Chessground setup, per-piece movement/destination
  logic (sliding for rook/bishop/queen, jumps for knight/king, forward-only
  for pawn), and the custom coin-overlay system (coins are plain emoji `🪙`
  positioned absolutely over the board — also a reasonable target for a
  redraw). This replaced the old Rook-only `rookboard.ts`, which no longer
  exists.
- `src/style.css` — all current styling and the 3 existing keyframe
  animations. `.mascot-face`, `.coin`, `.tree-node`, `.summary-screen` are
  the main visual surfaces.
- `public/icon.svg` / `icon-192.png` / `icon-512.png` / `apple-touch-icon.png`
  / `favicon-32.png` — **done**, a drawn cute-cartoon rook mascot (see
  `vite.config.ts`'s manifest and `index.html`'s `<link>` tags for how
  they're wired in). Don't redo this; it's a reference for the style the
  in-lesson mascots and other art should match.

## Hard constraints — do not break these

- **No runtime engine, no paid API, no Claude/LLM calls from the client at
  runtime** (see root `CLAUDE.md` if this repo ever merges with or borrows
  conventions from the sibling `chess-openings` app — this repo doesn't
  have that file yet, but the constraint is the same: static assets only,
  everything bundled at build time).
- **Offline-first PWA**: any new art/sound assets must be included in the
  Vite PWA precache (`vite-plugin-pwa`'s `workbox.globPatterns` in
  `vite.config.ts` — update the glob if you add new asset file types, e.g.
  `.woff2`, `.mp3`/`.ogg`, or new image extensions).
- **Keep bundle size sane** — this is a PWA a 7-year-old's phone will
  install; don't bloat it with huge unoptimized art/audio files. Prefer
  SVG over raster where possible; compress audio (short synthesized
  Web-Audio-API sound effects, generated in code, avoid shipping audio
  files at all if you can get away with it — zero asset weight, zero
  licensing concerns).
- **`cg.redrawAll()` gotcha** (already solved once, don't reintroduce it):
  Chessground's `redrawAll()` wipes the *entire* innerHTML of the element
  it was constructed on. The coin overlay in `pieceboard.ts`/`lesson-piece.ts`
  is deliberately a *sibling* of Chessground's own host div (`#cgHost`
  inside `#boardWrap`), not a child of it, specifically so redraws don't
  delete the coins. Any new overlay UI (confetti, extra animations layered
  over the board) needs the same treatment.
- **Chessground also caches board bounds and needs `cg.redrawAll()` called
  explicitly whenever surrounding layout shifts** (see the fixed layout
  heights / `visibility: hidden` instead of `display: none` pattern already
  in `lesson-piece.ts` for the hearts/timer rows — that was a real, subtle
  bug: don't reintroduce layout shifts around the board without also
  re-triggering a redraw).
- Build/verify with `npm run build` (typecheck + Vite build) before
  considering anything done. There's no test suite yet for this repo.
- **Visually verify changes with an actual screenshot, not just DOM
  assertions.** A past bug here (missing Chessground board-theme CSS) was
  invisible to automated DOM-based tests — the board was structurally
  correct but visually blank — and only caught when a human looked at a
  screenshot. Don't repeat that: run the app, screenshot the key screens,
  and look at them before calling a visual change finished.

## Suggested order of attack

1. Rook mascot art first — it's the icon's style reference already proved
   out (see `public/icon-512.png`), so apply that same look to the in-lesson
   Rook mascot before touching the other 5 pieces.
2. Sound effects (self-contained, no art dependency, quick win).
3. Home-screen skill-tree polish (node unlock shimmer, XP bar fill).
4. Remaining 5 piece mascots (Bishop, Knight, Queen, Pawn, King), once the
   style is validated on the Rook — all 5 are already fully playable
   lessons via `lesson-piece.ts`, just waiting on their art.
5. Summary-screen victory sequence (confetti etc.) — this is the biggest
   "wow" moment in the current flow, worth getting right.

## Git workflow

Develop on a branch, open a PR into `main`, and know that merging to `main`
auto-deploys via the Cloudflare Pages GitHub Action. Don't push directly to
`main`. Check `npm run build` passes before opening a PR.
