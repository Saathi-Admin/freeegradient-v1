// Curved luminous horizons: an off-canvas ellipse creates a soft spectral rim.
const palettes = [
  ['01', 'Violet coral', 'dark', ['#10051d', '#b526ee', '#d9e4d3', '#ff657d'], ['purple', 'pink', 'coral']],
  ['02', 'Blue aurora', 'dark', ['#030d21', '#226deb', '#bfeef0', '#31ceba'], ['blue', 'cyan', 'green']],
  ['03', 'Amber dusk', 'dark', ['#1c0712', '#e94765', '#ffe7b2', '#ff9829'], ['orange', 'yellow', 'pink']],
  ['04', 'Emerald halo', 'dark', ['#031a15', '#109e72', '#d9fac5', '#a3dd3b'], ['green', 'mint', 'yellow']],
  ['05', 'Rose daylight', 'light', ['#f8edf7', '#b5a0e5', '#fff8da', '#f88aaa'], ['pink', 'rose', 'lavender', 'pastel']],
  ['06', 'Ocean daylight', 'light', ['#eff6fd', '#83bce8', '#e7ffee', '#8edbc9'], ['blue', 'mint', 'pastel']],
].map(([id, name, mode, colors, tags]) => ({ id, name, mode, colors, tags }));

const designs = [
  ['halo-canopy', 'Halo canopy', 800, -430, 1250, 970, 0],
  ['halo-vault', 'Halo vault', 800, -170, 960, 650, 0],
  ['halo-lean', 'Halo lean', 620, -340, 1350, 900, -12],
  ['halo-sweep', 'Halo sweep', 1090, -280, 1420, 890, 14],
  ['halo-dawn', 'Halo dawn', 800, -680, 1700, 1350, 0],
  ['halo-crescent', 'Halo crescent', 330, -380, 1250, 1150, -22],
  ['halo-archway', 'Halo archway', 1250, -420, 1220, 1160, 22],
  ['halo-aperture', 'Halo aperture', 800, -120, 1470, 470, 0],
];
export const haloHorizonRecipes = designs.map(([slug, name, x, y, rx, ry, angle], position) => ({
  slug, name, category: 'halo-horizons', shape: 'study', study: 'halo-horizon', position,
  halo: { x, y, rx, ry, angle }, palettes,
  tags: ['halo', 'horizon', 'arc', 'glow', 'soft', 'grain', 'spectral'],
}));

export function haloHorizonComposition(recipe, palette) {
  const [base, rim, light, crown] = palette.colors;
  const { x, y, rx, ry, angle } = recipe.halo;
  const stops = [[0, crown], [.38, crown], [.56, light], [.7, rim], [.96, base], [1, base]];
  const defs = `<radialGradient id="halo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${x} ${y}) rotate(${angle}) scale(${rx} ${ry})">${stops.map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`).join('')}</radialGradient><filter id="halo-grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  return {
    background: undefined,
    defs,
    content: `<rect width="1600" height="900" fill="url(#halo)"/><rect width="1600" height="900" filter="url(#halo-grain)" opacity=".055"/>`,
  };
}
