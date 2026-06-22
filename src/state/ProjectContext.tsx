import { createContext, useCallback, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { changeProjectType, createProject } from '../domain/project';
import { createProjectBackup, readProjectBackup } from '../storage/projectBackup';
import type { AnimationFrame, StickerAsset, StickerProject, StickerType } from '../domain/types';

interface HistoryState { past: StickerProject[]; present: StickerProject; future: StickerProject[] }
type ProjectPatch = Partial<StickerProject> | ((project: StickerProject) => StickerProject);
type Action =
  | { type: 'update'; patch: ProjectPatch }
  | { type: 'replace'; project: StickerProject }
  | { type: 'undo' }
  | { type: 'redo' };

function historyReducer(state: HistoryState, action: Action): HistoryState {
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state;
  }
  if (action.type === 'redo') {
    const next = state.future[0];
    return next ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) } : state;
  }
  const next = action.type === 'replace' ? action.project
    : typeof action.patch === 'function' ? action.patch(state.present) : { ...state.present, ...action.patch };
  return { past: [...state.past.slice(-29), state.present], present: { ...next, updatedAt: Date.now() }, future: [] };
}

interface ProjectContextValue {
  project: StickerProject;
  dispatch: Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
  updateSettings: (patch: Partial<StickerProject['settings']>) => void;
  setType: (type: StickerType) => void;
  setStickers: (stickers: StickerAsset[]) => void;
  setAnimationFrames: (stickerId: string, frames: AnimationFrame[]) => void;
  saveProject: () => Promise<void>;
  loadProject: (file: File) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, undefined, () => {
    const present = createProject();
    const saved = localStorage.getItem('line-sticker-provider');
    if (saved === 'chatgpt' || saved === 'gemini') present.generationProvider = saved;
    return { past: [], present, future: [] };
  });
  const project = state.present;

  const updateSettings = useCallback((patch: Partial<StickerProject['settings']>) => {
    dispatch({ type: 'update', patch: (current) => ({ ...current, settings: { ...current.settings, ...patch } }) });
  }, []);
  const setType = useCallback((type: StickerType) => dispatch({ type: 'update', patch: (current) => changeProjectType(current, type) }), []);
  const setStickers = useCallback((stickers: StickerAsset[]) => dispatch({ type: 'update', patch: { stickers } }), []);
  const setAnimationFrames = useCallback((stickerId: string, frames: AnimationFrame[]) => dispatch({ type: 'update', patch: (current) => ({
    ...current, animationSets: { ...current.animationSets, [stickerId]: frames },
  }) }), []);
  const saveProject = useCallback(async () => {
    const blob = await createProjectBackup(project);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${project.name}.line-sticker.zip`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [project]);
  const loadProject = useCallback(async (file: File) => {
    dispatch({ type: 'replace', project: await readProjectBackup(file) });
  }, []);

  const value = useMemo(() => ({
    project, dispatch, canUndo: state.past.length > 0, canRedo: state.future.length > 0,
    updateSettings, setType, setStickers, setAnimationFrames, saveProject, loadProject,
  }), [project, state.past.length, state.future.length, updateSettings, setType, setStickers, setAnimationFrames, saveProject, loadProject]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const value = useContext(ProjectContext);
  if (!value) throw new Error('useProject 必須在 ProjectProvider 中使用');
  return value;
}
