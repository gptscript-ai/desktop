'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { Dirent } from 'fs';

export async function uploadFile(
  workspace: string,
  formData: FormData,
  isKnowledge?: boolean
) {
  if (isKnowledge) {
    workspace = path.join(path.dirname(workspace), 'knowledge');
  }
  const file = formData.get('file') as File;
  await fs.mkdir(workspace, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  await fs.writeFile(path.join(workspace, file.name), buffer);
  revalidatePath('/');
}

export async function deleteFile(path: string) {
  try {
    await fs.unlink(path);
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

export async function lsKnowledgeFiles(workspace: string): Promise<string> {
  return lsFiles(path.join(path.dirname(workspace), 'knowledge'));
}

export async function deleteKnowledgeFile(workspace: string, name: string) {
  return deleteFile(path.join(path.dirname(workspace), 'knowledge', name));
}

export async function clearThreadKnowledge(workspace: string) {
  return fs.rm(path.join(path.dirname(workspace), 'knowledge'), {
    recursive: true,
    force: true,
  });
}

export async function lsFiles(dir: string): Promise<string> {
  let files: Dirent[] = [];
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    files = dirents.filter((dirent: Dirent) => !dirent.isDirectory());
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw e;
    }
  }

  return JSON.stringify(files);
}
