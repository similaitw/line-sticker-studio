import { createProject, changeProjectType } from './project';
import { validateProject } from './validation';

describe('LINE 貼圖規格', () => {
  it('動態貼圖不接受 32 張', () => {
    const project = changeProjectType(createProject(), 'animated'); project.settings.count = 32;
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'COUNT', level: 'error' }));
  });
  it('文字槽位必須等於候選格數', () => {
    const project = createProject(); project.captionSlots.pop();
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'CAPTION_COUNT' }));
  });
  it('未確認素材權利會阻擋匯出', () => {
    expect(validateProject(createProject())).toContainEqual(expect.objectContaining({ code: 'RIGHTS' }));
  });
  it('可見來源標記會阻擋匯出', () => {
    const project = createProject(); project.stickers = Array.from({length:9},(_,index)=>({ id:String(index),name:`${index}.png`,dataUrl:'data:image/png;base64,',width:370,height:320,bytes:10,hasTransparency:true,provenanceMark:index===0?'visible' as const:'none' as const,gridIndex:index,included:index<8,selectedAt:index<8?index+1:undefined }));
    expect(validateProject(project)).toContainEqual(expect.objectContaining({ code: 'PROVENANCE_MARK_DETECTED' }));
  });
  it('候選可以多於 LINE 入選張數',()=>{const project=createProject();project.rightsConfirmed=true;project.stickers=Array.from({length:9},(_,index)=>({id:String(index),name:`${index}.png`,dataUrl:'data:image/png;base64,',width:370,height:320,bytes:10,hasTransparency:true,provenanceMark:'none' as const,gridIndex:index,included:index<8,selectedAt:index+1}));expect(validateProject(project).some((item)=>item.code==='ASSET_COUNT')).toBe(false);});
});
