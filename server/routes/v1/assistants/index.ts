import type { Assistant } from 'openai/resources/beta/assistants'
import { useApi } from '@/server/utils/api'

export default defineEventHandler(async (event) => {
  return apiList<Assistant>('/v1/rubra/x/assistants')
})
