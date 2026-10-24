import type { GradientTemplate } from '../types/gradient';
import catalogue from './generated-gradients.json';
import { collections } from './collections';

export const gradients = catalogue as GradientTemplate[];
// Follow the collection navigation order, keeping each template's palettes together.
export const collectionOrderedGradients = collections.flatMap(collection =>
  gradients.filter(gradient => gradient.category === collection.id)
);
const variationsById = new Map(gradients.flatMap(g=>g.variations.map(v=>[v.id,v] as const)));
export function collectionThumbnail(preview: string) {
  return variationsById.get(preview.split('/').pop()?.replace('.svg','') ?? '')?.thumbnail ?? preview;
}

export function collectionVariations(category: GradientTemplate['category']) {
  const seenIds = new Set<string>();
  const seenPreviews = new Set<string>();
  return gradients.filter(gradient => gradient.category === category)
    .flatMap(gradient => gradient.variations.map(variation => ({ gradient, variation })))
    .filter(({ variation }) => {
      if (seenIds.has(variation.id) || seenPreviews.has(variation.src)) return false;
      seenIds.add(variation.id);
      seenPreviews.add(variation.src);
      return true;
    })
    .sort((a, b) => Number(a.variation.mode === 'light') - Number(b.variation.mode === 'light'));
}
