import type { PieceInfo } from './types';

export const PIECES: PieceInfo[] = [
  {
    id: 'rook',
    name: 'Rook',
    symbol: '♜',
    color: '#4a6fd4',
    tagline: "I don't do diagonals. I don't do zigzags. I go straight. That's it.",
    idleLine: "Take your time, I'm not going anywhere... well, I mean, I could go several squares, but you know what I mean.",
    confusedLines: ["Nah, I don't bend like that!", 'Straight lines only, friend.', "That's not my street."],
    victoryLines: ['Straight to the point, as always!', "Told you, straight lines win."],
    available: true
  },
  {
    id: 'bishop',
    name: 'Bishop',
    symbol: '♝',
    color: '#c54f8c',
    tagline: 'I only walk in style. Diagonals, darling.',
    idleLine: "Waiting is so... diagonal of you.",
    confusedLines: ["That's not a diagonal, sweetie."],
    victoryLines: ['Fabulous as always.'],
    available: false
  },
  {
    id: 'knight',
    name: 'Knight',
    symbol: '♞',
    color: '#3fa16c',
    tagline: "I don't do straight lines. Hop, skip, surprise!",
    idleLine: 'Hop hop... just thinking about my next weird move.',
    confusedLines: ["Nope! I only move in my special L-shape."],
    victoryLines: ['Ta-da! Bet you did not see that coming.'],
    available: false
  },
  {
    id: 'queen',
    name: 'Queen',
    symbol: '♛',
    color: '#d4a63f',
    tagline: 'I do everything everyone else does. Just better.',
    idleLine: 'I am ready whenever you are.',
    confusedLines: ['Not even I can move there.'],
    victoryLines: ['Obviously.'],
    available: false
  },
  {
    id: 'pawn',
    name: 'Pawn Squad',
    symbol: '♟',
    color: '#9a9a9a',
    tagline: 'We are small, but mighty! Forward march!',
    idleLine: 'Are we there yet?',
    confusedLines: ['We only go forward, mostly!'],
    victoryLines: ['Pawn power!'],
    available: false
  },
  {
    id: 'king',
    name: 'King',
    symbol: '♚',
    color: '#7a3fd4',
    tagline: 'I am very important and also very nervous about everything.',
    idleLine: 'Is it safe over there? Is it SAFE?',
    confusedLines: ["I can only go one square. I am precious cargo."],
    victoryLines: ['Phew. I made it.'],
    available: false
  }
];

export function pieceById(id: string): PieceInfo | undefined {
  return PIECES.find((p) => p.id === id);
}
