/**
 * Short synthesized sound effects (Web Audio API, no shipped audio files —
 * zero asset weight, zero licensing concerns, per AGENTS.md).
 */

const MUTE_KEY = 'kids-chess-muted-v1';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* best effort */
  }
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

interface Note {
  /** Hz */
  freq: number;
  /** seconds from now */
  start: number;
  /** seconds */
  dur: number;
  type?: OscillatorType;
  /** peak gain, 0-1 */
  gain?: number;
}

function playNotes(notes: Note[]): void {
  if (isMuted()) return;
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const n of notes) {
    const osc = audio.createOscillator();
    const gainNode = audio.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.freq;
    const peak = n.gain ?? 0.18;
    const t0 = now + n.start;
    const t1 = t0 + n.dur;
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.015, n.dur / 4));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.connect(gainNode);
    gainNode.connect(audio.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}

/** Generic button/back-arrow tap. */
export function playTap(): void {
  playNotes([{ freq: 600, start: 0, dur: 0.05, type: 'sine', gain: 0.1 }]);
}

/** A piece slides to a new square. */
export function playMove(): void {
  playNotes([{ freq: 440, start: 0, dur: 0.08, type: 'sine', gain: 0.15 }]);
}

/** A coin or piece is captured. */
export function playCapture(): void {
  playNotes([
    { freq: 300, start: 0, dur: 0.1, type: 'square', gain: 0.18 },
    { freq: 180, start: 0.03, dur: 0.12, type: 'square', gain: 0.14 }
  ]);
}

/** An illegal or off-target move/tap. */
export function playIllegal(): void {
  playNotes([{ freq: 140, start: 0, dur: 0.18, type: 'sawtooth', gain: 0.14 }]);
}

/** Right answer: a legal escape, the hanging piece spotted, a quiz tap, etc. */
export function playCorrect(): void {
  playNotes([
    { freq: 523.25, start: 0, dur: 0.12, type: 'sine', gain: 0.18 },
    { freq: 659.25, start: 0.1, dur: 0.16, type: 'sine', gain: 0.18 }
  ]);
}

/** Wrong answer. */
export function playWrong(): void {
  playNotes([
    { freq: 329.63, start: 0, dur: 0.12, type: 'sine', gain: 0.16 },
    { freq: 261.63, start: 0.1, dur: 0.18, type: 'sine', gain: 0.16 }
  ]);
}

/** A gem or XP is earned. */
export function playGem(): void {
  playNotes([
    { freq: 784, start: 0, dur: 0.08, type: 'triangle', gain: 0.15 },
    { freq: 988, start: 0.06, dur: 0.08, type: 'triangle', gain: 0.15 },
    { freq: 1175, start: 0.12, dur: 0.12, type: 'triangle', gain: 0.15 }
  ]);
}

/** Rank up. */
export function playLevelUp(): void {
  playNotes([
    { freq: 523.25, start: 0, dur: 0.1, type: 'square', gain: 0.16 },
    { freq: 659.25, start: 0.09, dur: 0.1, type: 'square', gain: 0.16 },
    { freq: 784, start: 0.18, dur: 0.1, type: 'square', gain: 0.16 },
    { freq: 1046.5, start: 0.27, dur: 0.22, type: 'square', gain: 0.18 }
  ]);
}

/** The daily streak grows. */
export function playStreak(): void {
  playNotes([
    { freq: 659.25, start: 0, dur: 0.1, type: 'triangle', gain: 0.16 },
    { freq: 880, start: 0.08, dur: 0.18, type: 'triangle', gain: 0.18 }
  ]);
}
