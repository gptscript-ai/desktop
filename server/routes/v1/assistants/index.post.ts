import { useApi } from '@/server/utils/api'
import type { AssistantCreateParams } from 'openai/resources/beta/assistants/assistants'

export default defineEventHandler(async (event) => {
  const api = useApi()
  const json = await readBody(event) as AssistantCreateParams

  json.tools = (json.tools || []).map(x => { return {type: x} }) as any

  const assistant = await api.beta.assistants.create(json)

  return assistant
})
