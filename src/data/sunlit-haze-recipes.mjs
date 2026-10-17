const palettes=[
 ['Mint lime','light',['#fffde9','#55bcb0','#31965a','#d4ed4c'],['mint','green','yellow']],
 ['Peach blossom','light',['#fff5e9','#e89eae','#cf688b','#ffc777'],['peach','pink','orange']],
 ['Lavender lemon','light',['#fff9ed','#b6a8e1','#8f79c5','#eee994'],['lavender','purple','yellow']],
 ['Sky citrus','light',['#f9fce9','#85c6e0','#498caf','#dce977'],['blue','yellow','pastel']],
 ['Rose apricot','light',['#fff4eb','#ecafbd','#c8789c','#f4c38e'],['rose','pink','peach']],
 ['Sage butter','light',['#fffbea','#adc8b0','#6a9e8f','#ece39c'],['green','jade','yellow']],
 ['Lilac ice','light',['#fcf7ff','#b8d9e8','#9a8ac8','#e4c1e3'],['lavender','blue','pink']],
 ['Melon aqua','light',['#fffbe7','#7fcfc3','#3ca9a4','#e7ed8a'],['mint','green','yellow']],
 ['Forest glow','dark',['#286457','#39877f','#34835b','#a1ba43'],['green','mint','night']],
 ['Mulberry glow','dark',['#684a79','#8266a7','#a35f82','#d39076'],['purple','rose','night']],
 ['Cobalt dusk','dark',['#345784','#528ab5','#4b6db1','#88bebb'],['blue','navy','night']],
 ['Copper dusk','dark',['#81564f','#b28075','#b26c5c','#dfad61'],['orange','gold','night']],
].map(([name,mode,colors,tags],i)=>({id:String(i+1).padStart(2,'0'),name,mode,colors,tags}));

export const sunlitHazeRecipes=[{
 slug:'sunlit-haze',name:'Sunlit haze',category:'colour-clouds',shape:'study',study:'sunlit-haze',position:0,
 tags:['soft','pastel','mesh','grain','haze','sunlit','organic'],palettes,
}];

// One fixed composition, recoloured across all palettes. No text or baked-in UI.
export function sunlitHazeComposition(_recipe,palette) {
 const [base,teal,green,lime]=palette.colors;
 const radial=(id,color,opacity)=>`<radialGradient id="${id}"><stop stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".4" stop-color="${color}" stop-opacity="${opacity*.8}"/><stop offset=".75" stop-color="${color}" stop-opacity="${opacity*.27}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
 const defs=radial('air',teal,.9)+radial('garden',green,.95)+radial('sun',lime,.95)+radial('cream',base,.96)
  +'<filter id="film" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="1" seed="17" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>';
 const content=`<rect width="1600" height="900" fill="${base}"/>
  <g>
   <ellipse cx="1330" cy="100" rx="1280" ry="1020" fill="url(#air)"/>
   <ellipse cx="1450" cy="820" rx="910" ry="900" fill="url(#garden)"/>
   <ellipse cx="890" cy="1090" rx="630" ry="740" fill="url(#sun)" transform="rotate(-27 890 1090)"/>
   <ellipse cx="210" cy="630" rx="830" ry="810" fill="url(#cream)"/>
  </g>
  <rect width="1600" height="900" filter="url(#film)" opacity=".045"/>`;
 return {background:undefined,defs,content};
}
