type PublicReview={name:string;author_role:string;rating:number;review:string;tone?:string};
const form=document.querySelector<HTMLFormElement>('#testimonial-feedback-form');
const tracks=Array.from(document.querySelectorAll<HTMLElement>('.testimonial-track'));
const template=document.querySelector<HTMLElement>('.testimonial-card');
const groupTemplate=document.querySelector<HTMLElement>('.testimonial-group');
const stage=document.querySelector<HTMLElement>('.testimonials-stage');
let signature='';
async function refreshReviews(){
  try{const response=await fetch('/api/reviews',{cache:'no-store'});if(!response.ok)throw new Error('Unavailable');const {reviews}=await response.json() as {reviews:PublicReview[]};const next=JSON.stringify(reviews);if(next===signature)return;signature=next;
    if(!reviews.length){tracks.forEach(track=>track.replaceChildren());if(stage)stage.hidden=true;return;}
    if(!template || !groupTemplate)return;
    tracks.forEach((track,column)=>{const group=groupTemplate.cloneNode(false) as HTMLElement;group.removeAttribute('aria-hidden');group.removeAttribute('inert');
      for(let index=0;index<Math.max(3,Math.ceil(reviews.length/3));index++){const review=reviews[(index*3+column)%reviews.length];const card=template.cloneNode(true) as HTMLElement;
        card.querySelector('blockquote p')!.textContent=review.review;card.querySelector('.testimonial-person .text-body-sm')!.textContent=review.name;card.querySelector('.testimonial-person .text-caption')!.textContent=review.author_role;
        for(const name of Array.from(card.classList))if(name.startsWith('testimonial-card-'))card.classList.remove(name);
        card.classList.add(`testimonial-card-${['blue','violet','pink'].includes(review.tone||'')?review.tone:'neutral'}`);
        const stars=card.querySelector('.testimonial-stars')!;stars.setAttribute('aria-label',`${review.rating} out of 5 stars`);stars.querySelectorAll('svg').forEach((star,i)=>star.setAttribute('fill',i<review.rating?'currentColor':'none'));group.append(card);
      }
      const duplicate=group.cloneNode(true) as HTMLElement;duplicate.setAttribute('aria-hidden','true');duplicate.setAttribute('inert','');track.replaceChildren(group,duplicate);
    });if(stage){stage.hidden=false;stage.setAttribute('aria-label','Testimonials. Swipe sideways to see all columns on a small screen.');}
  }catch{if(stage)stage.hidden=true;signature='';}
}
form?.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector<HTMLButtonElement>('button[type=submit]')!,status=document.querySelector<HTMLElement>('#feedback-status')!;button.disabled=true;button.textContent='Submitting…';status.hidden=true;
  try{const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to submit your review.');form.reset();status.textContent='Thank you! Your review has been sent for approval.';}
  catch(error){status.textContent=(error as Error).message||'Unable to submit your review. Please try again.';}finally{status.hidden=false;button.disabled=false;button.textContent='Submit review';}
});
void refreshReviews();document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshReviews();});setInterval(()=>{if(!document.hidden)void refreshReviews();},60000);
