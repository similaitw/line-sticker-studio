import { useRef } from 'react';
import { useProject } from '../state/ProjectContext';

export function Header({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
  const { project, dispatch, canUndo, canRedo, saveProject, loadProject } = useProject();
  const inputRef = useRef<HTMLInputElement>(null);
  return <header className="topbar">
    <div className="brand">
      <div className="brand-mark">LS</div>
      <div><h1>LINE Sticker Studio</h1><p>ChatGPT／Gemini MD 產圖 · 七類貼圖本機合規製作</p></div>
    </div>
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
  </header>;
}
