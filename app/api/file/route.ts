export const dynamic = 'force-dynamic' // defaults to auto
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { SCRIPTS_PATH, gpt } from '@/config/env';

export async function GET() {
    try {
        const files = await fs.readdir(SCRIPTS_PATH());
        const gptFiles = files.filter(file => file.endsWith('.gpt'));
        
        if (gptFiles.length === 0) 
            return NextResponse.json({ error: 'no .gpt files found' }, { status: 404 });

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

        return NextResponse.json(scripts);
    } catch (e) {
        const error = e as NodeJS.ErrnoException;
        if (error.code === 'ENOENT'){
            return NextResponse.json({ error: 'no .gpt files found' }, { status: 404 });
        }
        console.error(e)
        return NextResponse.json({ error: e }, { status: 500 });
    }    
}

export async function POST(_req: Request) {
    try {
        const scriptsPath = SCRIPTS_PATH()
        await fs.mkdir(scriptsPath, { recursive: true })

        const files = await fs.readdir(scriptsPath);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));

        let id = 0;
        let newFileName = `new-file-${id}.gpt`;
        while (gptFiles.includes(newFileName)) {
            id++;
            newFileName = `new-file-${id}.gpt`;
        }
        await fs.writeFile(`${scriptsPath}/${newFileName}`, '---\nname: main');
        return NextResponse.json({ file: newFileName });
    } catch (e) {
        return NextResponse.json({ error: e }, { status: 500 });
    }
}
