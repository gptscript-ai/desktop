'use server';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function ingest(
  workspace: string,
  token: string | undefined,
  datasetID?: string | null
): Promise<void> {
  if (!datasetID) {
    throw new Error('Dataset ID is required');
  }
  const dir = path.join(workspace, 'knowledge');
  let knowledgeBinaryPath = '';
  if (process.env.KNOWLEDGE_BIN) {
    knowledgeBinaryPath = process.env.KNOWLEDGE_BIN;
  } else {
    if (process.env.NODE_ENV === 'production') {
      knowledgeBinaryPath = path.join(
        process.resourcesPath,
        'bin',
        'knowledge' + (process.platform === 'win32' ? '.exe' : '')
      );
    } else {
      knowledgeBinaryPath = path.join(process.cwd(), 'bin', 'knowledge');
    }
  }
  await execPromise(
    `${knowledgeBinaryPath} ingest --dataset ${datasetID} ${dir.replace(/ /g, '\\ ')}`,
    { env: { ...process.env, GPTSCRIPT_GATEWAY_API_KEY: token } }
  );
  return;
}
