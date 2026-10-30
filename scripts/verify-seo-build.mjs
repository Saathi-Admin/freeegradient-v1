import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageSeo} from '../src/data/seo.ts';
import {questions} from '../src/data/answers.ts';
import {guides} from '../src/data/guides.ts';
const gradients = JSON.parse(await readFile('src/data/generated-gradients.json','utf8'));

const origin = process.env.PUBLIC_SITE_URL || 'https://freeegradients.com';
const sitemap = await readFile('dist/sitemap.xml','utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert(locations.length > gradients.length, 'Sitemap must include templates and listing hubs');
assert.equal(new Set(locations).size, locations.length, 'Sitemap URLs must be unique');
const sitemapUrls = new Set(locations);
const home = await readFile('dist/index.html','utf8');
const homeGraph = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
const faq = homeGraph.find(node=>node['@type']==='FAQPage');
assert.equal(faq.mainEntity.length, questions.length, 'Every visible FAQ must be in the FAQ graph');
const escapeHtml = text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
for (const {question,answer} of questions) {
  assert(home.includes(escapeHtml(question)) && home.includes(escapeHtml(answer)), `FAQ missing from server HTML: ${question}`);
  assert(faq.mainEntity.some(node=>node.name===question && node.acceptedAnswer.text===answer), `FAQ schema differs from visible answer: ${question}`);
}
assert(homeGraph.some(node=>node['@type']==='Organization' && node.name==='Arclink Edge'), 'Missing creator identity');
assert(sitemapUrls.has(new URL('/about/',origin).href), 'About page absent from sitemap');
for (const guide of guides) {
  const path=`/guides/${guide.slug}/`;
  assert(sitemapUrls.has(new URL(path,origin).href), `Guide absent from sitemap: ${guide.slug}`);
  const html=await readFile(`dist${path}index.html`,'utf8');
  assert(html.includes(escapeHtml(guide.description)), `Guide answer missing from server HTML: ${guide.slug}`);
  for (const [heading,text] of guide.sections) assert(html.includes(escapeHtml(heading)) && html.includes(escapeHtml(text)), `Guide content missing: ${guide.slug}`);
  assert(html.includes('property="og:type" content="article"'), `Wrong social type: ${guide.slug}`);
  // Verify authored links and preview images resolve to build artifacts, including fragments.
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(#[^"]*)?"/g)) {
    const [,target,fragment]=match;
    const file=target.endsWith('/') ? `dist${target}index.html` : `dist${target}`;
    const contents=await readFile(file);
    if(fragment && target.endsWith('/')) assert(contents.toString().includes(`id="${fragment.slice(1)}"`), `Broken fragment: ${target}${fragment}`);
  }
}
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
for (const path of ['/studio-vault-7k9m4x/','/playground/','/design-system/','/gradients/browse/light/1/','/gradients/browse/dark/1/']) {
  const html = await readFile(`dist${path}index.html`,'utf8');
  assert(/<meta name="robots" content="noindex, follow"/.test(html), `Utility/filter indexable: ${path}`);
  assert(!sitemapUrls.has(new URL(path,origin).href), `Utility/filter in sitemap: ${path}`);
}
for (const template of gradients) {
  const canonical = new URL(`/gradients/${template.variations[0].id}/`,origin).href;
  assert(sitemapUrls.has(canonical), `Template absent from sitemap: ${template.slug}`);
  const html = await readFile(`dist/gradients/${template.variations[0].id}/index.html`,'utf8');
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  const image = graph.find(node=>node['@type']==='ImageObject');
  assert.equal(image.contentUrl,new URL(template.variations[0].src,origin).href, `Wrong artwork: ${template.slug}`);
  assert.equal(image.license, new URL('/about/#usage',origin).href, `Missing image license: ${template.slug}`);
  assert.equal(image.acquireLicensePage, image.license, `Missing image licensing page: ${template.slug}`);
  assert.equal(image.creditText, 'FreeeGradients by Arclink Edge', `Missing image credit: ${template.slug}`);
  assert.equal(image.copyrightNotice, `© ${new Date().getFullYear()} FreeeGradients`, `Missing image copyright notice: ${template.slug}`);
  assert(html.includes(escapeHtml(image.description)), `Artwork description not visible: ${template.slug}`);
  for (const variation of template.variations.slice(1)) {
    const html = await readFile(`dist/gradients/${variation.id}/index.html`,'utf8');
    assert(html.includes(`rel="canonical" href="${canonical}"`), `Variation canonical mismatch: ${variation.id}`);
    assert(!sitemapUrls.has(new URL(`/gradients/${variation.id}/`,origin).href), `Duplicate variation in sitemap: ${variation.id}`);
  }
}
const robots = await readFile('dist/robots.txt','utf8');
const about = await readFile('dist/about/index.html','utf8');
assert(about.includes('id="usage"') && about.includes('free for personal and commercial use'), 'Image license must link to visible usage terms');
assert(robots.includes('Allow: /') && !robots.includes('Disallow: /'), 'Production crawling blocked');
assert(robots.includes(new URL('/sitemap.xml',origin).href), 'Wrong robots sitemap');
assert.equal(pageSeo({site:new URL(origin),path:'/',production:true,preview:true}).blockIndex,true);
console.log(`Production SEO passed: ${locations.length} indexable canonical pages; ${gradients.length} templates; all sibling variations consolidate correctly; utilities excluded; structured data valid.`);
