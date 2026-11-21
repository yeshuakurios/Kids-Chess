import type { Key } from 'chessground/types';
import { createRookBoard, fenWithRookOnly, rookDestinations, squareToPercent, coordToSquare, reachableSquare, buildReachableChain } from '../rookboard';
import { pieceById } from '../pieces';
import { loadProgress, saveProgress, awardXp, awardGems, markMastered, touchStreak } from '../state';

const ROOK = pieceById('rook')!;
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

export function renderLessonRook(root: HTMLElement, navigate: (route: string) => void): void {
  root.innerHTML = `
    <div class="screen lesson-screen">
      <div class="lesson-header">
        <button class="back-btn" id="back">←</button>
        <div class="hearts" id="hearts" style="visibility:hidden;">❤️❤️❤️</div>
      </div>
      <div class="mascot-row">
        <div class="mascot-face" id="mascot">${ROOK.symbol}</div>
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

  document.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());

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
  function loseHeart(): void {
    hearts = Math.max(0, hearts - 1);
    heartsEl.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(3 - hearts);
  }

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
  const cg = createRookBoard(cgHost);

  // ---- Step 1: Intro ----
  function stepIntro(): void {
    say(ROOK.tagline);
    heartsEl.style.visibility = 'hidden';
    timerBar.style.visibility = 'hidden';
    progressRow.innerHTML = '&nbsp;';
    cg.set({ fen: fenWithRookOnly('d4'), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();
    footer.innerHTML = `<button class="primary-btn" id="go">Meet the Rook!</button>`;
    footer.querySelector('#go')!.addEventListener('click', stepDemo);
  }

  // ---- Step 2: Movement demo ----
  function stepDemo(): void {
    say('Straight lines — up, down, left, right. As far as I want!');
    let seq: [string, string][] = [['d4', 'd7'], ['d7', 'd4'], ['d4', 'a4'], ['a4', 'd4']];
    let i = 0;
    cg.set({ fen: fenWithRookOnly('d4'), turnColor: 'white' });
    const dests = new Map<Key, Key[]>();
    dests.set('d4' as Key, rookDestinations('d4'));
    cg.set({ turnColor: 'white', movable: { color: 'white', dests, free: false } });
    cg.redrawAll();

    function playNext(): void {
      if (i >= seq.length) {
        footer.innerHTML = `<button class="primary-btn" id="go">Try it myself</button>`;
        footer.querySelector('#go')!.addEventListener('click', stepExplore);
        return;
      }
      const [from, to] = seq[i];
      cg.move(from as Key, to as Key);
      i++;
      setTimeout(playNext, 500);
    }
    footer.innerHTML = '';
    setTimeout(playNext, 400);
  }

  // ---- Step 3: Free exploration (no penalty) ----
  function stepExplore(): void {
    say('Your turn — tap a glowing square to move the Rook there.');
    footer.innerHTML = '';
    const start = 'd4';
    cg.set({ fen: fenWithRookOnly(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    const dests = new Map<Key, Key[]>();
    dests.set(start as Key, rookDestinations(start));
    cg.set({
      turnColor: 'white',
      movable: {
        color: 'white',
        dests,
        free: false,
        events: {
          after: () => {
            bounceMascot();
            say('Nice! You moved the Rook. Let\'s grab some coins now.');
            cg.set({ movable: { color: undefined, dests: new Map() } });
            setTimeout(stepCoins, 1100);
          }
        }
      }
    });
    cg.redrawAll();
  }

  // ---- Step 4: Coin-capture mini puzzles (graded, but reset-on-miss, no heart cost) ----
  function stepCoins(round = 1): void {
    if (round > COIN_ROUNDS) {
      stepRace();
      return;
    }
    document.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
    heartsEl.style.visibility = 'hidden';
    say(`Grab the coin! (${round}/${COIN_ROUNDS})`);
    progressRow.textContent = `🪙 ${round - 1} / ${COIN_ROUNDS}`;
    footer.innerHTML = '';

    const start = coordToSquare(Math.floor(Math.random() * 8), Math.floor(Math.random() * 8));
    const coinSquare = reachableSquare(start);
    cg.set({ fen: fenWithRookOnly(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();
    placeCoin(boardWrap, coinSquare);

    function armMove(): void {
      const dests = new Map<Key, Key[]>();
      dests.set(start as Key, rookDestinations(start));
      cg.set({
        turnColor: 'white',
        movable: {
          color: 'white',
          dests,
          free: false,
          events: {
            after: (_from, to) => {
              if (to === coinSquare) {
                document.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
                bounceMascot();
                say(randomLine(ROOK.victoryLines));
                cg.set({ movable: { color: undefined, dests: new Map() } });
                setTimeout(() => stepCoins(round + 1), 700);
              } else {
                sadMascot();
                say(randomLine(ROOK.confusedLines));
                cg.set({ fen: fenWithRookOnly(start), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
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
    document.querySelectorAll<HTMLElement>('.coin').forEach((c) => c.remove());
    heartsEl.style.visibility = 'visible';
    hearts = 3;
    heartsEl.textContent = '❤️❤️❤️';
    timerBar.style.visibility = 'visible';
    progressRow.innerHTML = '&nbsp;';
    say('Capture race! Grab every coin before time runs out!');
    footer.innerHTML = '';

    let current = coordToSquare(3, 3);
    const chain = buildReachableChain(current, RACE_COINS);
    const coins: Coin[] = chain.map((sq) => ({ square: sq, el: placeCoin(boardWrap, sq) }));
    let captured = 0;
    let timeLeft = RACE_SECONDS * 10;

    cg.set({ fen: fenWithRookOnly(current), turnColor: 'white', movable: { color: undefined, dests: new Map() } });
    cg.redrawAll();

    function finish(success: boolean): void {
      if (raceTimer) clearInterval(raceTimer);
      cg.set({ movable: { color: undefined, dests: new Map() } });
      timerBar.style.visibility = 'hidden';
      stepSummary(captured, success);
    }

    function armMove(): void {
      const dests = new Map<Key, Key[]>();
      dests.set(current as Key, rookDestinations(current));
      cg.set({
        turnColor: 'white',
        movable: {
          color: 'white',
          dests,
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
      timeLeft--;
      timerFill.style.width = `${(timeLeft / (RACE_SECONDS * 10)) * 100}%`;
      if (timeLeft <= 0) finish(captured === RACE_COINS);
    }, 100);
  }

  // ---- Step 6: Summary ----
  function stepSummary(coinsCaptured: number, perfect: boolean): void {
    const p = loadProgress();
    const grewStreak = touchStreak(p);
    const xpGain = 15 + coinsCaptured;
    const { leveledUp } = awardXp(p, xpGain);
    awardGems(p, 1);
    markMastered(p, 'rook');
    saveProgress(p);

    root.innerHTML = `
      <div class="screen summary-screen">
        <div class="confetti">${perfect ? '🎉🏰🎉' : '🏰'}</div>
        <div class="summary-title">Rook Rank: Mastered!</div>
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

  stepIntro();
}
