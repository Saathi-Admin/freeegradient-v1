import { randomBytes } from 'node:crypto';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hashPassword } from '../server/review-security.mjs';

const directory=resolve('.local');
const envPath=resolve(directory,'admin.env');
const credentialsPath=resolve(directory,'admin-login.txt');
let exists=false;
try { await access(envPath); exists=true; } catch {}
if(exists && !process.argv.includes('--rotate')) {
  console.log('Existing admin configuration preserved. Login details: '+credentialsPath);
} else {
  await mkdir(directory,{recursive:true});
  const password=randomBytes(24).toString('base64url');
  const hash=await hashPassword(password);
  await writeFile(envPath,`ADMIN_USERNAME=admin\nADMIN_PASSWORD_HASH=${hash}\nADMIN_SESSION_SECRET=${randomBytes(48).toString('hex')}\n`,{mode:0o600});
  await writeFile(credentialsPath,`FreeeGradients local admin\n\nUsername: admin\nPassword: ${password}\n\nKeep this file private. It is excluded from Git and is never served by the website.\nProduction needs the environment values from admin.env, plus DATABASE_URL.\n`,{mode:0o600});
  console.log('Admin configured. Private login details: '+credentialsPath);
}
