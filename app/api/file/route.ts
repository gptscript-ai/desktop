export const dynamic = 'force-dynamic' // defaults to auto
import { promises as fs } from 'fs';

export async function GET() {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts'
        const files = await fs.readdir(scriptsPath);
        const gptFiles = files.filter(file => file.endsWith('.gpt'));
        
        if (gptFiles.length === 0) 
            return Response.json({ error: 'no .gpt files found' }, { status: 404 });
        return Response.json(gptFiles);
    } catch (e) {
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

// export async function DELETE(req: Request) {
//     try {
//         const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts';
//         const { name } = req.params as any;
//         await fs.unlink(`${scriptsPath}/${name}`);
//         return Response.json({ success: true });
//     } catch (e) {
//         return Response.json({ error: e }, { status: 500 });
//     }
// }

// export async function PUT(req: Request) {
//     try {
//         const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts';
//         const { name } = req.params as any;
//         const content = await req.text();

//         await fs.rename(`${scriptsPath}/${name}`, `${scriptsPath}/${name}.bak`);
//         await fs.writeFile(`${scriptsPath}/${name}`, content);
//         return Response.json({ success: true });
//     } catch (e) {
//         return Response.json({ error: e }, { status: 500 });
//     }
// }