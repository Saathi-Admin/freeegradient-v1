import { gradients } from '../../../data/gradients';

export function GET() {
  const items = gradients.flatMap(template => template.variations.map(variation => ({
    id: variation.id,
    slug: template.slug,
    name: template.name,
    variationName: variation.name,
    category: template.category,
    mode: variation.mode,
    thumbnail: variation.thumbnail,
    tags: [...template.tags, ...variation.tags],
  })));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
