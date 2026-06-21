import { createProject, changeProjectType } from './project';
import { validateProject } from './validation';

describe('LINE 貼圖規格', () => {
  it('動態貼圖不接受 32 張', () => {
    const project = changeProjectType(createProject(), 'animated'); project.settings.count = 32;
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'COUNT', level: 'error' }));
  });
  it('文字槽位必須等於貼圖數量', () => {
    const project = createProject(); project.settings.count = 16;
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'CAPTION_COUNT' }));
  });
  it('未確認素材權利會阻擋匯出', () => {
    expect(validateProject(createProject())).toContainEqual(expect.objectContaining({ code: 'RIGHTS' }));
  });
  it('可見來源標記會阻擋匯出', () => {
    const project = createProject(); project.stickers = [{ id:'a',name:'01.png',dataUrl:'data:image/png;base64,',width:370,height:320,bytes:10,hasTransparency:true,provenanceMark:'visible' }];
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'PROVENANCE_MARK_DETECTED' }));
  });
});
