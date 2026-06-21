import { PHRASE_CATEGORIES, PHRASE_LIBRARY } from './phrases';
import { STYLE_OPTIONS } from './styles';

describe('文字與風格庫', () => {
  it('至少提供 28 類與 300 組文字', () => {
    expect(PHRASE_CATEGORIES.length).toBeGreaterThanOrEqual(28);
    expect(PHRASE_LIBRARY.length).toBeGreaterThanOrEqual(300);
  });
  it('風格配方每個維度都有選項', () => {
    expect(Object.values(STYLE_OPTIONS).every((options) => options.length >= 5)).toBe(true);
  });
});
