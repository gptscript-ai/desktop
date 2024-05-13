export const dynamic = 'force-dynamic' // defaults to autover'
import { parse, stringify, type Block, Tool} from '@gptscript-ai/gptscript'
import { promises as fs } from 'fs';
import path from 'path';
import type { Positions } from '../route';


export async function PUT(
    req: Request,
    { params }: { params: { slug: string } }
)  {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts'
        const { name, tool } = params as any;;

        const script = await parse(path.join(scriptsPath,`${name}.gpt`));
        const updatedScript = updateScript(script, tool, (await req.json()) as Tool);

        await fs.writeFile(path.join(scriptsPath,`${name}.gpt`), await stringify(updatedScript));
        return Response.json(await parse(path.join(scriptsPath,`${name}.gpt`)));
    } catch (e) {
        if (`${e}`.includes('no such file')){
            return Response.json({ error: '.gpt file not found' }, { status: 404 });
        } 
        return Response.json({ error: e }, {status: 500});
    }
}

const updateScript = (script: Block[], tool: string, updatedTool: Tool) => {
    const toolIndex = script.findIndex(block => block.type === 'tool' && block.name === tool);
    if (toolIndex === -1) {
        throw new Error(`Tool ${tool} not found in script`);
    }

    // update any references to the tool in other tools if the name changed
    if (tool !== updatedTool.name) {
        script.forEach(block => {
            if (block.type === 'tool' && block.name !== tool) {
                block.tools = block.tools.map(t => t === tool ? updatedTool.name : t);
            }
        });
    }



    script[toolIndex] = updatedTool;
    return script;
}