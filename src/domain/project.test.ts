import { changeProjectType, createProject, parseProject, serializeProject } from './project';

describe('貼圖專案', () => {
  it('切換類型時修正不合法數量', () => {
    const source = createProject(); source.settings.count = 40;
    expect(changeProjectType(source, 'popup').settings.count).toBe(8);
  });
  it('可以序列化與載入', () => {
    const project = createProject('big');
    expect(parseProject(serializeProject(project)).type).toBe('big');
  });
  it('可以把 v2 文字與共用影格遷移到 v4', () => {
    const legacy = { version: 2, name: '舊專案', type: 'static', settings: { character: '熊', phrases: '收到,謝謝', count: 8, columns: 4, padding: 10, fontSize: 42, loops: 1 }, sourceDataUrl: '', stickers: [], frames: [], updatedAt: 1 };
    const project = parseProject(JSON.stringify(legacy));
    expect(project.version).toBe(4);
    expect(project.captionSlots.map((item) => item.text)).toEqual(['收到', '謝謝']);
  });
  it('可以把 v3 網格與候選狀態遷移到 v4',()=>{const current=createProject();const legacy={...current,version:3,settings:{character:current.settings.character,count:8,columns:4,padding:10,fontSize:42,loops:1}};delete (legacy as Partial<typeof current>).referencePhotos;delete (legacy as Partial<typeof current>).photoRightsConfirmed;const project=parseProject(JSON.stringify(legacy));expect(project.version).toBe(4);expect(project.settings.rows).toBe(2);expect(project.referencePhotos).toEqual([]);});
});
