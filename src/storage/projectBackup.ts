import JSZip from 'jszip';
import { parseProject, serializeProject } from '../domain/project';
import type { StickerProject } from '../domain/types';
import { getReferencePhoto, saveReferencePhoto } from './referencePhotos';

export async function createProjectBackup(project: StickerProject): Promise<Blob> {
  const zip = new JSZip();
  zip.file('project.json', serializeProject(project));
  for (const photo of project.referencePhotos) {
    const blob = await getReferencePhoto(photo.id);
    if (!blob) throw new Error(`找不到參考照片：${photo.name}`);
    zip.file(`references/${photo.id}-${safeName(photo.name)}`, blob);
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export async function readProjectBackup(file: File): Promise<StickerProject> {
  if (file.name.endsWith('.json')) return parseProject(await file.text());
  const zip = await JSZip.loadAsync(file);
  const projectFile = zip.file('project.json');
  if (!projectFile) throw new Error('專案備份缺少 project.json');
  const project = parseProject(await projectFile.async('text'));
  for (const photo of project.referencePhotos) {
    const entry = Object.values(zip.files).find((item) => !item.dir && item.name.startsWith(`references/${photo.id}-`));
    if (!entry) throw new Error(`專案備份缺少參考照片：${photo.name}`);
    await saveReferencePhoto(photo.id, await entry.async('blob'));
  }
  return project;
}

function safeName(name: string): string { return name.replace(/[^\p{L}\p{N}._-]+/gu, '_'); }
