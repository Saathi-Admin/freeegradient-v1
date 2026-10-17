import { colour } from './spectral-reflection-recipes.mjs';
const choices=[
 ['Original',0,false],['Rose shift',40,false],['Coral shift',85,false],['Amber shift',130,false],
 ['Jade shift',180,false],['Aqua shift',225,false],['Indigo shift',270,false],['Orchid shift',315,false],
 ['Night original',0,true],['Night coral',90,true],['Night jade',180,true],['Night indigo',270,true],
];
const designs=[
 ['grain-bloom','Grain bloom',['#f3f8ee','#00b89f','#6254d8','#c9ead9'],undefined],
 ['soft-gesture','Soft gesture',['#ffffff','#70baff','#c0edf4','#eef8ff'],undefined],
 ['luminous-wisp','Luminous wisp',['#ffffff','#239bfc','#00e2e5','#d6fbff'],{x:0,y:449,width:175,height:25,fill:'#ffffff'}],
];
function tagsFor(hex) {
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 if(d<.04)return [];
 const hue=((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;
 return [hue<15||hue>=345?'red':hue<45?'orange':hue<75?'yellow':hue<160?'green':hue<190?'mint':hue<255?'blue':hue<290?'purple':'pink'];
}
export const softAuraRecipes=designs.map(([slug,name,baseColours,cover],position)=>({
 slug,name,category:'soft-auras',shape:'artwork',position,tags:['soft','aura','blur','organic',...(position===0?['grain']:[])],
 palettes:choices.map(([name,hue,invert],i)=>{
  const lift=invert?.04:0,colors=baseColours.map(hex=>colour(hex,hue,lift,invert));
  return {id:String(i+1).padStart(2,'0'),name,mode:invert?'dark':'light',colors,tags:[...new Set(colors.flatMap(tagsFor)),invert?'night':'pastel']};
 }),
 sourceImages:Object.fromEntries(choices.map(([_name,hue,invert],i)=>[String(i+1).padStart(2,'0'),{
  path:`artwork/${slug}-original.png`,hue,lift:invert?.04:0,invert,...(cover?{cover}:{}),
 }])),
}));
