import type { GradientTemplate, GradientVariation } from '../types/gradient';
export interface TemplateSummary {
  slug: string; name: string; category: GradientTemplate['category']; count: number;
  thumbnail: string; tags: string[];
  previews: Pick<GradientVariation, 'id' | 'mode' | 'thumbnail'>[];
}
export interface CataloguePage { items: TemplateSummary[]; page: number; totalPages: number; total: number; }
const indices = new Map<string, Promise<TemplateSummary[]>>();
export function loadSearchIndex(colour = 'all') {
  if (!['all','blue','red','green','pink','purple','orange','yellow','mint','jade','rose','peach','lavender'].includes(colour)) colour='all';
  let indexPromise=indices.get(colour);
  if(indexPromise) return indexPromise;
  indexPromise = fetch(`/gradients/catalogue/search${colour==='all'?'':`-${colour}`}.json`).then(async response => {
    if (!response.ok) throw new Error('Search unavailable');
    return await response.json() as TemplateSummary[];
  }).catch(error => { indices.delete(colour); throw error; });
  indices.set(colour,indexPromise); return indexPromise;
}
export async function loadTemplate(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Unknown template');
  const response = await fetch(`/gradients/catalogue/templates/${slug}.json`);
  if (!response.ok) throw new Error('Template unavailable');
  return await response.json() as GradientTemplate;
}
export function matchesTemplate(item: TemplateSummary, query: string) {
  const text = `${item.name} ${item.slug} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(word=>text.includes(word));
}
