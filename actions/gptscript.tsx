'use server';

import { ToolDef, Tool, Block, Text, Program } from '@gptscript-ai/gptscript';
import { gpt } from '@/config/env';

export const rootTool = async (toolContent: string): Promise<Tool> => {
  if (!toolContent) return {} as Tool;
  const parsedTool = await gpt().parseContent(toolContent);
  for (const block of parsedTool) {
    if (block.type === 'tool') return block;
  }
  return {} as Tool;
};

export const parseContent = async (toolContent: string): Promise<Tool[]> => {
  const parsedTool = await gpt().parseContent(toolContent);
  return parsedTool.filter(
    (block) => block.type === 'tool' && !block.name?.startsWith('metadata')
  ) as Tool[];
};

export const parse = async (file: string): Promise<Tool[]> => {
  const parsedTool = await gpt().parse(file);
  return parsedTool.filter(
    (block) => block.type === 'tool' && !block.name?.startsWith('metadata')
  ) as Tool[];
};

export const load = async (file: string): Promise<Program> => {
  return (await gpt().load(file)).program;
};

export const loadTools = async (
  tools: ToolDef | ToolDef[]
): Promise<Program> => {
  try {
    if (Array.isArray(tools)) return (await gpt().loadTools(tools)).program;
    return (await gpt().loadTools([tools])).program;
  } catch (e) {
    console.log(`Error loading tools: ${e}`);
  }

  return {} as Program;
};

export const getTexts = async (toolContent: string): Promise<Text[]> => {
  const parsedTool = await gpt().parseContent(toolContent);
  return parsedTool.filter((block) => block.type === 'text') as Text[];
};

export const stringify = async (script: Block[]): Promise<string> => {
  return await gpt().stringify(script);
};
