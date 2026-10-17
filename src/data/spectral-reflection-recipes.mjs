// Recolour the original SVG artwork without moving, redrawing or blurring it.
const choices=[
 ['Original spectrum',0,0,['blue','purple','pink']],
 ['Coral violet',40,0,['purple','pink','orange']],
 ['Amber rose',85,0,['pink','orange','yellow']],
 ['Lime ember',130,0,['orange','yellow','green']],
 ['Jade gold',180,0,['green','jade','yellow']],
 ['Aqua lime',225,0,['mint','cyan','green']],
 ['Cyan orchid',270,0,['blue','cyan','purple']],
 ['Indigo rose',315,0,['blue','purple','rose']],
 ['Pearl spectrum',0,.72,['blue','purple','pink','pastel']],
 ['Pearl coral',85,.72,['pink','peach','pastel']],
 ['Pearl jade',180,.72,['green','mint','pastel']],
 ['Pearl aqua',270,.72,['blue','cyan','pastel']],
];
export function colour(hex,hue,lift,invert=false) {
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const cos=Math.cos(hue*Math.PI/180),sin=Math.sin(hue*Math.PI/180);
 const channels=[
  (.213+.787*cos-.213*sin)*r+(.715-.715*cos-.715*sin)*g+(.072-.072*cos+.928*sin)*b,
  (.213-.213*cos+.143*sin)*r+(.715+.285*cos+.140*sin)*g+(.072-.072*cos-.283*sin)*b,
  (.213-.213*cos-.787*sin)*r+(.715-.715*cos+.715*sin)*g+(.072+.928*cos+.072*sin)*b,
 ];
 return '#'+channels.map(n=>Math.round(Math.max(0,Math.min(255,n))*(invert?-(1-lift):1-lift)+255*(invert?1:lift)).toString(16).padStart(2,'0')).join('');
}
const palettes=choices.map(([name,hue,lift,tags],i)=>({
 id:String(i+1).padStart(2,'0'),name,mode:lift?'light':'dark',
 colors:['#020616','#1845b3','#fff0cd','#dc65b9'].map(hex=>colour(hex,hue,lift)),tags,
}));
export const spectralReflectionRecipes=[{
 slug:'spectral-reflection',name:'Spectral reflection',category:'light-atmospheres',shape:'artwork',position:0,
 tags:['spectrum','horizon','reflection','light','glow','colourful'],palettes,
 sourceImages:Object.fromEntries(choices.map(([_name,hue,lift],i)=>[String(i+1).padStart(2,'0'),{
  path:'artwork/spectral-reflection-original.png',hue,lift,
 }])),
}];
