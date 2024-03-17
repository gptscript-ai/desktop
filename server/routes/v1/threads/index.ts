import type { Thread } from 'openai/resources/beta/threads'
import { apiList} from '@/server/utils/api'

export default defineEventHandler(async (event) => {
  const threads = await apiList<Thread>('/v1/rubra/x/threads')

  return threads
})
