import { createProject } from '../domain/project';
import { buildTaskMarkdown, createGenerationTask, parseTaskMarkdown } from './tasks';

describe('雙平台 MD 任務', () => {
  it.each(['chatgpt', 'gemini'] as const)('可建立並解析 %s 任務', (provider) => {
    const project = createProject(); project.generationProvider = provider;
    project.referencePhotos=[{id:'photo',name:'me.jpg',type:'image/jpeg',width:800,height:1000,bytes:100,hash:'abc',order:0,primary:true}];
    const task = createGenerationTask(project); const markdown = buildTaskMarkdown(project, task);
    expect(parseTaskMarkdown(markdown)).toMatchObject({ schema:'line-sticker-task/v3',provider,taskId:task.id,targetCount:8,count:9,rows:3,columns:3,subjectProfile:project.subjectProfile });
    expect(markdown).toContain('me.jpg');
    expect(markdown).toContain('Do not include logos, brands, watermarks');
  });
  it('仍可解析 v1 任務',()=>{const project=createProject();const task=createGenerationTask(project);const markdown=buildTaskMarkdown(project,task).replace('line-sticker-task/v3','line-sticker-task/v1');expect(parseTaskMarkdown(markdown).schema).toBe('line-sticker-task/v1');});
});
