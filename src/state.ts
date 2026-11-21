import type { Progress, PieceId, SafetyLessonId } from './types';
import { XP_PER_RANK, RANKS } from './types';

const STORAGE_KEY = 'kids-chess-progress-v1';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(): Progress {
  return { xp: 0, gems: 0, streak: 0, lastPlayedDate: null, masteredPieces: [], completedSafety: [], rankIndex: 0 };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** Call once per day the app is opened and played. Returns whether the streak grew. */
export function touchStreak(p: Progress): boolean {
  const today = todayStr();
  if (p.lastPlayedDate === today) return false;
  if (p.lastPlayedDate) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.streak = p.lastPlayedDate === yesterday ? p.streak + 1 : 1;
  } else {
    p.streak = 1;
  }
  p.lastPlayedDate = today;
  saveProgress(p);
  return true;
}

export function awardXp(p: Progress, amount: number): { leveledUp: boolean } {
  p.xp += amount;
  const newRankIndex = Math.min(RANKS.length - 1, Math.floor(p.xp / XP_PER_RANK));
  const leveledUp = newRankIndex > p.rankIndex;
  p.rankIndex = newRankIndex;
  saveProgress(p);
  return { leveledUp };
}

export function awardGems(p: Progress, amount: number): void {
  p.gems += amount;
  saveProgress(p);
}

export function markMastered(p: Progress, piece: PieceId): void {
  if (!p.masteredPieces.includes(piece)) {
    p.masteredPieces.push(piece);
    saveProgress(p);
  }
}

export function markSafetyComplete(p: Progress, lesson: SafetyLessonId): void {
  if (!p.completedSafety.includes(lesson)) {
    p.completedSafety.push(lesson);
    saveProgress(p);
  }
}

export function currentRankTitle(p: Progress): string {
  return RANKS[p.rankIndex];
}

export function xpIntoRank(p: Progress): { into: number; needed: number } {
  return { into: p.xp % XP_PER_RANK, needed: XP_PER_RANK };
}
