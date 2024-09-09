'use server';

import {
  GPTScript,
  PromptFrame,
  Run,
  RunEventType,
} from '@gptscript-ai/gptscript';
import path from 'path';
import { WORKSPACE_DIR } from '@/config/env';
import fs from 'fs';

export async function runSyncTool(
  authed: boolean,
  tool: 'notion' | 'onedrive'
): Promise<void> {
  const gptscript = new GPTScript({
    DefaultModelProvider: 'github.com/gptscript-ai/gateway-provider',
  });

  let toolUrl = '';
  if (tool === 'notion') {
    toolUrl = 'github.com/gptscript-ai/knowledge-notion-integration';
  } else if (tool === 'onedrive') {
    toolUrl = 'github.com/gptscript-ai/knowledge-onedrive-integration';
  }
  const runningTool = await gptscript.run(toolUrl, {
    prompt: true,
  });
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

// syncFiles syncs all files only when they are selected
// todo: we can stop syncing once file is no longer used by any other script
export async function syncFiles(
  selectedFiles: string[],
  type: 'notion' | 'onedrive'
): Promise<void> {
  const dir = path.join(WORKSPACE_DIR(), 'knowledge', 'integrations', type);
  const metadataFromFiles = fs.readFileSync(path.join(dir, 'metadata.json'));
  const metadata = JSON.parse(metadataFromFiles.toString());
  for (const file of selectedFiles) {
    const baseDir = path.dirname(path.dirname(file));
    if (baseDir === dir) {
      const documentID = path.basename(path.dirname(file));
      const detail = metadata[documentID];
      detail.sync = true;
      metadata[documentID] = detail;
    }
  }
  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata));
  await runSyncTool(true, type);
  return;
}
