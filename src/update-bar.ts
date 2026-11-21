import { registerSW } from 'virtual:pwa-register';

/**
 * A fixed-position overlay, never part of document flow — this must never
 * shift page layout, since a layout shift around the board would leave
 * Chessground's cached bounds stale (see AGENTS.md's redrawAll note).
 */
function showUpdateBar(onReload: () => void): void {
  if (document.getElementById('update-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'update-bar';
  bar.innerHTML = `
    <span>A new version is ready!</span>
    <button id="update-reload-btn">Reload</button>
  `;
  document.body.appendChild(bar);
  requestAnimationFrame(() => bar.classList.add('show'));
  bar.querySelector('#update-reload-btn')!.addEventListener('click', onReload);
}

export function initUpdateBar(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      showUpdateBar(() => updateSW(true));
    },
    onRegisteredSW(_url, registration) {
      // Check for an update whenever the app regains focus/visibility,
      // not just on first load — she may leave this installed for weeks.
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
    }
  });
}
