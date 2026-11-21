/** Stage 2 content: "Check & safety" — hand-curated, verified with chess.js (see git history). */

import type { SafetyLessonId } from './types';

export interface CheckPuzzle {
  fen: string;
}

/** White king is in check in every position; every legal move escapes it (that is what "legal" means when in check). */
export const CHECK_PUZZLES: CheckPuzzle[] = [
  { fen: '4rk2/8/8/8/8/8/8/4K3 w - - 0 1' },
  { fen: '5k2/8/8/8/8/8/4r3/4K3 w - - 0 1' },
  { fen: '4qk2/8/8/8/R7/8/8/4K3 w - - 0 1' },
  { fen: '5k2/8/8/3R4/8/8/3b4/4K3 w - - 0 1' },
  { fen: '5k2/8/8/8/8/3n4/8/4K3 w - - 0 1' },
  { fen: '5k2/8/8/8/3R4/8/8/q3K3 w - - 0 1' }
];

export interface HangPuzzle {
  fen: string;
  /** The one white square that is attacked and undefended. */
  hangingSquare: string;
  /** All tappable white (non-king) squares on the board, for building the board UI. */
  whiteSquares: string[];
}

export const HANG_PUZZLES: HangPuzzle[] = [
  { fen: '6k1/8/8/6R1/2b5/8/4Q3/K7 w - - 0 1', hangingSquare: 'e2', whiteSquares: ['e2', 'g5'] },
  { fen: '6k1/8/5b2/R7/3n4/8/8/K7 w - - 0 1', hangingSquare: 'd4', whiteSquares: ['d4', 'a5'] },
  { fen: '3q2k1/8/8/7b/8/8/3N4/K7 w - - 0 1', hangingSquare: 'd2', whiteSquares: ['d2', 'h5'] },
  { fen: '6k1/8/8/b7/3n4/5R2/8/K7 w - - 0 1', hangingSquare: 'f3', whiteSquares: ['f3', 'a5'] },
  { fen: '6k1/8/8/q7/8/8/3N4/4R2K w - - 0 1', hangingSquare: 'd2', whiteSquares: ['d2', 'e1'] },
  { fen: '6k1/8/5b2/8/7R/8/Q7/7K w - - 0 1', hangingSquare: 'h4', whiteSquares: ['h4', 'a2'] }
];

export const SAFETY_LESSONS: { id: SafetyLessonId; name: string; symbol: string; color: string }[] = [
  { id: 'check', name: 'Check!', symbol: '⚠️', color: '#d4473f' },
  { id: 'hanging', name: 'Free Pieces', symbol: '🎯', color: '#d4a63f' }
];

/** Re-checks every puzzle's hand-verified claim at runtime, so a bad edit fails loudly instead of silently. */
export function validateSafetyContent(ChessCtor: new (fen?: string) => {
  inCheck(): boolean;
  isAttacked(square: string, color: 'w' | 'b'): boolean;
}): void {
  for (const puzzle of CHECK_PUZZLES) {
    const game = new ChessCtor(puzzle.fen);
    if (!game.inCheck()) throw new Error(`Check puzzle not actually in check: ${puzzle.fen}`);
  }
  for (const puzzle of HANG_PUZZLES) {
    const game = new ChessCtor(puzzle.fen);
    const hanging = puzzle.whiteSquares.filter(
      (sq) => game.isAttacked(sq, 'b') && !game.isAttacked(sq, 'w')
    );
    if (hanging.length !== 1 || hanging[0] !== puzzle.hangingSquare) {
      throw new Error(`Hang puzzle mismatch (found ${JSON.stringify(hanging)}): ${puzzle.fen}`);
    }
  }
}
