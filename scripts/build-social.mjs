import sharp from 'sharp';import fs from 'node:fs/promises';
const gs=JSON.parse(await fs.readFile('src/data/generated-gradients.json','utf8'));
const title=Buffer.from(`<svg width="1200" height="630"><rect width="1200" height="630" fill="#0b0b0c"/><text x="60" y="82" fill="white" font-family="Arial" font-size="32">freeegradients.</text><text x="60" y="168" fill="white" font-family="Arial" font-size="54" font-weight="bold">Beautiful gradients. Completely free.</text><text x="60" y="224" fill="#b8b8b8" font-family="Arial" font-size="27">Copy CSS. Download SVG, PNG or JPEG. No sign-up.</text></svg>`);
const overlays=[];
for(const [i,slug] of ['dawnlight','velvet','nectar','opaline'].entries()){
 const g=gs.find(g=>g.slug===slug),v=g.variations[(i*2+1)%g.variations.length];
 const mask=Buffer.from('<svg width="255" height="255"><rect width="255" height="255" rx="24" fill="white"/></svg>');
 const input=await sharp('public'+v.src).resize(255,255,{fit:'cover'}).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
 overlays.push({input,left:60+i*275,top:295});
}
await fs.mkdir('public/social',{recursive:true});await sharp(title).composite(overlays).png().toFile('public/social/freeegradients.png');
