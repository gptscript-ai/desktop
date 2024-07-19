export const dynamic = 'force-dynamic' // defaults to autover'
import {NextResponse} from "next/server";
import {type Block, Tool} from '@gptscript-ai/gptscript'
import {Positions} from '../route';
import {promises as fs} from 'fs';
import path from 'path';
import {SCRIPTS_PATH, gpt} from '@/config/env';

// Create a datastructure for the tool bindings in the UI
export async function PUT(
    req: Request,
    {params}: { params: { slug: string } }
) {
    try {
        // @ts-disable
        const {name, tool} = params as any;

        const script = await gpt().parse(path.join(SCRIPTS_PATH(), `${name}.gpt`));
        const updatedScript = updateScript(script, tool, (await req.json()) as Tool);

        await fs.writeFile(path.join(SCRIPTS_PATH(), `${name}.gpt`), await gpt().stringify(updatedScript));
        return NextResponse.json(await gpt().parse(path.join(SCRIPTS_PATH(), `${name}.gpt`)));
    } catch (e) {
        if (`${e}`.includes('no such file')) {
            return NextResponse.json({error: '.gpt file not found'}, {status: 404});
        }
        console.error(e)
        return NextResponse.json({error: e}, {status: 500});
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
                block.tools = block.tools?.map(t => t === tool ? updatedTool.name : t) as string[] | undefined;
            } else if (block.type === 'text') {
                const positions = JSON.parse(block.content) as Positions
                block.content = JSON.stringify(
                    Object.fromEntries(Object.entries(positions).map(
                            ([key, value]) => [key === tool ? updatedTool.name : key, value]
                        )
                    )) + '\n';
            }
            return block;
        });
    }
    updatedScript[toolIndex] = updatedTool;
    return updatedScript;
}
