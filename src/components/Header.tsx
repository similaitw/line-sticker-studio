import { useRef } from 'react';
import { useProject } from '../state/ProjectContext';

export interface NavItem { id: string; label: string; summary: string }
export interface NavGroup { label: string; items: NavItem[] }

export function Header({ onExport, exporting, activeView, navGroups, onSelect }: {
  onExport: () => void; exporting: boolean; activeView: string; navGroups: NavGroup[]; onSelect: (id: string) => void;
}) {
  const { project, dispatch, canUndo, canRedo, saveProject, loadProject } = useProject();
  const inputRef = useRef<HTMLInputElement>(null);
  const main = navGroups[0];
  const advanced = navGroups.slice(1).flatMap((group) => group.items);

  return <aside className="app-sidebar">
    <div className="brand">
      <div className="brand-mark">LS</div>
      <div><h1>LINE Sticker Studio</h1><p>4 步完成 LINE 貼圖</p></div>
    </div>

    <nav className="simple-nav" aria-label="製作流程">
      {main?.items.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
        <span>{item.label}</span><small>{item.summary}</small>
      </button>)}
    </nav>

    <details className="advanced-menu">
      <summary>進階設定</summary>
      <div>{advanced.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => onSelect(item.id)}>
        <span>{item.label}</span><small>{item.summary}</small>
      </button>)}</div>
    </details>

    <details className="project-menu">
      <summary>專案工具</summary>
      <div className="toolbar">
        <button className="icon-button" disabled={!canUndo} onClick={() => dispatch({ type: 'undo' })} title="復原">↶</button>
        <button className="icon-button" disabled={!canRedo} onClick={() => dispatch({ type: 'redo' })} title="重做">↷</button>
        <button className="ghost-button" onClick={() => void saveProject()}>儲存專案</button>
        <button className="ghost-button" onClick={() => inputRef.current?.click()}>載入專案</button>
        <input ref={inputRef} hidden type="file" accept="application/json,.json,application/zip,.zip" onChange={(event) => {
          const file = event.target.files?.[0]; if (file) void loadProject(file);
        }} />
      </div>
    </details>

    <button className="primary-button sidebar-export" disabled={!project.stickers.length || exporting} onClick={onExport}>
      {exporting ? '匯出中…' : '下載 ZIP'}
    </button>
  </aside>;
}
