import { ToolDef } from '@gptscript-ai/gptscript';
import { getKnowledgeBinaryPath } from '@/actions/knowledge/knowledge';

export const KNOWLEDGE_NAME = 'file-retrieval';

export function gatewayTool(): string {
  return 'github.com/gptscript-ai/knowledge@v0.4.10-gateway.7';
}

export function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const value = parts?.pop()?.split(';').shift();
    if (value) {
      return decodeURIComponent(value);
    }
  }
  return '';
}

export async function assistantKnowledgeTool(
  scriptId: number,
  topK: number
): Promise<ToolDef> {
  const knowledgePath = await getKnowledgeBinaryPath();
  return {
    name: KNOWLEDGE_NAME,
    description:
      'Retrieve information from files uploaded to the assistant. Use it to answer questions from the user and ALWAYS give a proper citation to the best of your abilities, including the source references (filename, page, etc.).',
    type: 'tool',
    credentials: [
      'github.com/gptscript-ai/gateway-creds as github.com/gptscript-ai/gateway',
    ],
    arguments: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query to search in a knowledge base',
        },
      },
    },
    instructions: `#!${knowledgePath} retrieve --dataset ${scriptId.toString()} --top-k ${topK} "\${QUERY}"`,
  } as ToolDef;
}
