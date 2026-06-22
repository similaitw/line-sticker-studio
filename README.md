# LINE Sticker Studio

不需要 API Key 的 LINE 七類貼圖工作台。使用 ChatGPT 或 Gemini 的網頁版產圖，再由瀏覽器本機完成繁體中文字、切割、APNG、合規檢查與 ZIP。

正式站：[https://linesticker-ten.vercel.app](https://linesticker-ten.vercel.app)

## 功能

- 靜態、動態、自訂文字、訊息、大貼圖、彈出式與特效背景七種類型。
- 每個專案只需一份 ChatGPT／Gemini 完整 Markdown 任務，可下載、重新匯入及保存產圖紀錄。
- 最多 5 張人物、寵物或角色參考照片，本機 IndexedDB 保存並隨專案 ZIP 備份。
- v5 靜態角色題材設計：6 大類、110 個原創子項目、角色設定、個性與道具組合。
- 有照片時自動建立安全的外觀分析指令；無照片時可選熱門趨勢題材或完全自訂主體。
- 2–8 行列候選網格，預設 3×3 生成 9 張候選並選出 8 張 LINE 貼圖。
- 40 個分類、400 組台灣繁中常用語，以及自訂詞庫匯入／匯出。
- 16 種主風格與配色、描邊、上色、造型組合。
- 每張貼圖獨立 APNG 時間軸，編碼在 Web Worker 中執行。
- 尺寸、透明度、檔案大小、影格、播放時間、來源標記及素材權利檢查。
- 專案 JSON 儲存／載入與 v2 → v3 自動遷移。

## 使用流程

1. 選擇 ChatGPT 或 Gemini、貼圖類型、文字與風格。
2. 視需要加入最多 5 張參考照片，確認照片與肖像使用權。
3. 在「完整產圖任務」下載一份 MD。
4. 手動前往對應平台，同次選取 MD 與所有參考照片後產圖。
5. 下載原尺寸 PNG，回本站按「匯入平台 PNG」。
6. 從候選格選滿合法張數，確認沒有可見浮水印並完成權利聲明。
7. 修正所有阻擋項目後匯出 LINE ZIP。

Gemini 結果若含可見平台標記，工具會阻擋匯出；本專案不提供移除、遮蓋、裁切浮水印或破壞 SynthID 的功能。

## 本機開發

需要 Node.js 22。

```bash
npm ci
npm run dev
```

開啟 http://localhost:5173。

## 驗證與建置

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

正式建置位於 `dist/`，整個應用程式都是純靜態前端，不需要環境變數、資料庫或後端 API。

## Vercel

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Node.js：22

GitHub `main` 為 Production Branch；其他 branch 與 PR 由 Vercel 建立 Preview Deployment。

## 合規說明

工具會依 LINE Creators Market 公開規格執行可自動化的技術檢查，但不能保證最終審核結果。使用者仍須確認圖片、人物、商標、字型與其他素材的合法權利。

## License

程式碼採 [MIT License](LICENSE)。此授權不包含使用者圖片、第三方素材、品牌、角色或 AI 生成內容的額外權利。
