import { readFile,readdir,mkdir,writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);
const list=JSON.parse(await readFile(new URL('src/data/tech-reference-manifest.json',root),'utf8'));
const dir=new URL('src/data/artwork/tech/',root),names=new Set(await readdir(dir));
const ready=list.filter(d=>names.has(`${d.slug}-original.png`));
await mkdir(new URL('reports/tech-backgrounds/',root),{recursive:true});
for(let start=0;start<ready.length;start+=12) {
 const group=ready.slice(start,start+12),layers=[];
 for(const [i,d] of group.entries()) {
  const left=(i%4)*320,top=Math.floor(i/4)*235;
  layers.push({input:await sharp(fileURLToPath(new URL(`${d.slug}-original.png`,dir))).resize(320,205,{fit:'cover'}).png().toBuffer(),left,top});
  const label=`<svg width="320" height="30"><rect width="320" height="30" fill="#ffffff"/><text x="8" y="20" font-family="Arial" font-size="12" fill="#17212d">${d.id} ${d.name}</text></svg>`;
  layers.push({input:Buffer.from(label),left,top:top+205});
 }
 await sharp({create:{width:1280,height:Math.ceil(group.length/4)*235,channels:3,background:'#ffffff'}}).composite(layers).png().toFile(fileURLToPath(new URL(`reports/tech-backgrounds/sheet-${1+start/12}.png`,root)));
}
await writeFile(new URL('reports/tech-backgrounds/status.json',root),JSON.stringify({ready:ready.length,target:list.length,missing:list.filter(d=>!ready.includes(d)).map(d=>d.slug)},null,2));
const galleryLayers=[];
for(const [i,d] of ready.entries()) {
 const left=(i%6)*240,top=Math.floor(i/6)*180;
 galleryLayers.push({input:await sharp(fileURLToPath(new URL(`${d.slug}-original.png`,dir))).resize(240,160,{fit:'cover'}).png().toBuffer(),left,top});
 galleryLayers.push({input:Buffer.from(`<svg width="240" height="20"><rect width="240" height="20" fill="white"/><text x="5" y="14" font-family="Arial" font-size="10" fill="#17212d">${d.id} ${d.name}</text></svg>`),left,top:top+160});
}
if(ready.length) await sharp({create:{width:1440,height:Math.ceil(ready.length/6)*180,channels:3,background:'#fff'}}).composite(galleryLayers).png().toFile(fileURLToPath(new URL('reports/tech-backgrounds/all-backgrounds.png',root)));
console.log(`Prepared preview sheets: ${ready.length}/${list.length} backgrounds.`);
