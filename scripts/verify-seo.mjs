import assert from 'node:assert/strict';
import {pageSeo} from '../src/data/seo.ts';
assert.equal(pageSeo({path:'/',production:true}).blockIndex,true);
assert.equal(pageSeo({site:new URL('https://example.com'),path:'/',production:false}).blockIndex,true);
const live=pageSeo({site:new URL('https://example.com'),path:'/gradients/dawnlight-01/',production:true});
assert.equal(live.blockIndex,false);assert.equal(live.canonical,'https://example.com/gradients/dawnlight-01/');
assert.equal(pageSeo({site:new URL('https://example.com'),path:'/playground/',production:true,noindex:true}).blockIndex,true);
console.log('SEO configuration checks passed: previews blocked, permanent production origin indexable, canonical template paths, utility pages blocked.');
