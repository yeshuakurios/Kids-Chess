export type PieceId = 'rook' | 'bishop' | 'knight' | 'queen' | 'pawn' | 'king';

export interface PieceInfo {
  id: PieceId;
  name: string;
  symbol: string;
  color: string;
  tagline: string;
  idleLine: string;
  confusedLines: string[];
  victoryLines: string[];
  available: boolean; // whether the full lesson exists yet
}

export type SafetyLessonId = 'check' | 'hanging';

export interface Progress {
  xp: number;
  gems: number;
  streak: number;
  lastPlayedDate: string | null; // yyyy-mm-dd
  masteredPieces: PieceId[];
  completedSafety: SafetyLessonId[];
  rankIndex: number;
}

export const RANKS = [
  'Pawn Private',
  'Pawn Sergeant',
  'Knight-in-Training',
  'Dizzy Bishop',
  'Rook of Doom',
  'Queen of Chaos',
  'Grand Chicken Master'
];

export const XP_PER_RANK = 50;
