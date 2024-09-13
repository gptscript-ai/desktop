'use server';

import fs from 'fs';
import path from 'path';
import { WORKSPACE_DIR } from '@/config/env';
import { FileDetail } from '@/model/knowledge';

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

export async function importFiles(files: string[]) {
  const result: Map<string, FileDetail> = new Map();

  for (const file of files) {
    // check if filepath lives in notion or onedrive integration folders
    // The file should live in a folder with the pattern ${WORKSPACE_DIR}/knowledge/integrations/${type}/${DocumentId}/${fileName}
    const baseDir = path.dirname(path.dirname(file));
    let type = path.basename(baseDir);
    if (
      type !== 'notion' &&
      type !== 'onedrive' &&
      baseDir !== path.join(WORKSPACE_DIR(), 'knowledge', 'integrations', type)
    ) {
      type = 'local';
    }
    result.set(file, {
      fileName: path.basename(file),
      size: await getFileOrFolderSizeInKB(file),
      type: type as any,
    });
  }

  return result;
}
