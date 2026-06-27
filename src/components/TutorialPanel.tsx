import { useEffect, useMemo, useState } from 'react';
import { getSpec } from '../domain/specs';
import { validateProject } from '../domain/validation';
import { useProject } from '../state/ProjectContext';

type TutorialMode = 'beginner' | 'animated';
type TutorialTarget = 'provider' | 'type' | 'photos' | 'phrases' | 'style' | 'tasks' | 'settings' | 'source' | 'results' | 'timeline' | 'validation' | 'export';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetView: TutorialTarget;
  tips: string;
  autoComplete: () => boolean;
  blocked?: () => string;
}

const STORAGE_KEY = 'line-sticker-tutorial-progress-v1';

export function TutorialPanel({ mode, onNavigate }: { mode: TutorialMode; onNavigate: (view: TutorialTarget) => void }) {
  const { project } = useProject();
  const [manualDone, setManualDone] = useState<Set<string>>(() => loadProgress());
  const spec = getSpec(project.type);
  const issues = useMemo(() => validateProject(project), [project]);
  const errors = issues.filter((issue) => issue.level === 'error');
  const cells = project.settings.rows * project.settings.columns;
  const included = project.stickers.filter((asset) => asset.included);
  const animated = spec.animated;
  const steps = mode === 'beginner'
    ? beginnerSteps(project, cells, included.length, errors.length)
    : animatedSteps(project, spec, included, errors.length);
  const doneCount = steps.filter((step) => step.autoComplete() || manualDone.has(step.id)).length;
  const percent = Math.round(doneCount / steps.length * 100);
  useEffect(() => saveProgress(manualDone), [manualDone]);
  function toggle(id: string) {
    setManualDone((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function reset() { setManualDone(new Set()); }
  return <section className="tutorial-panel panel">
    <div className="tutorial-hero"><div><span className="eyebrow">{mode === 'beginner' ? 'GET STARTED' : 'APNG GUIDE'}</span>
      <h2>{mode === 'beginner' ? '新手流程任務' : '動態貼圖任務'}</h2>
      <p>{mode === 'beginner' ? '照著任務完成平台、文字、產圖、切割與匯出。' : animated ? '檢查影格、時長、循環與合規項目。' : '目前是靜態類型，可先閱讀流程或前往切換動態貼圖。'}</p></div>
      <div className="tutorial-progress"><strong>{percent}%</strong><span>{doneCount}/{steps.length}</span></div></div>
    <div className="tutorial-bar"><span style={{ width: `${percent}%` }} /></div>
    <div className="tutorial-actions"><button className="ghost-button" onClick={reset}>重置教學進度</button></div>
    <div className="tutorial-list">{steps.map((step, index) => {
      const autoDone = step.autoComplete();
      const done = autoDone || manualDone.has(step.id);
      const blocked = step.blocked?.();
      return <article key={step.id} className={done ? 'tutorial-step done' : 'tutorial-step'}>
        <button className="tutorial-check" onClick={() => toggle(step.id)} aria-label={`${done ? '取消完成' : '標記完成'} ${step.title}`}>{done ? '✓' : index + 1}</button>
        <div><h3>{step.title}</h3><p>{step.description}</p><small>{blocked || step.tips}</small></div>
        <button className="mini-button" onClick={() => onNavigate(step.targetView)}>前往</button>
      </article>;
    })}</div>
  </section>;
}

function beginnerSteps(project: ReturnType<typeof useProject>['project'], cells: number, included: number, errorCount: number): TutorialStep[] {
  return [
    { id: 'beginner-provider', title: '選擇生成平台', description: '選 ChatGPT 或 Gemini，之後會產生對應 MD 任務。', targetView: 'provider', tips: '可隨時切換平台。', autoComplete: () => project.generationProvider === 'chatgpt' || project.generationProvider === 'gemini' },
    { id: 'beginner-type', title: '選擇貼圖類型', description: '先決定靜態、動態、大貼圖或其他 LINE 類型。', targetView: 'type', tips: '不同類型會影響尺寸、張數和動畫規則。', autoComplete: () => Boolean(project.type) },
    { id: 'beginner-settings', title: '設計角色與張數', description: '設定主體、張數、生成網格、文字大小與字型。', targetView: 'settings', tips: '建議先用預設 3×3 產 8 張。', autoComplete: () => project.settings.count > 0 && project.subjectProfile.extraDetails !== undefined },
    { id: 'beginner-phrases', title: '選文字與字型', description: '從常用詞庫套用短句，確認每格都有文字或動作。', targetView: 'phrases', tips: '可以用預設組合快速填滿。', autoComplete: () => project.captionSlots.length === cells && Boolean(project.settings.fontFamily) },
    { id: 'beginner-style', title: '選風格配方', description: '調整主風格、配色、描邊、上色與造型。', targetView: 'style', tips: '小太陽預覽會幫你看差異。', autoComplete: () => Object.values(project.styleRecipe).every(Boolean) },
    { id: 'beginner-task', title: '下載完整產圖 MD', description: '產出一份可上傳到 ChatGPT/Gemini 的完整任務。', targetView: 'tasks', tips: '下載後和參考照片一起丟給平台。', autoComplete: () => project.generationTasks.length > 0 },
    { id: 'beginner-source', title: '載入圖檔分割', description: '把平台產出的 PNG 載回工具並切割成候選貼圖。', targetView: 'source', tips: '可拖曳綠色切割線微調。', autoComplete: () => Boolean(project.sourceDataUrl) && project.stickers.length === cells },
    { id: 'beginner-results', title: '選入選貼圖', description: '從候選素材中挑滿 LINE 要求張數。', targetView: 'results', tips: '入選張數不足會阻擋匯出。', autoComplete: () => included === project.settings.count },
    { id: 'beginner-validation', title: '完成合規檢查', description: '確認素材權利、尺寸、透明度與平台標記。', targetView: 'validation', tips: '阻擋項目歸零後即可匯出。', autoComplete: () => project.stickers.length > 0 && errorCount === 0 },
    { id: 'beginner-export', title: '匯出 ZIP', description: '匯出可上傳 LINE Creators Market 的 ZIP。', targetView: 'export', tips: '匯出前會再次檢查阻擋項目。', autoComplete: () => project.stickers.length > 0 && errorCount === 0 },
  ];
}

function animatedSteps(project: ReturnType<typeof useProject>['project'], spec: ReturnType<typeof getSpec>, included: typeof project.stickers, errorCount: number): TutorialStep[] {
  const animated = spec.animated;
  const frameSets = included.map((asset) => project.animationSets[asset.id] ?? []);
  return [
    { id: 'animated-type', title: '切換到動態類型', description: '選擇動態、彈出式或特效背景貼圖。', targetView: 'type', tips: '動態類型才需要 APNG 影格。', autoComplete: () => animated },
    { id: 'animated-source', title: '匯入並選出貼圖', description: '先切割貼圖表並挑滿入選貼圖。', targetView: 'results', tips: '每張入選貼圖都會有自己的影格。', autoComplete: () => animated && included.length === project.settings.count, blocked: () => animated ? '' : '請先切換到動態類型。' },
    { id: 'animated-timeline', title: '進入動畫時間軸', description: '在時間軸選擇入選貼圖並加入影格。', targetView: 'timeline', tips: '每張入選貼圖都可以獨立編輯。', autoComplete: () => animated && included.length > 0 },
    { id: 'animated-frames', title: '加入影格', description: `每張貼圖需要 ${spec.minFrames ?? 5}–${spec.maxFrames ?? 20} 幀。`, targetView: 'timeline', tips: '使用 PNG/WebP 影格，工具會本機編 APNG。', autoComplete: () => animated && frameSets.length > 0 && frameSets.every((frames) => frames.length >= (spec.minFrames ?? 0)) },
    { id: 'animated-duration', title: '檢查總時長', description: `總播放時間不可超過 ${(spec.maxDurationMs ?? 0) / 1000} 秒。`, targetView: 'timeline', tips: '調整每幀 ms 可控制節奏。', autoComplete: () => animated && frameSets.length > 0 && frameSets.every((frames) => frames.length <= (spec.maxFrames ?? Infinity) && frames.reduce((sum, frame) => sum + frame.delayMs, 0) <= (spec.maxDurationMs ?? Infinity)) },
    { id: 'animated-loops', title: '確認循環次數', description: '依 LINE 規格設定播放循環。', targetView: 'settings', tips: `目前類型允許 ${spec.minLoops ?? 1}–${spec.maxLoops ?? 1} 次。`, autoComplete: () => animated && project.settings.loops >= (spec.minLoops ?? 1) && project.settings.loops <= (spec.maxLoops ?? 1) },
    { id: 'animated-validation', title: '通過合規後匯出', description: '確認影格數、時長、素材權利與入選張數。', targetView: 'validation', tips: '所有阻擋項目清掉後再匯出 ZIP。', autoComplete: () => animated && included.length > 0 && errorCount === 0 },
  ];
}

function loadProgress(): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    return new Set(Array.isArray(value) ? value : []);
  } catch { return new Set(); }
}

function saveProgress(value: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...value]));
}
