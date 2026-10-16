// Original compositions informed by broad colour and material references.
// Names and geometry are stable: colour variations never count as templates.
const colourways = [
  ['01', 'Cool blue', 'dark', ['#071526', '#386ba8', '#d7efff'], ['blue', 'ice']],
  ['02', 'Jade dusk', 'dark', ['#0b1915', '#547e66', '#aeb8a0'], ['jade', 'green']],
  ['03', 'Plum noir', 'dark', ['#1c101b', '#813c69', '#e8a5c5'], ['plum', 'pink']],
  ['04', 'Solar ember', 'dark', ['#25120e', '#ff5c34', '#f4c47c'], ['orange', 'sunset']],
  ['05', 'Ice silk', 'light', ['#f6fbff', '#d7efff', '#82b5de'], ['blue', 'pastel']],
  ['06', 'Jade linen', 'light', ['#fafbf4', '#d9e4c7', '#aeb8a0'], ['jade', 'earth']],
  ['07', 'Rose mist', 'light', ['#fff6f7', '#f3cadb', '#bb9cdd'], ['rose', 'lavender']],
  ['08', 'Wasabi cream', 'light', ['#fffbea', '#e9f056', '#ffae87'], ['yellow', 'lime', 'peach']],
].map(([id, name, mode, colors, tags]) => ({ id, name, mode, colors, tags }));

const families = [
  ['sunset', 'sunset', ['Sundown','Apricity','Solstice','Coral sky','Blue hour','Saffron sky','Last light','Dayglow']],
  ['pastel', 'pastel', ['Marshmallow','Cloud nine','Petal soft','Sorbet','Cotton mist','Watercolour','Powder room','Quiet morning']],
  ['holographic', 'holographic', ['Opaline','Pearlescent','Iridescence','Soap bubble','Lustre','Rainbow silk','Prismatic veil','Iris film']],
  ['cosmic', 'cosmic', ['Nebula','Eventide','Deep orbit','Stardust','Eclipse','Lunar bloom','Quasar','Interstellar']],
  ['prism', 'prism', ['Refraction','Spectral','Light leak','Crystal edge','Spectrum','Split light','Glassline','Colour flare']],
  ['duotone', 'duotone', ['Twofold','Counterpoint','Colour field','Crossfade','Halfway','Soft divide','Balance','Double take']],
  ['angular', 'angular', ['Colour wheel','Pivot','Turntable','Compass','Pinwheel','Vortex','Chromatic turn','Off centre']],
  ['spotlight', 'spotlight', ['Centre stage','Pool of light','Limelight','Overhead','Side light','Daybeam','Curtain call','Beacon']],
  ['earth', 'earth', ['Dune','Terracotta','Mossland','Sandstone','Clay valley','Forest floor','Stonewash']],
];

// Eight substantially different placements, scales and directions per family.
const layouts = [
  { x: 18, y: 82, rx: 76, ry: 58, angle: 0 },
  { x: 82, y: 18, rx: 42, ry: 90, angle: 90 },
  { x: 50, y: 50, rx: 34, ry: 42, angle: 135 },
  { x: 12, y: 28, rx: 96, ry: 36, angle: 45 },
  { x: 72, y: 78, rx: 50, ry: 72, angle: 180 },
  { x: 40, y: 8, rx: 30, ry: 115, angle: 225 },
  { x: 92, y: 58, rx: 110, ry: 28, angle: 270 },
  { x: 30, y: 62, rx: 60, ry: 64, angle: 315 },
];
const toSlug = name => name.toLowerCase().replaceAll(' ', '-');
export const expandedRecipes = families.flatMap(([category, shape, names]) => names.map((name, position) => ({
  slug: toSlug(name), name, category, shape, position, composition: layouts[position], palettes: colourways,
  tags: [category, shape, ...({ pastel: ['soft','blur'], holographic: ['iridescent','pearl'], cosmic: ['space','nebula'], prism: ['glass','rainbow'], angular: ['conic','radial'], earth: ['natural','organic'] }[category] ?? [])],
})));

