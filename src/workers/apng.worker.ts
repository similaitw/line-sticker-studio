/// <reference lib="webworker" />
import UPNG from 'upng-js';

interface EncodeMessage { buffers: ArrayBuffer[]; width: number; height: number; delays: number[] }

self.onmessage = (event: MessageEvent<EncodeMessage>) => {
  try {
    const { buffers, width, height, delays } = event.data;
    const result = UPNG.encode(buffers, width, height, 0, delays);
    self.postMessage({ ok: true, result }, { transfer: [result] });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : 'APNG 編碼失敗' });
  }
};

export {};
