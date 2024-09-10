'use server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { KNOWLEDGE_DIR } from '@/config/env';
import { getFileOrFolderSizeInKB } from '@/actions/knowledge/filehelper';
import { FileDetail } from '@/model/knowledge';

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
  files: Map<string, FileDetail>
): Promise<boolean> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  return !fs.existsSync(dir) && files.size > 0;
}

export async function ensureFiles(
  files: Map<string, FileDetail>,
  scriptId: string,
  updateOnly: boolean
): Promise<void> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  if (!fs.existsSync(dir) && files.size > 0) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const [location, file] of Array.from(files.entries())) {
    if (!fs.existsSync(path.join(dir, file.type))) {
      fs.mkdirSync(path.join(dir, file.type), { recursive: true });
    }
    const filePath = path.join(dir, file.type, path.basename(location));
    if (!fs.existsSync(filePath)) {
      if (file.type === 'local') {
        await fs.promises.copyFile(location, filePath);
      } else if (file.type === 'notion' || file.type === 'onedrive') {
        if (
          fs.existsSync(filePath) &&
          fs.lstatSync(filePath).isSymbolicLink()
        ) {
          continue;
        }
        await fs.promises.symlink(location, filePath);
      }
    }
  }

  if (!updateOnly) {
    for (const type of ['local', 'notion', 'onedrive']) {
      if (!fs.existsSync(path.join(dir, type))) {
        continue;
      }
      const filesInDir = await fs.promises.readdir(path.join(dir, type));
      for (const fileName of filesInDir) {
        const fullPath = path.join(dir, type, fileName);
        const fileInDroppedFiles = Array.from(files.keys()).find(
          (file) => path.basename(file) === path.basename(fullPath)
        );
        if (!fileInDroppedFiles || !files || files.size === 0) {
          await fs.promises.unlink(fullPath);
        }
      }
    }
  }

 return;
}

export async function runKnowledgeIngest(
  id: string,
  token: string
): Promise<void> {
  if (!fs.existsSync(path.join(KNOWLEDGE_DIR(), 'script_data', id, 'data'))) {
    return;
  }
  const { stdout, stderr } = await execPromise(
    `${process.env.KNOWLEDGE_BIN} ingest --prune --dataset ${id} ./data`,
    {
      cwd: path.join(KNOWLEDGE_DIR(), 'script_data', id),
      env: { ...process.env, GPTSCRIPT_GATEWAY_API_KEY: token },
    }
  );
  const combinedOutput = stdout + stderr;
  console.log(`logs for ingesting dataset ${id}: `, combinedOutput);
  return;
}

export async function getFiles(
  scriptId: string
): Promise<Map<string, FileDetail>> {
  const result = new Map<string, FileDetail>();
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  if (!fs.existsSync(dir)) {
    return result;
  }
  for (const type of ['local', 'notion', 'onedrive']) {
    if (!fs.existsSync(path.join(dir, type))) {
      continue;
    }
    const files = await fs.promises.readdir(path.join(dir, type));
    for (const file of files) {
      let filePath = path.join(dir, type, file);
      if (fs.lstatSync(filePath).isSymbolicLink()) {
        filePath = await fs.promises.readlink(filePath);
      }
      result.set(filePath, {
        type: type as any,
        fileName: file,
        size: await getFileOrFolderSizeInKB(path.join(dir, type, file)),
      });
    }
  }
  return result;
}

export async function datasetExists(scriptId: string): Promise<boolean> {
  const dir = path.join(KNOWLEDGE_DIR(), 'script_data', scriptId, 'data');
  return fs.existsSync(dir);
}
