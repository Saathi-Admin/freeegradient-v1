import { modernLightComposition } from './modern-light-compositions.mjs';
// Original editorial backgrounds: 40 hero compositions and 50 footer compositions.
// Stable IDs, eight colourways each, no text, logos, animation or runtime dependency.
const palettes=[
 ['Graphite silver','dark',['#090b10','#526176','#b7c9d5'],['blue','silver','graphite']],
 ['Champagne noir','dark',['#13100e','#8b7153','#ddc5a3'],['yellow','gold','warm']],
 ['Ink sapphire','dark',['#070d1c','#294f82','#92badd'],['blue','navy']],
 ['Oxblood velvet','dark',['#180c13','#793953','#c89caa'],['rose','pink','burgundy']],
 ['Porcelain blue','light',['#f8fafc','#d4e3ed','#8aaec6'],['blue','ice','pastel']],
 ['Oyster silk','light',['#fcf9f3','#e4d8c2','#b5a086'],['yellow','gold','cream']],
 ['Sage stone','light',['#f5f8f3','#d4dfd0','#88a49c'],['green','jade','mint']],
 ['Blush pearl','light',['#fcf6fa','#e9d4e1','#b49bbc'],['rose','pink','lavender']],
];
const families=[
 ['edge','Edge light',['Quiet arrival','Edge atelier','Soft entrance','Distant warmth','Gallery air'],['Last ember','Closing light','Quiet corners','Endnote mist','Night margin']],
 ['halo','Halo',['Ivory halo','Halo vestibule','Still orbit','Aureole space','First circle'],['Halo farewell','Low orbit','Evening aureole','Dusk ring','Final circumference']],
 ['satin','Satin',['Satin foyer','Silken dawn','Oyster drape','Cashmere sky','Velour light'],['Satin coda','Silken night','Draped dusk','Cashmere close','Velour horizon']],
 ['veil','Colour veil',['Porcelain veil','Velvet threshold','Misted gallery','Quiet wash','Open atmosphere'],['Closing veil','Velvet afterhours','Misted endnote','Late wash','Last atmosphere']],
 ['aurora','Aurora',['North atelier','Aurora vestibule','Luminous arrival','Silver dawnline','Quiet aurora'],['Northern coda','Aurora endnote','Luminous farewell','Silver duskline','Aurora curtain']],
 ['beam','Light beam',['Gallery beam','Aperture dawn','Quiet ray','Daylight cut','Soft aperture'],['Gallery afterlight','Aperture dusk','Last ray','Evening cut','Soft exit']],
 ['orb','Diffused orb',['Pearl chamber','Smoked pearl','Opal entrance','Floating lumen','Quiet sphere'],['Pearl endnote','Smoked moon','Opal closing','Last lumen','Evening sphere']],
 ['ridge','Sculpted ridge',['Sculpted dawn','Contour atelier','Soft escarpment','Rising marble','Folded arrival'],['Sculpted dusk','Contour closing','Low escarpment','Falling marble','Folded coda']],
 ['ribbon','Light ribbon',['Sapphire ribbon','Champagne sweep','Ribbon gallery','Silk passage','Gliding dawn'],['Sapphire endline','Champagne coda','Ribbon farewell','Silk return','Gliding dusk']],
 ['arch','Soft arch',['Arched arrival','Luminous vault','Soft colonnade','Quiet canopy','First arch'],['Arched coda','Evening vault','Low colonnade','Dusk canopy','Last arch']],
];
const heroLayouts=[
 {x:13,y:87,rx:73,ry:62,angle:24,bend:180},
 {x:87,y:22,rx:48,ry:88,angle:132,bend:-220},
 {x:52,y:104,rx:77,ry:42,angle:0,bend:310},
 {x:4,y:38,rx:50,ry:75,angle:74,bend:-320},
 {x:94,y:79,rx:56,ry:54,angle:158,bend:70},
];
const footerLayouts=[
 {x:18,y:111,rx:76,ry:63,angle:0,bend:250},
 {x:87,y:108,rx:57,ry:74,angle:155,bend:-140},
 {x:50,y:122,rx:91,ry:54,angle:90,bend:360},
 {x:7,y:86,rx:63,ry:39,angle:32,bend:-280},
 {x:73,y:94,rx:40,ry:78,angle:119,bend:110},
];
const slug=name=>name.toLowerCase().replaceAll(' ','-');
export const premiumRecipes=['landing','footer'].flatMap((category,ci)=>families.flatMap(([family,_label,heroes,footers],fi)=>(ci?footers:heroes).map((name,position)=>({
 slug:slug(name),name,category,shape:'premium',study:'premium',family,position,composition:(ci?footerLayouts:heroLayouts)[position],
 tags:[category,'premium','luxury','editorial','minimal',family],
 palettes:palettes.map(([name,mode,colors,tags],i)=>({id:String(i+1).padStart(2,'0'),name,mode,colors,tags})).map((_p,i,all)=>({...all[(i+fi+position)%all.length],id:String(i+1).padStart(2,'0')})),
})))).filter(recipe=>recipe.category!=='landing'||!['halo','satin'].includes(recipe.family));
export function premiumComposition(recipe,palette){
 if(recipe.category==='landing'&&['beam','orb','arch'].includes(recipe.family)) return modernLightComposition(recipe,palette);
 const [base,a,b]=palette.colors,{x,y,rx,ry,angle,bend}=recipe.composition;
 const defs=[],layers=[];let asset=false;
 const alpha=(color,n)=>color+Math.round(n*255).toString(16).padStart(2,'0');
 const stops=values=>values.map(([c,p])=>`<stop offset="${p}%" stop-color="${c.slice(0,7)}" stop-opacity="${c.length===9?parseInt(c.slice(7),16)/255:1}"/>`).join('');
 const solid=c=>layers.push({css:`linear-gradient(${c},${c})`,svg:`<rect width="1600" height="900" fill="${c}"/>`});
 const radial=(cx,cy,rxx,ryy,values)=>{
  const id='p'+defs.length;defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx*16} ${cy*9}) scale(${rxx*16} ${ryy*9})">${stops(values)}</radialGradient>`);
  layers.push({css:`radial-gradient(ellipse ${rxx}% ${ryy}% at ${cx}% ${cy}%,${values.map(([c,p])=>`${c} ${p}%`).join(',')})`,svg:`<rect width="1600" height="900" fill="url(#${id})"/>`});
 };
 const glow=(cx,cy,rxx,ryy,c,n=1)=>radial(cx,cy,rxx,ryy,[[alpha(c,n),0],[alpha(c,n*.55),42],[alpha(c,0),100]]);
 const linear=(d,values)=>{
  const id='p'+defs.length,t=d*Math.PI/180,dx=Math.sin(t),dy=-Math.cos(t),dist=(1600*Math.abs(dx)+900*Math.abs(dy))/2;
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${800-dx*dist}" y1="${450-dy*dist}" x2="${800+dx*dist}" y2="${450+dy*dist}">${stops(values)}</linearGradient>`);
  layers.push({css:`linear-gradient(${d}deg,${values.map(([c,p])=>`${c} ${p}%`).join(',')})`,svg:`<rect width="1600" height="900" fill="url(#${id})"/>`});
 };
 const footer=recipe.category==='footer';solid(base);
 switch(recipe.family){
  case 'edge':glow(x,y,rx,ry,a,.9);glow(100-x,footer?116:100-y,rx*.64,ry*.84,b,.55);glow(50,footer?12:40,55,65,base,.88);break;
  case 'halo':radial(x,y,rx,ry,[[alpha(base,0),0],[alpha(a,.15),48],[alpha(b,.7),68],[alpha(a,.8),78],[alpha(base,0),100]]);glow(100-x,y-16,rx*.6,ry*.55,a,.4);break;
  case 'satin':linear(angle,[[base,0],[a,22+recipe.position*3],[b,36],[a,45],[base,65],[alpha(a,.55),87],[base,100]]);glow(x,y,rx*.7,ry,base,.82);glow(100-x,footer?5:20,80,58,base,.8);break;
  case 'veil':linear(footer?angle+135:angle,[[base,0],[a,75],[b,100]]);glow(x,y,rx,ry,b,.65);if(footer)glow(100-x,100,rx*.7,ry*.32,a,.9);glow(100-x,footer?0:25,80,75,base,.94);break;
  case 'aurora':glow(x,footer?110:y,rx,ry*.36,a,.92);glow(100-x,footer?107:y+10,rx*.8,ry*.58,b,.55);glow(x,footer?70:y-24,rx*.4,ry*.72,a,.4);glow(50,footer?14:40,70,52,base,.7);break;
  case 'beam':linear(angle,[[alpha(base,0),0],[alpha(base,0),36],[alpha(a,.5),46],[alpha(b,.8),50],[alpha(a,.22),55],[alpha(base,0),67],[alpha(base,0),100]]);glow(x,y,rx,ry,a,.6);glow(100-x,footer?0:30,60,68,base,.75);break;
  case 'orb':
   // Keep these hero forms inside the frame so they read at picker size too.
   if(recipe.slug==='floating-lumen'){
    glow(43,52,58,76,a,.65);
    radial(40,47,34,57,[[b,0],[alpha(b,.9),18],[a,43],[alpha(a,.28),72],[alpha(a,0),100]]);
    glow(55,66,34,46,base,.83);
   }else if(recipe.slug==='quiet-sphere'){
    glow(62,54,52,78,a,.55);
    radial(61,51,24,43,[[b,0],[alpha(b,.95),23],[a,54],[alpha(a,.65),77],[alpha(a,0),100]]);
    glow(69,64,23,39,base,.86);
   }else{
    radial(x,y,rx*.8,ry*.82,[[b,0],[a,29],[alpha(a,.75),52],[alpha(base,0),100]]);glow(x-18,y-20,rx*.26,ry*.22,b,.6);glow(x+14,y+8,rx*.58,ry*.62,base,.8);
   }
   break;
  case 'ridge':case 'ribbon':case 'arch':{
   glow(x,y,rx,ry,a,.4);asset=true;
   defs.push(`<linearGradient id="material" x1="0" y1="0" x2=".7" y2="1">${stops([[base,0],[a,32],[b,48],[a,61],[base,100]])}</linearGradient><filter id="softmaterial" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="${recipe.family==='ribbon'?32:18}"/></filter>`);
   const offset=footer?180:0,shift=recipe.position*46;
   let path;
   if(recipe.family==='ridge')path=`M-200 ${660+offset-shift} C250 ${540+bend+offset} 720 ${780-bend+offset} 1150 ${260+offset+shift} C1350 ${140+offset} 1540 ${170+offset} 1800 ${60+offset} L1800 1100 L-200 1100Z`;
   else if(recipe.family==='ribbon')path=`M-150 ${250+offset+shift} C360 ${100+bend+offset} 700 ${890-bend+offset} 1750 ${360+offset-shift} L1750 ${560+offset-shift} C710 ${1070-bend+offset} 350 ${260+bend+offset} -150 ${420+offset+shift}Z`;
   else path=`M-200 ${950+offset} C80 ${260+bend+offset} 1030 ${-160+offset+shift} 1820 ${750+offset} L1820 ${920+offset} C1000 ${80+offset+shift} 250 ${390+bend+offset} -200 ${1120+offset}Z`;
   layers.push({svg:`<path d="${path}" fill="url(#material)" filter="url(#softmaterial)" opacity=".82"/>`});
   glow(footer?50:100-x,footer?0:20,90,footer?58:36,base,.78);break;
  }
  default:throw new Error(`Unknown premium family ${recipe.family}`);
 }
 return {background:asset?undefined:[...layers].reverse().map(l=>l.css).join(','),defs:defs.join(''),content:layers.map(l=>l.svg).join('')};
}
