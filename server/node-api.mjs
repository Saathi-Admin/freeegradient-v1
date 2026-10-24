import { createReviewStore } from './review-store.mjs';
import { reviewConfig } from './review-security.mjs';
import { createReviewHandler } from './review-service.mjs';

let instance;
async function handler() {
  return instance ??= createReviewStore({
    databaseUrl:process.env.DATABASE_URL,
    file:process.env.REVIEWS_DB_PATH || '.local/reviews.sqlite',
    production:!!process.env.VERCEL || process.env.NODE_ENV === 'production',
  }).then(store => createReviewHandler({ store, config:reviewConfig() })).catch(error => { instance=undefined; throw error; });
}
export async function handleNodeApi(req, res) {
  try {
    const host = req.headers.host;
    if (!host || !/^[a-z0-9.:[\]-]+$/i.test(host)) throw new Error('Invalid host');
    const protocol = req.headers['x-forwarded-proto']?.split(',')[0].trim() === 'https' || req.socket.encrypted ? 'https' : 'http';
    const origin = `${protocol}://${host}`;
    const url = new URL(req.url, origin);
    if (url.origin !== origin) throw new Error('Invalid URL');
    let body;
    if (!['GET','HEAD'].includes(req.method)) {
      if (Number(req.headers['content-length'] || 0) > 12288) {
        res.writeHead(413, {'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify({error:'The request is too large.'})); return;
      }
      if (req.body != null) body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      else {
        const chunks=[]; let size=0;
        for await (const chunk of req) { size+=chunk.length; if(size>12288) throw new Error('Body limit'); chunks.push(chunk); }
        body=Buffer.concat(chunks);
      }
      if(body.length>12288) throw new Error('Body limit');
    }
    const headers = new Headers();
    for (const [key,value] of Object.entries(req.headers)) if(value != null) headers.set(key,Array.isArray(value)?value.join(','):value);
    const request = new Request(url, { method:req.method, headers, ...(body?{body}:{}), });
    const ip = (req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown').trim();
    const result = await (await handler())(request,{ip});
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    if (!res.headersSent) res.writeHead(503, {'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify({error:'The review service is temporarily unavailable. Please try again later.'}));
  }
}
