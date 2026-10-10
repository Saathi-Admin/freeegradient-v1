import fs from 'node:fs/promises';
import sharp from 'sharp';
const catalogue=JSON.parse(await fs.readFile('src/data/generated-gradients.json','utf8'));
const added=catalogue.filter(g=>g.study==='premium');
if(added.length!==100) throw new Error('Expected 100 premium templates');
await fs.mkdir('reports',{recursive:true});
for(const category of ['landing','footer']) {
  const items=added.filter(g=>g.category===category),tiles=[];
  if(items.length!==50) throw new Error(`Expected 50 ${category} templates`);
  for(const [i,g] of items.entries()) {
    const top=Math.floor(i/5)*132,left=(i%5)*200;
    tiles.push({input:await sharp('public'+g.variations[0].thumbnail).resize(200,112).toBuffer(),left,top});
    tiles.push({input:Buffer.from(`<svg width="200" height="20"><rect width="200" height="20" fill="#111"/><text x="5" y="14" font-size="10" fill="white">${g.name}</text></svg>`),left,top:top+112});
  }
  await sharp({create:{width:1000,height:1320,channels:3,background:'#111'}}).composite(tiles).png().toFile(`reports/premium-${category}-review.png`);
}
const pixels=await Promise.all(catalogue.map(async g=>({g,pixels:await sharp('public'+g.variations[0].thumbnail).resize(16,9).removeAlpha().raw().toBuffer()})));
const flagged=[];
for(let i=0;i<pixels.length;i++)for(let j=i+1;j<pixels.length;j++) {
  if(pixels[i].g.study!=='premium'&&pixels[j].g.study!=='premium')continue;
  let sum=0;for(let k=0;k<pixels[i].pixels.length;k++){const d=pixels[i].pixels[k]-pixels[j].pixels[k];sum+=d*d;}
  const rms=Math.sqrt(sum/pixels[i].pixels.length);
  if(rms<5)flagged.push({a:pixels[i].g.slug,b:pixels[j].g.slug,rms:Number(rms.toFixed(2))});
}
await fs.writeFile('reports/premium-similarity.json',JSON.stringify({newTemplates:added.length,newVariations:added.reduce((sum,g)=>sum+g.variations.length,0),metric:'16x9 RGB RMS < 5, new templates compared with entire library; review signal, not proof of equivalence',flagged},null,2));
console.log(JSON.stringify({newTemplates:added.length,newVariations:800,flagged}));
