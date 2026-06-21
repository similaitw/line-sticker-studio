import { createAsset, loadImage } from './image';
import type { GenerationProvider, ProvenanceMark, StickerAsset } from '../domain/types';

interface SliceOptions {
  count: number; columns: number; padding: number;
  outputWidth: number; outputHeight: number;
  overlayTexts?: { text: string; visible: boolean }[]; fontSize?: number;
  provenanceMark?: ProvenanceMark; sourceProvider?: GenerationProvider;
}

export async function sliceSheet(dataUrl: string, options: SliceOptions): Promise<StickerAsset[]> {
  const image = await loadImage(dataUrl);
  const rows = Math.ceil(options.count / options.columns);
  const cellWidth = image.naturalWidth / options.columns;
  const cellHeight = image.naturalHeight / rows;
  const assets: StickerAsset[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = options.outputWidth; canvas.height = options.outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('瀏覽器不支援 Canvas');
    const cropWidth = Math.max(1, cellWidth - options.padding * 2);
    const cropHeight = Math.max(1, cellHeight - options.padding * 2);
    const scale = Math.min(options.outputWidth / cropWidth, options.outputHeight / cropHeight);
    const drawWidth = cropWidth * scale;
    const drawHeight = cropHeight * scale;
    const col = index % options.columns;
    const row = Math.floor(index / options.columns);
    ctx.drawImage(image, col * cellWidth + options.padding, row * cellHeight + options.padding,
      cropWidth, cropHeight, (options.outputWidth - drawWidth) / 2, (options.outputHeight - drawHeight) / 2,
      drawWidth, drawHeight);
    const caption = options.overlayTexts?.[index];
    if (caption?.visible && caption.text) drawOverlayText(ctx, caption.text, options.outputWidth, options.outputHeight, options.fontSize ?? 42);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasTransparency = false;
    for (let offset = 3; offset < pixels.length; offset += 4) {
      if (pixels[offset] < 255) { hasTransparency = true; break; }
    }
    const output = canvas.toDataURL('image/png');
    const visualHash = averageHash(ctx, canvas.width, canvas.height);
    assets.push(createAsset(`${String(index + 1).padStart(2, '0')}.png`, output, options.outputWidth, options.outputHeight, hasTransparency,
      options.provenanceMark ?? 'unknown', options.sourceProvider, visualHash));
  }
  return assets;
}

function averageHash(ctx: CanvasRenderingContext2D, width: number, height: number): string {
  const values: number[] = [];
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) {
    const x = Math.min(width - 1, Math.floor((col + .5) * width / 8));
    const y = Math.min(height - 1, Math.floor((row + .5) * height / 8));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    values.push(pixel[3] < 20 ? 255 : pixel[0] * .299 + pixel[1] * .587 + pixel[2] * .114);
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value >= average ? '1' : '0').join('').match(/.{4}/g)?.map((bits) => Number.parseInt(bits, 2).toString(16)).join('') ?? '';
}

function drawOverlayText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, fontSize: number) {
  ctx.save();
  ctx.font = `900 ${fontSize}px "Noto Sans TC", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, fontSize * 0.22); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#111827';
  const y = height - fontSize * 0.85;
  ctx.strokeText(text, width / 2, y, width * 0.86);
  ctx.fillText(text, width / 2, y, width * 0.86);
  ctx.restore();
}

export function drawSheetPreview(
  canvas: HTMLCanvasElement, image: HTMLImageElement, count: number, columns: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rows = Math.ceil(count / columns);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.strokeStyle = 'rgba(15, 23, 42, .65)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  const cellWidth = canvas.width / columns; const cellHeight = canvas.height / rows;
  for (let index = 0; index < count; index += 1) {
    ctx.strokeRect((index % columns) * cellWidth, Math.floor(index / columns) * cellHeight, cellWidth, cellHeight);
  }
  ctx.restore();
}
