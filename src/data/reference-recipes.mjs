import { premiumComposition } from './premium-recipes.mjs';
import { floralComposition } from './floral-recipes.mjs';
import { colourCloudComposition } from './colour-cloud-recipes.mjs';
import { haloHorizonComposition } from './halo-horizon-recipes.mjs';
// Hand-composed studies inspired by supplied visual references. Artwork has no text or overlays.
const studies = [
 ['ion-ribbon','Ion ribbon','ribbon','#020518','#0755ed','#17d8dd','#c88eea','dark',['blue','cyan','glow','ribbon']],
 ['spectral-rise','Spectral rise','rise','#141517','#9d36e9','#ed3289','#efe5f6','dark',['purple','pink','grain','horizon']],
 ['ember-well','Ember well','ember','#260508','#ff2910','#ff7b22','#070317','dark',['orange','red','glow']],
 ['acid-pocket','Acid pocket','acid','#bfdc00','#aff00b','#6130f2','#281747','dark',['yellow','lime','purple']],
 ['jade-vault','Jade vault','vault','#001b0a','#17b64a','#54ec79','#000a04','dark',['green','glow']],
 ['cyan-crossing','Cyan crossing','crossing','#011c1a','#65daf0','#e783d9','#00120f','dark',['blue','pink','mesh']],
 ['orchid-well','Orchid well','well','#2c073c','#e55ac9','#a635e8','#140b20','dark',['purple','pink','glow']],
 ['electric-capsule','Electric capsule','capsule','#020e25','#3030de','#6ddafa','#051025','dark',['blue','neon','glow']],
 ['rose-current','Rose current','rose','#de161d','#f7c7d9','#e88bd1','#f6b5cf','light',['pink','red','rose']],
 ['cobalt-cloud','Cobalt cloud','orb','#ffffff','#0756ed','#80cbee','#ab9bdb','light',['blue','white','grain','organic']],
 ['daydream-drift','Daydream drift','drift','#e9ecef','#008fef','#b294ec','#ff7e4b','light',['blue','purple','orange','pastel']],
 ['solar-veil','Solar veil','solar','#572b8c','#f26a24','#ffba53','#6987a0','dark',['orange','purple','sunset']],
 ['blush-atmosphere','Blush atmosphere','blush','#dfd6ed','#f252a6','#aabecd','#aa4b9f','light',['pink','pastel','mesh']],
 ['arctic-tide','Arctic tide','arctic','#193546','#0db8d3','#1b7fdc','#065b98','dark',['blue','cyan','wave']],
 ['coral-tension','Coral tension','tension','#010605','#ef1408','#007c80','#dd9c7d','dark',['red','teal','duotone']],
];
studies.push(
 ['reeded-lustre','Reeded lustre','reeded','#163e28','#477231','#e1e9df','#b5c988','dark',['green','glass','ripple','silver']],
 ['tidal-mist','Tidal mist','sea','#063d48','#137885','#d5ebee','#eadee9','light',['blue','teal','mist']],
 ['chromatic-seam','Chromatic seam','seam','#02051d','#345beb','#ed7abd','#b8e8fb','dark',['blue','pink','horizon','reflection']],
 ['bloom-cushion','Bloom cushion','cushion','#101327','#4765ed','#f3d4f1','#e06d94','dark',['blue','pink','glow']],
 ['fern-contour','Fern contour','fern','#132a11','#8eaa59','#d0e3a5','#355224','dark',['green','organic','wave']],
 ['aurora-fold','Aurora fold','holo-fold','#01070d','#286be7','#f4b9d4','#f9e6b3','dark',['holographic','blue','pink','silk']],
 ['pearl-current','Pearl current','holo-current','#06101c','#67d9d4','#bca5ee','#ffb5d2','dark',['holographic','mint','purple','glass']],
 ['chromatic-sail','Chromatic sail','holo-sail','#120c25','#7979e7','#e7b8dd','#eaf5ad','dark',['holographic','purple','prism']],
 ['opal-loop','Opal loop','holo-loop','#f2f5f4','#8ad9d9','#bda6ec','#ffd2a5','light',['holographic','pastel','pearl']],
 ['prism-fan','Prism fan','holo-fan','#040a18','#2384c9','#ee9fd9','#d9f9cc','dark',['holographic','blue','pink','glass']],
 ['silk-orbit','Silk orbit','holo-orbit','#f8f3fb','#9cb7ed','#dc9ec6','#e9f5be','light',['holographic','lavender','silk']]
);
const alternates = [
 ['Midnight iris','dark',['#0c0923','#5835d4','#a363ef','#eacbf9'],['purple','lavender']],
 ['Lagoon night','dark',['#021917','#087c88','#46d7c5','#b9f3e5'],['green','mint','blue']],
 ['Ember dusk','dark',['#210c13','#ca314d','#f37957','#ffd0a0'],['orange','pink']],
 ['Porcelain blue','light',['#f9fcff','#508fe0','#9dddeb','#d4c5ec'],['blue','pastel']],
 ['Peach silk','light',['#fff7f1','#f09872','#f5b8ce','#eadfd5'],['peach','pink','orange']],
 ['Sage light','light',['#f6fbf4','#6ba891','#bae4c6','#d5e5a2'],['green','jade']],
 ['Lilac mist','light',['#faf4ff','#ad80de','#edb4dd','#d6e5f4'],['purple','lavender','rose']],
];
export const referenceRecipes=studies.map(([slug,name,study,base,one,two,three,mode,tags])=>({slug,name,category:study.startsWith('holo-')?'iridescent':['reeded','fern'].includes(study)?'liquid':'studies',shape:'study',study,position:0,tags,
 palettes:[{id:'01',name:'Original study',mode,colors:[base,one,two,three],tags},...alternates.map(([name,mode,colors,tags],i)=>({id:String(i+2).padStart(2,'0'),name,mode,colors,tags}))]}));

