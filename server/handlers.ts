import path from 'node:path'
import * as fs from 'node:fs/promises'
import type { H3Event } from 'h3'
import { RunEventType, type RunOpts } from '@gptscript-ai/gptscript'
import dayjs from 'dayjs'
import { Charsets, randomStr } from '@/utils/string'
import { defaultPrefs } from '@/config/prefs'
import {
  GPT_FILE,
  STATE_FILE,
  THREAD_META_FILE,
  cacheDir,
  threadDir,
  toolDir,
  workspaceDir,
} from '~/server/utils/fs'
import type {
  Prefs,
  Thread,
  ThreadMeta,
} from '@/types'
import {
  appendMessages,
  getThread,
  ignoreFile,
  sanitize,
} from '@/server/utils/thread'
import { readPrefs, writePrefs } from '@/server/utils/prefs'

export type Handler = Function
export type Level = Record<string, Handler>
export type Handlers = Record<string, Handler | Level>

export default {
  prefs: {
    async get(event: H3Event) {
      return readPrefs(event)
    },

    async set(event: H3Event, k: keyof Prefs, v: any) {
      const prefs = await readPrefs(event);

      (prefs[k] as any) = v
      await writePrefs(event, prefs)

      return prefs
    },

    async replace(event: H3Event, neu: Prefs) {
      return writePrefs(event, neu)
    },

    reset(event: H3Event) {
      return writePrefs(event, defaultPrefs)
    },
  },

  thread: {
    async list(event: H3Event) {
      const dir = await fs.readdir(await threadDir(event))
      const out: Thread[] = []

      for (const d of dir) {
        if (ignoreFile(d)) {
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

      await fs.writeFile(path.join(await workspaceDir(event, id), 'browsersettings.json'), JSON.stringify({ useDefaultSession: true }))

      await fs.writeFile(path.join(p, THREAD_META_FILE), JSON.stringify({
        name:      '',
        createdAt: dayjs().valueOf(),
      } as ThreadMeta))

      if (promptFilename) {
        const src = path.join(await toolDir(), path.normalize(promptFilename))

        await fs.copyFile(src, path.join(p, GPT_FILE))
      } else {
        await fs.writeFile(path.join(p, GPT_FILE), `global tools: sys.write, sys.read, sys.ls
chat: true
`)
      }

      return getThread(event, id)
    },

    async remove(event: H3Event, id: string) {
      id = sanitize(id)
      const dir = path.join(await threadDir(event), id)

      await fs.rm(dir, { recursive: true })
    },

    async chat(event: H3Event, threadId: string, input: string) {
      const gpt = event.context.gpt
      const base = await threadDir(event, threadId)
      const workspace = await workspaceDir(event, threadId)
      const toolPath = path.join(base, GPT_FILE)
      const statePath = path.join(base, STATE_FILE)
      let state = ''

      try {
        state = (await fs.readFile(statePath)).toString() || ''
      } catch (e) {}

      const opts: RunOpts = {
        input,
        workspace,
        chdir:        workspace,
        cacheDir:     await cacheDir(),
        disableCache: false,
      }

      if (state) {
        opts.chatState = state
      }

      const run = gpt.run(toolPath, opts)

      appendMessages(event, threadId, [{
        time:    dayjs().valueOf(),
        role:    'user',
        content: input,
      }])

      run.on(RunEventType.Event, (d) => {
        const rootCall = run.calls?.find((x) => !x.parentID)

        if (rootCall?.output) {
          (run as any).output = rootCall.output
        }

        event.context.socket.emit(`run:update:${ run.id }`, run, d)
      })

      run.text().then(async (res: string) => {
        event.context.socket.emit(`run:finished:${ run.id }`, run, res)

        await appendMessages(event, threadId, [{
          time:    dayjs().valueOf(),
          runId:   run.id,
          role:    'assistant',
          content: res,
        }])
      }).catch((e: any) => {
        event.context.socket.emit(`run:error:${ run.id }`, run, e)
      }).finally(async () => {
        state = run.currentChatState() || ''

        if (state) {
          await fs.writeFile(statePath, state)
        }
      })

      return run
    },

    async updateTool(event: H3Event, threadId: string, src: string) {
      const p = path.join(await threadDir(event, threadId), GPT_FILE)

      await fs.writeFile(p, src)

      return getThread(event, threadId)
    },

    async getFile(event: H3Event, threadId: string, pth: string) {
      const p = path.join(await workspaceDir(event, threadId), path.normalize(pth))
      const res = (await fs.readFile(p)).toString()

      return res
    },
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
