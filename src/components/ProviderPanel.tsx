import type { GenerationProvider } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const PROVIDERS: { id: GenerationProvider; label: string; description: string; color: string }[] = [
  { id: 'chatgpt', label: 'OpenAI', description: '網站內直接呼叫 OpenAI Image API 自動產生候選貼圖表', color: '#10a37f' },
  { id: 'gemini', label: 'Gemini', description: '網站內直接呼叫 Gemini Image API 自動產生候選貼圖表', color: '#4f75ff' },
];

export function ProviderPanel() {
  const { project, dispatch } = useProject();
  return <section className="provider-section panel">
    <div className="section-heading"><span>AI</span><div><h2>選擇自動產圖引擎</h2><p>API Key 僅設定在 Vercel 伺服器端；使用者瀏覽器看不到金鑰</p></div></div>
    <div className="provider-cards">{PROVIDERS.map((provider) => <button key={provider.id}
      className={project.generationProvider === provider.id ? 'provider-card active' : 'provider-card'}
      style={{ '--provider-color': provider.color } as React.CSSProperties}
      onClick={() => { localStorage.setItem('line-sticker-provider', provider.id); dispatch({ type: 'update', patch: { generationProvider: provider.id } }); }}>
      <strong>{provider.label}</strong><small>{provider.description}</small>
    </button>)}</div>
  </section>;
}
