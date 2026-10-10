import fs from 'node:fs/promises';
import sharp from 'sharp';
const catalogue=JSON.parse(await fs.readFile('src/data/generated-gradients.json','utf8'));
const values=[];
for(const g of catalogue){const pixels=await sharp('public'+g.variations[0].thumbnail).resize(16,9).removeAlpha().raw().toBuffer();values.push({g,pixels});}
const nearest=[];
for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++){
 let sum=0;for(let k=0;k<values[i].pixels.length;k++){const d=values[i].pixels[k]-values[j].pixels[k];sum+=d*d;}
 const rms=Math.sqrt(sum/values[i].pixels.length);
 if(rms<5)nearest.push({a:values[i].g.slug,b:values[j].g.slug,rms:Number(rms.toFixed(2))});
}
nearest.sort((a,b)=>a.rms-b.rms);
await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/template-similarity.json',JSON.stringify({templates:catalogue.length,metric:'16x9 RGB RMS, all collections; less than 5 flagged for review, not proof of equivalence',flaggedPairs:nearest},null,2));
const selected=catalogue.filter((g,i)=>i<100?i%8===0:g.composition?.structure%3===0&&g.position%3===0);
const tiles=[];
for(let i=0;i<selected.length;i++){
 const g=selected[i],img=await sharp('public'+g.variations[0].thumbnail).resize(160,90).toBuffer();
 const label=Buffer.from(`<svg width="160" height="24"><rect width="160" height="24" fill="#111"/><text x="4" y="16" fill="white" font-size="9">${g.name.replaceAll('&','&amp;')}</text></svg>`);
 tiles.push({input:img,left:(i%8)*160,top:Math.floor(i/8)*114},{input:label,left:(i%8)*160,top:Math.floor(i/8)*114+90});
}
await sharp({create:{width:1280,height:Math.ceil(selected.length/8)*114,channels:3,background:'#111'}}).composite(tiles).png().toFile('reports/template-review.png');
console.log(JSON.stringify({templates:catalogue.length,reviewTiles:selected.length,flaggedPairs:nearest.length,closest:nearest.slice(0,6)}));
