import type { GenerationProvider, ProvenanceMark, StickerAsset } from '../domain/types';

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('圖片載入失敗'));
    image.src = dataUrl;
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}

export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil(base64.length * 0.75);
}

export async function resizeDataUrl(dataUrl: string, width: number, height: number): Promise<string> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('瀏覽器不支援 Canvas');
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  return canvas.toDataURL('image/png');
}

export function createAsset(name: string, dataUrl: string, width: number, height: number, hasTransparency = true,
  provenanceMark: ProvenanceMark = 'unknown', sourceProvider?: GenerationProvider, visualHash?: string): StickerAsset {
  return { id: crypto.randomUUID(), name, dataUrl, width, height, bytes: dataUrlBytes(dataUrl), hasTransparency, provenanceMark, sourceProvider, visualHash };
}
