import path from 'node:path'
import os from 'node:os'
import * as fs from 'node:fs/promises'
import type { H3Event } from 'h3'
import { Charsets, randomStr } from '@/utils/string'

export const CACHE_DIR = 'cache'
export const GPT_FILE = 'tool.gpt'
export const PREF_FILE = 'prefs.json'
export const SESSION_DIR = 'sessions'
export const SESS_COOKIE = 'GPTSTUDIO_SESS'
export const STATE_FILE = 'state.txt'
export const THREAD_DIR = 'threads'
export const THREAD_META_FILE = 'thread.json'
export const THREAD_HISTORY_FILE = 'history.json'
export const TOOL_DIR = 'tools'
export const WORKSPACE_DIR = 'workspace'

export async function mkdirp(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK)
  } catch (e) {
    console.info('Making directory', path)
    await fs.mkdir(path, { recursive: true })
  }
}

export async function dataDir() {
  if (process.env.DATA_DIR) {
    return  process.env.DATA_DIR
  }

  const out = path.join(os.homedir(), 'Documents', 'GPTStudio')

  await mkdirp(out)

  return out
}

export async function cacheDir() {
  const out = path.join(await dataDir(), CACHE_DIR)

  await mkdirp(out)

  return out
}

export async function toolDir() {
  if (process.env.TOOL_DIR) {
    return process.env.TOOL_DIR
  }

  const out = path.join(await dataDir(), TOOL_DIR)

  await mkdirp(out)

  return out
}

declare module 'h3' {
  interface H3EventContext {
    sessionId: string
  }
}

export function sessionId(event: H3Event) {
  if (event.context.sessionId) {
    return event.context.sessionId
  }

  let id = getCookie(event, SESS_COOKIE) || ''

  if (!id) {
    id = randomStr(32, Charsets.ALPHA_NUM_LOWER)
    console.debug('Assigned session id', id)
    setCookie(event, SESS_COOKIE, id, {
      httpOnly: true,
      path:     '/',
      sameSite: 'lax',
      maxAge:   365 * 86400 * 10,
    })
  }

  event.context.sessionId = id

  return id
}

export async function sessionDir(event: H3Event) {
  const id = sessionId(event)
  const out = path.join(await dataDir(), SESSION_DIR, id)

  await mkdirp(out)

  return out
}

export async function threadDir(event: H3Event, id?: string) {
  let out = path.join(await sessionDir(event), THREAD_DIR)

  if (id) {
    out = path.join(out, id)
  }

  await mkdirp(out)

  return out
}

export async function workspaceDir(event: H3Event, threadId?: string) {
  const out = path.join(await threadDir(event, threadId), WORKSPACE_DIR)

  await mkdirp(out)

  return out
}
