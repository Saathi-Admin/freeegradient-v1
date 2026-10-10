# Performance implementation audit

## Original colour studies — 9 October 2026

26 reference-inspired, hand-composed templates / 208 variants added; total 1,026 / 8,148. Three new collections: Colour studies, Liquid flow, Iridescent silk. All 26 primary artworks were visually reviewed; SVG checks reject text and embedded image references across all their variants. Asset budget verification passes: maximum thumbnail 4,354 bytes; maximum textured background 142,130 bytes; maximum template CSS remains 6,149 bytes. Details CSS copy, holographic PNG export (1920×1080), deep-linked playground selection, eight variants and 390px mobile layout were verified in the browser.


## 1,000-template batch — 9 October 2026

- 1,000 templates / 7,940 variations, preserving the original 100 templates and URLs.
- Maximum template CSS: 6,149 raw bytes / 858 bytes local gzip estimate.
- Maximum thumbnail: 2,654 bytes. Maximum textured background: 90,554 bytes.
- Automated geometry/hash checks and asset budgets passed. RGB thumbnail screening across collections flagged 5 existing-design pairs; no new pair below the threshold. A 173-thumbnail sample was visually reviewed. This is not a full editorial review of all 1,000 templates.
- Browser checks passed for a new template, all 8 variants, copying hex and stylesheet, complete-catalogue search, lazy playground selection, guides and mobile overflow.
- SEO configuration tests passed. Permanent production domain and deployment remain pending.
- The public assets alone contain 27,302 files, already above Cloudflare Pages Free’s 20,000-file limit. Use a suitable hosting tier/platform or separate asset storage before deploying this batch; no paid hosting has been provisioned.

Historical measurements below describe the previous 100-template batch.

Validated on the 100-template / 740-variation batch, 9 October 2026. These are local build and browser checks, not a production Core Web Vitals or 10k load-test certification.

## User integration

| Item | Status |
| --- | --- |
| Per-template stylesheet | Implemented; each file contains only that template's variants |
| Copy stylesheet on details | Implemented; copies a versioned `<link>` for the HTML head |
| Copy selected classes | Implemented; includes `fg-gradient` and the current variation |
| Standalone Copy CSS | Retained on cards/details; asset CSS now uses an absolute versioned optimized image URL |
| Native gradient dependency | One stylesheet request, no gradient image request; direct Copy CSS needs no stylesheet request |
| Textured dependency | One stylesheet and only the currently applied variation's WebP |
| Class swap | Browser check loaded only the newly selected image; unused variants were not fetched |
| Fonts, JavaScript, animations and resets in integration CSS | None |
| Loading fallback | Each class supplies its palette's solid background colour |
| Version stability | Immutable files retained; new content gets a new versioned filename |

Current maximum template CSS is **3,419 bytes raw**, **660 bytes under a local gzip estimate**. Actual transfer compression depends on the deployed host. Maximum thumbnail is **2,396 bytes**; maximum optimized textured background is **90,554 bytes**. Quality budgets fail verification above 8 KiB / 16 KiB / 256 KiB respectively.

## Library browsing

| Item | Status |
| --- | --- |
| Global and collection pagination | 48 variations per page; filters apply to the full result set |
| Search, collection and colour filters | On-demand compact indices; 24 template results at a time |
| Accurate colour preview | Colour indices choose a matching variation, including the active design mode |
| Filter return navigation | Query, collection, colour and search page preserved in the URL |
| Thumbnail rendering | Pre-rendered WebP instead of repeated live SVG filter rendering |
| Playground first view | 24 templates, zero hidden variation cards |
| Playground template open | Fetches only the chosen template JSON; creates only its variation buttons |
| Playground back | Restores its browser page, query and scroll position |
| Playground cache | At most eight templates retained in memory |
| Native playground background | Uses the same native CSS as integration |
| Hero/detail loading | Sized previews; important detail image has high fetch priority |
| Main footer background | Loaded near the viewport, with a solid canvas fallback |
| Mobile and keyboard | Checked for horizontal overflow, drawer Escape/focus, tab controls and navigation |
| Content quality | Exact duplicate compositions / IDs rejected; visual review still needed for similarity |

Before this change, the built playground HTML was **407,149 bytes** and contained **740 hidden variation cards** and 100 templates. The measured build after on-demand conversion was **33,874 bytes**, with 24 templates and zero hidden variation cards: **92% less HTML**. Local gzip estimate changed from 23,391 to 6,251 bytes. Later small footer changes can alter the final byte counts slightly.

Browser checks covered new and existing templates, deep-linked selected colours, sidebar pagination/search/back, stylesheet/class/native/texture clipboard data, actual stylesheet and relative asset resolution, unused-variation network requests, colour/collection search, collection pagination and 390px mobile layout. Astro check had zero errors/warnings/hints; the complete static build passed.

## Pending deployment and 10k verification

- Permanent domain and production asset origin have not been configured. Tunnel URLs are temporary and development cross-site resource policy is different from production.
- CDN cache headers are prepared in `public/_headers`; actual edge caching, compression, cache hits and remote availability still need deployment verification.
- No 10k production benchmark or real-device mobile Core Web Vitals test has been performed. Browser tests used the current 100-template catalogue.
- The current build produced 837 HTML pages. With multiple assets and detail routes per variation, expanding the same static packaging to 10k templates will exceed Cloudflare Pages Free's 20,000-file limit and can exceed the paid 100,000-file limit. Before expansion, choose separate asset storage and fewer generated detail pages or on-demand routes. No paid infrastructure has been enabled.
- New batches need visual review; byte-level uniqueness does not prove every composition is perceptually distinct.

References: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Cloudflare header rules](https://developers.cloudflare.com/pages/configuration/headers/), [MDN immutable caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).
