import { existsSync,readFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('./tech-reference-manifest.json',import.meta.url),'utf8'));
export const techReferenceRecipes=manifest.filter(d=>existsSync(new URL(`./artwork/tech/${d.slug}-original.png`,import.meta.url))).map((d,position)=>({
 slug:d.slug,name:d.name,category:'tech-atmospheres',shape:'artwork',position,
 singlePalette:true,tags:['tech','background','image',...d.slug.replace('tech-','').split('-')],
 palettes:[{id:'01',name:'Reference palette',mode:d.mode,colors:d.colors,tags:[...new Set(d.colors.map(hex=>{
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  if(delta<20)return 'monochrome';
  const hue=(((max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4)*60)+360)%360;
  return hue<15||hue>=345?'red':hue<45?'orange':hue<75?'yellow':hue<160?'green':hue<190?'mint':hue<255?'blue':hue<290?'purple':'pink';
 })),d.mode]}],
 sourceImages:{'01':`artwork/tech/${d.slug}-original.png`},
}));
