import fs from 'node:fs/promises';
import sharp from 'sharp';
const catalogue=JSON.parse(await fs.readFile('src/data/generated-gradients.json','utf8'));
const templates=catalogue.filter(template=>template.category==='prismatic-light');
const tiles=[];
for(const [row,template] of templates.entries()) {
  const variations=template.variations.slice(8);
  if(variations.length!==8)throw new Error(`Expected eight new palettes: ${template.slug}`);
  for(const [col,variation] of variations.entries()) {
    const left=col*256,top=row*180;
    tiles.push({input:await sharp('public'+variation.thumbnail).resize(248,139).png().toBuffer(),left,top});
    const label=Buffer.from(`<svg width="248" height="34"><text x="0" y="13" font-family="Arial" font-size="11" fill="#ffffff">${template.name}</text><text x="0" y="29" font-family="Arial" font-size="11" fill="#dddddd">${variation.name} · ${variation.mode}</text></svg>`);
    tiles.push({input:label,left,top:top+139});
  }
}
await sharp({create:{width:2040,height:716,channels:3,background:'#141416'}}).composite(tiles).png().toFile('reports/prismatic-new-palettes.png');
console.log('Rendered all 32 new prism variations.');
