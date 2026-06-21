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
  it('可以把 v2 文字與共用影格遷移到 v3', () => {
    const legacy = { version: 2, name: '舊專案', type: 'static', settings: { character: '熊', phrases: '收到,謝謝', count: 8, columns: 4, padding: 10, fontSize: 42, loops: 1 }, sourceDataUrl: '', stickers: [], frames: [], updatedAt: 1 };
    const project = parseProject(JSON.stringify(legacy));
    expect(project.version).toBe(3);
    expect(project.captionSlots.map((item) => item.text)).toEqual(['收到', '謝謝']);
  });
});
