import type { Assistant } from 'openai/resources/beta/assistants'

export default defineEventHandler(async (_event) => {
  return apiList<Assistant>('/v1/rubra/assistants')
})
