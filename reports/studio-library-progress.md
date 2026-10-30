# Studio library — saved artwork included

The user stopped the 80-composition / 240-colourway expansion and replaced it with the four supplied Pinterest screenshot references. The active completed asset set is the 54-image Tech atmospheres collection described in `references/tech-backgrounds/README.md`.

The full design inventory is in `src/data/studio-manifest.json`: 65 reference-inspired styles plus 15 additional originals. The collection uses original compositions rather than downloaded competitor assets.

The original artwork was generated with built-in ImageGen and is saved in `src/data/artwork/studio/`. On 30 October 2026, the user explicitly requested adding all previously saved images without generating anything new. `studio-recipes.mjs` now includes every existing image file, including the three designs that have only one saved colourway. Original colourway IDs are preserved.

Prompt specification: original full-bleed abstract landscape background, 1536×1024, no text, objects, logos, watermarks, frames or collages. Match each manifest design's named effect (blur, fluid satin, optical glass, fractal, fine grain, light leak or mesh). Generate each colourway separately: 01 dark navy/cobalt/cyan/violet; 02 bright pearl/peach/powder lavender; 03 dark emerald/amber/teal. Save as `{slug}-{01|02|03}.png`.

The original Glass Flow sample is retained at `public/gradients/image-collections/glass-flow/cyan-violet-coral.png`.

All 48 saved images across 18 designs are included in the recipe catalogue: the original 12 plus 36 additional saved images. They appear in their existing style collections and can be found by searching `studio`. Original PNG downloads are available under `public/gradients/downloads/studio/`. No source artwork was newly generated or recoloured for this integration. Do not resume the old generation queue without a new user request.
