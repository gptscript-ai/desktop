"use server"
import { Tool } from '@gptscript-ai/gptscript';
import { GPTScript } from '@gptscript-ai/gptscript';
import { SCRIPTS_PATH } from '@/config/env';

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
