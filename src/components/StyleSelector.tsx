import { STYLE_OPTIONS, stylePrompt } from '../domain/styles';
import type { StyleRecipe } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const LABELS: Record<keyof StyleRecipe, string> = { primary: '主風格', palette: '配色', outline: '描邊', rendering: '上色', shape: '造型' };

export function StyleSelector() {
  const { project, dispatch } = useProject();
  function update(key: keyof StyleRecipe, value: string) {
    dispatch({ type: 'update', patch: { styleRecipe: { ...project.styleRecipe, [key]: value } } });
  }
  return <section className="style-section panel">
    <div className="section-heading"><span>藝</span><div><h2>風格配方</h2><p>一個主風格＋四項可控修飾器</p></div></div>
    <div className="style-grid">{(Object.keys(STYLE_OPTIONS) as (keyof StyleRecipe)[]).map((key) => <label key={key}><span>{LABELS[key]}</span>
      <select value={project.styleRecipe[key]} onChange={(e) => update(key, e.target.value)}>{STYLE_OPTIONS[key].map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>
    </label>)}</div><p className="prompt-preview">Prompt：{stylePrompt(project.styleRecipe)}</p>
  </section>;
}
