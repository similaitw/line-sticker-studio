# LINE Sticker Studio

LINE Sticker Studio 是一個以 **ChatGPT Plus＋GitHub 橋接** 為核心的 LINE 貼圖工作台。

網站負責角色設定、常用語、風格、候選格、切圖、繁體中文字後製、LINE 規格檢查與 ZIP 匯出；GitHub 負責傳遞產圖任務與狀態；ChatGPT 負責實際產圖。

正式站：[https://linesticker-ten.vercel.app](https://linesticker-ten.vercel.app)

## 主要流程

1. 在 LINE Sticker Studio 設定角色、參考照片、貼圖張數、文字與風格。
2. 按「建立 GitHub 產圖任務」。
3. 網站開啟 GitHub Issue，新任務內含完整 manifest。
4. 在這個已連接 GitHub 的 ChatGPT 對話輸入：

   `處理最新 LINE 貼圖任務`

5. ChatGPT 直接讀取 GitHub 最新任務並產生候選貼圖圖。
6. 有人物／寵物參考照片時，照片直接上傳到 ChatGPT 對話，不公開放到 GitHub。
7. 將 ChatGPT 產出的 PNG 匯回 LINE Sticker Studio。
8. 網站自動切割、套用繁體中文、選圖、驗證。
9. 匯出 LINE ZIP。

## 為什麼用 GitHub 當橋樑？

這個架構不使用 Chat2Code，也不需要 OpenAI 圖片 API Key。

GitHub 負責：

- 任務佇列
- Task ID
- Manifest
- 貼圖文字與動作
- 角色／風格設定
- 任務狀態
- 歷史紀錄

ChatGPT 則可以透過已連接的 GitHub 直接讀取與更新這些任務。

## GitHub Job 格式

每個 Job 會建立 GitHub Issue，包含：

- `taskId`
- `stickerType`
- `targetCount`
- `rows / columns`
- character
- style
- captions
- reference photo filenames
- output spec
- LINE_STICKER_TASK_MANIFEST

例如：

```text
[LINE Sticker Job] 我的 LINE 貼圖 · c672b47b

status: ready
taskId: c672b47b-...
3 × 3 candidates
target: 8 stickers
```

## ChatGPT 呼叫方式

在 ChatGPT 直接輸入：

```text
處理最新 LINE 貼圖任務
```

或指定：

```text
處理 GitHub LINE Sticker Job #123
```

ChatGPT 應：

1. 從 `similaitw/line-sticker-studio` 讀取 Job。
2. 解析 `LINE_STICKER_TASK_MANIFEST`。
3. 檢查是否需要參考照片。
4. 若需要照片，確認目前對話已有對應照片。
5. 依 manifest 產生貼圖候選圖。
6. 更新 GitHub Issue 狀態。

## 隱私原則

目前 `similaitw/line-sticker-studio` 是 public repository，因此：

- GitHub Job 可以存放文字規格與照片檔名。
- **人物、家人、學生、寵物等實際照片不自動上傳 GitHub。**
- 參考照片保留在瀏覽器 IndexedDB。
- 真正產圖時，由使用者直接把照片上傳到 ChatGPT 對話。

若未來建立 private Job repository，可再擴充成 GitHub 儲存參考素材。

## 為什麼 AI 不直接畫中文字？

為降低繁體中文錯字與字體不一致：

- AI 只畫角色、表情、動作。
- AI 不畫文字。
- 貼圖文字由 LINE Sticker Studio 在瀏覽器 Canvas 中後製。
- 可統一控制字型、字級與位置。

## 候選圖策略

預設使用 3×3 候選網格：

- 8 張 → 9 個候選
- 16 張 → 建議 2 批，共 18 個候選
- 24 張 → 建議 3 批，共 27 個候選
- 32 張 → 建議 4 批，共 36 個候選
- 40 張 → 建議 5 批，共 45 個候選

這比一次要求 AI 畫 24～40 格更容易維持角色一致性與切割品質。

## 常用語詞庫

目標規格：

- 每個分類 100 個常用語。
- 同類型可用（1）（2）（3）分組。
- 支援隨機抽取。
- 同一批貼圖不重複。
- 可混合多個分類。

## 原有功能

- 靜態、動態、自訂文字、訊息、大貼圖、彈出式、特效背景。
- 最多 5 張參考照片。
- 本機 IndexedDB 保存照片。
- 角色題材與風格配方。
- 台灣繁體中文詞庫。
- 候選圖自動切割。
- 每張貼圖人工入選／淘汰。
- APNG 時間軸。
- LINE 規格驗證。
- 專案備份。
- ZIP 匯出。
- Markdown 手動產圖流程仍保留作備援。

## 本機開發

需要 Node.js 22。

```bash
npm ci
npm run dev
```

## 驗證

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Vercel

- Framework：Vite
- Build Command：`npm run build`
- Output：`dist`
- Node.js：22

本架構不需要 OpenAI API Key 或 Gemini API Key。

## 目前限制

GitHub 可以作為文字任務與狀態橋樑，但目前 ChatGPT 產出的圖片檔無法由此對話直接 commit 成 GitHub repository 的二進位圖片。

因此現在的最後一步仍是：

```text
ChatGPT 產圖
→ 使用者下載 PNG
→ LINE Sticker Studio 匯入 PNG
→ 自動切圖／字幕／驗證／ZIP
```

若未來 ChatGPT／GitHub connector 開放直接寫入生成圖片，這一步可再自動化。

## License

MIT License。
