// Original static light studies. Geometry is authored here; no reference artwork is embedded.
const palettes = [
  ['Tidal violet', 'dark', ['#10132b','#5966d9','#e9b0cc','#8fe1d5'], ['blue','purple','mint']],
  ['Copper lagoon', 'dark', ['#071e25','#158f99','#ffae83','#e0f4cf'], ['teal','orange','copper']],
  ['Mulberry ember', 'dark', ['#260e28','#9c3c83','#ff8e64','#ffe2af'], ['purple','pink','orange']],
  ['Moss lantern', 'dark', ['#10231f','#558c68','#d5ed96','#f0be83'], ['green','lime','gold']],
  ['Apricot porcelain', 'light', ['#fff2e8','#e8a1b1','#8f9cdb','#fff6d8'], ['peach','pink','pastel']],
  ['Glacial lilac', 'light', ['#eef4ff','#90b6d8','#b59ddc','#dbfff1'], ['blue','lavender','mint']],
  ['Pistachio rose', 'light', ['#f2f4e7','#99baa1','#e5abc2','#fff0c6'], ['green','rose','cream']],
  ['Pearl tangerine', 'light', ['#fff6ef','#e7aa78','#bc9ed1','#fffbdc'], ['orange','purple','pearl']],
].map(([name,mode,colors,tags],i)=>({id:String(i+1).padStart(2,'0'),name,mode,colors,tags}));

// Append to prism templates only, preserving the original eight palette IDs.
const prismPalettes = [
  ['Cobalt signal','dark',['#071127','#175fff','#45b9ff','#d6f7ff'],['blue','cobalt','cyan']],
  ['Cobalt daylight','light',['#f1f6ff','#a4c8ff','#2465e8','#a5f0ff'],['blue','cobalt','ice']],
  ['Tangerine flare','dark',['#241007','#ed5c16','#ff9d3c','#fff0ba'],['orange','amber','warm']],
  ['Apricot sunlight','light',['#fff6eb','#ffc591','#f47724','#ffedbf'],['orange','apricot','peach']],
  ['Crimson pulse','dark',['#240a16','#b51f49','#ff5265','#ffe4cf'],['red','crimson','coral']],
  ['Coral daylight','light',['#fff1f1','#ffb4b7','#d83856','#fff0df'],['red','coral','rose']],
  ['Citron lantern','dark',['#1d1b07','#897722','#e9cd25','#fff7bf'],['yellow','gold','lemon']],
  ['Lemon daylight','light',['#fffdf0','#e4d96a','#a6b544','#ffedac'],['yellow','lemon','gold']],
].map(([name,mode,colors,tags],i)=>({id:String(i+9).padStart(2,'0'),name,mode,colors,tags}));

const designs = [
  ['estuary-fold','Estuary fold','fluid-fields','flow',0],
  ['suspended-current','Suspended current','fluid-fields','flow',1],
  ['petal-confluence','Petal confluence','fluid-fields','flow',2],
  ['satin-delta','Satin delta','fluid-fields','flow',3],
  ['lumen-stair','Lumen stair','prismatic-light','prism',0],
  ['refracted-saddle','Refracted saddle','prismatic-light','prism',1],
  ['spectral-fanlight','Spectral fanlight','prismatic-light','prism',2],
  ['glass-cascade','Glass cascade','prismatic-light','prism',3],
];
export const lightFormRecipes = designs.map(([slug,name,category,family,position],i)=>({
  slug,name,category,family,position,shape:'study',study:'light-form',
  tags:[family,'light','abstract',...(family==='flow'?['organic','silk','mesh']:['glass','strips','refraction'])],
  palettes:[...palettes.map((_,p)=>({...palettes[(p+i)%palettes.length],id:String(p+1).padStart(2,'0')})),...(family==='prism'?prismPalettes:[])],
}));

export function lightFormComposition(recipe,palette){
  const [base,a,b,c]=palette.colors, p=recipe.position;
  const defs=[],layers=[`<rect width="1600" height="900" fill="${base}"/>`];
  const gradient=(id,stops,x1=0,y1=0,x2=1,y2=1)=>{
    defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([offset,color,opacity=1])=>`<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('')}</linearGradient>`);
    return `url(#${id})`;
  };
  const blur=(id,n)=>defs.push(`<filter id="${id}" x="-60%" y="-80%" width="220%" height="260%"><feGaussianBlur stdDeviation="${n}"/></filter>`);
  blur('soft',38);blur('bloom',85);blur('edge',6);
  const wash=gradient('wash',[[0,a,0],[.35,a,.65],[.7,b,.55],[1,c,0]]);
  layers.push(`<ellipse cx="${420+p*240}" cy="560" rx="940" ry="570" fill="${wash}" filter="url(#bloom)"/>`);
  if(recipe.family==='flow'){
    const paths=[
      ['M-150 680 C200 860 410 70 860 310 S1300 790 1760 120 L1800 1000 L-150 1000Z','M-100 510 C410 950 490 -30 1000 320 S1470 690 1730 140'],
      ['M-100 -100 L950 -100 C1390 80 1270 370 860 430 S190 760 560 1030 L-100 1030Z','M700 -180 C1560 130 1060 370 650 520 S190 820 710 1040'],
      ['M-100 180 C560 -100 1060 20 820 400 S1130 920 1750 560 L1750 1050 L-100 1050Z','M-170 120 C680 -80 1080 180 780 460 S1240 1030 1760 510'],
      ['M-120 920 C280 60 690 40 900 520 S1280 890 1750 260 L1750 1060 L-120 1060Z','M-100 840 C220 -10 690 130 840 520 S1280 1040 1740 220'],
    ][p];
    const fill=gradient('river',[[0,c],[.22,a],[.48,b],[.68,c],[1,a]],0,0,1,.8);
    const seam=gradient('seam',[[0,c,0],[.3,c,.85],[.55,a],[.8,b,.8],[1,b,0]]);
    layers.push(`<path d="${paths[0]}" fill="${fill}" filter="url(#soft)"/><path d="${paths[1]}" fill="none" stroke="${seam}" stroke-width="62" filter="url(#soft)"/>`);
  }else if(recipe.family==='prism'){
    const count=[26,30,24,28][p],width=1800/count;
    for(let i=0;i<count;i++){
      const t=i/(count-1),x=-100+i*width;
      const y=[()=>690-420*t+110*Math.sin(t*6.28),()=>250+390*Math.sin(t*Math.PI)**2,()=>690-390*Math.sin(t*Math.PI),()=>180+470*t+80*Math.sin(t*10)][p]();
      const fill=gradient('strip'+i,[[0,a,0],[.22,a,.45],[.48,b,.9],[.65,c],[.81,b,.8],[1,base]],0,0,0,1);
      layers.push(`<rect x="${x.toFixed(2)}" y="${(y-270).toFixed(2)}" width="${(width+.5).toFixed(2)}" height="${(1100-y+270).toFixed(2)}" fill="${fill}"/>`);
      layers.push(`<path d="M${x.toFixed(2)} ${y-80}v${850-y}" stroke="${c}" stroke-opacity=".12"/>`);
    }
    // Oblique refraction gives the fan its own silhouette.
    if(p===2) layers[layers.length-1]+=`<path d="M-100 800L1700 100" stroke="${c}" stroke-width="100" opacity=".17" filter="url(#soft)"/>`;
  }
  defs.push('<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>');
  layers.push('<rect width="1600" height="900" filter="url(#grain)" opacity=".025"/>');
  return {background:undefined,defs:defs.join(''),content:layers.join('')};
}
