import { createAsset, loadImage } from './image';
import { ensureFontLoaded, fontStackFor } from '../domain/fonts';
import type { GenerationProvider, ProvenanceMark, StickerAsset } from '../domain/types';

interface SliceOptions {
  count: number; targetCount: number; rows: number; columns: number; padding: number;
  outputWidth: number; outputHeight: number;
  sliceGuides?: { x: number[]; y: number[] };
  overlayTexts?: { text: string; visible: boolean }[]; fontSize?: number; fontFamily?: string;
  provenanceMark?: ProvenanceMark; sourceProvider?: GenerationProvider;
}

export async function sliceSheet(dataUrl: string, options: SliceOptions): Promise<StickerAsset[]> {
  await ensureFontLoaded(options.fontFamily, 900);
  const image = await loadImage(dataUrl);
  const rows = options.rows;
  const xEdges = guideEdges(options.columns, image.naturalWidth, options.sliceGuides?.x);
  const yEdges = guideEdges(rows, image.naturalHeight, options.sliceGuides?.y);
  const assets: StickerAsset[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = options.outputWidth; canvas.height = options.outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('瀏覽器不支援 Canvas');
    const col = index % options.columns;
    const row = Math.floor(index / options.columns);
    const sourceX = Math.min(xEdges[col + 1] - 1, xEdges[col] + options.padding);
    const sourceY = Math.min(yEdges[row + 1] - 1, yEdges[row] + options.padding);
    const cropWidth = Math.max(1, xEdges[col + 1] - xEdges[col] - options.padding * 2);
    const cropHeight = Math.max(1, yEdges[row + 1] - yEdges[row] - options.padding * 2);
    drawTrimmedSticker(ctx, image, sourceX, sourceY, cropWidth, cropHeight, options.outputWidth, options.outputHeight);
    const caption = options.overlayTexts?.[index];
    if (caption?.visible && caption.text) drawOverlayText(ctx, caption.text, options.outputWidth, options.outputHeight, options.fontSize ?? 42, options.fontFamily ?? 'Noto Sans TC');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasTransparency = false;
    for (let offset = 3; offset < pixels.length; offset += 4) {
      if (pixels[offset] < 255) { hasTransparency = true; break; }
    }
    const output = canvas.toDataURL('image/png');
    const visualHash = averageHash(ctx, canvas.width, canvas.height);
    assets.push(createAsset(`${String(index + 1).padStart(2, '0')}.png`, output, options.outputWidth, options.outputHeight, hasTransparency,
      options.provenanceMark ?? 'unknown', options.sourceProvider, visualHash, index, index < options.targetCount, index < options.targetCount ? index + 1 : undefined));
  }
  return assets;
}

export function createDefaultGuides(rows: number, columns: number): { x: number[]; y: number[] } {
  return {
    x: Array.from({ length: Math.max(0, columns - 1) }, (_, index) => (index + 1) / columns),
    y: Array.from({ length: Math.max(0, rows - 1) }, (_, index) => (index + 1) / rows),
  };
}

function guideEdges(count: number, size: number, guides: number[] | undefined): number[] {
  const defaults = createDefaultGuides(1, count).x;
  const normalized = (guides?.length === count - 1 ? guides : defaults)
    .map((value) => Math.min(.98, Math.max(.02, value))).sort((a, b) => a - b);
  return [0, ...normalized, 1].map((value) => Math.round(value * size));
}

function drawTrimmedSticker(
  ctx: CanvasRenderingContext2D, image: HTMLImageElement, sourceX: number, sourceY: number,
  cropWidth: number, cropHeight: number, outputWidth: number, outputHeight: number,
) {
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.ceil(cropWidth); cropCanvas.height = Math.ceil(cropHeight);
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) throw new Error('瀏覽器不支援 Canvas');
  cropCtx.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, cropCanvas.width, cropCanvas.height);
  const bounds = findContentBounds(cropCtx, cropCanvas.width, cropCanvas.height) ?? { x: 0, y: 0, width: cropCanvas.width, height: cropCanvas.height };
  const scale = Math.min(outputWidth / bounds.width, outputHeight / bounds.height);
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  ctx.drawImage(cropCanvas, bounds.x, bounds.y, bounds.width, bounds.height,
    (outputWidth - drawWidth) / 2, (outputHeight - drawHeight) / 2, drawWidth, drawHeight);
}

