export function pageSeo({site,path,production,noindex=false,preview=false}:{site?:URL;path:string;production:boolean;noindex?:boolean;preview?:boolean}) {
  const url=site ? new URL(path,site) : undefined;
  if(url) { url.search=''; url.hash=''; }
  return {canonical:url?.href,blockIndex:!production || !site || noindex || preview};
}
