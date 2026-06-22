import { useRef, useState } from 'react';
import { downloadBlob } from '../export/exportZip';
import { buildTaskMarkdown, createGenerationTask, parseTaskMarkdown, providerUrl } from '../providers/tasks';
import type { TaskManifest } from '../providers/tasks';
import type { GenerationTask, StickerProject } from '../domain/types';
import { fillCaptionSlots } from '../domain/project';
import { getReferencePhoto } from '../storage/referencePhotos';
import { validateSubjectProfile } from '../domain/subjectDescription';
import { useProject } from '../state/ProjectContext';

export function TaskPanel() {
  const { project, dispatch } = useProject(); const importRef = useRef<HTMLInputElement>(null); const [error, setError] = useState('');
  const cellCount = project.settings.rows * project.settings.columns;
  async function create() {
    setError('');
    if (project.captionSlots.length !== cellCount) return setError(`每個候選格都需要文字／動作，目前 ${project.captionSlots.length}/${cellCount}`);
    const subjectIssues=validateSubjectProfile(project.subjectProfile,project.referencePhotos.length>0);if(subjectIssues.length)return setError(subjectIssues[0]);
    if (project.referencePhotos.length && !project.photoRightsConfirmed) return setError('請先確認參考照片使用權與肖像同意');
    for (const photo of project.referencePhotos) if (!await getReferencePhoto(photo.id)) return setError(`找不到參考照片：${photo.name}`);
    const task = createGenerationTask(project); const markdown = buildTaskMarkdown(project, task);
    downloadBlob(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), `${task.provider}-line-sticker-project-${task.id.slice(0, 8)}.md`);
    dispatch({ type: 'update', patch: { generationTasks: [...project.generationTasks, { ...task, status: 'exported' }] } });
  }
  function downloadTask(task: GenerationTask) {
    const markdown = buildTaskMarkdown(project, task); downloadBlob(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), `${task.provider}-line-sticker-project-${task.id.slice(0, 8)}.md`);
    dispatch({ type: 'update', patch: { generationTasks: project.generationTasks.map((item) => item.id === task.id ? { ...item, status: 'exported' } : item) } });
  }
  async function importTask(file: File) {
    try { const manifest = parseTaskMarkdown(await file.text()); const targetCount = (manifest.targetCount ?? manifest.count) as typeof project.settings.count; const cells = manifest.cellCount ?? manifest.count;
      dispatch({ type: 'update', patch: (current) => ({ ...current, generationProvider: manifest.provider,
        settings: { ...current.settings, character: manifest.character, count: targetCount, rows: manifest.rows, columns: manifest.columns },
        subjectProfile: mergeImportedSubject(current.subjectProfile, manifest),
        captionSlots: fillCaptionSlots(manifest.captions.map((item) => ({ id: crypto.randomUUID(), phraseId: `md-${item.index}`, text: item.text, category: 'MD 匯入', intent: item.intent, visible: item.visible })), cells),
      }) }); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'MD 匯入失敗'); }
  }
  return <section className="task-section panel"><div className="task-header"><div className="section-heading"><span>MD</span><div><h2>完整產圖任務</h2><p>{project.generationProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'} · 一份 MD 完成所有階段</p></div></div>
    <div className="task-tools"><button className="ghost-button" onClick={() => importRef.current?.click()}>匯入任務 MD</button><input ref={importRef} hidden type="file" accept=".md,text/markdown" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importTask(file); }} />
      <a className="ghost-button" href={providerUrl(project.generationProvider)} target="_blank" rel="noreferrer">開啟平台 ↗</a></div></div>
    <div className="task-actions"><button className="primary-button" onClick={() => void create()}>下載完整產圖 MD</button><span>下載後與 {project.referencePhotos.length} 張照片同次上傳</span></div>
    {error && <p className="photo-error">{error}</p>}
    {project.generationTasks.length > 0 && <div className="task-list">{project.generationTasks.slice(-6).reverse().map((task) => <div key={task.id}><span>{task.provider === 'chatgpt' ? 'ChatGPT' : 'Gemini'} · 完整任務</span><small>{task.status}</small><button onClick={() => downloadTask(task)}>重新下載</button></div>)}</div>}
    {project.generationAttempts.length > 0 && <div className="attempt-list"><strong>匯入紀錄</strong>{project.generationAttempts.slice(-4).reverse().map((attempt) => <span key={attempt.id}>{attempt.provider} · {attempt.sourceHash.slice(0, 10)} · {attempt.provenanceMark}</span>)}</div>}
  </section>;
}

export function mergeImportedSubject(current: StickerProject['subjectProfile'], manifest: TaskManifest): StickerProject['subjectProfile'] {
  const generated = manifest.generationSubject;
  if (!generated) return manifest.subjectProfile ?? { ...current, baseMode: 'custom', customSubject: '', roleId: 'none', personalityIds: [], propIds: [], extraDetails: manifest.character };
  const shared = { roleId: generated.roleId, personalityIds: generated.personalityIds, propIds: generated.propIds, extraDetails: generated.extraDetails };
  if (generated.source === 'photo') return { ...current, ...shared };
  if (generated.source === 'custom') return { ...current, ...shared, baseMode: 'custom', customSubject: generated.customSubject };
  return { ...current, ...shared, baseMode: 'catalog', categoryId: generated.categoryId, itemId: generated.itemId };
}
