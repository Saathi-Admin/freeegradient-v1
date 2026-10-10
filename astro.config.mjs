import { defineConfig } from 'astro/config';

// Preview builds stay unindexed until a permanent production origin is set.
const origin=process.env.PUBLIC_SITE_URL;
if(origin) {
  const siteUrl=new URL(origin);
  if(siteUrl.protocol!=='https:' || siteUrl.pathname!=='/' || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) throw new Error('PUBLIC_SITE_URL must be a permanent HTTPS origin, without paths or credentials.');
}
export default defineConfig({
  site: origin || undefined,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
