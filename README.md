# FreeeGradients

Static Astro gradient library with 1,026 templates and 8,148 light/dark colour variations. New collections appear in the header, footer, collection directory and playground; the homepage keeps its curated featured sections.

## Development

Use Node 22.19+ (or the bundled Node runtime).

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 2000
npm run check
npm run build
node scripts/verify-library.mjs
```

`npm run assets` regenerates catalogue data and artwork after recipe changes. Sharp is a direct dependency for WebP generation. Builds are static and currently noindex. No permanent domain or hosting account has been configured.

## User integration

Details pages offer two independent approaches:

- **Copy CSS:** standalone CSS for the selected variation. Native gradients require no image request; textured gradients reference only their selected optimized, versioned background image.
- **Copy stylesheet link + Copy class:** add one template stylesheet to the HTML head, then add `fg-gradient` and its colour class to the element. Swap only the colour class to change variations within that template. A different template requires its own stylesheet link.

Stylesheets contain no font imports, JavaScript, animations, page resets or layout dimensions. Each class has a solid fallback colour. The user controls their element size and text contrast. Individual SVG/PNG/JPEG export remains available; there is no bulk ZIP or combined catalogue stylesheet.

Copied URLs use the currently viewed origin. A development tunnel is temporary and Astro intentionally restricts cross-site subresource loading on its development server. Real integrations need the permanent static production origin; do not ship tunnel URLs in users’ websites.

## Loading and caching

- Template CSS and artwork have versioned filenames. Published immutable files are retained instead of overwritten so existing copied links keep their original appearance.
- `/gradients/integrations/`, `/gradients/assets/` and `/gradients/thumbnails/` are configured for long immutable caching in `public/_headers`. Unversioned catalogue JSON and compatibility CSS are revalidated.
- Gallery cards, collection covers, sidebar cards and variation selectors use 384 × 216 WebP thumbnails. SVG is fetched when needed for individual exports, rather than rendered repeatedly for thumbnail grids.
- Textured website backgrounds use pre-rendered WebP, avoiding live SVG filter work on consumers’ pages. Native gradients use CSS directly in the playground.
- Global and collection listings render at most 48 variations per page. Light/dark filters apply across the complete collection, not just the visible page.
- Search and collection/colour filters load their compact index on interaction, then display 24 template results at a time. Filters are stored in the URL and restored after returning from a details page.
- The playground initially renders 24 template cards and no hidden variation cards. Only the opened template JSON is fetched; only its variations are created. Back restores the browser page, search and scroll position. The in-memory template cache is bounded to eight entries.
- How-to presents a short set of example templates; every template can be integrated from its own details page.

Cache headers become active on a host that supports the `_headers` format, such as Cloudflare Pages. Compression and CDN delivery must be verified on the deployed host, not inferred from development behaviour.

## Validation and the 10k target

`node scripts/verify-library.mjs` checks duplicate IDs, stylesheet and asset references, both design modes, fallback colours and budgets: 8 KiB template CSS, 16 KiB thumbnail and 256 KiB textured background. Artwork generation rejects exact duplicate first-colour compositions. Similar-looking designs still require visual review.

The current batch has been tested for clipboard copying, native and textured class swaps, individual image downloads, paginated filters, search, on-demand playground loading and mobile overflow. See `PERFORMANCE.md` for measurements and outstanding deployment work.

10k distinct templates are a future content milestone, not a claim that the current 1,000-template library has passed a 10k production load test. Before that expansion:

1. Choose and configure the permanent domain/CDN, compression and asset hosting.
2. Account for the number of immutable assets and variation detail pages. The current static packaging will exceed Cloudflare Pages Free’s 20,000-file limit at 10k templates; even the paid 100,000-file limit is not enough for an unrestricted multi-asset, multi-page-per-variation build. Plan separate asset storage and fewer generated detail pages or server-rendered/on-demand routes before reaching those limits.
3. Measure Core Web Vitals and resource loading on real mobile devices and slower networks, including a representative 10k catalogue.
4. Review batches for duplicate-looking compositions, useful palettes and texture quality before publishing.

Official hosting references: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) and [header matching](https://developers.cloudflare.com/pages/configuration/headers/).

## Structure

- `src/data/recipes.mjs`, `expanded-recipes.mjs`: original composition recipes and stable names.
- `scripts/build-gradients.mjs`: versioned SVG/WebP artwork, per-template CSS and small catalogue endpoints.
- `src/components/ui/`: shared buttons and tab bars.
- `src/scripts/library.ts`: standalone copy and individual export behaviour.
- `src/scripts/catalogue.ts`, `gradient-search.ts`, `playground.ts`: bounded browsing, filtering and on-demand data loading.
- `src/styles/tokens.css`: shared typography, radii and spacing; section padding is 96px per side.
- `public/_headers`: production caching and response headers.
- `references/`, `images/`: preserved reference material; not included as library downloads.

## SEO launch configuration

Set `PUBLIC_SITE_URL` to the permanent HTTPS origin in the production build environment, then build. Development and unconfigured builds remain noindex. Production builds with this origin emit canonical URLs, Open Graph metadata, WebPage structured data, an indexable robots.txt and a sitemap. Each template has one canonical variation page; sibling variations canonicalize to it. Light/dark filter pages and playground are not indexed; all-mode paginated listings remain crawlable. No final domain, Search Console verification or public deployment has been configured.

Three guides live at `/guides/`, linked from the footer and template detail pages. The homepage remains curated. Template detail pages include copyable palette hex values and related designs.

`npm run review` writes a similarity report and a sample contact sheet in `reports/`. This is a screening tool, not proof every composition is perceptually unique or a replacement for full editorial review. The 1,000-template batch has 5 low-distance pairs among previous designs and none involving new designs at the current threshold.

The current public asset directory has 27,302 files before adding generated HTML. It already exceeds Cloudflare Pages Free’s file limit. The local preview works, but production hosting must account for this count before launch.

## Reference-inspired original studies

26 hand-composed templates (208 variants) are added in Colour studies, Liquid flow and Iridescent silk. They are authored in `src/data/reference-recipes.mjs`, rather than importing the supplied Pinterest screenshots. The artwork contains no text, watermark, grid overlay, logo or card frame. Native blends use CSS; sculpted paths, glass textures and grain use an optimized image fetched only when used. Six different holographic compositions include a fold, current, sail, loop, fan and orbit.

`node scripts/review-studies.mjs` generates a text-free contact sheet. Each study has eight variants, a versioned stylesheet, copyable classes and all existing export formats. Homepage featured content remains curated; header/footer collections, listing and playground include these collections.
