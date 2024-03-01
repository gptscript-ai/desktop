import { useApi } from '@/server/utils/api'
import { FileObject } from 'openai/resources/files.mjs'

export default defineEventHandler(async (event) => {
  const api = useApi()
  const files: FileObject[] = []

  console.debug('Listing files')
  let res = await api.files.list()
  console.debug('Got', res?.data?.length || 0, 'files')

  files.push(...res.data)

  while ( res.hasNextPage() && res.body!.has_more ) {
    console.debug('Depaginating…')
    res = await res.getNextPage()
    console.debug('Got', res?.data?.length || 0, 'files')
    files.push(...res.data)
  }

  console.debug('Returning', files.length, 'files')

  return files
})

