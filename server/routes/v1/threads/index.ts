import type { Thread } from 'openai/resources/beta/threads'
import { apiList } from '@/server/utils/api'

export default defineEventHandler(async (_event) => {
  console.log('1')
  const threads = await apiList<Thread>('/v1/rubra/x/threads')
  console.log('2', threads)

  return threads
})
