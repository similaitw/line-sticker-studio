import { useEffect, useRef } from 'react';
import { drawSheetPreview } from '../canvas/slice';
import { loadImage } from '../canvas/image';
import { useProject } from '../state/ProjectContext';

interface Props { onUpload: (file: File) => void; onSlice: () => void; onSample: () => void; busy: boolean }
export function SourceStage({ onUpload, onSlice, onSample, busy }: Props) {
  const { project } = useProject(); const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!project.sourceDataUrl || !canvasRef.current) return;
    let active = true;
    void loadImage(project.sourceDataUrl).then((image) => {
      if (active && canvasRef.current) drawSheetPreview(canvasRef.current, image, project.settings.rows * project.settings.columns, project.settings.rows, project.settings.columns);
    });
    return () => { active = false; };
  }, [project.sourceDataUrl, project.settings.rows, project.settings.columns]);
  return <section className="stage panel">
    <div className="stage-title"><div><span className="eyebrow">SOURCE SHEET</span><h2>貼圖表預覽</h2></div>
      <span className="status">{busy ? '處理中…' : project.sourceDataUrl ? `已切割 ${project.stickers.length} 張` : '準備就緒'}</span>
    </div>
    <div className="sheet-frame">
      <canvas ref={canvasRef} width="1024" height="1024" hidden={!project.sourceDataUrl} />
      {!project.sourceDataUrl && <div className="empty-state"><strong>匯入產圖成果</strong><span>先下載 MD 到 ChatGPT／Gemini 產圖，再把 PNG 拖回這裡</span></div>}
    </div>
    <div className="stage-actions">
      <label className="ghost-button file-button">匯入平台 PNG<input type="file" hidden accept="image/png,image/jpeg,image/webp"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} /></label>
      <button className="ghost-button" onClick={onSample}>載入範例</button>
      <button className="primary-button" disabled={!project.sourceDataUrl || busy} onClick={onSlice}>重新切割</button>
    </div>
  </section>;
}
