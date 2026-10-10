export function pageSeo({site,path,production,noindex=false}:{site?:URL;path:string;production:boolean;noindex?:boolean}) {
  return {canonical:site ? new URL(path,site).href : undefined,blockIndex:!production || !site || noindex};
}
