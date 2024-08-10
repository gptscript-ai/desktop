"use server"

import {create, del, get, list, update} from "@/actions/common"
import { getMe } from "@/actions/me/me"
import { GATEWAY_URL, gpt } from "@/config/env"
import { Block } from "@gptscript-ai/gptscript"

export interface ParsedScript extends Script {
    agentName?: string
    description?: string
    script: Block[];
}

export interface Script {
    displayName?: string
    createdAt?: string
    updatedAt?: string
    content?: string
    id?: number
    owner?: string
    tags?: string[]
    visibility?: string
    publicURL?: string
    slug?: string
}

export interface ScriptsQuery {
    owner?: string
    filter?: string
    limit?: number
    continue?: string
    search?: string
}

export interface ScriptsQueryResponse {
    continue?: string
    scripts?: Script[]
}

export interface ParsedScriptsQueryResponse {
    continue?: string
    scripts?: ParsedScript[]
}

// note: can combine these two functions into one to save cycles
function getDescription(script: Block[]): string {
    for (let tool of script) {
        if (tool.type === 'text') continue;
        return tool.description || '';
    }
    return '';
}
function getName(script: Block[]): string {
    for (let tool of script) {
        if (tool.type === 'text') continue;
        return tool.name || '';
    }
    return '';
}

export async function getScripts(query?: ScriptsQuery): Promise<ParsedScriptsQueryResponse> {
    let scripts: ScriptsQueryResponse = {};
    if (!query) scripts = await list("scripts");
    else scripts = await list("scripts?" + new URLSearchParams(query as any).toString());

    let parsedScripts: ParsedScript[] = [];
    for (const script of scripts.scripts || []) {
        const parsedScript = await gpt().parseTool(script.content || '');

        parsedScripts.push({ ...script, 
            script: parsedScript,
            description: getDescription(parsedScript),
            agentName: getName(parsedScript)
        });
    }

    return { continue: scripts.continue, scripts: parsedScripts };

}

export async function getScript(id: string): Promise<ParsedScript> {
    const scripts = await get("scripts", id.replace(`${GATEWAY_URL()}/`, '')) as Script
    const parsedScript = await gpt().parseTool(scripts.content || '')
    return { ...scripts, 
        script: parsedScript,
        description: getDescription(parsedScript),
        agentName: getName(parsedScript)
    }
}

export async function createScript(script: Script) {
    return await create(script, `scripts`)
}

export async function updateScript(script: Script) {
    return await update(script, `scripts/${script.id}`)
}

export async function deleteScript(script: Script) {
    return await del(`${script.id}`, "scripts")
}

export async function getScriptContent(scriptURL: string) {
    const script = await gpt().parse(scriptURL);
    return gpt().stringify(script);
}

export async function getNewScriptName() {
    const me = await getMe();
    const scripts = await getScripts({ owner: me.username, search: 'New Assistant' });
    let smallestAssistant = Infinity;
    for (let script of scripts.scripts || []) {
        if (script.displayName?.includes('New Assistant')) {
            const assistantNumber = parseInt(script.displayName?.split('New Assistant ')[1] || '1');
            if (assistantNumber < smallestAssistant) smallestAssistant = assistantNumber;
        }
    }
    return `New Assistant ${smallestAssistant === Infinity ? 1 : smallestAssistant - 1}`;
}