"use server"

import {Tool, Block} from '@gptscript-ai/gptscript';
import {SCRIPTS_PATH, gpt} from '@/config/env';
import fs from 'fs/promises';

const external = (file: string): boolean => {
    return file.startsWith('http') || file.startsWith('https') || file.startsWith('github.com')
};

export const path = async (file: string): Promise<string> => {
    if (!external(file)) return `${SCRIPTS_PATH()}/${file}.gpt`;
    return file;
};

export const fetchFullScript = async (file: string): Promise<Block[]> => {
    if (!external(file)) file = `${SCRIPTS_PATH()}/${file}.gpt`;

    try {
        return await gpt().parse(file);
    } catch (e) {
        throw e;
    }
}

export const fetchScript = async (file: string): Promise<Tool> => {
    if (!external(file)) file = `${SCRIPTS_PATH()}/${file}.gpt`;

    try {
        const script = await gpt().parse(file);
        for (let tool of script) {
            if (tool.type === 'text') continue;
            return tool;
        }
        return {} as Tool;
    } catch (e) {
        if (`${e}`.includes('no such file')) {
            return {} as Tool;
        }
        throw e;
    }
}

export const fetchScripts = async (): Promise<Record<string, string>> => {
    try {
        const files = await fs.readdir(SCRIPTS_PATH());
        const gptFiles = files.filter(file => file.endsWith('.gpt'));

        if (gptFiles.length === 0) return {} as Record<string, string>;

        const scripts: Record<string, string> = {};
        for (const file of gptFiles) {
            const script = await gpt().parse(`${SCRIPTS_PATH()}/${file}`);
            let description = '';
            for (let tool of script) {
                if (tool.type === 'text') continue;
                description = tool.description || '';
                break;
            }
            scripts[file] = description || '';
        }

        return scripts
    } catch (e) {
        const error = e as NodeJS.ErrnoException;
        if (error.code === 'ENOENT') return {} as Record<string, string>;
        throw e;
    }
}

export const fetchScriptCode = async (file: string): Promise<string> => {
    file = file.includes('.gpt') ? file : `${file}.gpt`;
    try {
        return await fs.readFile(`${SCRIPTS_PATH()}/${file}`, 'utf-8');
    } catch (e) {
        throw e;
    }
}
