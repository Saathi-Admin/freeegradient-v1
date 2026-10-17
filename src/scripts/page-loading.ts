import { skeletonize } from './skeleton';

// Run in the destination document; native navigation preserves links and history.
let restore: (() => void) | undefined = skeletonize(document.body);
document.documentElement.removeAttribute('data-page-loading');

function reset() {
  restore?.();
  restore = undefined;
}

async function reveal() {
  const images = [...document.images].filter(image => {
    const bounds = image.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && bounds.top < innerHeight && bounds.bottom > 0;
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.allSettled([document.fonts.ready, ...images.map(image => image.decode())]),
    new Promise<void>(resolve => { timeout = setTimeout(resolve, 6000); }),
  ]);
  clearTimeout(timeout);
  // Paint the destination layout before revealing its content.
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  reset();
}

void reveal();
window.addEventListener('pagehide', reset);
window.addEventListener('pageshow', event => { if (event.persisted) reset(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
