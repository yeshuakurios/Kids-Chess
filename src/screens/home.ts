import { PIECES } from '../pieces';
import { mascotArt } from '../mascots';
import { SAFETY_LESSONS } from '../safety';
import { loadProgress, currentRankTitle, xpIntoRank } from '../state';
import type { Progress } from '../types';

function nodeHtml(p: Progress, index: number): string {
  const piece = PIECES[index];
  const unlocked = index === 0 || p.masteredPieces.includes(PIECES[index - 1].id);
  const mastered = p.masteredPieces.includes(piece.id);
  const state = mastered ? 'mastered' : unlocked ? 'unlocked' : 'locked';
  const clickable = unlocked && piece.available;
  return `
    <div class="tree-node ${state}" data-piece="${piece.id}" data-clickable="${clickable}" style="--piece-color:${piece.color}">
      <div class="node-symbol">${mascotArt(piece.id)}</div>
      <div class="node-label">${piece.name}</div>
      ${mastered ? '<div class="node-stamp">✓</div>' : ''}
      ${!unlocked ? '<div class="node-lock">🔒</div>' : ''}
      ${unlocked && !piece.available && !mastered ? '<div class="node-soon">coming soon</div>' : ''}
    </div>`;
}

function safetyNodeHtml(p: Progress, index: number, allPiecesMastered: boolean): string {
  const lesson = SAFETY_LESSONS[index];
  const unlocked = index === 0 ? allPiecesMastered : p.completedSafety.includes(SAFETY_LESSONS[index - 1].id);
  const done = p.completedSafety.includes(lesson.id);
  const state = done ? 'mastered' : unlocked ? 'unlocked' : 'locked';
  return `
    <div class="tree-node ${state}" data-safety="${lesson.id}" data-clickable="${unlocked}" style="--piece-color:${lesson.color}">
      <div class="node-symbol">${lesson.symbol}</div>
      <div class="node-label">${lesson.name}</div>
      ${done ? '<div class="node-stamp">✓</div>' : ''}
      ${!unlocked ? '<div class="node-lock">🔒</div>' : ''}
    </div>`;
}

export function renderHome(root: HTMLElement, navigate: (route: string) => void): void {
  const p = loadProgress();
  const rank = currentRankTitle(p);
  const { into, needed } = xpIntoRank(p);
  const pct = Math.round((into / needed) * 100);

  root.innerHTML = `
    <div class="screen home-screen">
      <div class="hud">
        <div class="hud-streak">🔥 ${p.streak}</div>
        <div class="hud-gems">💎 ${p.gems}</div>
      </div>
      <div class="rank-card">
        <div class="rank-title">${rank}</div>
        <div class="xp-bar"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
        <div class="xp-caption">${into} / ${needed} XP to next rank</div>
      </div>
      <h1 class="path-title">Piece Academy</h1>
      <div class="skill-tree">
        ${PIECES.map((_, i) => nodeHtml(p, i)).join('')}
      </div>
      <h1 class="path-title">Check &amp; Safety</h1>
      <div class="skill-tree">
        ${SAFETY_LESSONS.map((_, i) => safetyNodeHtml(p, i, p.masteredPieces.length === PIECES.length)).join('')}
      </div>
    </div>
  `;

  root.querySelectorAll<HTMLElement>('.tree-node').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.clickable !== 'true') return;
      if (el.dataset.safety) navigate(`#/safety/${el.dataset.safety}`);
      else navigate(`#/lesson/${el.dataset.piece}`);
    });
  });
}
