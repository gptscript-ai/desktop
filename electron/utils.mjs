import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

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

export function ensureDirExists(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
