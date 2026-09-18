import { useState } from 'react';
import { generateStickerSheet } from '../providers/autoGenerate';
import { useProject } from '../state/ProjectContext';

export function GeneratePanel({ onGenerated }: { onGenerated: (dataUrl: string) => Promise<void> }) {
  const { project } = useProject();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('');

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const result = await generateStickerSheet(project);
      setModel(result.model ?? '');
      await onGenerated(result.dataUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'AI 產圖失敗');
    } finally {
      setBusy(false);
    }
  }

  const cellCount = project.settings.rows * project.settings.columns;
  const ready = project.captionSlots.length === cellCount;

  return <section className="generate-section panel">
    <div className="section-heading"><span>AI</span><div>
      <h2>網站內自動產圖</h2>
      <p>直接產生候選貼圖表 → 自動切圖 → 本機加繁中字幕 → LINE 規格檢查</p>
    </div></div>

    <div className="auto-generate-summary">
      <div><small>平台</small><strong>{project.generationProvider === 'chatgpt' ? 'OpenAI Image API' : 'Gemini Image API'}</strong></div>
      <div><small>候選格</small><strong>{project.settings.columns} × {project.settings.rows} = {cellCount}</strong></div>
      <div><small>最後入選</small><strong>{project.settings.count} 張</strong></div>
      <div><small>參考照片</small><strong>{project.referencePhotos.length} 張</strong></div>
    </div>

    <div className="auto-generate-actions">
      <button className="primary-button" disabled={busy || !ready} onClick={() => void generate()}>
        {busy ? 'AI 產圖中…' : '立即自動產生貼圖'}
      </button>
      <span>{ready ? '完成後會直接進入切割結果，不必再下載 MD 或手動搬圖。' : `請先補滿 ${cellCount} 個貼圖動作／語意。`}</span>
    </div>

    {model && <p className="generation-model">最近使用模型：{model}</p>}
    {error && <p className="photo-error">{error}</p>}

    <details className="auto-generate-help">
      <summary>部署需要什麼？</summary>
      <p>在 Vercel Environment Variables 設定 OPENAI_API_KEY 或 GEMINI_API_KEY。金鑰只存在伺服器端，不會送到使用者瀏覽器。</p>
      <p>「完整產圖 MD」保留作為沒有 API Key、模型暫時不可用或需要人工微調時的備援流程。</p>
    </details>
  </section>;
}
