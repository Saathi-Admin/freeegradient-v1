# FreeeGradients search and answer-engine plan

Research and implementation: 24 October 2026. Production origin configured in this repository: `https://freeegradients.com`.

## What success means

People should find a relevant FreeeGradients page when they need a gradient, then successfully preview, copy or export it. Search visibility, AI mentions, linked citations and actual visits are different measurements. No site change can force Google, ChatGPT, Claude, Gemini or Perplexity to list a site for every query. AI products can also answer without searching the web.

## Baseline and evidence

- Existing static Astro pages already had canonical URLs, metadata, a sitemap, crawlable pagination and consolidation of sibling colour variations into template URLs. Preserve that consolidation instead of indexing every palette as a separate near-duplicate page.
- Existing robots.txt permits all user agents. Adding separate Allow groups for every AI brand would not improve that permission. Hosting/CDN rules can still block crawlers independently.
- The content layer had three short guides and eight FAQ answers. Several FAQ details had become inaccurate: image exports are not limited to 1920 × 1080, detailed CSS uses optimized artwork, and SVG can contain raster content.
- The public URL could not be fetched with the research browser, and the local Windows DNS lookup returned “DNS name does not exist”. This is a launch issue to investigate, not proof of a worldwide outage or a measured ranking problem. A broad brand/domain search did not establish a reliable listing baseline.
- Search results for free gradient downloads included libraries and generators explaining commercial use, signup requirements, formats and workflows. These are useful intent signals, not keyword-volume measurements or a formal competitor ranking report.
- No Search Console, Bing Webmaster Tools, analytics or AI-product account data was available. No current rank, traffic uplift or cross-platform citation rate has been measured.

## Query and prompt map

The following 60 examples are hypotheses based on user tasks and the product's actual capabilities. They are not claimed autocomplete results, measured search volumes or an exhaustive list. Multiple questions belong on the same useful page; do not create one thin page for each wording.

| Intent | Example searches or AI prompts | Best destination |
| --- | --- | --- |
| Find a free library | “free gradient backgrounds”; “Where can I download gradients for free?”; “gradient backgrounds without signup”; “free gradient resources for designers”; “Recommend a library of downloadable gradient backgrounds” | `/`, `/gradients/`, homepage FAQ |
| Reuse in projects | “free gradients for commercial use”; “Can I use these gradients in a client website?”; “free backgrounds for app designs”; “gradient resources for client presentations”; “Are FreeeGradients downloads free for personal projects?” | Homepage FAQ, `/about/`; do not invent attribution, resale or ownership terms |
| Choose a visual style | “free mesh gradient backgrounds”; “grainy gradient download”; “aurora glow backgrounds”; “pastel gradient backgrounds”; “holographic gradient images” | `/collections/mesh/`, `/collections/vintage/`, `/collections/glow/`, `/collections/pastel/`, `/collections/holographic/`, style guide |
| Match colour and mode | “blue gradient background”; “purple pink gradient”; “dark mode gradient background”; “light pastel gradient”; “How do I find a gradient that matches my brand colours?” | All gradients and collection filters, palette values on details pages; no separate indexable filter permutations |
| Website implementation | “free CSS gradient backgrounds”; “How do I add a gradient in CSS?”; “gradient background without an image”; “reuse a gradient with a CSS class”; “How do I switch gradient colour variations?” | `/guides/use-css-gradients/`, gradient details |
| React and Tailwind | “free React gradient backgrounds”; “How do I add a mesh background in React?”; “Tailwind gradient background from a CSS class”; “download gradient JSX component”; “How do I use a textured gradient in my React app?” | `/guides/react-tailwind-gradient-backgrounds/`, actual React exporter |
| Hero and landing layouts | “free SaaS landing page backgrounds”; “gradient hero background for portfolio”; “subtle background behind a headline”; “preview gradients in a website layout”; “gradient footer background” | `/guides/landing-page-gradient-backgrounds/`, `/collections/landing/`, `/collections/footer/` |
| Decide a format | “gradient PNG download”; “free SVG gradient backgrounds”; “CSS versus SVG background”; “JPG or WebP for gradient images?”; “Are SVG gradients always editable vectors?” | `/guides/gradient-export-formats/`, details and exporter |
| High resolution and sizing | “free 4K gradient wallpaper”; “3840 × 2160 gradient background”; “custom size gradient PNG”; “phone gradient wallpaper”; “Instagram story gradient background” | `/guides/4k-gradient-backgrounds/`, presets and actual crop preview |
| Design tools and slides | “free gradients for Figma”; “gradient backgrounds for Canva”; “PowerPoint gradient background image”; “gradient for a Google Slides cover”; “Can I import a gradient PNG into my design frame?” | `/guides/gradients-for-figma-canva-presentations/`; describe image import, not native editing |
| Readability and selection | “How do I make text readable on a gradient?”; “mesh versus linear gradient”; “gradient text contrast”; “grain or smooth background for a card?”; “How do I choose a gradient for mobile layouts?” | `/guides/readable-text-on-gradients/`, `/guides/gradient-styles-explained/`, mesh and landing guides |
| Understand this product | “What is FreeeGradients?”; “Who created FreeeGradients?”; “Does FreeeGradients require an account?”; “What formats does FreeeGradients export?”; “Does FreeeGradients have light and dark palettes?” | `/about/`, homepage FAQ, visible creator credit |

