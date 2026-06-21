import { expect, test } from '@playwright/test';

test('雙平台、七類貼圖與本機範例流程', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'LINE Sticker Studio' })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(7);
  await page.getByRole('button', { name: /Gemini/ }).click();
  await expect(page.getByText('目前平台：Gemini')).toBeVisible();
  await page.getByRole('tab', { name: /大貼圖/ }).click();
  await expect(page.getByText(/最大 396×660/)).toBeVisible();
  await page.getByRole('button', { name: '載入範例' }).click();
  await expect(page.getByText('已切割 8 張')).toBeVisible();
});
