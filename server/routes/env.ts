import process from 'node:process'

export default defineEventHandler(async (_event) => {
  const cfg = useRuntimeConfig()

  return {
    env: process.env,
    cfg,
  }
})
