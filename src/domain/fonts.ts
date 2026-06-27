export interface FontOption {
  id: string;
  label: string;
  category: '標準黑體' | '圓體可愛' | '明體優雅' | '手寫感' | '像素／遊戲' | '日系補充';
  fontFamily: string;
  fontStack: string;
  googleFamily?: string;
  weights: number[];
  license: string;
  sourceUrl: string;
  recommendedUse: string;
}

export interface ExternalFontCandidate {
  label: string;
  license: string;
  sourceUrl: string;
  recommendedUse: string;
}

const FALLBACK_FONT = '"Noto Sans TC", system-ui, sans-serif';

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'noto-sans-tc', label: '思源黑體 Noto Sans TC', category: '標準黑體', fontFamily: 'Noto Sans TC',
    fontStack: '"Noto Sans TC", system-ui, sans-serif', googleFamily: 'Noto Sans TC',
    weights: [400, 500, 700, 900], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/noto/specimen/Noto+Sans+TC', recommendedUse: '最穩定的繁中通用字型，適合預設與大量文字。',
  },
  {
    id: 'chiron-hei-hk', label: '昭源黑體 Chiron Hei HK', category: '標準黑體', fontFamily: 'Chiron Hei HK',
    fontStack: '"Chiron Hei HK", "Noto Sans TC", system-ui, sans-serif', googleFamily: 'Chiron Hei HK',
    weights: [400, 700, 900], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/Chiron+Hei+HK', recommendedUse: '黑體筆畫更硬朗，適合清楚、有力的貼圖文字。',
  },
  {
    id: 'huninn', label: '粉圓體 Huninn', category: '圓體可愛', fontFamily: 'Huninn',
    fontStack: '"Huninn", "Noto Sans TC", system-ui, sans-serif', googleFamily: 'Huninn',
    weights: [400], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/Huninn', recommendedUse: '圓潤可愛，適合日常、療癒、寵物貼圖。',
  },
  {
    id: 'zen-maru-gothic', label: 'Zen Maru Gothic', category: '圓體可愛', fontFamily: 'Zen Maru Gothic',
    fontStack: '"Zen Maru Gothic", "Noto Sans TC", system-ui, sans-serif', googleFamily: 'Zen Maru Gothic',
    weights: [400, 700, 900], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/Zen+Maru+Gothic', recommendedUse: '日系圓體感，短字、可愛語氣很合適。',
  },
  {
    id: 'm-plus-rounded', label: 'M PLUS Rounded 1c', category: '圓體可愛', fontFamily: 'M PLUS Rounded 1c',
    fontStack: '"M PLUS Rounded 1c", "Noto Sans TC", system-ui, sans-serif', googleFamily: 'M PLUS Rounded 1c',
    weights: [400, 700, 900], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/M+PLUS+Rounded+1c', recommendedUse: '厚實圓體，適合強調 OK、收到、讚啦等短句。',
  },
  {
    id: 'noto-serif-tc', label: '思源宋體 Noto Serif TC', category: '明體優雅', fontFamily: 'Noto Serif TC',
    fontStack: '"Noto Serif TC", "Noto Sans TC", serif', googleFamily: 'Noto Serif TC',
    weights: [400, 700, 900], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/noto/specimen/Noto+Serif+TC', recommendedUse: '正式、復古、優雅語氣，適合節慶或禮貌貼圖。',
  },
  {
    id: 'lxgw-wenkai-tc', label: '霞鶩文楷 TC', category: '手寫感', fontFamily: 'LXGW WenKai TC',
    fontStack: '"LXGW WenKai TC", "Noto Sans TC", cursive', googleFamily: 'LXGW WenKai TC',
    weights: [400], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/LXGW+WenKai+TC', recommendedUse: '柔和手寫楷體，適合溫暖、安慰、文青風格。',
  },
  {
    id: 'iansui', label: '芫荽 Iansui', category: '手寫感', fontFamily: 'Iansui',
    fontStack: '"Iansui", "Noto Sans TC", cursive', googleFamily: 'Iansui',
    weights: [400], license: 'SIL Open Font License',
    sourceUrl: 'https://fonts.google.com/specimen/Iansui', recommendedUse: '自然手寫感，適合口語、台灣日常、輕鬆語氣。',
  },
  {
    id: 'kosugi-maru', label: 'Kosugi Maru', category: '日系補充', fontFamily: 'Kosugi Maru',
    fontStack: '"Kosugi Maru", "Noto Sans TC", system-ui, sans-serif', googleFamily: 'Kosugi Maru',
    weights: [400], license: 'Apache License 2.0',
    sourceUrl: 'https://fonts.google.com/specimen/Kosugi+Maru', recommendedUse: '日系清爽圓體，適合短標語和 Q 版貼圖。',
  },
];

export const EXTERNAL_FONT_CANDIDATES: ExternalFontCandidate[] = [
  {
    label: '台北黑體 Taipei Sans TC', license: 'SIL Open Font License',
    sourceUrl: 'https://sites.google.com/view/jtfoundry/zh-tw/downloads',
    recommendedUse: '台灣在地 UI 黑體；適合未來自託管加入。',
  },
  {
    label: '辰宇落雁體 ChenYuluoyan', license: 'SIL Open Font License 1.1',
    sourceUrl: 'https://github.com/Chenyu-otf/chenyuluoyan_thin',
    recommendedUse: '個性手寫風；適合少量文字，建議自託管或匯入。',
  },
  {
    label: '俐方體 11 號 Cubic 11', license: 'SIL Open Font License',
    sourceUrl: 'https://github.com/ACh-K/Cubic-11',
    recommendedUse: '像素遊戲風；檔案較特殊，建議後續以自託管方式加入。',
  },
];

const loadedFamilies = new Set<string>();

export function fontByFamily(fontFamily: string | undefined): FontOption {
  return FONT_OPTIONS.find((font) => font.fontFamily === fontFamily || font.id === fontFamily) ?? FONT_OPTIONS[0];
}

export function fontStackFor(fontFamily: string | undefined): string {
  return fontByFamily(fontFamily).fontStack || FALLBACK_FONT;
}

export function fontCssFamily(fontFamily: string | undefined): string {
  return fontByFamily(fontFamily).fontFamily;
}

export async function ensureFontLoaded(fontFamily: string | undefined, weight = 900): Promise<void> {
  if (typeof document === 'undefined') return;
  const font = fontByFamily(fontFamily);
  if (font.googleFamily && !loadedFamilies.has(font.googleFamily)) {
    const id = `gf-${font.id}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = googleFontsHref(font);
      document.head.appendChild(link);
    }
    loadedFamilies.add(font.googleFamily);
  }
  try {
    await document.fonts?.load(`${nearestWeight(font, weight)} 32px ${font.fontStack}`);
    await document.fonts?.ready;
  } catch {
    await document.fonts?.load(`900 32px ${FALLBACK_FONT}`).catch(() => undefined);
  }
}

function googleFontsHref(font: FontOption): string {
  const family = font.googleFamily ?? font.fontFamily;
  const weights = [...new Set(font.weights)].sort((a, b) => a - b).join(';');
  const suffix = weights ? `:wght@${weights}` : '';
  return `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}${suffix}&display=swap`;
}

function nearestWeight(font: FontOption, target: number): number {
  return font.weights.reduce((best, weight) => Math.abs(weight - target) < Math.abs(best - target) ? weight : best, font.weights[0] ?? target);
}
