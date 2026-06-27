import { useMemo } from 'react';
import { validateProject } from '../domain/validation';
import { useProject } from '../state/ProjectContext';

export function ValidationPanel() {
  const { project } = useProject();
  const issues = useMemo(() => validateProject(project), [project]);
  return <section className="validation panel">
    <div><span className="eyebrow">PRE-FLIGHT</span><h2>LINE 規格檢查</h2>
      <p className="hint">權利與肖像授權請自行確認；此項不再作為匯出阻擋檢查。</p></div>
    <div className="issue-list">{issues.map((issue, index) => <div className={`issue ${issue.level}`} key={`${issue.code}-${index}`}>
      <span>{issue.level === 'success' ? '✓' : issue.level === 'error' ? '!' : '△'}</span>
      <p><strong>{issue.assetName}</strong>{issue.message}</p>
    </div>)}</div>
  </section>;
}
