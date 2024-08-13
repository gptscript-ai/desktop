import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));  // Directory where this script resides

export function getGitInfo() {
    try {
        const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
        const isDirty = execSync('git status --porcelain').toString().trim() !== '';
        return `${commitHash}${isDirty ? '-dirty' : ''}`;
    } catch (error) {
        console.error('Error fetching Git info:', error);
        return '0.0.0';
    }
}

export function embedVersionInfo() {
    const versionInfo = process.env.GITHUB_REF_NAME || getGitInfo();
    const versionFilePath = join(currentDir, 'version.json');

    writeFileSync(versionFilePath, JSON.stringify({ version: versionInfo }, null, 2));
    console.log(`Version information written to ${versionFilePath}: ${versionInfo}`);
}

export function ensureDirExists(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
