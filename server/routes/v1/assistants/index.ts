import { useApi } from '@/server/utils/api'
import type { Assistant } from 'openai/resources/beta/assistants'

export default defineEventHandler(async (event) => {
  const api = useApi()
  let assistants: Assistant[] = []

  let res = await api.beta.assistants.list({limit: 100})
  assistants.push(...res.data)

  while ( res.hasNextPage() ) {
    res = await res.getNextPage()
    assistants.push(...res.data)
  }

  return assistants
})
