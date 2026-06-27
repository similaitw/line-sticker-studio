import { useRef } from 'react';
import { useProject } from '../state/ProjectContext';

export interface NavItem { id: string; label: string; summary: string }
export interface NavGroup { label: string; items: NavItem[] }

export function Header({ onExport, exporting, activeView, navGroups, onSelect }: {
  onExport: () => void; exporting: boolean; activeView: string; navGroups: NavGroup[]; onSelect: (id: string) => void;
}) {
  const { project, dispatch, canUndo, canRedo, saveProject, loadProject } = useProject();
  const inputRef = useRef<HTMLInputElement>(null);
  return <aside className="app-sidebar">
    <div className="brand">
      <div className="brand-mark">LS</div>
      <div><h1>LINE Sticker Studio</h1><p>ChatGPT／Gemini MD 產圖 · 七類貼圖本機合規製作</p></div>
    </div>
    <nav className="sidebar-nav" aria-label="製作流程導覽">{navGroups.map((group) => <section key={group.label}>
      <h2>{group.label}</h2>
      {group.items.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
        <span>{item.label}</span><small>{item.summary}</small>
      </button>)}
    </section>)}</nav>
    <div className="toolbar">
      <button className="icon-button" disabled={!canUndo} onClick={() => dispatch({ type: 'undo' })} title="復原">↶</button>
      <button className="icon-button" disabled={!canRedo} onClick={() => dispatch({ type: 'redo' })} title="重做">↷</button>
      <button className="ghost-button" onClick={() => void saveProject()}>儲存專案</button>
      <button className="ghost-button" onClick={() => inputRef.current?.click()}>載入專案</button>
      <input ref={inputRef} hidden type="file" accept="application/json,.json,application/zip,.zip" onChange={(event) => {
        const file = event.target.files?.[0]; if (file) void loadProject(file);
      }} />
      <button className="primary-button" disabled={!project.stickers.length || exporting} onClick={onExport}>
        {exporting ? '匯出中…' : '匯出完整 ZIP'}
      </button>
    </div>
  </aside>;
}
