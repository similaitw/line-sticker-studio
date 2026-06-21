import { createProject } from '../domain/project';
import { buildTaskMarkdown, createGenerationTask, parseTaskMarkdown } from './tasks';

describe('雙平台 MD 任務', () => {
  it.each(['chatgpt', 'gemini'] as const)('可建立並解析 %s 任務', (provider) => {
    const project = createProject(); project.generationProvider = provider;
    const task = createGenerationTask(project, 'sticker-sheet'); const markdown = buildTaskMarkdown(project, task);
    expect(parseTaskMarkdown(markdown)).toMatchObject({ provider, taskId: task.id, count: 8 });
    expect(markdown).toContain('Do not include logos, brands, watermarks');
  });
});
