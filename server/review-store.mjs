import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import existingColumns from '../src/data/testimonials.json' with { type: 'json' };

const schema = [
  `CREATE TABLE IF NOT EXISTS fg_reviews (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, author_role TEXT NOT NULL,
    website TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),
    created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL, approved_at BIGINT,
    version INTEGER NOT NULL DEFAULT 1, fingerprint TEXT NOT NULL UNIQUE
  )`,
  'CREATE INDEX IF NOT EXISTS fg_reviews_status_created ON fg_reviews(status,created_at)',
  `CREATE TABLE IF NOT EXISTS fg_admin_sessions (
    token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at BIGINT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS fg_rate_limits (
    key TEXT PRIMARY KEY, window_start BIGINT NOT NULL, hits INTEGER NOT NULL
  )`,
];

export async function createReviewStore({ databaseUrl, file = '.local/reviews.sqlite', production = false, includeExisting = true } = {}) {
  let query, close = () => {};
  if (databaseUrl) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(databaseUrl);
    query = (text, values = []) => sql.query(text, values);
  } else {
    if (production) throw new Error('DATABASE_URL is required for durable production storage.');
    const path = resolve(file);
    await mkdir(dirname(path), { recursive: true });
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(path);
    db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    query = async (text, values = []) => {
      const bindings = [];
      const sqlite = text.replace(/\$(\d+)/g, (_, number) => { bindings.push(values[Number(number) - 1]); return '?'; });
      const statement = db.prepare(sqlite);
      return statement.columns().length ? statement.all(...bindings) : (statement.run(...bindings), []);
    };
    close = () => db.close();
  }
  for (const statement of schema) await query(statement);
  const additions = {
    visibility: "TEXT NOT NULL DEFAULT 'visible' CHECK(visibility IN ('visible','hidden','removed'))",
    source: "TEXT NOT NULL DEFAULT 'community'",
    tone: "TEXT NOT NULL DEFAULT 'neutral'",
    sort_order: 'INTEGER NOT NULL DEFAULT 999',
  };
  const columns = databaseUrl
    ? (await query("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='fg_reviews'")).map(row=>row.column_name)
    : (await query('PRAGMA table_info(fg_reviews)')).map(row=>row.name);
  for (const [name,type] of Object.entries(additions)) if (!columns.includes(name)) {
    await query(`ALTER TABLE fg_reviews ADD COLUMN ${databaseUrl?'IF NOT EXISTS ':''}${name} ${type}`);
  }
  if(includeExisting) for(let column=0;column<existingColumns.length;column++) for(let index=0;index<existingColumns[column].length;index++) {
    const card=existingColumns[column][index];
    const hash=createHash('sha256').update(`existing-testimonial:${card.text}`).digest('hex').slice(0,32);
    const id=`${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`;
    await query(`INSERT INTO fg_reviews(id,name,email,author_role,website,rating,review,status,created_at,updated_at,approved_at,version,fingerprint,source,tone,sort_order)
      VALUES($1,$2,'',$3,'',5,$4,'approved',0,0,0,1,$5,'existing',$6,$7) ON CONFLICT(id) DO NOTHING`,
      [id,card.role,card.tag,card.text,`existing:${id}`,card.tone,index*3+column]);
  }
  return { query, close };
}
