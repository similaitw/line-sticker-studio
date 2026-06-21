import { loadImage } from './image';
import type { GenerationProvider, ProvenanceMark } from '../domain/types';

export async function detectProvenanceMark(dataUrl: string, provider: GenerationProvider): Promise<ProvenanceMark> {
  if (provider !== 'gemini') return 'none';
  const image = await loadImage(dataUrl); const canvas = document.createElement('canvas');
  canvas.width = Math.min(image.naturalWidth, 1024); canvas.height = Math.min(image.naturalHeight, 1024);
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return 'unknown';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const x = Math.floor(canvas.width * .78); const y = Math.floor(canvas.height * .78);
  const data = ctx.getImageData(x, y, canvas.width - x, canvas.height - y).data;
  let brightOpaque = 0; let coloredBright = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a > 220 && r + g + b > 650) brightOpaque += 1;
    if (a > 220 && Math.max(r, g, b) - Math.min(r, g, b) > 70 && r + g + b > 480) coloredBright += 1;
  }
  const pixels = data.length / 4;
  return brightOpaque / pixels > .002 && coloredBright / pixels > .001 ? 'visible' : 'unknown';
}

export async function simpleHash(dataUrl: string): Promise<string> {
  const bytes = new TextEncoder().encode(dataUrl); const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((value) => value.toString(16).padStart(2, '0')).join('');
}
