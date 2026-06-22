import type { StickerAsset } from './types';

export function toggleCandidateSelection(stickers: StickerAsset[], id: string, targetCount: number): StickerAsset[] {
  const asset = stickers.find((item) => item.id === id); if (!asset) return stickers;
  if (asset.included) return stickers.map((item) => item.id === id ? { ...item, included: false, selectedAt: undefined } : item);
  let next = stickers;
  if (stickers.filter((item) => item.included).length >= targetCount) {
    const latest = [...stickers].filter((item) => item.included).sort((a, b) => (b.selectedAt ?? 0) - (a.selectedAt ?? 0))[0];
    next = next.map((item) => item.id === latest?.id ? { ...item, included: false, selectedAt: undefined } : item);
  }
  const selectedAt = Math.max(0, ...next.map((item) => item.selectedAt ?? 0)) + 1;
  return next.map((item) => item.id === id ? { ...item, included: true, selectedAt } : item);
}
