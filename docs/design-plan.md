# Kids Chess — Design Plan

Captures the planning conversation behind this app before any code existed,
so the original intent survives independent of chat history. If what's
built ever drifts from this, that's a decision to revisit deliberately —
not something to silently diverge from.

## Goal

Teach a 7-year-old to play chess, starting from zero, via a PWA she installs
on her iPhone home screen. Not scholastic/tournament prep — "learns the
rules and genuinely enjoys it" is the bar.

## Teaching curriculum (pedagogy, not app features)

A 7-year-old's chess curriculum looks nothing like an adult opening
trainer's spaced-repetition drilling. Sequence, roughly:

0. **Board & setup** — ranks/files as "streets and avenues," not algebraic
   notation yet; a setup rhyme; win condition is reconstructing the board
   from memory.
1. **Piece Academy** — one piece at a time, on a near-empty board, each
   with its own mini-game before combining. This is the single biggest
   lever against kids bouncing off chess (trying to learn all 6 pieces at
   once is the #1 dropout cause). Order: Rook → Bishop → Queen → Knight
   (budget 2x time — the L-shape is genuinely confusing) → Pawn → King.
2. **Check & safety** — what check means, visually; the three ways out
   (move/block/capture) as a simple decision tree; "don't hang your queen"
   as a dedicated spot-the-free-piece drill (the single biggest skill jump
   for beginners).
3. **Checkmate patterns** — named "finishing moves," most recognizable
   first: back-rank mate, K+Q vs K, K+R vs K, Scholar's mate (bridges into
   openings later). Demo → solve the exact pattern → mixed review once 2+
   are known (this is where spaced repetition earns its keep).
4. **Basic tactics vision** — forks, pins, skewers, discovered attacks.
   Short gamified puzzle sets. **This becomes the main ongoing daily-
   practice engine** once it exists — most long-term XP/streak grinding
   should live here, not in opening memorization.
5. **Full games, low pressure** — vs. a weak engine (or pass-and-play) with
   an optional no-penalty hint button; plain-language recap after each game.
   Introduce this in parallel with tactics (Stage 4), not strictly after —
   kids need real play early to stay motivated.
6. **Light opening sense** — three principles (control the center, develop
   knights/bishops early, castle), never move-by-move memorization. This is
   the only stage that resembles the sibling `chess-openings` app's domain,
   and even then it's reframed as principles, not lines.
7. **Ongoing loop** — daily tactics drill (spaced-repetition scheduled),
   occasional new pattern/tactic introduced, play-whenever games, XP/streak
   running under all of it.

Pacing: Stages 0–1 over 4–6 weeks of short sessions; Stage 4 (tactics) runs
forever as the "endless content" layer, the way Duolingo's vocab review
does.

## Gamification (the Duolingo-mechanics mapping)

The core loop: open app → see streak/quest → do a lesson/drill → get
graded → XP/gems tick up → return to map. If this loop isn't fun on its
own, nothing else fixes it.

- **Streak counter**, loss-averse framing, with a grace/freeze mechanic so
  one missed day doesn't kill motivation. Single strongest retention lever
  in the Duolingo playbook.
- **XP per lesson** (completion-based, bonus for perfect/fast), not per
  correct answer — reward finishing, not punish mistakes.
- **Rank ladder** themed on chess pieces rather than generic "Level N":
  Pawn Private → Pawn Sergeant → Knight-in-Training → Dizzy Bishop → Rook
  of Doom → Queen of Chaos → Grand Chicken Master (the absurd final rank is
  deliberate — kids love a joke title with no real meaning at the top).
- **Skill-tree map**, not a flat list — locked nodes until prerequisites
  clear. Implemented as the home screen's Piece Academy tree, generalizes to
  Vision Drills / Checkmate Patterns / Play Mode as those get built.
- **Hearts/lives** on graded drills (not on first-exposure exploration —
  that must stay zero-penalty) for light stakes without permanent
  punishment.
- **Gems** as a currency separate from XP, spent on cosmetic unlocks (board
  themes, piece skins, mascot outfits) — this is what makes grinding feel
  worth it beyond a number going up. Needs real sinks or it's pointless.
- **A mascot** with reactions (cheers, face-plant on a blunder, victory
  dance on checkmate) — a character gives emotional hooks a UI element
  can't.
- **Daily quests**, small and specific ("solve 5 capture puzzles today"),
  refresh daily, give a reason to open the app with nothing new queued.
- **End-of-lesson summary screen** — XP earned, streak status, confetti.
  Matters more than it sounds like it should.

**Psychological caution (kept from the original discussion):** gamifying a
7-year-old's play risks crowding out intrinsic motivation — if she's
playing for the streak rather than because chess is fun, motivation
collapses the moment the app goes away or she hits a plateau. Mitigations:
Play Mode (real games) must never feel gated behind XP; praise should name
the chess skill ("you spotted the fork!"), not just the streak; cosmetic
unlocks should be chosen, not just passively awarded, since autonomy
matters more than reward size at this age.

## Fun & humor plan

