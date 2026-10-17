import { loadSearchIndex, matchesTemplate, type TemplateSummary } from './catalogue';
import { skeletonGrid } from './skeleton';
const controls=document.querySelector<HTMLElement>('[data-gradient-search]')!;
const input=document.querySelector<HTMLInputElement>('#gradient-search')!;
const category=document.querySelector<HTMLElement>('#gradient-category');
const colour=document.querySelector<HTMLElement>('#gradient-colour')!;
const grid=document.querySelector<HTMLElement>('#search-grid')!;
const browseGrid=document.querySelector<HTMLElement>('#browse-grid')!;
const browsePagination=document.querySelector<HTMLElement>('#browse-pagination')!;
const pagination=document.querySelector<HTMLElement>('#search-pagination')!;
const previous=document.querySelector<HTMLButtonElement>('#search-prev')!;
const next=document.querySelector<HTMLButtonElement>('#search-next')!;
const pageLabel=document.querySelector<HTMLElement>('#search-page')!;
const status=document.querySelector<HTMLElement>('#gradient-search-status')!;
const count=document.querySelector<HTMLElement>('#browse-count')!;
const initialCount=count.textContent!;
const mode=controls.dataset.mode!;
let page=1, request=0, timer:ReturnType<typeof setTimeout>;
const pageSize=24;
const cardSource=browseGrid.querySelector<HTMLElement>('.gradient-card')!;
function saveFilters() {
  const url=new URL(location.href);
  for(const [key,value] of [['q',input.value.trim()],['collection',category?.dataset.value??'all'],['colour',colour.dataset.value!],['results',String(page)]]) {
    if(!value || value==='all' || key==='results' && value==='1')url.searchParams.delete(key); else url.searchParams.set(key,value);
  }
  history.replaceState(null,'',url);
  document.querySelectorAll<HTMLAnchorElement>('.mode-filters a').forEach(link=>{const target=new URL(link.href);target.search=url.search;target.searchParams.delete('results');link.href=target.href;});
}
function resultCard(item:TemplateSummary) {
  const selected=item.previews.find(v=>v.mode===mode)??item.previews[0];
  const card=document.createElement('a');card.className='gradient-card';card.href=`/gradients/${selected.id}/`;card.setAttribute('aria-label',`View ${item.name} gradient`);
  const media=document.createElement('div');media.className='card-media';const image=document.createElement('img');image.src=selected.thumbnail;image.alt=`${item.name} gradient preview`;image.width=384;image.height=216;image.loading='lazy';image.decoding='async';media.append(image);
  const footer=document.createElement('div');footer.className='card-footer';const title=document.createElement('div');title.className='card-title';const name=document.createElement('h3');name.className='text-body-sm';name.textContent=item.name;const subtitle=document.createElement('span');subtitle.className='card-id text-caption';subtitle.textContent=`${item.count} colour variations`;title.append(name,subtitle);footer.append(title);card.append(media,footer);return card;
}
async function search() {
  const id=++request;
  const query=input.value.trim(), selectedCategory=category?.dataset.value??controls.dataset.category!, selectedColour=colour.dataset.value!;
  const active=!!query||selectedCategory!==(controls.dataset.category??'all')||selectedColour!=='all';
  saveFilters();browseGrid.hidden=active;browsePagination.hidden=active;grid.hidden=!active;pagination.hidden=true;
  if(!active){count.textContent=initialCount;status.hidden=true;grid.replaceChildren();grid.removeAttribute('aria-busy');return;}
  status.textContent='';status.hidden=true;skeletonGrid(grid,cardSource,pageSize);previous.disabled=true;next.disabled=true;
  try {
    const items=(await loadSearchIndex(selectedColour)).filter(item=>(selectedCategory==='all'||item.category===selectedCategory)&&matchesTemplate(item,query)&&(mode==='all'||item.previews.some(v=>v.mode===mode)));
    if(id!==request)return;
    const pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages);
    grid.replaceChildren(...items.slice((page-1)*pageSize,page*pageSize).map(resultCard));
    count.textContent=`${items.length} matching templates`;status.textContent=items.length?'':'No matches. Try another colour, collection or search.';status.hidden=!!items.length;
    pagination.hidden=pages<=1;pageLabel.dispatchEvent(new CustomEvent('select-sync',{detail:{value:String(page),label:`Page ${page} of ${pages}`,max:pages}}));previous.disabled=page<=1;next.disabled=page>=pages;saveFilters();
  }catch{if(id===request){status.textContent='Search is unavailable. Change a filter to try again.';status.hidden=false;grid.replaceChildren();count.textContent='';}}
  finally{if(id===request)grid.removeAttribute('aria-busy');}
}
input.addEventListener('input',()=>{++request;clearTimeout(timer);timer=setTimeout(()=>{page=1;void search();},200);});
category?.addEventListener('select-change',()=>{page=1;void search();});colour.addEventListener('select-change',()=>{page=1;void search();});
previous.addEventListener('click',()=>{--page;void search();grid.scrollIntoView({block:'start'});});next.addEventListener('click',()=>{++page;void search();grid.scrollIntoView({block:'start'});});
function restore() {
  const params=new URL(location.href).searchParams;input.value=params.get('q')??'';
  const select=(el:HTMLElement,value:string)=>{const valid=Array.from(el.querySelectorAll<HTMLElement>('[role="option"]')).some(o=>o.dataset.value===value);el.dispatchEvent(new CustomEvent('select-sync',{detail:{value:valid?value:'all'}}));};
  if(category)select(category,params.get('collection')??'all');select(colour,params.get('colour')??'all');
  page=Math.max(1,Number(params.get('results'))||1);void search();
}
pageLabel.addEventListener('select-change',event=>{page=Number((event as CustomEvent).detail.value);void search();grid.scrollIntoView({block:'start'});});
window.addEventListener('popstate',restore);restore();
