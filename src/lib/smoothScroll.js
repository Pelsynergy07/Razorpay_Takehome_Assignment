/**
 * Native `scrollIntoView({ behavior: 'smooth' })` has no way to control its
 * duration — it's a fast, fixed browser animation. This gives the chat
 * transcript a deliberately paced scroll (instead of an abrupt snap) when a
 * new message lands, with a controllable duration.
 */

// Newton-Raphson solve for the same cubic-bezier curve as the app's
// --ease-decelerate design token (0.16, 1, 0.3, 1) — a quick start that
// settles in gently — so the scroll reads as one more of the app's
// deliberately-eased entrances rather than a generic/linear glide.
function cubicBezier(x1, y1, x2, y2) {
  const a = (p1, p2) => 1 - 3 * p2 + 3 * p1;
  const b = (p1, p2) => 3 * p2 - 6 * p1;
  const c = (p1) => 3 * p1;

  const bezierX = (t) => ((a(x1, x2) * t + b(x1, x2)) * t + c(x1)) * t;
  const bezierY = (t) => ((a(y1, y2) * t + b(y1, y2)) * t + c(y1)) * t;
  const derivativeX = (t) => 3 * a(x1, x2) * t * t + 2 * b(x1, x2) * t + c(x1);

  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = bezierX(t) - x;
      if (Math.abs(dx) < 1e-4) break;
      const d = derivativeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return bezierY(t);
  };
}

const easeDecelerate = cubicBezier(0.16, 1, 0.3, 1);

function animateScrollTop(container, from, to, duration) {
  const distance = to - from;
  if (Math.abs(distance) < 1) return;

  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    container.scrollTop = from + distance * easeDecelerate(progress);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Scrolls to an arbitrary target scrollTop instead of all the way down. */
export function smoothScrollTo(container, targetTop, duration = 1400) {
  if (!container) return;
  animateScrollTop(container, container.scrollTop, targetTop, duration);
}

export function smoothScrollToBottom(container, duration = 1400) {
  if (!container) return;
  const end = container.scrollHeight - container.clientHeight;
  animateScrollTop(container, container.scrollTop, end, duration);
}
