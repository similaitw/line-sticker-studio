import { useCallback, useState } from 'react';
import { readFileAsDataUrl } from './canvas/image';
import { detectProvenanceMark, simpleHash } from './canvas/provenance';
import { sliceSheet } from './canvas/slice';
import { Header, type NavGroup } from './components/Header';
import { PhraseSelector } from './components/PhraseSelector';
import { ProviderPanel } from './components/ProviderPanel';
import { ReferencePhotoPanel } from './components/ReferencePhotoPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SourceStage } from './components/SourceStage';
import { StickerResults } from './components/StickerResults';
import { StyleSelector } from './components/StyleSelector';
import { TaskPanel } from './components/TaskPanel';
import { Timeline } from './components/Timeline';
import { TypeSelector } from './components/TypeSelector';
import { TutorialPanel } from './components/TutorialPanel';
import { ValidationPanel } from './components/ValidationPanel';
import { getSpec } from './domain/specs';
import { validateProject } from './domain/validation';
import { buildStickerZip, downloadBlob } from './export/exportZip';
import { getReferencePhoto } from './storage/referencePhotos';
import { useProject } from './state/ProjectContext';

type ViewId = 'provider' | 'type' | 'photos' | 'phrases' | 'style' | 'tasks' | 'settings' | 'source' | 'results' | 'timeline' | 'validation' | 'export' | 'tutorial-basic' | 'tutorial-animated';

