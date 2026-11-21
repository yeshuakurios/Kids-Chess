import './style.css';
import { renderHome } from './screens/home';
import { renderPieceLesson } from './screens/lesson-piece';
import { isPieceId } from './pieces';
import { initUpdateBar } from './update-bar';

initUpdateBar();

const app = document.getElementById('app')!;

function navigate(route: string): void {
  if (location.hash !== route) location.hash = route;
  else render();
}

function render(): void {
  const hash = location.hash || '#/home';
  const match = hash.match(/^#\/lesson\/([a-z]+)$/);
  if (match && isPieceId(match[1])) {
    renderPieceLesson(match[1], app, navigate);
  } else {
    renderHome(app, navigate);
  }
}

window.addEventListener('hashchange', render);
render();
