import { randomBytes, randomUUID } from 'node:crypto';
import { digest, verifyPassword } from './review-security.mjs';

const HOUR = 3600000;
const SESSION_AGE = 8 * HOUR;
const statuses = ['pending','approved','rejected','hidden','removed'];
const effectiveStatus = "CASE WHEN visibility='visible' THEN status ELSE visibility END";
const publicColumns = 'id,name,author_role,website,rating,review,approved_at,tone';
const adminColumns = `id,name,email,author_role,website,rating,review,${effectiveStatus} AS status,status AS moderation_status,visibility,source,tone,created_at,updated_at,version`;
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
function fail(status, message) { throw new ApiError(status, message); }
function text(value, label, max, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') fail(400, `Enter a valid ${label}.`);
  const clean = value.trim();
  if ((required && !clean) || clean.length > max || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(clean)) fail(400, `Enter a valid ${label} (up to ${max} characters).`);
  return clean;
}
function normalizeReview(data) {
  const name = text(data.name, 'name', 80, true);
  const email = text(data.email, 'email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Enter a valid email address.');
  const role = text(data.role, 'role or company', 100);
  const website = text(data.website, 'website URL', 300);
  if (website) {
    let url;
    try { url = new URL(website); } catch { fail(400, 'Enter a full website URL beginning with https:// or http://.'); }
    if (!['https:','http:'].includes(url.protocol) || url.username || url.password) fail(400, 'Enter a website URL beginning with https:// or http://.');
  }
  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail(400, 'Choose a rating from 1 to 5 stars.');
  return { name, email, role, website, rating, review: text(data.review, 'review', 500, true) };
}
const response = (status, data, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...extra },
});

