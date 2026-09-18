import type { GenerationProvider } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const PROVIDERS: { id: GenerationProvider; label: string; description: string; color: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT Plus', description: '主要模式：透過 GitHub Issue 把任務交給這個 ChatGPT 對話處理，不需圖片 API Key', color: '#10a37f' },
  { id: 'gemini', label: 'Gemini 手動備援', description: '保留原本 Markdown 任務流程，必要時手動到 Gemini 產圖', color: '#4f75ff' },
];

export function ProviderPanel() {
  const { project, dispatch } = useProject();
  return <section className="provider-section panel">
    <div className="section-heading"><span>AI</span><div><h2>選擇產圖方式</h2><p>預設使用 ChatGPT Plus＋GitHub 橋接；不需要 OpenAI 圖片 API。</p></div></div>
    <div className="provider-cards">{PROVIDERS.map((provider) => <button key={provider.id}
      className={project.generationProvider === provider.id ? 'provider-card active' : 'provider-card'}
      style={{ '--provider-color': provider.color } as React.CSSProperties}
      onClick={() => { localStorage.setItem('line-sticker-provider', provider.id); dispatch({ type: 'update', patch: { generationProvider: provider.id } }); }}>
      <strong>{provider.label}</strong><small>{provider.description}</small>
    </button>)}</div>
  </section>;
}
