import assert from 'node:assert/strict';
import { readFile,stat,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('src/data/tech-reference-manifest.json',root),'utf8'));
const catalogue=JSON.parse(await readFile(new URL('src/data/generated-gradients.json',root),'utf8'));
const tech=catalogue.filter(g=>g.category==='tech-atmospheres');
assert.equal(manifest.length,54);assert.equal(tech.length,54,'Every reference interpretation must be on the website');
const hashes=new Set();
for(const design of manifest) {
 const template=tech.find(g=>g.slug===design.slug);assert(template,`Missing ${design.slug}`);
 assert.equal(template.variations.length,1,'Reference colours must not be replaced with generic recolours');
 const v=template.variations[0];
 assert.equal(v.cssKind,'asset');assert.equal(v.sourceKind,'original-raster');assert.equal(v.mode,design.mode);
 assert.deepEqual(v.colors,design.colors);
 const source=await readFile(new URL(`src/data/artwork/tech/${design.slug}-original.png`,root));
 const hash=createHash('sha256').update(source).digest('hex');assert(!hashes.has(hash),`Duplicate art ${design.slug}`);hashes.add(hash);
 const meta=await sharp(source).metadata();assert(meta.width>=1536&&meta.height>=1024,`Insufficient size ${design.slug}`);
 const download=await readFile(new URL(`public/gradients/downloads/tech/${v.id}.png`,root));assert(source.equals(download),`PNG must preserve original detail ${design.slug}`);
 for(const path of [v.thumbnail,v.src,v.backgroundSrc])assert((await stat(new URL(`public${path}`,root))).size>0,`Missing ${path}`);
 const endpoint=JSON.parse(await readFile(new URL(`public/gradients/catalogue/templates/${design.slug}.json`,root),'utf8'));assert.equal(endpoint.variations[0].id,v.id);
}
assert.equal((await readdir(new URL('public/gradients/downloads/tech/',root))).filter(n=>n.endsWith('.png')).length,54);
assert((await stat(new URL('public/gradients/downloads/tech-atmospheres.zip',root))).size>0);
console.log(JSON.stringify({originalBackgrounds:tech.length,uniqueImages:hashes.size,readyPngs:54,imageOnly:true,referencePalettes:true},null,2));
