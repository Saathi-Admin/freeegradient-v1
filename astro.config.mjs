import { defineConfig } from 'astro/config';

// Canonicals always use the permanent public domain, including Vercel previews.
const origin=process.env.PUBLIC_SITE_URL || 'https://freeegradients.com';
if(origin) {
  const siteUrl=new URL(origin);
  if(siteUrl.protocol!=='https:' || siteUrl.pathname!=='/' || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) throw new Error('PUBLIC_SITE_URL must be a permanent HTTPS origin, without paths or credentials.');
}
export default defineConfig({
  site: origin || undefined,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { define: { 'import.meta.env.SEO_PREVIEW': JSON.stringify(process.env.VERCEL_ENV === 'preview' || process.env.PUBLIC_NOINDEX === 'true') } },
});
