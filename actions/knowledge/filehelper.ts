'use server';

import fs from 'fs';
import path from 'path';
import { FileDetail } from '@/actions/knowledge/util';

export async function getFileOrFolderSizeInKB(
  filePath: string
): Promise<number> {
  const stats = fs.statSync(filePath);

  if (stats.isFile()) {
    // Convert file size from bytes to KB
    return parseFloat((stats.size / 1024).toFixed(2));
  }

  if (stats.isDirectory()) {
    const files = fs.readdirSync(filePath);
    const folderSize = await Promise.all(
      files.map(async (file) => {
        const currentPath = path.join(filePath, file);
        return await getFileOrFolderSizeInKB(currentPath);
      })
    ).then((sizes) => sizes.reduce((total, size) => total + size, 0));

    return parseFloat(folderSize.toFixed(2));
  }

  return 0;
}

export async function getBasename(filePath: string): Promise<string> {
  return path.basename(filePath);
}

export async function importFiles(
  files: string[],
  type: 'local' | 'notion'
): Promise<Map<string, FileDetail>> {
  const result: Map<string, FileDetail> = new Map();

  for (const file of files) {
    result.set(file, {
      fileName: path.basename(file),
      size: await getFileOrFolderSizeInKB(file),
      type: type,
    });
  }

  return result;
}
