import { getSpec } from '../domain/specs';
import { stylePrompt } from '../domain/styles';
import type { GenerationProvider, GenerationTask, ReferencePhoto, StickerProject, TaskKind } from '../domain/types';

export interface TaskManifest {
  schema: 'line-sticker-task/v1' | 'line-sticker-task/v2'; taskId: string; provider: GenerationProvider; kind: TaskKind;
  stickerType: StickerProject['type']; count: number; targetCount?: number; columns: number; rows: number; cellCount?: number;
  character: string; style: string; captions: { index: number; text: string; intent: string; visible: boolean }[];
  referencePhotos?: Pick<ReferencePhoto, 'id' | 'name' | 'type' | 'width' | 'height' | 'hash' | 'primary'>[];
  deliverables?: { kind: 'sticker-sheet' | 'animation-frames' | 'popup-frames' | 'effect-frames'; description: string }[];
  output: { format: 'PNG'; transparent: true; width: number; height: number; frames?: { min: number; max: number; maxDurationMs: number } };
}

const PROVIDERS = {
  chatgpt: { label: 'ChatGPT', url: 'https://chatgpt.com/', steps: 'Select this Markdown file and every listed reference photo in the same upload action, then submit.' },
  gemini: { label: 'Gemini', url: 'https://gemini.google.com/', steps: 'Choose Add files → Create image, select this Markdown and every listed reference photo together, then submit.' },
} as const;

export function createGenerationTask(project: StickerProject, kind: TaskKind = 'project-generation'): GenerationTask {
  return { id: crypto.randomUUID(), kind, provider: project.generationProvider, status: 'ready', createdAt: Date.now() };
}

export function buildTaskManifest(project: StickerProject, task: GenerationTask): TaskManifest {
  const spec = getSpec(project.type); const cellCount = project.settings.rows * project.settings.columns;
  const animationKind = project.type === 'animated' ? 'animation-frames' : project.type === 'popup' ? 'popup-frames' : project.type === 'effect' ? 'effect-frames' : null;
  const deliverables: NonNullable<TaskManifest['deliverables']> = [{ kind: 'sticker-sheet', description: `Create ${cellCount} candidate illustrations in an exact ${project.settings.columns} column × ${project.settings.rows} row grid.` }];
  if (animationKind) deliverables.push({ kind: animationKind, description: `After the sticker sheet is approved, create coherent frame sheets for each selected sticker in this same conversation (${spec.minFrames}–${spec.maxFrames} frames, maximum ${spec.maxDurationMs} ms).` });
  return { schema: 'line-sticker-task/v2', taskId: task.id, provider: task.provider, kind: 'project-generation', stickerType: project.type,
    count: cellCount, targetCount: project.settings.count, columns: project.settings.columns, rows: project.settings.rows, cellCount,
    character: project.settings.character, style: stylePrompt(project.styleRecipe),
    captions: project.captionSlots.slice(0, cellCount).map((item, index) => ({ index: index + 1, text: item.text, intent: item.intent, visible: item.visible })),
    referencePhotos: project.referencePhotos.map(({ id, name, type, width, height, hash, primary }) => ({ id, name, type, width, height, hash, primary })),
    deliverables, output: { format: 'PNG', transparent: true, width: 1024, height: 1024,
      frames: animationKind ? { min: spec.minFrames ?? 5, max: spec.maxFrames ?? 20, maxDurationMs: spec.maxDurationMs ?? 4000 } : undefined } };
}

export function buildTaskMarkdown(project: StickerProject, task: GenerationTask): string {
  const manifest = buildTaskManifest(project, task); const provider = PROVIDERS[task.provider];
  const captions = manifest.captions.map((item) => `| ${String(item.index).padStart(2, '0')} | ${item.visible ? item.text : '無文字'} | ${item.intent} |`).join('\n');
  const photos = manifest.referencePhotos?.length ? manifest.referencePhotos.map((photo, index) => `- ${index + 1}. ${photo.name}${photo.primary ? '（主要參考）' : ''} — ${photo.width}×${photo.height}`).join('\n') : '- 無參考照片；依 Character 描述創作。';
  const deliverables = manifest.deliverables?.map((item, index) => `${index + 1}. ${item.description}`).join('\n') ?? '';
  return `# LINE Sticker Studio — ${provider.label} 完整產圖任務\n\n${provider.steps}\n\n<!-- LINE_STICKER_TASK_MANIFEST\n${JSON.stringify(manifest, null, 2)}\nEND_LINE_STICKER_TASK_MANIFEST -->\n\n## Reference photos\n\n${photos}\n\nTreat the uploaded photos only as identity and appearance references. Preserve recognizable facial features, hair or fur color, clothing and proportions while transforming them into the requested illustration style. Ignore photo backgrounds. Do not infer identity or sensitive attributes.\n\n## Character and style\n\n- Character: ${manifest.character}\n- Style: ${manifest.style}\n- Keep face, colors, clothing and proportions consistent across every cell and frame.\n- Do not imitate a named artist or protected character. Do not include logos, brands, watermarks, signatures or advertisements.\n- Do not draw caption text; LINE Sticker Studio will typeset Traditional Chinese locally.\n\n## Deliverables\n\n${deliverables}\n\nStart with deliverable 1 only. Return one transparent PNG sticker sheet with exactly ${manifest.columns} columns and ${manifest.rows} rows (${manifest.cellCount} separate candidates). Keep subjects centered, fully visible and separated. After I approve it, continue with later deliverables in this same conversation.\n\n## Candidate intents\n\n| # | Local caption | Pose / emotion intent |\n|---|---|---|\n${captions}\n\n## Return protocol\n\nReturn only the requested image. Do not add a mockup, frame, caption, checkerboard background or explanatory text inside the image.\n`;
}

export function parseTaskMarkdown(markdown: string): TaskManifest {
  const match = markdown.match(/<!-- LINE_STICKER_TASK_MANIFEST\n([\s\S]*?)\nEND_LINE_STICKER_TASK_MANIFEST -->/);
  if (!match) throw new Error('找不到 LINE Sticker 任務 manifest');
  const value = JSON.parse(match[1]) as TaskManifest;
  if (!['line-sticker-task/v1', 'line-sticker-task/v2'].includes(value.schema) || !value.taskId) throw new Error('不支援的任務格式');
  return value;
}

export function providerUrl(provider: GenerationProvider): string { return PROVIDERS[provider].url; }
