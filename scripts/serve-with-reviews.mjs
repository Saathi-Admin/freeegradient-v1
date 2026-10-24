import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { handleNodeApi } from '../server/node-api.mjs';

if(existsSync('.local/admin.env')) loadEnvFile('.local/admin.env');
const root=resolve('dist');
const port=Number(process.env.PORT || 2000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2','.otf':'font/otf','.ico':'image/x-icon','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')) { await handleNodeApi(req,res); return; }
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Cache-Control','no-store');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try {
    const decoded=decodeURIComponent(url.pathname);
    if(decoded.split(/[\\/]/).some(part=>part.startsWith('.'))) throw new Error();
    let file=resolve(root,'.'+decoded);
    if(file!==root && !file.startsWith(root+sep)) throw new Error();
    let info=await stat(file);
    if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}
    if(!info.isFile()) throw new Error();
    res.setHeader('Content-Type',mime[extname(file)] || 'application/octet-stream');
    res.setHeader('Accept-Ranges','bytes');
    let start=0,end=info.size-1;
    if(req.headers.range){
      const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
      start=Number(match[1]);end=match[2]?Number(match[2]):end;
      if(start>end || end>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
      res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Content-Length',end-start+1);
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Website and review API: http://127.0.0.1:${port}/ — Admin: /studio-vault-7k9m4x/`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
