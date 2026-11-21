import type { PieceId } from './types';

type MascotArt = { light: string; shade: string; accent: string; silhouette: string };

const ART: Record<PieceId, MascotArt> = {
  rook: {
    light: '#fff3d6', shade: '#eacb93', accent: '#6ee5ff',
    silhouette: '<path d="M56 31h21v18h13V25h24v24h13V31h21v36l-15 14 8 62H63l8-62-15-14Z"/>'
  },
  bishop: {
    light: '#ffc2e6', shade: '#e47bb8', accent: '#fff08c',
    silhouette: '<path d="M65 143l12-37Q56 94 61 73q5-22 41-52l22 20-16 19 7 6 16-17q18 15 14 34-3 16-21 23l14 37Z"/><circle cx="102" cy="20" r="8"/>'
  },
  knight: {
    light: '#a6f5ae', shade: '#64c78e', accent: '#ffdd78',
    silhouette: '<path d="M63 143l12-30q-20-24-11-53l5-31 21 13 17-15 7 25q18 7 25 22l15 19q6 14-11 22l-21-10 13 38Z"/><path d="M65 56q-22 23-11 57l16-8" fill="#3b986a"/>'
  },
  queen: {
    light: '#fff0a6', shade: '#e9a752', accent: '#fd89b7',
    silhouette: '<path d="M63 143l12-56-14-43 27 17 14-34 14 34 27-17-14 43 12 56Z"/><circle cx="61" cy="42" r="7"/><circle cx="143" cy="42" r="7"/><circle cx="102" cy="25" r="8"/>'
  },
  pawn: {
    light: '#b8f4ff', shade: '#68c3e2', accent: '#ffac85',
    silhouette: '<path d="M64 143q2-23 22-45a34 34 0 1 1 32 0q20 22 22 45Z"/><path d="M76 104h52" fill="none" stroke="#5bb0d3" stroke-width="8"/>'
  },
  king: {
    light: '#e0c9ff', shade: '#ab85e6', accent: '#ffd87f',
    silhouette: '<path d="M66 143l11-46q-22-9-21-29 2-25 32-24h7V32H83V20h12V9h14v11h12v12h-12v12h7q30-1 32 24 1 20-21 29l11 46Z"/>'
  }
};

export function mascotArt(id: PieceId): string {
  const { light, shade, accent, silhouette } = ART[id];
  const faceX = id === 'knight' ? 109 : 102;
  const faceY = id === 'pawn' ? 67 : 88;
  const mouth = id === 'king'
    ? '<ellipse cx="0" cy="24" rx="8" ry="6" fill="#292344"/>'
    : '<path d="M-9 21q9 12 18 0Z" fill="#292344" stroke="#292344" stroke-linejoin="round" stroke-width="2"/>';
  return `<svg class="mascot-art" viewBox="0 0 204 176" aria-hidden="true" focusable="false">
    <ellipse cx="102" cy="159" rx="61" ry="10" fill="#211938" opacity=".2"/>
    <g stroke="#292344" stroke-width="5" stroke-linejoin="round">
      <path d="M69 107q-20-1-27-17m93 17q17-2 24-18" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="87" r="8" fill="${light}"/><circle cx="161" cy="87" r="8" fill="${light}"/>
      <g fill="${light}">${silhouette}</g>
      <rect x="58" y="136" width="88" height="17" rx="8" fill="${shade}"/>
    </g>
    <path d="M83 125h38" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
    <g transform="translate(${faceX} ${faceY})">
      <ellipse cx="-25" cy="13" rx="7" ry="4" fill="#e86c85" opacity=".65"/>
      <ellipse cx="25" cy="13" rx="7" ry="4" fill="#e86c85" opacity=".65"/>
      <ellipse cx="-14" cy="0" rx="8" ry="10" fill="#292344"/>
      <ellipse cx="14" cy="0" rx="8" ry="10" fill="#292344"/>
      <circle cx="-12" cy="-3" r="2.8" fill="white"/><circle cx="16" cy="-3" r="2.8" fill="white"/>
      ${mouth}
    </g>
  </svg>`;
}
