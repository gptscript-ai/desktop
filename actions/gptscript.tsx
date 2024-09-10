'use server';

import { ToolDef, Tool, Block, Text, Program } from '@gptscript-ai/gptscript';
import { gpt } from '@/config/env';

export const rootTool = async (toolContent: Block[]): Promise<Tool> => {
  for (const block of toolContent) {
    if (block.type !== 'text') return block;
  }
  return {} as Tool;
};

export const parseContent = async (toolContent: string): Promise<Tool[]> => {
  const parsedTool = await gpt().parseContent(toolContent);
  return parsedTool.filter(
    (block) => block.type !== 'text' && !block.name?.startsWith('metadata')
  ) as Tool[];
};

export const parseBlock = async (ref: string) => {
  return await gpt().parse(ref);
};

export const parse = async (file: string): Promise<Tool[]> => {
  const parsedTool = await gpt().parse(file);
  return parsedTool.filter(
    (block) => block.type !== 'text' && !block.name?.startsWith('metadata')
  ) as Tool[];
};

export const load = async (file: string): Promise<Program> => {
  return (await gpt().load(file)).program;
};

export const getToolDisplayName = async (ref: string) => {
  if (ref.startsWith('sys.')) return null;

  try {
    const toolDef = await load(ref);
    return toolDef.toolSet[toolDef.entryToolId].name;
  } catch (e) {
    console.error('Error loading tool:', e);
    return null;
  }
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
