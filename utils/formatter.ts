import dayjs from 'dayjs'
import type { Assistant, Thread } from 'openai/resources/beta/index.mjs'

export function threadName(t: Thread, a?: Assistant) {
  const label = dayjs(t.created_at * 1000).local().format('h:mma').replace(/m$/, '')

  if (a) {
    return `${ a.name } ${ label }`
  } else {
    return `(${ t.id.replace(/^thread_/, '').substring(0, 4) }) ${ label }`
  }
}
