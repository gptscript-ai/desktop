'use server';

import fs from 'fs';
import path from 'path';
import { WORKSPACE_DIR } from '@/config/env';
import { runSyncTool } from '@/actions/knowledge/tool';

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

export async function getNotionFiles() {
  const dir = path.join(WORKSPACE_DIR(), 'knowledge', 'integrations', 'notion');
  const metadataFromFiles = fs.readFileSync(path.join(dir, 'metadata.json'));
  const metadata = JSON.parse(metadataFromFiles.toString());
  const result = new Map<string, { url: string; fileName: string }>();
  for (const pageID in metadata) {
    const filePath = path.join(dir, pageID, metadata[pageID].filename);
    result.set(filePath, {
      url: metadata[pageID].url,
      fileName: path.basename(filePath),
    });
  }

  return result;
}

export async function runNotionSync(authed: boolean): Promise<void> {
  return runSyncTool(authed, 'notion');
}
