import type { APIRoute } from 'astro';
import { gradients } from '../data/gradients';
import { collections } from '../data/collections';
import { gradientPageUrl, gradientResults, gradientPageSize } from '../data/gradient-pages';
import { guides } from '../data/guides';
export const GET: APIRoute = ({site}) => {
  const paths=['/','/collections/','/gradients/','/guides/',...guides.map(g=>`/guides/${g.slug}/`),...collections.map(c=>`/collections/${c.id}/`),...gradients.map(g=>`/gradients/${g.variations[0].id}/`)];
  for(const category of [undefined,...collections.map(c=>c.id)]) {
    const pages=Math.ceil(gradientResults('all',category).length/gradientPageSize);
    for(let page=2;page<=pages;page++) paths.push(gradientPageUrl('all',page,category));
  }
  const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site ? [...new Set(paths)].map(path=>`<url><loc>${escape(new URL(path,site).href)}</loc></url>`).join('') : ''}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
