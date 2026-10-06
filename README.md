# FreeeGradients

Static Astro foundation for a fully free gradient library. Dark mode only; Host Grotesk and Instrument Serif are self-hosted through Fontsource. Button sizes are sm (32px), md (36px, default), lg (40px) and xl (44px), with border-box sizing. Pass `size="sm"`, `size="md"`, `size="lg"` or `size="xl"`; icon-only buttons stay square at every size. Typography and 16px icons stay consistent across sizes.

## Local development

Use Node 22.19+ (supported even-numbered releases). The bundled Codex Node runtime can also be used if the system Node is older.

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
```

`/` is the working library homepage; `/design-system/` is the component specimen. Both are intentionally noindex during development. No hosting accounts or paid services have been configured.

## Structure

- `src/styles/`: adapted tokens, typography, button styles and global reset. Change shared values in `tokens.css`; components use semantic aliases.
- `src/components/ui/`: reusable native Button component, with primary, secondary, outline, ghost and brand variants. Use real links for navigation; buttons for actions.
- Icons use `@lucide/astro` named imports and inline SVG. Icon-only buttons support primary and secondary variants at every size (default 36 × 36px); add an accessible label. Shared icon size is 16px with a 2px stroke.
- `src/layouts/`: dark HTML shell, metadata and local fonts.
- `src/pages/`: library homepage and design system preview.
- `src/types/gradient.ts`: template/variation metadata contract.
- `src/data/recipes.mjs`: 15 original procedural templates with 4 palettes each, inspired by the reference styles. Stable named IDs.
- `scripts/build-gradients.mjs`: prepares 60 SVG assets, typed catalogue input, reusable CSS variables/classes and a complete downloadable ZIP. Runs before development/build; run `npm run assets` after changing recipes.
- `src/scripts/library.ts`: search, light/dark filtering, palette switching, preview dialog, clipboard and browser PNG/JPEG export.
- `images/`: all 31 supplied reference images, preserved unchanged and excluded from the published build. These are not yet library downloads.
- `references/design-system/`: untouched original CSS supplied by the user.
- `public/`: assets deliberately included in the site, plus Cloudflare Pages cache/security headers.

Inherited blue accent (#0056ec) is provisional. The original 2px spacing scale, heading weight cap of 500, full pill button radius and dark neutral surfaces are preserved; typography sizes have been refined for the library. Next.js font variables are now defined locally; Tailwind-only `@theme` aliases and unrelated light mega-menu/service tokens were removed. Existing dark primary/secondary colour variants are retained; border reset, exact heights, focus, disabled and reduced-motion states are added.

## Budget and publishing

Typography uses only Regular (400) and Medium (500). Host Grotesk headings use Medium; body copy and Instrument Serif use Regular. Native headings and emphasis follow the same weight policy. H1 scales 36–64px, H2 28–40px, H3 24–32px, H4 20–24px, H5 18px and H6 16px. Large body scales 16–18px; normal body is 16px/24px, small is 14px/20px, captions are 12px/16px. Button/nav typography stays 14px/20px at Medium. Instrument Serif is a selective heading accent, inheriting its heading size.

Keep the deployment static on Cloudflare Pages Free. No paid image APIs, R2, database or server functions are required. Asset preparation runs locally. Audit built file count and per-file size before publishing (currently Pages Free supports 20,000 files and 25 MiB per asset).

Choose the domain before adding Astro's `site`, canonical URLs, sitemap and public indexing. Dedicated indexable template pages, expanded artwork, managed content and monetization remain future work. The current variation engine uses procedural SVG/CSS; it does not recolour arbitrary uploaded bitmap references.

## Layout and exports

The floating header uses 32px navigation/action sizing. Card actions use 40px icon buttons over the image, with 8px bottom/right inset and 8px gaps. They appear on image hover or keyboard focus; touch devices show them directly. Names appear on hover/focus. The hero uses content height rather than a full-viewport spacer.

Sections use shared vertical padding (32–56px per side), so adjacent section spacing equals the preceding bottom padding plus the next top padding (64–112px). Section heading/content spacing, grid gap, hero clearance and card padding are tokens; there is no separate margin between sections.

Each card can copy CSS, download native SVG, or export PNG/JPEG at 1920 × 1080 locally in the browser. Smooth/mesh/glow templates use native CSS; grain/wave templates use an SVG background URL. Copied asset-based CSS explains where to put the downloaded SVG. The library ZIP includes all relative assets and usage instructions. Both light and dark palettes are available while the site stays dark.



