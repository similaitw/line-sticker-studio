import { useState } from 'react';
import { useProject } from '../state/ProjectContext';
import { ReferencePhotoPanel } from './ReferencePhotoPanel';
import { SettingsPanel } from './SettingsPanel';

type CharacterMode = 'photo' | 'design' | null;

export function CharacterStart({ onNext }: { onNext: () => void }) {
  const { project } = useProject();
  const [mode, setMode] = useState<CharacterMode>(() => project.referencePhotos.length ? 'photo' : null);

  return <div className="character-start">
    {!mode && <>
      <div className="character-choice-heading">
        <h2>你的貼圖主角從哪裡來？</h2>
        <p>先選一個就好，其他細節之後都能改。</p>
      </div>
      <div className="character-choice-grid">
        <button className="character-choice-card" onClick={() => setMode('photo')}>
          <span className="choice-icon">📷</span>
          <strong>用照片做貼圖</strong>
          <small>上傳人物、寵物或自己的角色照片</small>
          <b>開始上傳 →</b>
        </button>
        <button className="character-choice-card" onClick={() => setMode('design')}>
          <span className="choice-icon">🎨</span>
          <strong>自己設計角色</strong>
          <small>不用照片，直接選角色類型與個性</small>
          <b>開始設計 →</b>
        </button>
      </div>
    </>}

    {mode === 'photo' && <div className="character-mode-panel">
      <div className="character-mode-bar">
        <div><span>📷</span><div><strong>用照片做貼圖</strong><small>先加入 1–5 張照片，第一張會作為主要參考。</small></div></div>
        <button className="ghost-button" onClick={() => setMode(null)}>重新選擇</button>
      </div>
      <ReferencePhotoPanel />
      <details className="simple-advanced-card">
        <summary>想調整角色個性或貼圖張數？</summary>
        <div className="single-panel"><SettingsPanel /></div>
      </details>
      <button className="primary-button simple-next" disabled={!project.referencePhotos.length || !project.photoRightsConfirmed} onClick={onNext}>
        下一步：選貼圖文字 →
      </button>
      {project.referencePhotos.length > 0 && !project.photoRightsConfirmed && <p className="step-hint">請先勾選照片使用權確認，再進下一步。</p>}
    </div>}

    {mode === 'design' && <div className="character-mode-panel">
      <div className="character-mode-bar">
        <div><span>🎨</span><div><strong>自己設計角色</strong><small>選一個角色方向即可，張數與格數可先保留預設。</small></div></div>
        <button className="ghost-button" onClick={() => setMode(null)}>重新選擇</button>
      </div>
      <div className="single-panel"><SettingsPanel /></div>
      <button className="primary-button simple-next" onClick={onNext}>下一步：選貼圖文字 →</button>
    </div>}
  </div>;
}