function findContentBounds(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let left = width; let right = -1; let top = height; let bottom = -1;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const offset = (y * width + x) * 4;
    const alpha = pixels[offset + 3];
    const red = pixels[offset]; const green = pixels[offset + 1]; const blue = pixels[offset + 2];
    const blankWhite = alpha > 240 && red > 248 && green > 248 && blue > 248;
    if (alpha > 12 && !blankWhite) {
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  return right >= left && bottom >= top ? { x: left, y: top, width: right - left + 1, height: bottom - top + 1 } : null;
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

function drawOverlayText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, fontSize: number, fontFamily: string) {
  ctx.save();
  ctx.font = `900 ${fontSize}px ${fontStackFor(fontFamily)}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, fontSize * 0.22); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#111827';
  const y = height - fontSize * 0.85;
  ctx.strokeText(text, width / 2, y, width * 0.86);
  ctx.fillText(text, width / 2, y, width * 0.86);
  ctx.restore();
}

export function drawSheetPreview(
  canvas: HTMLCanvasElement, image: HTMLImageElement, count: number, rows: number, columns: number,
  sliceGuides?: { x: number[]; y: number[] }, overlayTexts?: { text: string; visible: boolean }[], fontSize = 42, fontFamily = 'Noto Sans TC',
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.strokeStyle = 'rgba(15, 23, 42, .65)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  const guides = normalizeGuides(rows, columns, sliceGuides);
  const xEdges = [0, ...guides.x, 1].map((value) => value * canvas.width);
  const yEdges = [0, ...guides.y, 1].map((value) => value * canvas.height);
  for (let index = 0; index < count; index += 1) {
    const col = index % columns; const row = Math.floor(index / columns);
    ctx.strokeRect(xEdges[col], yEdges[row], xEdges[col + 1] - xEdges[col], yEdges[row + 1] - yEdges[row]);
    const caption = overlayTexts?.[index];
    if (caption?.visible && caption.text) drawPreviewOverlayText(ctx, caption.text, xEdges[col], yEdges[row], xEdges[col + 1] - xEdges[col], yEdges[row + 1] - yEdges[row], fontSize, fontFamily);
  }
  ctx.setLineDash([]); ctx.strokeStyle = 'rgba(6, 199, 85, .95)'; ctx.lineWidth = 4;
  for (const value of guides.x) { const x = value * canvas.width; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (const value of guides.y) { const y = value * canvas.height; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  ctx.restore();
}

function drawPreviewOverlayText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, fontSize: number, fontFamily: string) {
  ctx.save();
  const scaledSize = Math.min(56, Math.max(16, fontSize * width / 370));
  ctx.font = `900 ${scaledSize}px ${fontStackFor(fontFamily)}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.setLineDash([]);
  ctx.lineWidth = Math.max(4, scaledSize * 0.2); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#111827';
  ctx.shadowColor = 'rgba(15, 23, 42, .22)'; ctx.shadowBlur = Math.max(2, scaledSize * 0.08); ctx.shadowOffsetY = 2;
  const textY = y + height - scaledSize * 0.85;
  ctx.strokeText(text, x + width / 2, textY, width * 0.84);
  ctx.fillText(text, x + width / 2, textY, width * 0.84);
  ctx.restore();
}

export function normalizeGuides(rows: number, columns: number, guides?: { x: number[]; y: number[] }): { x: number[]; y: number[] } {
  const defaults = createDefaultGuides(rows, columns);
  return {
    x: sanitizeGuides(guides?.x, columns - 1, defaults.x),
    y: sanitizeGuides(guides?.y, rows - 1, defaults.y),
  };
}

function sanitizeGuides(values: number[] | undefined, count: number, defaults: number[]): number[] {
  if (!values || values.length !== count) return defaults;
  return values.map((value) => Math.min(.98, Math.max(.02, value))).sort((a, b) => a - b);
}
