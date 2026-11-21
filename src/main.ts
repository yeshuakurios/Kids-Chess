import './style.css';
import { renderHome } from './screens/home';
import { renderLessonRook } from './screens/lesson-rook';

const app = document.getElementById('app')!;

function navigate(route: string): void {
  if (location.hash !== route) location.hash = route;
  else render();
}

function render(): void {
  const hash = location.hash || '#/home';
  if (hash.startsWith('#/lesson/rook')) {
    renderLessonRook(app, navigate);
  } else {
    renderHome(app, navigate);
  }
}

window.addEventListener('hashchange', render);
render();
