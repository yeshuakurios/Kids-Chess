import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function squareToCoord(sq: string): [number, number] {
  const file = FILES.indexOf(sq[0]);
  const rank = parseInt(sq[1], 10) - 1;
  return [file, rank];
}

export function coordToSquare(file: number, rank: number): string {
  return `${FILES[file]}${rank + 1}`;
}

/** Rook destinations sliding in 4 directions from an empty-otherwise board (no blockers needed for these drills). */
export function rookDestinations(from: string): Key[] {
  const [f, r] = squareToCoord(from);
  const out: Key[] = [];
  for (let i = 0; i < 8; i++) {
    if (i !== f) out.push(coordToSquare(i, r) as Key);
    if (i !== r) out.push(coordToSquare(f, i) as Key);
  }
  return out;
}

export function fenWithRookOnly(rookSquare: string): string {
  const board: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''));
  const [f, r] = squareToCoord(rookSquare);
  board[7 - r][f] = 'R';
  const rows = board.map((row) => {
    let fen = '';
    let empty = 0;
    for (const cell of row) {
      if (cell === '') {
        empty++;
      } else {
        if (empty) { fen += empty; empty = 0; }
        fen += cell;
      }
    }
    if (empty) fen += empty;
    return fen;
  });
  return `${rows.join('/')} w - - 0 1`;
}

export function createRookBoard(el: HTMLElement): Api {
  return Chessground(el, {
    orientation: 'white',
    coordinates: false,
    animation: { enabled: !matchMedia('(prefers-reduced-motion: reduce)').matches, duration: 220 },
    movable: { free: false, showDests: true },
    draggable: { enabled: true, showGhost: true },
    selectable: { enabled: true },
    drawable: { enabled: false }
  });
}

export function squareToPercent(sq: string): { left: number; top: number } {
  const [f, r] = squareToCoord(sq);
  return { left: f * 12.5, top: (7 - r) * 12.5 };
}

/** A square sharing a rank or file with `from` (so it is reachable in one rook move), excluding squares already used. */
export function reachableSquare(from: string, exclude: string[] = []): string {
  const options = rookDestinations(from).filter((sq) => !exclude.includes(sq));
  return options[Math.floor(Math.random() * options.length)];
}

/** A chain of `count` squares, each reachable by one rook move from the previous one, starting from `start`. */
export function buildReachableChain(start: string, count: number): string[] {
  const used = [start];
  const chain: string[] = [];
  let current = start;
  for (let i = 0; i < count; i++) {
    const next = reachableSquare(current, used);
    used.push(next);
    chain.push(next);
    current = next;
  }
  return chain;
}
