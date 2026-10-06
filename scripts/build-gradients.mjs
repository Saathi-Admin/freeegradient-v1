import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { deflateRawSync } from 'node:zlib';
import { palettes, recipes } from '../src/data/recipes.mjs';
const assetDir = new URL('../public/gradients/', import.meta.url);
await mkdir(assetDir, { recursive: true });
const catalogue = [], variables = [], classes = [];
for (const [index, recipe] of recipes.entries()) {
  const variations = [];
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
    if (recipe.shape === 'beam') {
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
    await writeFile(new URL(`${id}.svg`, assetDir), svg);
    variables.push(`  --fg-${id}: ${background ?? `url("./${id}.svg")`};`);
    classes.push(`.fg-${id} { background-image: var(--fg-${id}); }`);
    variations.push({ ...palette, id, src: `/gradients/${id}.svg`, css: background ?? `url("/gradients/${id}.svg")`, cssKind: background ? 'native' : 'asset' });
  }
  const { palettes: recipePalettes, ...metadata } = recipe;
  catalogue.push({ ...metadata, id: `FG-${String(index + 1).padStart(3, '0')}`, variations });
}
await writeFile(new URL('../src/data/generated-gradients.json', import.meta.url), JSON.stringify(catalogue, null, 2) + '\n');
await writeFile(new URL('freeegradients.css', assetDir), `/* FreeeGradients: stable IDs; keep SVG assets alongside this file for textured templates. */\n:root {\n${variables.join('\n')}\n}\n.fg-gradient { background-size: cover; background-position: center; }\n${classes.join('\n')}\n`);
console.log(`Prepared ${catalogue.length} templates, ${catalogue.reduce((sum, template) => sum + template.variations.length, 0)} variations and reusable CSS.`);

// Portable ZIP with no runtime API or third-party archive service.
const entries = [
  ['gradients/freeegradients.css', await readFile(new URL('freeegradients.css', assetDir))],
  ['README.txt', Buffer.from('FreeeGradients\n\nFree for personal and commercial use. Attribution appreciated, not required.\n\nKeep the gradients folder intact. Link gradients/freeegradients.css from your HTML.\nUse class="fg-gradient fg-aurora-01". Change the stable variation ID to change the background.\nGrain and wave templates load their adjacent SVG assets; all other templates use native CSS.\nPNG/JPEG exports are available from the website.\n')],
];
for (const template of catalogue) for (const v of template.variations) entries.push([`gradients/${v.id}.svg`, await readFile(new URL(`${v.id}.svg`,assetDir))]);
const crc32 = data => { let crc = 0xffffffff; for (const byte of data) { crc ^= byte; for (let i=0;i<8;i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; };
function zip(entries) {
const locals = [], central = []; let offset = 0;
for (const [name, data] of entries) {
  const filename = Buffer.from(name), compressed = deflateRawSync(data), crc = crc32(data);
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20,4); local.writeUInt16LE(8,8); local.writeUInt16LE(0x21,12); local.writeUInt32LE(crc,14); local.writeUInt32LE(compressed.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(filename.length,26);
  const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20,4); directory.writeUInt16LE(20,6); directory.writeUInt16LE(8,10); directory.writeUInt16LE(0x21,14); directory.writeUInt32LE(crc,16); directory.writeUInt32LE(compressed.length,20); directory.writeUInt32LE(data.length,24); directory.writeUInt16LE(filename.length,28); directory.writeUInt32LE(offset,42);
  locals.push(local,filename,compressed); central.push(directory,filename); offset += local.length+filename.length+compressed.length;
}
const centralData = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10); end.writeUInt32LE(centralData.length,12); end.writeUInt32LE(offset,16);
return Buffer.concat([...locals,centralData,end]);
}
await writeFile(new URL('freeegradients.zip',assetDir),zip(entries));
const footerEntries = entries.filter(([name]) => name === 'README.txt' || catalogue.filter(g => g.category === 'footer').some(g => g.variations.some(v => name.endsWith(`/${v.id}.svg`))));
footerEntries.push(['gradients/freeegradients.css', Buffer.from(`:root {\n${variables.filter(v => /fg-(afterglow|uplift|nightfall)-/.test(v)).join('\n')}\n}\n.fg-gradient {background-size:cover;background-position:center;}\n${classes.filter(v => /fg-(afterglow|uplift|nightfall)-/.test(v)).join('\n')}`)]);
await writeFile(new URL('footer-glow-pack.zip',assetDir),zip(footerEntries));
