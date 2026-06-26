import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { createDefaultGuides, drawSheetPreview, normalizeGuides } from '../canvas/slice';
import { loadImage } from '../canvas/image';
import { useProject } from '../state/ProjectContext';

interface Props { onUpload: (file: File) => void; onSlice: () => void; onSample: () => void; busy: boolean }
export function SourceStage({ onUpload, onSlice, onSample, busy }: Props) {
  const { project, updateSettings } = useProject(); const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ axis: 'x' | 'y'; index: number } | null>(null); const [dragging, setDragging] = useState(false);
  const draftGuidesRef = useRef<{ x: number[]; y: number[] } | null>(null);
  const [draftGuides, setDraftGuides] = useState<{ x: number[]; y: number[] } | null>(null);
  const activeGuides = draftGuides ?? project.settings.sliceGuides;
  useEffect(() => {
    if (!project.sourceDataUrl || !canvasRef.current) return;
    let active = true;
    void loadImage(project.sourceDataUrl).then((image) => {
      if (active && canvasRef.current) drawSheetPreview(canvasRef.current, image, project.settings.rows * project.settings.columns, project.settings.rows, project.settings.columns, activeGuides);
    });
    return () => { active = false; };
  }, [project.sourceDataUrl, project.settings.rows, project.settings.columns, activeGuides]);
  function updateGuide(event: PointerEvent<HTMLCanvasElement>) {
    const current = dragRef.current; const canvas = canvasRef.current;
    if (!current || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = current.axis === 'x' ? (event.clientX - rect.left) / rect.width : (event.clientY - rect.top) / rect.height;
    const guides = normalizeGuides(project.settings.rows, project.settings.columns, draftGuidesRef.current ?? project.settings.sliceGuides);
    const values = [...guides[current.axis]]; const min = current.index === 0 ? .02 : values[current.index - 1] + .02;
    const max = current.index === values.length - 1 ? .98 : values[current.index + 1] - .02;
    values[current.index] = Math.min(max, Math.max(min, ratio));
    const next = { ...guides, [current.axis]: values };
    draftGuidesRef.current = next; setDraftGuides(next);
  }
  function beginDrag(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current; if (!canvas || !project.sourceDataUrl) return;
    const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height;
    const guides = normalizeGuides(project.settings.rows, project.settings.columns, project.settings.sliceGuides);
    const hit = .018; let best: { axis: 'x' | 'y'; index: number; distance: number } | null = null;
    guides.x.forEach((value, index) => { const distance = Math.abs(value - x); if (distance < hit && (!best || distance < best.distance)) best = { axis: 'x', index, distance }; });
    guides.y.forEach((value, index) => { const distance = Math.abs(value - y); if (distance < hit && (!best || distance < best.distance)) best = { axis: 'y', index, distance }; });
    if (!best) return;
    draftGuidesRef.current = guides; setDraftGuides(guides); dragRef.current = best; setDragging(true); canvas.setPointerCapture(event.pointerId); updateGuide(event);
  }
  function endDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) canvasRef.current.releasePointerCapture(event.pointerId);
    if (draftGuidesRef.current) updateSettings({ sliceGuides: draftGuidesRef.current });
    dragRef.current = null; setDragging(false);
    draftGuidesRef.current = null; setDraftGuides(null);
  }
  function resetGuides() { updateSettings({ sliceGuides: createDefaultGuides(project.settings.rows, project.settings.columns) }); }
  return <section className="stage panel">
    <div className="stage-title"><div><span className="eyebrow">SOURCE SHEET</span><h2>貼圖表預覽</h2></div>
      <span className="status">{busy ? '處理中…' : project.sourceDataUrl ? `已切割 ${project.stickers.length} 張` : '準備就緒'}</span>
    </div>
    <div className="sheet-frame">
      <canvas ref={canvasRef} width="1024" height="1024" hidden={!project.sourceDataUrl} className={dragging ? 'dragging-guides' : ''}
        onPointerDown={beginDrag} onPointerMove={updateGuide} onPointerUp={endDrag} onPointerCancel={endDrag} />
      {!project.sourceDataUrl && <div className="empty-state"><strong>匯入產圖成果</strong><span>先下載 MD 到 ChatGPT／Gemini 產圖，再把 PNG 拖回這裡</span></div>}
    </div>
    <div className="stage-actions">
      <label className="ghost-button file-button">匯入平台 PNG<input type="file" hidden accept="image/png,image/jpeg,image/webp"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} /></label>
      <button className="ghost-button" disabled={!project.sourceDataUrl} onClick={resetGuides}>重設切割線</button>
      <button className="ghost-button" onClick={onSample}>載入範例</button>
      <button className="primary-button" disabled={!project.sourceDataUrl || busy} onClick={onSlice}>重新切割</button>
    </div>
    {project.sourceDataUrl && <p className="guide-hint">拖曳綠色切割線微調位置；調整後按「重新切割」套用。</p>}
  </section>;
}
