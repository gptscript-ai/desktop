import { useContext } from '@/stores/context'

export default defineNuxtRouteMiddleware(async (to/* , from */) => {
  const ctx = useContext()
  await ctx.setupMgmt()

  return true
})
