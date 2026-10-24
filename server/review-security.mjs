import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt:32768:8:1:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const parts = encoded.split(':');
  if (parts.length !== 6 || parts.slice(0,4).join(':') !== 'scrypt:32768:8:1' || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) return false;
  const hash = await derive(password, parts[4], 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(hash, Buffer.from(parts[5], 'hex'));
}
export const digest = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');
export function reviewConfig() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    secret: process.env.ADMIN_SESSION_SECRET || '',
  };
}
