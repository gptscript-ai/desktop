'use server';

import { Tool, Block, Text } from '@gptscript-ai/gptscript';
import { gpt } from '@/config/env';

export const rootTool = async (toolContent: string): Promise<Tool> => {
  if (!toolContent) return {} as Tool;
  const parsedTool = await gpt().parseContent(toolContent);
  for (const block of parsedTool) {
    if (block.type === 'tool') return block;
  }
  return {} as Tool;
};

export const parse = async (toolContent: string): Promise<Tool[]> => {
  const parsedTool = await gpt().parseContent(toolContent);
  return parsedTool.filter(
    (block) => block.type === 'tool' && !block.name?.startsWith('metadata')
  ) as Tool[];
};

export const getTexts = async (toolContent: string): Promise<Text[]> => {
  const parsedTool = await gpt().parseContent(toolContent);
  return parsedTool.filter((block) => block.type === 'text') as Text[];
};

export const stringify = async (script: Block[]): Promise<string> => {
  return await gpt().stringify(script);
};
