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

/**
 * Verifies that a tool exists by parsing it.
 * @param toolRef The tool reference to verify.
 * @returns A boolean indicating whether the tool exists.
 */
export const verifyToolExists = async (toolRef: string) => {
  // skip verification if the tool is a system tool
  if (toolRef.startsWith('sys.')) return true;

  try {
    await gpt().parse(toolRef);
    return true;
  } catch (_) {
    return false;
  }
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

export const getToolDisplayName = async (ref: string): Promise<string> => {
  let displayName: string =
    ref.split('/').pop()?.replace('sys.', '').replace('.', ' ') ?? ref;

  if (!ref.startsWith('sys.')) {
    const loadedTool = await load(ref);
    const loadedName = loadedTool.toolSet[loadedTool.entryToolId].name;
    if (loadedName) {
      displayName = loadedName;
    }
  }

  return displayName.replace(/-/g, ' ');
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
