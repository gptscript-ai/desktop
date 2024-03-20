import type { Model } from 'openai/resources/models'
import { useApi } from '@/server/utils/api'

export default defineEventHandler(async (_event) => {
  const api = useApi()
  const models: Model[] = []

  console.debug('Listing models')
  let res = await api.models.list()

  console.debug('Got', res?.data?.length || 0, 'models')

  models.push(...res.data)

  while (res.hasNextPage() && res.body!.has_more) {
    console.debug('Depaginating…')
    res = await res.getNextPage()
    console.debug('Got', res?.data?.length || 0, 'models')
    models.push(...res.data)
  }

  console.debug('Returning', models.length, 'models')

  return models
})
