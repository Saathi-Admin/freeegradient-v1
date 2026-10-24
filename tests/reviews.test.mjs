import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReviewStore } from '../server/review-store.mjs';
import { createReviewHandler } from '../server/review-service.mjs';
import { hashPassword } from '../server/review-security.mjs';

test('private moderation, publication, validation and durable storage',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'fg-reviews-'));const file=join(dir,'reviews.sqlite');let store=await createReviewStore({file,includeExisting:false});
  let time=Date.now();const config={username:'admin',passwordHash:await hashPassword('test-password'),secret:'a'.repeat(64)};let handler=createReviewHandler({store,config,now:()=>time});
  const call=(path,data,options={})=>handler(new Request(`https://example.com/api/${path}`,{method:data===undefined?'GET':'POST',headers:{origin:'https://example.com','content-type':'application/json',...options.headers},...(data===undefined?{}:{body:JSON.stringify(data)})}),{ip:options.ip||'test-ip'});
  const submission={name:'Designer',email:'private@example.com',rating:4,review:'A useful background for my project.',role:'Designer',website:'https://example.com'};
  try{
    assert.equal((await call('admin/reviews')).status,401);
    assert.equal((await call('admin/login',{username:'admin',password:'wrong'})).status,401);
    const logged=await call('admin/login',{username:'admin',password:'test-password'});assert.equal(logged.status,200);const cookie=logged.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);const auth={headers:{cookie:cookie.split(';')[0]}};
    assert.equal((await call('admin/moderate',{id:'0'.repeat(36),version:1,action:'approve'},{headers:{...auth.headers,origin:'https://attacker.com'}})).status,403);
    assert.equal((await call('reviews',submission,{headers:{'content-type':'text/plain'}})).status,415);
    assert.equal((await call('reviews',{...submission,review:'a'.repeat(13000)})).status,413);
    assert.equal((await call('reviews',submission,{headers:{origin:'https://attacker.com'}})).status,403);
    assert.equal((await call('reviews',{...submission,website:'javascript:alert(1)'},{ip:'invalid'})).status,400);
    assert.equal((await call('reviews',{...submission,status:'approved'})).status,202);
    assert.equal((await (await call('reviews')).json()).reviews.length,0);
    assert.equal((await call('reviews',submission)).status,409);
    let privateData=await (await call('admin/reviews',undefined,auth)).json();assert.equal(privateData.reviews[0].email,submission.email);let review=privateData.reviews[0];assert.equal(review.status,'pending');
    assert.equal((await call('admin/moderate',{id:review.id,version:1,action:'__proto__'},auth)).status,400);
    assert.equal((await call('admin/moderate',{id:review.id,version:1,action:'approve'},auth)).status,200);
    const publicData=await (await call('reviews')).json();assert.equal(publicData.reviews.length,1);assert.equal(publicData.reviews[0].email,undefined);assert.equal(publicData.reviews[0].version,undefined);
    assert.equal((await call('admin/moderate',{id:review.id,version:1,action:'reject'},auth)).status,409);
    assert.equal((await call('admin/moderate',{id:review.id,version:2,action:'unpublish'},auth)).status,200);assert.equal((await (await call('reviews')).json()).reviews.length,0);
    assert.equal((await call('admin/moderate',{id:review.id,version:3,action:'reject'},auth)).status,200);
    store.close();store=await createReviewStore({file,includeExisting:false});handler=createReviewHandler({store,config,now:()=>time});assert.equal((await (await call('admin/reviews?status=rejected',undefined,auth)).json()).reviews.length,1);
    assert.equal((await call('admin/logout',{},auth)).status,200);assert.equal((await call('admin/reviews',undefined,auth)).status,401);
    for(let i=0;i<5;i++)assert.equal((await call('reviews',{...submission,review:`Review ${i}`},{ip:'limited'})).status,202);
    assert.equal((await call('reviews',{...submission,review:'Review 6'},{ip:'limited'})).status,429);
    const fresh=await call('admin/login',{username:'admin',password:'test-password'});const expired={headers:{cookie:fresh.headers.get('set-cookie').split(';')[0]}};time+=9*3600000;assert.equal((await call('admin/session',undefined,expired)).status,401);
    await assert.rejects(createReviewStore({production:true}),/DATABASE_URL/);
  }finally{store.close();await rm(dir,{recursive:true,force:true});}
});
