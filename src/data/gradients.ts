import type { GradientTemplate } from '../types/gradient';
import catalogue from './generated-gradients.json';

export const gradients = catalogue as GradientTemplate[];

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
