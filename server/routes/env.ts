export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()

  return {
    env: process.env,
    cfg,
  }
})
