'use server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { KNOWLEDGE_DIR } from '@/config/env';

const execPromise = promisify(exec);

export async function ingest(
  workspace: string,
  token: string | undefined,
  datasetID?: string | null
): Promise<void> {
  if (!datasetID) {
    throw new Error('Dataset ID is required');
  }
  const dir = path.join(path.dirname(workspace), 'knowledge');
  const knowledgeBinaryPath = process.env.KNOWLEDGE_BIN;
  const { stdout, stderr } = await execPromise(
    `${knowledgeBinaryPath} ingest --prune --dataset ${datasetID} ${dir.replace(/ /g, '\\ ')}`,
    { env: { ...process.env, GPTSCRIPT_GATEWAY_API_KEY: token } }
  );
  const combinedOutput = stdout + stderr;
  console.log(`logs for ingesting dataset ${datasetID}: `, combinedOutput);
  return;
}

export async function deleteDataset(datasetID: string): Promise<void> {
  const datasetDir = path.join(KNOWLEDGE_DIR(), 'script_data', datasetID);
  if (!fs.existsSync(datasetDir)) {
    return;
  }
  await execPromise(`${process.env.KNOWLEDGE_BIN} delete-dataset ${datasetID}`);
  await fs.promises.rm(datasetDir, {
    recursive: true,
    force: true,
  });
  return;
}

export async function firstIngestion(
  scriptId: string,
  files: string[]
): Promise<boolean> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  return !fs.existsSync(dir) && files.length > 0;
}

export async function ensureFilesIngested(
  files: string[],
  updateOnly: boolean,
  scriptId: string,
  token: string
): Promise<string> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  if (!fs.existsSync(dir) && files.length > 0) {
    fs.mkdirSync(dir, { recursive: true });
  } else if (!fs.existsSync(dir) && files.length === 0) {
    // if there are no files in the directory and no dropped files, do nothing
    return '';
  }

  for (const file of files) {
    const filePath = path.join(dir, path.basename(file));
    try {
      if (!fs.existsSync(filePath)) {
        await fs.promises.copyFile(file, filePath);
      }
    } catch (error) {
      return `Error copying file ${file}: ${error}`;
    }
  }

  if (!updateOnly) {
    try {
      const filesInDir = await fs.promises.readdir(dir);
      for (const fileName of filesInDir) {
        const fullPath = path.join(dir, fileName);
        const fileInDroppedFiles = files.find(
          (file) => path.basename(file) === path.basename(fullPath)
        );
        if (!fileInDroppedFiles || !files || files.length === 0) {
          await fs.promises.unlink(fullPath);
        }
      }
    } catch (error) {
      return `Error deleting files: ${error}`;
    }
  }

  try {
    await runKnowledgeIngest(
      scriptId,
      path.join(KNOWLEDGE_DIR(), 'script_data', scriptId),
      token
    );
  } catch (error) {
    console.error(error);
    return `Error running knowledge ingestion: ${error}`;
  }

  return '';
}

async function runKnowledgeIngest(
  id: string,
  knowledgePath: string,
  token: string
): Promise<void> {
  const { stdout, stderr } = await execPromise(
    `${process.env.KNOWLEDGE_BIN} ingest --prune --dataset ${id} ./data`,
    {
      cwd: knowledgePath,
      env: { ...process.env, GPTSCRIPT_GATEWAY_API_KEY: token },
    }
  );
  const combinedOutput = stdout + stderr;
  console.log(`logs for ingesting dataset ${id}: `, combinedOutput);
  return;
}

export async function getFiles(scriptId: string): Promise<string[]> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  if (!fs.existsSync(dir)) {
    return [];
  }
  const files = await fs.promises.readdir(dir);
  return files.map((file) => path.join(dir, file));
}

export async function datasetExists(scriptId: string): Promise<boolean> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  return fs.existsSync(dir);
}

export async function getKnowledgeBinaryPath(): Promise<string> {
  return process.env.KNOWLEDGE_BIN || 'knowledge';
}
