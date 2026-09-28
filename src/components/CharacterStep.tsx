import { useState } from 'react';
import { ReferencePhotoPanel } from './ReferencePhotoPanel';
import { SubjectDesigner } from './SubjectDesigner';
import { useProject } from '../state/ProjectContext';

type CharacterMode = 'photo' | 'design';

export function CharacterStep({ onNext }: { onNext: () => void }) {
  const { project } = useProject();
  const [mode, setMode] = useState<CharacterMode | null>(() => project.referencePhotos.length ? 'photo' : null);

  return <div className="simple-step">
    <div className="simple-step-intro">
      <b>1</b>
      <div>
        <h2>你想怎麼做角色？</h2>
        <p>先選一種方式就好，其他設定都先用預設值。</p>
      </div>
    </div>

    {!mode && <div className="character-choice-grid">
      <button className="character-choice-card" onClick={() => setMode('photo')}>
        <span className="choice-icon">📷</span>
        <strong>用照片做貼圖</strong>
        <small>上傳本人、家人、寵物或物品照片</small>
        <em>最簡單</em>
      </button>
      <button className="character-choice-card" onClick={() => setMode('design')}>
        <span className="choice-icon">🎨</span>
        <strong>自己設計角色</strong>
        <small>從內建題材選，或輸入自己的角色描述</small>
      </button>
    </div>}

    {mode && <div className="character-mode-panel">
      <div className="character-mode-head">
        <div>
          <strong>{mode === 'photo' ? '📷 用照片做貼圖' : '🎨 自己設計角色'}</strong>
          <small>{mode === 'photo' ? '加入 1～5 張照片，第一張預設為主要參考。' : '挑一個角色題材；其他細節可以之後再改。'}</small>
        </div>
        <button className="ghost-button" onClick={() => setMode(null)}>重新選擇</button>
      </div>

      {mode === 'photo' ? <ReferencePhotoPanel /> : <section className="panel character-designer-panel"><SubjectDesigner /></section>}
    </div>}

    {mode && <div className="simple-bottom-actions">
      <button className="primary-button simple-next" disabled={mode === 'photo' && (project.referencePhotos.length === 0 || !project.photoRightsConfirmed)} onClick={onNext}>
        下一步：選貼圖文字 →
      </button>
      {mode === 'photo' && project.referencePhotos.length === 0 && <span>先加入至少 1 張照片</span>}{mode === 'photo' && project.referencePhotos.length > 0 && !project.photoRightsConfirmed && <span>請先確認照片使用權</span>}
    </div>}
  </div>;
}
