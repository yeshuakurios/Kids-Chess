import { mascotArt } from '../mascots';
import { playTap } from '../sound';
import type { PieceId } from '../types';

interface Scene {
  title: string;
  setup: string;
  punchline: string;
  victory: string;
  prop: string;
}

const SCENES: Record<PieceId, Scene> = {
  rook: {
    title: 'Castle on the Move',
    setup: 'Why did the Rook bring a ruler to chess class?',
    punchline: 'To get straight A’s!',
    victory: 'My victory lap is a straight line. I’ll walk back later.',
    prop: '📏'
  },
  bishop: {
    title: 'The Diagonal Disco',
    setup: 'Why did the Bishop cross the dance floor?',
    punchline: 'To get to the other side… diagonally!',
    victory: 'I’d take a bow, darling, but only at an angle.',
    prop: '🪩'
  },
  knight: {
    title: 'The Great Knight Jump',
    setup: 'What’s a Knight’s favorite letter?',
    punchline: 'L! It’s the only one I can land on.',
    victory: 'I stuck the L-anding!',
    prop: '🥕'
  },
  queen: {
    title: 'Her Majesty Takes the Stage',
    setup: 'Why did the Queen make a terrible GPS?',
    punchline: 'Every direction was ‘Your Majesty’s Way.’',
    victory: 'Please send my fan mail in all eight directions.',
    prop: '🎤'
  },
  pawn: {
    title: 'The Tiny Parade',
    setup: 'What do pawns pack for a parade?',
    punchline: 'March-mallows!',
    victory: 'Small steps. Big cheers. Extremely big marshmallows.',
    prop: '🥁'
  },
  king: {
    title: 'The Royal Tiptoe',
    setup: 'Why does the King wear slippers?',
    punchline: 'For sneak attacks on the nap room. One square at a time!',
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

export function renderCutscene(root: HTMLElement, piece: PieceId, start: () => void, back: () => void): void {
  const scene = SCENES[piece];
  root.innerHTML = `
    <section class="screen cutscene-screen" aria-labelledby="scene-title">
      <button type="button" class="back-btn" id="scene-back" aria-label="Back to the path">←</button>
      ${sceneArt(piece)}
      <h1 class="cutscene-title" id="scene-title" tabindex="-1">${scene.title}</h1>
      <div class="scene-dialogue">
        <p>${scene.setup}</p>
        <p class="scene-punchline" aria-live="polite"></p>
      </div>
      <div class="scene-actions">
        <button type="button" class="primary-btn" id="scene-reveal">Tell me!</button>
        <button type="button" class="scene-skip" id="scene-start">Skip to the lesson</button>
      </div>
    </section>
  `;

  const reveal = root.querySelector<HTMLButtonElement>('#scene-reveal')!;
  const skip = root.querySelector<HTMLButtonElement>('#scene-start')!;
  function startWithSound(): void {
    playTap();
    start();
  }

  reveal.addEventListener('click', () => {
    playTap();
    root.querySelector('.scene-punchline')!.textContent = scene.punchline;
    root.querySelector('.scene-art')!.classList.add('scene-revealed');
    reveal.textContent = 'Watch the moves';
    skip.hidden = true;
    reveal.addEventListener('click', startWithSound, { once: true });
  }, { once: true });
  skip.addEventListener('click', startWithSound, { once: true });
  root.querySelector('#scene-back')!.addEventListener('click', () => {
    playTap();
    back();
  });
  root.querySelector<HTMLElement>('#scene-title')!.focus({ preventScroll: true });
}

export function victoryScene(piece: PieceId, celebration: boolean): string {
  return `<div class="victory-scene">
    ${sceneArt(piece, celebration)}
    <p class="victory-line">${SCENES[piece].victory}</p>
  </div>`;
}
