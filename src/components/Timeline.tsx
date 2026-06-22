import { useMemo, useState } from 'react';
import { readFileAsDataUrl } from '../canvas/image';
import { getSpec } from '../domain/specs';
import type { AnimationFrame } from '../domain/types';
import { useProject } from '../state/ProjectContext';

export function Timeline() {
  const { project, setAnimationFrames } = useProject(); const spec = getSpec(project.type);
  const selectedStickers = project.stickers.filter((asset) => asset.included); const [activeId, setActiveId] = useState(''); const stickerId = activeId || selectedStickers[0]?.id || '';
  const frames = project.animationSets[stickerId] ?? [];
  const duration = useMemo(() => frames.reduce((sum, frame) => sum + frame.delayMs, 0), [frames]);
  if (!spec.animated) return null;
  async function addFiles(files: FileList | null) {
    if (!files || !stickerId) return; const room = (spec.maxFrames ?? 20) - frames.length; const incoming: AnimationFrame[] = [];
    for (const file of Array.from(files).slice(0, room)) incoming.push({ id: crypto.randomUUID(), dataUrl: await readFileAsDataUrl(file), delayMs: 150 });
    setAnimationFrames(stickerId, [...frames, ...incoming]);
  }
  function updateFrame(id: string, patch: Partial<AnimationFrame>) { setAnimationFrames(stickerId, frames.map((frame) => frame.id === id ? { ...frame, ...patch } : frame)); }
  return <section className="timeline panel"><div className="timeline-header"><div><span className="eyebrow">APNG TIMELINE</span><h2>每張貼圖獨立動畫</h2></div>
    <select aria-label="選擇動畫貼圖" value={stickerId} onChange={(e) => setActiveId(e.target.value)}>{selectedStickers.map((asset,index)=><option key={asset.id} value={asset.id}>入選貼圖 {index+1}</option>)}</select>
    <div className={duration>(spec.maxDurationMs ?? Infinity)?'duration invalid':'duration'}>{(duration/1000).toFixed(2)} / {(spec.maxDurationMs ?? 0)/1000}s</div></div>
    {!stickerId && <p className="hint">請先匯入並切割貼圖表。</p>}
    <div className="frame-strip">{frames.map((frame,index)=><article className="frame-card" key={frame.id}><span className="frame-number">{index+1}</span><img src={frame.dataUrl} alt={`影格 ${index+1}`} />
      <label><input type="number" min="50" max="1000" step="10" value={frame.delayMs} onChange={(e)=>updateFrame(frame.id,{delayMs:Number(e.target.value)})}/> ms</label>
      <button onClick={()=>setAnimationFrames(stickerId,frames.filter((item)=>item.id!==frame.id))}>×</button></article>)}
      {stickerId && <label className="add-frame">＋<span>加入影格</span><input type="file" hidden multiple accept="image/png,image/webp" onChange={(e)=>void addFiles(e.target.files)}/></label>}</div>
    <p className="hint">每張需要 {spec.minFrames}–{spec.maxFrames} 幀，APNG 由 Web Worker 本機編碼。</p></section>;
}
