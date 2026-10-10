import { mkdir, writeFile, rm, access, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { palettes, recipes } from '../src/data/recipes.mjs';
import { referenceComposition } from '../src/data/reference-recipes.mjs';
import { expandedComposition } from '../src/data/expanded-recipes.mjs';
const assetDir = new URL('../public/gradients/', import.meta.url);
await mkdir(assetDir, { recursive: true });
const stylesDir = new URL('styles/', assetDir);
await mkdir(stylesDir, { recursive: true });
const versionedStylesDir = new URL('integrations/',assetDir);
await mkdir(versionedStylesDir,{recursive:true});
const immutableDir = new URL('assets/', assetDir), thumbnailsDir = new URL('thumbnails/', assetDir), catalogueDir = new URL('catalogue/', assetDir);
await Promise.all([immutableDir, thumbnailsDir, catalogueDir].map(dir=>mkdir(dir,{recursive:true})));
await mkdir(new URL('templates/',catalogueDir),{recursive:true});
await mkdir(new URL('pages/',catalogueDir),{recursive:true});
const hash = value => createHash('sha256').update(value).digest('hex').slice(0,16);
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const writeImmutable = async (file, content) => { try { await writeFile(file,content,{flag:'wx'}); } catch(error) { if (error.code !== 'EEXIST') throw error; } };
const compositions = new Set(), variationIds = new Set();
const catalogue = [];
for (const [index, recipe] of recipes.entries()) {
  const variations = [];
  const templateVariables = [], templateClasses = [];
  for (const palette of recipe.palettes ?? palettes) {
    const [base, one, two] = palette.colors;
    const shift = recipe.position * 13;
    let background;
    let content = `<rect width="1600" height="900" fill="${base}"/>`;
    const defs = [];
    const spot = (id, x, y, rx, ry, color, strength = 1) => {
      defs.push(`<radialGradient id="${id}"><stop stop-color="${color}" stop-opacity="${strength}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
      content += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
      return `radial-gradient(ellipse ${rx / 16}% ${ry / 9}% at ${x / 16}% ${y / 9}%, ${color}${strength === 1 ? '' : Math.round(strength * 255).toString(16).padStart(2, '0')} 0%, ${color}00 100%)`;
    };
    if (recipe.study) {
      const composition=referenceComposition(recipe,palette);
      background=composition.background;content=composition.content;defs.push(composition.defs);
    } else if ('composition' in recipe) {
      const composition = expandedComposition(recipe, palette);
      background = composition.background;
      content = composition.content;
      defs.push(composition.defs);
    } else if (recipe.shape === 'beam') {
      spot('beam', 1100 - shift * 12, 1250, 950, 1150, one);
      spot('bloom', 1050 - shift * 18, 1080, 1050, 500, two, .9);
    } else if (recipe.shape === 'horizon') {
      defs.push(`<linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${base}"/><stop offset=".3" stop-color="${base}"/><stop offset=".7" stop-color="${one}"/><stop offset="1" stop-color="${two}"/></linearGradient>`);
      content = '<rect width="1600" height="900" fill="url(#horizon)"/>';
      spot('shade', 800 + shift * 18, 140, 1400, 650, base, .9);
      spot('light', 500 + shift * 18, 1000, 1200, 420, two, .6);
    } else if (recipe.shape === 'wash') {
      const a = spot('a', 160 + shift * 8, 740, 1450, 800, one);
      const b = spot('b', 1450, 60 + shift * 8, 1150, 900, two);
      background = `${b}, ${a}, linear-gradient(${base}, ${base})`;
    } else if (recipe.shape === 'mesh' || recipe.shape === 'grain') {
      const a = spot('a', 160 + shift * 10, 200, 1050, 640, one);
      const b = spot('b', 1430 - shift * 7, 770, 1150, 780, two);
      const c = spot('c', 880, 40 + shift * 12, 550, 540, two, .7);
      background = `${c}, ${b}, ${a}, linear-gradient(${base}, ${base})`;
    } else if (recipe.shape === 'glow') {
      const a = spot('a', 800 + shift * 15, 680 - shift * 9, 990, 235, one);
      const b = spot('b', 140, 850, 750, 550, two, .8);
      background = `${b}, ${a}, linear-gradient(${base}, ${base})`;
    } else {
      defs.push(`<linearGradient id="wave" x2="1" y2="1"><stop stop-color="${one}"/><stop offset="1" stop-color="${two}"/></linearGradient><filter id="blur" filterUnits="userSpaceOnUse" x="-800" y="-800" width="3200" height="2500"><feGaussianBlur stdDeviation="60"/></filter>`);
      content += `<g filter="url(#blur)"><path d="M-220 ${80 + shift * 12} C500 -300 900 1100 1800 200" fill="none" stroke="url(#wave)" stroke-width="340"/><path d="M-200 900 C600 0 950 1150 1850 300" fill="none" stroke="${two}" stroke-width="170" opacity=".65"/></g>`;
    }
    if (recipe.shape === 'grain' || recipe.shape === 'horizon' || recipe.shape === 'beam') {
      defs.push('<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>');
      content += '<rect width="1600" height="900" filter="url(#grain)" opacity=".09"/>';
      background = undefined;
    }
    const id = `${recipe.slug}-${palette.id}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs>${defs.join('')}</defs>${content}</svg>`;
    if (variationIds.has(id)) throw new Error(`Duplicate variation ID: ${id}`);
    variationIds.add(id);
    if (!variations.length) { const signature=hash(svg); if(compositions.has(signature)) throw new Error(`Duplicate composition: ${recipe.slug}`); compositions.add(signature); }
    await writeFile(new URL(`${id}.svg`, assetDir), svg);
    const svgName = `${id}.${hash(svg)}.svg`;
    await writeImmutable(new URL(svgName,immutableDir),svg);
    const thumbName = `${id}.${hash(svg+'thumbnail-v1')}.webp`;
    if (!(await exists(new URL(thumbName,thumbnailsDir)))) await writeImmutable(new URL(thumbName,thumbnailsDir),await sharp(Buffer.from(svg),{density:24}).resize(384,216).webp({quality:72}).toBuffer());
    let backgroundSrc;
    if (!background) {
      const imageName = `${id}.${hash(svg+'background-v2')}.webp`;
      if (!(await exists(new URL(imageName,immutableDir)))) await writeImmutable(new URL(imageName,immutableDir),await sharp(Buffer.from(svg)).webp({quality:90}).toBuffer());
      backgroundSrc = `/gradients/assets/${imageName}`;
    }
    templateVariables.push(`  --fg-${id}: ${background ?? `url("..${backgroundSrc.slice('/gradients'.length)}")`};`);
    templateClasses.push(`.fg-${id} { background-color: ${base}; background-image: var(--fg-${id}); }`);
    variations.push({ ...palette, id, src: `/gradients/assets/${svgName}`, thumbnail: `/gradients/thumbnails/${thumbName}`, backgroundSrc, css: background ?? `url("${backgroundSrc}")`, cssKind: background ? 'native' : 'asset' });
  }
  const { palettes: recipePalettes, ...metadata } = recipe;
  const stylesheet = `/* FreeeGradients: ${recipe.name} only. */\n.fg-gradient { background-size: cover; background-position: center; }\n:root {\n${templateVariables.join('\n')}\n}\n${templateClasses.join('\n')}\n`;
  if(Buffer.byteLength(stylesheet)>8192) throw new Error(`Template CSS exceeds 8 KiB: ${recipe.slug}`);
  if (!variations.some(v=>v.mode==='light') || !variations.some(v=>v.mode==='dark')) throw new Error(`Missing light/dark variation: ${recipe.slug}`);
  const stylesheetName = `${recipe.slug}.${hash(stylesheet)}.css`;
  catalogue.push({ ...metadata, id: `FG-${String(index + 1).padStart(3, '0')}`, stylesheet: `/gradients/integrations/${stylesheetName}`, variations });
  await writeImmutable(new URL(stylesheetName,versionedStylesDir),stylesheet);
  // Preserve existing unversioned URLs; new integrations use immutable URLs.
  await writeFile(new URL(`${recipe.slug}.css`, stylesDir),stylesheet.replaceAll('../../assets/','../assets/'));
}
const summaries = catalogue.map((g,index)=>({slug:g.slug,name:g.name,category:g.category,count:g.variations.length,thumbnail:g.variations[index%g.variations.length].thumbnail,tags:[...new Set([...g.tags,...g.variations.flatMap(v=>v.tags)])],previews:g.variations.filter((v,i,all)=>all.findIndex(other=>other.mode===v.mode)===i).map(v=>({id:v.id,mode:v.mode,thumbnail:v.thumbnail}))}));
await writeFile(new URL('search.json',catalogueDir),JSON.stringify(summaries));
for(const colour of ['blue','green','pink','purple','orange','yellow','mint','jade','rose','peach','lavender']) {
  const colourSummaries=summaries.map((summary,index)=>({...summary,previews:catalogue[index].variations.filter(v=>v.tags.includes(colour)).filter((v,i,all)=>all.findIndex(other=>other.mode===v.mode)===i).map(v=>({id:v.id,mode:v.mode,thumbnail:v.thumbnail}))})).filter(summary=>summary.previews.length);
  await writeFile(new URL(`search-${colour}.json`,catalogueDir),JSON.stringify(colourSummaries));
}
for (const template of catalogue) await writeFile(new URL(`templates/${template.slug}.json`,catalogueDir),JSON.stringify(template));
for(const category of ['all',...new Set(catalogue.map(g=>g.category))]) {
  const items=summaries.filter(g=>category==='all'||g.category===category),totalPages=Math.ceil(items.length/24);
  for(let page=1;page<=totalPages;page++) await writeFile(new URL(`pages/${category}-${page}.json`,catalogueDir),JSON.stringify({items:items.slice((page-1)*24,page*24),page,totalPages,total:items.length}));
}
const catalogueFile=new URL('../src/data/generated-gradients.json',import.meta.url);
const stagedCatalogue=new URL('../src/data/generated-gradients.pending.json',import.meta.url);
await writeFile(stagedCatalogue,JSON.stringify(catalogue,null,2)+'\n');
for(let attempt=0;;attempt++){try{await rename(stagedCatalogue,catalogueFile);break;}catch(error){if(attempt===5)throw error;await new Promise(resolve=>setTimeout(resolve,250));}}
// A website integrates only its selected template, never the whole catalogue.
await rm(new URL('freeegradients.css', assetDir), { force: true });
console.log(`Prepared ${catalogue.length} templates, ${catalogue.reduce((sum, template) => sum + template.variations.length, 0)} variations and reusable CSS.`);


await import('./build-social.mjs');
