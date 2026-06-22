import JSZip from 'jszip';
import { encodeApng } from '../animation/apng';
import { resizeDataUrl } from '../canvas/image';
import { getSpec } from '../domain/specs';
import { validateProject } from '../domain/validation';
import type { StickerProject } from '../domain/types';

function base64(dataUrl:string):string{return dataUrl.split(',')[1]??'';}
export async function buildStickerZip(project:StickerProject):Promise<Blob>{const errors=validateProject(project).filter((item)=>item.level==='error');if(errors.length)throw new Error(errors[0].message);
  const selected=project.stickers.filter((asset)=>asset.included).sort((a,b)=>a.gridIndex-b.gridIndex);const zip=new JSZip(),spec=getSpec(project.type),cover=selected[0].dataUrl;
  zip.file('main.png',base64(await resizeDataUrl(cover,240,240)),{base64:true});zip.file('tab.png',base64(await resizeDataUrl(cover,96,74)),{base64:true});
  if(!spec.animated)selected.forEach((asset,index)=>zip.file(`${String(index+1).padStart(2,'0')}.png`,base64(asset.dataUrl),{base64:true}));
  else{for(const [index,asset] of selected.entries()){const name=`${String(index+1).padStart(2,'0')}.png`,frames=project.animationSets[asset.id]??[];const width=spec.secondaryAnimation?480:spec.width,height=spec.secondaryAnimation?480:spec.height;const apng=await encodeApng(frames,width,height);
      if(project.type==='animated')zip.file(name,apng);else{zip.file(name,base64(asset.dataUrl),{base64:true});const folder=project.type==='popup'?'popup':'effect';zip.file(`${folder}/${name}`,apng);}}
    const first=project.animationSets[selected[0].id]??[];if(first.length)zip.file(spec.secondaryAnimation?`${project.type}/main.png`:'main.png',await encodeApng(first,spec.secondaryAnimation?480:spec.width,spec.secondaryAnimation?480:spec.height));}
  zip.file('project.json',JSON.stringify({version:project.version,name:project.name,type:project.type,provider:project.generationProvider,count:project.settings.count,generatedAt:new Date().toISOString()},null,2));
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});if(blob.size>=60*1024*1024)throw new Error('完整 ZIP 必須小於 60 MB');return blob;
}
export function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
