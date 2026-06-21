import type { GenerationProvider } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const PROVIDERS: { id: GenerationProvider; label: string; description: string; color: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT', description: '下載專用 MD，手動上傳 ChatGPT 產圖', color: '#10a37f' },
  { id: 'gemini', label: 'Gemini', description: '下載 Gemini 任務與附件，使用建立圖片功能', color: '#4f75ff' },
];

export function ProviderPanel() {
  const { project, dispatch } = useProject();
  return <section className="provider-section panel">
    <div className="section-heading"><span>AI</span><div><h2>選擇產圖平台</h2><p>不使用 API Key，下載 MD 後手動上傳</p></div></div>
    <div className="provider-cards">{PROVIDERS.map((provider) => <button key={provider.id}
      className={project.generationProvider === provider.id ? 'provider-card active' : 'provider-card'}
      style={{ '--provider-color': provider.color } as React.CSSProperties}
      onClick={() => { localStorage.setItem('line-sticker-provider', provider.id); dispatch({ type: 'update', patch: { generationProvider: provider.id } }); }}>
      <strong>{provider.label}</strong><small>{provider.description}</small>
    </button>)}</div>
  </section>;
}
