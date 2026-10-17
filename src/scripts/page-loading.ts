import { skeletonize } from './skeleton';

let restore: (() => void) | undefined;
function reset() { restore?.(); restore = undefined; }
function start() { reset(); restore = skeletonize(document.body); }
// Keep normal browser navigation, history, downloads and modified clicks intact.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href);
  if (destination.origin !== location.origin || destination.pathname === location.pathname && destination.search === location.search) return;
  if (!['http:', 'https:'].includes(destination.protocol)) return;
  start();
});
document.addEventListener('select-change', event => {
  if ((event.target as HTMLElement).id !== 'browse-page') return;
  const destination=new URL((event as CustomEvent<{value:string}>).detail.value,location.href);
  if(destination.href!==location.href) start();
});
window.addEventListener('pageshow', reset);
window.addEventListener('pagehide', reset);
document.addEventListener('keydown', event => { if (event.key === 'Escape') reset(); });
