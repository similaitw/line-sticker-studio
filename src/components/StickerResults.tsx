import { downloadBlob } from '../export/exportZip';
import { toggleCandidateSelection } from '../domain/candidates';
import { useProject } from '../state/ProjectContext';

export function StickerResults() {
  const { project, setStickers } = useProject(); const included = project.stickers.filter((asset) => asset.included).length;
  function toggleCandidate(id: string) {
    setStickers(toggleCandidateSelection(project.stickers, id, project.settings.count));
  }
  return <aside className="results-panel panel"><div className="section-heading compact"><span>3</span><div><h2>候選貼圖素材</h2><p>候選 {project.stickers.length} 張 · 入選 {included}/{project.settings.count}</p></div></div>
    {!project.stickers.length && <div className="empty-results">生成或上傳貼圖表後，候選素材會顯示在這裡。</div>}
    <div className="sticker-grid">{project.stickers.map((asset, index) => <article className={asset.included ? 'sticker-card included' : 'sticker-card'} key={asset.id}>
      <button className="candidate-toggle" onClick={() => toggleCandidate(asset.id)}>{asset.included ? '✓ 已入選' : '設為入選'}</button>
      <div className="sticker-preview"><img src={asset.dataUrl} alt={`候選 ${index + 1}`} /></div>
      <select className={`mark-status ${asset.provenanceMark}`} aria-label={`貼圖 ${index + 1} 來源標記`} value={asset.provenanceMark}
        onChange={(event) => setStickers(project.stickers.map((item) => item.id === asset.id ? { ...item, provenanceMark: event.target.value as typeof asset.provenanceMark } : item))}>
        <option value="unknown">待確認浮水印</option><option value="none">未發現可見標記</option><option value="visible">有可見標記（阻擋）</option>
      </select>
      <div className="sticker-meta"><span>候選 {index + 1}<small>{asset.width}×{asset.height}</small></span><div><button onClick={() => downloadBlob(dataUrlBlob(asset.dataUrl), asset.name)}>↓</button><button onClick={() => setStickers(project.stickers.filter((item) => item.id !== asset.id))}>×</button></div></div>
    </article>)}</div>
  </aside>;
}

function dataUrlBlob(dataUrl: string): Blob { const [header, content] = dataUrl.split(','); const type = /data:([^;]+)/.exec(header)?.[1] ?? 'image/png'; const binary = atob(content); const bytes = new Uint8Array(binary.length); for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index); return new Blob([bytes], { type }); }
