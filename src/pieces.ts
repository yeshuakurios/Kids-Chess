import rookMascot from './art/rook.svg';
import type { PieceInfo, PieceId } from './types';

interface PieceAcademyInfo extends PieceInfo {
  /** Narration during the auto-played movement demo. */
  moveCaption: string;
  /** Square the demo/explore step starts the piece on. */
  demoStart: string;
  /** Auto-played demo moves; need not return to the start square. */
  demoSequence: [string, string][];
}

export const PIECES: PieceAcademyInfo[] = [
  {
    id: 'rook',
    name: 'Rook',
    symbol: '♜',
    mascot: rookMascot,
    color: '#4a6fd4',
    tagline: "I don't do diagonals. I don't do zigzags. I go straight. That's it.",
    moveCaption: 'Straight lines — up, down, left, right. As far as I want!',
    idleLine: "Take your time, I'm not going anywhere... well, I mean, I could go several squares, but you know what I mean.",
    confusedLines: ["Nah, I don't bend like that!", 'Straight lines only, friend.', "That's not my street."],
    victoryLines: ['Straight to the point, as always!', 'Told you, straight lines win.'],
    demoStart: 'd4',
    demoSequence: [['d4', 'd7'], ['d7', 'd4'], ['d4', 'a4'], ['a4', 'd4']],
    available: true
  },
  {
    id: 'bishop',
    name: 'Bishop',
    symbol: '♝',
    color: '#c54f8c',
    tagline: 'I only walk in style. Diagonals, darling.',
    moveCaption: 'Diagonals only — but as far as I like!',
    idleLine: 'Waiting is so... diagonal of you.',
    confusedLines: ["That's not a diagonal, sweetie.", 'Straight lines are for rooks, darling.'],
    victoryLines: ['Fabulous as always.', 'Style points: ten out of ten.'],
    demoStart: 'd4',
    demoSequence: [['d4', 'g7'], ['g7', 'd4'], ['d4', 'a1'], ['a1', 'd4']],
    available: true
  },
  {
    id: 'knight',
    name: 'Knight',
    symbol: '♞',
    color: '#3fa16c',
    tagline: "I don't do straight lines. Hop, skip, surprise!",
    moveCaption: 'An L-shape — two one way, then one sideways. Hop!',
    idleLine: 'Hop hop... just thinking about my next weird move.',
    confusedLines: ["Nope! I only move in my special L-shape.", "That's not an L!"],
    victoryLines: ['Ta-da! Bet you did not see that coming.', 'Hopped right over there!'],
    demoStart: 'd4',
    demoSequence: [['d4', 'f5'], ['f5', 'd4'], ['d4', 'b5'], ['b5', 'd4']],
    available: true
  },
  {
    id: 'queen',
    name: 'Queen',
    symbol: '♛',
    color: '#d4a63f',
    tagline: 'I do everything everyone else does. Just better.',
    moveCaption: 'Straight lines AND diagonals, as far as I want!',
    idleLine: 'I am ready whenever you are.',
    confusedLines: ['Not even I can move there.', 'Try again — straight or diagonal only.'],
    victoryLines: ['Obviously.', 'Was there ever any doubt?'],
    demoStart: 'd4',
    demoSequence: [['d4', 'd7'], ['d7', 'd4'], ['d4', 'g7'], ['g7', 'd4']],
    available: true
  },
  {
    id: 'pawn',
    name: 'Pawn Squad',
    symbol: '♟',
    color: '#9a9a9a',
    tagline: 'We are small, but mighty! Forward march!',
    moveCaption: 'Straight ahead, one square — or two on our very first move!',
    idleLine: 'Are we there yet?',
    confusedLines: ['We only go forward, mostly!', 'Can\'t go back now — pawns never retreat!'],
    victoryLines: ['Pawn power!', 'One step closer to the top!'],
    demoStart: 'd2',
    demoSequence: [['d2', 'd4'], ['d4', 'd5'], ['d5', 'd6']],
    available: true
  },
  {
    id: 'king',
    name: 'King',
    symbol: '♚',
    color: '#7a3fd4',
    tagline: 'I am very important and also very nervous about everything.',
    moveCaption: 'Just one square, any direction. Gotta stay careful!',
    idleLine: 'Is it safe over there? Is it SAFE?',
    confusedLines: ['I can only go one square. I am precious cargo.', 'One square! That is FAR for me!'],
    victoryLines: ['Phew. I made it.', 'Safe and sound!'],
    demoStart: 'd4',
    demoSequence: [['d4', 'd5'], ['d5', 'd4'], ['d4', 'e4'], ['e4', 'd4']],
    available: true
  }
];

export function pieceById(id: string): PieceAcademyInfo | undefined {
  return PIECES.find((p) => p.id === id);
}

export function isPieceId(id: string): id is PieceId {
  return PIECES.some((p) => p.id === id);
}

export function pieceArt(piece: PieceInfo): string {
  return piece.mascot
    ? `<img class="piece-art" src="${piece.mascot}" alt="" width="64" height="64">`
    : piece.symbol;
}
