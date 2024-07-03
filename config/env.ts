import { GPTScript } from "@gptscript-ai/gptscript"

export const SCRIPTS_PATH = () => process.env.SCRIPTS_PATH || "gptscripts";
export const WORKSPACE_DIR = () => process.env.GPTSCRIPT_WORKSPACE_DIR || "";
export const THREADS_PATH = () => process.env.THREADS_PATH || "threads";

export const set_WORKSPACE_DIR = (dir: string) => process.env.GPTSCRIPT_WORKSPACE_DIR = dir;
export const set_SCRIPTS_PATH = (dir: string) => process.env.SCRIPTS_PATH = dir;

let gptscript: GPTScript | null = null;
export function gpt() {
    if (!gptscript) {
        gptscript = new GPTScript()
    };
    return gptscript;
}