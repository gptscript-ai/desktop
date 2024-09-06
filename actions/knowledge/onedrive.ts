'use server';
import fs from 'fs';
import path from 'path';
import { WORKSPACE_DIR } from '@/config/env';
import { runSyncTool } from '@/actions/knowledge/tool';

export async function isOneDriveConfigured() {
  return fs.existsSync(
    path.join(
      WORKSPACE_DIR(),
      'knowledge',
      'integrations',
      'onedrive',
      'metadata.json'
    )
  );
}

export async function getOneDriveFiles(): Promise<
  Map<string, { url: string; fileName: string; displayName: string }>
> {
  const dir = path.join(
    WORKSPACE_DIR(),
    'knowledge',
    'integrations',
    'onedrive'
  );
  const metadataFromFile = fs.readFileSync(path.join(dir, 'metadata.json'));
  const metadata = JSON.parse(metadataFromFile.toString());
  const result = new Map<
    string,
    { url: string; fileName: string; displayName: string }
  >();
  for (const documentID in metadata) {
    result.set(path.join(dir, documentID, metadata[documentID].fileName), {
      url: metadata[documentID].url,
      fileName: metadata[documentID].fileName,
      displayName: metadata[documentID].displayName,
    });
  }
  return result;
}

export async function syncSharedLink(link: string): Promise<void> {
  const dir = path.join(
    WORKSPACE_DIR(),
    'knowledge',
    'integrations',
    'onedrive'
  );
  const externalLinkFile = path.join(dir, 'externalLinks.json');
  if (!fs.existsSync(externalLinkFile)) {
    fs.writeFileSync(externalLinkFile, '{}');
  }

  const externalLink = JSON.parse(fs.readFileSync(externalLinkFile).toString());
  externalLink[link] = 'true';
  fs.writeFileSync(externalLinkFile, JSON.stringify(externalLink));

  await runSyncTool(true, 'onedrive');
  return;
}

export async function runOneDriveSync(authed: boolean): Promise<void> {
  return runSyncTool(authed, 'onedrive');
}
