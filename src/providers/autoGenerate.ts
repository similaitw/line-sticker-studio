import { buildTaskManifest, createGenerationTask } from './tasks';
import { getReferencePhoto } from '../storage/referencePhotos';
import type { StickerProject } from '../domain/types';

export interface AutomaticGenerationResult {
  dataUrl: string;
  provider: StickerProject['generationProvider'];
  model?: string;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('無法讀取參考照片'));
    reader.readAsDataURL(blob);
  });
}

function buildAutomaticPrompt(project: StickerProject): string {
  const manifest = buildTaskManifest(project, createGenerationTask(project));
  const captions = manifest.captions
    .map((item) => `${String(item.index).padStart(2, '0')}. ${item.intent}`)
    .join('\n');

  return `Create one LINE sticker candidate sheet.

SUBJECT
${manifest.character}

STYLE
${manifest.style}

LAYOUT
- Exact grid: ${manifest.columns} columns × ${manifest.rows} rows.
- Exactly ${manifest.cellCount} clearly separated candidate illustrations.
- One character/action per cell.
- Keep the same character identity, face, colors, clothing and proportions in every cell.
- Center each subject with generous transparent margin.
- Do not let subjects cross cell boundaries.
- Do not draw grid lines.

IMPORTANT TEXT RULE
- Do NOT render any words, letters, numbers, logos, signatures or watermarks.
- Traditional Chinese captions will be typeset locally after generation.

CELL INTENTS
${captions}

OUTPUT
- One square PNG sticker sheet.
- Transparent background when supported.
- Clean edges suitable for automatic slicing.
- No mockup, border, checkerboard, explanatory text or extra decoration outside the stickers.
- Do not imitate a named artist or copyrighted character.`;
}

export async function generateStickerSheet(project: StickerProject): Promise<AutomaticGenerationResult> {
  const cellCount = project.settings.rows * project.settings.columns;
  if (project.captionSlots.length !== cellCount) {
    throw new Error(`每個候選格都需要動作／語意，目前 ${project.captionSlots.length}/${cellCount}`);
  }
  if (project.referencePhotos.length && !project.photoRightsConfirmed) {
    throw new Error('請先確認參考照片使用權與肖像同意');
  }

  const references: { name: string; type: string; dataUrl: string }[] = [];
  for (const photo of [...project.referencePhotos].sort((a, b) => a.order - b.order)) {
    const blob = await getReferencePhoto(photo.id);
    if (!blob) throw new Error(`找不到參考照片：${photo.name}`);
    references.push({ name: photo.name, type: photo.type, dataUrl: await blobToDataUrl(blob) });
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      provider: project.generationProvider,
      prompt: buildAutomaticPrompt(project),
      references,
    }),
  });

  const payload = await response.json() as { dataUrl?: string; provider?: StickerProject['generationProvider']; model?: string; error?: string };
  if (!response.ok || !payload.dataUrl) throw new Error(payload.error || 'AI 產圖失敗');
  return {
    dataUrl: payload.dataUrl,
    provider: payload.provider ?? project.generationProvider,
    model: payload.model,
  };
}
