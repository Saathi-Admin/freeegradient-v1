// Match palette colours to the rendered artwork once; resizing only lays out labels.
type Point = { x: number; y: number };
type Rect = Point & { width: number; height: number };
function oklab(r: number, g: number, b: number) {
  const linear = (n: number) => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; };
  [r,g,b] = [r,g,b].map(linear);
  const l = Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m = Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s = Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
const clamp = (n: number, min: number, max: number) => Math.max(min,Math.min(n,max));
const distance = (a: Point,b: Point) => (a.x-b.x)**2+(a.y-b.y)**2;
const overlap = (a: Rect,b: Rect) => Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));

document.querySelectorAll<HTMLElement>('[data-colour-map]').forEach(map=>{
  const image=map.querySelector<HTMLImageElement>('img')!;
  const items=[...map.querySelectorAll<HTMLElement>('[data-colour]')];
  const lines=map.querySelector<SVGSVGElement>('svg')!;
  let anchors: Point[] = [];
  function layout() {
    if(!anchors.length)return;
    const width=image.clientWidth,height=image.clientHeight,pad=8;
    const points=anchors.map(point=>({x:point.x*width,y:point.y*height}));
    const placed: Rect[]=[];
    lines.replaceChildren();
    items.forEach((item,i)=>{
      const pin=item.querySelector<HTMLElement>('.colour-map-pin')!;
      const chip=item.querySelector<HTMLButtonElement>('button')!;
      const point=points[i],w=chip.offsetWidth,h=chip.offsetHeight,gap=12;
      const edgeDistance=h+gap;
      const atEdge=point.x<edgeDistance||point.x>width-edgeDistance||point.y<edgeDistance||point.y>height-edgeDistance;
      // Keep edge chips beside their dot while preserving the connection.
      const offsets=atEdge?[[gap,-h/2],[-w-gap,-h/2]]:[[gap,-h-gap],[gap,gap],[-w-gap,-h-gap],[-w-gap,gap],[-w/2,-h-gap],[-w/2,gap]];
      // Include alternate label rows for tight screens; the pin always stays on its colour.
      const candidates=offsets.map(([x,y])=>({x:point.x+x,y:point.y+y}));
      if(!atEdge)for(let y=pad;y<=height-h-pad;y+=h+pad)for(let x=pad;x<=width-w-pad;x+=w+pad)candidates.push({x,y});
      const scored=candidates.map(candidate=>{
        const rect={x:clamp(candidate.x,pad,width-w-pad),y:clamp(candidate.y,pad,height-h-pad),width:w,height:h};
        const marginRect={x:rect.x-3,y:rect.y-3,width:w+6,height:h+6};
        const collisions=placed.reduce((sum,other)=>sum+overlap(marginRect,other),0);
        const obscured=points.reduce((sum,p)=>sum+(p.x>=rect.x-5&&p.x<=rect.x+w+5&&p.y>=rect.y-5&&p.y<=rect.y+h+5?1:0),0);
        return {rect,score:collisions*1000+obscured*100000+distance(point,{x:rect.x+w/2,y:rect.y+h/2})};
      }).sort((a,b)=>a.score-b.score);
      const rect=scored[0].rect;
      placed.push(rect);
      pin.style.left=`${point.x}px`;pin.style.top=`${point.y}px`;
      chip.style.left=`${rect.x}px`;chip.style.top=`${rect.y}px`;
      // Attach at a side midpoint, never at a corner or arbitrary edge position.
      const centre={x:rect.x+w/2,y:rect.y+h/2};
      const dx=(point.x-centre.x)/(w/2),dy=(point.y-centre.y)/(h/2);
      const attachment=Math.abs(dx)>Math.abs(dy)
        ? {x:dx<0?rect.x:rect.x+w,y:centre.y}
        : {x:centre.x,y:dy<0?rect.y:rect.y+h};
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',String(point.x));line.setAttribute('y1',String(point.y));
      line.setAttribute('x2',String(attachment.x));line.setAttribute('y2',String(attachment.y));
      lines.append(line);
    });
  }
  function sample() {
    try {
      if(!image.complete||!image.naturalWidth)return;
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=72;
      const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Canvas unavailable');
      context.drawImage(image,0,0,128,72);
      const pixels=context.getImageData(0,0,128,72).data;
      const samples: (Point & { lab: number[] })[]=[];
      for(let y=2;y<70;y+=2)for(let x=2;x<126;x+=2){
        const at=(y*128+x)*4;
        samples.push({x:(x+.5)/128,y:(y+.5)/72,lab:oklab(pixels[at],pixels[at+1],pixels[at+2])});
      }
      anchors=[];
      items.forEach(item=>{
        const rgb=item.dataset.colour!.slice(1).match(/../g)!.map(hex=>parseInt(hex,16));
        const target=oklab(rgb[0],rgb[1],rgb[2]);
        const candidates=samples.map(point=>({point,score:point.lab.reduce((sum,value,i)=>sum+(value-target[i])**2,0)+anchors.reduce((sum,anchor)=>sum+.004*Math.exp(-distance(point,anchor)/.01),0)}));
        candidates.sort((a,b)=>a.score-b.score);
        anchors.push({x:candidates[0].point.x,y:candidates[0].point.y});
      });
      delete map.dataset.unavailable;map.dataset.ready='';layout();
    } catch {
      map.dataset.unavailable='';map.dataset.ready='';
    }
  }
  new ResizeObserver(layout).observe(image);
  document.fonts.ready.then(layout);
  image.addEventListener('load',sample);
  sample();
});
