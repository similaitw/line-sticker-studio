import { useCallback, useState } from 'react';
import { readFileAsDataUrl } from './canvas/image';
import { detectProvenanceMark, simpleHash } from './canvas/provenance';
import { sliceSheet } from './canvas/slice';
import { Header } from './components/Header';
import { PhraseSelector } from './components/PhraseSelector';
import { ProviderPanel } from './components/ProviderPanel';
import { ReferencePhotoPanel } from './components/ReferencePhotoPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { StyleSelector } from './components/StyleSelector';
import { TaskPanel } from './components/TaskPanel';
import { TypeSelector } from './components/TypeSelector';
import { getSpec } from './domain/specs';
import { validateProject } from './domain/validation';
import { EditorWorkspace } from './editors/EditorWorkspace';
import { buildStickerZip, downloadBlob } from './export/exportZip';
import { getReferencePhoto } from './storage/referencePhotos';
import { useProject } from './state/ProjectContext';

export default function App() {
  const { project, dispatch } = useProject(); const [busy,setBusy]=useState(false); const [exporting,setExporting]=useState(false); const [error,setError]=useState('');
  const processSource = useCallback(async (dataUrl:string, fromProvider=true) => {
    const spec=getSpec(project.type); const mark=fromProvider?await detectProvenanceMark(dataUrl,project.generationProvider):'none';
    const cellCount=project.settings.rows*project.settings.columns; const stickers=await sliceSheet(dataUrl,{count:cellCount,targetCount:project.settings.count,rows:project.settings.rows,columns:project.settings.columns,padding:project.settings.padding,outputWidth:spec.width,outputHeight:spec.height,
      overlayTexts:project.captionSlots, fontSize:project.settings.fontSize, provenanceMark:mark, sourceProvider:fromProvider?project.generationProvider:undefined});
    const latest=project.generationTasks.filter((item)=>item.status==='exported').at(-1); const attempts=latest?[...project.generationAttempts,{id:crypto.randomUUID(),taskId:latest.id,provider:project.generationProvider,sourceHash:await simpleHash(dataUrl),importedAt:Date.now(),provenanceMark:mark}]:project.generationAttempts;
    dispatch({type:'update',patch:{sourceDataUrl:dataUrl,stickers,generationAttempts:attempts,generationTasks:project.generationTasks.map((item)=>item.id===latest?.id?{...item,status:'imported'}:item)}});
  },[project,dispatch]);
  async function run(task:()=>Promise<void>){setBusy(true);setError('');try{await task();}catch(reason){setError(reason instanceof Error?reason.message:'處理失敗');}finally{setBusy(false);}}
  async function handleUpload(file:File){await run(async()=>{if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw new Error('只支援 PNG、JPG 或 WebP');if(file.size>20*1024*1024)throw new Error('來源圖片不可超過 20 MB');await processSource(await readFileAsDataUrl(file),true);});}
  async function handleSlice(){if(project.sourceDataUrl)await run(()=>processSource(project.sourceDataUrl,false));}
  async function handleSample(){await run(async()=>processSource(createSampleSheet(project.settings.rows,project.settings.columns),false));}
  async function handleExport(){setExporting(true);setError('');try{const errors=validateProject(project).filter((item)=>item.level==='error');if(errors.length)throw new Error(`尚有 ${errors.length} 項阻擋問題：${errors[0].message}`);for(const photo of project.referencePhotos)if(!await getReferencePhoto(photo.id))throw new Error(`找不到參考照片：${photo.name}`);downloadBlob(await buildStickerZip(project),`${project.type}-line-stickers.zip`);}catch(reason){setError(reason instanceof Error?reason.message:'匯出失敗');}finally{setExporting(false);}}
  return <div className="app-shell"><Header onExport={()=>void handleExport()} exporting={exporting}/><main><ProviderPanel/><TypeSelector/><ReferencePhotoPanel/><PhraseSelector/><StyleSelector/><TaskPanel/>
    {error&&<div className="error-banner" role="alert"><strong>處理失敗</strong><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
    <div className="workbench"><SettingsPanel/><div className="workspace-main"><EditorWorkspace onUpload={(file)=>void handleUpload(file)} onSlice={()=>void handleSlice()} onSample={()=>void handleSample()} busy={busy}/></div></div></main></div>;
}

function createSampleSheet(rows:number,columns:number):string{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('瀏覽器不支援 Canvas');const count=rows*columns,cw=canvas.width/columns,ch=canvas.height/rows;
  for(let i=0;i<count;i++){const x=(i%columns)*cw+cw/2,y=Math.floor(i/columns)*ch+ch/2;ctx.save();ctx.translate(x,y);ctx.fillStyle=`hsl(${i*43%360} 78% 60%)`;ctx.strokeStyle='#111827';ctx.lineWidth=8;ctx.beginPath();ctx.roundRect(-cw*.28,-ch*.25,cw*.56,ch*.5,40);ctx.fill();ctx.stroke();ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(-25,-10,8,0,Math.PI*2);ctx.arc(25,-10,8,0,Math.PI*2);ctx.fill();ctx.restore();}return canvas.toDataURL('image/png');}
