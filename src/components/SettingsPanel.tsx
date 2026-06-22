import { getSpec } from '../domain/specs';
import { fillCaptionSlots, RECOMMENDED_GRIDS } from '../domain/project';
import { useProject } from '../state/ProjectContext';

export function SettingsPanel() {
  const { project, updateSettings, dispatch } = useProject(); const { settings } = project; const spec = getSpec(project.type); const cellCount = settings.rows * settings.columns;
  function setCount(count: typeof settings.count) { const grid = cellCount < count ? RECOMMENDED_GRIDS[count] : { rows: settings.rows, columns: settings.columns }; const cells = grid.rows * grid.columns;
    dispatch({ type: 'update', patch: { settings: { ...settings, count, ...grid }, captionSlots: fillCaptionSlots(project.captionSlots, cells),
      stickers: project.stickers.map((asset, index) => ({ ...asset, included: index < count, selectedAt: index < count ? index + 1 : undefined })) } }); }
  function setGrid(rows: number, columns: number) { const cells = rows * columns; if (cells < settings.count) return;
    dispatch({ type: 'update', patch: { settings: { ...settings, rows, columns }, captionSlots: fillCaptionSlots(project.captionSlots, cells), stickers: [] } }); }
  return <aside className="settings-panel panel">
    <div className="section-heading compact"><span>2</span><div><h2>設計設定</h2><p>{spec.label} · 最大 {spec.width}×{spec.height}</p></div></div>
    <label className="field"><span>角色描述</span><textarea rows={5} value={settings.character} onChange={(e) => updateSettings({ character: e.target.value })} /></label>
    <div className="field-grid"><label className="field"><span>LINE 入選張數</span><select value={settings.count} onChange={(e) => setCount(Number(e.target.value) as typeof settings.count)}>
      {spec.counts.map((count) => <option key={count} value={count}>{count} 張</option>)}</select></label>
      <label className="field"><span>生成格數</span><strong className="grid-total">{settings.rows}×{settings.columns}＝{cellCount} 格</strong></label></div>
    <div className="field-grid"><label className="field"><span>行數</span><select value={settings.rows} onChange={(e) => setGrid(Number(e.target.value), settings.columns)}>
      {Array.from({ length: 7 }, (_, index) => index + 2).map((value) => <option key={value} value={value} disabled={value * settings.columns < settings.count}>{value} 行</option>)}</select></label>
      <label className="field"><span>列數</span><select value={settings.columns} onChange={(e) => setGrid(settings.rows, Number(e.target.value))}>
        {Array.from({ length: 7 }, (_, index) => index + 2).map((value) => <option key={value} value={value} disabled={value * settings.rows < settings.count}>{value} 列</option>)}</select></label></div>
    <label className="field range-field"><span>來源留白 <b>{settings.padding}px</b></span><input type="range" min="0" max="40" value={settings.padding} onChange={(e) => updateSettings({ padding: Number(e.target.value) })} /></label>
    <label className="field range-field"><span>文字大小 <b>{settings.fontSize}px</b></span><input type="range" min="24" max="72" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })} /></label>
    {spec.animated && <label className="field"><span>循環次數</span><select value={settings.loops} onChange={(e) => updateSettings({ loops: Number(e.target.value) })}>
      {Array.from({ length:(spec.maxLoops ?? 1)-(spec.minLoops ?? 1)+1 },(_,i)=>i+(spec.minLoops ?? 1)).map((value)=><option key={value}>{value}</option>)}</select></label>}
    <div className="local-only"><strong>100% 本機處理</strong><span>不使用 API Key，圖片不會上傳到本站。</span></div>
  </aside>;
}
