import { collections } from './collections';
import { collectionVariations } from './gradients';
import type { GradientTemplate } from '../types/gradient';
export type BrowseMode = 'all' | 'light' | 'dark';
export const gradientPageSize = 48;
export function gradientResults(mode: BrowseMode, category?: GradientTemplate['category']) {
  return collections.filter(collection=>!category || collection.id===category).flatMap(collection => collectionVariations(collection.id))
    .filter(card => mode === 'all' || card.variation.mode === mode)
    .sort((a,b) => Number(a.variation.mode === 'light') - Number(b.variation.mode === 'light'));
}
export function gradientPageUrl(mode: BrowseMode, page = 1, category?: GradientTemplate['category']) {
  if (category) return mode==='all' && page===1 ? `/collections/${category}/` : `/collections/browse/${category}/${mode}/${page}/`;
  return mode === 'all' && page === 1 ? '/gradients/' : `/gradients/browse/${mode}/${page}/`;
}
