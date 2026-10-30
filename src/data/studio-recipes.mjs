import { existsSync, readFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('./studio-manifest.json',import.meta.url),'utf8'));
const variants=[
 {id:'01',name:'Midnight spectrum',mode:'dark',colors:['#080b24','#267bdf','#be54cc'],tags:['blue','purple','cyan','night']},
 {id:'02',name:'Pearl daylight',mode:'light',colors:['#faf4ed','#f3b8b0','#b7c7ed'],tags:['peach','pastel','lavender','light']},
 {id:'03',name:'Ember jade',mode:'dark',colors:['#10251f','#e59b47','#45b69a'],tags:['green','orange','teal','amber']},
];
// Publish every saved image, including designs with only one finished colourway.
// Keep its original colourway ID; missing files are never filled with new artwork.
export const studioRecipes=manifest.flatMap(d=>{
 const available=variants.filter(v=>existsSync(new URL(`./artwork/studio/${d.slug}-${v.id}.png`,import.meta.url)));
 if(!available.length) return [];
 return [{
 slug:d.slug,name:d.name,category:d.category,shape:'artwork',position:d.position,
 tags:[d.category,'studio','abstract','image'],palettes:available,
 ...(available.length===1?{singlePalette:true}:{}),
 sourceImages:Object.fromEntries(available.map(v=>[v.id,`artwork/studio/${d.slug}-${v.id}.png`])),
 }];
});
