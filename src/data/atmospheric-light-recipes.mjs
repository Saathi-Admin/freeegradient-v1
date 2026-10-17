// Two distinct light compositions; geometry stays fixed across colour variations.
const lightPalettes=[
 ['Glacier blue',['#115c88','#b8e2e6','#f4f6dc','#63b4d6'],['blue','cyan','ice']],
 ['Sage daylight',['#37786d','#c6e4d2','#fff5d7','#8dc4a3'],['green','mint','jade']],
 ['Rose daylight',['#9a547e','#f4cadb','#fff4df','#d998bb'],['pink','rose','peach']],
 ['Lilac daylight',['#6b5a9e','#d3c9ed','#fff6de','#aaa0dc'],['lavender','purple','pastel']],
 ['Apricot daylight',['#bc713f','#f9d4ad','#fff8d8','#e8ae86'],['orange','peach','yellow']],
 ['Aqua daylight',['#267e92','#c0e9dd','#f5f9d8','#77c6c5'],['mint','blue','green']],
];
const darkPalettes=[
 ['Blue mint',['#010b18','#1259d0','#d4f8ec','#14bda5'],['blue','cyan','mint']],
 ['Violet rose',['#10091e','#7132c2','#f9d5ed','#df489c'],['purple','pink','rose']],
 ['Amber ember',['#190b0a','#d34e23','#fff0bf','#f4a23d'],['orange','yellow','gold']],
 ['Jade aurora',['#031510','#158268','#e2f8c5','#5fc95d'],['green','jade','mint']],
 ['Cobalt lilac',['#080b24','#3b48ce','#e8ddff','#a07be4'],['blue','purple','lavender']],
 ['Rose copper',['#1b0b17','#a43d78','#ffe4d0','#e58667'],['rose','pink','peach']],
];
const palettes=(groups)=>groups.flatMap(([values,mode])=>values.map(([name,colors,tags])=>({name,colors,tags,mode})))
 .map((p,i)=>({...p,id:String(i+1).padStart(2,'0')}));
export const atmosphericLightRecipes=[
 {slug:'luminous-drift',name:'Luminous drift',category:'light-atmospheres',shape:'study',study:'atmospheric-light',position:0,
  tags:['atmosphere','grain','soft','curved','light','wash'],palettes:palettes([[lightPalettes,'light'],[darkPalettes,'dark']])},
 {slug:'reflected-dawn',name:'Reflected dawn',category:'light-atmospheres',shape:'study',study:'atmospheric-light',position:1,
  tags:['atmosphere','horizon','reflection','light','glow','soft'],palettes:palettes([[darkPalettes,'dark'],[lightPalettes,'light']])},
];

export function atmosphericLightComposition(recipe,palette) {
 const [base,colour,light,accent]=palette.colors;
 const grain='<filter id="film"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="29" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>';
 if(recipe.slug==='luminous-drift') {
  const defs=grain+`<radialGradient id="wash" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(1000 -120) rotate(-9) scale(1540 1020)">
   <stop stop-color="${colour}"/><stop offset=".4" stop-color="${colour}"/>
   <stop offset=".58" stop-color="${light}"/>
   <stop offset=".67" stop-color="${light}"/><stop offset=".79" stop-color="${accent}"/><stop offset="1" stop-color="${base}"/>
  </radialGradient><linearGradient id="air" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${base}" stop-opacity=".55"/><stop offset=".65" stop-color="${colour}" stop-opacity="0"/><stop offset="1" stop-color="${colour}" stop-opacity=".3"/></linearGradient>`;
  return {background:undefined,defs,content:`<rect width="1600" height="900" fill="url(#wash)"/><rect width="1600" height="900" fill="url(#air)"/><rect width="1600" height="900" filter="url(#film)" opacity=".065"/>`};
 }
 const defs=grain+`
  <linearGradient id="reflection-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900"><stop stop-color="white"/><stop offset=".43" stop-color="white"/><stop offset=".54" stop-color="white" stop-opacity=".65"/><stop offset=".66" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
  <mask id="above" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900"><rect width="1600" height="900" fill="url(#reflection-fade)"/></mask>
  <radialGradient id="fan-shape" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(1600 430) rotate(-24) scale(1800 650)"><stop stop-color="white"/><stop offset=".45" stop-color="white" stop-opacity=".8"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
  <mask id="fan-fade"><rect width="1600" height="900" fill="url(#fan-shape)"/></mask>
  <linearGradient id="fan" x1="0" y1="1" x2="1" y2=".2"><stop stop-color="${colour}" stop-opacity="0"/><stop offset=".28" stop-color="${colour}"/><stop offset=".6" stop-color="${light}"/><stop offset=".83" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity=".9"/></linearGradient>
  <radialGradient id="ambient"><stop stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="blue-fade"><stop stop-color="${colour}" stop-opacity=".95"/><stop offset=".4" stop-color="${colour}" stop-opacity=".7"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>
  <radialGradient id="heart"><stop stop-color="${light}"/><stop offset=".42" stop-color="${accent}" stop-opacity=".65"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>`;
 const fan=(heartOpacity=1)=>`<g mask="url(#above)"><rect width="1600" height="900" fill="url(#fan)" mask="url(#fan-fade)"/><ellipse cx="430" cy="440" rx="850" ry="360" fill="url(#blue-fade)"/><ellipse cx="840" cy="450" rx="1100" ry="470" fill="url(#heart)" opacity="${heartOpacity}"/></g>`;
 return {background:undefined,defs,content:`<rect width="1600" height="900" fill="${base}"/><ellipse cx="1540" cy="80" rx="1450" ry="970" fill="url(#ambient)" opacity=".55"/>${fan()}<g transform="translate(0 980) scale(1 -1)" opacity=".7">${fan(.4)}</g><ellipse cx="840" cy="490" rx="740" ry="80" fill="url(#heart)" opacity=".18"/><rect width="1600" height="900" filter="url(#film)" opacity=".018"/>`};
}