Unsupported intent must not become a false promise: this is a library with preset palettes and exports, not an arbitrary-colour mesh editor, an animated/video exporter, an 8K image exporter, or a native Figma gradient plugin. No bulk ZIP, editor-import JSON, unverified CC0 license or unverified no-attribution claim has been added.

## Implemented

- Six new guides, bringing the total to nine: export formats, 4K/custom output, Figma/Canva/slides, React/Tailwind, landing pages and visual style comparison.
- Guide pages have a direct introductory answer, linked contents, descriptive headings, working integration patterns where useful, format/style comparison tables, three real catalogue examples, related links and visible author identity. All essential text and example links are in the static HTML.
- Distinct selection advice for all 25 collections on their primary all-mode pages, with relevant guide links. Pagination and filtered pages do not repeat this full editorial section.
- Updated homepage FAQ content, shared with FAQPage structured data. FAQ markup describes visible content; it does not promise a Google rich result or an AI citation.
- Organization identity connects Arclink Edge to the website. Gradient detail pages expose actual palette values, native/image implementation facts, visible usage information and ImageObject metadata for the selected artwork. Article pages use the article social type.
- A factual About page explains the creator, library, template/variation distinction, real export capabilities and source limitations. Counts come from the catalogue.
- Homepage help links, footer About link, guide-to-collection links and detail-to-guide links connect the content. Sitemap generation includes the new guide and About URLs automatically.
- Build verification checks visible FAQ/schema agreement, guide content in static HTML, internal links and image targets from guide pages, sitemap inclusion and artwork metadata, alongside the existing canonical/noindex checks.

## Launch actions, in order

1. Confirm ownership and DNS for `freeegradients.com`. Check the intended host's domain setup, apex records, `www` policy and HTTPS certificate. The local DNS failure must be resolved or explained before public discovery can be verified.
2. Deploy this build to the existing production host using its normal release process. This local implementation does not itself publish the changes. Keep preview deployments noindex and the permanent production origin indexable.
3. Check the public homepage, a collection, a guide and a template return HTTP 200 without login, bot challenges or `X-Robots-Tag: noindex`. Verify robots.txt, sitemap.xml and canonical URLs from the public origin. Confirm preferred-host redirects and image/CSS asset access.
4. Verify the domain in Google Search Console and Bing Webmaster Tools, submit the sitemap and inspect representative URLs. Request indexing for the homepage, About page and priority guides. Do not repeatedly submit every colour variation.
5. Inspect CDN/firewall logs for legitimate search and answer-engine fetches. Verify crawler identity against vendor documentation before changing firewall rules; a user-agent string alone is not sufficient. Wildcard robots permission does not override a CDN challenge.
6. Validate deployed structured data and check layout/readability on mobile and desktop. Measure deployed page performance; do not equate a local build with passing field Core Web Vitals.
7. Publish accurate product profiles and showcase examples through channels the owner chooses. Useful independent references can support discovery, but no external account posting or outreach has been performed as part of these code changes.

## Local validation results

- Astro check: 75 files, zero errors, warnings or hints.
- Library and SEO configuration verification: passed for 957 templates and 7,612 variations.
- Final Astro production rendering: 8,313 pages. Public artwork copied in the initial build was reused for the final rendering (`vite.build.emptyOutDir: false`, `vite.build.copyPublicDir: false`); no artwork source was changed. The normal deployment build configuration is unchanged.
- `scripts/verify-seo-build.mjs`: passed for 1,301 indexable canonical URLs, all template/sibling canonicals, excluded utility pages, structured data, visible answers and guide links/assets.
- Local browser review: About page, Mesh collection guidance and export-format guide. Phone-width guide had no page-wide horizontal overflow; the comparison table had its own horizontal scroll area and example images loaded. No console warnings/errors were observed on the reviewed collection page.
- These are local implementation checks, not a public crawl, external rich-result validation, measured ranking gain or deployed Core Web Vitals result.

## Measurement and next iteration

Establish the baseline after launch. Track Search Console impressions/clicks by query cluster and landing page, indexed canonical pages, referring domains and AI referral sessions where the referrer is available. Separately track meaningful actions such as successful image downloads, Copy CSS and React exports using an owner-approved analytics setup. Referrers can be missing, so AI referral traffic is not a complete citation count. No tracking service or external script was silently added.

For a repeatable manual visibility check, select 12 prompts from the map covering library, style, use case, format, implementation and brand questions. Test the same prompts across Google, ChatGPT, Claude, Gemini and Perplexity when the relevant web-search mode is available. Record date, locale, model/product, search mode, brand mention, exact cited URL and whether the landing page solves the task. A mention without a linked citation is a separate result. Repeat weekly during the initial launch period; a single response is not a stable ranking.

Revisit content using actual impressions and user needs. Colour or use-case landing pages should be added only if they offer a distinct curated selection and useful guidance. Avoid pages that merely swap a colour word or tool name. Preserve canonical consolidation unless evidence supports a genuinely different page.

## Primary references

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — existing SEO, accessible text, internal linking, visible-content/schema agreement, no special AI text file requirement, no guaranteed inclusion.
- [Google: optimizing for generative AI](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — useful original content and warnings against creating a page for every query variant.
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) — search crawler access and separate firewall considerations.
- [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — source already referenced in the readability guide.

These sources inform the approach; they do not confirm this site's indexing or future citations.
