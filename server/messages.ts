// import type { Run } from '@gptscript-ai/gptscript'
import type { H3Event } from 'h3'
import path from 'path'
import os from 'os'
import * as fs from 'node:fs/promises'
import { randomStr, Charsets } from '@/utils/string'
import { type Prefs, type Role, type Thread, type ThreadDirEntry, type ThreadFile, type ThreadMessage, type ThreadMeta } from '@/types'
import { defaultPrefs } from '@/config/prefs'
import cloneDeep from 'lodash/cloneDeep'
import { GPT_FILE, PREF_FILE, STATE_FILE, THREAD_META_FILE, cacheDir, sessionDir, threadDir, toolDir } from '~/server/utils/fs'
import { RunEventType, type RunOpts } from '@gptscript-ai/gptscript'
import dayjs from 'dayjs'

// const runs: Record<string, Run> = {}

export type Handler = Function
export type Level = Record<string, Handler>
export type Handlers = Record<string, Handler | Level>

function sanitize(str: string) {
  return str.replace(/[^a-z0-9\.]/ig, '')
}

const special = [THREAD_META_FILE, PREF_FILE, GPT_FILE, STATE_FILE, 'browsersettings.json']
function ignoreFile(name: string) {
  if ( name.startsWith('.') || special.includes(name) ) {
    return true
  }

  return false
}

async function getThread(event: H3Event, id: string): Promise<Thread> {
  id = sanitize(id)
  const p = await threadDir(event, id)
  const dir = await fs.readdir(p, {recursive: true, withFileTypes: true})
  const json = JSON.parse((await fs.readFile(path.join(p, THREAD_META_FILE))).toString()) as ThreadMeta
  const workspace: ThreadDirEntry[] = []

  for ( const d of dir ) {
    if ( !d.isFile() || ignoreFile(d.name) ) {
      continue
    }

    const parentDir = (d.path.length > p.length ? d.path.substring(p.length) : path.sep)
    const fullPath = path.join(parentDir,d.name)

    ensure(parentDir).push({
      type: 'file',
      path: fullPath,
      name: d.name,
    })
  }

  const out: Thread = {
    id,
    workspace,
    ...json,
  }

  return out

  function ensure(dir: string) {
    const parts = dir.split(path.sep).filter(x => !!x)
    let ptr = workspace

    for ( const p of parts ) {
      let neu = ptr.find(x => x.name === p)
      if ( !neu || neu.type !== 'dir' ) {
        neu = {
          type: 'dir',
          name: p,
          children: []
        }

        ptr.push(neu)
        ptr.sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity: 'base', numeric: true}))
      }

      ptr = neu.children
    }

    return ptr
  }
}

async function updateThread(event: H3Event, threadId: string, neu: Partial<ThreadMeta>) {
  threadId = sanitize(threadId)
  const p = path.join(await threadDir(event, threadId), THREAD_META_FILE)
  const json = JSON.parse((await fs.readFile(p)).toString()) as ThreadMeta

  if ( !json.history ) {
    json.history = []
  }

  Object.assign(json, neu)

  await fs.writeFile(p, JSON.stringify(json))

  event.context.socket.emit(`thread:update`, await getThread(event, threadId))
}

async function appendMessages(event: H3Event, threadId: string, messages: ThreadMessage[]) {
  threadId = sanitize(threadId)
  const p = path.join(await threadDir(event, threadId), THREAD_META_FILE)
  const json = JSON.parse((await fs.readFile(p)).toString()) as ThreadMeta

  if ( !json.history ) {
    json.history = []
  }

  json.history.push(...messages)

  return updateThread(event, threadId, { history: json.history })
}

async function readPrefs(event: H3Event): Promise<Prefs> {
  const p = path.join(await sessionDir(event), PREF_FILE)
  try {
    await fs.access(p)
  } catch (e) {
    const def = cloneDeep(defaultPrefs)

    if ( process.env.OPENAI_API_KEY && !def.openaiApiKey ) {
      def.openaiApiKey = process.env.OPENAI_API_KEY
    }

    if ( process.env.OPENAI_ORGANIZATION && !def.openaiOrganization ) {
      def.openaiOrganization = process.env.OPENAI_ORGANIZATION
    }

    await writePrefs(event, def)
  }

  return JSON.parse((await fs.readFile(p)).toString())
}

