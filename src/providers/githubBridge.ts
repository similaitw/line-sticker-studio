import { buildTaskManifest, createGenerationTask } from './tasks';
import type { GenerationTask, StickerProject } from '../domain/types';

export const GITHUB_REPOSITORY = 'similaitw/line-sticker-studio';

export function createGithubBridgeTask(project: StickerProject): { task: GenerationTask; body: string; issueUrl: string } {
  const task = createGenerationTask({ ...project, generationProvider: 'chatgpt' });
  const manifest = buildTaskManifest({ ...project, generationProvider: 'chatgpt' }, task);
  const compactManifest = JSON.stringify(manifest);
  const photos = manifest.referencePhotos?.length
    ? manifest.referencePhotos.map((photo, index) => `- ${index + 1}. ${photo.name}${photo.primary ? '（主要參考）' : ''}`).join('\n')
    : '- 無參考照片';

  const captions = manifest.captions
    .map((item) => `| ${String(item.index).padStart(2, '0')} | ${item.visible ? item.text : '無文字'} | ${item.intent} |`)
    .join('\n');

  const body = `## LINE Sticker Studio Job

**狀態：** ready  
**Task ID：** \`${task.id}\`  
**來源：** LINE Sticker Studio → GitHub → ChatGPT  
**目標：** 產生 ${manifest.cellCount} 張候選圖，最後選 ${manifest.targetCount ?? manifest.count} 張。

<!-- LINE_STICKER_TASK_MANIFEST
${compactManifest}
END_LINE_STICKER_TASK_MANIFEST -->

### 參考照片

${photos}

> 為避免人物／私人照片公開，網站不會把參考照片上傳到 GitHub。若本任務需要照片，請在 ChatGPT 對話中另外上傳同名照片後再執行。

### 角色與風格

- Character：${manifest.character}
- Style：${manifest.style}
- AI 不繪製文字；繁體中文字由 LINE Sticker Studio 本機後製。
- 不要加入 logo、浮水印、簽名、廣告或受保護角色。

### 候選格

| # | 本機文字 | 動作／情緒 |
|---|---|---|
${captions}

### ChatGPT 執行方式

在已連接此 GitHub repository 的 ChatGPT 對話輸入：

\`處理最新 LINE 貼圖任務\`

ChatGPT 應讀取最新 open 的 LINE Sticker Job，解析 manifest，確認必要參考照片已在目前對話，然後產生要求的貼圖候選圖。

產圖完成後，將本 Issue 狀態更新為 \`image-generated\`。產生的圖片仍在 ChatGPT 對話中，由使用者匯回 LINE Sticker Studio 進行切圖與 LINE 規格驗證。
`;

  const title = `[LINE Sticker Job] ${project.name} · ${task.id.slice(0, 8)}`;
  const issueUrl = `https://github.com/${GITHUB_REPOSITORY}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  return { task, body, issueUrl };
}
