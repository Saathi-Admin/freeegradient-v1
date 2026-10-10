// Original floral colour fields: soft petal-shaped diffusion, no source artwork.
const designs=[
 ['petal-haze','Petal haze',['#eee6f7','#ef81b4','#9984dc','#fff2bc'],[[18,80,65,92,1],[85,17,71,65,2],[49,45,38,45,3]]],
 ['iris-diffusion','Iris diffusion',['#100d35','#806df4','#ef99ce','#659fde'],[[5,30,70,42,1],[55,88,47,72,2],[98,12,40,77,3],[58,40,25,40,1]]],
 ['marigold-air','Marigold air',['#fdf3d8','#f68455','#eac667','#f5a7c3'],[[80,0,47,95,1],[25,75,78,66,2],[70,100,40,75,3]]],
 ['bluebell-drift','Bluebell drift',['#e3f2f4','#779ce5','#ae93d8','#f4c5cf'],[[12,10,42,74,1],[45,68,64,45,2],[98,50,45,100,3],[70,4,20,55,1]]],
 ['orchid-vapour','Orchid vapour',['#30153c','#cc65ba','#7761de','#f8b7a1'],[[50,45,54,78,1],[0,95,58,64,2],[105,8,72,56,3]]],
 ['pollen-light','Pollen light',['#f2f5d5','#99c587','#e3d568','#a4dfe0'],[[0,55,76,45,1],[65,15,43,91,2],[92,90,54,58,3],[35,85,20,37,2]]],
 ['rosewater-fold','Rosewater fold',['#f7e4e9','#ea7d9f','#b298d2','#fff4db'],[[22,0,37,98,1],[72,76,62,39,2],[5,90,53,47,3]]],
 ['tulip-afterhours','Tulip afterhours',['#1c1831','#eb845f','#a861b5','#efca8a'],[[7,96,77,65,1],[96,0,76,68,2],[53,58,31,37,3]]],
 ['lilac-breath','Lilac breath',['#f6f0fa','#bb87d9','#96bdde','#f4a9c3'],[[53,-5,82,54,1],[45,110,70,67,2],[2,45,24,68,3],[100,55,35,81,1]]],
 ['hibiscus-glow','Hibiscus glow',['#392237','#ee708a','#f7ac63','#83afab'],[[80,46,39,102,1],[46,46,34,76,2],[4,55,53,55,3]]],
 ['magnolia-mist','Magnolia mist',['#eff0e3','#d7b2cf','#87b4ac','#f5d68e'],[[10,25,63,62,1],[90,85,62,62,2],[52,52,30,47,3],[50,-15,75,27,2]]],
 ['dahlia-dusk','Dahlia dusk',['#171b3b','#8b65d4','#d68baf','#70b2c9'],[[18,10,55,96,1],[86,90,56,88,2],[57,48,31,60,3],[7,110,47,36,2]]],
];
const variants=[
 ['Iris night','dark',['#18112d','#9263da','#dc8fc0','#708ad8'],['purple','pink']],
 ['Lagoon bloom','dark',['#092b32','#409c9d','#a9cabc','#597bae'],['blue','green','mint']],
 ['Ember petals','dark',['#32202d','#e68e71','#b36194','#eac792'],['orange','pink']],
 ['Porcelain petals','light',['#f8f4fd','#a397df','#c2dce7','#e9a7c8'],['lavender','blue','pink']],
 ['Peach bloom','light',['#fff5e9','#edab85','#ebc3d2','#d6c2eb'],['peach','orange','pink']],
 ['Garden light','light',['#f5f7e6','#a5c396','#d6dfab','#9cc8c3'],['green','jade','mint']],
 ['Rose silk','light',['#fdf0f4','#e991b6','#b5a4da','#f0dabb'],['rose','pink','purple']],
];
export const floralRecipes=designs.map(([slug,name,colors,petals])=>({slug,name,category:'floral',shape:'study',study:'floral',position:0,petals,tags:['floral','petal','soft','blur','botanical','fleurox-inspired'],palettes:[{id:'01',name:'Original bloom',mode:colors[0]==='#100d35'||colors[0]==='#30153c'||colors[0]==='#1c1831'||colors[0]==='#392237'||colors[0]==='#171b3b'?'dark':'light',colors,tags:['floral','pink','purple']},...variants.map(([name,mode,colors,tags],i)=>({id:String(i+2).padStart(2,'0'),name,mode,colors,tags}))]}));
export function floralComposition(recipe,palette){
 const defs=[],layers=[],[base]=palette.colors;
 for(const [x,y,rx,ry,index] of recipe.petals){
  const color=palette.colors[index],id=`petal${defs.length}`;
  defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${x*16} ${y*9}) scale(${rx*16} ${ry*9})"><stop stop-color="${color}" stop-opacity=".94"/><stop offset=".32" stop-color="${color}" stop-opacity=".66"/><stop offset=".7" stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
  layers.push({css:`radial-gradient(ellipse ${rx}% ${ry}% at ${x}% ${y}%,${color}f0 0%,${color}a8 32%,${color}33 70%,${color}00 100%)`,svg:`<rect width="1600" height="900" fill="url(#${id})"/>`});
 }
 // Broad translucent petal folds give each field an organic directional structure.
 defs.push('<filter id="petalsoft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="28"/></filter>');
 const folds=recipe.petals.map(([x,y,rx,ry,index],i)=>{
  const color=palette.colors[index],id=`fold${i}`;
  defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${palette.colors[3]}" stop-opacity=".05"/><stop offset=".44" stop-color="${color}" stop-opacity=".7"/><stop offset=".72" stop-color="${palette.colors[3]}" stop-opacity=".55"/><stop offset="1" stop-color="${base}" stop-opacity="0"/></linearGradient>`);
  const angle=[-38,32,76,-62][i%4],sx=rx/60,sy=ry/70;
  return `<path d="M0 -470 C-390 -340 -290 50 0 460 C290 80 330 -290 0 -470Z" transform="translate(${x*16} ${y*9}) rotate(${angle}) scale(${sx} ${sy})" fill="url(#${id})" filter="url(#petalsoft)"/>`;
 }).join('');
 return {background:undefined,defs:defs.join(''),content:`<rect width="1600" height="900" fill="${base}"/>`+layers.map(l=>l.svg).join('')+folds};
}
