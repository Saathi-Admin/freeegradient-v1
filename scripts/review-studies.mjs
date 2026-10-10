import fs from 'node:fs/promises';import sharp from 'sharp';
const catalogue=JSON.parse(await fs.readFile('src/data/generated-gradients.json','utf8'));
const selected=catalogue.filter(g=>g.study);
await fs.mkdir('reports',{recursive:true});
const overlays=[];for(let i=0;i<selected.length;i++){
 const v=selected[i].variations[0];const input=await sharp('public'+v.src).resize(320,180).png().toBuffer();
 overlays.push({input,left:(i%4)*336,top:Math.floor(i/4)*196});
 for(const variation of selected[i].variations){const svg=await fs.readFile('public'+variation.src,'utf8');if(/<text\b|<image\b/i.test(svg))throw new Error('Unexpected text or embedded reference image '+variation.id);}
}
await sharp({create:{width:1328,height:Math.ceil(selected.length/4)*196-16,channels:3,background:'#0a0a0b'}}).composite(overlays).png().toFile('reports/reference-studies.png');
await fs.writeFile('reports/reference-studies.json',JSON.stringify(selected.map(g=>({slug:g.slug,name:g.name,category:g.category,preview:g.variations[0].src,variations:g.variations.length})),null,2));
console.log('Verified pure SVG artwork and rendered '+selected.length+' original studies.');
