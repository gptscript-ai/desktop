'use server';

import { create, del, get, list, update } from '@/actions/common';
import { GATEWAY_URL, gpt } from '@/config/env';
import { Block } from '@gptscript-ai/gptscript';

export interface ParsedScript extends Script {
  agentName?: string;
  description?: string;
  script: Block[];
}

export interface Script {
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
  id?: number;
  owner?: string;
  tags?: string[];
  visibility?: string;
  publicURL?: string;
  slug?: string;
}

export interface ScriptsQuery {
  owner?: string;
  filter?: string;
  limit?: number;
  continue?: string;
  search?: string;
  visibility?: 'public' | 'private' | undefined;
}

export interface ScriptsQueryResponse {
  continue?: string;
  scripts?: Script[];
}

export interface ParsedScriptsQueryResponse {
  continue?: string;
  scripts?: ParsedScript[];
}

// note: can combine these two functions into one to save cycles
function getDescription(script: Block[]): string {
  for (const tool of script) {
    if (tool.type === 'text') continue;
    return tool.description || '';
  }
  return '';
}
function getName(script: Block[]): string {
  for (const tool of script) {
    if (tool.type === 'text') continue;
    return tool.name || '';
  }
  return '';
}

export async function getScripts(
  query?: ScriptsQuery
): Promise<ParsedScriptsQueryResponse> {
  let scripts: ScriptsQueryResponse = {};
  if (!query) scripts = await list('scripts');
  else
    scripts = await list(
      'scripts?' + new URLSearchParams(query as any).toString()
    );

  const parsedScripts: ParsedScript[] = [];
  for (const script of scripts.scripts || []) {
    const parsedScript = await gpt().parseTool(script.content || '');

    parsedScripts.push({
      ...script,
      script: parsedScript,
      description: getDescription(parsedScript),
      agentName: getName(parsedScript),
    });
  }

  return { continue: scripts.continue, scripts: parsedScripts };
}

export async function getScript(id: string): Promise<ParsedScript | undefined> {
  try {
    const scripts = (await get(
      'scripts',
      id.replace(`${GATEWAY_URL()}/`, '')
    )) as Script;
    const parsedScript = await gpt().parseTool(scripts.content || '');
    return {
      ...scripts,
      script: parsedScript,
      description: getDescription(parsedScript),
      agentName: getName(parsedScript),
    };
  } catch (e) {
    return undefined;
  }
}

export async function createScript(script: Script) {
  return await create(script, `scripts`);
}

export async function updateScript(script: Script) {
  return await update(script, `scripts/${script.id}`);
}

export async function deleteScript(script: Script) {
  return await del(`${script.id}`, 'scripts');
}

export async function getScriptContent(
  scriptURL: string
): Promise<string | undefined> {
  try {
    const script = await gpt().parse(scriptURL);
    return gpt().stringify(script);
  } catch (e) {
    return undefined;
  }
}
