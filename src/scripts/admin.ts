type Review = { id:string;name:string;email:string;author_role:string;website:string;rating:number;review:string;status:string;moderation_status:string;source:string;created_at:number;version:number };
const $ = <T extends HTMLElement>(selector:string) => document.querySelector<T>(selector)!;
const login=$<HTMLFormElement>('#admin-login'), panel=$('#login-panel'), dashboard=$('#dashboard'), logout=$<HTMLButtonElement>('#logout'), list=$('#reviews'), message=$('#admin-message');
let reviewStatus='all',search='',page=1,total=0,busy=false;
let loadVersion=0;
function notice(text=''){message.textContent=text;message.hidden=!text;}
function authenticated(value:boolean){panel.hidden=value;dashboard.hidden=!value;logout.hidden=!value;if(!value)list.replaceChildren();}
async function api(path:string,data?:unknown){
  const response=await fetch(`/api/admin/${path}`,{credentials:'same-origin',cache:'no-store',...(data!==undefined?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})});
  const result=await response.json();
  if(!response.ok){if(response.status===401)authenticated(false);throw new Error(result.error||'Unable to reach the review service.');}return result;
}
function el(tag:string,text='',className=''){const node=document.createElement(tag);node.textContent=text;node.className=className;return node;}
function card(review:Review){
  const article=el('article','','admin-card'),head=el('div','','admin-review-head'),identity=el('div');
  identity.append(el('h2',review.name));
  if(review.email)identity.append(el('p',review.email,'admin-review-meta'));
  if(review.source==='existing')identity.append(el('p','Existing website card','admin-review-meta'));
  if(review.author_role)identity.append(el('p',review.author_role,'admin-review-meta'));
  if(review.website)identity.append(el('p',review.website,'admin-review-meta'));
  const badge=el('span',review.status,'admin-badge');badge.dataset.state=review.status;head.append(identity,badge);
  const stars=el('div','★'.repeat(review.rating)+'☆'.repeat(5-review.rating),'admin-review-stars');stars.setAttribute('aria-label',`${review.rating} out of 5 stars`);
  const actions=el('div','','admin-review-actions');
  const options=review.status==='removed'?[['restore',review.moderation_status==='approved'?'Restore & publish':'Restore']]:review.status==='hidden'?[['unhide','Unhide & publish'],['remove','Remove']]:review.status==='approved'?[['hide','Hide'],['remove','Remove']]:review.status==='pending'?[['approve','Approve & publish'],['reject','Reject'],['remove','Remove']]:[['approve','Approve & publish'],['remove','Remove']];
  const messages:Record<string,string>={approve:'Review published.',reject:'Review rejected.',hide:'Card hidden from the website.',unhide:'Card is visible on the website.',remove:'Card removed. You can restore it from Removed.',restore:'Card restored.'};
  for(const [action,label] of options){const button=el('button',label,`btn ${action==='approve'?'btn-primary':'btn-secondary'}`) as HTMLButtonElement;button.addEventListener('click',async()=>{if(busy)return;busy=true;notice();actions.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('moderate',{id:review.id,version:Number(review.version),action});await load();notice(messages[action]);}catch(error){notice((error as Error).message);actions.querySelectorAll('button').forEach(b=>b.disabled=false);}finally{busy=false;}});actions.append(button);}
  article.append(head,stars,el('p',review.review,'admin-review-body'));
  if(Number(review.created_at)>0)article.append(el('p',new Date(Number(review.created_at)).toLocaleString(),'admin-review-date'));
  article.append(actions);return article;
}
async function load(){
  const version=++loadVersion;
  list.setAttribute('aria-busy','true');
  try{const result=await api(`reviews?${new URLSearchParams({status:reviewStatus,search,page:String(page)})}`);if(version!==loadVersion)return;total=result.total;
    if(page>1 && !result.reviews.length){page--;return await load();}
    list.replaceChildren(...result.reviews.map(card));if(!result.reviews.length)list.append(el('p',search?'No matching reviews.':'No reviews here yet.','admin-empty'));
    document.querySelectorAll<HTMLElement>('[data-count]').forEach(node=>{node.textContent=String(node.dataset.count==='all'?Object.values(result.counts as Record<string,number>).reduce((a,b)=>a+b,0):result.counts[node.dataset.count!]);});
    $('#page-info').textContent=`Page ${page} of ${Math.max(1,Math.ceil(total/25))}`;$<HTMLButtonElement>('#previous').disabled=page===1;$<HTMLButtonElement>('#next').disabled=page*25>=total;
  }finally{if(version===loadVersion)list.removeAttribute('aria-busy');}
}
const reload=()=>load().catch(error=>notice(error.message));
login.addEventListener('submit',async event=>{event.preventDefault();notice();const button=login.querySelector('button')!;button.disabled=true;try{const data=new FormData(login);await api('login',Object.fromEntries(data));login.reset();authenticated(true);await load();}catch(error){notice((error as Error).message);}finally{button.disabled=false;}});
logout.addEventListener('click',async()=>{try{await api('logout',{});authenticated(false);notice();}catch(error){notice((error as Error).message);}});
document.querySelectorAll<HTMLButtonElement>('[data-status]').forEach(button=>button.addEventListener('click',()=>{reviewStatus=button.dataset.status!;page=1;document.querySelectorAll('[data-status]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));notice();void reload();}));
let searchTimer:ReturnType<typeof setTimeout>;
const searchInput=$<HTMLInputElement>('#admin-search input');
function updateSearch(){clearTimeout(searchTimer);search=searchInput.value;page=1;notice();void reload();}
searchInput.addEventListener('input',()=>{clearTimeout(searchTimer);++loadVersion;searchTimer=setTimeout(updateSearch,200);});
$<HTMLFormElement>('#admin-search').addEventListener('submit',event=>{event.preventDefault();updateSearch();});
$('#previous').addEventListener('click',()=>{if(page>1){page--;void reload();}});$('#next').addEventListener('click',()=>{if(page*25<total){page++;void reload();}});$('#refresh').addEventListener('click',()=>{notice();void reload();});
api('session').then(async()=>{authenticated(true);await load();}).catch(error=>{authenticated(false);if(!/sign in|session has expired/i.test(error.message))notice(error.message);});
