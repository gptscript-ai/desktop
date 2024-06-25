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