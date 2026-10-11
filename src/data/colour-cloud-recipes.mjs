// Original blurred colour fields inspired by the supplied moodboard.
const designs = [
  ['apricot-cloud', 'Apricot cloud', ['#fff0e9', '#ff7300', '#ffb8d6', '#ffe7ad'], [[12,100,65,65,1],[95,55,75,105,2],[45,8,60,80,3]]],
  ['orchid-cloud', 'Orchid cloud', ['#f7d9ff', '#c600f5', '#ff67c2', '#ffd350'], [[58,82,48,65,1],[105,82,65,75,2],[2,105,48,40,3]]],
  ['citrus-cloud', 'Citrus cloud', ['#eafad3', '#00c887', '#dbf424', '#ffad68'], [[0,0,46,70,1],[60,18,57,95,2],[0,105,80,43,3]]],
  ['candy-cloud', 'Candy cloud', ['#e6edff', '#fb26d3', '#b77bff', '#bce8ff'], [[28,104,85,65,1],[105,90,56,72,2],[75,0,68,65,3]]],
  ['azure-cloud', 'Azure cloud', ['#c7efff', '#006bda', '#00c7e4', '#d8f9ff'], [[0,30,68,108,1],[100,72,55,110,2],[70,5,40,80,3]]],
  ['confetti-cloud', 'Confetti cloud', ['#ffb5e8', '#ffe450', '#acacff', '#ffb55d'], [[20,12,30,62,1],[83,55,24,44,2],[40,82,44,75,3]]],
  ['mango-cloud', 'Mango cloud', ['#d7edff', '#ffb50a', '#ff818c', '#beb0ff'], [[50,22,45,83,1],[55,82,66,56,2],[100,95,45,78,3]]],
  ['sorbet-cloud', 'Sorbet cloud', ['#e2fbf7', '#ff9b00', '#ffc9d6', '#fff0cf'], [[58,110,76,63,1],[63,30,76,56,2],[2,60,65,60,3]]],
  ['iris-cloud', 'Iris cloud', ['#f0e3ff', '#a396ff', '#ffcf42', '#56c1fa'], [[23,55,30,83,1],[49,47,21,40,2],[53,104,80,55,3],[78,56,30,38,1]]],
];

const colourTags = [
  ['orange', 'peach', 'pink'], ['purple', 'pink', 'yellow'], ['green', 'mint', 'yellow', 'orange'],
  ['pink', 'purple', 'blue', 'lavender'], ['blue', 'cyan'], ['pink', 'yellow', 'purple', 'orange'],
  ['orange', 'yellow', 'pink', 'blue', 'lavender'], ['orange', 'peach', 'pink', 'mint'], ['purple', 'lavender', 'yellow', 'blue'],
];
export const colourCloudRecipes = designs.map(([slug, name, colors, fields], position) => ({
  slug, name, category: 'colour-clouds', shape: 'study', study: 'colour-cloud', position, fields,
  tags: ['blur', 'mesh', 'soft', 'colourful', 'cloud', 'grain', ...colourTags[position]],
  palettes: [
    { id: '01', name: 'Daylight', mode: 'light', colors, tags: ['pastel', ...colourTags[position]] },
    { id: '02', name: 'Candy drift', mode: 'light', colors: ['#f5f1ff', colors[2], colors[3], colors[1]], tags: ['pastel', ...colourTags[position]] },
    { id: '03', name: 'After dark', mode: 'dark', colors: ['#101326', ...colors.slice(1)], tags: ['night', 'glow', ...colourTags[position]] },
    { id: '04', name: 'Midnight drift', mode: 'dark', colors: ['#191025', colors[3], colors[1], colors[2]], tags: ['night', 'glow', ...colourTags[position]] },
  ],
}));

export function colourCloudComposition(recipe, palette) {
  const defs = ['<filter id="cloud-soft" filterUnits="userSpaceOnUse" x="-800" y="-800" width="3200" height="2500"><feGaussianBlur stdDeviation="38"/></filter>'];
  const fields = recipe.fields.map(([x, y, rx, ry, index], i) => {
    const color = palette.colors[index];
    defs.push(`<radialGradient id="cloud-${i}"><stop stop-color="${color}" stop-opacity=".98"/><stop offset=".38" stop-color="${color}" stop-opacity=".85"/><stop offset=".72" stop-color="${color}" stop-opacity=".4"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    return `<ellipse cx="${x * 16}" cy="${y * 9}" rx="${rx * 16}" ry="${ry * 9}" fill="url(#cloud-${i})"/>`;
  }).join('');
  // Broad translucent folds soften the transitions without hard edges.
  const fold = [1, 3, 4, 7].includes(recipe.position)
    ? `<path d="M${100 + recipe.position * 70} -180 C220 250 960 370 1250 1090" fill="none" stroke="${palette.colors[0]}" stroke-width="170" opacity=".5"/>` : '';
  defs.push('<filter id="cloud-grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>');
  return {
    background: undefined,
    defs: defs.join(''),
    content: `<rect width="1600" height="900" fill="${palette.colors[0]}"/><g filter="url(#cloud-soft)">${fields}${fold}</g><rect width="1600" height="900" filter="url(#cloud-grain)" opacity=".025"/>`,
  };
}
