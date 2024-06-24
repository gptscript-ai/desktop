"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { WORKSPACE_DIR } from '@/config/env';
import { Dirent } from 'fs';

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(path.join(WORKSPACE_DIR,file.name), buffer);
    revalidatePath("/");
}

export async function openFile(path: string): Promise<string> {
    try {
        const buffer = await fs.readFile(path);
        const blob = new Blob([buffer]);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error opening file:", error);
        throw error;
    }
}
export async function deleteFile(path: string) {
    try {
        await fs.unlink(path);
        revalidatePath("/");
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

export async function lsWorkspaceFiles(): Promise<string> {
    try {
        const dirents = await fs.readdir(WORKSPACE_DIR, { withFileTypes: true });
        const filesOnly = dirents.filter((dirent: Dirent) => !dirent.isDirectory());
        return JSON.stringify(filesOnly);
    } catch (e) {
        throw e;
    }
};
