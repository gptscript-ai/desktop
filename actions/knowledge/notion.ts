'use server';

import fs from 'fs';
import path from 'path';
import { WORKSPACE_DIR } from '@/config/env';
import {
  GPTScript,
  PromptFrame,
  Run,
  RunEventType,
} from '@gptscript-ai/gptscript';

export async function isNotionConfigured() {
  return fs.existsSync(
    path.join(
      WORKSPACE_DIR(),
      'knowledge',
      'integrations',
      'notion',
      'metadata.json'
    )
  );
}

function readFilesRecursive(dir: string): string[] {
  let results: string[] = [];

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (file === 'metadata.json') return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursively read the directory
      results = results.concat(readFilesRecursive(filePath));
    } else {
      // Add the file path to the results
      results.push(filePath);
    }
  });

  return results;
}

export async function getNotionFiles(): Promise<
  Map<string, { url: string; fileName: string }>
> {
  const dir = path.join(WORKSPACE_DIR(), 'knowledge', 'integrations', 'notion');
  const filePaths = readFilesRecursive(dir);
  const metadataFromFiles = fs.readFileSync(path.join(dir, 'metadata.json'));
  const metadata = JSON.parse(metadataFromFiles.toString());
  const result = new Map<string, { url: string; fileName: string }>();
  for (const filePath of filePaths) {
    const pageID = path.basename(path.dirname(filePath));
    result.set(filePath, {
      url: metadata[pageID].url,
      fileName: path.basename(filePath),
    });
  }

  return result;
}

export async function runNotionSync(authed: boolean): Promise<void> {
  const gptscript = new GPTScript({
    DefaultModelProvider: 'github.com/gptscript-ai/gateway-provider',
  });

  const runningTool = await gptscript.run(
    'github.com/gptscript-ai/knowledge-notion-integration',
    {
      prompt: true,
    }
  );
  if (!authed) {
    const handlePromptEvent = (runningTool: Run) => {
      return new Promise<string>((resolve) => {
        runningTool.on(RunEventType.Prompt, (data: PromptFrame) => {
          resolve(data.id);
        });
      });
    };

    const id = await handlePromptEvent(runningTool);
    await gptscript.promptResponse({ id, responses: {} });
  }
  await runningTool.text();
  return;
}
