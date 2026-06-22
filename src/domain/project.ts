import { getSpec } from './specs';
import type { CaptionSlot, StickerProject, StickerType, StyleRecipe } from './types';

const DEFAULT_CAPTIONS = ['收到', 'OK', '謝謝', '加油', '等一下', '太棒了', '哭哭', '晚安', '讚啦'];

export const DEFAULT_STYLE: StyleRecipe = {
  primary: 'mascot', palette: 'vivid', outline: 'bold', rendering: 'soft', shape: 'rounded',
};

function slot(text: string, index: number): CaptionSlot {
  return { id: crypto.randomUUID(), phraseId: `legacy-${index}`, text, category: '基本回應', intent: text, visible: true };
}

export function createProject(type: StickerType = 'static'): StickerProject {
  const spec = getSpec(type);
  return {
    version: 4, name: '我的 LINE 貼圖', type, generationProvider: 'chatgpt',
    settings: { character: '一隻圓滾滾的台灣黑熊，上班族襯衫，表情誇張可愛', count: spec.counts[0], rows: 3, columns: 3, padding: 10, fontSize: 42, loops: spec.minLoops ?? 1 },
    captionSlots: DEFAULT_CAPTIONS.map(slot), styleRecipe: DEFAULT_STYLE,
    referencePhotos: [], photoRightsConfirmed: false,
    sourceDataUrl: '', stickers: [], animationSets: {}, generationTasks: [], generationAttempts: [],
    rightsConfirmed: false, complianceReport: { checkedAt: 0, blockingCount: 0, warningCount: 0 }, updatedAt: Date.now(),
  };
}

export function changeProjectType(project: StickerProject, type: StickerType): StickerProject {
  const spec = getSpec(type);
  return { ...project, type, settings: { ...project.settings,
    count: spec.counts.includes(project.settings.count) ? project.settings.count : spec.counts[0],
    loops: Math.min(spec.maxLoops ?? 1, Math.max(spec.minLoops ?? 1, project.settings.loops)),
  }, stickers: [], animationSets: {}, updatedAt: Date.now() };
}

export function serializeProject(project: StickerProject): string {
  return JSON.stringify({ ...project, updatedAt: Date.now() });
}

interface V2Project {
  version: 2; name: string; type: StickerType; settings: { character: string; phrases: string; count: StickerProject['settings']['count']; columns: number; padding: number; fontSize: number; loops: number };
  sourceDataUrl: string; stickers: StickerProject['stickers']; frames?: StickerProject['animationSets'][string]; updatedAt: number;
}

interface V3Project extends Omit<StickerProject, 'version' | 'settings' | 'referencePhotos' | 'photoRightsConfirmed'> {
  version: 3; settings: Omit<StickerProject['settings'], 'rows'>;
}

export function migrateV2(value: V2Project): StickerProject {
  const base = createProject(value.type);
  const phrases = String(value.settings.phrases || '').split(',').map((item) => item.trim()).filter(Boolean);
  const stickers = (value.stickers || []).map((asset, index) => ({ ...asset, provenanceMark: asset.provenanceMark ?? 'unknown' as const,
    gridIndex: index, included: index < value.settings.count, selectedAt: index < value.settings.count ? index + 1 : undefined }));
  const firstId = stickers[0]?.id;
  return { ...base, name: value.name, settings: { ...base.settings, character: value.settings.character, count: value.settings.count, columns: value.settings.columns, padding: value.settings.padding, fontSize: value.settings.fontSize, loops: value.settings.loops },
    captionSlots: phrases.map(slot), sourceDataUrl: value.sourceDataUrl, stickers,
    animationSets: firstId && value.frames?.length ? { [firstId]: value.frames } : {}, updatedAt: value.updatedAt };
}

export function migrateV3(value: V3Project): StickerProject {
  const base = createProject(value.type);
  const count = value.settings.count;
  const columns = Math.min(8, Math.max(2, value.settings.columns || 3));
  const rows = Math.min(8, Math.max(2, Math.ceil(count / columns)));
  return { ...value, version: 4, settings: { ...value.settings, rows, columns },
    captionSlots: fillCaptionSlots(value.captionSlots, rows * columns),
    stickers: value.stickers.map((asset, index) => ({ ...asset, gridIndex: index, included: index < count, selectedAt: index < count ? index + 1 : undefined })),
    referencePhotos: [], photoRightsConfirmed: false,
    complianceReport: value.complianceReport ?? base.complianceReport };
}

export function fillCaptionSlots(items: CaptionSlot[], count: number): CaptionSlot[] {
  const result = items.slice(0, count);
  for (let index = result.length; index < count; index += 1) result.push(slot(DEFAULT_CAPTIONS[index % DEFAULT_CAPTIONS.length], index));
  return result;
}

export const RECOMMENDED_GRIDS: Record<number, { rows: number; columns: number }> = {
  8: { rows: 3, columns: 3 }, 16: { rows: 4, columns: 4 }, 24: { rows: 4, columns: 6 },
  32: { rows: 4, columns: 8 }, 40: { rows: 5, columns: 8 },
};

export function parseProject(raw: string): StickerProject {
  const value = JSON.parse(raw) as StickerProject | V3Project | V2Project;
  if (value.version === 2) return migrateV2(value);
  if (value.version === 3) return migrateV3(value);
  if (value.version !== 4 || !value.type || !value.settings) throw new Error('不支援的專案格式');
  return value;
}
