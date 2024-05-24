export const dynamic = 'force-dynamic' // defaults to auto
import { Client } from '@gptscript-ai/gptscript'
import { promises as fs } from 'fs';

const gptscript = new Client();

export async function GET() {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts';
        const files = await fs.readdir(scriptsPath);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));
        
        if (gptFiles.length === 0) 
            return Response.json({ error: 'no .gpt files found' }, { status: 404 });

        const scripts: Record<string, string> = {};
        for (const file of gptFiles) {
            const script = await gptscript.parse(`${scriptsPath}/${file}`);
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
        console.log(e)
        return Response.json({ error: e }, { status: 500 });
    }    
}

export async function POST(_req: Request) {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts';
        const files = await fs.readdir(scriptsPath);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));

        let id = 0;
        let newFileName = `new-file-${id}.gpt`;
        while (gptFiles.includes(newFileName)) {
            id++;
            newFileName = `new-file-${id}.gpt`;
        }
        await fs.writeFile(`${scriptsPath}/${newFileName}`, '---\nname: main');
        return Response.json({ file: newFileName });
    } catch (e) {
        return Response.json({ error: e }, { status: 500 });
    }
}
