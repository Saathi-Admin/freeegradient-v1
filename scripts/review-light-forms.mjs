import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { lightFormRecipes, lightFormComposition } from '../src/data/light-form-recipes.mjs';

await mkdir('reports', { recursive: true });
const tiles=[];
for(const [i,recipe] of lightFormRecipes.entries()){
  // Show the first palette and a palette with the opposite design mode.
  const first=recipe.palettes[0];
  const alternate=recipe.palettes.find(p=>p.mode!==first.mode);
  for(const [j,palette] of [first,alternate].entries()){
    const {defs,content}=lightFormComposition(recipe,palette);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs>${defs}</defs>${content}</svg>`;
    const input=await sharp(Buffer.from(svg)).resize(400,225).png().toBuffer();
    const left=(i%3)*416,top=Math.floor(i/3)*510+j*245;
    tiles.push({input,left,top});
    const label=Buffer.from(`<svg width="400" height="20"><text x="0" y="15" font-family="Arial" font-size="12" fill="#eeeeee">${recipe.name} · ${palette.name}</text></svg>`);
    tiles.push({input:label,left,top:top+225});
  }
}
await sharp({create:{width:1232,height:Math.ceil(lightFormRecipes.length/3)*510-20,channels:3,background:'#14151b'}}).composite(tiles).png().toFile('reports/light-form-studies.png');
await writeFile('reports/light-form-studies.json',JSON.stringify(lightFormRecipes.map(r=>({slug:r.slug,category:r.category,variations:r.palettes.length})),null,2));
console.log(`Rendered ${lightFormRecipes.length} original compositions in light and dark palettes.`);
