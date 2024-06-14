"use server"
import { Tool } from '@gptscript-ai/gptscript';
import { GPTScript } from '@gptscript-ai/gptscript';
import { SCRIPTS_PATH } from '@/config/env';
import { promises as fs } from 'fs';

const external = (file: string): boolean => {
    return file.startsWith('http') || file.startsWith('https') || file.startsWith('github.com')
};

export const path = async (file: string): Promise<string> => {
    if (!external(file)) return `${SCRIPTS_PATH}/${file}.gpt`;
    return file;
};

export const fetchScript = async (file: string): Promise<Tool> => {
    if (!external(file)) file = `${SCRIPTS_PATH}/${file}.gpt`;

    const gptscript = new GPTScript();
    try {
        const script = await gptscript.parse(file);
        for (let tool of script) {
            if (tool.type === 'text') continue;
            return tool;
        }
        return {} as Tool;
    } catch (e) {
        if (`${e}`.includes('no such file')){
            return {} as Tool;
        } 
        throw e;
    }
}

export const fetchScripts = async (): Promise<Record<string, string>> => {
    try {
        const files = await fs.readdir(SCRIPTS_PATH);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));
        
        if (gptFiles.length === 0) throw new Error('no files found in scripts directory');

        const gptscript = new GPTScript();
        const scripts: Record<string, string> = {};
        for (const file of gptFiles) {
            const script = await gptscript.parse(`${SCRIPTS_PATH}/${file}`);
            let description = '';
            for (let tool of script) {
                if (tool.type === 'text') continue;
                description = tool.description;
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