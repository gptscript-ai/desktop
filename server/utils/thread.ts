import path from 'node:path'
import * as fs from 'node:fs/promises'
import type { H3Event } from 'h3'
import dayjs from 'dayjs'
import type {  Thread, ThreadDirEntry, ThreadMessage, ThreadMeta } from '@/types'
import {  THREAD_HISTORY_FILE, THREAD_META_FILE,  threadDir,  workspaceDir } from '~/server/utils/fs'

export function sanitize(str: string) {
  return str.replace(/[^a-z0-9.]/gi, '')
}

const special = ['browsersettings.json']

export function ignoreFile(name: string) {
  if (name.startsWith('.') || special.includes(name)) {
    return true
  }

  return false
}

export async function getThread(event: H3Event, id: string): Promise<Thread> {
  id = sanitize(id)
  const workspacePath = await workspaceDir(event, id)
  const threadPath = await threadDir(event, id)
  const toolPath = path.join(threadPath, GPT_FILE)
  const metaPath = path.join(threadPath, THREAD_META_FILE)
  const historyPath = path.join(threadPath, THREAD_HISTORY_FILE)

  const dir = await fs.readdir(workspacePath, { recursive: true, withFileTypes: true })
  let toolSrc = ''

  try {
    toolSrc = (await fs.readFile(toolPath)).toString()
  } catch (e)  {
    console.error('Error reading tool', toolPath, e)
  }

  let json: ThreadMeta

  try {
    json = JSON.parse((await fs.readFile(metaPath)).toString()) as ThreadMeta
  } catch (e) {
    json = {
      name:      '',
      history:   [],
      createdAt: dayjs().valueOf(),
    }
    console.error('Error parsing', metaPath, e)
  }

  try {
    const history = JSON.parse((await fs.readFile(historyPath)).toString()) as ThreadMessage[]

    json.history = history
  } catch (e) {
  }

  const workspace: ThreadDirEntry[] = []

  for (const d of dir) {
    if (!d.isFile() || ignoreFile(d.name)) {
      continue
    }

    const parentDir = (d.path.length > workspacePath.length ? d.path.substring(workspacePath.length) : path.sep)
    const fullPath = path.join(parentDir, d.name)

    ensure(parentDir).push({
      type: 'file',
      path: fullPath,
      name: d.name,
    })
  }

  const out: Thread = {
    id,
    workspace,
    tool: toolSrc,
    ...json,
  }

  return out

  function ensure(dir: string) {
    const parts = dir.split(path.sep).filter((x) => !!x)
    let ptr = workspace

    for (const p of parts) {
      let neu = ptr.find((x) => x.name === p)

      if (!neu || neu.type !== 'dir') {
        neu = {
          type:     'dir',
          name:     p,
          children: [],
        }

        ptr.push(neu)
        ptr.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }))
      }

      ptr = neu.children
    }

    return ptr
  }
}

export async function updateThread(event: H3Event, threadId: string, neu?: Partial<ThreadMeta>) {
  threadId = sanitize(threadId)

  if (neu) {
    const p = path.join(await threadDir(event, threadId), THREAD_META_FILE)
    const json = JSON.parse((await fs.readFile(p)).toString()) as ThreadMeta

    if (!json.history) {
      json.history = []
    }

    Object.assign(json, neu)

    await fs.writeFile(p, JSON.stringify(json))
  }

  event.context.socket.emit(`thread:update`, await getThread(event, threadId))
}

export async function appendMessages(event: H3Event, threadId: string, messages: ThreadMessage[]) {
  threadId = sanitize(threadId)

  const p = path.join(await threadDir(event, threadId), THREAD_HISTORY_FILE)
  let history: ThreadMessage[] = []

  try {
    history = (JSON.parse((await fs.readFile(p)).toString()) || []) as ThreadMessage[]
  } catch (e) {
  }

  history.push(...messages)

  const assistantMsg = messages.find((x) => x.role === 'assistant')?.content

  if (assistantMsg) {
    await renameThread(event, threadId, assistantMsg)
  }

  await fs.writeFile(p, JSON.stringify(history))

  event.context.socket.emit(`thread:update`, await getThread(event, threadId))
}

export async function renameThread(event: H3Event, threadId: string, message: string) {
  try {
    const gpt = event.context.gpt
    const summary = await gpt.evaluate('Summarize the input into about 40 characters.  Don\'t add a period at the end. Dont start with the word \'User\'.  Return plain text without any Markdown formatting.', { input: message }).text()

    updateThread(event, threadId, { name: summary })
  } catch (e) {
    console.error('Error summarizing chat', e)
  }
}
