import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createReviewStore} from '../server/review-store.mjs';
import {createReviewHandler} from '../server/review-service.mjs';
import {hashPassword} from '../server/review-security.mjs';

test('existing cards migrate once and hide/remove/restore persist across restarts',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'fg-existing-'));const file=join(dir,'reviews.sqlite');let store=await createReviewStore({file});
  const config={username:'admin',passwordHash:await hashPassword('test-password'),secret:'b'.repeat(64)};
  let handler=createReviewHandler({store,config});let cookie='';
  const call=(path,data,headers={})=>handler(new Request('https://example.com/api/'+path,{method:data===undefined?'GET':'POST',headers:{origin:'https://example.com','content-type':'application/json',cookie,...headers},...(data===undefined?{}:{body:JSON.stringify(data)})}));
  const publicReviews=async()=> (await (await call('reviews')).json()).reviews;
  const all=async()=> (await (await call('admin/reviews?status=all')).json());
  const moderate=async(card,action)=>{const response=await call('admin/moderate',{id:card.id,version:Number(card.version),action});assert.equal(response.status,200);return(await response.json()).review;};
  try{
    assert.equal((await publicReviews()).length,9);
    const login=await call('admin/login',{username:'admin',password:'test-password'});cookie=login.headers.get('set-cookie').split(';')[0];
    let data=await all();assert.equal(data.total,9);assert.equal(data.counts.approved,9);assert.ok(data.reviews.every(card=>card.source==='existing' && card.email===''));
    let card=data.reviews[0];
    assert.equal((await call('admin/moderate',{id:card.id,version:card.version,action:'hide'},{cookie:''})).status,401);
    card=await moderate(card,'hide');assert.equal(card.status,'hidden');assert.equal((await publicReviews()).length,8);
    assert.equal((await (await call('admin/reviews?status=hidden')).json()).reviews.length,1);
    assert.equal((await call('admin/moderate',{id:card.id,version:1,action:'remove'})).status,409);
    card=await moderate(card,'unhide');assert.equal((await publicReviews()).length,9);
    card=await moderate(card,'remove');assert.equal(card.status,'removed');assert.equal((await publicReviews()).length,8);
    store.close();store=await createReviewStore({file});handler=createReviewHandler({store,config});
    assert.equal((await publicReviews()).length,8);assert.equal((await all()).total,9);
    card=await moderate(card,'restore');assert.equal(card.status,'approved');assert.equal((await publicReviews()).length,9);
    for(const item of (await all()).reviews)await moderate(item,'hide');
    assert.equal((await publicReviews()).length,0);
    store.close();store=await createReviewStore({file});handler=createReviewHandler({store,config});assert.equal((await publicReviews()).length,0);
    const hidden=(await all()).reviews[0];const removed=await moderate(hidden,'remove');await moderate(removed,'restore');assert.equal((await publicReviews()).length,1);
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
