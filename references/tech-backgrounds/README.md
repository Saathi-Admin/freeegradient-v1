# Tech background reference set

The user supplied four Pinterest screenshots and stopped the previous 240-colourway expansion. The active request is to create backgrounds following the compositions and colours visible in these screenshots and add them to the existing website.

The inventory in `src/data/tech-reference-manifest.json` covers 54 distinct interpretations after merging recurring examples (notably the violet crescent, cyan horizon and purple stacked glow). Partly visible background cards are included where their style is clear. Browser controls, captions, advertisements and website interface elements are excluded; backgrounds within interface references are interpreted as standalone art.

Each item receives one original PNG in its reference palette. No forced three-palette recolouring is applied. The built-in ImageGen tool is used with the relevant screenshot as a reference board, the item’s `region`, `composition`, `colors` and `mode` fields as its prompt specification, landscape 1536×1024, full bleed, no text/logos/UI/borders/watermarks. Sources are saved under `src/data/artwork/tech/` and public PNG downloads under `public/gradients/downloads/tech/`.

The collection is `/collections/tech-atmospheres/`. The website offers PNG, JPG and WebP for this image artwork. It does not offer CSS, HTML, React or JSON code exports for image-backed designs.

The user subsequently requested publishing all previously saved studio artwork without new generation. All 48 saved studio images across 18 designs are now included alongside the 54 Tech atmospheres images. No missing colourways are generated.
