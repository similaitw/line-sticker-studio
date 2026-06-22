import { createProject } from './project';
import { buildSubjectDescription, validateSubjectProfile } from './subjectDescription';

describe('角色敘述產生器',()=>{
  it('無照片時使用內建題材',()=>{const project=createProject();const text=buildSubjectDescription(project.subjectProfile,[]);expect(text).toContain('black bear');expect(text).toContain('office work');});
  it('自訂模式使用自訂主體',()=>{const project=createProject();project.subjectProfile={...project.subjectProfile,baseMode:'custom',customSubject:'戴圓眼鏡的雲朵郵差',roleId:'none',personalityIds:[],propIds:[]};expect(buildSubjectDescription(project.subjectProfile,[])).toContain('戴圓眼鏡的雲朵郵差');});
  it('照片模式只使用照片外觀，不混入內建主體',()=>{const project=createProject();const photo={id:'p',name:'me.jpg',type:'image/jpeg' as const,width:100,height:100,bytes:10,hash:'x',order:0,primary:true};const text=buildSubjectDescription(project.subjectProfile,[photo]);expect(text).toContain('me.jpg');expect(text).toContain('non-sensitive');expect(text).not.toContain('black bear');});
  it('限制個性與道具最多兩個',()=>{const project=createProject();const profile={...project.subjectProfile,personalityIds:['lazy','funny','sweet'],propIds:['phone','book','coffee']};expect(validateSubjectProfile(profile,false)).toEqual(expect.arrayContaining(['個性最多選擇 2 個','道具最多選擇 2 個']));});
});
