const sidebar = document.querySelector<HTMLElement>('#playground-sidebar')!;
const sidebarScroll = document.querySelector<HTMLElement>('#sidebar-scroll')!;
const templates = document.querySelector<HTMLElement>('#playground-templates')!;
const collectionList = document.querySelector<HTMLElement>('#playground-collections')!;
const browseTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-browse-tab]')];
const sidebarTabs = document.querySelector<HTMLElement>('.playground-sidebar-tabs')!;
let browseMode = 'templates';
let activeCollection: HTMLButtonElement | undefined;
let activeTemplate: string | undefined;
const back = document.querySelector<HTMLButtonElement>('#templates-back')!;
const preview = document.querySelector<HTMLElement>('.playground-preview')!;
const selectedLabel = document.querySelector<HTMLElement>('#preview-selected-label')!;
const detailsLink = document.querySelector<HTMLAnchorElement>('#preview-details-link')!;
const openButton = document.querySelector<HTMLButtonElement>('.playground-open')!;
let templateScroll = 0;
const variations = [...document.querySelectorAll<HTMLButtonElement>('[data-variation-choice]')];
function selectVariation(button: HTMLButtonElement) {
  variations.forEach(v => v.setAttribute('aria-pressed', String(v === button)));
  preview.style.setProperty('--preview-gradient', `url("${button.dataset.src}")`);
  preview.dataset.mode = button.dataset.mode;
  selectedLabel.textContent = `${button.dataset.name} / ${button.dataset.variationChoice}`;
  detailsLink.href = `/gradients/${button.dataset.variationChoice}/`;
  const url = new URL(location.href);
  url.searchParams.set('gradient', button.dataset.variationChoice!);
  history.replaceState(null, '', url);
}
function openTemplate(slug: string, focus = true) {
  if (!templates.hidden) templateScroll = sidebarScroll.scrollTop;
  templates.hidden = true;
  collectionList.hidden = true;
  activeTemplate = slug;
  document.querySelectorAll<HTMLElement>('[data-template-panel]').forEach(panel => panel.hidden = panel.dataset.templatePanel !== slug);
  back.hidden = false;
  sidebarTabs.hidden = true;
  back.innerHTML = back.innerHTML.replace(/Back to collections|Back to templates/, 'Back to templates');
  sidebarScroll.scrollTop = 0;
  if (focus) back.focus();
}
document.querySelectorAll<HTMLButtonElement>('[data-template-choice]').forEach(button => button.addEventListener('click', () => openTemplate(button.dataset.templateChoice!)));
variations.forEach(button => button.addEventListener('click', () => selectVariation(button)));
function showBrowser() {
  document.querySelectorAll<HTMLElement>('[data-template-panel]').forEach(p => p.hidden = true);
  collectionList.hidden = browseMode !== 'collections' || !!activeCollection;
  templates.hidden = !collectionList.hidden;
  document.querySelectorAll<HTMLButtonElement>('[data-template-choice]').forEach(button => button.hidden = !!activeCollection && button.dataset.category !== activeCollection.dataset.collectionChoice);
  back.hidden = !activeCollection;
  sidebarTabs.hidden = !!activeCollection;
  back.innerHTML = back.innerHTML.replace(/Back to collections|Back to templates/, 'Back to collections');
}
back.addEventListener('click', () => {
  if (activeTemplate) {
    const slug = activeTemplate;
    activeTemplate = undefined;
    showBrowser();
    document.querySelector<HTMLButtonElement>(`[data-template-choice="${slug}"]`)?.focus({ preventScroll: true });
    sidebarScroll.scrollTop = templateScroll;
  } else {
    const collection = activeCollection;
    activeCollection = undefined; showBrowser();
    collection?.focus();
  }
});
document.querySelectorAll<HTMLButtonElement>('[data-collection-choice]').forEach(button => button.addEventListener('click', () => { activeCollection = button; showBrowser(); sidebarScroll.scrollTop = 0; back.focus(); }));
function selectBrowseTab(button: HTMLButtonElement) {
  browseMode = button.dataset.browseTab!;
  activeTemplate = undefined; activeCollection = undefined;
  browseTabs.forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  sidebarScroll.setAttribute('aria-labelledby', button.id);
  showBrowser(); sidebarScroll.scrollTop = 0;
}
browseTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectBrowseTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? browseTabs.length - 1 : (index + 1) % browseTabs.length;
    selectBrowseTab(browseTabs[next]); browseTabs[next].focus();
  });
});
const requestedGradient = new URL(location.href).searchParams.get('gradient');
const initial = variations.find(v => v.dataset.variationChoice === requestedGradient) ?? variations[0];
selectVariation(initial);
if (requestedGradient) openTemplate(initial.closest<HTMLElement>('[data-template-panel]')!.dataset.templatePanel!, false);
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-preview-tab]')];
function selectTab(button: HTMLButtonElement) {
  tabs.forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  document.querySelectorAll<HTMLElement>('.preview-panel').forEach(panel => panel.hidden = panel.id !== `preview-${button.dataset.previewTab}`);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next]); tabs[next].focus();
  });
});
function closeSidebar() { delete sidebar.dataset.open; openButton.setAttribute('aria-expanded', 'false'); openButton.focus(); }
openButton.addEventListener('click', () => { sidebar.dataset.open = ''; openButton.setAttribute('aria-expanded', 'true'); sidebar.querySelector<HTMLButtonElement>('.playground-close')!.focus(); });
sidebar.querySelector('.playground-close')!.addEventListener('click', closeSidebar);
document.addEventListener('keydown', event => {
  if (!sidebar.hasAttribute('data-open')) return;
  if (event.key === 'Escape') closeSidebar();
  if (event.key === 'Tab') {
    const items = [...sidebar.querySelectorAll<HTMLElement>('button,a[href]')].filter(el => el.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
