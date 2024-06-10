export const dynamic = 'force-dynamic' // defaults to auto
import { GPTScript } from '@gptscript-ai/gptscript'
import { promises as fs } from 'fs';
import { SCRIPTS_PATH } from '@/config/env';

const gptscript = new GPTScript();

export async function GET() {
    try {
        const files = await fs.readdir(SCRIPTS_PATH);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));
        
        if (gptFiles.length === 0) 
            return Response.json({ error: 'no .gpt files found' }, { status: 404 });

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

        return Response.json(scripts);
    } catch (e) {
        const error = e as NodeJS.ErrnoException;
        if (error.code === 'ENOENT'){
            return Response.json({ error: 'no .gpt files found' }, { status: 404 });
        }
        return Response.json({ error: e }, { status: 500 });
    }    
}

export async function POST(_req: Request) {
    try {
        const files = await fs.readdir(SCRIPTS_PATH);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));

        let id = 0;
        let newFileName = `new-file-${id}.gpt`;
        while (gptFiles.includes(newFileName)) {
            id++;
            newFileName = `new-file-${id}.gpt`;
        }
        await fs.writeFile(`${SCRIPTS_PATH}/${newFileName}`, '---\nname: main');
        return Response.json({ file: newFileName });
    } catch (e) {
        return Response.json({ error: e }, { status: 500 });
    }
}
