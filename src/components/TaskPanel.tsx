import { useMemo, useRef } from 'react';
import { downloadBlob } from '../export/exportZip';
import { buildTaskMarkdown, createGenerationTask, parseTaskMarkdown, providerUrl } from '../providers/tasks';
import type { GenerationTask, TaskKind } from '../domain/types';
import { useProject } from '../state/ProjectContext';

export function TaskPanel() {
  const { project, dispatch } = useProject();
  const importRef = useRef<HTMLInputElement>(null);
  const available = useMemo<TaskKind[]>(() => {
    const result: TaskKind[] = ['character-reference', 'sticker-sheet'];
    if (project.type === 'animated') result.push('animation-frames');
    if (project.type === 'popup') result.push('popup-frames');
    if (project.type === 'effect') result.push('effect-frames');
    return result;
  }, [project.type]);
  const labels: Record<TaskKind, string> = { 'character-reference': '角色基準', 'sticker-sheet': '貼圖表', 'animation-frames': '動畫影格', 'popup-frames': '彈出影格', 'effect-frames': '背景特效影格' };
  function create(kind: TaskKind) {
    if (project.captionSlots.length !== project.settings.count && kind !== 'character-reference') return;
    const task = createGenerationTask(project, kind); dispatch({ type: 'update', patch: { generationTasks: [...project.generationTasks, task] } });
    downloadTask(task);
  }
  function downloadTask(task: GenerationTask) {
    const markdown = buildTaskMarkdown(project, task); downloadBlob(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), `${task.provider}-${task.kind}-${task.id.slice(0, 8)}.md`);
    dispatch({ type: 'update', patch: { generationTasks: project.generationTasks.map((item) => item.id === task.id ? { ...item, status: 'exported' } : item) } });
  }
  async function importTask(file: File) {
    const manifest = parseTaskMarkdown(await file.text());
    dispatch({ type: 'update', patch: (current) => ({ ...current, generationProvider: manifest.provider,
      settings: { ...current.settings, character: manifest.character, count: manifest.count as typeof current.settings.count, columns: manifest.columns },
      captionSlots: manifest.captions.map((item) => ({ id: crypto.randomUUID(), phraseId: `md-${item.index}`, text: item.text, category: 'MD 匯入', intent: item.intent, visible: item.visible })),
    }) });
  }
  return <section className="task-section panel"><div className="task-header"><div className="section-heading"><span>MD</span><div><h2>產圖任務</h2><p>目前平台：{project.generationProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'}</p></div></div>
    <div className="task-tools"><button className="ghost-button" onClick={()=>importRef.current?.click()}>匯入任務 MD</button><input ref={importRef} hidden type="file" accept=".md,text/markdown" onChange={(e)=>{const file=e.target.files?.[0];if(file)void importTask(file);}}/>
      <a className="ghost-button" href={providerUrl(project.generationProvider)} target="_blank" rel="noreferrer">開啟平台 ↗</a></div></div>
    <div className="task-actions">{available.map((kind) => <button key={kind} className="primary-button" disabled={kind!=='character-reference'&&project.captionSlots.length!==project.settings.count} onClick={() => create(kind)}>下載{labels[kind]} MD</button>)}</div>
    {project.generationTasks.length > 0 && <div className="task-list">{project.generationTasks.slice(-6).reverse().map((task) => <div key={task.id}><span>{task.provider === 'chatgpt' ? 'ChatGPT' : 'Gemini'} · {labels[task.kind]}</span><small>{task.status}</small><button onClick={() => downloadTask(task)}>重新下載</button></div>)}</div>}
    {project.generationAttempts.length>0&&<div className="attempt-list"><strong>匯入紀錄</strong>{project.generationAttempts.slice(-4).reverse().map((attempt)=><span key={attempt.id}>{attempt.provider} · {attempt.sourceHash.slice(0,10)} · {attempt.provenanceMark}</span>)}</div>}
  </section>;
}