- **Every piece gets a personality**, not just a movement rule — this is
  implemented in `src/pieces.ts` (tagline, idle line, confused lines,
  victory lines per piece) and is the single biggest lever for "fun" vs.
  "functional." A mistake message in character ("Oops! Your King wandered
  somewhere dangerous — he's panicking!") lands better than neutral
  instructional text, and the character voice *is* the correction, not a
  separate thing layered on top of it.
- **Mascot reactions**: face-plant on losing a piece free, victory dance on
  checkmate, an exaggerated gasp right before a blunder (doubles as a soft
  visual tell). Needs 30–50 line variants per frequent event or repetition
  kills the joke within a week.
- **Absurd rank/quest names** in the Duolingo tradition: "Catch 3 sneaky
  knights," "Rescue the King from his own bad decisions," a streak-freeze
  item called something sillier than "streak freeze."
- **Sound and motion as comedy**, not just feedback: exaggerated capture
  crunch, comedic knight "boing," confetti/screen-shake on checkmate, idle
  fidgets if she leaves the board untouched.
- **Easter eggs** for attentive/repetitive play (e.g. moving a piece back
  and forth repeatedly triggers a specific mascot line) — rewards paying
  attention, not just completing tasks.
- **Joke-density budget**: reserve the big comedic beats for actual
  milestones; routine interactions should stay warm and light, not
  constantly bit-laden, or the humor stops landing ("trying too hard"
  effect).

## Full game-design checklist

(Beyond curriculum/gamification/humor — the systems-level pass to make sure
nothing's missing before calling any of this "done.")

1. **Core loop** — defined above; prototype-worthy on its own before
   anything else matters.
2. **Player goals** — session (finish today's streak), mid (finish a
   Stage), long (the stated reason she's doing this at all — stated to her
   explicitly somewhere in onboarding).
3. **Progression systems** — skill tree, XP→rank, mastery decay/review
   (spaced repetition is a progression system, not just content delivery),
   an explicit difficulty curve table (engine strength per stage, puzzle
   rating bands per tactic type) decided up front rather than tuned ad hoc.
4. **Economy** — XP (pure meter, no sink) vs. gems (needs real sinks: ~10–
   20 XP + 1 gem per lesson, 20–50 gems per cosmetic, so a cosmetic feels
   reachable in under a week).
5. **Content volume** — minimums to support spaced repetition without
   obvious repeats: ~15–20 puzzles per tactic category, 30–50 mascot lines
   per frequent event type, 5–6 cosmetic unlocks at launch.
6. **Onboarding** — a separate first-five-minutes experience from Stage 0:
   mascot intro, a tease of the skill tree, a winnable-in-under-2-minutes
   first lesson (day-1 retention lever).
7. **Retention hooks** — streak+freeze, daily quest refresh, a soft
   "welcome back" re-entry after an absence (never shaming). Push
   notifications are unreliable on an installed iOS PWA — don't depend on
   them; a home-screen badge/visible state is the fallback.
8. **Failure design** — explicit per layer: free exploration never
   penalizes; graded drills cost a heart with light retry copy; losing a
   full Play Mode game gets a soft-landing recap, never "YOU LOST"; running
   out of hearts gets a cooldown or an easy-review refill, never a hard
   wait-only lock for a kids' app.
9. **UI/UX consistency** — one input standard (tap, not drag-required)
   everywhere; consistent color language (green=legal, red=danger/check,
   gold=reward); don't rely on color alone for legal-move highlighting
   (shape/icon cues too).
10. **Audio inventory** — move, illegal-move, capture, check, checkmate,
    level-up, gem-earn, streak-save, button-tap, each short and distinct;
    a mute toggle.
11. **Playtesting** — watch her actually play a built lesson, live,
    unscripted, before building the next one. Specifically watch: does she
    understand wrong-move feedback, does a race timer feel fair or
    stressful, does she want to continue unprompted.
12. **Platform constraints** — iOS PWA push notifications are unreliable;
    iOS can evict IndexedDB/localStorage from an unused install (this is
    why Cloudflare sync was discussed as a backup, not yet built); confirm
    lesson content and puzzle sets are fully bundled, not fetched, so it
    works offline on a plane/car ride.

## What's actually built vs. what this plan describes

As of this writing: Stage 1 (Piece Academy) is **complete** for all 6
pieces, with the skill-tree home screen, XP/rank/streak/gems, a drawn
mascot icon, and the per-piece personality system all working. Stage 2
(check & safety) is **complete**: two new skill-tree nodes under
"Check & Safety", unlocked after all 6 pieces are mastered and gated
sequentially. "Check!" (`src/screens/lesson-check.ts`) teaches what check
means, shows the three ways out (move/block/capture) as cards, then drills
6 hand-curated check positions (`src/safety.ts`, `CHECK_PUZZLES`) using
real chess.js legal-move generation, so every tap is a real legal escape
and the feedback names which of the three methods was used. "Free Pieces"
(`src/screens/lesson-hanging.ts`) teaches "hanging" (attacked and
undefended), demos one example with a ringed square, then drills 6
hand-curated positions (`HANG_PUZZLES`) where the player taps the piece
that's loose; wrong taps ring red and explain, right taps ring green.
Both reuse the Piece Academy's mascot/speech-card/board layout and award
XP/gems/streak the same way. All 12 puzzle positions were verified
programmatically with chess.js (`isAttacked`/`inCheck`), and
`validateSafetyContent` re-checks them at runtime so a bad future edit
fails loudly. Verified with Playwright screenshots and a full scripted
playthrough of every round in both lessons (dark corners: sequential
lock/unlock state, the wrong-tap retry path). Not yet watched with the
actual 7-year-old (design doc item 11) — do that before building Stage 3.
Stages 3–7 (checkmate patterns, tactics vision, Play Mode, opening sense,
the ongoing daily loop) are **not started**. The visual/animation/sound
polish pass is scoped separately in `AGENTS.md` (still plain Unicode
glyphs in the new lessons too — same scope). Cloudflare sync for progress
persistence (item 12 above) was discussed and agreed on but not yet built.
