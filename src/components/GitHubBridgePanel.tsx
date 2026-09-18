import { useState } from 'react';
import { downloadBlob } from '../export/exportZip';
import { createGithubBridgeTask, GITHUB_REPOSITORY } from '../providers/githubBridge';
import { useProject } from '../state/ProjectContext';

export function GitHubBridgePanel() {
  const { project, dispatch } = useProject();
  const [message, setMessage] = useState('');

  const cellCount = project.settings.rows * project.settings.columns;
  const ready = project.captionSlots.length === cellCount
    && (!project.referencePhotos.length || project.photoRightsConfirmed);

  function createJob() {
    if (!ready) {
      setMessage(project.captionSlots.length !== cellCount
        ? `請先補滿 ${cellCount} 個貼圖文字／動作。`
        : '請先確認參考照片使用權與肖像同意。');
      return;
    }

    const { task, body, issueUrl } = createGithubBridgeTask(project);
    dispatch({
      type: 'update',
      patch: {
        generationProvider: 'chatgpt',
        generationTasks: [...project.generationTasks, { ...task, status: 'exported' }],
      },
    });

    if (issueUrl.length < 24000) {
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      setMessage('已開啟 GitHub 新增 Issue 頁面。確認內容後按 Submit new issue，即完成橋接。');
    } else {
      downloadBlob(new Blob([body], { type: 'text/markdown;charset=utf-8' }), `line-sticker-github-job-${task.id.slice(0, 8)}.md`);
      window.open(`https://github.com/${GITHUB_REPOSITORY}/issues/new`, '_blank', 'noopener,noreferrer');
      setMessage('任務內容較長，已下載 Job MD 並開啟 GitHub Issue 頁面；把 MD 內容貼入 Issue 後送出即可。');
    }
  }

  async function copyCommand() {
    await navigator.clipboard.writeText('處理最新 LINE 貼圖任務');
    setMessage('已複製：「處理最新 LINE 貼圖任務」');
  }

  return <section className="github-bridge panel">
    <div className="section-heading"><span>GH</span><div>
      <h2>GitHub → ChatGPT 產圖橋接</h2>
      <p>不用 Chat2Code、不用 OpenAI API Key；GitHub 只負責傳遞任務與狀態。</p>
    </div></div>

    <div className="bridge-flow">
      <span>LINE Sticker Studio</span><b>→</b><span>GitHub Job</span><b>→</b><span>ChatGPT Plus</span><b>→</b><span>匯回圖片</span>
    </div>

    <div className="bridge-summary">
      <div><small>候選格</small><strong>{project.settings.columns} × {project.settings.rows} = {cellCount}</strong></div>
      <div><small>最後入選</small><strong>{project.settings.count} 張</strong></div>
      <div><small>參考照片</small><strong>{project.referencePhotos.length} 張</strong></div>
      <div><small>GitHub</small><strong>{GITHUB_REPOSITORY}</strong></div>
    </div>

    <div className="bridge-actions">
      <button className="primary-button" disabled={!ready} onClick={createJob}>建立 GitHub 產圖任務</button>
      <button className="ghost-button" onClick={() => void copyCommand()}>複製 ChatGPT 呼叫指令</button>
    </div>

    {project.referencePhotos.length > 0 && <div className="privacy-note">
      <strong>人物照片不公開</strong>
      <span>目前 repository 是 public，因此只把照片檔名與任務規格寫進 GitHub；實際參考照片請直接上傳到 ChatGPT 對話。</span>
    </div>}

    {message && <p className="bridge-message">{message}</p>}

    <details className="auto-generate-help">
      <summary>為什麼圖片還要匯回網站？</summary>
      <p>GitHub 可以讓我直接讀寫任務文字與 Issue 狀態，但目前這個 ChatGPT 產圖介面沒有可把生成圖片二進位檔直接 commit 回 GitHub 的通道。產圖完成後下載圖片，再回本站「貼圖表預覽」匯入即可。</p>
    </details>
  </section>;
}
