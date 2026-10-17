/** Mask the actual UI without changing its layout, dimensions or typography. */
export function skeletonize(root: HTMLElement) {
  const busy = root.getAttribute('aria-busy'), inert = root.inert;
  const spans: HTMLSpanElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    const text = walker.currentNode as Text;
    if (text.textContent?.trim() && !text.parentElement?.closest('script,style,textarea,svg,[data-skeleton-text]')) texts.push(text);
  }
  for (const text of texts) {
    const span = document.createElement('span'); span.dataset.skeletonText = '';
    text.replaceWith(span); span.append(text); spans.push(span);
  }
  root.dataset.skeleton = ''; root.setAttribute('aria-busy', 'true'); root.inert = true;
  return () => {
    for (const span of spans) span.replaceWith(...span.childNodes);
    delete root.dataset.skeleton; root.inert = inert;
    if (busy === null) root.removeAttribute('aria-busy'); else root.setAttribute('aria-busy', busy);
  };
}

/** Reuse a real card, including its existing responsive and scoped styles. */
export function skeletonCard(source: HTMLElement) {
  const card = source.cloneNode(true) as HTMLElement;
  for (const element of [card, ...card.querySelectorAll<HTMLElement>('*')]) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name === 'id' || attribute.name === 'href' || attribute.name.startsWith('aria-') || (attribute.name.startsWith('data-') && !attribute.name.startsWith('data-astro-'))) element.removeAttribute(attribute.name);
    }
    if (element instanceof HTMLImageElement) {
      element.removeAttribute('srcset');element.alt = '';
      element.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"/%3E';
    }
    if (element instanceof HTMLButtonElement) element.disabled = true;
  }
  card.setAttribute('aria-hidden', 'true'); skeletonize(card);
  return card;
}

export function skeletonGrid(container: HTMLElement, source: HTMLElement, count: number) {
  container.replaceChildren(...Array.from({length: count}, () => skeletonCard(source)));
  container.setAttribute('aria-busy', 'true');
}
