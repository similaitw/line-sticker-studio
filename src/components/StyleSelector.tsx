import type { CSSProperties } from 'react';
import { STYLE_OPTIONS, stylePrompt } from '../domain/styles';
import type { StyleRecipe } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const LABELS: Record<keyof StyleRecipe, string> = { primary: '主風格', palette: '配色', outline: '描邊', rendering: '上色', shape: '造型' };
const PREVIEW_PALETTE: Record<string, string[]> = {
  vivid: ['#ffb703', '#ffd166', '#fb8500'],
  pastel: ['#ffd98a', '#fff0bd', '#ffb56b'],
  morandi: ['#d9a441', '#f1d08a', '#b9823a'],
  warm: ['#f97316', '#facc15', '#dc5f00'],
  cool: ['#ffc857', '#ffe8a3', '#f59e0b'],
  mono: ['#d97706', '#f4d06f', '#b45309'],
  contrast: ['#ffbe0b', '#fff3b0', '#f97316'],
};

export function StyleSelector() {
  const { project, dispatch } = useProject();
  const colors = PREVIEW_PALETTE[project.styleRecipe.palette] ?? PREVIEW_PALETTE.vivid;
  const selected = (Object.keys(STYLE_OPTIONS) as (keyof StyleRecipe)[]).map((key) => STYLE_OPTIONS[key].find((option) => option.id === project.styleRecipe[key])?.label).filter(Boolean);
  function update(key: keyof StyleRecipe, value: string) {
    dispatch({ type: 'update', patch: { styleRecipe: { ...project.styleRecipe, [key]: value } } });
  }
  return <section className="style-section panel">
    <div className="section-heading"><span>藝</span><div><h2>風格配方</h2><p>一個主風格＋四項可控修飾器</p></div></div>
    <div className="style-layout">
      <div className="style-preview" data-primary={project.styleRecipe.primary} data-outline={project.styleRecipe.outline} data-rendering={project.styleRecipe.rendering} data-shape={project.styleRecipe.shape}
        style={{ '--preview-a': colors[0], '--preview-b': colors[1], '--preview-c': colors[2] } as CSSProperties}>
        <svg className="preview-sun" viewBox="0 0 160 160" role="img" aria-label="風格預覽小太陽">
          <defs>
            <radialGradient id="sunGlow" cx="38%" cy="30%" r="68%">
              <stop offset="0%" stopColor="var(--preview-b)" />
              <stop offset="62%" stopColor="var(--preview-a)" />
              <stop offset="100%" stopColor="var(--preview-c)" />
            </radialGradient>
            <pattern id="sunTexture" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 6 L8 2" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
            </pattern>
          </defs>
          <g className="sun-rays">
            {Array.from({ length: 12 }, (_, index) => <path key={index} d="M80 7 L91 33 L69 33 Z" transform={`rotate(${index * 30} 80 80)`} />)}
          </g>
          <circle className="sun-core" cx="80" cy="80" r="48" />
          <circle className="sun-texture" cx="80" cy="80" r="43" />
          <g className="sun-face">
            <circle className="sun-eye left" cx="61" cy="72" r="6" />
            <circle className="sun-eye right" cx="99" cy="72" r="6" />
            <path className="sun-mouth" d="M62 94 Q80 110 98 94" />
            <circle className="sun-cheek left" cx="51" cy="88" r="7" />
            <circle className="sun-cheek right" cx="109" cy="88" r="7" />
          </g>
        </svg>
        <small>{selected.join(' / ')}</small>
      </div>
      <div><div className="style-grid">{(Object.keys(STYLE_OPTIONS) as (keyof StyleRecipe)[]).map((key) => <label key={key}><span>{LABELS[key]}</span>
        <select value={project.styleRecipe[key]} onChange={(e) => update(key, e.target.value)}>{STYLE_OPTIONS[key].map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
      </label>)}</div><p className="prompt-preview">Prompt：{stylePrompt(project.styleRecipe)}</p></div>
    </div>
  </section>;
}
