import { PIECES } from '../pieces';
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
      <div class="node-symbol">${piece.symbol}</div>
      <div class="node-label">${piece.name}</div>
      ${mastered ? '<div class="node-stamp">✓</div>' : ''}
      ${!unlocked ? '<div class="node-lock">🔒</div>' : ''}
      ${unlocked && !piece.available && !mastered ? '<div class="node-soon">coming soon</div>' : ''}
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
    </div>
  `;

  root.querySelectorAll<HTMLElement>('.tree-node').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.clickable !== 'true') return;
      navigate(`#/lesson/${el.dataset.piece}`);
    });
  });
}
