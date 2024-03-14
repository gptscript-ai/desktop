import { ToolObject } from '@/config/types'
import { apiFetch } from '~/server/utils/api'

export default defineEventHandler(async (event) => {
  const tools: ToolObject[] = []

  console.debug('Listing tools')
  let res = await apiFetch('/v1/rubra/x/tools')
  console.debug('Res', res)
  console.debug('Got', res?.data?.length || 0, 'tools')

  tools.push(...res.data)

  console.debug('Returning', tools.length, 'tools')

  return tools
})

