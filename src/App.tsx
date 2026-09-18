import { useCallback, useState } from 'react';
import { readFileAsDataUrl } from './canvas/image';
import { detectProvenanceMark, simpleHash } from './canvas/provenance';
import { sliceSheet } from './canvas/slice';
import { Header, type NavGroup } from './components/Header';
import { GitHubBridgePanel } from './components/GitHubBridgePanel';
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

type ViewId = 'character' | 'phrases' | 'make' | 'finish' | 'provider' | 'type' | 'style' | 'tasks' | 'settings' | 'source' | 'results' | 'timeline' | 'validation' | 'tutorial-basic' | 'tutorial-animated';

export default function App() {
  const { project, dispatch } = useProject(); const [busy,setBusy]=useState(false); const [exporting,setExporting]=useState(false); const [error,setError]=useState(''); const [activeView,setActiveView]=useState<ViewId>('character');
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
    {label:'開始製作',items:[
      {id:'character',label:'① 角色',summary:project.referencePhotos.length?`已加入 ${project.referencePhotos.length} 張照片`:'選角色或加照片'},
      {id:'phrases',label:'② 文字',summary:`${project.captionSlots.length}/${project.settings.rows*project.settings.columns} 個`},
      {id:'make',label:'③ 產圖',summary:project.sourceDataUrl?'圖片已匯入':'GitHub → ChatGPT'},
      {id:'finish',label:'④ 完成',summary:project.stickers.length?`已選 ${included}/${project.settings.count}`:'等待產圖'},
    ]},
    {label:'進階設定',items:[
      {id:'type',label:'貼圖類型',summary:getSpec(project.type).label},
      {id:'settings',label:'角色／張數細節',summary:`${project.settings.rows}×${project.settings.columns} · ${project.settings.count} 張`},
      {id:'style',label:'畫風與配色',summary:'風格配方'},
      {id:'source',label:'切圖微調',summary:project.sourceDataUrl?`${project.stickers.length} 張`:'尚無圖片'},
      {id:'timeline',label:'動畫設定',summary:getSpec(project.type).animated?'APNG':'靜態免設定'},
      {id:'validation',label:'詳細檢查',summary:errors?`${errors} 個問題`:'正常'},
      {id:'tasks',label:'手動 MD 備援',summary:'必要時使用'},
      {id:'provider',label:'其他產圖方式',summary:project.generationProvider==='chatgpt'?'ChatGPT':'Gemini'},
      {id:'tutorial-basic',label:'使用說明',summary:'教學'},
    ]},
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
  if (id === 'character') return <div className="simple-step"><div className="simple-step-intro"><b>1</b><div><h2>先決定角色</h2><p>有照片就上傳；沒有照片也可以直接選角色。其他設定先用預設值即可。</p></div></div><div className="simple-stack"><ReferencePhotoPanel /><div className="single-panel"><SettingsPanel /></div></div><button className="primary-button simple-next" onClick={()=>onNavigate('phrases')}>下一步：選貼圖文字 →</button></div>;
  if (id === 'make') return <div className="simple-step"><div className="simple-step-intro"><b>3</b><div><h2>交給 ChatGPT 產圖</h2><p>先建立 GitHub 任務；回到這個對話叫我處理。產圖完成後，把 PNG 拖回下方即可。</p></div></div><GitHubBridgePanel /><div className="simple-divider"><span>產圖完成後</span></div><SourceStage onUpload={onUpload} onSlice={onSlice} onSample={onSample} busy={busy} /></div>;
  if (id === 'finish') return <div className="simple-step"><div className="simple-step-intro"><b>4</b><div><h2>確認後直接下載</h2><p>挑滿需要的貼圖；有問題才看詳細檢查。</p></div></div><StickerResults /><div className="simple-finish-actions"><button className="primary-button wide" disabled={exporting || !project.stickers.length} onClick={onExport}>{exporting?'匯出中…':'下載 LINE 貼圖 ZIP'}</button><button className="ghost-button" onClick={()=>onNavigate('validation')}>查看詳細檢查</button></div></div>;
  if (id === 'tutorial-basic') return <TutorialPanel mode="beginner" onNavigate={onNavigate} />;
  if (id === 'tutorial-animated') return <TutorialPanel mode="animated" onNavigate={onNavigate} />;
  if (id === 'provider') return <ProviderPanel />;
  if (id === 'type') return <TypeSelector />;
  if (id === 'phrases') return <div className="simple-step"><div className="simple-step-intro"><b>2</b><div><h2>選貼圖文字</h2><p>直接套常用組合最快；想自己挑再搜尋。系統會避免同一組出現重複用語。</p></div></div><PhraseSelector /><button className="primary-button simple-next" onClick={()=>onNavigate('make')}>下一步：建立產圖任務 →</button></div>;
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
