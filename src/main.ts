import './style.css';
import { renderHome } from './screens/home';
import { renderPieceLesson } from './screens/lesson-piece';
import { renderCheckLesson } from './screens/lesson-check';
import { renderHangingLesson } from './screens/lesson-hanging';
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
  const pieceMatch = hash.match(/^#\/lesson\/([a-z]+)$/);
  const safetyMatch = hash.match(/^#\/safety\/(check|hanging)$/);
  if (pieceMatch && isPieceId(pieceMatch[1])) {
    renderPieceLesson(pieceMatch[1], app, navigate);
  } else if (safetyMatch && safetyMatch[1] === 'check') {
    renderCheckLesson(app, navigate);
  } else if (safetyMatch && safetyMatch[1] === 'hanging') {
    renderHangingLesson(app, navigate);
  } else {
    renderHome(app, navigate);
  }
}

window.addEventListener('hashchange', render);
render();
