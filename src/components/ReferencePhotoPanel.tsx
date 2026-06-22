import { useEffect, useRef, useState } from 'react';
import { assertReferencePhotoCapacity, createReferencePhoto, getReferencePhoto, isDuplicateReferencePhoto, removeReferencePhoto } from '../storage/referencePhotos';
import { useProject } from '../state/ProjectContext';

export function ReferencePhotoPanel() {
  const { project, dispatch } = useProject(); const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({}); const [error, setError] = useState('');
  useEffect(() => { let active = true; const urls: string[] = [];
    void Promise.all(project.referencePhotos.map(async (photo) => { const blob = await getReferencePhoto(photo.id); if (!blob) return; const url = URL.createObjectURL(blob); urls.push(url); return [photo.id, url] as const; }))
      .then((items) => { if (active) setPreviews(Object.fromEntries(items.filter(Boolean) as [string, string][])); });
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [project.referencePhotos]);
  async function add(files: FileList) { setError(''); try {
    const incoming = Array.from(files); assertReferencePhotoCapacity(project.referencePhotos.length, incoming.length);
    const next = [...project.referencePhotos];
    for (const file of incoming) { const photo = await createReferencePhoto(file, next.length, next.length === 0); if (isDuplicateReferencePhoto(photo.hash, next)) { await removeReferencePhoto(photo.id); throw new Error(`${file.name} 與既有照片重複`); } next.push(photo); }
    dispatch({ type: 'update', patch: { referencePhotos: next, photoRightsConfirmed: false } });
  } catch (reason) { setError(reason instanceof Error ? reason.message : '照片處理失敗'); } }
  function reorder(index: number, offset: number) { const target = index + offset; if (target < 0 || target >= project.referencePhotos.length) return;
    const next = [...project.referencePhotos]; [next[index], next[target]] = [next[target], next[index]];
    dispatch({ type: 'update', patch: { referencePhotos: next.map((item, order) => ({ ...item, order })) } }); }
  async function remove(id: string) { await removeReferencePhoto(id); const next = project.referencePhotos.filter((item) => item.id !== id).map((item, order) => ({ ...item, order }));
    if (next.length && !next.some((item) => item.primary)) next[0] = { ...next[0], primary: true };
    dispatch({ type: 'update', patch: { referencePhotos: next, photoRightsConfirmed: next.length ? project.photoRightsConfirmed : false } }); }
  return <section className="photo-section panel"><div className="section-heading"><span>照</span><div><h2>個人參考照片</h2><p>最多 5 張，與完整 MD 同次上傳平台</p></div></div>
    <div className="photo-actions"><button className="primary-button" disabled={project.referencePhotos.length >= 5} onClick={() => inputRef.current?.click()}>加入參考照片</button>
      <input ref={inputRef} hidden multiple type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { if (event.target.files) void add(event.target.files); event.target.value = ''; }} />
      <span>{project.referencePhotos.length} / 5</span></div>
    {error && <p className="photo-error">{error}</p>}
    <div className="photo-list">{project.referencePhotos.map((photo, index) => <article key={photo.id} className={photo.primary ? 'reference-photo primary' : 'reference-photo'}>
      {previews[photo.id] ? <img src={previews[photo.id]} alt={photo.name} /> : <div className="photo-missing">照片遺失</div>}
      <div><strong>{photo.name}</strong><small>{photo.width}×{photo.height} · {(photo.bytes / 1024 / 1024).toFixed(1)} MB</small></div>
      <label><input type="radio" name="primary-photo" checked={photo.primary} onChange={() => dispatch({ type: 'update', patch: { referencePhotos: project.referencePhotos.map((item) => ({ ...item, primary: item.id === photo.id })) } })} />主照片</label>
      <div className="photo-buttons"><button disabled={index === 0} onClick={() => reorder(index, -1)}>←</button><button disabled={index === project.referencePhotos.length - 1} onClick={() => reorder(index, 1)}>→</button><button onClick={() => void remove(photo.id)}>×</button></div>
    </article>)}</div>
    {project.referencePhotos.length > 0 && <label className="rights-check"><input type="checkbox" checked={project.photoRightsConfirmed} onChange={(event) => dispatch({ type: 'update', patch: { photoRightsConfirmed: event.target.checked } })} />我確認擁有照片使用權及必要肖像同意，並同意上傳至所選 AI 平台。</label>}
  </section>;
}
