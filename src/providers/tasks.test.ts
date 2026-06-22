import { createProject } from '../domain/project';
import { buildTaskMarkdown, createGenerationTask, parseTaskMarkdown } from './tasks';

describe('雙平台 MD 任務', () => {
  it.each(['chatgpt', 'gemini'] as const)('可建立並解析 %s 任務', (provider) => {
    const project = createProject(); project.generationProvider = provider;
    project.referencePhotos=[{id:'photo',name:'me.jpg',type:'image/jpeg',width:800,height:1000,bytes:100,hash:'abc',order:0,primary:true}];
    const task = createGenerationTask(project); const markdown = buildTaskMarkdown(project, task);
    expect(parseTaskMarkdown(markdown)).toMatchObject({ schema:'line-sticker-task/v4',provider,taskId:task.id,targetCount:8,count:9,rows:3,columns:3,generationSubject:{source:'photo',photoNames:['me.jpg']} });
    expect(parseTaskMarkdown(markdown).subjectProfile).toBeUndefined();
    expect(markdown).toContain('me.jpg');
    expect(markdown).toContain('ONLY appearance and identity source');
    expect(markdown).toContain('STOP and ask me to re-upload');
    expect(markdown).toContain('Do not include logos, brands, watermarks');
    expect(markdown.toLowerCase()).not.toContain('black bear');
    expect(markdown).not.toContain('台灣黑熊');
    expect(markdown).not.toContain('taiwan-black-bear');
    expect(markdown).not.toContain('"categoryId": "animals"');
  });
  it('照片模式會清除舊版預設黑熊描述',()=>{const project=createProject();project.referencePhotos=[{id:'photo',name:'family.webp',type:'image/webp',width:800,height:1000,bytes:100,hash:'abc',order:0,primary:true}];project.subjectProfile.extraDetails='一隻圓滾滾的台灣黑熊，上班族襯衫，表情誇張可愛';const markdown=buildTaskMarkdown(project,createGenerationTask(project));expect(markdown).not.toContain('台灣黑熊');expect(markdown.toLowerCase()).not.toContain('black bear');});
  it('無照片仍可使用內建黑熊題材',()=>{const project=createProject();const manifest=parseTaskMarkdown(buildTaskMarkdown(project,createGenerationTask(project)));expect(manifest.generationSubject).toMatchObject({source:'catalog',categoryId:'animals',itemId:'taiwan-black-bear'});expect(manifest.character).toContain('black bear');});
  it('仍可解析 v1 任務',()=>{const project=createProject();const task=createGenerationTask(project);const markdown=buildTaskMarkdown(project,task).replace('line-sticker-task/v4','line-sticker-task/v1');expect(parseTaskMarkdown(markdown).schema).toBe('line-sticker-task/v1');});
});
