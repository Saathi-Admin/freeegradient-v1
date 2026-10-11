import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageSeo} from '../src/data/seo.ts';
const gradients = JSON.parse(await readFile('src/data/generated-gradients.json','utf8'));

const origin = process.env.PUBLIC_SITE_URL || 'https://freeegradients.com';
const sitemap = await readFile('dist/sitemap.xml','utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert(locations.length > gradients.length, 'Sitemap must include templates and listing hubs');
assert.equal(new Set(locations).size, locations.length, 'Sitemap URLs must be unique');
const sitemapUrls = new Set(locations);
const titles = new Map();
for (const location of locations) {
  const url = new URL(location);
  assert.equal(url.origin, new URL(origin).origin, `Wrong sitemap origin: ${location}`);
  const html = await readFile(`dist${url.pathname}index.html`,'utf8');
  assert(html.includes(`rel="canonical" href="${location}"`), `Canonical mismatch: ${location}`);
  assert(!/<meta name="robots" content="[^"]*noindex/.test(html), `Indexing blocked: ${location}`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `Missing description: ${location}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `Expected one H1: ${location}`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(title, `Missing title: ${location}`);
  assert(!title.includes('undefined'), `Invalid category title: ${location}`);
  assert(!titles.has(title), `Duplicate title: ${location} and ${titles.get(title)}`);
  titles.set(title,location);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert(schemas.length, `Missing structured data: ${location}`);
  for (const [,json] of schemas) {
    const schema = JSON.parse(json);
    assert(schema['@graph'].some(node=>node.url === location), `Schema URL mismatch: ${location}`);
  }
}
for (const path of ['/playground/','/design-system/','/gradients/browse/light/1/','/gradients/browse/dark/1/']) {
  const html = await readFile(`dist${path}index.html`,'utf8');
  assert(/<meta name="robots" content="noindex, follow"/.test(html), `Utility/filter indexable: ${path}`);
  assert(!sitemapUrls.has(new URL(path,origin).href), `Utility/filter in sitemap: ${path}`);
}
for (const template of gradients) {
  const canonical = new URL(`/gradients/${template.variations[0].id}/`,origin).href;
  assert(sitemapUrls.has(canonical), `Template absent from sitemap: ${template.slug}`);
  for (const variation of template.variations.slice(1)) {
    const html = await readFile(`dist/gradients/${variation.id}/index.html`,'utf8');
    assert(html.includes(`rel="canonical" href="${canonical}"`), `Variation canonical mismatch: ${variation.id}`);
    assert(!sitemapUrls.has(new URL(`/gradients/${variation.id}/`,origin).href), `Duplicate variation in sitemap: ${variation.id}`);
  }
}
const robots = await readFile('dist/robots.txt','utf8');
assert(robots.includes('Allow: /') && !robots.includes('Disallow: /'), 'Production crawling blocked');
assert(robots.includes(new URL('/sitemap.xml',origin).href), 'Wrong robots sitemap');
assert.equal(pageSeo({site:new URL(origin),path:'/',production:true,preview:true}).blockIndex,true);
console.log(`Production SEO passed: ${locations.length} indexable canonical pages; ${gradients.length} templates; all sibling variations consolidate correctly; utilities excluded; structured data valid.`);
