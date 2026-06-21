import { loadImage } from '../canvas/image';
import type { AnimationFrame } from '../domain/types';

export async function encodeApng(frames: AnimationFrame[], width: number, height: number): Promise<Blob> {
  if (!frames.length) throw new Error('尚未加入動畫影格');
  const buffers: ArrayBuffer[] = [];
  for (const frame of frames) {
    const image = await loadImage(frame.dataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('瀏覽器不支援 Canvas');
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale; const h = image.naturalHeight * scale;
    ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
    buffers.push(ctx.getImageData(0, 0, width, height).data.buffer);
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/apng.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: ArrayBuffer; error?: string }>) => {
      worker.terminate();
      if (event.data.ok && event.data.result) resolve(new Blob([event.data.result], { type: 'image/png' }));
      else reject(new Error(event.data.error ?? 'APNG 編碼失敗'));
    };
    worker.onerror = () => { worker.terminate(); reject(new Error('APNG Worker 執行失敗')); };
    worker.postMessage({ buffers, width, height, delays: frames.map((frame) => frame.delayMs) }, { transfer: buffers });
  });
}