export function referenceComposition(recipe,palette){
 if(recipe.study==='premium') return premiumComposition(recipe,palette);
 if(recipe.study==='floral') return floralComposition(recipe,palette);
 if(recipe.study==='colour-cloud') return colourCloudComposition(recipe,palette);
 if(recipe.study==='halo-horizon') return haloHorizonComposition(recipe,palette);
 const [base,a,b,c]=palette.colors;
 const defs=[],layers=[];
 const alpha=(hex,n)=>hex+Math.round(n*255).toString(16).padStart(2,'0');
 const markup=stops=>stops.map(([color,stop])=>`<stop offset="${stop}%" stop-color="${color.slice(0,7)}" stop-opacity="${color.length===9?parseInt(color.slice(7),16)/255:1}"/>`).join('');
 const solid=color=>layers.push({css:`linear-gradient(${color},${color})`,svg:`<rect width="1600" height="900" fill="${color}"/>`});
 const radial=(x,y,rx,ry,stops)=>{
  const id='r'+defs.length;defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${x*16} ${y*9}) scale(${rx*16} ${ry*9})">${markup(stops)}</radialGradient>`);
  layers.push({css:`radial-gradient(ellipse ${rx}% ${ry}% at ${x}% ${y}%,${stops.map(([col,s])=>`${col} ${s}%`).join(',')})`,svg:`<rect width="1600" height="900" fill="url(#${id})"/>`});
 };
 const glow=(x,y,rx,ry,col,strength=1)=>radial(x,y,rx,ry,[[alpha(col,strength),0],[alpha(col,strength*.6),40],[alpha(col,0),100]]);
 const linear=(angle,stops)=>{
  const id='l'+defs.length,t=angle*Math.PI/180,dx=Math.sin(t),dy=-Math.cos(t),d=(1600*Math.abs(dx)+900*Math.abs(dy))/2;
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${800-dx*d}" y1="${450-dy*d}" x2="${800+dx*d}" y2="${450+dy*d}">${markup(stops)}</linearGradient>`);
  layers.push({css:`linear-gradient(${angle}deg,${stops.map(([col,s])=>`${col} ${s}%`).join(',')})`,svg:`<rect width="1600" height="900" fill="url(#${id})"/>`});
 };
 solid(base);
 let textured=false,custom=false;
 switch(recipe.study){
  case 'ribbon':{
   glow(75,75,70,85,a,.6);glow(15,88,80,60,a,.7);
   const path='M270 -240 C80 90 90 215 535 230 C1130 245 1350 500 1160 850 C1000 1150 650 1250 960 1500';
   defs.push(`<linearGradient id="ribbon" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="${a}"/><stop offset=".4" stop-color="${b}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${a}"/></linearGradient><filter id="outer" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="85"/></filter><filter id="inner" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>`);
   layers.push({svg:`<path d="${path}" fill="none" stroke="url(#ribbon)" stroke-width="230" filter="url(#outer)"/><path d="${path}" fill="none" stroke="url(#ribbon)" stroke-width="64" filter="url(#inner)"/>`});custom=true;textured=true;break;
  }
  case 'rise':glow(92,110,110,95,c);glow(49,106,65,66,b);glow(82,80,52,64,a,.95);textured=true;break;
  case 'ember':solid(a);glow(50,112,70,70,b);radial(50,10,62,63,[[c,0],[alpha(c,.9),20],[alpha(c,0),100]]);break;
  case 'acid':solid(a);glow(90,0,55,45,b,.4);radial(58,74,38,60,[[c,0],[b,35],[alpha(b,0),100]]);glow(43,58,32,50,c,.75);break;
  case 'vault':solid(base);glow(50,120,62,105,b);glow(50,82,30,60,a);radial(50,9,80,48,[[c,0],[alpha(c,.95),46],[alpha(c,0),100]]);break;
  case 'crossing':solid(a);glow(18,14,65,70,b);glow(87,88,65,75,b);radial(50,50,70,18,[[base,0],[alpha(base,0),100]]);glow(8,95,30,45,c);glow(90,5,30,45,c);break;
  case 'well':solid(a);radial(50,66,63,90,[[c,0],[base,30],[alpha(base,0),100]]);glow(0,0,70,60,b,.6);break;
  case 'capsule':solid(base);radial(50,54,70,52,[[b,0],[b,12],[a,35],[alpha(a,.6),55],[alpha(a,0),100]]);break;
  case 'rose':solid(base);glow(12,-8,95,68,a);glow(87,112,80,80,b);glow(58,90,38,38,c,.45);break;
  case 'orb':{
   glow(60,48,54,71,a,.9);glow(49,32,48,66,b,.5);glow(72,91,48,45,c,.7);
   defs.push(`<radialGradient id="orb"><stop stop-color="${a}"/><stop offset=".6" stop-color="${a}" stop-opacity=".7"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient><filter id="orbblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>`);
   layers.push({svg:'<ellipse cx="755" cy="465" rx="570" ry="365" fill="url(#orb)" transform="rotate(-24 755 465)" filter="url(#orbblur)"/>'});custom=true;textured=true;break;
  }
  case 'drift':glow(99,0,38,42,c);glow(24,88,27,54,a);glow(65,83,45,30,b);glow(43,90,32,29,a,.5);break;
  case 'solar':glow(61,20,65,83,a);glow(52,35,32,58,b);glow(75,63,50,46,c,.7);glow(22,85,50,48,'#aa40d6',.45);textured=true;break;
  case 'blush':glow(-3,45,54,73,a);glow(53,74,42,54,c,.75);glow(87,8,56,65,b);glow(8,110,53,38,b,.65);textured=true;break;
  case 'arctic':glow(100,50,64,65,a);glow(30,118,100,80,b);glow(9,55,52,65,a,.75);glow(60,82,75,40,c,.4);break;
  case 'tension':linear(135,[[base,0],[base,25],[a,100]]);linear(135,[[alpha(b,0),0],[alpha(b,.85),35],[alpha(c,.8),58],[alpha(a,0),86]]);glow(-10,98,85,70,a);break;
  case 'reeded':{
   linear(65,[[base,0],[a,23],[b,38],[base,54],[a,71],[b,89],[c,100]]);
   glow(78,12,55,55,c,.55);glow(12,100,60,65,base,.7);
   defs.push('<filter id="ripples" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".009 .045" numOctaves="2" seed="17" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="22" xChannelSelector="R" yChannelSelector="G"/></filter>');
   let lines='';for(let n=-120;n<250;n++){const x=n*8;lines+=`<path d="M${x} -100 C${x+420} 260 ${x-230} 580 ${x+490} 1000" fill="none" stroke="${n%2?'#ffffff':'#04150b'}" stroke-width="1.3" opacity=".11"/>`;}
   layers.push({svg:`<g filter="url(#ripples)">${lines}</g>`});custom=true;break;
  }
  case 'sea':linear(180,[[base,0],[a,38],[b,93]]);glow(25,37,76,45,base,.9);glow(75,102,58,43,c,.7);glow(95,68,50,62,b,.6);break;
  case 'seam':{
   glow(38,64,80,53,a,.5);glow(19,66,46,24,b,.7);
   radial(66,58,90,2,[[c,0],[alpha(a,.8),44],[alpha(a,0),100]]);
   defs.push(`<linearGradient id="beamcolors"><stop stop-color="${b}"/><stop offset=".38" stop-color="${a}"/><stop offset=".73" stop-color="${c}"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></linearGradient><linearGradient id="beamfade" x2="0" y2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".9" stop-color="white" stop-opacity=".8"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="fade"><rect width="1600" height="900" fill="url(#beamfade)"/></mask><filter id="beamsoft"><feGaussianBlur stdDeviation="18"/></filter>`);
   layers.push({svg:'<path d="M-100 150 L640 527 L1700 527 L1700 350 L930 527 L220 220Z" fill="url(#beamcolors)" opacity=".7" filter="url(#beamsoft)"/><path d="M-100 800 L640 535 L1700 535 L1700 780 L930 535 L220 850Z" fill="url(#beamcolors)" opacity=".3" filter="url(#beamsoft)"/>'});custom=true;break;
  }
  case 'cushion':glow(50,30,75,53,a);glow(50,74,80,53,c,.8);radial(50,67,65,40,[[b,0],[alpha(b,.9),42],[alpha(b,0),100]]);glow(6,52,19,50,b,.8);glow(94,52,19,50,b,.8);textured=true;break;
  case 'fern':{
   glow(20,20,82,90,a);glow(86,80,100,85,c,.7);
   defs.push(`<linearGradient id="fernfill" x2="0" y2="1"><stop stop-color="${b}"/><stop offset=".16" stop-color="${a}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${c}"/></linearGradient><filter id="fernblur" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>`);
   layers.push({svg:'<path d="M-100 695 C400 580 780 670 1060 325 C1250 90 1490 160 1700 35 L1700 1000 L-100 1000Z" fill="url(#fernfill)" filter="url(#fernblur)"/>'});custom=true;textured=true;break;
  }
  case 'holo-fold':case 'holo-current':case 'holo-sail':case 'holo-loop':case 'holo-fan':case 'holo-orbit':{
   const pearly=palette.mode==='light'?'#ffffff':'#f2fdff';
   defs.push(`<linearGradient id="silk" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="${a}" stop-opacity=".25"/><stop offset=".14" stop-color="${b}"/><stop offset=".26" stop-color="${a}"/><stop offset=".42" stop-color="${c}"/><stop offset=".48" stop-color="${pearly}"/><stop offset=".59" stop-color="${b}"/><stop offset=".76" stop-color="${a}"/><stop offset=".9" stop-color="${c}" stop-opacity=".65"/><stop offset="1" stop-color="${a}" stop-opacity=".1"/></linearGradient><linearGradient id="silkedge"><stop stop-color="${a}" stop-opacity="0"/><stop offset=".35" stop-color="${pearly}"/><stop offset=".65" stop-color="${b}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient><filter id="silkglow" x="-50%" y="-70%" width="200%" height="240%"><feGaussianBlur stdDeviation="21"/></filter>`);
   const paths={
    'holo-fold':'M-150 670 C240 200 520 60 890 265 C1170 420 1290 860 1780 670 L1780 900 C1170 1030 1020 520 750 380 C420 180 100 430 -150 860Z',
    'holo-current':'M-100 60 C300 -100 1160 90 930 410 C780 600 360 550 460 810 C520 1000 1380 760 1700 980 L1700 1140 C1050 830 580 1140 250 860 C-130 530 900 330 710 190 C530 65 190 230 -100 260Z',
    'holo-sail':'M160 -100 C240 360 400 300 950 490 C1350 635 1340 940 1500 1100 L1220 1100 C1080 725 960 700 650 630 C230 530 50 250 -100 -100Z',
    'holo-loop':'M190 450 C190 50 1440 30 1440 460 C1440 940 190 920 190 450Z M425 460 C425 700 1200 735 1200 455 C1200 235 425 195 425 460Z',
    'holo-fan':'M-100 900 C80 250 480 240 780 330 C1140 445 1370 210 1740 -70 L1740 90 C1300 560 920 730 690 490 C410 195 125 760 -100 1060Z',
    'holo-orbit':'M-100 530 C430 -200 1280 -40 1650 440 L1700 665 C1360 100 570 100 -100 790Z'
   };
   const edgepaths={
    'holo-fold':'M-150 670 C240 200 520 60 890 265 C1170 420 1290 860 1780 670',
    'holo-current':'M-100 60 C300 -100 1160 90 930 410 C780 600 360 550 460 810 C520 1000 1380 760 1700 980',
    'holo-sail':'M160 -100 C240 360 400 300 950 490 C1350 635 1340 940 1500 1100',
    'holo-loop':'M190 450 C190 50 1440 30 1440 460 C1440 940 190 920 190 450Z',
    'holo-fan':'M-100 900 C80 250 480 240 780 330 C1140 445 1370 210 1740 -70',
    'holo-orbit':'M-100 530 C430 -200 1280 -40 1650 440'
   };
   const path=paths[recipe.study],edge=edgepaths[recipe.study];
   layers.push({svg:`<path d="${path}" fill="url(#silk)" fill-rule="evenodd" opacity=".65" filter="url(#silkglow)"/><path d="${path}" fill="url(#silk)" fill-rule="evenodd"/><path d="${edge}" fill="none" stroke="url(#silkedge)" stroke-width="5"/>`});
   let filaments='';for(let n=1;n<=16;n++){filaments+=`<path d="${edge}" transform="translate(${n*2.5} ${n*3.5})" fill="none" stroke="url(#silkedge)" stroke-width="${n%3===0?2:.7}" opacity="${.45-n*.02}"/>`;}
   layers.push({svg:filaments});
   if(recipe.study==='holo-orbit')layers.push({svg:`<path d="${path}" transform="translate(0 360) rotate(-12 800 450)" fill="url(#silk)" opacity=".7"/><path d="${edge}" transform="translate(0 360) rotate(-12 800 450)" fill="none" stroke="url(#silkedge)" stroke-width="3"/>`});
   custom=true;break;
  }
  default:throw new Error('Unknown reference study');
 }
 if(textured){defs.push('<filter id="studygrain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>');layers.push({svg:'<rect width="1600" height="900" filter="url(#studygrain)" opacity=".045"/>'});}
 return {background:custom||textured?undefined:[...layers].reverse().map(l=>l.css).join(','),defs:defs.join(''),content:layers.map(l=>l.svg).join('')};
}
