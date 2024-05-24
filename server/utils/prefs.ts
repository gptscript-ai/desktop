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

    if (process.env.OPENAI_API_KEY && !def.openaiApiKey) {
      def.openaiApiKey = process.env.OPENAI_API_KEY
    }

    if (process.env.OPENAI_ORGANIZATION && !def.openaiOrganization) {
      def.openaiOrganization = process.env.OPENAI_ORGANIZATION
    }

    await writePrefs(event, def)
  }

  return JSON.parse((await fs.readFile(p)).toString())
}

export async function writePrefs(event: H3Event, val: Prefs) {
  const p = path.join(await sessionDir(event), PREF_FILE)

  await fs.writeFile(p, JSON.stringify(val, null, 2))

  return true
}
