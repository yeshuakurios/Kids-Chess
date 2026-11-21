import type { Key } from 'chessground/types';
import type { PieceId } from '../types';
import {
  createPieceBoard,
  fenWithPieceOnly,
  squareToPercent,
  DESTINATIONS,
  reachableSquare,
  buildReachableChain,
  randomStartSquare,
  type DestinationsFn
} from '../pieceboard';
import { pieceById } from '../pieces';
import { mascotArt } from '../mascots';
import { renderCutscene, victoryScene } from './cutscene';
import { loadProgress, saveProgress, awardXp, awardGems, markMastered, touchStreak } from '../state';

const COIN_ROUNDS = 5;
const RACE_SECONDS = 20;
const RACE_COINS = 4;

type Coin = { square: string; el: HTMLElement };

function placeCoin(boardWrap: HTMLElement, square: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'coin';
  el.textContent = '🪙';
  const { left, top } = squareToPercent(square);
  el.style.left = `${left}%`;
  el.style.top = `${top}%`;
  boardWrap.appendChild(el);
  return el;
}

export function renderPieceLesson(pieceId: PieceId, root: HTMLElement, navigate: (route: string) => void): void {
  renderCutscene(root, pieceId, () => startPieceLesson(pieceId, root, navigate), () => navigate('#/home'));
}