// Additional templates vary geometry and layer structure, never just palette.
const seriesNames = ['Terrace','Ribbon','Lattice','Cascade','Arc','Veil','Window','Contour','Fan','Field'];
// Preserve the published geometry of remaining families after collection removal.
const geometryOffsets = { sunset:0, pastel:1, holographic:2, cosmic:4, prism:5, duotone:6, angular:7, spotlight:8, earth:9 };
for (const [category, shape] of families) {
  const familyIndex = geometryOffsets[category];
  for (let i=0;i<90;i++) {
    const series=Math.floor(i/9), cell=i%9;
    const name=`${category[0].toUpperCase()+category.slice(1)} ${seriesNames[series].toLowerCase()} ${String(cell+1).padStart(2,'0')}`;
    expandedRecipes.push({slug:toSlug(name),name,category,shape,position:cell%8,
      composition:{x:10+(cell%3)*35+series*.7,y:12+Math.floor(cell/3)*34-series*.5,
        rx:24+series*7+familyIndex,ry:30+(9-series)*6+cell*2,angle:(series*31+cell*47+familyIndex*13)%360,
        structure:series},palettes:colourways,tags:[category,shape,seriesNames[series].toLowerCase(),'abstract','css']});
  }
}

export function expandedComposition(recipe, palette) {
  const [base, one, two] = palette.colors;
  const { x, y, rx, ry, angle } = recipe.composition;
  const layers = [], defs = [];
  const alpha = (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  const stopsMarkup = stops => stops.map(([color, stop]) => `<stop offset="${stop}%" stop-color="${color.slice(0,7)}"${color.length === 9 ? ` stop-opacity="${parseInt(color.slice(7),16)/255}"` : ''}/>`).join('');
  const solid = color => layers.push({ css: `linear-gradient(${color}, ${color})`, svg: `<rect width="1600" height="900" fill="${color}"/>` });
  const linear = (direction, stops) => {
    const id = `l${defs.length}`, radians = direction * Math.PI / 180, dx = Math.sin(radians), dy = -Math.cos(radians);
    const distance = (1600 * Math.abs(dx) + 900 * Math.abs(dy)) / 2;
    defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${800-dx*distance}" y1="${450-dy*distance}" x2="${800+dx*distance}" y2="${450+dy*distance}">${stopsMarkup(stops)}</linearGradient>`);
    layers.push({ css: `linear-gradient(${direction}deg, ${stops.map(([color, stop]) => `${color} ${stop}%`).join(', ')})`, svg: `<rect width="1600" height="900" fill="url(#${id})"/>` });
  };
  const radial = (cx, cy, radiusX, radiusY, color, opacity = 1) => {
    const id = `r${defs.length}`;
    const stops = [[alpha(color, opacity), 0], [alpha(color, 0), 100]];
    defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${cx*16} ${cy*9}) scale(${radiusX*16} ${radiusY*9})">${stopsMarkup(stops)}</radialGradient>`);
    layers.push({ css: `radial-gradient(ellipse ${radiusX}% ${radiusY}% at ${cx}% ${cy}%, ${alpha(color,opacity)} 0%, ${alpha(color,0)} 100%)`, svg: `<rect width="1600" height="900" fill="url(#${id})"/>` });
  };
  solid(base);
  switch (recipe.shape) {
    case 'sunset':
      linear(angle, [[base,0],[one,48 + recipe.position*3],[two,100]]);
      radial(x,y,rx,ry,two,.65); radial(100-x,100-y,rx*.8,ry*.5,base,.7); break;
    case 'pastel':
      radial(x,y,rx,ry,one,.8); radial(100-x,100-y,ry,rx,two,.7);
      radial(50,20 + recipe.position*9,40,70,base,.65); break;
    case 'holographic':
      linear(angle, [[base,0],[one,23],[two,47],[one,72],[base,100]]);
      linear(angle+90, [[alpha(base,0),0],[alpha('#a1f4da',.55),28],[alpha('#f4abdf',.55),60],[alpha(base,0),100]]);
      radial(x,y,rx,ry,'#ffffff',palette.mode==='light'?.65:.3); break;
    case 'cosmic':
      radial(x,y,rx,ry,one,.9); radial(100-x,100-y,rx*.7,ry*.75,two,.8);
      radial(50,50,20 + recipe.position*4,35,base,.9); break;
    case 'prism':
      linear(angle, [[base,0],[one,48],[two,100]]);
      linear(angle+72, [[alpha(base,0),0],[alpha(base,0),25],[alpha(two,.75),48],[alpha(one,.1),58],[alpha(base,.7),100]]);
      radial(x,y,rx*.6,ry,'#ffffff',.3); break;
    case 'duotone':
      linear(angle, [[one,0],[one,12 + recipe.position*4],[two,88-recipe.position*3],[two,100]]);
      radial(x,y,rx,ry,base,.65); break;
    case 'angular': {
      const colours = [base,one,two,base], triangles=[];
      const mix = (a,b,t) => '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
      for(let i=0;i<240;i++) {
        const fraction=(i+.5)/240, segment=Math.min(2,Math.floor(fraction*3)), color=mix(colours[segment],colours[segment+1],fraction*3-segment);
        // Overlap neighbouring sectors so SVG antialiasing cannot expose seams.
        const start=(angle+i*360/240-90-.4)*Math.PI/180,end=(angle+(i+1)*360/240-90+.4)*Math.PI/180;
        triangles.push(`<path d="M${x*16} ${y*9} L${x*16+3000*Math.cos(start)} ${y*9+3000*Math.sin(start)} L${x*16+3000*Math.cos(end)} ${y*9+3000*Math.sin(end)}Z" fill="${color}"/>`);
      }
      layers.push({css:`conic-gradient(from ${angle}deg at ${x}% ${y}%, ${base} 0deg, ${one} 120deg, ${two} 240deg, ${base} 360deg)`,svg:`<g shape-rendering="crispEdges">${triangles.join('')}</g>`});
      radial(x,y,rx*.5,ry*.5,two,.25); break;
    }
    case 'spotlight':
      radial(x,y,rx,ry,one,.6); radial(x,y,rx*.32,ry*.75,two,.9);
      linear(angle, [[alpha(base,0),0],[alpha(base,.65),100]]); break;
    case 'earth':
      radial(x,y,rx,ry,one,.8); radial(100-x,85-y/2,ry,rx*.65,two,.75);
      linear(angle, [[alpha(base,.5),0],[alpha(base,0),70],[alpha(one,.25),100]]); break;
    default: throw new Error(`Unknown composition ${recipe.shape}`);
  }
  if (recipe.composition.structure !== undefined) {
    const structure=recipe.composition.structure;
    // Layer topology changes across each named series.
    if(structure===1 || structure===4) radial(100-x,y,rx*.35,ry*.45,two,.6);
    if(structure===2 || structure===7) {
      for(let n=0;n<3;n++) radial(15+n*35,100-y,rx*.3,ry*.4,n%2?one:two,.45);
    }
    if(structure===3 || structure===8) linear(angle+115,[[alpha(base,0),0],[alpha(two,.6),35],[alpha(one,.7),60],[alpha(base,0),100]]);
    if(structure===5) radial(x,100-y,rx*1.5,ry*.22,base,.8);
    if(structure===6) {radial(12,12,rx*.5,ry*.5,two,.65);radial(88,88,rx*.5,ry*.5,one,.65);}
    if(structure===9) linear(angle+90,[[alpha(base,.7),0],[alpha(base,0),50],[alpha(base,.7),100]]);
  }
  return { background: [...layers].reverse().map(layer=>layer.css).join(', '), defs: defs.join(''), content: layers.map(layer=>layer.svg).join('') };
}
