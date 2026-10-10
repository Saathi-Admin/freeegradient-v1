export const guides = [
 {slug:'use-css-gradients',title:'How to add a gradient background in CSS',description:'Copy a standalone CSS gradient or link one template stylesheet and swap its classes.',collection:'smooth',sections:[
  ['Copy a background','Open a gradient and select Copy CSS. Paste the declarations into the CSS rule for your element. Native gradients are drawn by the browser; textured designs reference one image. Give the element its own height or padding so the background has space to appear.'],
  ['Use a reusable template','Copy stylesheet link from the details page and add it inside your HTML head. Copy class adds two classes: fg-gradient and the selected variation class. Keep the same stylesheet when switching variations within that template. A different template needs its own stylesheet link.'],
  ['Keep the page lightweight','Load only the templates you use. The template stylesheet contains no fonts, scripts, animations or layout resets. Check your own page on a slow connection, especially when using textured image backgrounds.']
 ]},
 {slug:'mesh-gradient-backgrounds',title:'How to choose a mesh gradient background',description:'Choose soft colour fields for landing pages and cards, then preview them with your own content.',collection:'mesh',sections:[
  ['What is a mesh gradient?','A mesh-style background blends multiple colour fields rather than moving along one straight line. Our CSS mesh designs layer radial gradients to create soft overlaps.'],
  ['Choose a background for your layout','Large calm areas work well behind headings. Strong highlights work well in illustrations and empty card areas. Open the playground to compare a landing page, cards, a page background and a footer.'],
  ['Use it in CSS or a design file','Copy CSS to use a browser-rendered design on your website. Download SVG for scalable artwork, or PNG and JPEG for a raster image. Keep informative content as real text rather than baking it into the gradient image.']
 ]},
 {slug:'readable-text-on-gradients',title:'How to keep text readable on a gradient',description:'Check the colours directly behind your text and keep controls readable across the whole background.',collection:'landing',sections:[
  ['Check the area behind the text','A gradient has different colours in different positions. A readable heading at one point can become difficult to read when the page resizes. Test desktop and mobile layouts with the actual text placement.'],
  ['Add a calm surface when needed','Place longer text inside a solid or lightly translucent card, or add a dark or light overlay to the background. Use the light and dark variations as starting points, then check the final combination.'],
  ['Measure the final contrast','WCAG requires at least 4.5:1 for normal text and 3:1 for large text at level AA, subject to its exceptions. Measure against the background immediately behind each text region; a light or dark label alone does not guarantee accessible contrast.']
 ],source:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'}
] as const;
