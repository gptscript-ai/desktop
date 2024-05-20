// import type { Run } from '@gptscript-ai/gptscript'
import type { H3Event } from 'h3'
import path from 'path'
import os from 'os'
import * as fs from 'node:fs/promises'
import { randomStr, Charsets } from '@/utils/string'
import type { Settings, Thread, ThreadFile } from '@/types'

// const runs: Record<string, Run> = {}

export type Handler = Function
export type Level = Record<string, Handler>
export type Handlers = Record<string, Handler | Level>

async function dataDir() {
  let out = 'GPTStudio'
  if ( process.env.DATA_DIR ) {
    out = process.env.DATA_DIR
  } else {
    out = path.join(os.homedir(),'Documents',out)
  }

  try {
    await fs.access(out, fs.constants.F_OK)
  } catch (e) {
    console.info('Making directory', out)
    await fs.mkdir(out)
  }

  return out
}

function sanitize(id: string) {
  return id.replace(/[^a-z0-9]/g, '')
}

function ignoreFile(name: string) {
  if ( name.startsWith('.') || name === 'thread.json' || name === 'settings.json' ) {
    return true
  }

  return false
}

async function getThread(id: string): Promise<Thread> {
  id = sanitize(id)
  const p = path.join(await dataDir(), id)
  const dir = await fs.readdir(p, {recursive: true, withFileTypes: true})
  const files: ThreadFile[] = []

  for ( const d of dir ) {
    if ( ignoreFile(d.name) ) {
      continue
    }

    files.push({
      name: d.name
    })
  }

  const out = {
    id,
    name: id,
    files,
  }

  return out
}

async function readSettings(): Promise<Settings> {
  const p = path.join(await dataDir(), 'settings.json')
  try {
    await fs.access(p)
  } catch (e) {
    await writeSettings({
      openaiApiKey: '',
      openaiOrganization: '',
    })
  }

  return JSON.parse((await fs.readFile(p)).toString())
}

async function writeSettings(val: Settings) {
  const p = path.join(await dataDir(), 'settings.json')

  await fs.writeFile(p, JSON.stringify(val, null, 2))

  return true
}

export default {
  settings: {
    async get(_event: H3Event) {
      return readSettings()
    },

    async set(_event: H3Event, k: keyof Settings, v: any) {
      const settings = await readSettings()
      settings[k] = v
      await writeSettings(settings)
      return settings
    },

    async replace(_event: H3Event, neu: Settings) {
      return writeSettings(neu)
    }
  },

  thread: {
    async list(_event: H3Event) {
      const dir = await fs.readdir(await dataDir())
      const out: Thread[] = []
      for ( const d of dir ) {
        if ( ignoreFile(d) ) {
          continue
        }

        out.push(await getThread(d))
      }

      return out
    },

    get(_event: H3Event, id: string) {
      return getThread(id)
    },

    async create(_event: H3Event) {
      const id = randomStr(8, Charsets.ALPHA_NUM_LOWER)
      const p = path.join(await dataDir(), id)
      await fs.mkdir(p)

      return getThread(id)
    },

    async delete(_event: H3Event, id: string) {
      id = sanitize(id)
      const dir = path.join(await dataDir(), id)

      await fs.rm(dir, {recursive: true})
    }
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

    // async run(
  },
} as Handlers
