import { mascotArt } from '../mascots';
import { playTap } from '../sound';
import type { PieceId } from '../types';

interface Scene {
  title: string;
  panels: [string, string, string];
  action: string;
  victory: string;
  prop: string;
}

const SCENES: Record<PieceId, Scene> = {
  rook: {
    title: 'Castle on the Move',
    panels: ['The Rook zoomed into class.', 'Did you bring your ruler again?', 'Yep. I’m here for straight A’s!'],
    action: 'ZOOM!',
    victory: 'My victory lap is a straight line. I’ll walk back later.',
    prop: '📏'
  },
  bishop: {
    title: 'The Diagonal Disco',
    panels: ['The Bishop hit the dance floor.', 'Can you walk straight for one song?', 'Darling, I only do the diagonal disco.'],
    action: 'SWISH!',
    victory: 'I’d take a bow, darling, but only at an angle.',
    prop: '🪩'
  },
  knight: {
    title: 'The Great Knight Jump',
    panels: ['The Knight jumped over the whole class.', 'And what letter was that jump?', 'L! It’s the only one I can land on.'],
    action: 'BOING!',
    victory: 'I stuck the L-anding!',
    prop: '🥕'
  },
  queen: {
    title: 'Her Majesty Takes the Stage',
    panels: ['The Queen tried being a GPS.', 'Straight ahead? Or diagonal?', 'Both. Please turn onto Your Majesty’s Way.'],
    action: 'TA-DA!',
    victory: 'Please send my fan mail in all eight directions.',
    prop: '🎤'
  },
  pawn: {
    title: 'The Tiny Parade',
    panels: ['The Pawn Squad marched out.', 'Pawns! Did you pack a snack?', 'Yes, captain! March-mallows!'],
    action: 'STOMP!',
    victory: 'Small steps. Big cheers. Extremely big marshmallows.',
    prop: '🥁'
  },
  king: {
    title: 'The Royal Tiptoe',
    panels: ['The King put on his slippers.', 'Where are you going so slowly?', 'To my nap. One square at a time.'],
    action: 'TIPTOE…',
    victory: 'That was thrilling. Schedule my royal nap.',
    prop: '👑'
  }
};

function sceneArt(piece: PieceId, celebration = false): string {
  const sparkles = Array.from({ length: 12 }, (_, index) => {
    const x = 6 + (index * 31) % 89;
    const y = 9 + (index * 23) % 68;
    return `<i class="scene-sparkle" style="--x:${x}%;--y:${y}%;--delay:${index * 42}ms">✦</i>`;
  }).join('');
  return `<div class="scene-art scene-${piece}${celebration ? ' scene-celebration' : ''}" aria-hidden="true">
    <div class="scene-rays"></div>
    <div class="scene-landscape"></div>
    <div class="scene-checkerboard"></div>
    ${sparkles}
    <div class="scene-actor">${mascotArt(piece)}</div>
    <span class="scene-prop">${celebration ? '🏆' : SCENES[piece].prop}</span>
  </div>`;
}

const PANEL_DURATIONS = [2800, 3000, 4200];

export function renderCutscene(root: HTMLElement, piece: PieceId, start: () => void, back: () => void): void {
  const scene = SCENES[piece];
  root.innerHTML = `
    <section class="screen cutscene-screen" aria-labelledby="scene-title">
      <div class="comic-controls">
        <button type="button" class="back-btn" id="scene-back" aria-label="Back to the path">←</button>
        <button type="button" class="comic-control" id="scene-pause">Pause</button>
        <button type="button" class="comic-control comic-skip" id="scene-start">Skip to lesson</button>
      </div>
      <h1 class="cutscene-title" id="scene-title" tabindex="-1">${scene.title}</h1>
      <ol class="comic-strip">
        ${scene.panels.map((line, index) => `
          <li class="comic-panel" ${index === 0 ? '' : 'hidden'}>
            ${sceneArt(piece)}
            ${index === 0 ? `<span class="comic-action" aria-hidden="true">${scene.action}</span>` : ''}
            <p class="comic-caption">${line}</p>
          </li>`).join('')}
      </ol>
      <div class="comic-announcement" role="status"></div>
    </section>
  `;

  const screen = root.querySelector<HTMLElement>('.cutscene-screen')!;
  const panels = screen.querySelectorAll<HTMLElement>('.comic-panel');
  const pause = screen.querySelector<HTMLButtonElement>('#scene-pause')!;
  const announcement = screen.querySelector<HTMLElement>('.comic-announcement')!;
  let panel = 0;
  let remaining = PANEL_DURATIONS[panel];
  let timer: number | undefined;
  let deadline = 0;

  function cancelTimer(): void {
    window.clearTimeout(timer);
    timer = undefined;
  }

  function schedulePanel(): void {
    deadline = performance.now() + remaining;
    timer = window.setTimeout(() => {
      timer = undefined;
      if (!screen.isConnected) return;
      panel++;
      if (panel === panels.length) {
        start();
        return;
      }
      panels[panel].hidden = false;
      announcement.textContent = scene.panels[panel];
      remaining = PANEL_DURATIONS[panel];
      schedulePanel();
    }, remaining);
  }

  pause.addEventListener('click', () => {
    playTap();
    if (timer === undefined) {
      pause.textContent = 'Pause';
      schedulePanel();
    } else {
      remaining = Math.max(0, deadline - performance.now());
      cancelTimer();
      pause.textContent = 'Resume';
    }
  });

  screen.querySelector('#scene-start')!.addEventListener('click', () => {
    cancelTimer();
    playTap();
    start();
  });
  screen.querySelector('#scene-back')!.addEventListener('click', () => {
    cancelTimer();
    playTap();
    back();
  });
  screen.querySelector<HTMLElement>('#scene-title')!.focus({ preventScroll: true });
  schedulePanel();
}

export function victoryScene(piece: PieceId, celebration: boolean): string {
  return `<div class="victory-scene">
    ${sceneArt(piece, celebration)}
    <p class="victory-line">${SCENES[piece].victory}</p>
  </div>`;
}
