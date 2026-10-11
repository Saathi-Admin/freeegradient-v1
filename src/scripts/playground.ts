import { loadSearchIndex, loadTemplate, matchesTemplate, type CataloguePage, type TemplateSummary } from './catalogue';
import type { GradientTemplate, GradientVariation } from '../types/gradient';
const sidebar = document.querySelector<HTMLElement>('#playground-sidebar')!;
const sidebarScroll = document.querySelector<HTMLElement>('#sidebar-scroll')!;
const templates = document.querySelector<HTMLElement>('#playground-templates')!;
const collectionList = document.querySelector<HTMLElement>('#playground-collections')!;
const browseTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-browse-tab]')];
const sidebarTabs = document.querySelector<HTMLElement>('.playground-sidebar-tabs')!;
const back = document.querySelector<HTMLButtonElement>('#templates-back')!;
const preview = document.querySelector<HTMLElement>('.playground-preview')!;
const selectedLabel = document.querySelector<HTMLElement>('#preview-selected-label')!;
const detailsLink = document.querySelector<HTMLAnchorElement>('#preview-details-link')!;
const openButton = document.querySelector<HTMLButtonElement>('.playground-open')!;
const variationPanel = document.querySelector<HTMLElement>('#playground-variation-panel')!;
const search = document.querySelector<HTMLInputElement>('#playground-search')!;
const searchLabel = search.closest<HTMLElement>('.playground-search-label')!;
const pagination = document.querySelector<HTMLElement>('.playground-pagination')!;
const previous = document.querySelector<HTMLButtonElement>('#template-page-prev')!;
const next = document.querySelector<HTMLButtonElement>('#template-page-next')!;
const pageLabel = document.querySelector<HTMLElement>('#template-page-select')!;
const status = document.querySelector<HTMLElement>('#playground-browser-status')!;
const retry = document.querySelector<HTMLButtonElement>('#playground-retry')!;
const initialData = JSON.parse(document.querySelector('#playground-initial')!.textContent!) as {initialTemplate: GradientTemplate; totalPages: number; total: number};
const cache = new Map<string, GradientTemplate>([[initialData.initialTemplate.slug, initialData.initialTemplate]]);
let browseMode = 'templates', activeCollection: HTMLButtonElement | undefined, activeTemplate: string | undefined;
let templateScroll = 0, page = 1, pageCount = initialData.totalPages, browserRequest = 0, templateRequest = 0;
let selectedId = initialData.initialTemplate.variations[0].id;
const browserState = () => `${browseMode}:${activeCollection?.dataset.collectionChoice ?? 'all'}:${page}:${search.value.trim()}`;
type VariationSummary = { id: string; slug: string; name: string; variationName: string; category: string; mode: string; thumbnail: string; tags: string[] };
let variationIndex: Promise<VariationSummary[]> | undefined;
function loadVariationIndex() {
  return variationIndex ??= fetch('/gradients/catalogue/variations.json').then(response => {
    if (!response.ok) throw new Error('Could not load gradients');
    return response.json() as Promise<VariationSummary[]>;
  }).catch(error => { variationIndex = undefined; throw error; });
}
let renderedState = browserState();
function showStatus(message: string, failed = false) { status.textContent = message; status.hidden = !message; retry.hidden = !failed; }
function selectVariation(template: GradientTemplate, variation: GradientVariation) {
  selectedId = variation.id;
  templates.querySelectorAll<HTMLElement>('[data-gradient-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gradientChoice === selectedId)));
  variationPanel.querySelectorAll<HTMLElement>('[data-variation-choice]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.variationChoice === selectedId)));
  preview.style.setProperty('--preview-gradient', variation.cssKind==='native' ? variation.css : `url("${variation.backgroundSrc ?? variation.src}")`);
  preview.dataset.mode = variation.mode;
  selectedLabel.textContent = `${template.name} / ${variation.id}`;
  detailsLink.href = `/gradients/${variation.id}/`;
  const url = new URL(location.href); url.searchParams.set('gradient',variation.id); history.replaceState(null,'',url);
}
function renderVariations(template: GradientTemplate) {
  variationPanel.replaceChildren();
  variationPanel.dataset.templatePanel = template.slug;
  for (const mode of ['dark','light'] as const) {
    const section = document.createElement('section'); section.className='playground-palette-group'; section.setAttribute('aria-label',`${mode} variations`);
    const heading = document.createElement('h3'); heading.className='text-caption'; heading.textContent=`For ${mode} mode`;
    const grid = document.createElement('div'); grid.className='playground-palette-grid';
    for (const v of template.variations.filter(v=>v.mode===mode)) {
      const button = document.createElement('button'); button.type='button'; button.className='playground-variation'; button.dataset.variationChoice=v.id;
      button.setAttribute('aria-label',`Preview ${template.name}, ${v.name}`); button.setAttribute('aria-pressed',String(selectedId===v.id));
      const image = document.createElement('img'); image.src=v.thumbnail; image.alt=''; image.width=160; image.height=90; image.loading='lazy'; image.decoding='async';
      const copy = document.createElement('span'); copy.className='playground-card-copy'; const label=document.createElement('span'); label.className='text-caption'; label.textContent=v.name; copy.append(label); button.append(image,copy);
      button.addEventListener('click',()=>selectVariation(template,v)); grid.append(button);
    }
    section.append(heading,grid); variationPanel.append(section);
  }
}
async function openTemplate(slug: string, focus = true) {
  if (!templates.hidden) templateScroll = sidebarScroll.scrollTop;
  const request=++templateRequest;
  activeTemplate=slug; templates.hidden=true; collectionList.hidden=true; sidebarTabs.hidden=true; searchLabel.hidden=true; pagination.hidden=true; back.hidden=false;
  back.innerHTML=back.innerHTML.replace(/Back to collections|Back to templates/,'Back to templates');
  sidebarScroll.scrollTop=0; if(focus) back.focus(); variationPanel.hidden=true; showStatus('Loading colours…');
  try {
    const template=cache.get(slug) ?? await loadTemplate(slug);
    if (request!==templateRequest || activeTemplate!==slug) return;
    cache.set(slug,template); if(cache.size>8) cache.delete(cache.keys().next().value!);
    renderVariations(template); variationPanel.hidden=false; showStatus('');
  } catch { if(request===templateRequest) showStatus('Could not load this template.',true); }
}
function renderTemplates(items: TemplateSummary[]) {
  templates.replaceChildren();
  for(const item of items) {
    const button=document.createElement('button'); button.type='button'; button.className='playground-template'; button.dataset.templateChoice=item.slug; button.dataset.category=item.category; button.setAttribute('aria-label',`Choose ${item.name} template`);
    const image=document.createElement('img'); image.src=item.thumbnail; image.alt=''; image.width=160; image.height=90; image.loading='lazy'; image.decoding='async';
    const copy=document.createElement('span'); copy.className='playground-card-copy'; const title=document.createElement('span'); title.className='text-body-sm'; title.textContent=item.name; const count=document.createElement('span'); count.className='text-caption'; count.textContent=`${item.count} colours`; copy.append(title,count); button.append(image,copy); templates.append(button);
  }
}
function renderAllGradients(items: VariationSummary[]) {
  templates.replaceChildren();
  for (const item of items) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'playground-template';
    button.dataset.gradientChoice = item.id; button.dataset.templateSlug = item.slug;
    button.setAttribute('aria-label', `Preview ${item.name}, ${item.variationName}`);
    button.setAttribute('aria-pressed', String(item.id === selectedId));
    const image = document.createElement('img'); image.src = item.thumbnail; image.alt = ''; image.width = 160; image.height = 90; image.loading = 'lazy'; image.decoding = 'async';
    const copy = document.createElement('span'); copy.className = 'playground-card-copy';
    const title = document.createElement('span'); title.className = 'text-body-sm'; title.textContent = item.name;
    copy.append(title); button.append(image, copy); templates.append(button);
  }
}
async function previewGradient(slug: string, id: string) {
  const request = ++templateRequest;
  showStatus('Loading gradient…');
  try {
    const template = cache.get(slug) ?? await loadTemplate(slug);
    if (request !== templateRequest || browseMode !== 'all') return;
    const variation = template.variations.find(item => item.id === id);
    if (!variation) throw new Error('Missing gradient');
    cache.set(slug, template); if (cache.size > 8) cache.delete(cache.keys().next().value!);
    selectVariation(template, variation); showStatus('');
  } catch { if (request === templateRequest) showStatus('Could not load this gradient. Select it again to retry.'); }
}
function updatePagination() { pageLabel.dispatchEvent(new CustomEvent('select-sync',{detail:{value:String(page),label:`${page} / ${pageCount}`,max:pageCount}})); previous.disabled=page<=1; next.disabled=page>=pageCount; }
async function loadBrowserPage() {
  const state=browserState(), request=++browserRequest; showStatus(browseMode === 'all' ? 'Loading gradients…' : 'Loading templates…');
  templates.setAttribute('aria-busy','true'); previous.disabled=true; next.disabled=true;
  try {
    let data: CataloguePage;
    const category=activeCollection?.dataset.collectionChoice ?? 'all', query=search.value.trim();
    if (browseMode === 'all') {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const items = (await loadVariationIndex()).filter(item => {
        const text = [item.id, item.name, item.variationName, item.category, item.mode, ...item.tags].join(' ').toLowerCase();
        return terms.every(term => text.includes(term));
      });
      if (request !== browserRequest || state !== browserState()) return;
      pageCount = Math.max(1, Math.ceil(items.length / 24));
      renderAllGradients(items.slice((page - 1) * 24, page * 24)); renderedState = state; updatePagination();
      showStatus(items.length ? '' : 'No matching gradients. Try another colour or style.');
      return;
    }
    if(query) {
      const items=(await loadSearchIndex()).filter(g=>(category==='all'||g.category===category)&&matchesTemplate(g,query));
      data={items:items.slice((page-1)*24,page*24),total:items.length,totalPages:Math.max(1,Math.ceil(items.length/24)),page};
    } else {
      const response=await fetch(`/gradients/catalogue/pages/${category}-${page}.json`); if(!response.ok) throw new Error(); data=await response.json();
    }
    if(request!==browserRequest || state!==browserState()) return;
    pageCount=data.totalPages; renderTemplates(data.items); renderedState=state; updatePagination(); showStatus(data.total ? '' : 'No matching templates. Try another colour or style.');
  } catch { if(request===browserRequest) {showStatus(browseMode === 'all' ? 'Could not load gradients.' : 'Could not load templates.',true); updatePagination();} }
  finally {if(request===browserRequest) templates.removeAttribute('aria-busy');}
}
function showBrowser() {
  ++templateRequest; activeTemplate=undefined; variationPanel.hidden=true; showStatus('');
  const collections=browseMode==='collections'&&!activeCollection;
  search.placeholder = browseMode === 'all' ? 'Search gradients or colours…' : 'Search templates or colours…';
  search.setAttribute('aria-label', browseMode === 'all' ? 'Search gradients' : 'Search templates');
  pagination.setAttribute('aria-label', browseMode === 'all' ? 'Gradient pages' : 'Template pages');
  collectionList.hidden=!collections; templates.hidden=collections; searchLabel.hidden=collections; pagination.hidden=collections; sidebarTabs.hidden=!!activeCollection; back.hidden=!activeCollection;
  back.innerHTML=back.innerHTML.replace(/Back to collections|Back to templates/,'Back to collections');
  if(!collections&&renderedState!==browserState()) void loadBrowserPage();
}
templates.addEventListener('click',event=>{
  const button=(event.target as Element).closest<HTMLElement>('[data-template-choice], [data-gradient-choice]');
  if (!button) return;
  if (button.dataset.gradientChoice) void previewGradient(button.dataset.templateSlug!, button.dataset.gradientChoice);
  else void openTemplate(button.dataset.templateChoice!);
});
back.addEventListener('click',()=>{
  if(activeTemplate) {
    const slug=activeTemplate; showBrowser(); templates.querySelector<HTMLElement>(`[data-template-choice="${slug}"]`)?.focus({preventScroll:true}); sidebarScroll.scrollTop=templateScroll;
  } else {
    const collection=activeCollection; activeCollection=undefined; page=1; search.value=''; showBrowser(); collection?.focus();
  }
});
collectionList.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-collection-choice]'); if(!button) return; activeCollection=button; page=1; search.value=''; showBrowser(); sidebarScroll.scrollTop=0; back.focus();});
previous.addEventListener('click',()=>{if(page>1){--page;void loadBrowserPage();sidebarScroll.scrollTop=0;}});
next.addEventListener('click',()=>{if(page<pageCount){++page;void loadBrowserPage();sidebarScroll.scrollTop=0;}});
pageLabel.addEventListener('select-change',event=>{page=Number((event as CustomEvent).detail.value);void loadBrowserPage();sidebarScroll.scrollTop=0;});
retry.addEventListener('click',()=>{if(activeTemplate) void openTemplate(activeTemplate,false); else void loadBrowserPage();});
let searchTimer: ReturnType<typeof setTimeout>;
search.addEventListener('input',()=>{clearTimeout(searchTimer); ++browserRequest; searchTimer=setTimeout(()=>{page=1;void loadBrowserPage();sidebarScroll.scrollTop=0;},200);});
function selectBrowseTab(button: HTMLButtonElement) {
  browseMode=button.dataset.browseTab!; activeCollection=undefined; page=1; search.value='';
  browseTabs.forEach(tab=>{const active=tab===button;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}); sidebarScroll.setAttribute('aria-labelledby',button.id); showBrowser(); sidebarScroll.scrollTop=0;
}
browseTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectBrowseTab(tab));
  tab.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?browseTabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+browseTabs.length)%browseTabs.length;selectBrowseTab(browseTabs[next]);browseTabs[next].focus();});
});
const originalRequestedGradient=new URL(location.href).searchParams.get('gradient');
updatePagination();
selectVariation(initialData.initialTemplate,initialData.initialTemplate.variations[0]);
async function initializeRequested(id: string) {
  const slug=id.replace(/-\d+$/,'');
  try {
    const template=cache.get(slug)??await loadTemplate(slug); const variation=template.variations.find(v=>v.id===id); if(!variation)throw new Error();
    cache.set(slug,template); selectVariation(template,variation); await openTemplate(slug,false);
  } catch {showStatus('That gradient is unavailable. Choose another template.');}
}
if(originalRequestedGradient) void initializeRequested(originalRequestedGradient);
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
