import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const catalogue=JSON.parse(await readFile(new URL('../src/data/generated-gradients.json',import.meta.url),'utf8'));
const publicRoot=new URL('../public/',import.meta.url);
const file=path=>new URL(path.replace(/^\//,''),publicRoot);
const names=new Set(),ids=new Set(),stats={templates:catalogue.length,variations:0,maxCssBytes:0,maxCssGzipBytes:0,maxThumbnailBytes:0,maxBackgroundBytes:0};
for(const template of catalogue) {
  assert(!names.has(template.slug),`Duplicate template ${template.slug}`);names.add(template.slug);
  const css=await readFile(file(template.stylesheet),'utf8');
  assert(css.includes('.fg-gradient'),`Missing base class for ${template.slug}`);
  assert(!/@import|@font-face|animation|transition|body\s*\{|html\s*\{/i.test(css),`Unexpected global styling or runtime dependency in ${template.slug}`);
  assert(Buffer.byteLength(css)<=8192,`CSS exceeds 8 KiB for ${template.slug}`);
  stats.maxCssBytes=Math.max(stats.maxCssBytes,Buffer.byteLength(css));stats.maxCssGzipBytes=Math.max(stats.maxCssGzipBytes,gzipSync(css).length);
  for(const reference of css.matchAll(/url\("([^"]+)"\)/g)) await stat(new URL(reference[1],file(template.stylesheet)));
  assert(template.variations.some(v=>v.mode==='light')&&template.variations.some(v=>v.mode==='dark'),`Missing design mode for ${template.slug}`);
  for(const variation of template.variations) {
    assert(!ids.has(variation.id),`Duplicate variation ${variation.id}`);ids.add(variation.id);stats.variations++;
    assert(css.includes(`.fg-${variation.id} {`),`Missing variation class ${variation.id}`);
    assert(css.includes(`.fg-${variation.id} { background-color: ${variation.colors[0]};`),`Missing loading fallback for ${variation.id}`);
    if(template.study||variation.sourceKind){
      const svg=await readFile(file(variation.src),'utf8');
      assert(!/<text\b/i.test(svg),`Unexpected artwork text: ${variation.id}`);
      if(variation.sourceKind) {
        const images=[...svg.matchAll(/<image\b[^>]*href="([^"]+)"[^>]*\/>/g)];
        assert.equal(images.length,1,`Original artwork must contain one self-contained image: ${variation.id}`);
        assert(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(images[0][1]),`Original artwork must embed PNG bytes without external references: ${variation.id}`);
        assert(variation.sourceWidth>0&&variation.sourceHeight>0,`Missing original image dimensions: ${variation.id}`);
      }else assert(!/<image\b/i.test(svg),`Procedural artwork must not embed images: ${variation.id}`);
    }
    await stat(file(variation.src));const thumbnail=await stat(file(variation.thumbnail));
    assert(thumbnail.size<=16384,`Thumbnail exceeds 16 KiB for ${variation.id}`);stats.maxThumbnailBytes=Math.max(stats.maxThumbnailBytes,thumbnail.size);
    // Lossless reference artwork retains original grain; procedural backgrounds keep their smaller budget.
    if(variation.backgroundSrc){const image=await stat(file(variation.backgroundSrc));const budget=variation.sourceKind?4194304:262144;assert(image.size<=budget,`Background exceeds ${budget} bytes for ${variation.id}`);stats.maxBackgroundBytes=Math.max(stats.maxBackgroundBytes,image.size);}
  }
  const endpoint=JSON.parse(await readFile(file(`/gradients/catalogue/templates/${template.slug}.json`),'utf8'));
  assert.equal(endpoint.stylesheet,template.stylesheet,`Stale template endpoint ${template.slug}`);
}
const page=JSON.parse(await readFile(file('/gradients/catalogue/pages/all-1.json'),'utf8'));
assert(page.items.length<=24,'Playground page exceeds 24 templates');assert.equal(page.total,catalogue.length);
console.log(JSON.stringify(stats,null,2));
console.log('Verified unique IDs, per-template CSS, no font/JS/animation dependency, resolved assets, fallback colours and size budgets.');
