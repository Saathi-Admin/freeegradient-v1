import { defineConfig } from 'astro/config';

// Domain and canonical URLs will be configured when the domain is chosen.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
