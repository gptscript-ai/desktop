'use server';

import { GATEWAY_URL, THREADS_DIR, WORKSPACE_DIR } from '@/config/env';
import { gpt } from '@/config/env';
import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = 'state.json';
const META_FILE = 'meta.json';

export type Thread = {
  state: string;
  meta: ThreadMeta;
};

export type ThreadMeta = {
  name: string;
  description: string;
  created: Date;
  updated: Date;
  id: string;
  scriptId?: string;
  script: string;
  workspace: string;
};

export async function init() {
  const threadsDir = THREADS_DIR();
  try {
    await fs.access(threadsDir);
  } catch (error) {
    await fs.mkdir(threadsDir, { recursive: true });
  }
}

export async function getThreads() {
  const threads: Thread[] = [];
  const threadsDir = THREADS_DIR();

  let threadDirs: void | string[] = [];
  try {
    threadDirs = await fs.readdir(threadsDir);
  } catch (e) {
    return [];
  }

  if (!threadDirs) return [];

  for (const threadDir of threadDirs) {
    const threadPath = path.join(threadsDir, threadDir);
    const files = await fs.readdir(threadPath);

    const thread: Thread = {} as Thread;
    if (files.includes(STATE_FILE)) {
      const state = await fs.readFile(
        path.join(threadPath, STATE_FILE),
        'utf-8'
      );
      thread.state = state;
    }
    if (files.includes(META_FILE)) {
      const meta = await fs.readFile(path.join(threadPath, META_FILE), 'utf-8');
      thread.meta = JSON.parse(meta) as ThreadMeta;
    } else {
      continue;
    }
    threads.push(thread);
  }

  return threads.sort((a, b) => (a.meta?.updated > b.meta?.updated ? -1 : 1));
}

export async function getThread(id: string) {
  const threads = await getThreads();
  const thread = threads.find((thread) => thread.meta.id === id);
  if (!thread) return null;
  // falsy check for workspace to account for old threads that don't have a workspace
  if (thread.meta.workspace == undefined)
    thread.meta.workspace = WORKSPACE_DIR();
  return thread;
}

async function newThreadName(): Promise<string> {
  const threads = await getThreads();
  return `New Thread${threads.length ? ' ' + (threads.length + 1) : ''}`;
}

export async function generateThreadName(
  firstMessage: string
): Promise<string> {
  const summary = await gpt().evaluate({
    instructions: `Summarize the following message with a descriptive but brief thread name: ${firstMessage}`,
  });
  return summary.text();
}

export async function createThread(
  script: string,
  firstMessage?: string,
  scriptId?: string,
  workspace?: string
): Promise<Thread> {
  const threadsDir = THREADS_DIR();

  // will probably want something else for this
  const id = Math.random().toString(36).substring(7);
  const threadPath = path.join(threadsDir, id);
  await fs.mkdir(threadPath, { recursive: true });

  const threadMeta = {
    name: await newThreadName(),
    description: '',
    created: new Date(),
    updated: new Date(),
    workspace: workspace ?? WORKSPACE_DIR(),
    id,
    scriptId: scriptId || '',
    script,
  };
  const threadState = '';

  await fs.writeFile(
    path.join(threadPath, META_FILE),
    JSON.stringify(threadMeta)
  );
  await fs.writeFile(path.join(threadPath, STATE_FILE), '');

  if (firstMessage) {
    const generatedThreadName = await generateThreadName(firstMessage);
    await renameThread(id, generatedThreadName);
  }

  return {
    state: threadState,
    meta: threadMeta,
  };
}

export async function deleteThread(id: string) {
  const threadsDir = THREADS_DIR();
  const threadPath = path.join(threadsDir, id);
  await fs.rm(threadPath, { recursive: true });
}

export async function renameThread(id: string, name: string) {
  const threadsDir = THREADS_DIR();
  const threadPath = path.join(threadsDir, id);
  const meta = await fs.readFile(path.join(threadPath, META_FILE), 'utf-8');
  const threadMeta = JSON.parse(meta) as ThreadMeta;
  threadMeta.name = name;
  await fs.writeFile(
    path.join(threadPath, META_FILE),
    JSON.stringify(threadMeta)
  );
}

export async function updateThreadWorkspace(id: string, workspace: string) {
  const threadsDir = THREADS_DIR();
  const threadPath = path.join(threadsDir, id);
  const meta = await fs.readFile(path.join(threadPath, META_FILE), 'utf-8');
  const threadMeta = JSON.parse(meta) as ThreadMeta;
  threadMeta.workspace = workspace;
  await fs.writeFile(
    path.join(threadPath, META_FILE),
    JSON.stringify(threadMeta)
  );
}