async function writePrefs(event: H3Event, val: Prefs) {
  const p = path.join(await sessionDir(event), PREF_FILE)

  await fs.writeFile(p, JSON.stringify(val, null, 2))

  return true
}

export default {
  prefs: {
    async get(event: H3Event) {
      return readPrefs(event)
    },

    async set(event: H3Event, k: keyof Prefs, v: any) {
      const prefs = await readPrefs(event);
      (prefs[k] as any) = v;
      await writePrefs(event, prefs)
      return prefs
    },

    async replace(event: H3Event, neu: Prefs) {
      return writePrefs(event, neu)
    },

    reset(event: H3Event) {
      return writePrefs(event, defaultPrefs)
    }
  },

  thread: {
    async list(event: H3Event) {
      const dir = await fs.readdir(await threadDir(event))
      const out: Thread[] = []
      for ( const d of dir ) {
        if ( ignoreFile(d) ) {
          continue
        }

        out.push(await getThread(event, d))
      }

      return out
    },

    get(event: H3Event, id: string) {
      return getThread(event, id)
    },

    async create(event: H3Event, promptFilename?: string) {
      const id = randomStr(8, Charsets.ALPHA_NUM_LOWER)
      const p = await threadDir(event, id)

      await fs.writeFile(path.join(p, "browsersettings.json"), JSON.stringify({
        "useDefaultSession": true,
      }))

      await fs.writeFile(path.join(p, THREAD_META_FILE), JSON.stringify({
        name: '',
        createdAt: dayjs().valueOf(),
      } as ThreadMeta))

      if ( promptFilename ) {
        const src = path.join(await toolDir(), path.normalize(promptFilename))
        await fs.copyFile(src, path.join(p, GPT_FILE))
      } else {
        await fs.writeFile(path.join(p, GPT_FILE), 'chat: true\n\n')
      }

      return getThread(event, id)
    },

    async remove(event: H3Event, id: string) {
      id = sanitize(id)
      const dir = path.join(await threadDir(event), id)

      await fs.rm(dir, {recursive: true})
    },

    async chat(event: H3Event, threadId: string, input: string) {
      const gpt = event.context.gpt
      const base = await threadDir(event, threadId)
      const toolPath = path.join(base, GPT_FILE)
      const statePath = path.join(base, STATE_FILE)
      let state = ''

      try {
        state = (await fs.readFile(statePath)).toString() || ''
      } catch (e) {}

      let opts: RunOpts = {
        input,
        workspace: base,
        chdir: base,
        cacheDir: await cacheDir()
      }

      if (state ) {
        opts.chatState = state
      }

      const run = gpt.run(toolPath, opts)

      appendMessages(event, threadId, [{
        time: dayjs().valueOf(),
        runId: run.id,
        role: 'user',
        content: input,
      }])

      run.on(RunEventType.Event, (d) => {
        console.debug(run.id, 'Event', d)
        event.context.socket.emit(`run:update:${run.id}`, run, d)
      })

      run.text().then(async (res: string) => {
        event.context.socket.emit(`run:finished:${run.id}`, run, res)

        appendMessages(event, threadId, [{
          time: dayjs().valueOf(),
          runId: run.id,
          role: 'assistant',
          content: res,
        }])

        if ( !state ) {
          try {
            const summary = await gpt.evaluate('Summarize the input into about 40 characters', {
              input: res
            }).text()

            updateThread(event, threadId, { name: summary })
          } catch(e) {
            console.error('Error summarizing initial chat', e)
          }
        }

      }).catch((e: any) => {
        event.context.socket.emit(`run:error:${run.id}`, run, e)
      }).finally(async () => {
        state = run.currentChatState() || ''
        console.info('chat4', state)

        if ( state ) {
          await fs.writeFile(statePath, state)
        }
      })

      return run
    }
  },

  tool: {
    async list(_event: H3Event) {
      const dir = await fs.readdir(await toolDir())
      return dir 
    },
  },

  gpt: {
    version(event: H3Event) {
      const gpt = event.context.gpt

      return gpt.version()
    },

    async listModels(event: H3Event) {
      const gpt = event.context.gpt

      return (await gpt.listModels()).split(/\r?\n/).filter((x) => !!x)
    },
  },
} as Handlers