export function createReviewHandler({ store, config, now = Date.now }) {
  const query = store.query;
  const cookieName = request => new URL(request.url).protocol === 'https:' ? '__Host-fg-admin' : 'fg-admin';
  const cookie = (request, token, age) => `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
  function configured() {
    if (!config.username || !config.passwordHash || config.secret.length < 32) fail(503, 'Review administration is not configured yet.');
  }
  async function limit(key, maximum, duration) {
    const time = now();
    const rows = await query(`INSERT INTO fg_rate_limits(key,window_start,hits) VALUES($1,$2,1)
      ON CONFLICT(key) DO UPDATE SET
        window_start=CASE WHEN fg_rate_limits.window_start <= $3 THEN $2 ELSE fg_rate_limits.window_start END,
        hits=CASE WHEN fg_rate_limits.window_start <= $3 THEN 1 ELSE fg_rate_limits.hits+1 END RETURNING hits`, [key,time,time-duration]);
    if (Number(rows[0].hits) > maximum) fail(429, 'Too many attempts. Please try again later.');
  }
  async function session(request) {
    const part = (request.headers.get('cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName(request)}=`));
    const token = part?.slice(part.indexOf('=') + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) fail(401, 'Please sign in.');
    const tokenHash = digest(token, config.secret);
    const rows = await query('SELECT username FROM fg_admin_sessions WHERE token_hash=$1 AND expires_at>$2', [tokenHash,now()]);
    if (!rows.length || rows[0].username !== config.username) fail(401, 'Your session has expired. Please sign in.');
    return { username: rows[0].username, tokenHash };
  }
  async function body(request) {
    if (request.headers.get('origin') !== new URL(request.url).origin) fail(403, 'This request must come from this website.');
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) fail(415, 'Use a JSON request.');
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 12288) fail(413, 'The request is too large.');
    try { const value = JSON.parse(raw); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(); return value; }
    catch { fail(400, 'Enter valid form data.'); }
  }
  return async function handle(request, { ip = 'unknown' } = {}) {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/$/, '');
      const method = request.method;
      const client = digest(ip, config.secret || 'unconfigured');
      if (path === '/api/reviews' && method === 'GET') {
        const reviews = await query(`SELECT ${publicColumns} FROM fg_reviews WHERE status='approved' AND visibility='visible' ORDER BY approved_at DESC,sort_order,id DESC LIMIT 100`);
        return response(200, { reviews });
      }
      if (path === '/api/reviews' && method === 'POST') {
        configured();
        const data = await body(request);
        await limit(`submit:${client}`, 5, HOUR);
        if (data.company_url) return response(202, { status:'pending' });
        const review = normalizeReview(data);
        const time = now();
        const fingerprint = digest(`${review.email}\n${review.review}\n${Math.floor(time / (24 * HOUR))}`, config.secret);
        const rows = await query(`INSERT INTO fg_reviews(id,name,email,author_role,website,rating,review,status,created_at,updated_at,approved_at,version,fingerprint)
          VALUES($1,$2,$3,$4,$5,$6,$7,'pending',$8,$8,NULL,1,$9) ON CONFLICT(fingerprint) DO NOTHING RETURNING id`,
          [randomUUID(),review.name,review.email,review.role,review.website,review.rating,review.review,time,fingerprint]);
        if (!rows.length) fail(409, 'This review has already been received.');
        await query('DELETE FROM fg_rate_limits WHERE window_start<$1', [time-48*HOUR]);
        return response(202, { status:'pending' });
      }
      if (path === '/api/admin/login' && method === 'POST') {
        configured();
        const data = await body(request);
        await limit(`login:${client}`, 10, 15 * 60000);
        const username = text(data.username, 'username', 80, true);
        const password = text(data.password, 'password', 1024, true);
        const valid = await verifyPassword(password, config.passwordHash);
        if (!valid || username !== config.username) fail(401, 'Incorrect username or password.');
        const token = randomBytes(32).toString('hex');
        await query('DELETE FROM fg_admin_sessions WHERE expires_at<=$1', [now()]);
        await query('INSERT INTO fg_admin_sessions(token_hash,username,expires_at) VALUES($1,$2,$3)', [digest(token,config.secret),username,now()+SESSION_AGE]);
        return response(200, { username }, { 'Set-Cookie':cookie(request,token,SESSION_AGE/1000) });
      }
      if (!path.startsWith('/api/admin/')) return response(404, { error:'Not found.' });
      configured();
      const admin = await session(request);
      if (path === '/api/admin/session' && method === 'GET') return response(200, { username:admin.username });
      if (path === '/api/admin/logout' && method === 'POST') {
        await body(request);
        await query('DELETE FROM fg_admin_sessions WHERE token_hash=$1', [admin.tokenHash]);
        return response(200, { ok:true }, { 'Set-Cookie':cookie(request,'',0) });
      }
      if (path === '/api/admin/reviews' && method === 'GET') {
        const status = url.searchParams.get('status') || 'all';
        if (status !== 'all' && !statuses.includes(status)) fail(400, 'Choose a valid review status.');
        const search = text(url.searchParams.get('search') || '', 'search', 100).toLowerCase();
        const page = Number(url.searchParams.get('page') || 1);
        if (!Number.isInteger(page) || page < 1 || page > 10000) fail(400, 'Choose a valid page.');
        const values = [], clauses = [];
        if (status !== 'all') { values.push(status); clauses.push(`(${effectiveStatus})=$${values.length}`); }
        if (search) { values.push(`%${search}%`); const parameter=`$${values.length}`; clauses.push(`(LOWER(name) LIKE ${parameter} OR LOWER(email) LIKE ${parameter} OR LOWER(review) LIKE ${parameter})`); }
        const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
        const count = await query(`SELECT COUNT(*) AS total FROM fg_reviews${where}`, values);
        const rows = await query(`SELECT ${adminColumns} FROM fg_reviews${where} ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET $${values.length+1}`, [...values,(page-1)*25]);
        const counts = { pending:0, approved:0, rejected:0, hidden:0, removed:0 };
        for (const row of await query(`SELECT ${effectiveStatus} AS state,COUNT(*) AS total FROM fg_reviews GROUP BY ${effectiveStatus}`)) counts[row.state] = Number(row.total);
        return response(200, { reviews:rows, counts, total:Number(count[0].total), page, pageSize:25 });
      }
      if (path === '/api/admin/moderate' && method === 'POST') {
        const data = await body(request);
        if (typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/.test(data.id) || !Number.isInteger(data.version) || data.version < 1) fail(400, 'Choose a valid review.');
        if (!['approve','reject','unpublish','hide','unhide','remove','restore'].includes(data.action)) fail(400, 'Choose a valid moderation action.');
        const existing = await query(`SELECT ${adminColumns} FROM fg_reviews WHERE id=$1`, [data.id]);
        if (!existing.length) fail(404, 'This review was not found.');
        const current=existing[0];
        const visibilityAction=['hide','unhide','remove','restore'].includes(data.action);
        const allowed = data.action==='hide' ? current.visibility==='visible' && current.moderation_status==='approved'
          : data.action==='unhide' ? current.visibility==='hidden'
          : data.action==='remove' ? current.visibility!=='removed'
          : data.action==='restore' ? current.visibility==='removed'
          : current.visibility==='visible';
        const target=visibilityAction?current.moderation_status:{approve:'approved',reject:'rejected',unpublish:'pending'}[data.action];
        const visibility=visibilityAction?{hide:'hidden',unhide:'visible',remove:'removed',restore:'visible'}[data.action]:current.visibility;
        if (Number(current.version) !== data.version || !allowed || (!visibilityAction && current.status===target) || (data.action==='unpublish' && current.status!=='approved')) fail(409, 'This review has changed. Refresh and try again.');
        const time = now();
        const rows = await query(`UPDATE fg_reviews SET status=$1,updated_at=$2,approved_at=CASE WHEN status<>$1 AND $1='approved' THEN $2 WHEN $1<>'approved' THEN NULL ELSE approved_at END,visibility=$3,version=version+1
          WHERE id=$4 AND version=$5 RETURNING ${adminColumns}`, [target,time,visibility,data.id,data.version]);
        if (!rows.length) fail(409, 'This review has changed. Refresh and try again.');
        return response(200, { review:rows[0] });
      }
      return response(405, { error:'This method is not available.' });
    } catch (error) {
      if (error instanceof ApiError) return response(error.status, { error:error.message }, error.status===429?{'Retry-After':'900'}:{});
      // Never expose database errors, connection strings, cookies or submitted personal data.
      return response(503, { error:'The review service is temporarily unavailable. Please try again later.' });
    }
  };
}
