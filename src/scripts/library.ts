import type { GradientTemplate, GradientVariation } from '../types/gradient';
import { openGradientExport } from './gradient-export';
const gradients = JSON.parse(document.querySelector('#gradient-catalogue')?.textContent ?? '[]') as GradientTemplate[];

const cards = [...document.querySelectorAll<HTMLElement>('.gradient-card')];
cards.forEach(card => {
  const link = card.querySelector<HTMLAnchorElement>('a.card-preview');
  if (!link) return;
  card.addEventListener('click', event => {
    if ((event.target as Element).closest('a, button, input, select, textarea, summary')) return;
    if (window.getSelection()?.toString()) return;
    link.click();
  });
});
const modeFilters = document.querySelector<HTMLElement>('.mode-filters');
const modeButtons = [...(modeFilters?.querySelectorAll<HTMLButtonElement>('[data-mode]') ?? [])];
function moveIndicator() {
  const button = modeButtons.find(b => b.getAttribute('aria-pressed') === 'true');
  if (!modeFilters || !button) return;
  modeFilters.style.setProperty('--indicator-x', `${button.offsetLeft}px`);
  modeFilters.style.setProperty('--indicator-width', `${button.offsetWidth}px`);
}
if (modeFilters) new ResizeObserver(moveIndicator).observe(modeFilters);
document.fonts.ready.then(moveIndicator);
moveIndicator();
const dialog = document.querySelector<HTMLDialogElement>('.gradient-dialog')!;
const toast = document.querySelector<HTMLElement>('.toast')!;
const selected = new Map<string,string>();
let mode = 'all';
let active: GradientTemplate | undefined;
let timer: ReturnType<typeof setTimeout>;
const notify = (message: string) => { clearTimeout(timer); toast.textContent = message; toast.hidden = false; timer = setTimeout(() => { toast.hidden = true; }, 4000); };
document.addEventListener('library-notify', event => {
  const message = (event as CustomEvent<unknown>).detail;
  if (typeof message === 'string') notify(message);
});
const variationFor = (card: HTMLElement) => {
  const template = gradients.find(g => g.slug === card.dataset.template)!;
  return { template, variation: template.variations.find(v => v.id === card.dataset.variation)! };
};
function updateCard(card: HTMLElement, variation: GradientVariation) {
  card.dataset.variation = variation.id;
  const image = card.querySelector<HTMLImageElement>('img')!;
  image.src = card.classList.contains('gradient-detail-layout') ? (variation.backgroundSrc ?? variation.src) : variation.thumbnail;
  image.alt = `${variationFor(card).template.name}, ${variation.name} colour palette`;
  const previewLink = card.querySelector<HTMLAnchorElement>('a.card-preview');
  if (previewLink) {
    previewLink.href = `/gradients/${variation.id}/`;
    previewLink.setAttribute('aria-label', `View ${variationFor(card).template.name}, ${variation.name}`);
  }
  card.querySelector('.card-id')!.textContent = variation.id;
  card.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.palette === variation.id));
    const palette = variationFor(card).template.variations.find(v => v.id === button.dataset.palette)!;
    button.hidden = palette.mode !== variation.mode;
  });
}
function filter() {
  const matches = new Set<string>();
  cards.forEach(card => {
    const { template } = variationFor(card);
    const available = template.variations.filter(v => (!card.dataset.fixedVariation || v.id === card.dataset.fixedVariation) && (!card.dataset.designMode || v.mode === card.dataset.designMode) && (mode === 'all' || v.mode === mode));
    card.hidden = !available.length;
    if (!card.hidden) {
      matches.add(template.slug);
      const wanted = selected.get(template.slug) ?? card.dataset.variation;
      updateCard(card, available.find(v => v.id === wanted) ?? available[0]);
    }
  });
  document.querySelectorAll<HTMLElement>('.collection').forEach(section => { section.hidden = !section.querySelector('.gradient-card:not([hidden])'); });
  document.querySelector<HTMLElement>('#library-empty')!.hidden = matches.size > 0;
}
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode!;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  moveIndicator();
  filter();
}));
document.querySelector('#clear-filters')?.addEventListener('click', () => {
  mode = 'all';
  document.querySelectorAll<HTMLElement>('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === 'all')));
  moveIndicator();
  filter(); modeButtons[0]?.focus();
});
function choose(template: GradientTemplate, id: string) {
  selected.set(template.slug, id);
  const variation = template.variations.find(v => v.id === id)!;
  cards.filter(c => c.dataset.template === template.slug && (!c.dataset.fixedVariation || c.dataset.fixedVariation === id) && (!c.dataset.designMode || c.dataset.designMode === variation.mode)).forEach(card => updateCard(card, variation));
  if (dialog.open && active?.slug === template.slug) populateDialog(template);
}
function populateDialog(template: GradientTemplate) {
  active = template;
  const v = template.variations.find(v => v.id === selected.get(template.slug)) ?? template.variations[0];
  selected.set(template.slug, v.id);
  document.querySelector('#dialog-title')!.textContent = template.name;
  document.querySelector('#dialog-id')!.textContent = v.id;
  const image = document.querySelector<HTMLImageElement>('#dialog-image')!;
  image.src = v.backgroundSrc ?? v.src; image.alt = `${template.name}, ${v.name}`;
  document.querySelector<HTMLElement>('#preview-copy')!.dataset.mode = v.mode;
  document.querySelector('#dialog-palette-name')!.textContent = v.name;
  document.querySelector('#dialog-note')!.textContent = v.cssKind === 'native' ? 'Native CSS · Scalable SVG · PNG / JPEG: 1920 × 1080. Downloads contain only the gradient.' : 'CSS loads only this gradient’s optimized background. SVG, PNG and JPEG downloads are also available.';
  const swatches = document.querySelector('#dialog-palettes')!;
  swatches.replaceChildren(...template.variations.filter(palette => palette.mode === v.mode).map(palette => {
    const button = document.createElement('button'); button.className = 'palette-swatch';
    button.style.setProperty('--swatch', `url("${palette.thumbnail}")`);
    button.setAttribute('aria-label', palette.name); button.setAttribute('aria-pressed', String(v.id === palette.id));
    button.addEventListener('click', () => { choose(template, palette.id); document.querySelector<HTMLButtonElement>(`#dialog-palettes button[aria-pressed=true]`)?.focus(); });
    return button;
  }));
}
const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
async function exportGradient(v: GradientVariation, format: string) {
  if (format === 'css') {
    const value = v.cssKind === 'native' ? v.css : `url("${new URL(v.backgroundSrc ?? v.src, location.origin).href}")`;
    const snippet = `.fg-${v.id} {\n  background-color: ${v.colors[0]};\n  background-image: ${value};\n  background-size: cover;\n  background-position: center;\n}`;
    try { await navigator.clipboard.writeText(snippet); notify(`${v.id} CSS copied.`); }
    catch { download(new Blob([snippet], {type:'text/css'}), `${v.id}.css`); notify('Clipboard unavailable. CSS downloaded instead.'); }
    return;
  }
  const response = await fetch(v.src); if (!response.ok) throw new Error('Asset unavailable');
  const blob = await response.blob();
  if (format === 'svg') { download(blob, `${v.id}.svg`); notify(`${v.id}.svg downloaded.`); return; }
  const url = URL.createObjectURL(blob);
  try {
    const image = new window.Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1920; canvas.height = 1080;
    const context = canvas.getContext('2d'); if (!context) throw new Error('Export unavailable');
    context.fillStyle = v.colors[0]; context.fillRect(0,0,1920,1080); context.drawImage(image,0,0,1920,1080);
    const output = await new Promise<Blob>((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Export failed')), `image/${format}`, .95));
    download(output, `${v.id}.${format === 'jpeg' ? 'jpg' : 'png'}`);
    notify(`${v.id} downloaded at 1920 × 1080.`);
  } finally { URL.revokeObjectURL(url); }
}
document.addEventListener('click', async event => {
  const copy = (event.target as Element).closest<HTMLElement>('[data-copy-stylesheet], [data-copy-class]');
  if (copy) {
    const value = copy.dataset.copyClass ?? `<link rel="stylesheet" href="${new URL(copy.dataset.copyStylesheet!, location.origin).href}">`;
    try { await navigator.clipboard.writeText(value); notify(copy.dataset.copyClass ? (value.startsWith('#') ? 'Colour copied.' : 'Class names copied. Add them to your HTML element.') : 'Stylesheet link copied. Add it to your HTML head.'); }
    catch { notify('Clipboard unavailable. Please copy the displayed class or use the How to use example.'); }
    return;
  }
  const target = (event.target as Element).closest<HTMLElement>('[data-action], [data-palette], [data-export]');
  if (!target) return;
  const card = target.closest<HTMLElement>('.gradient-card');
  if (card) {
    const { template, variation } = variationFor(card);
    if (target.dataset.palette) { choose(template,target.dataset.palette); return; }
    if (target.dataset.action === 'preview') { selected.set(template.slug,variation.id); populateDialog(template); dialog.showModal(); return; }
  }
  const variation = card ? variationFor(card).variation : active?.variations.find(v => v.id === selected.get(active!.slug));
  if (!variation) return;
  if ((target.dataset.action ?? target.dataset.export) === 'export') {
    const template = card ? variationFor(card).template : active;
    if (template) openGradientExport(template, variation);
    return;
  }
  const button = target as HTMLButtonElement; button.disabled = true;
  try { await exportGradient(variation,target.dataset.action ?? target.dataset.export!); }
  catch { notify('Could not export this gradient. Please try again.'); }
  finally { button.disabled = false; }
});
document.querySelector('#close-preview')?.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
new MutationObserver(() => { if (dialog.open) document.body.style.overflow = 'hidden'; }).observe(dialog,{attributes:true,attributeFilter:['open']});
filter();
