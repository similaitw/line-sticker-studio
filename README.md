# LINE Sticker Studio

線上自動 LINE 貼圖製作工作台：在網站內完成角色／參考照片、常用語、風格與貼圖規格設定，直接呼叫 OpenAI 或 Gemini 圖片生成 API，自動產出候選貼圖表，再由瀏覽器完成切圖、繁體中文字後製、LINE 規格驗證與 ZIP 匯出。

正式站：[https://linesticker-ten.vercel.app](https://linesticker-ten.vercel.app)

## 產品目標

主要流程不再是「下載 MD → 手動到 ChatGPT/Gemini 產圖 → 再匯回網站」，而是：

1. 選角色或加入參考照片。
2. 選擇貼圖類型、張數、風格與常用語。
3. 在網站按「立即自動產生貼圖」。
4. Vercel Serverless Function 以伺服器端 API Key 呼叫 OpenAI / Gemini。
5. 回傳一張透明候選貼圖表。
6. 網站自動切圖並在本機加入繁體中文字。
7. 選取合法張數、完成合規檢查。
8. 匯出可提交 LINE Creators Market 的 ZIP。

原本的「完整產圖 MD」保留為備援模式，適合沒有 API Key、模型暫時不可用或想人工調整時使用。

## 主要功能

- 網站內直接自動產圖，不需手動搬運圖片。
- 支援 OpenAI Image API 與 Gemini Image API。
- API Key 僅存在 Vercel 伺服器端，不使用 `VITE_*` 暴露到瀏覽器。
- 最多 5 張人物、寵物或角色參考照片，本機 IndexedDB 保存。
- 靜態、動態、自訂文字、訊息、大貼圖、彈出式與特效背景七種類型。
- 角色題材、風格配方、台灣繁中常用語與自訂詞庫。
- 候選網格自動切割，繁體中文字由網站本機後製，降低 AI 文字錯字。
- 每張貼圖可人工入選／淘汰。
- 動態貼圖 APNG 時間軸與 Web Worker 編碼。
- 尺寸、透明度、檔案大小、影格、播放時間與素材權利檢查。
- 專案 ZIP 備份與載入。
- 手動 ChatGPT / Gemini Markdown 任務作為備援流程。

## 自動產圖環境變數

在 Vercel 專案的 Environment Variables 設定至少一組：

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
```

可選擇覆寫模型：

```env
OPENAI_IMAGE_MODEL=gpt-image-2.5-flare
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
```

> 不要把 API Key 寫成 `VITE_OPENAI_API_KEY` 或 `VITE_GEMINI_API_KEY`。Vite 的 `VITE_*` 變數會被打包到前端。

## OpenAI 自動產圖

伺服器端使用 OpenAI Images API：

- 無參考照片：圖片生成。
- 有參考照片：圖片編輯／參考圖生成。
- 優先要求透明 PNG。
- 預設以 1024×1024 產出候選貼圖表，再交給現有 Canvas 切圖流程。

## Gemini 自動產圖

伺服器端使用 Gemini Image API：

- 支援文字生成圖片。
- 可帶參考照片。
- 產出 1:1、1K 圖片作為候選貼圖表。
- 回傳後交給相同的本機切圖與字幕流程。

## 為什麼文字不交給 AI 畫？

LINE 貼圖常使用繁體中文。為降低錯字、缺字與字型不一致：

- AI 只負責角色、表情與動作。
- 提示詞明確要求不要畫任何文字。
- 使用者選定的繁體中文由瀏覽器 Canvas 後製。
- 字級、字型與位置仍可由網站控制。

## 本機開發

需要 Node.js 22。

```bash
npm ci
npm run dev
```

前端預設：

```text
http://localhost:5173
```

本機若要測試 `/api/generate`，建議使用 Vercel CLI 執行完整前後端環境。

## 驗證與建置

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Vercel

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Node.js：22
- Serverless API：`api/generate.ts`

GitHub `main` 為 Production Branch；其他 branch 與 PR 可建立 Preview Deployment。

## 安全設計

- API Key 不傳送到瀏覽器。
- 圖片 API 回應不快取。
- 參考照片最多 5 張。
- 單張參考照片最大 20 MB。
- 使用者必須確認照片／肖像與素材使用權。
- 本專案不移除浮水印、不規避來源標記，也不保證 LINE 最終審核結果。

## 後續最佳化方向

- 將一次生成整張候選表升級為「逐張併發生成＋角色一致性 reference」模式。
- 失敗自動重試與單格重生。
- 產圖成本預估與每日額度。
- 伺服器端 rate limit。
- 使用者登入與專案雲端保存。
- 將每個貼圖分類擴充為 100 句常用語，支援隨機不重複抽取。
- 產圖任務 queue 與進度狀態。

## License

程式碼採 [MIT License](LICENSE)。此授權不包含使用者圖片、第三方素材、品牌、角色或 AI 生成內容的額外權利。
