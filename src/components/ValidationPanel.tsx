import { useMemo } from 'react';
import { validateProject } from '../domain/validation';
import { useProject } from '../state/ProjectContext';

export function ValidationPanel() {
  const { project, dispatch } = useProject();
  const issues = useMemo(() => validateProject(project), [project]);
  return <section className="validation panel">
    <div><span className="eyebrow">PRE-FLIGHT</span><h2>LINE 規格檢查</h2>
      <label className="rights-check"><input type="checkbox" checked={project.rightsConfirmed} onChange={(e)=>dispatch({type:'update',patch:{rightsConfirmed:e.target.checked}})}/><span>我確認擁有素材所需權利，且不含廣告、個資、政治、暴力、色情或侵權內容。</span></label></div>
    <div className="issue-list">{issues.map((issue, index) => <div className={`issue ${issue.level}`} key={`${issue.code}-${index}`}>
      <span>{issue.level === 'success' ? '✓' : issue.level === 'error' ? '!' : '△'}</span>
      <p><strong>{issue.assetName}</strong>{issue.message}</p>
    </div>)}</div>
  </section>;
}
