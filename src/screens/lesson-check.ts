import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import { createPieceBoard, createRingOverlay } from '../pieceboard';
import { CHECK_PUZZLES, validateSafetyContent } from '../safety';
import { loadProgress, saveProgress, awardXp, awardGems, markSafetyComplete, touchStreak } from '../state';
import { playTap, playCorrect, playLevelUp, playStreak, playGem } from '../sound';

validateSafetyContent(Chess as unknown as new (fen?: string) => {
  inCheck(): boolean;
  isAttacked(square: string, color: 'w' | 'b'): boolean;
});

const MASCOT = '♔';

type EscapeKind = 'move' | 'block' | 'capture';

const FEEDBACK: Record<EscapeKind, string> = {
  move: 'Nice! You moved the King to safety.',
  capture: 'Got it! You captured the attacker.',
  block: 'Smart! You blocked the attack.'
};

function findKingSquare(game: Chess, color: 'w' | 'b'): string {
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    }
  }
  throw new Error('king not found on board');
}

export function renderCheckLesson(root: HTMLElement, navigate: (route: string) => void): void {
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
      <div class="way-cards" id="wayCards" style="display:none;"></div>
      <div class="lesson-footer" id="footer"></div>
    </div>
  `;

  const speech = root.querySelector('#speech') as HTMLElement;
  const mascot = root.querySelector('#mascot') as HTMLElement;
  const boardWrap = root.querySelector('#boardWrap') as HTMLElement;
  const footer = root.querySelector('#footer') as HTMLElement;
  const progressRow = root.querySelector('#progressRow') as HTMLElement;
  const wayCards = root.querySelector('#wayCards') as HTMLElement;
  const { ring: ringSquare, clear: clearRings } = createRingOverlay(boardWrap);

  root.querySelector('#back')!.addEventListener('click', () => {
    playTap();
    navigate('#/home');
  });

  function bounceMascot(): void {
    mascot.classList.remove('bounce');
    requestAnimationFrame(() => mascot.classList.add('bounce'));
  }
  function say(line: string): void {
    speech.textContent = line;
  }

  const cgHost = root.querySelector('#cgHost') as HTMLElement;
  const cg = createPieceBoard(cgHost);

  function stepIntro(): void {
    say("When the King is attacked, that's called CHECK! You must get him out of danger right away.");
    clearRings();
    cg.set({
      fen: '4rk2/8/8/8/8/8/8/4K3 w - - 0 1',
      turnColor: 'white',
      movable: { color: undefined, dests: new Map() }
    });
    cg.redrawAll();
    ringSquare('e1', 'ring-check');
    footer.innerHTML = `<button class="primary-btn" id="go">Show me the ways out</button>`;
    footer.querySelector('#go')!.addEventListener('click', () => {
      playTap();
      stepWays();
    });
  }

  function stepWays(): void {
    say('There are three ways to escape check:');
    wayCards.style.display = 'flex';
    wayCards.innerHTML = `
      <div class="way-card"><div class="way-emoji">🏃</div><div class="way-label">Move the King away</div></div>
      <div class="way-card"><div class="way-emoji">🛡️</div><div class="way-label">Block the attack</div></div>
      <div class="way-card"><div class="way-emoji">⚔️</div><div class="way-label">Capture the attacker</div></div>
    `;
    footer.innerHTML = `<button class="primary-btn" id="go">Let's practice!</button>`;
    footer.querySelector('#go')!.addEventListener('click', () => {
      playTap();
      wayCards.style.display = 'none';
      stepDrill(0);
    });
  }

  function stepDrill(round: number): void {
    if (round >= CHECK_PUZZLES.length) {
      stepSummary();
      return;
    }
    progressRow.textContent = `Round ${round + 1} / ${CHECK_PUZZLES.length}`;
    say('The King is in check! Find a way out.');
    footer.innerHTML = '';

    const puzzle = CHECK_PUZZLES[round];
    const game = new Chess(puzzle.fen);
    const legalMoves = game.moves({ verbose: true });
    const destMap = new Map<Key, Key[]>();
    for (const m of legalMoves) {
      const list = destMap.get(m.from as Key) ?? [];
      list.push(m.to as Key);
      destMap.set(m.from as Key, list);
    }

    clearRings();
    cg.set({ lastMove: undefined, fen: puzzle.fen, turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();
    ringSquare(findKingSquare(game, 'w'), 'ring-check');

    cg.set({
      turnColor: 'white',
      movable: {
        color: 'white',
        dests: destMap,
        free: false,
        events: {
          after: (from, to) => {
            const played = legalMoves.find((m) => m.from === from && m.to === to)!;
            const kind: EscapeKind = played.piece === 'k' ? 'move' : played.captured ? 'capture' : 'block';
            playCorrect();
            bounceMascot();
            clearRings();
            say(FEEDBACK[kind]);
            cg.set({ movable: { color: undefined, dests: new Map() } });
            setTimeout(() => stepDrill(round + 1), 1000);
          }
        }
      }
    });
    cg.redrawAll();
  }

  function stepSummary(): void {
    const p = loadProgress();
    const grewStreak = touchStreak(p);
    const xpGain = 20;
    const { leveledUp } = awardXp(p, xpGain);
    awardGems(p, 1);
    markSafetyComplete(p, 'check');
    saveProgress(p);

    if (leveledUp) playLevelUp();
    else if (grewStreak) playStreak();
    else playGem();

    root.innerHTML = `
      <div class="screen summary-screen">
        <div class="confetti">🎉🛡️🎉</div>
        <div class="summary-title">Check mastered!</div>
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
