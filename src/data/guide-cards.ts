import { gradients } from './gradients';

// Keep a guide's selected background consistent in the directory and related cards.
const guideBackgrounds: Record<string, string> = {
  'use-css-gradients': 'grain-bloom-09',
  'mesh-gradient-backgrounds': 'luminous-wisp-12',
  'readable-text-on-gradients': 'azure-cloud-03',
  'gradient-export-formats': 'luminous-drift-10',
  '4k-gradient-backgrounds': 'spectral-reflection-01',
  'gradients-for-figma-canva-presentations': 'reflected-dawn-06',
  'react-tailwind-gradient-backgrounds': 'ion-ribbon-03',
  'landing-page-gradient-backgrounds': 'ember-well-02',
  'gradient-styles-explained': 'twofold-02',
};
const variations = new Map(gradients.flatMap(template => template.variations.map(variation => [variation.id, variation] as const)));
if (new Set(Object.values(guideBackgrounds)).size !== Object.keys(guideBackgrounds).length) {
  throw new Error('Every guide needs its own unique card gradient.');
}
export function guideCardVariation(slug: string) {
  const variation = variations.get(guideBackgrounds[slug]);
  if (!variation || variation.mode !== 'dark') throw new Error(`Missing dark-mode card gradient for guide: ${slug}`);
  return variation;
}