function startPieceLesson(pieceId: PieceId, root: HTMLElement, navigate: (route: string) => void): void {
  const PIECE = pieceById(pieceId)!;
  const dests: DestinationsFn = DESTINATIONS[pieceId];
  const fenOf = (square: string) => fenWithPieceOnly(pieceId, square);

  root.innerHTML = `
    <div class="screen lesson-screen">
      <div class="lesson-header">
        <button class="back-btn" id="back" aria-label="Back to the path">←</button>
        <div class="hearts" id="hearts" style="visibility:hidden;">❤️❤️❤️</div>
      </div>
      <div class="mascot-row">
        <div class="mascot-face" id="mascot">${mascotArt(pieceId)}</div>
      </div>
      <div class="speech-card" id="speech">Loading...</div>
      <div class="board-wrap" id="boardWrap" style="position:relative;">
        <div id="cgHost" style="position:absolute; inset:0;"></div>
      </div>
      <div class="progress-row" id="progressRow">&nbsp;</div>
      <div class="timer-bar" id="timerBar" style="visibility:hidden;"><div class="timer-fill" id="timerFill"></div></div>
      <div class="lesson-footer" id="footer"></div>
    </div>
  `;

  const speech = root.querySelector('#speech') as HTMLElement;
  const mascot = root.querySelector('#mascot') as HTMLElement;
  const boardWrap = root.querySelector('#boardWrap') as HTMLElement;
  const footer = root.querySelector('#footer') as HTMLElement;
  const progressRow = root.querySelector('#progressRow') as HTMLElement;
  const timerBar = root.querySelector('#timerBar') as HTMLElement;
  const timerFill = root.querySelector('#timerFill') as HTMLElement;
  const heartsEl = root.querySelector('#hearts') as HTMLElement;

  root.querySelector('#back')!.addEventListener('click', () => navigate('#/home'));

  let hearts = 3;

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

  const cgHost = root.querySelector('#cgHost') as HTMLElement;
  const cg = createPieceBoard(cgHost);

  // ---- Step 2: Movement demo ----
  function stepDemo(): void {
    say(PIECE.moveCaption);
    let i = 0;
    cg.set({ lastMove: undefined, fen: fenOf(PIECE.demoStart), turnColor: 'white' });
    cg.redrawAll();

    function playNext(): void {
      if (i >= PIECE.demoSequence.length) {
        footer.innerHTML = `<button class="primary-btn" id="go">Try it myself</button>`;
        footer.querySelector('#go')!.addEventListener('click', stepExplore);
        return;
      }
      const [from, to] = PIECE.demoSequence[i];
      cg.move(from as Key, to as Key);
      i++;
      setTimeout(playNext, 500);
    }
    footer.innerHTML = '';
    setTimeout(playNext, 400);
  }

  // ---- Step 3: Free exploration (no penalty) ----
  function stepExplore(): void {
    say(`Your turn — tap a glowing square to move the ${PIECE.name} there.`);
    footer.innerHTML = '';
    const start = randomStartSquare(dests);
    cg.set({ lastMove: undefined, fen: fenOf(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    const destMap = new Map<Key, Key[]>();
    destMap.set(start as Key, dests(start));
    cg.set({
      turnColor: 'white',
      movable: {
        color: 'white',
        dests: destMap,
        free: false,
        events: {
          after: () => {
            bounceMascot();
            say(`Nice! You moved the ${PIECE.name}. Let's grab some coins now.`);
            cg.set({ movable: { color: undefined, dests: new Map() } });
            setTimeout(() => stepCoins(1), 1100);
          }
        }
      }
    });
    cg.redrawAll();
  }

  // ---- Step 4: Coin-capture mini puzzles (graded, but reset-on-miss, no heart cost) ----
  function stepCoins(round: number): void {
    if (!cgHost.isConnected) return;
    if (round > COIN_ROUNDS) {
      stepRace();
      return;
    }
    boardWrap.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
    heartsEl.style.visibility = 'hidden';
    say(`Grab the coin! (${round}/${COIN_ROUNDS})`);
    progressRow.textContent = `🪙 ${round - 1} / ${COIN_ROUNDS}`;
    footer.innerHTML = '';

    const start = randomStartSquare(dests);
    const coinSquare = reachableSquare(start, dests)!;
    cg.set({ lastMove: undefined, fen: fenOf(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();
    placeCoin(boardWrap, coinSquare);

    function armMove(): void {
      const destMap = new Map<Key, Key[]>();
      destMap.set(start as Key, dests(start));
      cg.set({
        turnColor: 'white',
        movable: {
          color: 'white',
          dests: destMap,
          free: false,
          events: {
            after: (_from, to) => {
              if (to === coinSquare) {
                boardWrap.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
                bounceMascot();
                say(randomLine(PIECE.victoryLines));
                cg.set({ movable: { color: undefined, dests: new Map() } });
                setTimeout(() => stepCoins(round + 1), 700);
              } else {
                sadMascot();
                say(randomLine(PIECE.confusedLines));
                cg.set({ lastMove: undefined, fen: fenOf(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
                cg.redrawAll();
                setTimeout(armMove, 500);
              }
            }
          }
        }
      });
      cg.redrawAll();
    }
    armMove();
  }

  // ---- Step 5: Timed capture race ----
  let raceTimer: number | undefined;
  function stepRace(): void {
    boardWrap.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
    heartsEl.style.visibility = 'visible';
    hearts = 3;
    heartsEl.textContent = '❤️❤️❤️';
    timerBar.style.visibility = 'visible';
    progressRow.innerHTML = '&nbsp;';
    say('Capture race! Grab every coin before time runs out!');
    footer.innerHTML = '';

    let current = randomStartSquare(dests);
    const chain = buildReachableChain(current, RACE_COINS, dests);
    const coins: Coin[] = chain.map((sq) => ({ square: sq, el: placeCoin(boardWrap, sq) }));
    const targetCount = coins.length;
    let captured = 0;
    let timeLeft = RACE_SECONDS * 10;

    cg.set({ lastMove: undefined, fen: fenOf(current), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();

    function finish(success: boolean): void {
      if (raceTimer) clearInterval(raceTimer);
      cg.set({ movable: { color: undefined, dests: new Map() } });
      timerBar.style.visibility = 'hidden';
      stepSummary(captured, success);
    }

    function armMove(): void {
      const destMap = new Map<Key, Key[]>();
      destMap.set(current as Key, dests(current));
      cg.set({
        turnColor: 'white',
        movable: {
          color: 'white',
          dests: destMap,
          free: false,
          events: {
            after: (_from, to) => {
              const hit = coins.find((c) => c.square === to);
              if (hit) {
                hit.el.remove();
                coins.splice(coins.indexOf(hit), 1);
                captured++;
                current = to;
                bounceMascot();
                if (coins.length === 0) {
                  say('ALL COINS GRABBED! Amazing!');
                  finish(true);
                  return;
                }
                armMove();
              } else {
                current = to;
                armMove();
              }
            }
          }
        }
      });
      cg.redrawAll();
    }
    armMove();

    raceTimer = window.setInterval(() => {
      if (!cgHost.isConnected) {
        clearInterval(raceTimer);
        return;
      }
      timeLeft--;
      timerFill.style.width = `${(timeLeft / (RACE_SECONDS * 10)) * 100}%`;
      if (timeLeft <= 0) finish(captured === targetCount);
    }, 100);
  }

  // ---- Step 6: Summary ----
  function stepSummary(coinsCaptured: number, perfect: boolean): void {
    const p = loadProgress();
    const grewStreak = touchStreak(p);
    const xpGain = 15 + coinsCaptured;
    const { leveledUp } = awardXp(p, xpGain);
    awardGems(p, 1);
    markMastered(p, pieceId);
    saveProgress(p);

    root.innerHTML = `
      <div class="screen summary-screen">
        ${victoryScene(pieceId, perfect)}
        <div class="summary-title">${PIECE.name} Rank: Mastered!</div>
        <div class="summary-stat">🪙 Coins grabbed: ${coinsCaptured}</div>
        <div class="summary-stat">⭐ +${xpGain} XP</div>
        <div class="summary-stat">💎 +1 Gem</div>
        ${grewStreak ? `<div class="summary-stat">🔥 Streak: ${p.streak} day${p.streak === 1 ? '' : 's'}!</div>` : ''}
        ${leveledUp ? `<div class="summary-stat">🎖️ New rank unlocked!</div>` : ''}
        <button class="primary-btn" id="done">Back to the path</button>
      </div>
    `;
    root.querySelector('#done')!.addEventListener('click', () => navigate('#/home'));
  }

  root.querySelector<HTMLButtonElement>('#back')!.focus({ preventScroll: true });
  stepDemo();
}
