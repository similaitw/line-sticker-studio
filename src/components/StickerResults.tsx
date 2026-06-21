import { downloadBlob } from '../export/exportZip';
import { useProject } from '../state/ProjectContext';

export function StickerResults() {
  const { project, setStickers } = useProject();
  return <aside className="results-panel panel">
    <div className="section-heading compact"><span>3</span><div><h2>貼圖素材</h2><p>{project.stickers.length} / {project.settings.count} 張</p></div></div>
    {!project.stickers.length && <div className="empty-results">生成或上傳貼圖表後，素材會顯示在這裡。</div>}
    <div className="sticker-grid">
      {project.stickers.map((asset, index) => <article className="sticker-card" key={asset.id}>
        <div className="sticker-preview"><img src={asset.dataUrl} alt={`貼圖 ${index + 1}`} /></div>
        <select className={`mark-status ${asset.provenanceMark}`} aria-label={`貼圖 ${index+1} 來源標記`} value={asset.provenanceMark}
          onChange={(e) => setStickers(project.stickers.map((item) => item.id === asset.id ? { ...item, provenanceMark: e.target.value as typeof asset.provenanceMark } : item))}>
          <option value="unknown">待確認浮水印</option><option value="none">未發現可見標記</option><option value="visible">有可見標記（阻擋）</option>
        </select>
        <div className="sticker-meta"><span>{asset.name}<small>{asset.width}×{asset.height}</small></span>
          <div><button onClick={() => downloadBlob(dataUrlBlob(asset.dataUrl), asset.name)}>↓</button>
            <button onClick={() => setStickers(project.stickers.filter((item) => item.id !== asset.id))}>×</button></div>
        </div>
      </article>)}
    </div>
  </aside>;
}

function dataUrlBlob(dataUrl: string): Blob {
  const [header, content] = dataUrl.split(',');
  const type = /data:([^;]+)/.exec(header)?.[1] ?? 'image/png';
  const binary = atob(content); const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type });
}
