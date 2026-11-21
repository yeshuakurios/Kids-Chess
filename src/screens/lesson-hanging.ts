import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import { createPieceBoard, createRingOverlay } from '../pieceboard';
import { HANG_PUZZLES, validateSafetyContent } from '../safety';
import { loadProgress, saveProgress, awardXp, awardGems, markSafetyComplete, touchStreak } from '../state';
import { playTap, playCorrect, playWrong, playLevelUp, playStreak, playGem } from '../sound';

validateSafetyContent(Chess as unknown as new (fen?: string) => {
  inCheck(): boolean;
  isAttacked(square: string, color: 'w' | 'b'): boolean;
});

const MASCOT = '🎯';
const WRONG_LINES = [
  "That one's safe! Look again — which piece can a black piece actually grab?",
  'Not quite — check if anything of yours could rescue that piece if it got captured.',
  'Close look again! One of your pieces has no help nearby.'
];

export function renderHangingLesson(root: HTMLElement, navigate: (route: string) => void): void {
  root.innerHTML = `
    <div class="screen lesson-screen">
      <div class="lesson-header">
        <button class="back-btn" id="back">←</button>
        <div class="hearts" id="hearts" style="visibility:hidden;">❤️❤️❤️</div>
      </div>
      <div class="mascot-row">
        <div class="mascot-face" id="mascot">${MASCOT}</div>
      </div>
      <div class="speech-card" id="speech">Loading...</div>
      <div class="board-wrap" id="boardWrap" style="position:relative;">
        <div id="cgHost" style="position:absolute; inset:0;"></div>
      </div>
      <div class="progress-row" id="progressRow">&nbsp;</div>
      <div class="lesson-footer" id="footer"></div>
    </div>
  `;

  const speech = root.querySelector('#speech') as HTMLElement;
  const mascot = root.querySelector('#mascot') as HTMLElement;
  const boardWrap = root.querySelector('#boardWrap') as HTMLElement;
  const footer = root.querySelector('#footer') as HTMLElement;
  const progressRow = root.querySelector('#progressRow') as HTMLElement;

  root.querySelector('#back')!.addEventListener('click', () => {
    playTap();
    navigate('#/home');
  });

  function bounceMascot(): void {
    mascot.classList.remove('bounce');
    requestAnimationFrame(() => mascot.classList.add('bounce'));
  }
  function sadMascot(): void {
    mascot.classList.remove('sad');
    requestAnimationFrame(() => mascot.classList.add('sad'));
  }
  function say(line: string): void {
    speech.textContent = line;
  }
  function randomLine(lines: string[]): string {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  const { ring: ringSquare, clear: clearRings } = createRingOverlay(boardWrap);

  const cgHost = root.querySelector('#cgHost') as HTMLElement;
  const cg = createPieceBoard(cgHost);
  cg.set({ draggable: { enabled: false }, movable: { free: false, showDests: false } });

  function stepIntro(): void {
    say("A piece is \"hanging\" when an enemy piece can grab it for free — nobody can get it back!");
    cg.set({
      fen: HANG_PUZZLES[0].fen,
      movable: { color: undefined, dests: new Map() },
      selectable: { enabled: false }
    });
    cg.redrawAll();
    footer.innerHTML = `<button class="primary-btn" id="go">Show me</button>`;
    footer.querySelector('#go')!.addEventListener('click', () => {
      playTap();
      stepDemo();
    });
  }

  function stepDemo(): void {
    const demo = HANG_PUZZLES[0];
    say('See the Queen? That black Bishop could capture it, and nothing of ours could capture back.');
    ringSquare(demo.hangingSquare, 'ring-danger');
    footer.innerHTML = `<button class="primary-btn" id="go">Your turn!</button>`;
    footer.querySelector('#go')!.addEventListener('click', () => {
      playTap();
      clearRings();
      stepDrill(0);
    });
  }

  function stepDrill(round: number): void {
    if (round >= HANG_PUZZLES.length) {
      stepSummary();
      return;
    }
    const puzzle = HANG_PUZZLES[round];
    progressRow.textContent = `Round ${round + 1} / ${HANG_PUZZLES.length}`;
    say("Tap the piece that's hanging!");
    footer.innerHTML = '';
    clearRings();

    cg.set({ fen: puzzle.fen, selectable: { enabled: false } });
    cg.redrawAll();

    cg.set({
      selectable: { enabled: true },
      events: {
        select: (key: Key) => {
          if (!puzzle.whiteSquares.includes(key)) return;
          cg.set({ selectable: { enabled: false } });
          if (key === puzzle.hangingSquare) {
            playCorrect();
            bounceMascot();
            ringSquare(key, 'ring-good');
            say('Yes! That piece is hanging — great eye!');
            setTimeout(() => stepDrill(round + 1), 1100);
          } else {
            playWrong();
            sadMascot();
            ringSquare(key, 'ring-danger');
            say(randomLine(WRONG_LINES));
            setTimeout(() => {
              clearRings();
              say("Tap the piece that's hanging!");
              cg.set({ selectable: { enabled: true } });
            }, 1100);
          }
        }
      }
    });
  }

  function stepSummary(): void {
    const p = loadProgress();
    const grewStreak = touchStreak(p);
    const xpGain = 20;
    const { leveledUp } = awardXp(p, xpGain);
    awardGems(p, 1);
    markSafetyComplete(p, 'hanging');
    saveProgress(p);

    if (leveledUp) playLevelUp();
    else if (grewStreak) playStreak();
    else playGem();

    root.innerHTML = `
      <div class="screen summary-screen">
        <div class="confetti">🎉🎯🎉</div>
        <div class="summary-title">Free Pieces mastered!</div>
        <div class="summary-stat">⭐ +${xpGain} XP</div>
        <div class="summary-stat">💎 +1 Gem</div>
        ${grewStreak ? `<div class="summary-stat">🔥 Streak: ${p.streak} day${p.streak === 1 ? '' : 's'}!</div>` : ''}
        ${leveledUp ? `<div class="summary-stat">🎖️ New rank unlocked!</div>` : ''}
        <button class="primary-btn" id="done">Back to the path</button>
      </div>
    `;
    root.querySelector('#done')!.addEventListener('click', () => {
      playTap();
      navigate('#/home');
    });
  }

  stepIntro();
}
