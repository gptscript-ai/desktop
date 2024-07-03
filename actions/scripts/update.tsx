"use server"

import { Tool, GPTScript, Block } from '@gptscript-ai/gptscript';
import { SCRIPTS_PATH, gpt} from '@/config/env';
import fs from 'fs/promises';

const external = (file: string): boolean => {
    return file.startsWith('http') || file.startsWith('https') || file.startsWith('github.com')
};

export const path = async (file: string): Promise<string> => {
    if (!external(file)) return `${SCRIPTS_PATH()}/${file}.gpt`;
    return file;
};

export const updateScript = async (file: string, script: Block[]) => {
    if (external(file)) throw new Error('cannot update external tools');

    try {
        await fs.writeFile(`${SCRIPTS_PATH()}/${file}.gpt`, await gpt().stringify(script));
    } catch (e) {
        throw e;
    }
}

export const updateTool = async (file: string, name: string, script: Block[]) => {
    if (external(file)) throw new Error('cannot update external tools');

    try {
        return await gpt().stringify(script);
    } catch (e) {
        throw e;
    }
}
