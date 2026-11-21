import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import type { PieceId } from './types';
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

function inBounds(f: number, r: number): boolean {
  return f >= 0 && f < 8 && r >= 0 && r < 8;
}

function slide(from: string, directions: [number, number][]): Key[] {
  const [f, r] = squareToCoord(from);
  const out: Key[] = [];
  for (const [df, dr] of directions) {
    let nf = f + df;
    let nr = r + dr;
    while (inBounds(nf, nr)) {
      out.push(coordToSquare(nf, nr) as Key);
      nf += df;
      nr += dr;
    }
  }
  return out;
}

const ROOK_DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP_DIRS: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const QUEEN_DIRS = [...ROOK_DIRS, ...BISHOP_DIRS];
const KNIGHT_OFFSETS: [number, number][] = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];
const KING_OFFSETS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]
];

export function rookDestinations(from: string): Key[] {
  return slide(from, ROOK_DIRS);
}
export function bishopDestinations(from: string): Key[] {
  return slide(from, BISHOP_DIRS);
}
export function queenDestinations(from: string): Key[] {
  return slide(from, QUEEN_DIRS);
}
function hop(from: string, offsets: [number, number][]): Key[] {
  const [f, r] = squareToCoord(from);
  const out: Key[] = [];
  for (const [df, dr] of offsets) {
    const nf = f + df;
    const nr = r + dr;
    if (inBounds(nf, nr)) out.push(coordToSquare(nf, nr) as Key);
  }
  return out;
}
export function knightDestinations(from: string): Key[] {
  return hop(from, KNIGHT_OFFSETS);
}
export function kingDestinations(from: string): Key[] {
  return hop(from, KING_OFFSETS);
}
/** Forward-only, no captures: 1 square, or 2 from the true starting rank (rank 2). Empty at rank 8. */
export function pawnDestinations(from: string): Key[] {
  const [f, r] = squareToCoord(from);
  if (r >= 7) return [];
  const out: Key[] = [coordToSquare(f, r + 1) as Key];
  if (r === 1 && r + 2 <= 7) out.push(coordToSquare(f, r + 2) as Key);
  return out;
}

export type DestinationsFn = (from: string) => Key[];

export const DESTINATIONS: Record<PieceId, DestinationsFn> = {
  rook: rookDestinations,
  bishop: bishopDestinations,
  queen: queenDestinations,
  knight: knightDestinations,
  king: kingDestinations,
  pawn: pawnDestinations
};

const SYMBOL: Record<PieceId, string> = {
  rook: 'R',
  bishop: 'B',
  queen: 'Q',
  knight: 'N',
  king: 'K',
  pawn: 'P'
};

export function fenWithPieceOnly(piece: PieceId, square: string): string {
  const board: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''));
  const [f, r] = squareToCoord(square);
  board[7 - r][f] = SYMBOL[piece];
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

export function createPieceBoard(el: HTMLElement): Api {
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

/** A square reachable in one move from `from` per `destinations`, excluding squares already used. Undefined if none remain. */
export function reachableSquare(from: string, destinations: DestinationsFn, exclude: string[] = []): string | undefined {
  const options = destinations(from).filter((sq) => !exclude.includes(sq));
  if (options.length === 0) return undefined;
  return options[Math.floor(Math.random() * options.length)];
}

/** A chain of up to `count` squares, each reachable by one move from the previous one. Shorter if it runs out of room (e.g. a pawn nearing rank 8). */
export function buildReachableChain(start: string, count: number, destinations: DestinationsFn): string[] {
  const used = [start];
  const chain: string[] = [];
  let current = start;
  for (let i = 0; i < count; i++) {
    const next = reachableSquare(current, destinations, used);
    if (!next) break;
    used.push(next);
    chain.push(next);
    current = next;
  }
  return chain;
}

/** A random square that still has at least one destination (matters for the pawn, which runs out near rank 8). */
export function randomStartSquare(destinations: DestinationsFn): string {
  while (true) {
    const sq = coordToSquare(Math.floor(Math.random() * 8), Math.floor(Math.random() * 8));
    if (destinations(sq).length > 0) return sq;
  }
}
