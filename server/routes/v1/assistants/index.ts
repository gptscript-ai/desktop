import type { Assistant } from 'openai/resources/beta/assistants'
import { useApi } from '@/server/utils/api'

export default defineEventHandler(async (event) => {
  const api = useApi()
  const assistants: Assistant[] = []

  console.debug('Listing assistants')
  let res = await api.beta.assistants.list({ limit: 100 })
  console.debug('Got', res?.data?.length || 0, 'assistants')

  assistants.push(...res.data)

  while ( res.hasNextPage() && res.body!.has_more ) {
    console.debug('Depaginating…')
    res = await res.getNextPage()
    console.debug('Got', res?.data?.length || 0, 'assistants')
    assistants.push(...res.data)
  }

  console.debug('Returning', assistants.length, 'assistants')
  return assistants
})
