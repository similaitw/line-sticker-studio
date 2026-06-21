import { getSpec } from '../domain/specs';
import { stylePrompt } from '../domain/styles';
import type { GenerationProvider, GenerationTask, StickerProject, TaskKind } from '../domain/types';

export interface TaskManifest {
  schema: 'line-sticker-task/v1'; taskId: string; provider: GenerationProvider; kind: TaskKind;
  stickerType: StickerProject['type']; count: number; columns: number; rows: number;
  character: string; style: string; captions: { index: number; text: string; intent: string; visible: boolean }[];
  output: { format: 'PNG'; transparent: true; width: number; height: number; frames?: { min: number; max: number; maxDurationMs: number } };
}

const PROVIDERS = {
  chatgpt: { label: 'ChatGPT', url: 'https://chatgpt.com/', steps: 'Upload this Markdown file and the supplied reference images, then ask ChatGPT to create the image.' },
  gemini: { label: 'Gemini', url: 'https://gemini.google.com/', steps: 'Open Gemini, choose Add files → Create image, upload this Markdown and the supplied reference images, then submit.' },
} as const;

export function createGenerationTask(project: StickerProject, kind: TaskKind, stickerId?: string): GenerationTask {
  return { id: crypto.randomUUID(), kind, provider: project.generationProvider, stickerId, status: 'ready', createdAt: Date.now() };
}

export function buildTaskManifest(project: StickerProject, task: GenerationTask): TaskManifest {
  const spec = getSpec(project.type); const animation = task.kind !== 'sticker-sheet' && task.kind !== 'character-reference';
  const effectSize = task.kind === 'popup-frames' || task.kind === 'effect-frames';
  return {
    schema: 'line-sticker-task/v1', taskId: task.id, provider: task.provider, kind: task.kind,
    stickerType: project.type, count: task.kind === 'sticker-sheet' ? project.settings.count : 1,
    columns: task.kind === 'sticker-sheet' ? project.settings.columns : animation ? 4 : 1,
    rows: task.kind === 'sticker-sheet' ? Math.ceil(project.settings.count / project.settings.columns) : animation ? 5 : 1,
    character: project.settings.character, style: stylePrompt(project.styleRecipe),
    captions: project.captionSlots.slice(0, project.settings.count).map((item, index) => ({ index: index + 1, text: item.text, intent: item.intent, visible: item.visible })),
    output: { format: 'PNG', transparent: true, width: effectSize ? 480 : animation ? spec.width : 1024,
      height: effectSize ? 480 : animation ? spec.height : 1024,
      frames: animation ? { min: spec.minFrames ?? 5, max: spec.maxFrames ?? 20, maxDurationMs: spec.maxDurationMs ?? 4000 } : undefined },
  };
}

export function buildTaskMarkdown(project: StickerProject, task: GenerationTask): string {
  const manifest = buildTaskManifest(project, task); const provider = PROVIDERS[task.provider];
  const captions = manifest.captions.map((item) => `| ${String(item.index).padStart(2, '0')} | ${item.visible ? item.text : '無文字'} | ${item.intent} |`).join('\n');
  const kindText: Record<TaskKind, string> = {
    'character-reference': 'Create one canonical full-body character reference on a transparent background.',
    'sticker-sheet': `Create exactly ${manifest.count} separate sticker illustrations in a ${manifest.columns} × ${manifest.rows} grid.`,
    'animation-frames': 'Create a coherent animation frame sheet for the selected sticker.',
    'popup-frames': 'Create foreground pop-up animation frames for the selected sticker.',
    'effect-frames': 'Create full-chat-background effect animation frames for the selected sticker.',
  };
  return `# LINE Sticker Studio — ${provider.label} 產圖任務\n\n${provider.steps}\n\n<!-- LINE_STICKER_TASK_MANIFEST\n${JSON.stringify(manifest, null, 2)}\nEND_LINE_STICKER_TASK_MANIFEST -->\n\n## Task\n\n${kindText[task.kind]}\n\n- Character: ${manifest.character}\n- Style: ${manifest.style}\n- Output: transparent PNG, no background rectangle.\n- Keep the character's face, colors, clothing and proportions consistent.\n- Do not draw any caption text. The app will typeset Traditional Chinese locally.\n- Do not include logos, brands, watermarks, signatures, advertisements or protected characters.\n- Keep every subject centered, fully visible and separated from adjacent cells.\n\n## Sticker intents\n\n| # | Local caption | Pose / emotion intent |\n|---|---|---|\n${captions}\n\n## Return protocol\n\nReturn only the requested image. Do not add a mockup, frame, caption, checkerboard background or explanatory text inside the image.\n`;
}

export function parseTaskMarkdown(markdown: string): TaskManifest {
  const match = markdown.match(/<!-- LINE_STICKER_TASK_MANIFEST\n([\s\S]*?)\nEND_LINE_STICKER_TASK_MANIFEST -->/);
  if (!match) throw new Error('找不到 LINE Sticker 任務 manifest');
  const value = JSON.parse(match[1]) as TaskManifest;
  if (value.schema !== 'line-sticker-task/v1' || !value.taskId) throw new Error('不支援的任務格式');
  return value;
}

export function providerUrl(provider: GenerationProvider): string { return PROVIDERS[provider].url; }
