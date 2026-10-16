import type { GradientTemplate, GradientVariation } from '../types/gradient';

type Format = 'png' | 'jpeg' | 'svg' | 'webp' | 'html' | 'css' | 'react' | 'json';
const images: Format[] = ['png','jpeg','svg','webp'];
const names: Record<Format,string> = {png:'PNG',jpeg:'JPG',svg:'SVG',webp:'WebP',html:'HTML',css:'CSS',react:'React',json:'JSON'};
const types: Record<Format,string> = {png:'image/png',jpeg:'image/jpeg',svg:'image/svg+xml',webp:'image/webp',html:'text/html',css:'text/css',react:'text/javascript',json:'application/json'};
const extensions: Record<Format,string> = {png:'png',jpeg:'jpg',svg:'svg',webp:'webp',html:'html',css:'css',react:'jsx',json:'json'};
let initialized = false;
let open: ((template: GradientTemplate, variation: GradientVariation) => void) | undefined;

export function openGradientExport(template: GradientTemplate, variation: GradientVariation) {
  if (!initialized) initialize();
  open?.(template, variation);
}

function initialize() {
  const found = document.querySelector<HTMLDialogElement>('.export-modal');
  if (!found) return;
  const modal = found;
  initialized = true;
  const el = <T extends HTMLElement = HTMLElement>(selector: string) => modal.querySelector<T>(selector)!;
  const widthInput = el<HTMLInputElement>('#export-width'), heightInput = el<HTMLInputElement>('#export-height');
  const quality = el<HTMLInputElement>('#export-quality');
  const downloadButton = el<HTMLButtonElement>('[data-export-download]'), copyButton = el<HTMLButtonElement>('[data-export-copy]');
  const status = el('#export-status');
  const image = el<HTMLImageElement>('#export-image');
  const code = el<HTMLTextAreaElement>('#export-code');
  let template: GradientTemplate, variation: GradientVariation;
  let format: Format = 'png', kind = 'image', width = 1920, height = 1080;
  let busy = false, preparing = false, revision = 0, source: Promise<string> | undefined;
  let trigger: HTMLElement | null, priorOverflow = '';
  const svgSource = () => source ??= fetch(variation.src).then(response => {
    if (!response.ok) throw new Error('Gradient artwork could not be loaded. Please try again.');
    return response.text();
  }).catch(error => { source = undefined; throw error; });
  const cssValue = () => variation.cssKind === 'native' ? variation.css : `url("${new URL(variation.backgroundSrc ?? variation.src, location.origin).href}")`;
  const cssText = () => `.fg-${variation.id} {\n  background-color: ${variation.colors[0]};\n  background-image: ${cssValue()};\n  background-size: cover;\n  background-position: center;\n}`;
  const validSize = () => widthInput.validity.valid && heightInput.validity.valid;
  const syncButtons = () => {
    const disabled = busy || preparing || (kind === 'image' && !validSize());
    downloadButton.disabled = disabled; copyButton.disabled = disabled;
  };
  function updatePreview() {
    const ratio = width / height;
    // Fit the same centred cover crop inside the preview stage.
    const stage = el('.export-preview-stage');
    const style = getComputedStyle(stage);
    const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const displayWidth = Math.min(availableWidth, availableHeight * ratio);
    image.style.width = `${displayWidth}px`;
    image.style.height = `${displayWidth / ratio}px`;
  }
  async function codeText() {
    if (format === 'css') return cssText();
    if (format === 'json') return JSON.stringify({schemaVersion:1,name:template.name,template:template.slug,variation:variation.id,palette:variation.name,mode:variation.mode,colors:variation.colors,css:cssText(),svg:new URL(variation.src,location.origin).href,stylesheet:new URL(template.stylesheet,location.origin).href},null,2);
    const svg = await svgSource();
    if (format === 'html') {
      const title = `${template.name} — ${variation.name}`.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
      const artwork = svg.replace('<svg ', '<svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="xMidYMid slice" ');
      return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<style>html,body{margin:0;min-height:100%;background:${variation.colors[0]}}.gradient{position:fixed;inset:0;overflow:hidden}</style>\n</head>\n<body><div class="gradient">${artwork}</div></body>\n</html>`;
    }
    const value = variation.cssKind === 'native' ? variation.css : `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    return `export default function GradientBackground({ style, ...props }) {\n  return (\n    <div\n      {...props}\n      style={{\n        minHeight: '100vh',\n        backgroundColor: ${JSON.stringify(variation.colors[0])},\n        backgroundImage: ${JSON.stringify(value)},\n        backgroundSize: 'cover',\n        backgroundPosition: 'center',\n        ...style,\n      }}\n    />\n  );\n}\n`;
  }
  async function render() {
    const current = ++revision;
    el('#export-image-settings').hidden = kind !== 'image';
    el('#export-code-settings').hidden = kind !== 'code';
    el('#export-quality-field').hidden = !['jpeg','webp'].includes(format);
    modal!.querySelectorAll<HTMLElement>('[data-export-format]').forEach(button => {
      const selected = button.dataset.exportFormat === format;
      button.setAttribute('aria-selected',String(selected)); button.tabIndex = selected ? 0 : -1;
      button.id = `export-format-${button.dataset.exportFormat}`;
    });
    el('#export-format-panel').setAttribute('aria-labelledby',`export-format-${format}`);
    downloadButton.querySelector('span')!.textContent = `Download ${names[format]}`;
    copyButton.querySelector('span')!.textContent = kind === 'code' ? `Copy ${names[format]}` : format === 'svg' ? 'Copy SVG' : 'Copy image';
    copyButton.hidden = ['jpeg','webp'].includes(format);
    updatePreview();
    status.textContent = '';
    preparing = kind === 'code'; syncButtons();
    if (kind === 'code') {
      code.value = 'Preparing export…';
      el('#export-code-note').textContent = {html:'Self-contained HTML page with the artwork embedded. Responsive, with no external assets.',css:variation.cssKind==='native'?'Native CSS for this exact gradient.':'CSS uses this variation’s optimized background image URL. Keep that image available when using the code.',react:'A responsive React component. Artwork is embedded where needed; no extra packages.',json:'Palette, template and integration metadata. Asset URLs refer to the current website.'}[format as 'html'|'css'|'react'|'json'];
      try { const value = await codeText(); if (current === revision) code.value = value; }
      catch(error) { if(current === revision) { code.value=''; status.textContent = (error as Error).message; } }
      finally { if(current === revision) { preparing=false; syncButtons(); if(!code.value) {downloadButton.disabled=true;copyButton.disabled=true;} } }
    }
  }
  function choose(button: HTMLElement, selector: string) {
    const attribute = selector === '[data-export-size]' ? 'aria-pressed' : 'aria-selected';
    modal!.querySelectorAll<HTMLElement>(selector).forEach(item => {
      item.setAttribute(attribute,String(item===button));
      if(attribute==='aria-selected') item.tabIndex=item===button?0:-1;
    });
  }
  modal.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLElement>('button');
    if(!button || busy) return;
    if(button.hasAttribute('data-export-close')) {modal.close();return;}
    if(button.dataset.exportFormat) {
      format=button.dataset.exportFormat as Format;
      kind=images.includes(format)?'image':'code';
      void render();
    }
    else if(button.dataset.exportSize) {
      choose(button,'[data-export-size]');
      el('#export-custom').hidden=button.dataset.exportSize!=='custom';
      if(button.dataset.width) {widthInput.value=button.dataset.width; heightInput.value=button.dataset.height!;}
      sizeChanged();
    }
  });
  // Roving focus follows the shared TabBar's selected tab, including keyboard use.
  modal.querySelectorAll<HTMLElement>('[role=tablist]').forEach(bar => bar.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const tabs=[...bar.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    const index=tabs.indexOf(document.activeElement as HTMLButtonElement);
    if(index<0) return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].focus();tabs[next].click();
  }));
  function sizeChanged() {
    if(validSize()) {width=Number(widthInput.value);height=Number(heightInput.value);status.textContent='';updatePreview();}
    else status.textContent='Enter a whole number from 64 to 4096 for each dimension.';
    syncButtons();
  }
  widthInput.addEventListener('input',sizeChanged); heightInput.addEventListener('input',sizeChanged);
  quality.addEventListener('input',()=>el('#export-quality-value').textContent=`${quality.value}%`);
  new ResizeObserver(()=>{if(modal.open) updatePreview();}).observe(el('.export-preview-stage'));
  function download(blob: Blob) {
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`${variation.id}.${extensions[format]}`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function artwork() {
    const documentSvg=new DOMParser().parseFromString(await svgSource(),'image/svg+xml');
    if(documentSvg.querySelector('parsererror')) throw new Error('Could not read gradient artwork.');
    const root=documentSvg.documentElement;
    root.setAttribute('width',String(width));root.setAttribute('height',String(height));
    root.setAttribute('preserveAspectRatio','xMidYMid slice');
    return new XMLSerializer().serializeToString(root);
  }
  async function raster(mime: string) {
    const url=URL.createObjectURL(new Blob([await artwork()],{type:'image/svg+xml'}));
    try {
      const bitmap=new Image(); bitmap.src=url; await bitmap.decode();
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const context=canvas.getContext('2d');if(!context) throw new Error('Image export unavailable.');
      context.fillStyle=variation.colors[0];context.fillRect(0,0,width,height);context.drawImage(bitmap,0,0,width,height);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('Could not create image.')),mime,Number(quality.value)/100));
      if(blob.type!==mime) throw new Error('This browser does not support that image format. Please choose PNG.');
      return blob;
    } finally {URL.revokeObjectURL(url);}
  }
  async function run(copy: boolean) {
    if(busy||preparing||(kind==='image'&&!validSize())) return;
    busy=true;syncButtons();modal.setAttribute('aria-busy','true');status.textContent=copy?'Preparing clipboard…':'Preparing download…';
    try {
      if(kind==='code'||format==='svg') {
        const text=kind==='code'?code.value:await artwork();
        if(copy) await navigator.clipboard.writeText(text);
        else download(new Blob([text],{type:types[format]}));
      }else{
        // Clipboard image support is standardized around PNG.
        if(copy) {
          if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined') throw new Error('Image copying is unavailable in this browser. Use Download PNG.');
          const promise=raster('image/png');
          await navigator.clipboard.write([new ClipboardItem({'image/png':promise})]);
        }else download(await raster(types[format]));
      }
      status.textContent=copy?`${names[format]} copied.`:`${names[format]} downloaded${kind==='image'?` at ${width} × ${height} px`:''}.`;
    }catch(error){status.textContent=error instanceof Error&&error.name!=='NotAllowedError'?error.message:'Clipboard access was blocked. Use Download instead.';}
    finally{busy=false;modal.removeAttribute('aria-busy');syncButtons();}
  }
  downloadButton.addEventListener('click',()=>void run(false));copyButton.addEventListener('click',()=>void run(true));
  modal.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
  modal.addEventListener('click',event=>{
    if(event.target!==modal||busy)return;
    const bounds=modal.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)modal.close();
  });
  modal.addEventListener('close',()=>{++revision;document.body.style.overflow=priorOverflow;trigger?.focus({preventScroll:true});});
  open=(nextTemplate,nextVariation)=>{
    if(modal.open)return;
    template=nextTemplate;variation=nextVariation;source=undefined;kind='image';format='png';width=1920;height=1080;busy=false;
    widthInput.value='1920';heightInput.value='1080';quality.value='95';el('#export-quality-value').textContent='95%';
    el('#export-custom').hidden=true;
    choose(el('[data-export-size="wide"]'),'[data-export-size]');
    el('#export-title').textContent=`Export ${template.name}`;el('#export-subtitle').textContent=`${variation.name} · ${variation.id}`;
    image.src=variation.backgroundSrc??variation.src;image.alt=`${template.name}, ${variation.name} export preview`;
    trigger=document.activeElement as HTMLElement;priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    modal.showModal();void render();
  };
}
