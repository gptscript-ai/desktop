import path from 'node:path'
import * as fs from 'node:fs/promises'
import type { H3Event } from 'h3'
import cloneDeep from 'lodash/cloneDeep'
import { defaultPrefs } from '@/config/prefs'
import {
  PREF_FILE,
  sessionDir,
} from '@/server/utils/fs'
import type { Prefs } from '@/types'

export async function readPrefs(event: H3Event): Promise<Prefs> {
  const p = path.join(await sessionDir(event), PREF_FILE)

  try {
    await fs.access(p)
  } catch (e) {
    const def = cloneDeep(defaultPrefs)

    await writePrefs(event, def)
  }

  const out = JSON.parse((await fs.readFile(p)).toString())

  if (process.env.OPENAI_API_KEY && !out.openaiApiKey) {
    out.openaiApiKey = process.env.OPENAI_API_KEY
  }

  if (process.env.OPENAI_ORGANIZATION && !out.openaiOrganization) {
    out.openaiOrganization = process.env.OPENAI_ORGANIZATION
  }

  return out
}

export async function writePrefs(event: H3Event, val: Prefs) {
  const p = path.join(await sessionDir(event), PREF_FILE)

  const json = JSON.parse(JSON.stringify(val))

  if (process.env.OPENAI_API_KEY && json.openaiApiKey === process.env.OPENAI_API_KEY) {
    delete json.openaiApiKey
  }

  if (process.env.OPENAI_ORGANIZATION && json.openaiOrganization === process.env.OPENAI_ORGANIZATION) {
    delete json.openaiOrganization
  }

  await fs.writeFile(p, JSON.stringify(json, null, 2))

  return true
}
