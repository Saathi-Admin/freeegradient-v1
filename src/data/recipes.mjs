import { premiumRecipes } from './premium-recipes.mjs';
import { floralRecipes } from './floral-recipes.mjs';
import { colourCloudRecipes } from './colour-cloud-recipes.mjs';
import { haloHorizonRecipes } from './halo-horizon-recipes.mjs';
import { lightFormRecipes } from './light-form-recipes.mjs';
// Original procedural compositions. Keep published IDs stable.
import { referenceRecipes } from './reference-recipes.mjs';
import { expandedRecipes } from './expanded-recipes.mjs';
export const palettes = [
  { id: '01', name: 'After hours', mode: 'dark', colors: ['#080b18', '#6655ed', '#ee6fba'], tags: ['purple','pink','violet','night'] },
  { id: '02', name: 'Mint condition', mode: 'light', colors: ['#eef8ee', '#90e6c1', '#b5c7f4'], tags: ['green','mint','pastel','blue'] },
  { id: '03', name: 'Golden hour', mode: 'light', colors: ['#fff0df', '#ffad66', '#f0788c'], tags: ['orange','yellow','pink','peach','warm','sunset'] },
  { id: '04', name: 'Deep current', mode: 'dark', colors: ['#06191d', '#32bfae', '#3078c0'], tags: ['blue','green','cyan','teal','sea'] },
];
const landingPalettes = [
  { id: '01', name: 'Violet horizon', mode: 'dark', colors: ['#030313', '#7041bd', '#d8c3ff'], tags: ['purple', 'violet', 'night'] },
  { id: '02', name: 'Blue horizon', mode: 'dark', colors: ['#020916', '#2465ad', '#b4ddff'], tags: ['blue', 'sky'] },
  { id: '03', name: 'Rose horizon', mode: 'dark', colors: ['#14040c', '#af407d', '#ffd0e5'], tags: ['pink', 'rose'] },
  { id: '04', name: 'Emerald horizon', mode: 'dark', colors: ['#03120f', '#248c73', '#b8f4dc'], tags: ['green', 'emerald'] },
  { id: '05', name: 'Lavender dawn', mode: 'light', colors: ['#faf7ff', '#dbcbf3', '#ae8edd'], tags: ['purple', 'lavender', 'pastel'] },
  { id: '06', name: 'Ocean dawn', mode: 'light', colors: ['#f5fbff', '#c0e4f7', '#7fb8dd'], tags: ['blue', 'ocean', 'pastel'] },
  { id: '07', name: 'Peach dawn', mode: 'light', colors: ['#fff9f4', '#fbd5c1', '#eca480'], tags: ['orange', 'peach', 'warm'] },
  { id: '08', name: 'Mint dawn', mode: 'light', colors: ['#f5fff9', '#c1eddb', '#80c4aa'], tags: ['green', 'mint', 'pastel'] },
];
export const recipes = [
  ['velvet','Velvet','smooth','wash'], ['daybreak','Daybreak','smooth','wash'], ['tideline','Tideline','smooth','wash'],
  ['orbit','Orbit','mesh','mesh'], ['bloom','Bloom','mesh','mesh'], ['nectar','Nectar','mesh','mesh'],
  ['halo','Halo','glow','glow'], ['aurora','Aurora','glow','glow'], ['ember','Ember','glow','glow'],
  ['analogue','Analogue','vintage','grain'], ['haze','Haze','vintage','grain'], ['film','Film','vintage','grain'],
  ['ripple','Ripple','waves','wave'], ['drift','Drift','waves','wave'], ['flux','Flux','waves','wave'],
  ['horizon','Horizon','landing','horizon'], ['dawnlight','Dawnlight','landing','horizon'], ['atmosphere','Atmosphere','landing','horizon'],
  ['afterglow','Afterglow','footer','beam'], ['uplift','Uplift','footer','beam'], ['nightfall','Nightfall','footer','beam'],
].map(([slug,name,category,shape],i)=>({slug,name,category,shape,position:i%3,tags:[category,shape,...({smooth:['soft','blur'],mesh:['organic'],glow:['aurora','light'],vintage:['grain','retro','texture'],waves:['wave','abstract','flow']}[category] ?? [])]}));
for (const recipe of recipes) if (recipe.category === 'landing' || recipe.category === 'footer') recipe.palettes = landingPalettes;
recipes.push(...expandedRecipes);

recipes.push(...referenceRecipes);

recipes.push(...floralRecipes);

recipes.push(...premiumRecipes);
recipes.push(...colourCloudRecipes);
recipes.push(...haloHorizonRecipes);
recipes.push(...lightFormRecipes);
