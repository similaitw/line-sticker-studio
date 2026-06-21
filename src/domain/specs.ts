import type { StickerSpec, StickerType } from './types';

export const STICKER_SPECS: Record<StickerType, StickerSpec> = {
  static: {
    type: 'static', label: '靜態貼圖', shortLabel: '靜態',
    description: '日常使用的透明 PNG 貼圖', counts: [8, 16, 24, 32, 40],
    width: 370, height: 320, animated: false, secondaryAnimation: false, accent: '#06c755',
  },
  animated: {
    type: 'animated', label: '動態貼圖', shortLabel: '動態',
    description: '最長 4 秒的 APNG 動畫貼圖', counts: [8, 16, 24],
    width: 320, height: 270, animated: true, secondaryAnimation: false,
    maxDurationMs: 4000, minFrames: 5, maxFrames: 20, minLoops: 1, maxLoops: 4, accent: '#0ea5e9',
  },
  custom: {
    type: 'custom', label: '自訂文字貼圖', shortLabel: '自訂',
    description: '預留可由購買者替換的姓名或短文字區', counts: [8, 16, 24, 32, 40],
    width: 370, height: 320, animated: false, secondaryAnimation: false, accent: '#8b5cf6',
  },
  message: {
    type: 'message', label: '訊息貼圖', shortLabel: '訊息',
    description: '可輸入多行訊息的留白版型', counts: [8, 16, 24],
    width: 370, height: 320, animated: false, secondaryAnimation: false, accent: '#f59e0b',
  },
  big: {
    type: 'big', label: '大貼圖', shortLabel: '大貼圖',
    description: '適合直式角色與全身動作的大尺寸貼圖', counts: [8, 16, 24, 32, 40],
    width: 396, height: 660, minWidth: 80, minHeight: 524,
    animated: false, secondaryAnimation: false, accent: '#ec4899',
  },
  popup: {
    type: 'popup', label: '彈出式貼圖', shortLabel: '彈出',
    description: '傳送時在聊天室前景播放動畫', counts: [8, 16, 24],
    width: 370, height: 320, animated: true, secondaryAnimation: true,
    maxDurationMs: 3000, minFrames: 5, maxFrames: 20, minLoops: 1, maxLoops: 3, accent: '#f97316',
  },
  effect: {
    type: 'effect', label: '特效背景貼圖', shortLabel: '背景',
    description: '在聊天室背景播放全畫面特效', counts: [8, 16, 24],
    width: 370, height: 320, animated: true, secondaryAnimation: true,
    maxDurationMs: 3000, minFrames: 5, maxFrames: 20, minLoops: 1, maxLoops: 3, accent: '#14b8a6',
  },
};

export const STICKER_TYPES = Object.keys(STICKER_SPECS) as StickerType[];

export function getSpec(type: StickerType): StickerSpec {
  return STICKER_SPECS[type];
}
