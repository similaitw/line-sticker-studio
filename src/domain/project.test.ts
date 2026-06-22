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
  it('可以把 v2 文字與共用影格遷移到 v5', () => {
    const legacy = { version: 2, name: '舊專案', type: 'static', settings: { character: '熊', phrases: '收到,謝謝', count: 8, columns: 4, padding: 10, fontSize: 42, loops: 1 }, sourceDataUrl: '', stickers: [], frames: [], updatedAt: 1 };
    const project = parseProject(JSON.stringify(legacy));
    expect(project.version).toBe(5);
    expect(project.captionSlots.map((item) => item.text)).toEqual(['收到', '謝謝']);
  });
  it('可以把 v3 網格與候選狀態遷移到 v5',()=>{const current=createProject();const legacy={...current,version:3,settings:{character:'舊角色',count:8,columns:4,padding:10,fontSize:42,loops:1}};delete (legacy as Partial<typeof current>).referencePhotos;delete (legacy as Partial<typeof current>).photoRightsConfirmed;delete (legacy as Partial<typeof current>).subjectProfile;const project=parseProject(JSON.stringify(legacy));expect(project.version).toBe(5);expect(project.settings.rows).toBe(2);expect(project.referencePhotos).toEqual([]);expect(project.subjectProfile.extraDetails).toBe('舊角色');});
  it('可以把 v4 角色描述遷移到 v5',()=>{const current=createProject();const legacy={...current,version:4,settings:{...current.settings,character:'戴眼鏡的舊角色'}};delete (legacy as Partial<typeof current>).subjectProfile;const project=parseProject(JSON.stringify(legacy));expect(project.version).toBe(5);expect(project.subjectProfile.extraDetails).toBe('戴眼鏡的舊角色');});
  it('載入 v2-v5 時清除已知舊版黑熊預設，保留自訂描述',()=>{const defaultText='一隻圓滾滾的台灣黑熊，上班族襯衫，表情誇張可愛';for(const version of [2,3,4,5] as const){let raw:unknown;if(version===2)raw={version:2,name:'舊專案',type:'static',settings:{character:defaultText,phrases:'收到',count:8,columns:3,padding:10,fontSize:42,loops:1},sourceDataUrl:'',stickers:[],updatedAt:1};else {const current=createProject();if(version===3){raw={...current,version:3,settings:{character:defaultText,count:8,columns:3,padding:10,fontSize:42,loops:1}};delete (raw as Partial<typeof current>).subjectProfile;}else if(version===4){raw={...current,version:4,settings:{...current.settings,character:defaultText}};delete (raw as Partial<typeof current>).subjectProfile;}else raw={...current,subjectProfile:{...current.subjectProfile,extraDetails:defaultText}};}expect(parseProject(JSON.stringify(raw)).subjectProfile.extraDetails).toBe('');}const custom=createProject();custom.subjectProfile.extraDetails='請保留我的紅色眼鏡';expect(parseProject(serializeProject(custom)).subjectProfile.extraDetails).toBe('請保留我的紅色眼鏡');});
});
