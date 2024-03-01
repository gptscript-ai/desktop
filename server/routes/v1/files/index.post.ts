import fs from 'node:fs/promises'
import path from 'node:path'
import { FileLike, Uploadable } from 'openai/uploads.mjs'

interface FileInput {
  name: string
  value: string
}

export default defineEventHandler(async (event) => {
  const api = useApi()
  const json = await readBody(event) as FileInput

  var data = json.value.split(',')[1]
  var bytes = Buffer.from(data, "base64")

  const blob = new Blob([bytes]) as any as FileLike;
  (blob as any).name = json.name;
  (blob as any).lastModified = Math.round((new Date().getTime())/1000)

  const res = await api.files.create({
    purpose: 'assistants',
    file: blob,
    //file.createReadStream()
  })

  try {
    await file.close()
    await fs.rm(pth)
    await fs.rmdir(dir)
  } catch (e) {
  }

  return res
})