export default function App() {
  const { project, dispatch } = useProject(); const [busy,setBusy]=useState(false); const [exporting,setExporting]=useState(false); const [error,setError]=useState(''); const [activeView,setActiveView]=useState<ViewId>('provider');
  const processSource = useCallback(async (dataUrl:string, fromProvider=true) => {
    const spec=getSpec(project.type); const mark=fromProvider?await detectProvenanceMark(dataUrl,project.generationProvider):'none';
    const cellCount=project.settings.rows*project.settings.columns; const stickers=await sliceSheet(dataUrl,{count:cellCount,targetCount:project.settings.count,rows:project.settings.rows,columns:project.settings.columns,padding:project.settings.padding,outputWidth:spec.width,outputHeight:spec.height,
      sliceGuides:project.settings.sliceGuides, overlayTexts:project.captionSlots, fontSize:project.settings.fontSize, fontFamily:project.settings.fontFamily, provenanceMark:mark, sourceProvider:fromProvider?project.generationProvider:undefined});
    const latest=project.generationTasks.filter((item)=>item.status==='exported').at(-1); const attempts=latest?[...project.generationAttempts,{id:crypto.randomUUID(),taskId:latest.id,provider:project.generationProvider,sourceHash:await simpleHash(dataUrl),importedAt:Date.now(),provenanceMark:mark}]:project.generationAttempts;
    dispatch({type:'update',patch:{sourceDataUrl:dataUrl,stickers,generationAttempts:attempts,generationTasks:project.generationTasks.map((item)=>item.id===latest?.id?{...item,status:'imported'}:item)}});
  },[project,dispatch]);
  async function run(task:()=>Promise<void>){setBusy(true);setError('');try{await task();}catch(reason){setError(reason instanceof Error?reason.message:'處理失敗');}finally{setBusy(false);}}
  async function handleUpload(file:File){await run(async()=>{if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw new Error('只支援 PNG、JPG 或 WebP');if(file.size>20*1024*1024)throw new Error('來源圖片不可超過 20 MB');await processSource(await readFileAsDataUrl(file),true);});}
  async function handleSlice(){if(project.sourceDataUrl)await run(()=>processSource(project.sourceDataUrl,false));}
  async function handleSample(){await run(async()=>processSource(createSampleSheet(project.settings.rows,project.settings.columns),false));}
  async function handleExport(){setExporting(true);setError('');try{const errors=validateProject(project).filter((item)=>item.level==='error');if(errors.length)throw new Error(`尚有 ${errors.length} 項阻擋問題：${errors[0].message}`);for(const photo of project.referencePhotos)if(!await getReferencePhoto(photo.id))throw new Error(`找不到參考照片：${photo.name}`);downloadBlob(await buildStickerZip(project),`${project.type}-line-stickers.zip`);}catch(reason){setError(reason instanceof Error?reason.message:'匯出失敗');}finally{setExporting(false);}}
  const issues=validateProject(project); const errors=issues.filter((item)=>item.level==='error').length; const included=project.stickers.filter((asset)=>asset.included).length;
  const navGroups:NavGroup[]=[
    {label:'教學',items:[{id:'tutorial-basic',label:'新手流程',summary:'任務清單'},{id:'tutorial-animated',label:'動態貼圖',summary:getSpec(project.type).animated?'APNG 教學':'需切換動態'}]},
    {label:'準備',items:[{id:'provider',label:'生成平台',summary:project.generationProvider==='chatgpt'?'ChatGPT':'Gemini'},{id:'type',label:'貼圖類型',summary:getSpec(project.type).label},{id:'photos',label:'參考照片',summary:`${project.referencePhotos.length}/5 張`}]},
    {label:'配方',items:[{id:'settings',label:'設計設定',summary:`${project.settings.rows}×${project.settings.columns} · ${project.settings.count} 張`},{id:'phrases',label:'常用文字詞庫',summary:`${project.captionSlots.length}/${project.settings.rows*project.settings.columns} 格`},{id:'style',label:'風格配方',summary:'即時預覽'},{id:'tasks',label:'完整產圖任務',summary:`${project.generationTasks.length} 份 MD`}]},
    {label:'工作台',items:[{id:'source',label:'貼圖表預覽',summary:project.sourceDataUrl?`已切割 ${project.stickers.length} 張`:'等待圖檔'},{id:'results',label:'切割結果',summary:`入選 ${included}/${project.settings.count}`}]},
    {label:'檢查輸出',items:[{id:'timeline',label:'動畫時間軸',summary:getSpec(project.type).animated?'APNG 設定':'靜態貼圖'},{id:'validation',label:'合規檢查',summary:errors?`${errors} 個阻擋`:'可檢查'},{id:'export',label:'匯出 ZIP',summary:project.stickers.length?'準備匯出':'尚無貼圖'}]},
  ];
  const viewTitle=navGroups.flatMap((group)=>group.items).find((item)=>item.id===activeView)?.label ?? '工作區';
  return <div className="app-shell app-layout"><Header onExport={()=>void handleExport()} exporting={exporting} activeView={activeView} navGroups={navGroups} onSelect={(id)=>setActiveView(id as ViewId)}/>
    <main className="content-shell"><div className="view-header"><span>LINE Sticker Studio</span><h1>{viewTitle}</h1></div>
      {error&&<div className="error-banner" role="alert"><strong>處理失敗</strong><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
      <ActiveView id={activeView} onNavigate={(id)=>setActiveView(id as ViewId)} onUpload={(file)=>void handleUpload(file)} onSlice={()=>void handleSlice()} onSample={()=>void handleSample()} onExport={()=>void handleExport()} busy={busy} exporting={exporting} />
    </main></div>;
}

function ActiveView({ id, onNavigate, onUpload, onSlice, onSample, onExport, busy, exporting }: { id: ViewId; onNavigate: (id: string) => void; onUpload: (file: File) => void; onSlice: () => void; onSample: () => void; onExport: () => void; busy: boolean; exporting: boolean }) {
  const { project } = useProject();
  if (id === 'tutorial-basic') return <TutorialPanel mode="beginner" onNavigate={onNavigate} />;
  if (id === 'tutorial-animated') return <TutorialPanel mode="animated" onNavigate={onNavigate} />;
  if (id === 'provider') return <ProviderPanel />;
  if (id === 'type') return <TypeSelector />;
  if (id === 'photos') return <ReferencePhotoPanel />;
  if (id === 'phrases') return <PhraseSelector />;
  if (id === 'style') return <StyleSelector />;
  if (id === 'tasks') return <TaskPanel />;
  if (id === 'settings') return <div className="single-panel"><SettingsPanel /></div>;
  if (id === 'source') return <SourceStage onUpload={onUpload} onSlice={onSlice} onSample={onSample} busy={busy} />;
  if (id === 'results') return <StickerResults />;
  if (id === 'timeline') return getSpec(project.type).animated ? <Timeline /> : <section className="timeline panel"><div><span className="eyebrow">STATIC STICKERS</span><h2>靜態貼圖不需要動畫時間軸</h2><p className="hint">切換到動態、彈出或特效類型後，這裡會顯示 APNG 影格設定。</p></div></section>;
  if (id === 'validation') return <ValidationPanel />;
  return <><section className="export-panel panel"><div className="section-heading"><span>ZIP</span><div><h2>匯出完整 ZIP</h2><p>匯出前會先執行 LINE 規格檢查。</p></div></div><button className="primary-button wide" disabled={exporting || !project.stickers.length} onClick={onExport}>{exporting?'匯出中…':'匯出完整 ZIP'}</button></section><ValidationPanel /></>;
}

function createSampleSheet(rows:number,columns:number):string{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('瀏覽器不支援 Canvas');const count=rows*columns,cw=canvas.width/columns,ch=canvas.height/rows;
  for(let i=0;i<count;i++){const x=(i%columns)*cw+cw/2,y=Math.floor(i/columns)*ch+ch/2;ctx.save();ctx.translate(x,y);ctx.fillStyle=`hsl(${i*43%360} 78% 60%)`;ctx.strokeStyle='#111827';ctx.lineWidth=8;ctx.beginPath();ctx.roundRect(-cw*.28,-ch*.25,cw*.56,ch*.5,40);ctx.fill();ctx.stroke();ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(-25,-10,8,0,Math.PI*2);ctx.arc(25,-10,8,0,Math.PI*2);ctx.fill();ctx.restore();}return canvas.toDataURL('image/png');}
