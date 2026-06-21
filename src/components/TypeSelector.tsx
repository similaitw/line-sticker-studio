import { STICKER_SPECS, STICKER_TYPES } from '../domain/specs';
import { useProject } from '../state/ProjectContext';

export function TypeSelector() {
  const { project, setType } = useProject();
  return <section className="type-section">
    <div className="section-heading"><span>1</span><div><h2>選擇貼圖類型</h2><p>切換類型會套用對應的官方輸出限制</p></div></div>
    <div className="type-tabs" role="tablist" aria-label="貼圖類型">
      {STICKER_TYPES.map((type) => {
        const spec = STICKER_SPECS[type];
        return <button key={type} role="tab" aria-selected={project.type === type}
          className={project.type === type ? 'active' : ''} style={{ '--type-accent': spec.accent } as React.CSSProperties}
          onClick={() => setType(type)}>
          <strong>{spec.shortLabel}</strong><small>{spec.description}</small>
        </button>;
      })}
    </div>
  </section>;
}
