export const dynamic = 'force-dynamic' // defaults to autover'
import { Client, type Block, Tool} from '@gptscript-ai/gptscript'
import { Positions } from '../route';
import { promises as fs } from 'fs';
import path from 'path';

const gptscript = new Client();

// Create a datastructure for the tool bindings in the UI
export async function PUT(
    req: Request,
    { params }: { params: { slug: string } }
)  {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts'
        const { name, tool } = params as any;

        const script = await gptscript.parse(path.join(scriptsPath,`${name}.gpt`));
        const updatedScript = updateScript(script, tool, (await req.json()) as Tool);

        await fs.writeFile(path.join(scriptsPath,`${name}.gpt`), await gptscript.stringify(updatedScript));
        return Response.json(await gptscript.parse(path.join(scriptsPath,`${name}.gpt`)));
    } catch (e) {
        if (`${e}`.includes('no such file')){
            return Response.json({ error: '.gpt file not found' }, { status: 404 });
        }
        console.error(e)
        return Response.json({ error: e }, {status: 500});
    }
}

const updateScript = (script: Block[], tool: string, updatedTool: Tool) => {
    const toolIndex = script.findIndex(block => block.type === 'tool' && block.name === tool);
    if (toolIndex === -1) {
        throw new Error(`Tool ${tool} not found in script`);
    }

    let updatedScript = script;
    if (tool !== updatedTool.name) {
        updatedScript = script.map(block => {
            if (block.type === 'tool' && block.name !== tool) {
                block.tools = block.tools?.map(t => t === tool ? updatedTool.name : t);
            } else if (block.type === 'text') {
                const positions = JSON.parse(block.content) as Positions
                block.content = JSON.stringify(
                    Object.fromEntries(Object.entries(positions).map(
                        ([key, value]) => [key === tool ? updatedTool.name : key, value]
                    )
                ))+ '\n';
            }
            return block;
        });
    }
    updatedScript[toolIndex] = updatedTool;
    return updatedScript;
}