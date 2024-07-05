#!/usr/bin/env node

import process from 'node:process'
import fs from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import * as path from 'node:path'
import fetch from 'node-fetch'

const files = {
  'gptscript-universal-apple-darwin':     'https://get.gptscript.ai/releases/mac_darwin_all/gptscript',
  'gptscript-x86_64-pc-windows-msvc.exe': 'https://get.gptscript.ai/releases/default_windows_amd64_v1/gptscript.exe',
  'gptscript-x86_64-unknown-linux-gnu':   'https://get.gptscript.ai/releases/default_linux_amd64_v1/gptscript',

  'clicky-serves-universal-apple-darwin':     'https://get-clicky-serves.gptscript.ai/releases/mac_darwin_all/clicky-serves',
  'clicky-serves-x86_64-pc-windows-msvc.exe': 'https://get-clicky-serves.gptscript.ai/releases/default_windows_amd64_v1/clicky-serves.exe',
  'clicky-serves-x86_64-unknown-linux-gnu':   'https://get-clicky-serves.gptscript.ai/releases/default_linux_amd64_v1/clicky-serves',
}

const destinationPath = path.join(process.cwd(), 'binaries')

main().then(() => {
  console.info('Download Completed')
  process.exit(0)
}).catch((e) => {
  console.error('Error downloading:', e)
  process.exit(0)
})

async function main() {
  await fs.mkdir(destinationPath, { recursive: true })

  const promises = []

  for (const k in files) {
    const tgt = path.join(destinationPath, k)

    promises.push(downloadBinary(files[k], tgt))
  }

  await Promise.all(promises)

  promises.length = 0

  for (const k in files) {
    const tgt = path.join(destinationPath, k)

    promises.push(fs.chmod(tgt, 0o755))
  }

  await Promise.all(promises)
}

async function downloadBinary(url, outputPath) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download ${ url }: ${ response.statusText }`)
  }

  return new Promise((resolve, reject) => {
    const fileStream = createWriteStream(outputPath)

    response.body.pipe(fileStream)

    response.body.on('error', (err) => {
      reject(err)
    })

    fileStream.on('finish', () => {
      resolve()
    })
  })
}
